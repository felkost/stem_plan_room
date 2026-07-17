/**
 * Валідація розстановки кабінету: геометрична узгодженість даних плану.
 * Ці тести захищають інваріанти при майбутніх змінах у плануванні:
 * меблі в межах Г-подібної кімнати, без перетинів, монітори на столах,
 * отвори (вікна/двері) — у межах своїх стін.
 */
import { describe, expect, it } from 'vitest';
import {
  AIR_CONDITIONER,
  ALCOVE_WINDOWS,
  CAMERA_PRESETS,
  CEILING_LIGHTS,
  CHALKBOARD,
  DISPLAY_CABINET,
  EAST_WINDOWS,
  FRONT_CABINET,
  FRONT_CHAIR,
  INTERACTIVE_PANEL,
  MONITORS,
  NETWORK_SWITCH,
  PIN_BOARD,
  POD_CHAIRS,
  POD_DESKS,
  POWER_STATION,
  ROOM,
  STUDENT_CHAIRS,
  STUDENT_DESKS,
  TEACHER_CHAIR,
  TEACHER_DESK,
  TEACHER_MONITOR,
  TRAINING_TABLE,
  WALL_CLOCK,
  WALL_DECOR,
  WEST_DOOR,
} from '../classroomLayout';
import type { PlacedItem, RectBounds } from '../entities';

/** Кути та середини сторін повернутого прямокутника предмета (координати плану, см). */
function footprintPoints(item: PlacedItem): Array<[number, number]> {
  const a = item.angle ?? 0;
  const cos = Math.cos(a);
  const sin = Math.sin(a);
  const hw = item.width / 2;
  const hd = item.depth / 2;
  const local: Array<[number, number]> = [
    [-hw, -hd], [hw, -hd], [hw, hd], [-hw, hd], // кути
    [0, -hd], [0, hd], [-hw, 0], [hw, 0],       // середини сторін
  ];
  return local.map(([lx, ly]) => [
    item.x + lx * cos - ly * sin,
    item.y + lx * sin + ly * cos,
  ]);
}

function inRect(px: number, py: number, r: RectBounds, tol: number): boolean {
  return px >= r.minX - tol && px <= r.maxX + tol && py >= r.minY - tol && py <= r.maxY + tol;
}

/** Точка всередині Г-подібної кімнати (основна зона ∪ ніша). */
function insideRoom(px: number, py: number, tol = 0): boolean {
  return inRect(px, py, ROOM, tol) || inRect(px, py, ROOM.alcove, tol);
}

/** Осі та кути прямокутника для SAT-перевірки перетину. */
function obb(item: PlacedItem, shrink = 0): { corners: Array<[number, number]>; axes: Array<[number, number]> } {
  const a = item.angle ?? 0;
  const cos = Math.cos(a);
  const sin = Math.sin(a);
  const hw = Math.max(0, item.width / 2 - shrink);
  const hd = Math.max(0, item.depth / 2 - shrink);
  const corners: Array<[number, number]> = (
    [[-hw, -hd], [hw, -hd], [hw, hd], [-hw, hd]] as Array<[number, number]>
  ).map(([lx, ly]) => [item.x + lx * cos - ly * sin, item.y + lx * sin + ly * cos]);
  const axes: Array<[number, number]> = [[cos, sin], [-sin, cos]];
  return { corners, axes };
}

/** Перетин двох повернутих прямокутників (SAT). shrink — допуск, см. */
function obbOverlap(i1: PlacedItem, i2: PlacedItem, shrink = 1): boolean {
  const b1 = obb(i1, shrink);
  const b2 = obb(i2, shrink);
  for (const axis of [...b1.axes, ...b2.axes]) {
    const proj = (pts: Array<[number, number]>) => {
      const vals = pts.map(([px, py]) => px * axis[0] + py * axis[1]);
      return [Math.min(...vals), Math.max(...vals)];
    };
    const [min1, max1] = proj(b1.corners);
    const [min2, max2] = proj(b2.corners);
    if (max1 < min2 || max2 < min1) return false; // знайдено розділювальну вісь
  }
  return true;
}

const named = <T,>(label: string, value: T) => ({ label, value });

