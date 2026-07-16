/**
 * Оболонка кімнати: підлога, стіни з вікнами та дверима, стеля з LED-панелями,
 * плінтуси, радіатори, постери, годинник.
 * Стіни згруповано за сторонами світу — рендерер ховає стіну, за якою стоїть камера.
 */
import * as THREE from 'three';
import { ROOM, SOUTH_DOOR, WEST_WINDOWS, CEILING_LIGHTS } from '../../../domain/classroomLayout';
import type { WallOpening } from '../../../domain/entities';
import { box, cm, standardMat } from './common';
import { makeClockTexture, makeFloorTexture, makePosterTexture, makeWoodTexture } from './textures';

export interface RoomBuild {
  group: THREE.Group;
  /** Групи стін за сторонами — для приховування з боку камери. */
  walls: { west: THREE.Group; east: THREE.Group; north: THREE.Group; south: THREE.Group };
  ceiling: THREE.Group;
  bounds: { minX: number; maxX: number; minZ: number; maxZ: number; height: number };
}

const wallMat = standardMat(0xf1ede4, 0.95);
const frontWallMat = standardMat(0xdde7ee, 0.95);
const ceilingMat = standardMat(0xf7f7f5, 0.9);
const frameMat = standardMat(0xfafafa, 0.5);
const glassMat = new THREE.MeshPhysicalMaterial({
  color: 0xcfe4f5,
  roughness: 0.06,
  metalness: 0,
  transparent: true,
  opacity: 0.22,
  side: THREE.DoubleSide,
});
const sillMat = standardMat(0xffffff, 0.6);
const radiatorMat = standardMat(0xe9e9e6, 0.55, 0.15);
const baseboardMat = standardMat(0x8a6a4b, 0.7);
const doorMat = new THREE.MeshStandardMaterial({ map: makeWoodTexture('#8a5a2e'), roughness: 0.65 });
const handleMat = standardMat(0xc9c9c9, 0.3, 0.9);

/**
 * Стіна вздовж локальної осі X довжиною length із отворами.
 * Повертає групу з центром стіни в (0,0) по X та низом на y=0.
 * openings: центри отворів у локальних координатах від лівого краю (0..length), м.
 */
function wallWithOpenings(
  length: number,
  height: number,
  thickness: number,
  material: THREE.Material,
  openings: Array<{ center: number; width: number; sill: number; height: number }>,
): THREE.Group {
  const g = new THREE.Group();
  const sorted = [...openings].sort((a, b) => a.center - b.center);
  let cursor = 0;
  const addSegment = (from: number, to: number) => {
    const w = to - from;
    if (w <= 0.001) return;
    g.add(box(w, height, thickness, material, from + w / 2 - length / 2, height / 2, 0));
  };
  for (const o of sorted) {
    const left = o.center - o.width / 2;
    const right = o.center + o.width / 2;
    addSegment(cursor, left);
    // під отвором
    if (o.sill > 0.001) {
      g.add(box(o.width, o.sill, thickness, material, o.center - length / 2, o.sill / 2, 0));
    }
    // над отвором
    const top = o.sill + o.height;
    if (top < height - 0.001) {
      g.add(box(o.width, height - top, thickness, material, o.center - length / 2, top + (height - top) / 2, 0));
    }
    cursor = right;
  }
  addSegment(cursor, length);
  return g;
}

/** Вікно з рамою, склом та підвіконням (у локальних координатах стіни). */
function windowAssembly(opening: { center: number; width: number; sill: number; height: number }, length: number, thickness: number): THREE.Group {
  const g = new THREE.Group();
  const x = opening.center - length / 2;
  const yMid = opening.sill + opening.height / 2;
  const fw = 0.06; // ширина профілю рами
  const w = opening.width;
  const h = opening.height;
  // периметр рами
  g.add(box(w, fw, 0.07, frameMat, x, opening.sill + fw / 2, 0));
  g.add(box(w, fw, 0.07, frameMat, x, opening.sill + h - fw / 2, 0));
  g.add(box(fw, h, 0.07, frameMat, x - w / 2 + fw / 2, yMid, 0));
  g.add(box(fw, h, 0.07, frameMat, x + w / 2 - fw / 2, yMid, 0));
  // імпости: вертикальний і горизонтальний
  g.add(box(fw * 0.8, h, 0.06, frameMat, x, yMid, 0));
  g.add(box(w, fw * 0.8, 0.06, frameMat, x, opening.sill + h * 0.62, 0));
  // скло (не блокує сонце — інакше тіні «зачинили» б вікна)
  const glass = new THREE.Mesh(new THREE.PlaneGeometry(w - fw, h - fw), glassMat);
  glass.position.set(x, yMid, 0);
  glass.userData.noShadowCast = true;
  g.add(glass);
  // підвіконня (виступає всередину кімнати, локальний +z)
  g.add(box(w + 0.12, 0.04, thickness + 0.18, sillMat, x, opening.sill - 0.02, 0.06));
  // радіатор під вікном
  const rad = new THREE.Group();
  const rw = w * 0.75;
  rad.add(box(rw, 0.5, 0.03, radiatorMat, 0, 0, 0));
  const finCount = Math.floor(rw / 0.075);
  for (let i = 0; i < finCount; i++) {
    rad.add(box(0.045, 0.5, 0.1, radiatorMat, -rw / 2 + 0.045 + i * 0.075, 0, 0.03));
  }
  rad.position.set(x, 0.32, thickness / 2 + 0.09);
  g.add(rad);
  return g;
}

