/**
 * Процедурні canvas-текстури: підлога, екрани, дошка, постери, килимок арени тощо.
 * Жодних зовнішніх ассетів — усе малюється кодом.
 */
import * as THREE from 'three';
import { FIELD_TRACK, NXT_COLORS, SPIKE_COLORS } from '../../../domain/robotSpecs';

function makeCanvas(w: number, h: number): [HTMLCanvasElement, CanvasRenderingContext2D] {
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D недоступний');
  return [canvas, ctx];
}

function toTexture(canvas: HTMLCanvasElement, repeat?: [number, number]): THREE.CanvasTexture {
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  if (repeat) {
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(repeat[0], repeat[1]);
  }
  return tex;
}

/** Світло-сіра керамічна плитка великого формату з тонкими швами (2×2 на текстуру). */
export function makeFloorTexture(): THREE.CanvasTexture {
  const [canvas, ctx] = makeCanvas(512, 512);
  ctx.fillStyle = '#cfcdc8';
  ctx.fillRect(0, 0, 512, 512);
  // легка «мармуровість» бетонної плитки: великі напівпрозорі плями
  for (let i = 0; i < 70; i++) {
    const x = Math.random() * 512;
    const y = Math.random() * 512;
    const r = 18 + Math.random() * 60;
    const grad = ctx.createRadialGradient(x, y, 0, x, y, r);
    const light = Math.random() > 0.5;
    grad.addColorStop(0, light ? 'rgba(255,255,255,0.06)' : 'rgba(120,118,112,0.06)');
    grad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = grad;
    ctx.fillRect(x - r, y - r, r * 2, r * 2);
  }
  // дрібне зерно
  for (let i = 0; i < 2200; i++) {
    ctx.fillStyle = Math.random() > 0.55 ? 'rgba(255,255,255,0.05)' : 'rgba(110,108,102,0.05)';
    ctx.fillRect(Math.random() * 512, Math.random() * 512, 1.4, 1.4);
  }
  // тонкі шви між плитками
  ctx.strokeStyle = 'rgba(150,148,142,0.85)';
  ctx.lineWidth = 2;
  for (let i = 0; i <= 2; i++) {
    ctx.beginPath();
    ctx.moveTo(i * 256, 0);
    ctx.lineTo(i * 256, 512);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, i * 256);
    ctx.lineTo(512, i * 256);
    ctx.stroke();
  }
  return toTexture(canvas, [6, 6]);
}

/** Деревина для столів/шаф. */
export function makeWoodTexture(base = '#a4713f'): THREE.CanvasTexture {
  const [canvas, ctx] = makeCanvas(256, 256);
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, 256, 256);
  for (let x = 0; x < 256; x += 3) {
    const wave = Math.sin(x * 0.14) * 10 + Math.sin(x * 0.045) * 22;
    ctx.fillStyle = `rgba(60,35,12,${0.05 + 0.05 * Math.abs(Math.sin(x * 0.09))})`;
    ctx.fillRect(x, 0, 2, 256);
    ctx.fillStyle = 'rgba(255,225,180,0.05)';
    ctx.fillRect((x + wave + 256) % 256, 0, 1, 256);
  }
  for (let i = 0; i < 5; i++) {
    const cx = Math.random() * 256;
    const cy = Math.random() * 256;
    ctx.strokeStyle = 'rgba(70,40,15,0.25)';
    ctx.beginPath();
    ctx.ellipse(cx, cy, 6 + Math.random() * 5, 3 + Math.random() * 3, 0, 0, Math.PI * 2);
    ctx.stroke();
  }
  return toTexture(canvas, [1, 1]);
}

const CODE_COLORS = ['#c792ea', '#82aaff', '#c3e88d', '#f78c6c', '#89ddff', '#ffcb6b'];

