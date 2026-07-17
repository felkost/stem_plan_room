# memory.md — журнал проєкту (handoff між сесіями)

> Призначення: нова сесія Claude читає цей файл замість повторного аналізу
> кодової бази. Правила ведення — у [CLAUDE.md](CLAUDE.md): «Поточний стан»
> перезаписується, «Журнал етапів» доповнюється зверху.

## Поточний стан (2026-07-17)

- У `main` змержено: PR #1 (інтер'єр + мобільна адаптація, squash `6ed1e22`)
  та PR #2 (handoff-доки + скіл engineering-insights, squash `26404f5`).
  Робочі гілки видалено (локально й на GitHub).
- **Активна гілка `feat/migration`** (від `26404f5`) — створена під наступний
  етап (міграцію); задача етапу ще не сформульована.
- Тести: 113 passed (домен: розташування/колізії/еталон; infra: чисті функції
  формату запису та профілю пристрою). `tsc --noEmit` і `npm run build` чисті.
- Можливі наступні кроки: перевірка на реальному iPhone
  (`npm run dev -- --host`); PWA-маніфест/іконки, якщо потрібен повний
  повноекранний режим із домашнього екрана.

## Журнал етапів

- **2026-07-17 — Handoff-механізм + скіл engineering-insights**
  Кореневий CLAUDE.md + memory.md + шарові CLAUDE.md (`1e97ced`); скіл
  `engineering-insights` скопійовано з dev-digest і адаптовано під
  Onion-шари (`.claude/skills/engineering-insights/`), засіяно
  `src/<шар>/insights.md` (infrastructure: 2 записи, presentation: 1).
- **2026-07-17 — Мобільна адаптація (iPhone 13+/Android)** `53ab37e`
  Новий модуль `src/infrastructure/device/` (профіль пристрою → стартова
  якість 'low' на мобільних); MP4-фолбек запису для iOS Safari
  (`recorderFormats.ts`); збереження медіа через Web Share API з фолбеком
  `<a download>`, порт `FileSaver` → `Promise<boolean>` (скасування);
  `viewport-fit=cover` + safe-area, 100dvh, цілі дотику 44px, тулбар-стрічка
  з прокручуванням, сенсорна довідка. 11 нових юніт-тестів.
- **2026-07-17 — Редизайн інтер'єру за референсом** `46da4f7`
  Білі стіни, сіра плитка 62 см, стільниці «світлий дуб» на чорних сталевих
  О-рамах, світло-сірі крісла (хром), вертикальні жалюзі (ламелі з
  `noShadowCast`), пастельні плакати (нові групи на зх/сх стінах і в ніші).
  **Нове поза sh3d-планом:** 4 групові столи + 16 стільців у центрі
  (`GROUP_TABLES`/`GROUP_CHAIRS`); еталонні координати не змінено.
- **раніше (до handoff):** розворот моніторів південного ряду до класу
  `2ff8384`; CI на Node 24/проєкт на Node 22 `9bf7aa0`; markdownlint у README
  `a352aa4`; базова сцена за планом, роботи NXT/SPIKE, тренувальне поле,
  вітрина, медіа-захоплення.

## Карта кодової бази (стисло)

- `src/domain/classroomLayout.ts` — усі координати плану (см, кути CW у рад);
  `entities.ts` — типи; `robotSpecs.ts` — кольори/треки роботів.
- `src/domain/__tests__/` — layoutValidation (межі/колізії/SAT),
  layoutBaseline (snapshot-еталон плану).
- `src/infrastructure/three/builders/` — room (стіни/вікна/жалюзі/постери),
  furniture (меблі, `sideLoopLeg` — чорна О-рама), textures (усі
  canvas-текстури), lighting, common (`cm()`, `placeItem`, `box`).
- `src/infrastructure/three/sceneAssembler.ts` — розстановка всього за даними
  домену; `ThreeSceneRenderer.ts` — рендерер/OrbitControls/dollhouse/якість/
  captureFrame; `robots/` — NXT, SPIKE, поле, вітрина.
- `src/infrastructure/media/` — recorderFormats (чистий вибір WebM/MP4),
  MediaRecorderVideoService, download (Web Share → `<a download>`).
- `src/infrastructure/device/deviceProfile.ts` — детекція + чисті правила
  (`isMobileLike`, `resolveInitialQuality`).
- `src/application/` — ports, ViewerService, MediaCaptureService.
- `src/presentation/` — App, Toolbar, CapturePanel, HelpOverlay (isTouch),
  SceneCanvas, styles.css (safe-area/dvh/coarse-pointer медіазапити).

## Прийоми та граблі (крос-шарові; технічні відкриття шарів — в insights.md)

> Датовані технічні відкриття тепер веде скіл `engineering-insights`
> у `src/<шар>/insights.md` (див. CLAUDE.md). Тут — лише процесні речі,
> що не належать жодному шару.

- **Додавання нового об'єкта плану** (чекліст):
  1) const у `classroomLayout.ts` → 2) білдер у `builders/furniture.ts` →
  3) розстановка у `sceneAssembler.ts` → 4) додати в списки
  `layoutValidation.test.ts` (FLOOR_FURNITURE / ALL_CHAIRS + кількість) →
  5) блок у `layoutBaseline.test.ts` → 6) `npx vitest run` (новий снапшот
  запишеться сам; `-u` потрібен лише для ЗМІНИ наявних координат).
- **PowerShell 5.1:** немає `&&`/`??`/`?.`; `gh` відсутній — PR через
  GitHub MCP; pre-push хук жене `npm run verify`.
- Правила білдерів/матеріалів/тіней — `src/infrastructure/three/CLAUDE.md`;
  shrink-допуски SAT і політика еталона — `src/domain/CLAUDE.md`.

---
Останнє оновлення: 2026-07-17
