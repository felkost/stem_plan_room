# presentation/ — конвенції UI-шару

- Лише React + styles.css. Браузерні API (matchMedia, navigator…) сюди не
  тягнути — детекція живе в infrastructure/device, результат приходить
  пропсами з composition root (main.tsx): `initialQuality`, `isTouch`.
- Мова інтерфейсу — українська.

## Мобільні правила (iPhone 13+ / Android)

- Відступи країв екрана — через `max(16px, env(safe-area-inset-*))`
  (viewport-fit=cover в index.html; виріз/Dynamic Island).
- Висота — `100dvh` із фолбеком `height: 100%` (iOS 15.0–15.3 без dvh).
- Цілі дотику ≥ 44px — тільки в `@media (pointer: coarse)`.
- Hover-стани — тільки в `@media (hover: hover)` (інакше «залипають» на дотику).
- Кнопки: `touch-action: manipulation`; тулбар на телефонах — стрічка
  `flex-wrap: nowrap` + `overflow-x: auto` без смуги прокрутки.
- Анімації поважають `prefers-reduced-motion`.
- Тости замість alert; результат збереження медіа (true/false з FileSaver)
  визначає текст: «збережено» vs «скасовано».