/** Екран монітора: редактор коду / блокове середовище / робочий стіл. */
export function makeScreenTexture(variant: number): THREE.CanvasTexture {
  const [canvas, ctx] = makeCanvas(512, 320);
  const kind = variant % 3;
  if (kind === 0) {
    // Редактор коду
    ctx.fillStyle = '#1a1b26';
    ctx.fillRect(0, 0, 512, 320);
    ctx.fillStyle = '#24283b';
    ctx.fillRect(0, 0, 512, 26);
    ctx.fillStyle = '#7aa2f7';
    ctx.font = 'bold 13px monospace';
    ctx.fillText('robot_move.py — STEM', 12, 17);
    let y = 46;
    let seed = variant * 7 + 3;
    const rand = () => {
      seed = (seed * 9301 + 49297) % 233280;
      return seed / 233280;
    };
    for (let line = 0; line < 14; line++) {
      let x = 34 + Math.floor(rand() * 3) * 22;
      ctx.fillStyle = '#3b4261';
      ctx.font = '11px monospace';
      ctx.fillText(String(line + 1).padStart(2, ' '), 8, y + 9);
      const parts = 1 + Math.floor(rand() * 3);
      for (let p = 0; p < parts; p++) {
        const w = 26 + rand() * 90;
        ctx.fillStyle = CODE_COLORS[Math.floor(rand() * CODE_COLORS.length)];
        ctx.globalAlpha = 0.9;
        ctx.beginPath();
        ctx.roundRect(x, y, w, 10, 3);
        ctx.fill();
        ctx.globalAlpha = 1;
        x += w + 12;
      }
      y += 19;
    }
  } else if (kind === 1) {
    // Блокове програмування (як у SPIKE / Scratch)
    ctx.fillStyle = '#eef4fb';
    ctx.fillRect(0, 0, 512, 320);
    ctx.fillStyle = '#d6e4f5';
    ctx.fillRect(0, 0, 150, 320);
    const blockColors = ['#4c97ff', '#9966ff', '#ffab19', '#4cbf56', '#ff6680'];
    let y = 40;
    for (let i = 0; i < 6; i++) {
      ctx.fillStyle = blockColors[i % blockColors.length];
      ctx.beginPath();
      ctx.roundRect(180 + (i % 2) * 14, y, 200 - (i % 3) * 30, 30, 8);
      ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.85)';
      ctx.font = 'bold 12px Arial';
      ctx.fillText(['коли програму запущено', 'мотори A+B: вперед', 'чекати 2 секунди', 'повернути праворуч 90°', 'якщо датчик = червоний', 'зупинити мотори'][i], 192 + (i % 2) * 14, y + 19);
      y += 40;
    }
    for (let i = 0; i < 5; i++) {
      ctx.fillStyle = blockColors[i];
      ctx.beginPath();
      ctx.roundRect(14, 36 + i * 42, 120, 26, 7);
      ctx.fill();
    }
  } else {
    // Робочий стіл із шпалерами
    const grad = ctx.createLinearGradient(0, 0, 512, 320);
    grad.addColorStop(0, '#123c6d');
    grad.addColorStop(1, '#3f87c5');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 512, 320);
    ctx.fillStyle = 'rgba(255,255,255,0.92)';
    ctx.font = 'bold 30px Arial';
    ctx.fillText('STEM', 218, 160);
    for (let i = 0; i < 6; i++) {
      ctx.fillStyle = 'rgba(255,255,255,0.85)';
      ctx.beginPath();
      ctx.roundRect(18, 20 + i * 46, 32, 32, 6);
      ctx.fill();
    }
    ctx.fillStyle = 'rgba(10,20,35,0.85)';
    ctx.fillRect(0, 296, 512, 24);
  }
  return toTexture(canvas);
}

