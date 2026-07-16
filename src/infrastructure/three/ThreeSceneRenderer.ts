/**
 * Реалізація порту ISceneRenderer на three.js:
 * рендерер, камера, OrbitControls, цикл анімації, dollhouse-приховування стін,
 * плавні переходи між пресетами камери, захоплення кадру та відеопотоку.
 */
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import type { ISceneRenderer } from '../../application/ports';
import type { CameraPreset, QualityLevel } from '../../domain/entities';
import { CAMERA_PRESETS } from '../../domain/classroomLayout';
import { assembleClassroom, type AssembledScene } from './sceneAssembler';

const TWEEN_DURATION = 1.1; // с

export class ThreeSceneRenderer implements ISceneRenderer {
  private renderer: THREE.WebGLRenderer | null = null;
  private scene: THREE.Scene | null = null;
  private camera: THREE.PerspectiveCamera | null = null;
  private controls: OrbitControls | null = null;
  private assembled: AssembledScene | null = null;
  private clock = new THREE.Clock();
  private resizeObserver: ResizeObserver | null = null;
  private container: HTMLElement | null = null;
  private quality: QualityLevel = 'high';
  private userTakeoverListener: (() => void) | null = null;
  private tween: {
    fromPos: THREE.Vector3;
    toPos: THREE.Vector3;
    fromTarget: THREE.Vector3;
    toTarget: THREE.Vector3;
    t: number;
  } | null = null;

