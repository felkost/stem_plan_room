/**
 * Процедурні меблі. Кожен білдер повертає THREE.Group,
 * змодельовану з центром у (0,0) по x/z, низом на y=0 і фронтом у напрямку +z
 * (відповідає куту 0 у Sweet Home 3D).
 */
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { box, cylinder, standardMat } from './common';
import {
  makeKeyboardTexture,
  makePanelSlideTexture,
  makeChalkboardTexture,
  makeScreenTexture,
  makeWoodTexture,
} from './textures';

// Спільні матеріали (створюються один раз на модуль)
const laminateMat = new THREE.MeshStandardMaterial({ map: makeWoodTexture('#c6a06b'), roughness: 0.5 });
const darkWoodMat = new THREE.MeshStandardMaterial({ map: makeWoodTexture('#ab8253'), roughness: 0.55 });
const metalLegMat = standardMat(0x9ea3a8, 0.35, 0.85);
/** Чорна сталева труба квадратного перетину — О-подібні каркаси столів. */
const steelFrameMat = standardMat(0x24262a, 0.5, 0.6);
const blackPlasticMat = standardMat(0x1f2226, 0.6);
const grayPlasticMat = standardMat(0x585d63, 0.65);
const fabricMat = standardMat(0xb3b3b0, 0.95);
const bezelMat = standardMat(0x14161a, 0.45);
const keyboardTex = makeKeyboardTexture();
const keyboardTopMat = new THREE.MeshStandardMaterial({ map: keyboardTex, roughness: 0.7 });
const whitePlasticMat = standardMat(0xf2f2ee, 0.5);
const chromeMat = standardMat(0xcfd2d6, 0.25, 0.9);

let screenVariantCounter = 0;

/**
 * Бічна О-подібна рама стола з чорної квадратної труби (як у референсі):
 * дві стійки + верхня й нижня перекладини. Центр рами в (0, x) по ширині.
 */
function sideLoopLeg(x: number, topY: number, depth: number, bar = 0.04): THREE.Group {
  const g = new THREE.Group();
  const zHalf = depth / 2 - bar / 2;
  for (const sz of [-1, 1]) {
    g.add(box(bar, topY - bar * 2, bar, steelFrameMat, x, topY / 2, sz * zHalf));
  }
  g.add(box(bar, bar, depth - bar * 2, steelFrameMat, x, topY - bar / 2, 0));
  g.add(box(bar, bar, depth - bar * 2, steelFrameMat, x, bar / 2, 0));
  return g;
}

/** Учнівський комп'ютерний стіл із клавіатурою, мишею та системним блоком. */
export function buildStudentDesk(): THREE.Group {
  const g = new THREE.Group();
  const w = 1.0;
  const d = 0.49;
  const h = 0.758;
  // стільниця
  g.add(box(w, 0.03, d, laminateMat, 0, h - 0.015, 0));
  // бічні О-подібні рами з чорної труби
  g.add(sideLoopLeg(-w / 2 + 0.04, h - 0.03, d - 0.06));
  g.add(sideLoopLeg(w / 2 - 0.04, h - 0.03, d - 0.06));
  // задня поперечина між рамами
  g.add(box(w - 0.12, 0.05, 0.025, steelFrameMat, 0, h - 0.16, -d / 2 + 0.05));
  // клавіатура (ближче до фронту, фронт = +z)
  const kb = new THREE.Mesh(new THREE.BoxGeometry(0.37, 0.014, 0.13), [
    blackPlasticMat, blackPlasticMat, keyboardTopMat, blackPlasticMat, blackPlasticMat, blackPlasticMat,
  ]);
  kb.position.set(-0.05, h + 0.007, 0.1);
  kb.rotation.y = (Math.random() - 0.5) * 0.12;
  g.add(kb);
  // миша та килимок
  const pad = box(0.22, 0.002, 0.19, standardMat(0x22364a, 0.95), 0.3, h + 0.001, 0.06);
  g.add(pad);
  const mouse = new THREE.Mesh(new RoundedBoxGeometry(0.058, 0.03, 0.098, 3, 0.014), blackPlasticMat);
  mouse.position.set(0.3, h + 0.016, 0.06);
  g.add(mouse);
  // системний блок під столом
  const pc = new THREE.Group();
  pc.add(box(0.17, 0.4, 0.4, grayPlasticMat, 0, 0.2, 0));
  pc.add(box(0.15, 0.36, 0.01, blackPlasticMat, 0, 0.2, 0.2));
  const led = box(0.012, 0.012, 0.006, new THREE.MeshStandardMaterial({ color: 0x22ff66, emissive: 0x22ff66, emissiveIntensity: 1.5 }), 0.04, 0.34, 0.205);
  pc.add(led);
  pc.position.set(w / 2 - 0.18, 0, -0.02);
  g.add(pc);
  return g;
}

