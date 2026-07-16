/**
 * Дані розстановки кабінету інформатики.
 * Джерело: Home.xml із файлу Sweet Home 3D «каб інф.sh3d» (координати перенесено 1:1).
 * Одиниці — сантиметри, кути — радіани за годинниковою стрілкою.
 */
import type { ArenaSpec, CameraPreset, PlacedItem, RoomSpec, WallOpening } from './entities';

/** Межі кімнати підібрані за габаритами меблів з плану (стін у sh3d немає). */
export const ROOM: RoomSpec = {
  minX: 0,
  maxX: 730,
  minY: -290,
  maxY: 495,
  height: 250,
  wallThickness: 12,
};

/** Комп'ютерні столи учнів, 12 шт (з Home.xml: 100×49.1×75.8). */
export const DESK_SIZE = { width: 100, depth: 49.1, height: 75.8 };

export const STUDENT_DESKS: PlacedItem[] = [
  // Північний ряд (кут ≈ 0 — фронт на південь, до центру класу)
  { x: 69.5, y: -196.35, angle: 6.2725163, ...DESK_SIZE },
  { x: 175.5, y: -198.35, angle: 6.2725163, ...DESK_SIZE },
  { x: 283.5, y: -202.35, angle: 6.2725163, ...DESK_SIZE },
  { x: 397.5, y: -204.35, angle: 6.2577324, ...DESK_SIZE },
  // Західна колона (кут ≈ 270° — фронт на схід)
  { x: 27.5, y: 25.649963, angle: 4.726069, ...DESK_SIZE },
  { x: 29.5, y: 137.64996, angle: 4.726069, ...DESK_SIZE },
  { x: 27.5, y: 247.64996, angle: 4.726069, ...DESK_SIZE },
  { x: 27.5, y: 351.64996, angle: 4.7240515, ...DESK_SIZE },
  // Східна колона (кут ≈ 90° — фронт на захід)
  { x: 487.5, y: 43.649963, angle: 1.5509917, ...DESK_SIZE },
  { x: 491.5, y: 157.64996, angle: 1.5509917, ...DESK_SIZE },
  { x: 491.5, y: 269.64996, angle: 1.5509917, ...DESK_SIZE },
  { x: 495.5, y: 377.64996, angle: 1.5509917, ...DESK_SIZE },
];

/** ЖК-монітори (з Home.xml: 44.3×14.8×56.8), elevation — на стільниці. */
export const MONITOR_SIZE = { width: 44.3131, depth: 14.820137, height: 56.8 };

export const MONITORS: PlacedItem[] = [
  // Північний ряд
  { x: 66.70007, y: -196.55005, elevation: 78, angle: 0.015414476, ...MONITOR_SIZE },
  { x: 176.70007, y: -196.55005, elevation: 78, angle: 0.015414476, ...MONITOR_SIZE },
  { x: 282.70007, y: -202.55005, elevation: 78, angle: 0.008710146, ...MONITOR_SIZE },
  { x: 396.70007, y: -202.55005, elevation: 78, angle: 0.015414476, ...MONITOR_SIZE },
  // Західна колона
  { x: 30.700035, y: 17.449951, elevation: 78, angle: 4.717838, ...MONITOR_SIZE },
  { x: 30.700035, y: 123.44995, elevation: 78, angle: 4.717838, ...MONITOR_SIZE },
  { x: 30.700035, y: 241.44995, elevation: 78, angle: 4.717838, ...MONITOR_SIZE },
  { x: 30.700035, y: 341.44995, elevation: 78, angle: 4.717838, ...MONITOR_SIZE },
  // Східна колона
  { x: 490.70007, y: 45.44995, elevation: 78, angle: 1.6009792, ...MONITOR_SIZE },
  { x: 494.70007, y: 155.44995, elevation: 78, angle: 1.6009792, ...MONITOR_SIZE },
  { x: 498.70007, y: 265.44995, elevation: 78, angle: 1.6009792, ...MONITOR_SIZE },
  { x: 500.70004, y: 375.44995, elevation: 78, angle: 1.6009792, ...MONITOR_SIZE },
  // Монітор учителя (екран повернуто до вчителя, на північ)
  { x: 654.7001, y: -76.55005, elevation: 72, angle: 3.1531472, ...MONITOR_SIZE },
];

