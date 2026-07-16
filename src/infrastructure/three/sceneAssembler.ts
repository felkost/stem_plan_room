/**
 * Збирання повної сцени кабінету: кімната, меблі за координатами плану,
 * роботи та арена. Повертає групи стін/стелі для приховування з боку камери
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
  STUDENT_DESKS,
  TEACHER_CHAIR,
  TEACHER_DESK,
  UPS_UNIT,
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

  // Учнівські столи та монітори
  for (const desk of STUDENT_DESKS) {
    const mesh = buildStudentDesk();
    placeItem(mesh, desk);
    enableShadows(mesh);
    scene.add(mesh);
    // стілець перед кожним столом (з боку фронту стола, трохи відсунутий)
    const chair = buildOfficeChair(0x4a5d54);
    const a = -(desk.angle ?? 0);
    const offset = 0.62;
    chair.position.set(
      cm(desk.x) + Math.sin(a) * offset,
      0,
      cm(desk.y) + Math.cos(a) * offset,
    );
    chair.rotation.y = a + Math.PI + (Math.random() - 0.5) * 0.5;
    enableShadows(chair);
    scene.add(chair);
  }
  for (const monitor of MONITORS) {
    const mesh = buildMonitor();
    placeItem(mesh, monitor, 0.012);
    enableShadows(mesh);
    scene.add(mesh);
  }

  // Зона вчителя
  const teacherDesk = buildTeacherDesk();
  placeItem(teacherDesk, TEACHER_DESK);
  enableShadows(teacherDesk);
  scene.add(teacherDesk);
  const teacherChair = buildOfficeChair(0x5a2d2d);
  placeItem(teacherChair, TEACHER_CHAIR);
  enableShadows(teacherChair);
  scene.add(teacherChair);

  // Вітрина з роботами
  const cabinet = buildDisplayCabinet();
  placeItem(cabinet.group, DISPLAY_CABINET);
  enableShadows(cabinet.group);
  scene.add(cabinet.group);
  updatables.push((_dt, t) => cabinet.update(t));

  // Фронт класу
  const chalkboard = buildChalkboard();
  placeItem(chalkboard, CHALKBOARD);
  scene.add(chalkboard);
  const panel = buildInteractivePanel();
  placeItem(panel, INTERACTIVE_PANEL);
  enableShadows(panel);
  scene.add(panel);
  const frontCabinet = buildLowCabinet();
  placeItem(frontCabinet, FRONT_CABINET);
  enableShadows(frontCabinet);
  scene.add(frontCabinet);
  // Демонстраційний NXT на тумбі біля дошки
  const demoNxt = buildNxtRobot();
  demoNxt.position.set(cm(FRONT_CABINET.x), 0.74, cm(FRONT_CABINET.y));
  demoNxt.rotation.y = -2.6;
  enableShadows(demoNxt);
  scene.add(demoNxt);
  const frontChair = buildOfficeChair();
  placeItem(frontChair, FRONT_CHAIR);
  enableShadows(frontChair);
  scene.add(frontChair);

  // Техніка
  const rack = buildSwitchRack();
  placeItem(rack, NETWORK_SWITCH);
  rack.position.y = 0; // елевація 62 см з плану — це верх стійки; сама стійка стоїть на підлозі
  enableShadows(rack);
  scene.add(rack);
  const powerStation = buildPowerStation();
  placeItem(powerStation, POWER_STATION);
  enableShadows(powerStation);
  scene.add(powerStation);
  const ups = buildPowerStation();
  placeItem(ups, UPS_UNIT);
  enableShadows(ups);
  scene.add(ups);

  // Арена з анімованим роботом
  const arena = buildArena();
  arena.group.position.set(cm(ARENA.x), 0, cm(ARENA.y));
  enableShadows(arena.group);
  scene.add(arena.group);
  updatables.push(arena.update);

  return { room, sun, updatables };
}