/** Слайд на інтерактивній панелі. */
export function makePanelSlideTexture(): THREE.CanvasTexture {
  const [canvas, ctx] = makeCanvas(1024, 600);
  const grad = ctx.createLinearGradient(0, 0, 0, 600);
  grad.addColorStop(0, '#ffffff');
  grad.addColorStop(1, '#dcebfa');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 1024, 600);
  ctx.fillStyle = '#123c6d';
  ctx.fillRect(0, 0, 1024, 96);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 44px Arial';
  ctx.fillText('Робототехніка: LEGO SPIKE Prime', 40, 62);
  ctx.fillStyle = '#1f2937';
  ctx.font = '30px Arial';
  const bullets = [
    'Складаємо їздову базу (driving base)',
    'Датчик кольору: рух уздовж лінії',
    'Датчик відстані: обхід перешкод',
    'Змагання на арені — сьогодні!',
  ];
  bullets.forEach((b, i) => {
    ctx.fillStyle = '#f7b500';
    ctx.beginPath();
    ctx.arc(64, 166 + i * 62, 9, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#1f2937';
    ctx.fillText(b, 92, 176 + i * 62);
  });
  // Простий малюнок робота
  ctx.fillStyle = '#f7d117';
  ctx.beginPath();
  ctx.roundRect(720, 240, 190, 120, 16);
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.roundRect(755, 262, 120, 76, 10);
  ctx.fill();
  ctx.fillStyle = '#ff2ea6';
  for (let i = 0; i < 5; i++)
    for (let j = 0; j < 5; j++)
      if ([6, 8, 11, 13, 16, 18, 21, 22, 23].includes(i * 5 + j)) {
        ctx.beginPath();
        ctx.arc(775 + j * 20, 276 + i * 12, 4.5, 0, Math.PI * 2);
        ctx.fill();
      }
  ctx.fillStyle = '#1c1c1c';
  ctx.beginPath();
  ctx.arc(745, 386, 28, 0, Math.PI * 2);
  ctx.arc(890, 386, 28, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#64748b';
  ctx.font = '22px Arial';
  ctx.fillText('Кабінет інформатики • STEM', 40, 566);
  return toTexture(canvas);
}

/** Зелена крейдяна дошка з написами. */
export function makeChalkboardTexture(): THREE.CanvasTexture {
  const [canvas, ctx] = makeCanvas(1024, 420);
  const grad = ctx.createLinearGradient(0, 0, 1024, 420);
  grad.addColorStop(0, '#2f6047');
  grad.addColorStop(0.5, '#2a573f');
  grad.addColorStop(1, '#2f6047');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 1024, 420);
  for (let i = 0; i < 900; i++) {
    ctx.fillStyle = 'rgba(255,255,255,0.025)';
    ctx.fillRect(Math.random() * 1024, Math.random() * 420, 2, 1);
  }
  ctx.fillStyle = 'rgba(255,255,255,0.88)';
  ctx.font = 'bold 58px "Comic Sans MS", cursive';
  ctx.fillText('S T E M', 90, 110);
  ctx.font = '30px "Comic Sans MS", cursive';
  ctx.fillStyle = 'rgba(255,255,255,0.8)';
  ctx.fillText('Science • Technology', 70, 180);
  ctx.fillText('Engineering • Math', 70, 228);
  ctx.fillText('v = s / t', 120, 330);
  // Крейдяна шестерня
  ctx.strokeStyle = 'rgba(255,255,255,0.8)';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(760, 210, 90, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(760, 210, 34, 0, Math.PI * 2);
  ctx.stroke();
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(760 + Math.cos(a) * 90, 210 + Math.sin(a) * 90);
    ctx.lineTo(760 + Math.cos(a) * 112, 210 + Math.sin(a) * 112);
    ctx.stroke();
  }
  ctx.font = '26px "Comic Sans MS", cursive';
  ctx.fillText('robot.move( )', 660, 360);
  return toTexture(canvas);
}

/**
 * Навчальний постер у пастельній «інфографічній» стилістиці референсу:
 * білий аркуш, кольоровий заголовок, м'ятні картки з псевдотекстом і
 * контурною іконкою теми.
 */
