/**
 * Domain: чисті типи предметної області.
 * Жодних залежностей від three.js, React чи браузерних API.
 * Усі координати — у сантиметрах, у системі плану Sweet Home 3D:
 *   x — на схід, y — на південь, elevation — висота низу об'єкта над підлогою,
 *   angle — кут у радіанах за годинниковою стрілкою (як у Home.xml).
 */

/** Розміщений на плані об'єкт (з Home.xml). */
export interface PlacedItem {
  /** Центр об'єкта по осі X, см */
  x: number;
  /** Центр об'єкта по осі Y (південь), см */
  y: number;
  /** Висота низу об'єкта над підлогою, см */
  elevation?: number;
  /** Кут повороту за годинниковою стрілкою, рад */
  angle?: number;
  width: number;
  depth: number;
  height: number;
}

/** Прямокутна ділянка плану, см. */
export interface RectBounds {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
}

/**
 * Габарити Г-подібної кімнати, см (внутрішні межі).
 * Основна зона minX..maxX × minY..maxY плюс ніша вчителя (alcove),
 * що прилягає до основної зони зі сходу і відкрита в неї (без стіни між ними).
 */
export interface RoomSpec extends RectBounds {
  /** Ніша вчителя (північно-східний виступ) */
  alcove: RectBounds;
  /** Висота стін, см */
  height: number;
  /** Товщина стін, см */
  wallThickness: number;
}

/** Отвір у стіні (вікно/двері); координата вздовж стіни — центр отвору. */
export interface WallOpening {
  /** Центр отвору вздовж стіни, см (у координатах плану по відповідній осі) */
  center: number;
  width: number;
  /** Низ отвору над підлогою, см */
  sill: number;
  height: number;
}

/** Арена для робота. */
export interface ArenaSpec {
  /** Центр килимка, см */
  x: number;
  y: number;
  /** Сторона квадратного килимка, см */
  size: number;
}

/** Іменований ракурс камери (у метрах світу three.js). */
export interface CameraPreset {
  id: string;
  label: string;
  position: [number, number, number];
  target: [number, number, number];
}

export type QualityLevel = 'high' | 'low';