  mount(container: HTMLElement): void {
    if (this.renderer) return; // уже змонтовано
    this.container = container;

    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);
    this.renderer = renderer;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xbcd3e8);
    const pmrem = new THREE.PMREMGenerator(renderer);
    scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environmentIntensity = 0.3;
    this.scene = scene;

    const camera = new THREE.PerspectiveCamera(55, container.clientWidth / container.clientHeight, 0.1, 100);
    this.camera = camera;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.maxPolarAngle = Math.PI / 2 + 0.35;
    controls.minDistance = 0.8;
    controls.maxDistance = 18;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.7;
    // Керування мишею: ЛКМ — обертання, коліщатко — масштаб (до курсора), ПКМ — зсув
    controls.enableRotate = true;
    controls.enableZoom = true;
    controls.enablePan = true;
    controls.zoomToCursor = true;
    controls.mouseButtons = {
      LEFT: THREE.MOUSE.ROTATE,
      MIDDLE: THREE.MOUSE.DOLLY,
      RIGHT: THREE.MOUSE.PAN,
    };
    controls.touches = {
      ONE: THREE.TOUCH.ROTATE,
      TWO: THREE.TOUCH.DOLLY_PAN,
    };
    // Щойно користувач береться за керування — скасовуємо переліт камери
    // та вимикаємо автообертання, щоб воно не «виривало» сцену з рук
    controls.addEventListener('start', () => {
      this.tween = null;
      if (controls.autoRotate) {
        controls.autoRotate = false;
        this.userTakeoverListener?.();
      }
    });
    this.controls = controls;

    this.assembled = assembleClassroom(scene);

    const overview = CAMERA_PRESETS[0];
    camera.position.set(...overview.position);
    controls.target.set(...overview.target);
    controls.update();

    this.resizeObserver = new ResizeObserver(() => this.handleResize());
    this.resizeObserver.observe(container);

    this.clock.start();
    renderer.setAnimationLoop(() => this.frame());
  }

  private handleResize(): void {
    if (!this.renderer || !this.camera || !this.container) return;
    const w = this.container.clientWidth;
    const h = this.container.clientHeight;
    if (w === 0 || h === 0) return;
    const current = this.renderer.getSize(new THREE.Vector2());
    if (current.x === w && current.y === h) return;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
  }

  private frame(): void {
    if (!this.renderer || !this.scene || !this.camera || !this.controls || !this.assembled) return;
    // страхування від пропущених подій ResizeObserver (дешева перевірка щокадру)
    this.handleResize();
    const dt = Math.min(this.clock.getDelta(), 0.1);
    const t = this.clock.elapsedTime;

    // плавний переліт камери до пресета
    if (this.tween) {
      this.tween.t += dt / TWEEN_DURATION;
      const k = this.tween.t >= 1 ? 1 : 1 - Math.pow(1 - this.tween.t, 3); // easeOutCubic
      this.camera.position.lerpVectors(this.tween.fromPos, this.tween.toPos, k);
      this.controls.target.lerpVectors(this.tween.fromTarget, this.tween.toTarget, k);
      if (this.tween.t >= 1) this.tween = null;
    }

    this.controls.update();
    for (const update of this.assembled.updatables) update(dt, t);
    this.updateWallVisibility();
    this.renderer.render(this.scene, this.camera);
  }

  /** Dollhouse: ховаємо стіну/стелю, з боку якої стоїть камера. */
  private updateWallVisibility(): void {
    if (!this.camera || !this.assembled) return;
    const { walls, ceiling, bounds } = this.assembled.room;
    const p = this.camera.position;
    const margin = 0.15;
    walls.west.visible = p.x > bounds.minX - margin;
    walls.east.visible = p.x < bounds.maxX + margin;
    walls.north.visible = p.z > bounds.minZ - margin;
    walls.south.visible = p.z < bounds.maxZ + margin;
    ceiling.visible = p.y < bounds.height - 0.05;
  }

  applyPreset(preset: CameraPreset): void {
    if (!this.camera || !this.controls) return;
    this.tween = {
      fromPos: this.camera.position.clone(),
      toPos: new THREE.Vector3(...preset.position),
      fromTarget: this.controls.target.clone(),
      toTarget: new THREE.Vector3(...preset.target),
      t: 0,
    };
  }

  setAutoRotate(on: boolean): void {
    if (this.controls) this.controls.autoRotate = on;
  }

  setUserTakeoverListener(listener: (() => void) | null): void {
    this.userTakeoverListener = listener;
  }

  setQuality(quality: QualityLevel): void {
    this.quality = quality;
    if (!this.renderer || !this.scene) return;
    const high = quality === 'high';
    this.renderer.shadowMap.enabled = high;
    this.renderer.setPixelRatio(high ? Math.min(window.devicePixelRatio, 2) : 1);
    // three потребує оновлення матеріалів після перемикання тіней
    this.scene.traverse((obj) => {
      const mesh = obj as THREE.Mesh;
      if (mesh.isMesh) {
        const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
        for (const m of mats) m.needsUpdate = true;
      }
    });
  }

  captureFrame(): Promise<Blob> {
    return new Promise((resolve, reject) => {
      if (!this.renderer || !this.scene || !this.camera) {
        reject(new Error('Сцена ще не готова'));
        return;
      }
      // примусовий рендер безпосередньо перед читанням буфера
      this.renderer.render(this.scene, this.camera);
      const dataUrl = this.renderer.domElement.toDataURL('image/png');
      const byteString = atob(dataUrl.split(',')[1]);
      const bytes = new Uint8Array(byteString.length);
      for (let i = 0; i < byteString.length; i++) bytes[i] = byteString.charCodeAt(i);
      resolve(new Blob([bytes], { type: 'image/png' }));
    });
  }

  getCaptureStream(fps: number): MediaStream {
    if (!this.renderer) throw new Error('Сцена ще не готова');
    return this.renderer.domElement.captureStream(fps);
  }

  dispose(): void {
    this.resizeObserver?.disconnect();
    this.resizeObserver = null;
    if (this.renderer) {
      this.renderer.setAnimationLoop(null);
      this.renderer.domElement.remove();
      this.renderer.dispose();
      this.renderer = null;
    }
    this.scene = null;
    this.camera = null;
    this.controls = null;
    this.assembled = null;
    this.container = null;
  }

  get currentQuality(): QualityLevel {
    return this.quality;
  }
}
