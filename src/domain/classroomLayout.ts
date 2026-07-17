/**
 * Дані розстановки кабінету інформатики — БАЗОВЕ розташування.
 * Джерело: Home.xml із файлу Sweet Home 3D «каб інф.sh3d» (оновлено 2026-07-17,
 * координати перенесено 1:1). Одиниці — сантиметри, кути — радіани за
 * годинниковою стрілкою (0 = фронт на південь, +y).
 *
 * Орієнтація кімнати: фронт класу (дошка, інтерактивна панель) — північна стіна
 * (y = minY); двері — західна стіна; вікна — східні стіни; зона вчителя —
 * північно-східна ніша (alcove), відкрита в основну зону.
 */
import type { ArenaSpec, CameraPreset, PlacedItem, RoomSpec, WallOpening } from './entities';

/**
 * Межі Г-подібної кімнати за стінами з плану (внутрішні грані, округлено):
 * основна зона + ніша вчителя на північному сході.
 */
export const ROOM: RoomSpec = {
  minX: -35,
  maxX: 565,
  minY: -295,
  maxY: 521,
  alcove: { minX: 565, maxX: 791, minY: -295, maxY: -47 },
  height: 250,
  wallThickness: 7.5,
};

/** Комп'ютерні столи учнів, 13 шт (з Home.xml: 100×49.1×75.8). */
export const DESK_SIZE = { width: 100, depth: 49.099976, height: 75.8 };

export const STUDENT_DESKS: PlacedItem[] = [
  // Західна колона, 5 шт (кут ≈ 270° — фронт на схід, до центру класу)
  { x: 9.5, y: -32.350037, angle: 4.726069, ...DESK_SIZE },
  { x: 9.5, y: 73.64996, angle: 4.726069, ...DESK_SIZE },
  { x: 13.5, y: 167.64996, angle: 4.726069, ...DESK_SIZE },
  { x: 13.5, y: 271.64996, angle: 4.7240515, ...DESK_SIZE },
  { x: 15.5, y: 379.64996, angle: 4.7240515, ...DESK_SIZE },
  // Східна колона, 4 шт (кут ≈ 90° — фронт на захід)
  { x: 487.5, y: 43.649963, angle: 1.5509917, ...DESK_SIZE },
  { x: 491.5, y: 157.64996, angle: 1.5509917, ...DESK_SIZE },
  { x: 491.5, y: 269.64996, angle: 1.5509917, ...DESK_SIZE },
  { x: 495.5, y: 377.64996, angle: 1.5509917, ...DESK_SIZE },
  // Південний ряд, 4 шт (кут ≈ 0° — фронт на північ... фронт стола до стіни, учень обличчям на північ)
  { x: 101.50006, y: 481.64996, angle: 0.00476044, ...DESK_SIZE },
  { x: 207.50006, y: 485.64996, angle: 0.019340213, ...DESK_SIZE },
  { x: 307.50006, y: 487.64996, angle: 0.022281345, ...DESK_SIZE },
  { x: 413.50006, y: 487.64996, angle: 0.013842281, ...DESK_SIZE },
];

/** ЖК-монітори учнів, 13 шт (з Home.xml: 44.3×14.8×56.8), elevation — на стільниці. */
export const MONITOR_SIZE = { width: 44.3131, depth: 14.820137, height: 56.8 };

