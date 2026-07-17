/**
 * Робот LEGO Mindstorms NXT (tribot) — процедурна модель у стилі реальних
 * роботів кабінету: біло-сірий корпус, чорні кабелі до моторів і датчиків,
 * ультразвуковий датчик-«очі» та датчик лінії, спрямований у поверхню.
 * Фронт робота — локальний +z; колеса — у group.userData.wheels (для анімації).
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

  // Колеса (шина + ковпак обертаються разом — для анімації руху)
  const wheels: THREE.Group[] = [];
  for (const s of [-1, 1]) {
    const wheel = new THREE.Group();
    const tire = new THREE.Mesh(new THREE.CylinderGeometry(wheelRadius, wheelRadius, 0.026, 22), tireMat);
    tire.geometry.rotateZ(Math.PI / 2);
    wheel.add(tire);
    const hubCap = new THREE.Mesh(new THREE.CylinderGeometry(wheelRadius * 0.5, wheelRadius * 0.5, 0.028, 16), wheelHubMat);
    hubCap.geometry.rotateZ(Math.PI / 2);
    wheel.add(hubCap);
    // «шпиці» маточини, щоб обертання було помітним
    for (let i = 0; i < 3; i++) {
      const spoke = box(0.03, wheelRadius * 1.3, 0.006, wheelHubMat, 0, 0, 0);
      spoke.rotation.x = (i / 3) * Math.PI;
      spoke.position.x = s * 0.0146;
      wheel.add(spoke);
    }
    wheel.position.set(s * (width / 2 + 0.002), wheelRadius, 0.03);
    g.add(wheel);
    wheels.push(wheel);
  }
  g.userData.wheels = wheels;

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

  // Датчик лінії — дивиться у поверхню перед колесами
  const lightSensor = box(0.024, 0.03, 0.024, sensorMat, 0.038, 0.028, 0.085);
  g.add(lightSensor);
  const lightLens = cylinder(0.008, 0.006, standardMat(0xc03a2b, 0.35), 0.038, 0.011, 0.085, 12);
  g.add(lightLens);

  // Чорні кабелі RJ12 від блока до моторів і датчиків (як у реальних роботів)
  const cableMat = standardMat(0x232323, 0.75);
  const addCable = (
    from: [number, number, number],
    mid: [number, number, number],
    to: [number, number, number],
  ) => {
    const curve = new THREE.QuadraticBezierCurve3(
      new THREE.Vector3(...from),
      new THREE.Vector3(...mid),
      new THREE.Vector3(...to),
    );
    g.add(new THREE.Mesh(new THREE.TubeGeometry(curve, 14, 0.0035, 6), cableMat));
  };
  // до моторів (петлі з боків блока)
  addCable([-0.03, 0.1, -0.05], [-0.075, 0.085, -0.03], [-0.055, 0.05, 0.0]);
  addCable([0.03, 0.1, -0.05], [0.075, 0.085, -0.03], [0.055, 0.05, 0.0]);
  // до ультразвукового датчика та датчика лінії
  addCable([0.012, 0.115, 0.04], [0.03, 0.1, 0.09], [0.008, 0.06, 0.098]);
  addCable([-0.012, 0.115, 0.04], [-0.02, 0.09, 0.1], [0.034, 0.045, 0.085]);

  return g;
}
