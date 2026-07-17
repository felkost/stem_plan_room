# insights.md — src/presentation

> Append-only. Add new entries at the bottom of the correct section.
> Discovery bar: "Would a fresh agent save ≥10 minutes from reading this?" If not, skip.
> Format: `**YYYY-MM-DD [Category]** — actionable sentence. \`file:line\``
> See `.claude/skills/engineering-insights/` for full criteria and format rules.

## Patterns
<!-- Reusable approaches that worked in this module. -->

## Mistakes
<!-- Failure modes, antipatterns, wrong assumptions. Prioritize this section. -->

## Decisions
<!-- Architectural or design choices with the reasoning behind them. -->
- **2026-07-17 [Decision]** — React Compiler відхилено при міграції на React 19: UI — 5 дрібних компонентів зі станом лише на кліки (пресет/якість/довідка/тост), виміряної проблеми ререндерів немає, а компілятор не прискорює WebGL render-loop (він у infrastructure). Повертатися лише якщо UI виросте й профілювання покаже проблему.

## Quirks
- **2026-07-17 [Quirk]** — Вбудована панель браузера (превʼю Claude Code) не емулює `pointer: coarse` навіть на мобільних розмірах в'юпорта: гілки `@media (pointer: coarse)` (44px-цілі) та сенсорний варіант довідки не активуються. Геометрію лейаута перевіряти можна через getBoundingClientRect, але coarse-поведінку — лише на реальному пристрої (`npm run dev -- --host`). `src/presentation/styles.css`
- **2026-07-17 [Quirk]** — `@types/react@19` прибрав глобальний UMD-неймспейс `React`: тип `React.ReactNode` без імпорту більше не резолвиться і `tsc` падає. Використовуй іменований імпорт: `import type { ReactNode } from 'react'`. Це був єдиний код-блокер міграції 18→19 (решта коду вже без legacy: createRoot, jsx: react-jsx). `src/presentation/Toolbar.tsx`

## Open Questions
<!-- Unresolved. Convert to an entry in the appropriate section when answered. -->

---
Last updated: 2026-07-17 · Entries: 3