/** ЖК-монітор з увімкненим екраном. */
export function buildMonitor(): THREE.Group {
  const g = new THREE.Group();
  const totalH = 0.568;
  const panelW = 0.443;
  const panelH = 0.30;
  // підставка
  g.add(cylinder(0.1, 0.015, blackPlasticMat, 0, 0.0075, 0));
  g.add(box(0.035, 0.24, 0.02, blackPlasticMat, 0, 0.13, -0.03));
  // панель
  const py = totalH - panelH / 2 - 0.02;
  const panel = new THREE.Mesh(new RoundedBoxGeometry(panelW, panelH, 0.028, 3, 0.008), bezelMat);
  panel.position.set(0, py, 0);
  g.add(panel);
  const screenTex = makeScreenTexture(screenVariantCounter++);
  const screen = new THREE.Mesh(
    new THREE.PlaneGeometry(panelW - 0.03, panelH - 0.03),
    new THREE.MeshStandardMaterial({
      map: screenTex,
      emissive: 0xffffff,
      emissiveMap: screenTex,
      emissiveIntensity: 0.75,
      roughness: 0.35,
    }),
  );
  screen.position.set(0, py, 0.0155);
  g.add(screen);
  return g;
}

/** Офісне крісло на коліщатках. */
export function buildOfficeChair(seatColor?: number): THREE.Group {
  const g = new THREE.Group();
  const cushion = seatColor !== undefined ? standardMat(seatColor, 0.95) : fabricMat;
  // хрестовина: 5 хромованих променів + колеса
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2;
    const arm = box(0.26, 0.03, 0.045, chromeMat, 0, 0, 0);
    arm.position.set(Math.cos(a) * 0.13, 0.045, Math.sin(a) * 0.13);
    arm.rotation.y = -a;
    g.add(arm);
    const caster = new THREE.Mesh(new THREE.SphereGeometry(0.03, 12, 10), grayPlasticMat);
    caster.position.set(Math.cos(a) * 0.25, 0.03, Math.sin(a) * 0.25);
    g.add(caster);
  }
  // газліфт
  g.add(cylinder(0.025, 0.33, chromeMat, 0, 0.2, 0));
  g.add(cylinder(0.04, 0.12, blackPlasticMat, 0, 0.12, 0));
  // сидіння
  const seat = new THREE.Mesh(new RoundedBoxGeometry(0.44, 0.075, 0.43, 3, 0.03), cushion);
  seat.position.set(0, 0.45, 0.02);
  g.add(seat);
  // спинка
  const back = new THREE.Mesh(new RoundedBoxGeometry(0.42, 0.48, 0.06, 3, 0.03), cushion);
  back.position.set(0, 0.72, -0.2);
  back.rotation.x = 0.1;
  g.add(back);
  // підлокітники
  for (const s of [-1, 1]) {
    g.add(box(0.025, 0.16, 0.04, blackPlasticMat, s * 0.22, 0.53, 0.02));
    const pad = new THREE.Mesh(new RoundedBoxGeometry(0.05, 0.02, 0.24, 2, 0.008), blackPlasticMat);
    pad.position.set(s * 0.22, 0.62, 0.02);
    g.add(pad);
  }
  return g;
}

/**
 * Груповий стіл для центру кабінету: стільниця зі світлого дуба на чорній
 * О-подібній рамі (як у референсі) + зошити на стільниці.
 */
export function buildGroupTable(): THREE.Group {
  const g = new THREE.Group();
  const w = 1.5;
  const d = 0.68;
  const h = 0.76;
  g.add(box(w, 0.035, d, laminateMat, 0, h - 0.0175, 0));
  g.add(sideLoopLeg(-w / 2 + 0.07, h - 0.035, d - 0.08, 0.05));
  g.add(sideLoopLeg(w / 2 - 0.07, h - 0.035, d - 0.08, 0.05));
  // поздовжня балка між рамами
  g.add(box(w - 0.24, 0.05, 0.05, steelFrameMat, 0, h - 0.09, 0));
  // зошити (закриті, графітові — як у референсі)
  const notebookMat = standardMat(0x4d4f52, 0.85);
  const nb1 = box(0.25, 0.018, 0.18, notebookMat, -0.35, h + 0.009, 0.05);
  nb1.rotation.y = 0.14;
  g.add(nb1);
  const nb2 = box(0.25, 0.018, 0.18, notebookMat, 0.38, h + 0.009, -0.08);
  nb2.rotation.y = -0.1;
  g.add(nb2);
  return g;
}