/** Меблі, що стоять на підлозі (без крісел — їх засувають під столи). */
const FLOOR_FURNITURE = [
  ...STUDENT_DESKS.map((d, i) => named(`стіл учня #${i + 1}`, d)),
  ...POD_DESKS.map((t, i) => named(`стіл острівця #${i + 1}`, t)),
  named('стіл учителя', TEACHER_DESK),
  named('вітрина', DISPLAY_CABINET),
  named('тумба біля дошки', FRONT_CABINET),
  named('інтерактивна панель', INTERACTIVE_PANEL),
  named('тренувальний стіл', TRAINING_TABLE),
  named('зарядна станція', POWER_STATION),
  named('стійка комутатора', NETWORK_SWITCH),
];

const ALL_CHAIRS = [
  ...STUDENT_CHAIRS.map((c, i) => named(`крісло учня #${i + 1}`, c)),
  ...POD_CHAIRS.map((c, i) => named(`крісло острівця #${i + 1}`, c)),
  named('крісло вчителя', TEACHER_CHAIR),
  named('крісло біля дошки', FRONT_CHAIR),
];

describe('кількість об’єктів за планом', () => {
  it('13 учнівських столів, 13 моніторів, 13 крісел', () => {
    expect(STUDENT_DESKS).toHaveLength(13);
    expect(MONITORS).toHaveLength(13);
    expect(STUDENT_CHAIRS).toHaveLength(13);
  });

  it('вікна: 2 в основній зоні + 1 у ніші', () => {
    expect(EAST_WINDOWS).toHaveLength(2);
    expect(ALCOVE_WINDOWS).toHaveLength(1);
  });

  it('2 острівці по 6 столів і 6 крісел у центрі', () => {
    expect(POD_DESKS).toHaveLength(12);
    expect(POD_CHAIRS).toHaveLength(12);
  });
});

describe('усі об’єкти в межах Г-подібної кімнати', () => {
  const items = [
    ...FLOOR_FURNITURE,
    ...ALL_CHAIRS,
    ...MONITORS.map((m, i) => named(`монітор #${i + 1}`, m)),
    named('монітор учителя', TEACHER_MONITOR),
    named('дошка', CHALKBOARD),
    named('кондиціонер', AIR_CONDITIONER),
    named('стенд для матеріалів', PIN_BOARD),
    named('декор-ворд-клауд', WALL_DECOR),
    named('настінний годинник', WALL_CLOCK),
  ];
  // допуск 6 см: настінні предмети (дошка) частково «втоплені» у стіну
  it.each(items)('$label у межах кімнати', ({ value }) => {
    for (const [px, py] of footprintPoints(value)) {
      expect(insideRoom(px, py, 6), `точка (${px.toFixed(1)}, ${py.toFixed(1)}) поза кімнатою`).toBe(true);
    }
  });

  it('стельові панелі в межах кімнати', () => {
    for (const l of CEILING_LIGHTS) {
      expect(insideRoom(l.x, l.y, -30), `панель (${l.x}, ${l.y}) занадто близько до стіни`).toBe(true);
    }
  });
});

describe('відсутність перетинів', () => {
  it('меблі на підлозі не перетинаються', () => {
    // shrink 4 см: у плані сусідні столи в ряду стоять упритул
    // (перекриття до ~6 см), тож ловимо лише суттєві колізії
    for (let i = 0; i < FLOOR_FURNITURE.length; i++) {
      for (let j = i + 1; j < FLOOR_FURNITURE.length; j++) {
        const a = FLOOR_FURNITURE[i];
        const b = FLOOR_FURNITURE[j];
        expect(obbOverlap(a.value, b.value, 4), `${a.label} перетинається з ${b.label}`).toBe(false);
      }
    }
  });

  it('крісла не перетинаються між собою', () => {
    for (let i = 0; i < ALL_CHAIRS.length; i++) {
      for (let j = i + 1; j < ALL_CHAIRS.length; j++) {
        expect(
          obbOverlap(ALL_CHAIRS[i].value, ALL_CHAIRS[j].value),
          `${ALL_CHAIRS[i].label} перетинається з ${ALL_CHAIRS[j].label}`,
        ).toBe(false);
      }
    }
  });

  it('крісла острівців не заїжджають під жоден стіл острівців (включно зі своїм)', () => {
    for (const t of POD_DESKS.map((v, i) => named(`стіл острівця #${i + 1}`, v))) {
      for (const c of POD_CHAIRS.map((v, i) => named(`крісло острівця #${i + 1}`, v))) {
        expect(obbOverlap(t.value, c.value), `${t.label} перетинається з: ${c.label}`).toBe(false);
      }
    }
  });

  it('тренувальний стіл не перетинається з кріслами', () => {
    for (const c of ALL_CHAIRS) {
      expect(obbOverlap(TRAINING_TABLE, c.value), `тренувальний стіл перетинається з: ${c.label}`).toBe(false);
    }
  });
});

