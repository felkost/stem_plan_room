/**
 * Робот LEGO Mindstorms NXT (tribot) — статична процедурна модель.
 * Фронт робота — локальний +z.
 */
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { NXT_BASE, NXT_COLORS } from '../../../domain/robotSpecs';
import { box, cylinder, standardMat } from '../builders/common';
import { makeNxtScreenTexture } from '../builders/textures';

const bodyMat = standardMat(NXT_COLORS.body, 0.5);
const faceMat = standardMat(NXT_COLORS.facePlate, 0.55);
const enterMat = standardMat(NXT_COLORS.enterButton, 0.5);
const arrowMat = standardMat(NXT_COLORS.arrowButtons, 0.55);
const motorMat = standardMat(NXT_COLORS.motor, 0.55);
const tireMat = standardMat(NXT_COLORS.wheelTire, 0.9);
const wheelHubMat = standardMat(NXT_COLORS.wheelHub, 0.4);
const sensorMat = standardMat(NXT_COLORS.sensor, 0.5);

export function buildNxtRobot(): THREE.Group {
  const g = new THREE.Group();
  const { width, wheelRadius } = NXT_BASE;

  // Мотори (нахилені, як у класичному tribot)
  for (const s of [-1, 1]) {
    const motor = new THREE.Mesh(new RoundedBoxGeometry(0.055, 0.05, 0.11, 3, 0.008), motorMat);
    motor.position.set(s * (width / 2 - 0.05), 0.045, 0.01);
    motor.rotation.x = -0.25;
    g.add(motor);
  }

  // Блок NXT зверху (лежить горизонтально, екраном догори-вперед)
  const brick = new THREE.Mesh(new RoundedBoxGeometry(0.072, 0.045, 0.112, 3, 0.006), bodyMat);
  brick.position.set(0, 0.105, -0.005);
  brick.rotation.x = -0.18;
  g.add(brick);
  const brickTop = new THREE.Group();
  brickTop.position.copy(brick.position);
  brickTop.rotation.copy(brick.rotation);
  g.add(brickTop);
  // сіра лицьова накладка
  brickTop.add(box(0.062, 0.004, 0.1, faceMat, 0, 0.024, 0));
  // екран
  const screen = new THREE.Mesh(
    new THREE.PlaneGeometry(0.048, 0.032),
    new THREE.MeshStandardMaterial({
      map: makeNxtScreenTexture(),
      emissive: 0xbfd8a8,
      emissiveIntensity: 0.35,
      roughness: 0.5,
    }),
  );
  screen.rotation.x = -Math.PI / 2;
  screen.position.set(0, 0.0265, 0.022);
  brickTop.add(screen);
  // помаранчева кнопка та стрілки
  const enterBtn = box(0.012, 0.004, 0.012, enterMat, 0, 0.0265, -0.012);
  brickTop.add(enterBtn);
  for (const s of [-1, 1]) {
    brickTop.add(box(0.01, 0.004, 0.01, arrowMat, s * 0.018, 0.0265, -0.012));
  }
  brickTop.add(box(0.01, 0.004, 0.008, arrowMat, 0, 0.0265, -0.032));

  // Колеса
  for (const s of [-1, 1]) {
    const tire = new THREE.Mesh(new THREE.CylinderGeometry(wheelRadius, wheelRadius, 0.026, 22), tireMat);
    tire.geometry.rotateZ(Math.PI / 2);
    tire.position.set(s * (width / 2 + 0.002), wheelRadius, 0.03);
    g.add(tire);
    const hubCap = new THREE.Mesh(new THREE.CylinderGeometry(wheelRadius * 0.5, wheelRadius * 0.5, 0.028, 16), wheelHubMat);
    hubCap.geometry.rotateZ(Math.PI / 2);
    hubCap.position.copy(tire.position);
    g.add(hubCap);
  }

  // Заднє опорне колесо
  g.add(box(0.024, 0.03, 0.024, faceMat, 0, 0.035, -0.095));
  const rearWheel = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.016, 0.012, 14), tireMat);
  rearWheel.geometry.rotateZ(Math.PI / 2);
  rearWheel.position.set(0, 0.016, -0.1);
  g.add(rearWheel);

  // Ультразвуковий датчик — «очі»
  const usBase = box(0.056, 0.028, 0.018, sensorMat, 0, 0.055, 0.1);
  g.add(usBase);
  for (const s of [-1, 1]) {
    const eye = cylinder(0.013, 0.014, sensorMat, s * 0.017, 0.055, 0.112, 14);
    eye.geometry.rotateX(Math.PI / 2);
    g.add(eye);
    const lens = cylinder(0.009, 0.004, standardMat(0x8c96a0, 0.25, 0.6), s * 0.017, 0.055, 0.12, 12);
    lens.geometry.rotateX(Math.PI / 2);
    g.add(lens);
  }

  return g;
}