/** Двері (закриті) з рамою та ручкою. */
function doorAssembly(opening: WallOpening, length: number, thickness: number): THREE.Group {
  const g = new THREE.Group();
  const x = cm(opening.center) - length / 2;
  const w = cm(opening.width);
  const h = cm(opening.height);
  // лиштва
  g.add(box(w + 0.14, 0.07, thickness + 0.04, frameMat, x, h + 0.035, 0));
  g.add(box(0.07, h + 0.07, thickness + 0.04, frameMat, x - w / 2 - 0.035, (h + 0.07) / 2, 0));
  g.add(box(0.07, h + 0.07, thickness + 0.04, frameMat, x + w / 2 + 0.035, (h + 0.07) / 2, 0));
  // полотно
  const leaf = box(w - 0.04, h - 0.02, 0.05, doorMat, x, (h - 0.02) / 2, 0);
  g.add(leaf);
  // фільонки
  g.add(box(w - 0.24, h * 0.38, 0.02, doorMat, x, h * 0.68, 0.035));
  g.add(box(w - 0.24, h * 0.3, 0.02, doorMat, x, h * 0.22, 0.035));
  // ручка
  const handle = new THREE.Mesh(new THREE.CapsuleGeometry(0.012, 0.1, 6, 10), handleMat);
  handle.rotation.z = Math.PI / 2;
  handle.position.set(x - w / 2 + 0.09, 1.02, 0.05);
  g.add(handle);
  return g;
}

function poster(kind: number): THREE.Mesh {
  const tex = makePosterTexture(kind);
  const mesh = new THREE.Mesh(
    new THREE.PlaneGeometry(0.55, 0.8),
    new THREE.MeshStandardMaterial({ map: tex, roughness: 0.9 }),
  );
  return mesh;
}

function clock(): THREE.Group {
  const g = new THREE.Group();
  const rim = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.17, 0.045, 28), standardMat(0x2b3440, 0.4));
  rim.rotation.x = Math.PI / 2;
  g.add(rim);
  const face = new THREE.Mesh(
    new THREE.CircleGeometry(0.15, 28),
    new THREE.MeshStandardMaterial({ map: makeClockTexture(), roughness: 0.6 }),
  );
  face.position.z = 0.024;
  g.add(face);
  return g;
}

