/**
 * Тренувальний стіл для роботів (оформлення як у реальному кабінеті):
 * білий стіл із піднятими бортиками на хромованих ніжках, на поверхні —
 * чорна замкнена лінія. Один робот NXT їде по лінії (той самий сплайн,
 * що надруковано на поверхні), ще два — запарковані в кутах поля.
 * Модель центрована в (0,0), низ на y=0; розміри — з TRAINING_TABLE.
 */
import * as THREE from 'three';
import { TRAINING_TABLE } from '../../../domain/classroomLayout';
import { FIELD_TRACK, NXT_BASE } from '../../../domain/robotSpecs';
import { box, cm, cylinder, standardMat } from '../builders/common';
import { FIELD_TRACK_SCALE, makeFieldSurfaceTexture } from '../builders/textures';
import { buildNxtRobot } from './nxt';

export interface TrainingFieldBuild {
  group: THREE.Group;
  update: (dt: number, t: number) => void;
}

const tableMat = standardMat(0xf4f3f0, 0.6);
const borderMat = standardMat(0xfbfbf9, 0.55);
const legMat = standardMat(0xc9ccd1, 0.3, 0.85);

export function buildTrainingField(): TrainingFieldBuild {
  const group = new THREE.Group();
  const w = cm(TRAINING_TABLE.width);
  const d = cm(TRAINING_TABLE.depth);
  const h = cm(TRAINING_TABLE.height);
  const topT = 0.04;   // товщина стільниці
  const bT = 0.045;    // товщина бортика
  const bH = 0.085;    // висота бортика над поверхнею

  // Стільниця
  group.add(box(w, topT, d, tableMat, 0, h - topT / 2, 0));
  // Бортики по периметру (як у столів для змагань)
  group.add(box(w, bH, bT, borderMat, 0, h + bH / 2, d / 2 - bT / 2));
  group.add(box(w, bH, bT, borderMat, 0, h + bH / 2, -d / 2 + bT / 2));
  group.add(box(bT, bH, d - 2 * bT, borderMat, w / 2 - bT / 2, h + bH / 2, 0));
  group.add(box(bT, bH, d - 2 * bT, borderMat, -w / 2 + bT / 2, h + bH / 2, 0));
  // Хромовані ніжки з поперечками
  const legH = h - topT;
  for (const sx of [-1, 1]) {
    for (const sz of [-1, 1]) {
      group.add(cylinder(0.022, legH, legMat, sx * (w / 2 - 0.08), legH / 2, sz * (d / 2 - 0.08), 14));
    }
    const brace = box(0.03, 0.03, d - 0.16, legMat, sx * (w / 2 - 0.08), 0.12, 0);
    group.add(brace);
  }

  // Поверхня поля з надрукованою лінією
  const innerW = w - 2 * bT;
  const innerD = d - 2 * bT;
  const surface = new THREE.Mesh(
    new THREE.PlaneGeometry(innerW, innerD),
    new THREE.MeshStandardMaterial({ map: makeFieldSurfaceTexture(), roughness: 0.65 }),
  );
  surface.rotation.x = -Math.PI / 2;
  surface.position.y = h + 0.0015;
  surface.receiveShadow = true;
  surface.userData.noShadowCast = true;
  group.add(surface);

  // Сплайн лінії у метрах (та сама геометрія, що на текстурі)
  const halfX = (innerW / 2) * FIELD_TRACK_SCALE;
  const halfZ = (innerD / 2) * FIELD_TRACK_SCALE;
  const curve = new THREE.CatmullRomCurve3(
    FIELD_TRACK.map(([x, z]) => new THREE.Vector3(x * halfX, 0, z * halfZ)),
    true,
    'catmullrom',
    0.5,
  );
  const trackLength = curve.getLength();

  // Робот, що їде по лінії (трохи зменшений під розмір поля)
  const ROBOT_SCALE = 0.85;
  const rider = buildNxtRobot();
  rider.scale.setScalar(ROBOT_SCALE);
  group.add(rider);

  // Запарковані роботи в кутах поля (поза лінією)
  const parked1 = buildNxtRobot();
  parked1.scale.setScalar(0.8);
  parked1.position.set(0.3, h + 0.002, -0.31);
  parked1.rotation.y = 2.6;
  group.add(parked1);
  const parked2 = buildNxtRobot();
  parked2.scale.setScalar(0.8);
  parked2.position.set(-0.3, h + 0.002, -0.3);
  parked2.rotation.y = -2.3;
  group.add(parked2);

  let progress = 0;
  let prevAngle = 0;

  const update = (dt: number, _t: number) => {
    progress = (progress + (dt * NXT_BASE.speed) / trackLength) % 1;
    const pos = curve.getPointAt(progress);
    const tangent = curve.getTangentAt(progress);
    rider.position.set(pos.x, h + 0.002, pos.z);
    const targetAngle = Math.atan2(tangent.x, tangent.z);
    // плавне згладжування кута (без стрибка через ±π)
    let delta = targetAngle - prevAngle;
    if (delta > Math.PI) delta -= Math.PI * 2;
    if (delta < -Math.PI) delta += Math.PI * 2;
    prevAngle += delta * Math.min(1, dt * 8);
    rider.rotation.y = prevAngle;
    // обертання коліс
    const wheels = (rider.userData.wheels ?? []) as THREE.Object3D[];
    const spin = (dt * NXT_BASE.speed) / (NXT_BASE.wheelRadius * ROBOT_SCALE);
    for (const wheel of wheels) wheel.rotation.x += spin;
  };

  return { group, update };
}
