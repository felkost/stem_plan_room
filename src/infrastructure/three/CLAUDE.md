# infrastructure/three/ — конвенції 3D-шару

## Білдери (builders/, robots/)

- Кожен білдер повертає `THREE.Group` із центром у (0,0) по x/z, **низом на
  y=0 і фронтом у +z** (кут 0 у Sweet Home 3D). Розстановка — лише через
  `placeItem()` з common.ts (конвертує см → м і кут CW → -rotation.y).
- Спільні матеріали (laminateMat, steelFrameMat, chromeMat…) створюються
  **один раз на модуль** — використовуй наявні, не створюй копій у білдерах.
- Усі текстури — процедурні canvas у textures.ts (`makeCanvas` → `toTexture`).
  Жодних зовнішніх файлів/URL. Для стабільного вигляду між перезапусками —
  детермінований seed-рандом, як у makePosterTexture.

## Світло й тіні

- Сонце світить крізь вікна: об'єкти, що НЕ мають блокувати світло
  (скло, ламелі жалюзі), позначай `mesh.userData.noShadowCast = true` —
  room.ts у фінальному traverse вимикає їм castShadow.
- Емісивні поверхні (екрани, LED) — emissiveMap + emissiveIntensity;
  самі джерела світла — тільки в lighting.ts.

## Dollhouse і рендерер

- Кожна стіна — WallSet із правилом `isVisible(камера, margin)`; нову стіну
  додавай і в масив wallSets. Стеля ховається при погляді згори.
- `ThreeSceneRenderer`: якість 'low' = без тіней + pixelRatio 1 (стартове
  значення обирає composition root за профілем пристрою). `captureFrame()`
  робить примусовий синхронний рендер — працює навіть без активного rAF.