export function buildRoom(): RoomBuild {
  const group = new THREE.Group();
  const minX = cm(ROOM.minX);
  const maxX = cm(ROOM.maxX);
  const minZ = cm(ROOM.minY);
  const maxZ = cm(ROOM.maxY);
  const height = cm(ROOM.height);
  const t = cm(ROOM.wallThickness);
  const width = maxX - minX;
  const depth = maxZ - minZ;
  const cx = (minX + maxX) / 2;
  const cz = (minZ + maxZ) / 2;

  // Підлога
  const floorTex = makeFloorTexture();
  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(width, depth),
    new THREE.MeshStandardMaterial({ map: floorTex, roughness: 0.55 }),
  );
  floor.rotation.x = -Math.PI / 2;
  floor.position.set(cx, 0, cz);
  floor.receiveShadow = true;
  group.add(floor);

  // Стеля (окрема група — ховається при погляді згори)
  const ceiling = new THREE.Group();
  const ceilPlane = new THREE.Mesh(new THREE.PlaneGeometry(width + 2 * t, depth + 2 * t), ceilingMat);
  ceilPlane.rotation.x = Math.PI / 2;
  ceilPlane.position.set(cx, height, cz);
  ceiling.add(ceilPlane);
  // LED-панелі (емісивні плафони; самі джерела світла — у lighting.ts)
  const panelMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    emissive: 0xffffff,
    emissiveIntensity: 0.9,
    roughness: 0.4,
  });
  for (const l of CEILING_LIGHTS) {
    const panel = box(0.6, 0.02, 0.6, panelMat, cm(l.x), height - 0.012, cm(l.y));
    ceiling.add(panel);
    const trim = box(0.66, 0.012, 0.66, frameMat, cm(l.x), height - 0.004, cm(l.y));
    ceiling.add(trim);
  }
  group.add(ceiling);

  // Стіни моделюються вздовж локальної осі X з інтер'єром у напрямку локального +z.
  // Після повороту групи локальна координата "від лівого краю" L обчислюється так,
  // щоб отвір потрапив у потрібну світову координату (з урахуванням дзеркалення).

  // Західна стіна (з вікнами): інтер'єр +x ⇒ rotation.y=+90°, локальний +x → світовий -z
  const westOpenings = WEST_WINDOWS.map((w) => ({
    center: maxZ - cm(w.center), // дзеркалення вздовж стіни
    width: cm(w.width),
    sill: cm(w.sill),
    height: cm(w.height),
  }));
  const west = new THREE.Group();
  const westWall = wallWithOpenings(depth, height, t, wallMat, westOpenings);
  for (const o of westOpenings) westWall.add(windowAssembly(o, depth, t));
  westWall.rotation.y = Math.PI / 2;
  westWall.position.set(minX - t / 2, 0, cz);
  west.add(westWall);
  group.add(west);

  // Східна стіна (глуха, з постерами): інтер'єр -x ⇒ rotation.y=-90°
  const east = new THREE.Group();
  const eastWall = wallWithOpenings(depth, height, t, wallMat, []);
  eastWall.rotation.y = -Math.PI / 2;
  eastWall.position.set(maxX + t / 2, 0, cz);
  east.add(eastWall);
  const posterE1 = poster(0);
  posterE1.rotation.y = -Math.PI / 2;
  posterE1.position.set(maxX - 0.01, 1.55, 1.6);
  east.add(posterE1);
  const posterE2 = poster(2);
  posterE2.rotation.y = -Math.PI / 2;
  posterE2.position.set(maxX - 0.01, 1.55, 2.6);
  east.add(posterE2);
  group.add(east);

  // Північна стіна (глуха; постери) — охоплює кути
  const north = new THREE.Group();
  const northWall = wallWithOpenings(width + 2 * t, height, t, wallMat, []);
  northWall.position.set(cx, 0, minZ - t / 2);
  north.add(northWall);
  const posterN1 = poster(1);
  posterN1.position.set(2.3, 1.6, minZ + 0.01);
  north.add(posterN1);
  const posterN2 = poster(3);
  posterN2.position.set(3.1, 1.6, minZ + 0.01);
  north.add(posterN2);
  group.add(north);

  // Південна стіна (фронт класу: акцентний колір, двері, годинник):
  // інтер'єр -z ⇒ rotation.y=180°, локальна X дзеркалиться відносно світової
  const south = new THREE.Group();
  const southWall = wallWithOpenings(
    width + 2 * t,
    height,
    t,
    frontWallMat,
    [{ center: maxX + t - cm(SOUTH_DOOR.center), width: cm(SOUTH_DOOR.width), sill: 0, height: cm(SOUTH_DOOR.height) }],
  );
  southWall.rotation.y = Math.PI;
  southWall.position.set(cx, 0, maxZ + t / 2);
  south.add(southWall);
  const door = doorAssembly(SOUTH_DOOR, 0, 0.08);
  door.rotation.y = Math.PI;
  door.position.set(cm(SOUTH_DOOR.center), 0, maxZ + 0.01);
  south.add(door);
  const wallClock = clock();
  wallClock.rotation.y = Math.PI;
  wallClock.position.set(3.54, 2.12, maxZ - 0.03);
  south.add(wallClock);
  group.add(south);

  // Плінтуси по периметру
  const bbH = 0.08;
  const addBaseboard = (target: THREE.Group, w: number, x: number, z: number, rotY = 0) => {
    const b = box(w, bbH, 0.015, baseboardMat, 0, bbH / 2, 0);
    b.rotation.y = rotY;
    b.position.set(x, bbH / 2, z);
    target.add(b);
  };
  addBaseboard(north, width, cx, minZ + 0.008);
  addBaseboard(west, depth, minX + 0.008, cz, Math.PI / 2);
  addBaseboard(east, depth, maxX - 0.008, cz, Math.PI / 2);
  // південний плінтус — двома сегментами обабіч дверей
  const doorLeft = cm(SOUTH_DOOR.center - SOUTH_DOOR.width / 2);
  const doorRight = cm(SOUTH_DOOR.center + SOUTH_DOOR.width / 2);
  addBaseboard(south, doorLeft - minX, minX + (doorLeft - minX) / 2, maxZ - 0.008);
  addBaseboard(south, maxX - doorRight, doorRight + (maxX - doorRight) / 2, maxZ - 0.008);

  // Стіни та стеля відкидають тіні (сонце світить лише крізь вікна), скло — ні
  group.traverse((child) => {
    if ((child as THREE.Mesh).isMesh) {
      child.receiveShadow = true;
      child.castShadow = child.userData.noShadowCast !== true;
    }
  });

  return {
    group,
    walls: { west, east, north, south },
    ceiling,
    bounds: { minX, maxX, minZ, maxZ, height },
  };
}
