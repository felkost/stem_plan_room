/**
 * Оболонка Г-подібної кімнати: підлога/стеля за полігоном плану, стіни з
 * вікнами (східні) та дверима (західна), фронт класу — північна стіна.
 * Кожна стіна — окремий WallSet із власним правилом dollhouse-видимості:
 * рендерер ховає стіну, з боку якої стоїть камера.
 */
import * as THREE from 'three';
import {
  AIR_CONDITIONER,
  ALCOVE_WINDOWS,
  CEILING_LIGHTS,
  EAST_WINDOWS,
  PIN_BOARD,
  ROOM,
  WALL_CLOCK,
  WALL_DECOR,
  WEST_DOOR,
} from '../../../domain/classroomLayout';
import { box, cm, placeItem, standardMat } from './common';
import {
  makeClockTexture,
  makeFloorTexture,
  makePinBoardTexture,
  makePosterTexture,
  makeWoodTexture,
  makeWordCloudTexture,
} from './textures';

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

const wallMat = standardMat(0xf4f3f0, 0.95);
const frontWallMat = standardMat(0xf4f3f0, 0.95);
const ceilingMat = standardMat(0xf7f7f5, 0.9);
const frameMat = standardMat(0xfafafa, 0.5);
const blindMat = new THREE.MeshStandardMaterial({
  color: 0xf3f1ec,
  roughness: 0.9,
  transparent: true,
  opacity: 0.92,
  side: THREE.DoubleSide,
});
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
const baseboardMat = standardMat(0x93938f, 0.7);
const doorMat = new THREE.MeshStandardMaterial({ map: makeWoodTexture('#8a5a2e'), roughness: 0.65 });
const handleMat = standardMat(0xc9c9c9, 0.3, 0.9);
const acBodyMat = standardMat(0xf8f8f6, 0.35, 0.05);
const acSlotMat = standardMat(0x9aa0a3, 0.6);
const acLedMat = new THREE.MeshStandardMaterial({
  color: 0x123c3c,
  emissive: 0x27c8b8,
  emissiveIntensity: 1.1,
});
const standFrameMat = standardMat(0xd8d8d5, 0.4, 0.6);

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
  // вертикальні тканинні жалюзі: карниз + ламелі, привідкриті до кімнати
  const railY = opening.sill + h + 0.08;
  g.add(box(w + 0.16, 0.05, 0.09, sillMat, x, railY, thickness / 2 + 0.13));
  const slatW = 0.089;
  const slatTop = railY - 0.035;
  const slatBottom = 0.62;
  const span = w + 0.1;
  const count = Math.floor(span / (slatW + 0.006));
  for (let i = 0; i < count; i++) {
    const slat = new THREE.Mesh(
      new THREE.PlaneGeometry(slatW, slatTop - slatBottom),
      blindMat,
    );
    slat.position.set(
      x - span / 2 + slatW / 2 + i * (slatW + 0.006),
      (slatTop + slatBottom) / 2,
      thickness / 2 + 0.13,
    );
    // ламелі повернуто «привідкрито» — світло з вікон проходить у клас
    slat.rotation.y = 0.55 + (i % 2 === 0 ? 0.05 : -0.05);
    slat.userData.noShadowCast = true;
    g.add(slat);
  }
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

/** Настінний годинник; низ на y=0, фронт у +z (під placeItem). */
function clock(): THREE.Group {
  const g = new THREE.Group();
  const r = 0.17;
  const rim = new THREE.Mesh(new THREE.CylinderGeometry(r, r, 0.045, 28), standardMat(0x2b3440, 0.4));
  rim.rotation.x = Math.PI / 2;
  rim.position.y = r;
  g.add(rim);
  const face = new THREE.Mesh(
    new THREE.CircleGeometry(0.15, 28),
    new THREE.MeshStandardMaterial({ map: makeClockTexture(), roughness: 0.6 }),
  );
  face.position.set(0, r, 0.024);
  g.add(face);
  return g;
}

/** Компактний настінний кондиціонер; низ на y=0, фронт у +z. */
function airConditioner(): THREE.Group {
  const g = new THREE.Group();
  const w = cm(AIR_CONDITIONER.width);
  const h = cm(AIR_CONDITIONER.height);
  const d = cm(AIR_CONDITIONER.depth);
  g.add(box(w, h, d, acBodyMat, 0, h / 2, 0));
  // верхня щілина забору повітря
  g.add(box(w * 0.86, 0.014, 0.004, acSlotMat, 0, h * 0.82, d / 2 + 0.002));
  // нижня привідкрита ламель повітроводу
  const flap = box(w * 0.9, 0.05, 0.014, radiatorMat, 0, 0.045, d / 2 + 0.012);
  flap.rotation.x = 0.55;
  g.add(flap);
  // світлодіодний індикатор режиму
  g.add(box(0.05, 0.016, 0.004, acLedMat, w * 0.32, h * 0.3, d / 2 + 0.002));
  return g;
}

/**
 * Стенд для матеріалів: біла дошка в алюмінієвій рамі з поличкою-лотком,
 * текстурні картки праворуч і три пришпилені міні-постери. Низ на y=0.
 */
