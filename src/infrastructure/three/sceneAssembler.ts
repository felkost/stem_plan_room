/**
 * Збирання повної сцени кабінету: кімната, меблі за координатами плану,
 * роботи та арена. Повертає набори стін/стелю для dollhouse-приховування
 * та список функцій оновлення для анімації.
 */
import * as THREE from 'three';
import {
  ARENA,
  CHALKBOARD,
  DISPLAY_CABINET,
  FRONT_CABINET,
  FRONT_CHAIR,
  INTERACTIVE_PANEL,
  MONITORS,
  NETWORK_SWITCH,
  POWER_STATION,
  STUDENT_CHAIRS,
  STUDENT_DESKS,
  TEACHER_CHAIR,
  TEACHER_DESK,
  TEACHER_MONITOR,
  WORK_TABLE,
} from '../../domain/classroomLayout';
import { cm, enableShadows, placeItem } from './builders/common';
import {
  buildChalkboard,
  buildInteractivePanel,
  buildLowCabinet,
  buildMonitor,
  buildOfficeChair,
  buildPowerStation,
  buildStudentDesk,
  buildSwitchRack,
  buildTeacherDesk,
  buildWorkTable,
} from './builders/furniture';
import { buildLighting } from './builders/lighting';
import { buildRoom, type RoomBuild } from './builders/room';
import { buildArena } from './robots/arena';
import { buildNxtRobot } from './robots/nxt';
import { buildDisplayCabinet } from './robots/shelf';

export interface AssembledScene {
  room: RoomBuild;
  sun: THREE.DirectionalLight;
  updatables: Array<(dt: number, t: number) => void>;
}

export function assembleClassroom(scene: THREE.Scene): AssembledScene {
  const updatables: Array<(dt: number, t: number) => void> = [];

  const room = buildRoom();
  scene.add(room.group);
  const { sun } = buildLighting(scene);

  // Учнівські столи, монітори та крісла — за координатами плану
  for (const desk of STUDENT_DESKS) {
    const mesh = buildStudentDesk();
    placeItem(mesh, desk);
    enableShadows(mesh);
    scene.add(mesh);
  }
  for (const monitor of MONITORS) {
    const mesh = buildMonitor();
    placeItem(mesh, monitor, 0.012);
    enableShadows(mesh);
    scene.add(mesh);
  }
  for (const chairSpec of STUDENT_CHAIRS) {
    const chair = buildOfficeChair(0x4a5d54);
    placeItem(chair, chairSpec);
    enableShadows(chair);
    scene.add(chair);
  }

  // Зона вчителя (ніша на північному сході)
  const teacherDesk = buildTeacherDesk();
  placeItem(teacherDesk, TEACHER_DESK);
  enableShadows(teacherDesk);
  scene.add(teacherDesk);
  const teacherChair = buildOfficeChair(0x5a2d2d);
  placeItem(teacherChair, TEACHER_CHAIR);
  enableShadows(teacherChair);
  scene.add(teacherChair);
  const teacherMonitor = buildMonitor();
  placeItem(teacherMonitor, TEACHER_MONITOR, 0.012);
  enableShadows(teacherMonitor);
  scene.add(teacherMonitor);

  // Вітрина з роботами (на місці книжкової шафи біля північної стіни ніші)
  const cabinet = buildDisplayCabinet();
  placeItem(cabinet.group, DISPLAY_CABINET);
  enableShadows(cabinet.group);
  scene.add(cabinet.group);
  updatables.push((_dt, t) => cabinet.update(t));

  // Фронт класу (північна стіна)
  const chalkboard = buildChalkboard(cm(CHALKBOARD.width), cm(CHALKBOARD.height));
  placeItem(chalkboard, CHALKBOARD);
  // модель «дзеркала» у sh3d має фронт у -y, тож розвертаємо на π до класу
  chalkboard.rotation.y += Math.PI;
  scene.add(chalkboard);
  const panel = buildInteractivePanel();
  placeItem(panel, INTERACTIVE_PANEL);
  enableShadows(panel);
  scene.add(panel);
  const frontCabinet = buildLowCabinet(cm(FRONT_CABINET.width), cm(FRONT_CABINET.height), cm(FRONT_CABINET.depth));
  placeItem(frontCabinet, FRONT_CABINET);
  enableShadows(frontCabinet);
  scene.add(frontCabinet);
  // Демонстраційний NXT на тумбі біля дошки
  const demoNxt = buildNxtRobot();
  demoNxt.position.set(cm(FRONT_CABINET.x), cm(FRONT_CABINET.height), cm(FRONT_CABINET.y));
  demoNxt.rotation.y = -0.6;
  enableShadows(demoNxt);
  scene.add(demoNxt);
  const frontChair = buildOfficeChair();
  placeItem(frontChair, FRONT_CHAIR);
  enableShadows(frontChair);
  scene.add(frontChair);

  // Червоний робочий стіл для збирання роботів (біля східної стіни)
  const workTable = buildWorkTable();
  placeItem(workTable, WORK_TABLE);
  enableShadows(workTable);
  scene.add(workTable);

  // Техніка у ніші вчителя
  const rack = buildSwitchRack();
  placeItem(rack, NETWORK_SWITCH);
  rack.position.y = 0; // елевація 62 см з плану — це верх стійки; сама стійка стоїть на підлозі
  enableShadows(rack);
  scene.add(rack);
  const powerStation = buildPowerStation();
  placeItem(powerStation, POWER_STATION);
  enableShadows(powerStation);
  scene.add(powerStation);

  // Тренувальне поле з анімованим роботом (вільний центр класу)
  const arena = buildArena();
  arena.group.position.set(cm(ARENA.x), 0, cm(ARENA.y));
  enableShadows(arena.group);
  scene.add(arena.group);
  updatables.push(arena.update);

  return { room, sun, updatables };
}
