/**
 * Шафа-вітрина з роботами: на полицях — роботи NXT і SPIKE, коробки конструкторів,
 * кубок і контейнери з деталями (на місці книжкової шафи з плану).
 */
import * as THREE from 'three';
import { box, cylinder, standardMat } from '../builders/common';
import { makeLegoBoxTexture, makeWoodTexture } from '../builders/textures';
import { buildNxtRobot } from './nxt';
import { buildSpikeRobot } from './spike';

export interface ShelfBuild {
  group: THREE.Group;
  update: (t: number) => void;
}

export function buildDisplayCabinet(): ShelfBuild {
  const g = new THREE.Group();
  const w = 0.9;
  const h = 1.6;
  const d = 0.487;
  const wood = new THREE.MeshStandardMaterial({ map: makeWoodTexture('#b08050'), roughness: 0.55 });
  const glass = new THREE.MeshPhysicalMaterial({
    color: 0xdcecf5,
    roughness: 0.05,
    transparent: true,
    opacity: 0.16,
    side: THREE.DoubleSide,
  });

  // Каркас
  g.add(box(0.02, h, d, wood, -w / 2 + 0.01, h / 2, 0));
  g.add(box(0.02, h, d, wood, w / 2 - 0.01, h / 2, 0));
  g.add(box(w, 0.03, d, wood, 0, h - 0.015, 0));
  g.add(box(w, 0.03, d, wood, 0, 0.06, 0));
  g.add(box(w, h, 0.015, wood, 0, h / 2, -d / 2 + 0.008));
  g.add(box(w, 0.06, d, wood, 0, 0.03, 0)); // цоколь
  // Полиці
  const shelfY = [0.48, 0.9, 1.28];
  for (const y of shelfY) {
    g.add(box(w - 0.04, 0.022, d - 0.03, wood, 0, y, 0));
  }
  // Скляні дверцята з рамками
  for (const s of [-1, 1]) {
    const pane = new THREE.Mesh(new THREE.PlaneGeometry(w / 2 - 0.05, h - 0.15), glass);
    pane.position.set(s * w / 4, h / 2 + 0.02, d / 2 - 0.005);
    g.add(pane);
    g.add(box(0.02, h - 0.13, 0.015, wood, s * 0.02, h / 2 + 0.02, d / 2 - 0.005));
    g.add(cylinder(0.007, 0.05, standardMat(0xc9c9c9, 0.3, 0.8), s * 0.07, h / 2, d / 2 + 0.01, 8));
  }
  g.add(box(w, 0.02, 0.015, wood, 0, h - 0.075, d / 2 - 0.005));

  // Наповнення: нижня секція — контейнери з деталями
  const bin1 = box(0.3, 0.18, 0.35, standardMat(0x3b6fb5, 0.6), -0.22, 0.06 + 0.11, 0);
  const bin2 = box(0.3, 0.18, 0.35, standardMat(0x707880, 0.6), 0.18, 0.06 + 0.11, 0);
  g.add(bin1, bin2);

  // Полиця 1 — робот NXT
  const nxt = buildNxtRobot();
  nxt.scale.setScalar(0.92);
  nxt.position.set(-0.03, 0.492, 0.02);
  nxt.rotation.y = -0.4;
  g.add(nxt);

  // Полиця 2 — робот SPIKE + кубок
  const spike = buildSpikeRobot();
  spike.group.scale.setScalar(0.85);
  spike.group.position.set(-0.12, 0.912, 0);
  spike.group.rotation.y = 0.5;
  g.add(spike.group);
  const goldMat = standardMat(0xd8a417, 0.25, 0.9);
  const trophy = new THREE.Group();
  trophy.add(box(0.09, 0.03, 0.09, standardMat(0x2b2b2b, 0.5), 0, 0.015, 0));
  trophy.add(cylinder(0.012, 0.07, goldMat, 0, 0.065, 0, 10));
  const cup = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.02, 0.07, 14), goldMat);
  cup.position.set(0, 0.135, 0);
  trophy.add(cup);
  trophy.position.set(0.26, 0.912, 0.02);
  g.add(trophy);

  // Верхня полиця — коробки конструкторів
  const makeBox = (kind: 'nxt' | 'spike', x: number, lean: number) => {
    const tex = makeLegoBoxTexture(kind);
    const side = new THREE.MeshStandardMaterial({ color: kind === 'nxt' ? 0xf5f5f2 : 0xf7d117, roughness: 0.7 });
    const front = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.7 });
    const bx = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.26, 0.08), [side, side, side, side, front, side]);
    bx.position.set(x, 1.28 + 0.142, -0.1);
    bx.rotation.x = lean;
    return bx;
  };
  g.add(makeBox('nxt', -0.2, -0.12));
  g.add(makeBox('spike', 0.18, -0.12));

  return { group: g, update: spike.update };
}