export const MONITORS: PlacedItem[] = [
  // Західна колона (екран на схід)
  { x: 12.700035, y: -40.55005, elevation: 78, angle: 4.717838, ...MONITOR_SIZE },
  { x: 14.700035, y: 57.44995, elevation: 78, angle: 4.717838, ...MONITOR_SIZE },
  { x: 16.700035, y: 161.44995, elevation: 78, angle: 4.717838, ...MONITOR_SIZE },
  { x: 14.700035, y: 267.44995, elevation: 78, angle: 4.717838, ...MONITOR_SIZE },
  { x: 18.700035, y: 369.44995, elevation: 78, angle: 4.717838, ...MONITOR_SIZE },
  // Східна колона (екран на захід)
  { x: 490.70007, y: 45.44995, elevation: 78, angle: 1.6009792, ...MONITOR_SIZE },
  { x: 494.70007, y: 155.44995, elevation: 78, angle: 1.6009792, ...MONITOR_SIZE },
  { x: 498.70007, y: 265.44995, elevation: 78, angle: 1.6009792, ...MONITOR_SIZE },
  { x: 500.70004, y: 375.44995, elevation: 78, angle: 1.6009792, ...MONITOR_SIZE },
  // Південний ряд (екран на північ)
  { x: 98.70001, y: 481.44995, elevation: 78, angle: 0.015414476, ...MONITOR_SIZE },
  { x: 208.70001, y: 481.44995, elevation: 78, angle: 0.015414476, ...MONITOR_SIZE },
  { x: 312.7, y: 487.44995, elevation: 78, angle: 0.008710146, ...MONITOR_SIZE },
  { x: 412.7, y: 489.44995, elevation: 78, angle: 0.015414476, ...MONITOR_SIZE },
];

/** Офісні крісла учнів, 13 шт (з Home.xml: chair2, 34×34.8×90.2) — явні позиції з плану. */
export const CHAIR_SIZE = { width: 34.01158, depth: 34.797436, height: 90.2 };

export const STUDENT_CHAIRS: PlacedItem[] = [
  // Західна колона (обличчям на захід, до столів)
  { x: 56.725204, y: -30.450026, angle: 1.5665131, ...CHAIR_SIZE },
  { x: 62.725204, y: 79.54997, angle: 1.5665131, ...CHAIR_SIZE },
  { x: 66.725204, y: 171.54997, angle: 1.5665131, ...CHAIR_SIZE },
  { x: 68.725204, y: 273.55, angle: 1.5665131, ...CHAIR_SIZE },
  { x: 70.725204, y: 369.55, angle: 1.5665131, ...CHAIR_SIZE },
  // Східна колона (обличчям на схід)
  { x: 426.72522, y: 55.549988, angle: 4.631262, ...CHAIR_SIZE },
  { x: 434.72522, y: 153.54999, angle: 4.631262, ...CHAIR_SIZE },
  { x: 442.72522, y: 273.55, angle: 4.631262, ...CHAIR_SIZE },
  { x: 444.72522, y: 371.55, angle: 4.631262, ...CHAIR_SIZE },
  // Південний ряд (обличчям на південь)
  { x: 100.725204, y: 431.55, angle: 0.030537128, ...CHAIR_SIZE },
  { x: 208.7252, y: 433.55, angle: 0.030537128, ...CHAIR_SIZE },
  { x: 306.72522, y: 439.55, angle: 0.030537128, ...CHAIR_SIZE },
  { x: 396.72522, y: 437.55, angle: 0.030537128, ...CHAIR_SIZE },
];

/** Зона вчителя (ніша на північному сході). */
export const TEACHER_DESK: PlacedItem = {
  x: 644.3, y: -106.30005, angle: 3.1330774, width: 169.59998, depth: 93.19995, height: 72.7,
};
export const TEACHER_CHAIR: PlacedItem = {
  x: 644.81, y: -148.06494, angle: 0.043922365, width: 43.48799, depth: 36.911125, height: 87.34,
};
export const TEACHER_MONITOR: PlacedItem = {
  x: 654.7001, y: -76.55005, elevation: 72, angle: 3.1531472, ...MONITOR_SIZE,
};
/** Книжкова шафа з плану → шафа-вітрина з роботами (біля північної стіни ніші). */
export const DISPLAY_CABINET: PlacedItem = {
  x: 638.50006, y: -272.52722, angle: 6.2785225, width: 162.01907, depth: 40.919327, height: 160,
};

