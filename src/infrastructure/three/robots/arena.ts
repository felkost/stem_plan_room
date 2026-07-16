/**
 * Арена робототехніки: килимок 2×2 м із трасою та анімований робот SPIKE,
 * що їде по замкнутому сплайну (та сама траса, що надрукована на килимку).
 */
import * as THREE from 'three';
import { ARENA } from '../../../domain/classroomLayout';
import { ARENA_TRACK, SPIKE_BASE } from '../../../domain/robotSpecs';
import { box, cm, standardMat } from '../builders/common';
import { makeArenaMatTexture } from '../builders/textures';
import { buildSpikeRobot } from './spike';

export interface ArenaBuild {
  group: THREE.Group;
  update: (dt: number, t: number) => void;
}

export function buildArena(): ArenaBuild {
  const group = new THREE.Group();
  const size = cm(ARENA.size);
  const half = size / 2;

  // Килимок
  const mat = new THREE.Mesh(
    new THREE.PlaneGeometry(size, size),
    new THREE.MeshStandardMaterial({ map: makeArenaMatTexture(), roughness: 0.85 }),
  );
  mat.rotation.x = -Math.PI / 2;
  mat.position.y = 0.006;
  mat.receiveShadow = true;
  group.add(mat);
  // тонкий гумовий кант
  const trim = standardMat(0x39424d, 0.9);
  group.add(box(size + 0.06, 0.012, 0.03, trim, 0, 0.006, half + 0.015));
  group.add(box(size + 0.06, 0.012, 0.03, trim, 0, 0.006, -half - 0.015));
  group.add(box(0.03, 0.012, size, trim, half + 0.015, 0.006, 0));
  group.add(box(0.03, 0.012, size, trim, -half - 0.015, 0.006, 0));

  // Перешкоди у центрі
  const cube1 = box(0.07, 0.07, 0.07, standardMat(0xd92f2f, 0.6), 0.25 * half, 0.045, -0.2 * half);
  const cube2 = box(0.07, 0.07, 0.07, standardMat(0x2f6bd9, 0.6), -0.25 * half, 0.045, 0.22 * half);
  const cyl = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.09, 16), standardMat(0xe8b90f, 0.6));
  cyl.position.set(0.2 * half, 0.055, 0.3 * half);
  group.add(cube1, cube2, cyl);

  // Робот і траса
  const robot = buildSpikeRobot();
  group.add(robot.group);
  const curve = new THREE.CatmullRomCurve3(
    ARENA_TRACK.map(([x, z]) => new THREE.Vector3(x * half, 0, z * half)),
    true,
    'catmullrom',
    0.5,
  );
  const trackLength = curve.getLength();
  let progress = 0;
  let prevAngle = 0;

  const update = (dt: number, t: number) => {
    progress = (progress + (dt * SPIKE_BASE.speed) / trackLength) % 1;
    const pos = curve.getPointAt(progress);
    const tangent = curve.getTangentAt(progress);
    robot.group.position.set(pos.x, 0.008, pos.z);
    const targetAngle = Math.atan2(tangent.x, tangent.z);
    // плавне згладжування кута (без стрибка через ±π)
    let delta = targetAngle - prevAngle;
    if (delta > Math.PI) delta -= Math.PI * 2;
    if (delta < -Math.PI) delta += Math.PI * 2;
    prevAngle += delta * Math.min(1, dt * 8);
    robot.group.rotation.y = prevAngle;
    // обертання коліс
    const spin = (dt * SPIKE_BASE.speed) / SPIKE_BASE.wheelRadius;
    for (const wheel of robot.wheels) wheel.rotation.x += spin;
    robot.update(t);
  };

  return { group, update };
}
