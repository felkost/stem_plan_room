# insights.md — src/infrastructure

> Append-only. Add new entries at the bottom of the correct section.
> Discovery bar: "Would a fresh agent save ≥10 minutes from reading this?" If not, skip.
> Format: `**YYYY-MM-DD [Category]** — actionable sentence. \`file:line\``
> See `.claude/skills/engineering-insights/` for full criteria and format rules.

## Patterns
- **2026-07-17 [Pattern]** — Кадр сцени можна зняти без видимої вкладки: у консолі сторінки `import('/src/infrastructure/three/ThreeSceneRenderer.ts')` (Vite dev-сервер віддає TS-модулі як ESM), `mount()` у div з явним розміром у style, `captureFrame()` → base64 → POST на локальний node-приймач; наприкінці `dispose()` і прибрати div. `src/infrastructure/three/ThreeSceneRenderer.ts:186`
  - **Дод. 2026-07-17:** для ВЕРИФІКАЦІЇ (коли рендерер уже змонтований застосунком) `computer screenshot` панелі падає по таймауту (`document.hidden` заморожує rAF), але сцена рендериться. Доказ непорожнього кадру без скріншота: у консолі `await window.__app.renderer.captureFrame()` (синхронний рендер) → `createImageBitmap` → намалювати в `OffscreenCanvas` → перевірити середню яскравість і к-сть різних кольорів `getImageData`. Так підтверджено, що міграція React 19 не «збілила» сцену (яскравість 206, 90 кольорів).

## Mistakes
<!-- Failure modes, antipatterns, wrong assumptions. Prioritize this section. -->

## Decisions
<!-- Architectural or design choices with the reasoning behind them. -->
- **2026-07-17 [Decision]** — OffscreenCanvas+Worker і WebGPU-бекенд відхилено (оцінка 2026 разом із міграцією React 19): капчер-пайплайн зав'язаний на DOM-canvas (`toDataURL` для скріншота, `captureStream(fps)` для MediaRecorder), OrbitControls слухає DOM-події канваса — перенесення рендерингу в Worker зламало б їх і прийом зйомки кадру з прихованої вкладки (див. Pattern вище). WebGL2 достатньо для однієї кімнати. Точка майбутньої заміни бекенда (WebGPU/static fallback) — порт `ISceneRenderer` (application/ports): заміна локалізується в infrastructure без дотику до application/presentation. `src/infrastructure/three/ThreeSceneRenderer.ts`

## Quirks
- **2026-07-17 [Quirk]** — Прихована вкладка (`document.hidden === true`) заморожує rAF і колбеки ResizeObserver: цикл `setAnimationLoop` не рендерить, canvas лишається 0×0 або зі застарілим розміром, а скріншот вбудованої панелі браузера падає по таймауту. `captureFrame()` при цьому працює, бо викликає `renderer.render()` синхронно, без rAF. `src/infrastructure/three/ThreeSceneRenderer.ts:100`

## Open Questions
<!-- Unresolved. Convert to an entry in the appropriate section when answered. -->

---
Last updated: 2026-07-17 · Entries: 4
