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

## Quirks
- **2026-07-17 [Quirk]** — Вбудована панель браузера (превʼю Claude Code) не емулює `pointer: coarse` навіть на мобільних розмірах в'юпорта: гілки `@media (pointer: coarse)` (44px-цілі) та сенсорний варіант довідки не активуються. Геометрію лейаута перевіряти можна через getBoundingClientRect, але coarse-поведінку — лише на реальному пристрої (`npm run dev -- --host`). `src/presentation/styles.css`

## Open Questions
<!-- Unresolved. Convert to an entry in the appropriate section when answered. -->

---
Last updated: 2026-07-17 · Entries: 1