describe('монітори стоять на столах', () => {
  it.each(MONITORS.map((m, i) => named(`монітор #${i + 1}`, m)))(
    '$label на учнівському столі',
    ({ value }) => {
      const desk = STUDENT_DESKS.find((d) =>
        obbOverlap({ ...value, width: 1, depth: 1 }, d, 0),
      );
      expect(desk, 'під монітором немає стола').toBeDefined();
      expect(Math.abs((value.elevation ?? 0) - desk!.height)).toBeLessThanOrEqual(6);
    },
  );

  it('монітор учителя на столі вчителя', () => {
    expect(obbOverlap({ ...TEACHER_MONITOR, width: 1, depth: 1 }, TEACHER_DESK, 0)).toBe(true);
    expect(Math.abs((TEACHER_MONITOR.elevation ?? 0) - TEACHER_DESK.height)).toBeLessThanOrEqual(6);
  });
});

describe('отвори в межах стін', () => {
  const t = ROOM.wallThickness;

  it('двері на західній стіні', () => {
    const from = WEST_DOOR.center - WEST_DOOR.width / 2;
    const to = WEST_DOOR.center + WEST_DOOR.width / 2;
    expect(from).toBeGreaterThan(ROOM.minY + t);
    expect(to).toBeLessThan(ROOM.maxY - t);
    expect(WEST_DOOR.sill + WEST_DOOR.height).toBeLessThan(ROOM.height);
  });

  it('вікна основної зони — на східній стіні (між нішею та півднем)', () => {
    for (const w of EAST_WINDOWS) {
      expect(w.center - w.width / 2).toBeGreaterThan(ROOM.alcove.maxY + t);
      expect(w.center + w.width / 2).toBeLessThan(ROOM.maxY - t);
      expect(w.sill + w.height).toBeLessThan(ROOM.height);
    }
  });

  it('вікно ніші — на її східній стіні', () => {
    for (const w of ALCOVE_WINDOWS) {
      expect(w.center - w.width / 2).toBeGreaterThan(ROOM.alcove.minY + t);
      expect(w.center + w.width / 2).toBeLessThan(ROOM.alcove.maxY - t);
      expect(w.sill + w.height).toBeLessThan(ROOM.height);
    }
  });

  it('вікна не перекриваються між собою', () => {
    const sorted = [...EAST_WINDOWS].sort((a, b) => a.center - b.center);
    for (let i = 1; i < sorted.length; i++) {
      expect(sorted[i].center - sorted[i].width / 2)
        .toBeGreaterThan(sorted[i - 1].center + sorted[i - 1].width / 2);
    }
  });
});

