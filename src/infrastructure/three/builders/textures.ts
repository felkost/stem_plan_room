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

/** Лінолеум: спокійна сіро-бежева основа з дрібними вкрапленнями та швами плит. */
export function makeFloorTexture(): THREE.CanvasTexture {
  const [canvas, ctx] = makeCanvas(512, 512);
  ctx.fillStyle = '#c9c3b2';
  ctx.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 5200; i++) {
    const x = Math.random() * 512;
    const y = Math.random() * 512;
    const l = Math.random();
    ctx.fillStyle = l > 0.6 ? 'rgba(255,255,255,0.10)' : 'rgba(90,82,66,0.10)';
    ctx.fillRect(x, y, 1.6, 1.6);
  }
  ctx.strokeStyle = 'rgba(70,64,52,0.28)';
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

/** Навчальний постер. */
export function makePosterTexture(kind: number): THREE.CanvasTexture {
  const [canvas, ctx] = makeCanvas(384, 560);
  const themes = [
    { color: '#0e7490', title: 'РОБОТОТЕХНІКА', sub: 'від ідеї — до робота' },
    { color: '#7c3aed', title: 'АЛГОРИТМИ', sub: 'думай як програміст' },
    { color: '#16a34a', title: 'STEM', sub: 'наука • техніка • інженерія' },
    { color: '#dc2626', title: 'БЕЗПЕКА', sub: 'в Інтернеті' },
  ];
  const t = themes[kind % themes.length];
  ctx.fillStyle = '#f8fafc';
  ctx.fillRect(0, 0, 384, 560);
  ctx.fillStyle = t.color;
  ctx.fillRect(0, 0, 384, 120);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 34px Arial';
  ctx.textAlign = 'center';
  ctx.fillText(t.title, 192, 74);
  ctx.fillStyle = '#334155';
  ctx.font = '20px Arial';
  ctx.fillText(t.sub, 192, 156);
  ctx.strokeStyle = t.color;
  ctx.lineWidth = 6;
  if (kind % 4 === 0) {
    // робот
    ctx.strokeRect(122, 220, 140, 110);
    ctx.strokeRect(152, 350, 80, 90);
    ctx.beginPath();
    ctx.arc(162, 262, 14, 0, Math.PI * 2);
    ctx.moveTo(236, 262);
    ctx.arc(222, 262, 14, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(152, 300);
    ctx.lineTo(232, 300);
    ctx.stroke();
  } else if (kind % 4 === 1) {
    // блок-схема
    ctx.strokeRect(142, 210, 100, 52);
    ctx.beginPath();
    ctx.moveTo(192, 262);
    ctx.lineTo(192, 300);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(192, 300);
    ctx.lineTo(252, 350);
    ctx.lineTo(192, 400);
    ctx.lineTo(132, 350);
    ctx.closePath();
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(192, 400);
    ctx.lineTo(192, 440);
    ctx.stroke();
    ctx.strokeRect(142, 440, 100, 52);
  } else if (kind % 4 === 2) {
    // атом
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.ellipse(192, 330, 110, 44, (i * Math.PI) / 3, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.fillStyle = t.color;
    ctx.beginPath();
    ctx.arc(192, 330, 16, 0, Math.PI * 2);
    ctx.fill();
  } else {
    // щит
    ctx.beginPath();
    ctx.moveTo(192, 220);
    ctx.lineTo(282, 258);
    ctx.lineTo(272, 380);
    ctx.lineTo(192, 450);
    ctx.lineTo(112, 380);
    ctx.lineTo(102, 258);
    ctx.closePath();
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(152, 330);
    ctx.lineTo(185, 370);
    ctx.lineTo(240, 285);
    ctx.stroke();
  }
  ctx.fillStyle = '#64748b';
  ctx.font = '16px Arial';
  ctx.fillText('Кабінет інформатики', 192, 520);
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
