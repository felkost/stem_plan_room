/**
 * Їздовий робот LEGO SPIKE Prime (driving base) — процедурна модель.
 * Фронт робота — локальний +z.
 */
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { SPIKE_BASE, SPIKE_COLORS } from '../../../domain/robotSpecs';
import { box, cylinder, standardMat } from '../builders/common';
import { makeLedMatrix } from '../builders/textures';

export interface SpikeRobot {
  group: THREE.Group;
  wheels: THREE.Mesh[];
  /** Оновити LED-матрицю (анімація). */
  update: (t: number) => void;
}

const hubMat = standardMat(SPIKE_COLORS.hub, 0.45);
const hubFaceMat = standardMat(SPIKE_COLORS.hubFace, 0.35);
const motorMat = standardMat(SPIKE_COLORS.motor, 0.5);
const frameMat = standardMat(SPIKE_COLORS.frame, 0.6);
const tireMat = standardMat(SPIKE_COLORS.wheelTire, 0.9);
const wheelHubMat = standardMat(SPIKE_COLORS.wheelHub, 0.4);
const sensorMat = standardMat(SPIKE_COLORS.sensor, 0.5);
const cableMat = standardMat(SPIKE_COLORS.cable, 0.75);

function makeWheel(radius: number): THREE.Mesh {
  const tire = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, 0.024, 24), tireMat);
  tire.geometry.rotateZ(Math.PI / 2); // вісь колеса — локальна X
  const hubCap = new THREE.Mesh(new THREE.CylinderGeometry(radius * 0.55, radius * 0.55, 0.026, 18), wheelHubMat);
  hubCap.geometry.rotateZ(Math.PI / 2);
  tire.add(hubCap);
  return tire;
}

export function buildSpikeRobot(): SpikeRobot {
  const g = new THREE.Group();
  const { width, wheelRadius } = SPIKE_BASE;
  const clearance = 0.018; // просвіт шасі над підлогою

  // Рама-шасі зі світло-сірих балок
  const chassisY = clearance + 0.015;
  g.add(box(0.2, 0.03, 0.16, frameMat, 0, chassisY, 0));
  // шипи LEGO на рамі (інстансинг)
  const studGeo = new THREE.CylinderGeometry(0.0045, 0.0045, 0.0035, 10);
  const studs = new THREE.InstancedMesh(studGeo, frameMat, 9 * 7);
  const m = new THREE.Matrix4();
  let idx = 0;
  for (let i = 0; i < 9; i++) {
    for (let j = 0; j < 7; j++) {
      m.setPosition(-0.088 + i * 0.022, chassisY + 0.017, -0.066 + j * 0.022);
      studs.setMatrixAt(idx++, m);
    }
  }
  g.add(studs);

  // Хаб SPIKE Prime
  const hubY = chassisY + 0.015 + 0.0225;
  const hub = new THREE.Mesh(new RoundedBoxGeometry(0.112, 0.045, 0.08, 3, 0.007), hubMat);
  hub.position.set(0, hubY, -0.01);
  g.add(hub);
  const face = box(0.098, 0.006, 0.068, hubFaceMat, 0, hubY + 0.024, -0.01);
  g.add(face);
  // LED-матриця 5×5
  const led = makeLedMatrix();
  const ledMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(0.04, 0.04),
    new THREE.MeshStandardMaterial({
      map: led.texture,
      emissive: 0xffffff,
      emissiveMap: led.texture,
      emissiveIntensity: 0.85,
      roughness: 0.4,
    }),
  );
  ledMesh.rotation.x = -Math.PI / 2;
  ledMesh.position.set(0, hubY + 0.0275, -0.01);
  g.add(ledMesh);
  // центральна кнопка
  g.add(cylinder(0.007, 0.004, hubFaceMat, 0, hubY + 0.027, 0.022, 12));

  // Мотори по боках
  for (const s of [-1, 1]) {
    const motor = new THREE.Mesh(new RoundedBoxGeometry(0.052, 0.048, 0.075, 3, 0.008), motorMat);
    motor.position.set(s * (width / 2 - 0.045), clearance + 0.026, 0.02);
    g.add(motor);
    // кабель від хаба до мотора
    const curve = new THREE.QuadraticBezierCurve3(
      new THREE.Vector3(s * 0.05, hubY, -0.01),
      new THREE.Vector3(s * (width / 2 - 0.02), hubY + 0.01, 0.005),
      new THREE.Vector3(s * (width / 2 - 0.045), clearance + 0.045, 0.02),
    );
    g.add(new THREE.Mesh(new THREE.TubeGeometry(curve, 10, 0.0032, 6), cableMat));
  }

  // Колеса
  const wheels: THREE.Mesh[] = [];
  for (const s of [-1, 1]) {
    const wheel = makeWheel(wheelRadius);
    wheel.position.set(s * (width / 2 + 0.005), wheelRadius, 0.02);
    g.add(wheel);
    wheels.push(wheel);
  }
  // задня опорна кулька
  const casterBracket = box(0.03, 0.02, 0.03, frameMat, 0, clearance, -0.075);
  g.add(casterBracket);
  const caster = new THREE.Mesh(new THREE.SphereGeometry(0.014, 12, 10), standardMat(0xd9d9d9, 0.3, 0.2));
  caster.position.set(0, 0.014, -0.075);
  g.add(caster);

  // Датчик кольору (дивиться вниз перед роботом)
  const colorSensor = box(0.024, 0.03, 0.024, sensorMat, 0.035, clearance + 0.005, 0.095);
  g.add(colorSensor);
  const sensorGlow = new THREE.Mesh(
    new THREE.CylinderGeometry(0.009, 0.009, 0.004, 10),
    new THREE.MeshStandardMaterial({ color: 0x74f7ff, emissive: 0x74f7ff, emissiveIntensity: 1.4 }),
  );
  sensorGlow.position.set(0.035, clearance - 0.008, 0.095);
  g.add(sensorGlow);

  // Датчик відстані — «очі» попереду
  const eyesBase = box(0.062, 0.032, 0.02, sensorMat, -0.03, chassisY + 0.04, 0.088);
  g.add(eyesBase);
  for (const s of [-1, 1]) {
    const eye = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.008, 14), hubFaceMat);
    eye.geometry.rotateX(Math.PI / 2);
    eye.position.set(-0.03 + s * 0.017, chassisY + 0.04, 0.099);
    g.add(eye);
    const pupil = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.006, 0.01, 12), bezel());
    pupil.geometry.rotateX(Math.PI / 2);
    pupil.position.set(-0.03 + s * 0.017, chassisY + 0.04, 0.1);
    g.add(pupil);
  }

  return { group: g, wheels, update: led.update };
}

let bezelCache: THREE.MeshStandardMaterial | null = null;
function bezel(): THREE.MeshStandardMaterial {
  if (!bezelCache) bezelCache = standardMat(0x14161a, 0.4);
  return bezelCache;
}