/** Фронт класу (північна стіна). */
export const CHALKBOARD: PlacedItem = {
  x: 340.30896, y: -292.5, elevation: 88, angle: 3.1392953, width: 289.3172, depth: 6, height: 104,
};
/** «Телевизор» із плану — інтерактивна дошка на стійці. */
export const INTERACTIVE_PANEL: PlacedItem = {
  x: 88.558846, y: -249.3001, angle: 6.278861, width: 158.50237, depth: 47.243576, height: 175.7,
};
/** «Slim Office» — тумба біля дошки. */
export const FRONT_CABINET: PlacedItem = {
  x: 350.30884, y: -200.90002, angle: 3.146105, width: 109.99977, depth: 43.89169, height: 74,
};
export const FRONT_CHAIR: PlacedItem = {
  x: 355.81, y: -239.06494, angle: 6.275379, width: 36.59112, depth: 27.507225, height: 87.34,
};

/** Червоний робочий стіл для збирання роботів (біля східної стіни). */
export const WORK_TABLE: PlacedItem = {
  x: 498.77527, y: -103.90001, angle: 3.135993, width: 93.45411, depth: 93.61793, height: 72,
};

/** Техніка у ніші вчителя. */
export const NETWORK_SWITCH: PlacedItem = {
  x: 772.3588, y: -65.50003, elevation: 62, angle: 0, width: 30.099976, depth: 18.800003, height: 8.5,
};
/** Зарядна станція Bluetti (північно-східний кут ніші). */
export const POWER_STATION: PlacedItem = {
  x: 754.1088, y: -270.00003, angle: 0, width: 45.6, depth: 49.8, height: 18.1,
};

/** Вікна основної зони — 2 шт на східній стіні (x = maxX); center — по осі Y. */
export const EAST_WINDOWS: WallOpening[] = [
  { center: 120.2264, width: 170.26321, sill: 69, height: 154 },
  { center: 396.2264, width: 170.26321, sill: 69, height: 154 },
];

/** Вікно ніші — на східній стіні ніші (x = alcove.maxX); center — по осі Y. */
export const ALCOVE_WINDOWS: WallOpening[] = [
  { center: -181.77359, width: 170.26321, sill: 69, height: 154 },
];

/** Двері — на західній стіні (x = minX); center — по осі Y. */
export const WEST_DOOR: WallOpening = { center: -148.05002, width: 89.6, sill: 0, height: 212.1 };

/** Тренувальне поле для роботів — вільний центр кімнати (мітка на плані). */
export const ARENA: ArenaSpec = { x: 300, y: 40, size: 200 };

/** Стельові LED-панелі 60×60: сітка 3×3 в основній зоні + 2 у ніші (центри, см). */
export const CEILING_LIGHTS: Array<{ x: number; y: number }> = [
  { x: 65, y: -159 }, { x: 265, y: -159 }, { x: 465, y: -159 },
  { x: 65, y: 113 }, { x: 265, y: 113 }, { x: 465, y: 113 },
  { x: 65, y: 385 }, { x: 265, y: 385 }, { x: 465, y: 385 },
  { x: 678, y: -233 }, { x: 678, y: -109 },
];

/** Пресети камер (метри світу three.js: x=x/100, y=висота, z=y/100). */
export const CAMERA_PRESETS: CameraPreset[] = [
  {
    id: 'overview',
    label: 'Загальний вид',
    position: [9.8, 6.6, 10.2],
    target: [2.7, 0.3, 0.5],
  },
  {
    id: 'arena',
    label: 'Тренувальне поле',
    position: [3.0, 1.7, 2.9],
    target: [3.0, 0.1, 0.4],
  },
  {
    id: 'board',
    label: 'Дошка',
    position: [2.2, 1.5, 0.6],
    target: [2.2, 1.2, -2.9],
  },
  {
    id: 'teacher',
    label: 'Стіл учителя',
    position: [4.1, 1.8, -1.7],
    target: [6.44, 0.75, -1.06],
  },
  {
    id: 'shelf',
    label: 'Вітрина роботів',
    position: [6.3, 1.6, -0.8],
    target: [6.39, 1.0, -2.73],
  },
];

export const SCENE_TITLE = 'STEM-кабінет інформатики';
