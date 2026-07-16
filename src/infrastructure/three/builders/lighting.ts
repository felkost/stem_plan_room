/**
 * Освітлення: небесна півсфера, «сонце» крізь західні вікна (з тінями),
 * стельові LED-панелі (RectAreaLight).
 */
import * as THREE from 'three';
import { RectAreaLightUniformsLib } from 'three/addons/lights/RectAreaLightUniformsLib.js';
import { CEILING_LIGHTS, ROOM } from '../../../domain/classroomLayout';
import { cm } from './common';

let rectAreaInitialized = false;

export function buildLighting(scene: THREE.Scene): { sun: THREE.DirectionalLight } {
  if (!rectAreaInitialized) {
    RectAreaLightUniformsLib.init();
    rectAreaInitialized = true;
  }

  const hemi = new THREE.HemisphereLight(0xdfeaff, 0x8f8574, 0.22);
  scene.add(hemi);

  // Сонце — із заходу-південного заходу, крізь вікна (положисто, щоб плями світла були довші)
  const sun = new THREE.DirectionalLight(0xfff2dc, 3.2);
  sun.position.set(-7, 5.2, 3.2);
  sun.target.position.set(cm((ROOM.minX + ROOM.maxX) / 2), 0, cm((ROOM.minY + ROOM.maxY) / 2));
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  sun.shadow.camera.near = 0.5;
  sun.shadow.camera.far = 30;
  sun.shadow.camera.left = -9;
  sun.shadow.camera.right = 9;
  sun.shadow.camera.top = 9;
  sun.shadow.camera.bottom = -9;
  sun.shadow.bias = -0.0004;
  sun.shadow.normalBias = 0.03;
  scene.add(sun);
  scene.add(sun.target);

  // Стельові LED-панелі
  const height = cm(ROOM.height);
  for (const l of CEILING_LIGHTS) {
    const rect = new THREE.RectAreaLight(0xffffff, 1.5, 0.6, 0.6);
    rect.position.set(cm(l.x), height - 0.03, cm(l.y));
    rect.lookAt(cm(l.x), 0, cm(l.y));
    scene.add(rect);
  }

  return { sun };
}