/** Стіл учителя з тумбами, паперами та чашкою. */
export function buildTeacherDesk(): THREE.Group {
  const g = new THREE.Group();
  const w = 1.696;
  const d = 0.932;
  const h = 0.727;
  g.add(box(w, 0.035, d, darkWoodMat, 0, h - 0.0175, 0));
  // тумби з шухлядами
  for (const s of [-1, 1]) {
    const px = s * (w / 2 - 0.22);
    g.add(box(0.42, h - 0.035, d - 0.12, darkWoodMat, px, (h - 0.035) / 2, 0));
    for (let i = 0; i < 3; i++) {
      g.add(box(0.36, 0.16, 0.012, laminateMat, px, 0.14 + i * 0.21, d / 2 - 0.055));
      g.add(box(0.12, 0.02, 0.02, metalLegMat, px, 0.2 + i * 0.21, d / 2 - 0.045));
    }
  }
  // передня панель
  g.add(box(w - 0.9, 0.42, 0.02, darkWoodMat, 0, h - 0.24, -d / 2 + 0.05));
  // стос паперів і чашка
  g.add(box(0.21, 0.02, 0.3, whitePlasticMat, -0.35, h + 0.01, 0.18));
  const mug = cylinder(0.04, 0.09, standardMat(0xc0392b, 0.5), 0.45, h + 0.045, 0.25, 16);
  g.add(mug);
  // клавіатура і миша вчителя
  const kb = new THREE.Mesh(new THREE.BoxGeometry(0.37, 0.014, 0.13), [
    blackPlasticMat, blackPlasticMat, keyboardTopMat, blackPlasticMat, blackPlasticMat, blackPlasticMat,
  ]);
  // ближче до краю, за яким сидить учитель (стіл у сцені розвернуто кутом π)
  kb.position.set(0.05, h + 0.007, 0.28);
  g.add(kb);
  return g;
}

/** Зелена крейдяна дошка з поличкою для крейди. */
export function buildChalkboard(w = 2.893, h = 1.04): THREE.Group {
  const g = new THREE.Group();
  const frame = new THREE.MeshStandardMaterial({ map: makeWoodTexture('#7a5230'), roughness: 0.6 });
  // основа (кріпиться до стіни за групою)
  g.add(box(w, h, 0.025, frame, 0, h / 2, 0));
  const boardTex = makeChalkboardTexture();
  const board = new THREE.Mesh(
    new THREE.PlaneGeometry(w - 0.09, h - 0.09),
    new THREE.MeshStandardMaterial({ map: boardTex, roughness: 0.92 }),
  );
  board.position.set(0, h / 2, 0.014);
  g.add(board);
  // поличка для крейди
  g.add(box(w * 0.86, 0.02, 0.07, frame, 0, 0.015, 0.045));
  const chalkMat = standardMat(0xffffff, 0.9);
  for (let i = 0; i < 3; i++) {
    const chalk = cylinder(0.006, 0.07, chalkMat, -0.3 + i * 0.22, 0.035, 0.05, 8);
    chalk.rotation.z = Math.PI / 2;
    g.add(chalk);
  }
  const sponge = box(0.11, 0.03, 0.05, standardMat(0xd9c9a3, 0.95), 0.55, 0.043, 0.05);
  g.add(sponge);
  return g;
}

/** Інтерактивна панель («телевізор» із плану) на мобільній стійці. */
export function buildInteractivePanel(): THREE.Group {
  const g = new THREE.Group();
  const totalH = 1.757;
  const panelW = 1.585;
  const panelH = 0.89;
  // стійка
  for (const s of [-1, 1]) {
    g.add(box(0.05, totalH - 0.08, 0.05, blackPlasticMat, s * 0.55, (totalH - 0.08) / 2 + 0.06, -0.05));
    g.add(box(0.06, 0.05, 0.5, blackPlasticMat, s * 0.55, 0.045, 0));
    for (const zz of [-0.2, 0.2]) {
      g.add(cylinder(0.035, 0.03, grayPlasticMat, s * 0.55, 0.02, zz, 12));
    }
  }
  g.add(box(1.16, 0.05, 0.05, blackPlasticMat, 0, 0.35, -0.05));
  // панель
  const py = totalH - panelH / 2;
  const panel = new THREE.Mesh(new RoundedBoxGeometry(panelW, panelH + 0.06, 0.06, 3, 0.012), bezelMat);
  panel.position.set(0, py - 0.02, 0);
  g.add(panel);
  const slideTex = makePanelSlideTexture();
  const screen = new THREE.Mesh(
    new THREE.PlaneGeometry(panelW - 0.06, panelH - 0.02),
    new THREE.MeshStandardMaterial({
      map: slideTex,
      emissive: 0xffffff,
      emissiveMap: slideTex,
      emissiveIntensity: 0.7,
      roughness: 0.3,
    }),
  );
  screen.position.set(0, py - 0.02, 0.033);
  g.add(screen);
  return g;
}

