/**
 * Оболонка Г-подібної кімнати: підлога/стеля за полігоном плану, стіни з
 * вікнами (східні) та дверима (західна), фронт класу — північна стіна.
 * Кожна стіна — окремий WallSet із власним правилом dollhouse-видимості:
 * рендерер ховає стіну, з боку якої стоїть камера.
 */
import * as THREE from 'three';
import { ALCOVE_WINDOWS, CEILING_LIGHTS, EAST_WINDOWS, ROOM, WEST_DOOR } from '../../../domain/classroomLayout';
import { box, cm, standardMat } from './common';
import { makeClockTexture, makeFloorTexture, makePosterTexture, makeWoodTexture } from './textures';

export interface WallSet {
  group: THREE.Group;
  /** Чи видима стіна для камери у точці p (dollhouse-правило). */
  isVisible: (p: THREE.Vector3, margin: number) => boolean;
}

export interface RoomBuild {
  group: THREE.Group;
  wallSets: WallSet[];
  ceiling: THREE.Group;
  /** Загальний обмежувальний бокс кімнати (включно з нішею). */
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
  // імпости: два вертикальні (потрійне вікно) і горизонтальний
  g.add(box(fw * 0.8, h, 0.06, frameMat, x - w / 6, yMid, 0));
  g.add(box(fw * 0.8, h, 0.06, frameMat, x + w / 6, yMid, 0));
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

/** Двері (закриті) з рамою та ручкою; центр у (0,0), фронт у локальний +z. */
function doorAssembly(width: number, height: number): THREE.Group {
  const g = new THREE.Group();
  const w = width;
  const h = height;
  // лиштва
  g.add(box(w + 0.14, 0.07, 0.12, frameMat, 0, h + 0.035, 0));
  g.add(box(0.07, h + 0.07, 0.12, frameMat, -w / 2 - 0.035, (h + 0.07) / 2, 0));
  g.add(box(0.07, h + 0.07, 0.12, frameMat, w / 2 + 0.035, (h + 0.07) / 2, 0));
  // полотно
  g.add(box(w - 0.04, h - 0.02, 0.05, doorMat, 0, (h - 0.02) / 2, 0));
  // фільонки
  g.add(box(w - 0.24, h * 0.38, 0.02, doorMat, 0, h * 0.68, 0.035));
  g.add(box(w - 0.24, h * 0.3, 0.02, doorMat, 0, h * 0.22, 0.035));
  // ручка
  const handle = new THREE.Mesh(new THREE.CapsuleGeometry(0.012, 0.1, 6, 10), handleMat);
  handle.rotation.z = Math.PI / 2;
  handle.position.set(-w / 2 + 0.09, 1.02, 0.05);
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

/**
 * Полігон Г-подібної кімнати у координатах плану (см → м).
 * mirrorZ=true — для підлоги (shape-y = -z після повороту -90° навколо X),
 * mirrorZ=false — для стелі (поворот +90°).
 */
function roomShape(mirrorZ: boolean): THREE.Shape {
  const s = mirrorZ ? -1 : 1;
  const pts: Array<[number, number]> = [
    [ROOM.minX, ROOM.minY],
    [ROOM.alcove.maxX, ROOM.alcove.minY],
    [ROOM.alcove.maxX, ROOM.alcove.maxY],
    [ROOM.maxX, ROOM.alcove.maxY],
    [ROOM.maxX, ROOM.maxY],
    [ROOM.minX, ROOM.maxY],
  ];
  const shape = new THREE.Shape();
  pts.forEach(([px, py], i) => {
    if (i === 0) shape.moveTo(cm(px), s * cm(py));
    else shape.lineTo(cm(px), s * cm(py));
  });
  shape.closePath();
  return shape;
}

export function buildRoom(): RoomBuild {
  const group = new THREE.Group();
  const minX = cm(ROOM.minX);
  const maxX = cm(ROOM.maxX);
  const minZ = cm(ROOM.minY);
  const maxZ = cm(ROOM.maxY);
  const aMaxX = cm(ROOM.alcove.maxX);
  const aMaxZ = cm(ROOM.alcove.maxY);
  const height = cm(ROOM.height);
  const t = cm(ROOM.wallThickness);

  // Підлога — Г-подібний полігон (UV ShapeGeometry — у метрах, масштаб через repeat)
  const floorTex = makeFloorTexture();
  floorTex.wrapS = THREE.RepeatWrapping;
  floorTex.wrapT = THREE.RepeatWrapping;
  floorTex.repeat.set(0.8, 0.8);
  const floor = new THREE.Mesh(
    new THREE.ShapeGeometry(roomShape(true)),
    new THREE.MeshStandardMaterial({ map: floorTex, roughness: 0.55 }),
  );
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  group.add(floor);

  // Стеля (окрема група — ховається при погляді згори)
  const ceiling = new THREE.Group();
  const ceilPlane = new THREE.Mesh(new THREE.ShapeGeometry(roomShape(false)), ceilingMat);
  ceilPlane.rotation.x = Math.PI / 2;
  ceilPlane.position.y = height;
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

  // Західна стіна (з дверима): інтер'єр +x ⇒ rotation.y=+90°, локальний +x → світовий -z
  const westOpenings = [{
    center: maxZ - cm(WEST_DOOR.center), // дзеркалення вздовж стіни
    width: cm(WEST_DOOR.width),
    sill: 0,
    height: cm(WEST_DOOR.height),
  }];
  const west = new THREE.Group();
  const westWall = wallWithOpenings(maxZ - minZ, height, t, wallMat, westOpenings);
  westWall.rotation.y = Math.PI / 2;
  westWall.position.set(minX - t / 2, 0, (minZ + maxZ) / 2);
  west.add(westWall);
  const door = doorAssembly(cm(WEST_DOOR.width), cm(WEST_DOOR.height));
  door.rotation.y = Math.PI / 2; // фронт → +x (усередину кімнати)
  door.position.set(minX - 0.02, 0, cm(WEST_DOOR.center));
  west.add(door);
  group.add(west);

  // Північна стіна (фронт класу: акцентний колір; охоплює основну зону та нішу)
  const north = new THREE.Group();
  const northWall = wallWithOpenings(aMaxX - minX + 2 * t, height, t, frontWallMat, []);
  northWall.position.set((minX + aMaxX) / 2, 0, minZ - t / 2);
  north.add(northWall);
  const wallClock = clock();
  wallClock.position.set(5.1, 2.12, minZ + 0.03); // між дошкою та нішею, фронт → +z
  north.add(wallClock);
  group.add(north);

  // Східна стіна основної зони (2 вікна): інтер'єр -x ⇒ rotation.y=-90°,
  // локальний +x → світовий +z; тягнеться від ніші до південної стіни
  const eastLen = maxZ + t - aMaxZ;
  const eastOpenings = EAST_WINDOWS.map((w) => ({
    center: cm(w.center) - aMaxZ,
    width: cm(w.width),
    sill: cm(w.sill),
    height: cm(w.height),
  }));
  const eastMain = new THREE.Group();
  const eastMainWall = wallWithOpenings(eastLen, height, t, wallMat, eastOpenings);
  for (const o of eastOpenings) eastMainWall.add(windowAssembly(o, eastLen, t));
  eastMainWall.rotation.y = -Math.PI / 2;
  eastMainWall.position.set(maxX + t / 2, 0, (aMaxZ + maxZ + t) / 2);
  eastMain.add(eastMainWall);
  // постер між вікнами
  const posterE = poster(0);
  posterE.rotation.y = -Math.PI / 2;
  posterE.position.set(maxX - 0.01, 1.55, 2.6);
  eastMain.add(posterE);
  group.add(eastMain);

  // Східна стіна ніші (1 вікно)
  const aEastLen = aMaxZ - minZ;
  const aEastOpenings = ALCOVE_WINDOWS.map((w) => ({
    center: cm(w.center) - minZ,
    width: cm(w.width),
    sill: cm(w.sill),
    height: cm(w.height),
  }));
  const eastAlcove = new THREE.Group();
  const eastAlcoveWall = wallWithOpenings(aEastLen, height, t, wallMat, aEastOpenings);
  for (const o of aEastOpenings) eastAlcoveWall.add(windowAssembly(o, aEastLen, t));
  eastAlcoveWall.rotation.y = -Math.PI / 2;
  eastAlcoveWall.position.set(aMaxX + t / 2, 0, (minZ + aMaxZ) / 2);
  eastAlcove.add(eastAlcoveWall);
  group.add(eastAlcove);

  // Південна стіна основної зони (глуха, з постерами): інтер'єр -z ⇒ rotation.y=180°
  const south = new THREE.Group();
  const southWall = wallWithOpenings(maxX - minX + 2 * t, height, t, wallMat, []);
  southWall.rotation.y = Math.PI;
  southWall.position.set((minX + maxX) / 2, 0, maxZ + t / 2);
  south.add(southWall);
  const posterS1 = poster(1);
  posterS1.rotation.y = Math.PI;
  posterS1.position.set(2.0, 1.6, maxZ - 0.01);
  south.add(posterS1);
  const posterS2 = poster(3);
  posterS2.rotation.y = Math.PI;
  posterS2.position.set(2.8, 1.6, maxZ - 0.01);
  south.add(posterS2);
  group.add(south);

  // Південна стіна ніші (між нішею та зовнішнім кутом): інтер'єр -z
  const southAlcove = new THREE.Group();
  const southAlcoveWall = wallWithOpenings(aMaxX - maxX, height, t, wallMat, []);
  southAlcoveWall.rotation.y = Math.PI;
  southAlcoveWall.position.set((maxX + t + aMaxX + t) / 2, 0, aMaxZ + t / 2);
  southAlcove.add(southAlcoveWall);
  const posterSA = poster(2);
  posterSA.rotation.y = Math.PI;
  posterSA.position.set((maxX + aMaxX) / 2, 1.55, aMaxZ - 0.01);
  southAlcove.add(posterSA);
  group.add(southAlcove);

  // Плінтуси по периметру (західний — двома сегментами обабіч дверей)
  const bbH = 0.08;
  const addBaseboard = (target: THREE.Group, w: number, x: number, z: number, rotY = 0) => {
    if (w <= 0.01) return;
    const b = box(w, bbH, 0.015, baseboardMat, 0, bbH / 2, 0);
    b.rotation.y = rotY;
    b.position.set(x, bbH / 2, z);
    target.add(b);
  };
  addBaseboard(north, aMaxX - minX, (minX + aMaxX) / 2, minZ + 0.008);
  addBaseboard(south, maxX - minX, (minX + maxX) / 2, maxZ - 0.008);
  addBaseboard(southAlcove, aMaxX - maxX, (maxX + aMaxX) / 2, aMaxZ - 0.008);
  addBaseboard(eastMain, maxZ - aMaxZ, maxX - 0.008, (aMaxZ + maxZ) / 2, Math.PI / 2);
  addBaseboard(eastAlcove, aMaxZ - minZ, aMaxX - 0.008, (minZ + aMaxZ) / 2, Math.PI / 2);
  const doorNorth = cm(WEST_DOOR.center - WEST_DOOR.width / 2);
  const doorSouth = cm(WEST_DOOR.center + WEST_DOOR.width / 2);
  addBaseboard(west, doorNorth - minZ, minX + 0.008, (minZ + doorNorth) / 2, Math.PI / 2);
  addBaseboard(west, maxZ - doorSouth, minX + 0.008, (doorSouth + maxZ) / 2, Math.PI / 2);

  // Стіни та стеля відкидають тіні (сонце світить лише крізь вікна), скло — ні
  group.traverse((child) => {
    if ((child as THREE.Mesh).isMesh) {
      child.receiveShadow = true;
      child.castShadow = child.userData.noShadowCast !== true;
    }
  });

  // Dollhouse-правила: стіну ховаємо, коли камера опиняється з її зовнішнього боку
  const wallSets: WallSet[] = [
    { group: west, isVisible: (p, m) => p.x > minX - m },
    { group: north, isVisible: (p, m) => p.z > minZ - m },
    { group: eastMain, isVisible: (p, m) => p.x < maxX + m },
    { group: eastAlcove, isVisible: (p, m) => p.x < aMaxX + m },
    { group: south, isVisible: (p, m) => p.z < maxZ + m },
    { group: southAlcove, isVisible: (p, m) => p.z < aMaxZ + m },
  ];

  return {
    group,
    wallSets,
    ceiling,
    bounds: { minX, maxX: aMaxX, minZ, maxZ, height },
  };
}
