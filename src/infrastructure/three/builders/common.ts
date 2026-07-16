/**
 * Спільні хелпери інфраструктурного шару three.js.
 */
import * as THREE from 'three';
import type { PlacedItem } from '../../../domain/entities';

/** Сантиметри плану → метри світу. */
export const cm = (v: number): number => v / 100;

/**
 * Розмістити об'єкт за координатами плану Sweet Home 3D.
 * Вісь плану y → світова z; кут за годинниковою стрілкою → -rotation.y.
 * Об'єкт має бути змодельований із центром у (0,0) по x/z та низом на y=0.
 */
export function placeItem(obj: THREE.Object3D, item: PlacedItem, extraElevation = 0): void {
  obj.position.set(cm(item.x), cm(item.elevation ?? 0) + extraElevation, cm(item.y));
  obj.rotation.y = -(item.angle ?? 0);
}

/** Позначити всі меші групи як такі, що кидають/приймають тіні. */
export function enableShadows(obj: THREE.Object3D, cast = true, receive = true): void {
  obj.traverse((child) => {
    if ((child as THREE.Mesh).isMesh) {
      child.castShadow = cast;
      child.receiveShadow = receive;
    }
  });
}

/** Короткий конструктор box-меша. */
export function box(
  w: number,
  h: number,
  d: number,
  material: THREE.Material,
  x = 0,
  y = 0,
  z = 0,
): THREE.Mesh {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material);
  mesh.position.set(x, y, z);
  return mesh;
}

/** Короткий конструктор циліндра. */
export function cylinder(
  radius: number,
  height: number,
  material: THREE.Material,
  x = 0,
  y = 0,
  z = 0,
  radialSegments = 20,
): THREE.Mesh {
  const mesh = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, height, radialSegments), material);
  mesh.position.set(x, y, z);
  return mesh;
}

export function standardMat(color: number, roughness = 0.8, metalness = 0.0): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({ color, roughness, metalness });
}
