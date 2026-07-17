/**
 * Збирання повної сцени кабінету: кімната, меблі за координатами плану,
 * роботи та арена. Повертає набори стін/стелю для dollhouse-приховування
 * та список функцій оновлення для анімації.
 */
import * as THREE from 'three';
import {
  CHALKBOARD,
  DISPLAY_CABINET,
  FRONT_CABINET,
  FRONT_CHAIR,
  INTERACTIVE_PANEL,
  MONITORS,
  NETWORK_SWITCH,
  POD_CHAIRS,
  POD_DESKS,
  POWER_STATION,
  STUDENT_CHAIRS,
  STUDENT_DESKS,
  TEACHER_CHAIR,
  TEACHER_DESK,
  TEACHER_MONITOR,
  TRAINING_TABLE,
} from '../../domain/classroomLayout';
import { cm, enableShadows, placeItem } from './builders/common';
import {
  buildChalkboard,
  buildInteractivePanel,
  buildLowCabinet,
  buildMonitor,
  buildOfficeChair,
  buildPodDesk,
  buildPowerStation,
  buildStudentDesk,
  buildSwitchRack,
  buildTeacherDesk,
} from './builders/furniture';

/** Тепле бежеве крісло острівців — за формою офісне (як усюди), гармонує
 *  зі світлим дубом стільниць (за референсом користувача). */
const POD_CHAIR_COLOR = 0xd8c6a1;
import { buildLighting } from './builders/lighting';
import { buildRoom, type RoomBuild } from './builders/room';
import { buildNxtRobot } from './robots/nxt';
import { buildDisplayCabinet } from './robots/shelf';
import { buildTrainingField } from './robots/trainingField';

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
    const chair = buildOfficeChair(0xb3b3b0);
    placeItem(chair, chairSpec);
    enableShadows(chair);
    scene.add(chair);
  }

  // Острівці групових столів у центрі кабінету (нові об'єкти поза планом)
  for (const deskSpec of POD_DESKS) {
    const desk = buildPodDesk();
    placeItem(desk, deskSpec);
    enableShadows(desk);
    scene.add(desk);
  }
  for (const chairSpec of POD_CHAIRS) {
    const chair = buildOfficeChair(POD_CHAIR_COLOR);
    placeItem(chair, chairSpec);
    enableShadows(chair);
    scene.add(chair);
  }

  // Зона вчителя (ніша на північному сході)
  const teacherDesk = buildTeacherDesk();
  placeItem(teacherDesk, TEACHER_DESK);
  enableShadows(teacherDesk);
  scene.add(teacherDesk);
  const teacherChair = buildOfficeChair(0x8f8f8c);
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

  // Тренувальний стіл із бортиками: робот NXT їде по лінії
  const field = buildTrainingField();
  placeItem(field.group, TRAINING_TABLE);
  enableShadows(field.group);
  scene.add(field.group);
  updatables.push(field.update);

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

  return { room, sun, updatables };
}