export function makePosterTexture(kind: number): THREE.CanvasTexture {
  const [canvas, ctx] = makeCanvas(384, 560);
  const themes = [
    { accent: '#2a9d8f', title: 'РОБОТОТЕХНІКА', sub: 'сенсори • мотори • код' },
    { accent: '#457b9d', title: 'АЛГОРИТМИ', sub: 'думай як програміст' },
    { accent: '#52796f', title: 'STEM', sub: 'наука • техніка • інженерія' },
    { accent: '#bc6c25', title: 'БЕЗПЕКА', sub: 'в Інтернеті' },
  ];
  const t = themes[kind % themes.length];
  // аркуш із тонкою рамкою
  ctx.fillStyle = '#fbfaf7';
  ctx.fillRect(0, 0, 384, 560);
  ctx.strokeStyle = '#e3e0d8';
  ctx.lineWidth = 4;
  ctx.strokeRect(6, 6, 372, 548);
  // заголовок і підзаголовок
  ctx.textAlign = 'center';
  ctx.fillStyle = t.accent;
  ctx.font = 'bold 30px Arial';
  ctx.fillText(t.title, 192, 62);
  ctx.fillStyle = '#6b7671';
  ctx.font = '17px Arial';
  ctx.fillText(t.sub, 192, 92);
  ctx.fillStyle = t.accent;
  ctx.fillRect(122, 108, 140, 4);
  // детермінований псевдовипадковий генератор (стабільний вигляд постера)
  let seed = kind * 31 + 7;
  const rand = () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };
  // дві пастельні картки з рядками «тексту»
  const cards = [
    { y: 132, h: 118, bg: '#dcebe6' },
    { y: 404, h: 118, bg: '#efe9da' },
  ];
  for (const card of cards) {
    ctx.fillStyle = card.bg;
    ctx.beginPath();
    ctx.roundRect(26, card.y, 332, card.h, 10);
    ctx.fill();
    let ly = card.y + 24;
    for (let line = 0; line < 4; line++) {
      ctx.fillStyle = 'rgba(90,104,98,0.55)';
      ctx.beginPath();
      ctx.roundRect(44, ly, 120 + rand() * 176, 9, 4);
      ctx.fill();
      ly += 24;
    }
  }
  // контурна іконка теми між картками
  ctx.strokeStyle = t.accent;
  ctx.lineWidth = 5;
  const cy = 322; // центр зони іконки
  if (kind % 4 === 0) {
    // робот
    ctx.strokeRect(122, cy - 58, 140, 76);
    ctx.strokeRect(152, cy + 30, 80, 40);
    ctx.beginPath();
    ctx.arc(162, cy - 28, 11, 0, Math.PI * 2);
    ctx.moveTo(233, cy - 28);
    ctx.arc(222, cy - 28, 11, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(157, cy - 2);
    ctx.lineTo(227, cy - 2);
    ctx.stroke();
  } else if (kind % 4 === 1) {
    // блок-схема
    ctx.strokeRect(147, cy - 66, 90, 36);
    ctx.beginPath();
    ctx.moveTo(192, cy - 30);
    ctx.lineTo(192, cy - 10);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(192, cy - 10);
    ctx.lineTo(244, cy + 26);
    ctx.lineTo(192, cy + 62);
    ctx.lineTo(140, cy + 26);
    ctx.closePath();
    ctx.stroke();
  } else if (kind % 4 === 2) {
    // атом
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.ellipse(192, cy, 92, 34, (i * Math.PI) / 3, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.fillStyle = t.accent;
    ctx.beginPath();
    ctx.arc(192, cy, 12, 0, Math.PI * 2);
    ctx.fill();
  } else {
    // щит із «пташкою»
    ctx.beginPath();
    ctx.moveTo(192, cy - 66);
    ctx.lineTo(258, cy - 40);
    ctx.lineTo(250, cy + 34);
    ctx.lineTo(192, cy + 70);
    ctx.lineTo(134, cy + 34);
    ctx.lineTo(126, cy - 40);
    ctx.closePath();
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(164, cy);
    ctx.lineTo(186, cy + 26);
    ctx.lineTo(226, cy - 30);
    ctx.stroke();
  }
  // футер
  ctx.fillStyle = '#9aa39e';
  ctx.font = '15px Arial';
  ctx.fillText('Кабінет інформатики • STEM', 192, 542);
  ctx.textAlign = 'left';
  return toTexture(canvas);
}

/**
 * Поверхня тренувального стола: чисте біле поле з чорною замкненою лінією
 * (як ізострічка на білому столі; та сама лінія, якою їде робот).
 * TRACK_SCALE лишає вільний край між лінією та бортиками.
 */
export const FIELD_TRACK_SCALE = 0.8;

export function makeFieldSurfaceTexture(): THREE.CanvasTexture {
  const S = 1024;
  const [canvas, ctx] = makeCanvas(S, S);
  const px = (v: number) => ((v * FIELD_TRACK_SCALE + 1) / 2) * S;
  ctx.fillStyle = '#f6f5f2';
  ctx.fillRect(0, 0, S, S);
  // ледь помітна фактура ламінованої поверхні
  for (let i = 0; i < 900; i++) {
    ctx.fillStyle = Math.random() > 0.5 ? 'rgba(255,255,255,0.5)' : 'rgba(190,188,182,0.12)';
    ctx.fillRect(Math.random() * S, Math.random() * S, 1.5, 1.5);
  }
  // замкнена лінія — плавна крива через середини сегментів
  const pts = FIELD_TRACK.map(([x, y]) => [px(x), px(y)] as [number, number]);
  ctx.strokeStyle = '#17181a';
  ctx.lineWidth = 24;
  ctx.lineJoin = 'round';
  ctx.beginPath();
  const n = pts.length;
  const mid = (a: [number, number], b: [number, number]): [number, number] => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
  const m = mid(pts[n - 1], pts[0]);
  ctx.moveTo(m[0], m[1]);
  for (let i = 0; i < n; i++) {
    const next = pts[(i + 1) % n];
    const m2 = mid(pts[i], next);
    ctx.quadraticCurveTo(pts[i][0], pts[i][1], m2[0], m2[1]);
  }
  ctx.closePath();
  ctx.stroke();
  // зона старту — зелений квадрат на лінії
  ctx.fillStyle = '#2fa14e';
  ctx.globalAlpha = 0.85;
  ctx.fillRect(px(-0.62) - 40, px(-0.55) - 40, 80, 80);
  ctx.globalAlpha = 1;
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 4;
  ctx.strokeRect(px(-0.62) - 40, px(-0.55) - 40, 80, 80);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 26px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('START', px(-0.62), px(-0.55) + 9);
  ctx.textAlign = 'left';
  return toTexture(canvas);
}

/** Динамічна LED-матриця 5×5 хаба SPIKE. */
export function makeLedMatrix(): { texture: THREE.CanvasTexture; update: (t: number) => void } {
  const [canvas, ctx] = makeCanvas(80, 80);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  const patterns: number[][] = [
    // серце
    [0, 1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 0, 0, 0, 1, 0, 0],
    // усмішка
    [0, 1, 0, 1, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1, 1, 1, 0],
    // стрілка вперед
    [0, 0, 1, 0, 0, 0, 1, 1, 1, 0, 1, 0, 1, 0, 1, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0],
    // квадрат
    [1, 1, 1, 1, 1, 1, 0, 0, 0, 1, 1, 0, 0, 0, 1, 1, 0, 0, 0, 1, 1, 1, 1, 1, 1],
  ];
  let lastIdx = -1;
  const update = (t: number) => {
    const idx = Math.floor(t / 1.4) % patterns.length;
    if (idx === lastIdx) return;
    lastIdx = idx;
    ctx.fillStyle = '#101010';
    ctx.fillRect(0, 0, 80, 80);
    const p = patterns[idx];
    for (let r = 0; r < 5; r++) {
      for (let c = 0; c < 5; c++) {
        ctx.fillStyle = p[r * 5 + c] ? SPIKE_COLORS.ledOn : SPIKE_COLORS.ledOff;
        ctx.beginPath();
        ctx.roundRect(6 + c * 14.5, 6 + r * 14.5, 11, 11, 3);
        ctx.fill();
      }
    }
    texture.needsUpdate = true;
  };
  update(0);
  return { texture, update };
}

/** Монохромний екран блока NXT. */
export function makeNxtScreenTexture(): THREE.CanvasTexture {
  const [canvas, ctx] = makeCanvas(96, 64);
  ctx.fillStyle = NXT_COLORS.screenBg;
  ctx.fillRect(0, 0, 96, 64);
  ctx.fillStyle = NXT_COLORS.screenFg;
  ctx.font = 'bold 20px monospace';
  ctx.fillText('NXT', 26, 28);
  ctx.font = '10px monospace';
  ctx.fillText('My Blocks', 20, 46);
  ctx.strokeStyle = NXT_COLORS.screenFg;
  ctx.strokeRect(4, 4, 88, 56);
  ctx.fillRect(70, 8, 16, 8);
  return toTexture(canvas);
}

/** Клавіатура (вид зверху). */
export function makeKeyboardTexture(): THREE.CanvasTexture {
  const [canvas, ctx] = makeCanvas(256, 96);
  ctx.fillStyle = '#2a2d33';
  ctx.fillRect(0, 0, 256, 96);
  ctx.fillStyle = '#43474f';
  for (let r = 0; r < 5; r++) {
    for (let c = 0; c < 15; c++) {
      const w = r === 4 && c === 5 ? 64 : 14;
      if (r === 4 && c > 5 && c < 10) continue;
      ctx.beginPath();
      ctx.roundRect(6 + c * 16.4, 6 + r * 17.5, w, 13, 2.5);
      ctx.fill();
    }
  }
  return toTexture(canvas);
}

/** Друк на коробці конструктора LEGO. */
export function makeLegoBoxTexture(kind: 'nxt' | 'spike'): THREE.CanvasTexture {
  const [canvas, ctx] = makeCanvas(256, 192);
  if (kind === 'nxt') {
    ctx.fillStyle = '#f5f5f2';
    ctx.fillRect(0, 0, 256, 192);
    ctx.fillStyle = '#f58220';
    ctx.fillRect(0, 0, 256, 46);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 20px Arial';
    ctx.fillText('MINDSTORMS', 62, 31);
    ctx.fillStyle = '#d51117';
    ctx.fillRect(10, 8, 40, 30);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 14px Arial';
    ctx.fillText('LEGO', 14, 28);
    ctx.fillStyle = '#1f2937';
    ctx.font = 'bold 44px Arial';
    ctx.fillText('NXT', 78, 120);
    ctx.fillStyle = '#64748b';
    ctx.font = '13px Arial';
    ctx.fillText('Education Base Set 9797', 44, 160);
  } else {
    ctx.fillStyle = '#f7d117';
    ctx.fillRect(0, 0, 256, 192);
    ctx.fillStyle = '#d51117';
    ctx.fillRect(10, 8, 40, 30);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 14px Arial';
    ctx.fillText('LEGO', 14, 28);
    ctx.fillStyle = '#5d3a9b';
    ctx.fillRect(0, 140, 256, 52);
    ctx.fillStyle = '#1f2937';
    ctx.font = 'bold 34px Arial';
    ctx.fillText('SPIKE', 70, 90);
    ctx.font = 'bold 22px Arial';
    ctx.fillText('Prime', 96, 120);
    ctx.fillStyle = '#ffffff';
    ctx.font = '14px Arial';
    ctx.fillText('Education • 45678', 66, 172);
  }
  return toTexture(canvas);
}

/**
 * Типографічний «ворд-клауд» для південної стіни (за референсом): графітові
 * слова різного кеглю на прозорому тлі, кілька — вертикально. Розкладка
 * задана вручну — детермінована, без рандому.
 */
export function makeWordCloudTexture(): THREE.CanvasTexture {
  const [canvas, ctx] = makeCanvas(1024, 632);
  const ink = (alpha: number) => `rgba(43,52,64,${alpha})`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  type Word = { text: string; x: number; y: number; size: number; bold?: boolean; vertical?: boolean; alpha?: number };
  const words: Word[] = [
    // великі акценти
    { text: 'ROBOTICS', x: 470, y: 330, size: 92, bold: true },
    { text: 'INNOVATE', x: 545, y: 445, size: 64, bold: true },
    { text: 'CREATE', x: 285, y: 232, size: 58, bold: true },
    { text: 'PROGRAM', x: 700, y: 232, size: 48, bold: true },
    { text: 'Future thinking', x: 330, y: 118, size: 46, alpha: 0.9 },
    { text: 'IMAGINE', x: 858, y: 352, size: 38, bold: true },
    { text: 'BIONIC', x: 148, y: 432, size: 42, bold: true },
    // вертикальні (читаються знизу догори)
    { text: 'MACHINE', x: 92, y: 262, size: 38, bold: true, vertical: true },
    { text: 'COMPUTER', x: 800, y: 132, size: 30, bold: true, vertical: true },
    { text: 'FUTURISTIC', x: 52, y: 468, size: 24, vertical: true, alpha: 0.75 },
    { text: 'TECHNOLOGY', x: 972, y: 396, size: 22, vertical: true, alpha: 0.75 },
    // дрібні слова-супутники
    { text: 'THINK', x: 592, y: 118, size: 24, alpha: 0.8 },
    { text: 'CONCEPT', x: 552, y: 168, size: 24, alpha: 0.8 },
    { text: 'DESIGN', x: 706, y: 92, size: 20, alpha: 0.7 },
    { text: 'IDEA', x: 902, y: 150, size: 30, alpha: 0.85 },
    { text: 'MECHANIC', x: 928, y: 226, size: 24, alpha: 0.8 },
    { text: 'DISCOVER', x: 795, y: 278, size: 26, alpha: 0.85 },
    { text: 'CONNECT', x: 918, y: 300, size: 22, alpha: 0.75 },
    { text: 'LEARN', x: 142, y: 348, size: 28, alpha: 0.85 },
    { text: 'CYBER', x: 218, y: 512, size: 22, alpha: 0.75 },
    { text: 'RESEARCH', x: 356, y: 512, size: 24, alpha: 0.8 },
    { text: 'CYBORG', x: 492, y: 516, size: 22, alpha: 0.75 },
    { text: 'COLLABORATE', x: 872, y: 452, size: 24, alpha: 0.8 },
    { text: 'SHARE', x: 940, y: 496, size: 22, alpha: 0.75 },
    { text: 'EXPLORE', x: 806, y: 528, size: 28, alpha: 0.85 },
  ];
  for (const w of words) {
    ctx.fillStyle = ink(w.alpha ?? 0.95);
    ctx.font = `${w.bold ? 'bold ' : ''}${w.size}px Arial`;
    if (w.vertical) {
      ctx.save();
      ctx.translate(w.x, w.y);
      ctx.rotate(-Math.PI / 2);
      ctx.fillText(w.text, 0, 0);
      ctx.restore();
    } else {
      ctx.fillText(w.text, w.x, w.y);
    }
  }
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  return toTexture(canvas);
}

/**
 * Поверхня стенда для матеріалів (біла дошка): заголовок, дві пришпилені
 * пастельні картки праворуч (ліві 2/3 лишаються під фізичні міні-постери).
 */
export function makePinBoardTexture(): THREE.CanvasTexture {
  const [canvas, ctx] = makeCanvas(1024, 634);
  ctx.fillStyle = '#fcfcfa';
  ctx.fillRect(0, 0, 1024, 634);
  // ледь помітне «полотно» дошки
  for (let i = 0; i < 1400; i++) {
    ctx.fillStyle = Math.random() > 0.5 ? 'rgba(255,255,255,0.5)' : 'rgba(205,203,196,0.16)';
    ctx.fillRect(Math.random() * 1024, Math.random() * 634, 1.4, 1.4);
  }
  // внутрішня тінь по периметру
  ctx.strokeStyle = 'rgba(160,158,150,0.5)';
  ctx.lineWidth = 6;
  ctx.strokeRect(5, 5, 1014, 624);
  // заголовок стенда
  ctx.textAlign = 'center';
  ctx.fillStyle = '#2a9d8f';
  ctx.font = 'bold 36px Arial';
  ctx.fillText('НАШІ ПРОЄКТИ • РОБОТОТЕХНІКА', 512, 58);
  ctx.fillStyle = '#2a9d8f';
  ctx.fillRect(342, 76, 340, 4);
  // пришпилені картки праворуч (детермінований вигляд)
  let seed = 17;
  const rand = () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };
  const cards = [
    { x: 690, y: 108, w: 262, h: 190, bg: '#dcebe6', pin: '#d94f4f' },
    { x: 708, y: 336, w: 240, h: 206, bg: '#efe9da', pin: '#457b9d' },
  ];
  for (const card of cards) {
    ctx.fillStyle = 'rgba(120,118,110,0.18)';
    ctx.beginPath();
    ctx.roundRect(card.x + 5, card.y + 7, card.w, card.h, 10);
    ctx.fill();
    ctx.fillStyle = card.bg;
    ctx.beginPath();
    ctx.roundRect(card.x, card.y, card.w, card.h, 10);
    ctx.fill();
    let ly = card.y + 34;
    for (let line = 0; line < 5; line++) {
      ctx.fillStyle = 'rgba(90,104,98,0.5)';
      ctx.beginPath();
      ctx.roundRect(card.x + 22, ly, 90 + rand() * (card.w - 130), 9, 4);
      ctx.fill();
      ly += 30;
    }
    // кнопка-пін
    ctx.fillStyle = card.pin;
    ctx.beginPath();
    ctx.arc(card.x + card.w / 2, card.y + 8, 9, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    ctx.beginPath();
    ctx.arc(card.x + card.w / 2, card.y + 8, 3.2, 0, Math.PI * 2);
    ctx.fill();
  }
  // контурний робот на нижній картці
  ctx.strokeStyle = '#7b6a4d';
  ctx.lineWidth = 4;
  ctx.strokeRect(770, 430, 116, 62);
  ctx.strokeRect(794, 500, 68, 32);
  ctx.beginPath();
  ctx.arc(802, 456, 9, 0, Math.PI * 2);
  ctx.moveTo(863, 456);
  ctx.arc(854, 456, 9, 0, Math.PI * 2);
  ctx.stroke();
  ctx.textAlign = 'left';
  return toTexture(canvas);
}

/** Циферблат настінного годинника. */
export function makeClockTexture(): THREE.CanvasTexture {
  const [canvas, ctx] = makeCanvas(128, 128);
  ctx.fillStyle = '#fafafa';
  ctx.beginPath();
  ctx.arc(64, 64, 62, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#1f2937';
  ctx.lineWidth = 3;
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(64 + Math.cos(a) * 52, 64 + Math.sin(a) * 52);
    ctx.lineTo(64 + Math.cos(a) * 58, 64 + Math.sin(a) * 58);
    ctx.stroke();
  }
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(64, 64);
  ctx.lineTo(64 + 28, 64 - 18);
  ctx.stroke();
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(64, 64);
  ctx.lineTo(64 - 8, 64 - 42);
  ctx.stroke();
  ctx.fillStyle = '#1f2937';
  ctx.beginPath();
  ctx.arc(64, 64, 4, 0, Math.PI * 2);
  ctx.fill();
  return toTexture(canvas);
}