/** Тумба (під дошкою). */
export function buildLowCabinet(w = 0.86, h = 0.74, d = 0.44): THREE.Group {
  const g = new THREE.Group();
  g.add(box(w, h - 0.02, d, laminateMat, 0, (h - 0.02) / 2, 0));
  g.add(box(w + 0.03, 0.025, d + 0.03, darkWoodMat, 0, h - 0.0125, 0));
  // дверцята
  for (const s of [-1, 1]) {
    g.add(box(w / 2 - 0.03, h - 0.1, 0.012, darkWoodMat, s * (w / 4 - 0.005), (h - 0.06) / 2, d / 2 + 0.002));
    g.add(cylinder(0.008, 0.05, metalLegMat, s * 0.06, h / 2, d / 2 + 0.02, 8));
  }
  return g;
}

/** Стійка з мережевим комутатором і кабелями. */
export function buildSwitchRack(): THREE.Group {
  const g = new THREE.Group();
  const standH = 0.62;
  // каркас-стійка
  for (const sx of [-1, 1]) {
    for (const sz of [-1, 1]) {
      g.add(box(0.02, standH, 0.02, metalLegMat, sx * 0.14, standH / 2, sz * 0.09));
    }
  }
  g.add(box(0.34, 0.02, 0.24, blackPlasticMat, 0, standH - 0.01, 0));
  g.add(box(0.34, 0.02, 0.24, blackPlasticMat, 0, 0.3, 0));
  // комутатор
  const sw = new THREE.Group();
  sw.add(box(0.301, 0.045, 0.188, grayPlasticMat, 0, 0.0225, 0));
  for (let i = 0; i < 8; i++) {
    const on = i % 3 !== 2;
    sw.add(box(0.012, 0.008, 0.004,
      new THREE.MeshStandardMaterial({
        color: on ? 0x35ff6a : 0x333a33,
        emissive: on ? 0x35ff6a : 0x000000,
        emissiveIntensity: 1.6,
      }),
      -0.115 + i * 0.024, 0.026, 0.095));
  }
  sw.position.set(0, standH, 0);
  g.add(sw);
  // роутер на нижній полиці
  g.add(box(0.2, 0.035, 0.14, blackPlasticMat, 0, 0.33, 0));
  // кабелі
  const cableMat = standardMat(0x2f3a45, 0.8);
  for (let i = 0; i < 3; i++) {
    const curve = new THREE.QuadraticBezierCurve3(
      new THREE.Vector3(-0.05 + i * 0.05, standH + 0.02, -0.09),
      new THREE.Vector3(-0.02 + i * 0.06, standH * 0.55, -0.16),
      new THREE.Vector3(0.02 + i * 0.04, 0.02, -0.12),
    );
    g.add(new THREE.Mesh(new THREE.TubeGeometry(curve, 12, 0.004, 6), cableMat));
  }
  return g;
}

/** Зарядна станція (Bluetti) / ДБЖ. */
export function buildPowerStation(): THREE.Group {
  const g = new THREE.Group();
  const w = 0.456;
  const h = 0.181;
  const d = 0.35;
  const body = new THREE.Mesh(new RoundedBoxGeometry(w, h, d, 3, 0.02), standardMat(0x3a3f45, 0.55));
  body.position.set(0, h / 2, 0);
  g.add(body);
  // LCD
  g.add(box(0.12, 0.06, 0.006, new THREE.MeshStandardMaterial({
    color: 0x1a2b33,
    emissive: 0x27c8c8,
    emissiveIntensity: 0.9,
  }), -0.09, h / 2 + 0.01, d / 2));
  // розетки
  for (let i = 0; i < 2; i++) {
    g.add(cylinder(0.024, 0.008, blackPlasticMat, 0.08 + i * 0.07, h / 2, d / 2, 12).rotateX(Math.PI / 2));
  }
  // помаранчеві накладки та ручка
  g.add(box(w, 0.025, 0.05, standardMat(0xf58220, 0.6), 0, h - 0.012, d / 2 - 0.025));
  g.add(box(0.2, 0.02, 0.05, standardMat(0x2b2f34, 0.6), 0, h + 0.01, 0));
  return g;
}