/** Зона вчителя (північно-східний кут). */
export const TEACHER_DESK: PlacedItem = {
  x: 644.3, y: -106.30005, angle: 3.1330774, width: 169.59998, depth: 93.19995, height: 72.7,
};
export const TEACHER_CHAIR: PlacedItem = {
  x: 644.81, y: -148.06494, angle: 0.043922365, width: 43.5, depth: 36.9, height: 87.34,
};
/** Книжкова шафа → шафа-вітрина з роботами. */
export const DISPLAY_CABINET: PlacedItem = {
  x: 680.5, y: -258.52722, angle: 6.2127256, width: 90, depth: 48.74561, height: 160,
};

/** Фронт класу (південна стіна). */
export const CHALKBOARD: PlacedItem = {
  x: 354.30887, y: 481.34998, elevation: 58, angle: 3.152797, width: 181.39128, depth: 6, height: 72,
};
export const INTERACTIVE_PANEL: PlacedItem = {
  x: 156.55884, y: 451.69995, angle: 3.1403823, width: 122.5, depth: 49.2, height: 125.7,
};
export const FRONT_CABINET: PlacedItem = {
  x: 344.30884, y: 399.09998, angle: 0, width: 86, depth: 44, height: 74,
};
export const FRONT_CHAIR: PlacedItem = {
  x: 347.81, y: 452.93506, angle: 3.1542614, width: 36.6, depth: 27.5, height: 87.34,
};

/** Техніка. */
export const NETWORK_SWITCH: PlacedItem = {
  x: 502.35883, y: -247.50003, elevation: 62, angle: 0, width: 30.1, depth: 18.8, height: 8.5,
};
/** Зарядна станція Bluetti (біля зони вчителя). */
export const POWER_STATION: PlacedItem = {
  x: 586.1088, y: -242.00003, angle: 0, width: 45.6, depth: 49.8, height: 18.1,
};
/** Другий такий самий блок (ДБЖ) біля західного ряду. */
export const UPS_UNIT: PlacedItem = {
  x: 22.8, y: 24.9, angle: 0, width: 45.6, depth: 49.8, height: 18.1,
};

/** Вікна — 3 шт на західній стіні (x = minX); center — координата по осі Y. */
export const WEST_WINDOWS: WallOpening[] = [
  { center: 50, width: 150, sill: 85, height: 145 },
  { center: 200, width: 150, sill: 85, height: 145 },
  { center: 350, width: 150, sill: 85, height: 145 },
];

/** Двері — на південній стіні (y = maxY), у вільній ділянці; center — по осі X. */
export const SOUTH_DOOR: WallOpening = { center: 555, width: 100, sill: 0, height: 205 };

/** Арена робота — вільний центр кімнати. */
export const ARENA: ArenaSpec = { x: 265, y: 130, size: 200 };

/** Стельові LED-панелі 60×60, сітка 3×3 (координати центрів, см). */
export const CEILING_LIGHTS: Array<{ x: number; y: number }> = [
  { x: 120, y: -160 }, { x: 365, y: -160 }, { x: 610, y: -160 },
  { x: 120, y: 100 }, { x: 365, y: 100 }, { x: 610, y: 100 },
  { x: 120, y: 360 }, { x: 365, y: 360 }, { x: 610, y: 360 },
];

/** Пресети камер (метри світу three.js: x=x/100, y=висота, z=y/100). */
export const CAMERA_PRESETS: CameraPreset[] = [
  {
    id: 'overview',
    label: 'Загальний вид',
    position: [11.2, 6.8, 9.6],
    target: [3.65, 0.4, 1.0],
  },
  {
    id: 'arena',
    label: 'Арена роботів',
    position: [3.9, 1.5, 3.2],
    target: [2.65, 0.1, 1.3],
  },
  {
    id: 'board',
    label: 'Дошка',
    position: [2.6, 1.5, 2.4],
    target: [2.6, 1.1, 4.9],
  },
  {
    id: 'teacher',
    label: 'Стіл учителя',
    position: [4.3, 1.9, 0.6],
    target: [6.45, 0.8, -1.1],
  },
  {
    id: 'shelf',
    label: 'Вітрина роботів',
    position: [5.3, 1.5, -0.9],
    target: [6.8, 1.0, -2.6],
  },
];

export const SCENE_TITLE = 'STEM-кабінет інформатики';
