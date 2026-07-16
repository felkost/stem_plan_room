/**
 * Параметри роботів LEGO (кольори та габарити) — чисті дані domain-шару.
 * Розміри у метрах (роботи трохи збільшені відносно реальних для виразності сцени).
 */

export const SPIKE_COLORS = {
  hub: 0xf7d117, // жовтий хаб SPIKE Prime
  hubFace: 0xfafafa,
  motor: 0x57c5e8, // блакитні (azure) середні мотори
  frame: 0xd9d9d9, // світло-сірі балки/плити
  wheelTire: 0x1c1c1c,
  wheelHub: 0xbfbfbf,
  sensor: 0x2b2b2b,
  cable: 0x2f2f2f,
  ledOn: '#ff2ea6',
  ledOff: '#3a1030',
} as const;

export const NXT_COLORS = {
  body: 0xe8e6e0, // біло-сірий корпус блока NXT
  facePlate: 0x8f9499,
  screenBg: '#9fb28a', // монохромний ЖК із зеленуватим підсвічуванням
  screenFg: '#22301c',
  enterButton: 0xf58220, // помаранчева кнопка
  arrowButtons: 0xb8bcc0,
  motor: 0xd8d6d0,
  wheelTire: 0x202020,
  wheelHub: 0xd9d9d9,
  sensor: 0x3a3f44,
} as const;

/** Габарити їздового робота SPIKE Prime (driving base), м. */
export const SPIKE_BASE = {
  length: 0.26,
  width: 0.19,
  wheelRadius: 0.044,
  /** Лінійна швидкість руху по трасі, м/с */
  speed: 0.22,
} as const;

/** Габарити робота NXT (tribot), м. */
export const NXT_BASE = {
  length: 0.24,
  width: 0.17,
  wheelRadius: 0.041,
} as const;

/**
 * Замкнена траса на килимку арени в локальних координатах килимка
 * (центр килимка — (0,0), половина сторони = 1.0 для килимка 2×2 м).
 * Ті самі точки використовуються і для друку лінії на текстурі килимка,
 * і для сплайна руху робота.
 */
export const ARENA_TRACK: Array<[number, number]> = [
  [-0.62, -0.55], [0.0, -0.72], [0.62, -0.55], [0.72, 0.0],
  [0.55, 0.6], [0.0, 0.72], [-0.58, 0.58], [-0.73, 0.0],
];