function pinBoardStand(): THREE.Group {
  const g = new THREE.Group();
  const w = cm(PIN_BOARD.width);
  const h = cm(PIN_BOARD.height);
  // полотно
  g.add(box(w, h, 0.03, standardMat(0xfbfbf9, 0.85), 0, h / 2, 0));
  const face = new THREE.Mesh(
    new THREE.PlaneGeometry(w - 0.03, h - 0.03),
    new THREE.MeshStandardMaterial({ map: makePinBoardTexture(), roughness: 0.85 }),
  );
  face.position.set(0, h / 2, 0.016);
  g.add(face);
  // алюмінієва рама та лоток для маркерів
  g.add(box(w + 0.06, 0.03, 0.05, standFrameMat, 0, h - 0.015, 0));
  g.add(box(w + 0.06, 0.03, 0.05, standFrameMat, 0, 0.015, 0));
  g.add(box(0.03, h, 0.05, standFrameMat, -(w / 2 + 0.015), h / 2, 0));
  g.add(box(0.03, h, 0.05, standFrameMat, w / 2 + 0.015, h / 2, 0));
  g.add(box(0.6, 0.02, 0.07, standFrameMat, 0, 0.03, 0.045));
  g.add(box(0.6, 0.03, 0.012, standFrameMat, 0, 0.045, 0.078));
  // пришпилені міні-постери (ліві 2/3 полотна) з кнопками
  const posterSpots = [
    { x: -0.52, tilt: 0.015, kind: 0 },
    { x: -0.21, tilt: -0.02, kind: 1 },
    { x: 0.1, tilt: 0.01, kind: 3 },
  ];
  const pinMat = standardMat(0xd94f4f, 0.45);
  for (const spot of posterSpots) {
    const p = poster(spot.kind);
    p.scale.setScalar(0.5);
    p.rotation.z = spot.tilt;
    p.position.set(spot.x, 0.43, 0.022);
    g.add(p);
    const pin = new THREE.Mesh(new THREE.SphereGeometry(0.011, 10, 8), pinMat);
    pin.position.set(spot.x, 0.43 + 0.19, 0.026);
    g.add(pin);
  }
  return g;
}

/** Типографічний декор стіни (прозорий декаль-план); низ на y=0. */
function wordCloudDecal(): THREE.Group {
  const g = new THREE.Group();
  const w = cm(WALL_DECOR.width);
  const h = cm(WALL_DECOR.height);
  const decal = new THREE.Mesh(
    new THREE.PlaneGeometry(w, h),
    new THREE.MeshStandardMaterial({ map: makeWordCloudTexture(), transparent: true, roughness: 0.95 }),
  );
  decal.position.y = h / 2;
  decal.userData.noShadowCast = true;
  g.add(decal);
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
    new THREE.MeshStandardMaterial({ map: floorTex, roughness: 0.35 }),
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
  // група з трьох постерів (як у референсі) — на південь від дверей
  for (let i = 0; i < 3; i++) {
    const p = poster(i);
    p.rotation.y = Math.PI / 2;
    p.position.set(minX + 0.01, 1.62, -0.55 + i * 0.7);
    west.add(p);
  }
  group.add(west);

  // Північна стіна (фронт класу: акцентний колір; охоплює основну зону та нішу)
  const north = new THREE.Group();
  const northWall = wallWithOpenings(aMaxX - minX + 2 * t, height, t, frontWallMat, []);
  northWall.position.set((minX + aMaxX) / 2, 0, minZ - t / 2);
  north.add(northWall);
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
  // кондиціонер на простінку між вікнами, над постером
  const ac = airConditioner();
  placeItem(ac, AIR_CONDITIONER);
  eastMain.add(ac);
  // постер біля фронту класу (до першого вікна)
  const posterEF = poster(3);
  posterEF.rotation.y = -Math.PI / 2;
  posterEF.position.set(maxX - 0.01, 1.62, -0.05);
  eastMain.add(posterEF);
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
  // постер у ніші вчителя (між вікном і виходом в основну зону)
  const posterA = poster(2);
  posterA.rotation.y = -Math.PI / 2;
  posterA.position.set(aMaxX - 0.01, 1.62, -0.72);
  eastAlcove.add(posterA);
  group.add(eastAlcove);

  // Південна стіна основної зони (глуха, з постерами): інтер'єр -z ⇒ rotation.y=180°
  const south = new THREE.Group();
  const southWall = wallWithOpenings(maxX - minX + 2 * t, height, t, wallMat, []);
  southWall.rotation.y = Math.PI;
  southWall.position.set((minX + maxX) / 2, 0, maxZ + t / 2);
  south.add(southWall);
  // композиція за золотим перерізом (координати — у domain/classroomLayout.ts):
  // стенд у мінорній зоні, ворд-клауд у мажорній, годинник на золотій лінії
  const stand = pinBoardStand();
  placeItem(stand, PIN_BOARD);
  south.add(stand);
  const decor = wordCloudDecal();
  placeItem(decor, WALL_DECOR);
  south.add(decor);
  const wallClock = clock();
  placeItem(wallClock, WALL_CLOCK);
  south.add(wallClock);
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