describe('настінні об’єкти редизайну (композиція)', () => {
  const PHI = (1 + Math.sqrt(5)) / 2;

  it('кондиціонер — на простінку між двома вікнами, не під самою стелею', () => {
    const [w1, w2] = [...EAST_WINDOWS].sort((a, b) => a.center - b.center);
    // повернуто на π/2: уздовж стіни (вісь y) лежить width
    expect(AIR_CONDITIONER.y - AIR_CONDITIONER.width / 2).toBeGreaterThan(w1.center + w1.width / 2);
    expect(AIR_CONDITIONER.y + AIR_CONDITIONER.width / 2).toBeLessThan(w2.center - w2.width / 2);
    const gapToCeiling = ROOM.height - ((AIR_CONDITIONER.elevation ?? 0) + AIR_CONDITIONER.height);
    expect(gapToCeiling).toBeGreaterThanOrEqual(10);
    expect(gapToCeiling).toBeLessThanOrEqual(30);
    // зазор до стелі ≈ висота блока / φ
    expect(Math.abs(gapToCeiling - AIR_CONDITIONER.height / PHI)).toBeLessThan(1);
  });

  it('стенд і декор мають пропорції золотого перерізу', () => {
    expect(Math.abs(PIN_BOARD.width / PIN_BOARD.height - PHI)).toBeLessThan(0.02);
    expect(Math.abs(WALL_DECOR.width / WALL_DECOR.height - PHI)).toBeLessThan(0.02);
  });

  it('годинник — на золотій лінії південної стіни, між стендом і декором', () => {
    const goldenX = ROOM.minX + (ROOM.maxX - ROOM.minX) * (1 - 1 / PHI);
    expect(Math.abs(WALL_CLOCK.x - goldenX)).toBeLessThan(1);
    expect(WALL_CLOCK.x - WALL_CLOCK.width / 2).toBeGreaterThan(PIN_BOARD.x + PIN_BOARD.width / 2);
    expect(WALL_CLOCK.x + WALL_CLOCK.width / 2).toBeLessThan(WALL_DECOR.x - WALL_DECOR.width / 2);
  });

  it('стенд і декор — по центрах своїх зон золотого перерізу', () => {
    const goldenX = ROOM.minX + (ROOM.maxX - ROOM.minX) * (1 - 1 / PHI);
    expect(Math.abs(PIN_BOARD.x - (ROOM.minX + goldenX) / 2)).toBeLessThan(1);
    expect(Math.abs(WALL_DECOR.x - (goldenX + ROOM.maxX) / 2)).toBeLessThan(1);
  });

  it('стійка комутатора — у кутку південної та західної стін', () => {
    expect(NETWORK_SWITCH.x - NETWORK_SWITCH.width / 2).toBeGreaterThan(ROOM.minX);
    expect(NETWORK_SWITCH.x).toBeLessThan(ROOM.minX + 60);
    expect(NETWORK_SWITCH.y).toBeGreaterThan(ROOM.maxY - 60);
    expect(NETWORK_SWITCH.y + NETWORK_SWITCH.depth / 2).toBeLessThan(ROOM.maxY);
  });
});

describe('острівці групових столів: симетрія та відстані (редизайн 2026-07)', () => {
  const ISLAND_X = 265;
  // зовнішній контур острівця (крісло + половина його глибини) від центру острівця, см
  const ENVELOPE = 101;

  it('обидва острівці симетричні відносно центральної осі кабінету (x = 265)', () => {
    const all = [...POD_DESKS, ...POD_CHAIRS];
    for (const item of all) {
      const mirrorX = 2 * ISLAND_X - item.x;
      const hasMirror = all.some((o) => Math.abs(o.x - mirrorX) < 0.5 && Math.abs(o.y - item.y) < 0.5);
      expect(hasMirror, `немає дзеркального відповідника для (${item.x.toFixed(1)}, ${item.y.toFixed(1)})`).toBe(true);
    }
  });

  it('розумний відступ від дошки/зони вчителя на півночі', () => {
    const northIslandY = -30;
    const northEdge = northIslandY - ENVELOPE;
    expect(northEdge - FRONT_CABINET.y).toBeGreaterThan(30);
  });

  it('розумний відступ до південного ряду учнівських крісел (можна підсунути крісло)', () => {
    const southIslandY = 230;
    const southEdge = southIslandY + ENVELOPE;
    const southChairsMinY = Math.min(...STUDENT_CHAIRS.filter((c) => c.y > 400).map((c) => c.y - c.depth / 2));
    expect(southChairsMinY - southEdge).toBeGreaterThan(30);
  });

  it('розумний відступ до бічних колон учнівських крісел (захід/схід)', () => {
    const westChairsMaxX = Math.max(...STUDENT_CHAIRS.filter((c) => c.x < 100).map((c) => c.x + c.width / 2));
    const eastChairsMinX = Math.min(...STUDENT_CHAIRS.filter((c) => c.x > 400).map((c) => c.x - c.width / 2));
    expect(ISLAND_X - ENVELOPE - westChairsMaxX).toBeGreaterThan(30);
    expect(eastChairsMinX - (ISLAND_X + ENVELOPE)).toBeGreaterThan(30);
  });
});

describe('пресети камер', () => {
  it('5 пресетів з унікальними id та скінченними координатами', () => {
    expect(CAMERA_PRESETS).toHaveLength(5);
    expect(new Set(CAMERA_PRESETS.map((p) => p.id)).size).toBe(CAMERA_PRESETS.length);
    for (const p of CAMERA_PRESETS) {
      for (const v of [...p.position, ...p.target]) expect(Number.isFinite(v)).toBe(true);
      expect(p.position[1], `камера «${p.id}» нижче підлоги`).toBeGreaterThan(0);
      expect(p.label.length).toBeGreaterThan(0);
    }
  });
});
