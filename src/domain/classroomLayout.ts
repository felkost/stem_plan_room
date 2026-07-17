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
import type { CameraPreset, PlacedItem, RoomSpec, WallOpening } from './entities';

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
  // Південний ряд — розвернуто на 180° відносно плану: екрани до класу (на північ)
  { x: 98.70001, y: 481.44995, elevation: 78, angle: 0.015414476 + Math.PI, ...MONITOR_SIZE },
  { x: 208.70001, y: 481.44995, elevation: 78, angle: 0.015414476 + Math.PI, ...MONITOR_SIZE },
  { x: 312.7, y: 487.44995, elevation: 78, angle: 0.008710146 + Math.PI, ...MONITOR_SIZE },
  { x: 412.7, y: 489.44995, elevation: 78, angle: 0.015414476 + Math.PI, ...MONITOR_SIZE },
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

/**
 * Острівці групових столів у центрі кабінету (нові, поза sh3d-планом,
 * редизайн 2026-07): 2 острівці по 6 клиноподібних («пелюстка») столів
 * навколо спільного центру + 6 крісел кожен, за референсом користувача.
 * Столи НЕ з'єднані фізично одне з одним (лише розташуванням у групу) —
 * динамічні кластери, стіл чи крісло можна пересунути окремо пізніше.
 *
 * Симетрія: обидва острівці центровано по x = 265 см (середина між
 * західною x=−35 та східною x=565 стінами основної зони). Рознесення по
 * y — з запасом до дошки/зони вчителя на півночі (найближчий об'єкт плану
 * там — тумба біля дошки, y=−201) і до південного ряду учнівських крісел
 * (y≈414) та бічних колон крісел (x≈88 і x≈409) — лишає учням місце
 * підсунути крісло до свого комп'ютерного стола.
 */
export const POD_DESK_SIZE = { width: 38, depth: 35, height: 74 };

/** Радіус центру стола (см) від центру острівця — консервативний footprint
 *  для колізій; візуальна зовнішня кромка столу ширша (див. buildPodDesk). */
const POD_DESK_RADIUS = 45;
/** Радіус центру крісла (см) від центру острівця. */
const POD_CHAIR_RADIUS = 83;
/** Спільна вісь симетрії острівців (середина основної зони по x). */
const POD_ISLAND_X = 265;

/** Один острівець: 6 столів + 6 крісел по колу навколо (cx, cy). */
function podIsland(cx: number, cy: number): { desks: PlacedItem[]; chairs: PlacedItem[] } {
  const desks: PlacedItem[] = [];
  const chairs: PlacedItem[] = [];
  for (let i = 0; i < 6; i++) {
    const a = (i * Math.PI) / 3; // 60° крок
    const dx = -Math.sin(a);
    const dy = Math.cos(a);
    // стіл фронтом (широкою зовнішньою кромкою) назовні — кут = напрямок від центру
    desks.push({ x: cx + POD_DESK_RADIUS * dx, y: cy + POD_DESK_RADIUS * dy, angle: a, ...POD_DESK_SIZE });
    // крісло зовні, обличчям усередину (до стола) — кут + 180°
    chairs.push({
      x: cx + POD_CHAIR_RADIUS * dx,
      y: cy + POD_CHAIR_RADIUS * dy,
      angle: a + Math.PI,
      ...CHAIR_SIZE,
    });
  }
  return { desks, chairs };
}

const POD_ISLAND_NORTH = podIsland(POD_ISLAND_X, -30);
const POD_ISLAND_SOUTH = podIsland(POD_ISLAND_X, 230);

export const POD_DESKS: PlacedItem[] = [...POD_ISLAND_NORTH.desks, ...POD_ISLAND_SOUTH.desks];
export const POD_CHAIRS: PlacedItem[] = [...POD_ISLAND_NORTH.chairs, ...POD_ISLAND_SOUTH.chairs];

/**
 * Тренувальний стіл для роботів («Стол» із плану, мітка «Тренувальне поле
 * для роботів»): біле поле з бортиками, на якому їздить робот NXT.
 */
export const TRAINING_TABLE: PlacedItem = {
  x: 498.77527, y: -103.90001, angle: 3.135993, width: 93.45411, depth: 93.61793, height: 72,
};

/**
 * Стійка з комутатором — перенесена з ніші вчителя (редизайн 2026-07) у куток
 * між південною стіною (протилежною до дошки) та західною (протилежною до
 * вікон); фронт — на північ, до класу.
 */
export const NETWORK_SWITCH: PlacedItem = {
  x: -15, y: 509, elevation: 62, angle: Math.PI, width: 30.099976, depth: 18.800003, height: 8.5,
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

/**
 * Настінні об'єкти редизайну 2026-07 (нові, поза sh3d-планом).
 *
 * Композиція південної стіни (протилежної до дошки) — за золотим перерізом:
 * довжина стіни 600 см (−35…565), лінія перерізу x = −35 + 600·0.382 ≈ 194.2.
 * Мінорна зона (захід) — стенд у своєму центрі (x ≈ 79.6); мажорна зона
 * (схід) — типографічний декор у своєму центрі (x ≈ 379.6); годинник — точно
 * на лінії перерізу. Пропорції стенда й декору ≈ φ (1.618).
 */

/** Кондиціонер на простінку між двома вікнами східної стіни (центр простінка
 *  y ≈ 258.2); зазор до стелі 17 см ≈ висота блока / φ. Фронт — на захід. */
export const AIR_CONDITIONER: PlacedItem = {
  x: 555.4, y: 258.2, elevation: 206, angle: Math.PI / 2, width: 75, depth: 19.5, height: 27,
};

/** Стенд для матеріалів (типу білої дошки з пришпиленими аркушами);
 *  співвідношення сторін 150/93 ≈ φ. Фронт — на північ, до класу. */
export const PIN_BOARD: PlacedItem = {
  x: 79.6, y: 518.5, elevation: 139.5, angle: Math.PI, width: 150, depth: 4, height: 93,
};

/** Декоративний типографічний «ворд-клауд» (фарбою по стіні, за референсом);
 *  230/142 ≈ φ; низ частково ховається за моніторами південного ряду. */
export const WALL_DECOR: PlacedItem = {
  x: 379.6, y: 520, elevation: 100, angle: Math.PI, width: 230, depth: 1, height: 142,
};

/** Годинник — перенесено з північної стіни (з дошкою) на південну;
 *  центр на золотій лінії стіни, висота центру 212 см (як була). */
export const WALL_CLOCK: PlacedItem = {
  x: 194.2, y: 518.5, elevation: 195, angle: Math.PI, width: 34, depth: 4.5, height: 34,
};

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
    // Інтер'єрний ракурс: камера всередині кімнати (нижче стелі), тож у кадрі
    // одночасно підлога, стіни й стеля. Ціль — ГЕОМЕТРИЧНИЙ ЦЕНТР кімнати
    // (2.65, 1.13 — рівновіддалено від усіх стін), а не точка біля кута/стіни:
    // OrbitControls обертає камеру навколо target, тож центральний pivot не
    // «виносить» кімнату за межі екрана при вільному обертанні мишею.
    // Дистанція (2.4 м) свідомо менша за половину найвужчого виміру кімнати
    // (3.0 м по осі x) — під час обертання на 360° камера лишається
    // всередині приміщення на будь-якому азимуті, не проходить крізь стіни.
    // Кут показує південно-східний бік: ворд-клауд, годинник, стенд,
    // кондиціонер між вікнами, обидва острівці групових столів.
    id: 'overview',
    label: 'Загальний вид',
    position: [1.45, 1.75, -0.95],
    target: [2.65, 1.1, 1.13],
  },
  {
    id: 'arena',
    label: 'Тренувальне поле',
    position: [4.99, 1.8, 0.6],
    target: [4.99, 0.78, -1.04],
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
