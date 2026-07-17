/**
 * Правила визначення мобільного пристрою та стартової якості графіки.
 * Тестуються лише чисті функції-рішення (без браузерних API).
 */
import { describe, expect, it } from 'vitest';
import { isMobileLike, resolveInitialQuality, type DeviceProfile } from '../deviceProfile';

const profile = (p: Partial<DeviceProfile>): DeviceProfile => ({
  coarsePointer: false,
  smallViewport: false,
  mobileUA: false,
  ...p,
});

describe('isMobileLike', () => {
  it('iPhone: дотик + малий екран + мобільний UA → мобільний', () => {
    expect(isMobileLike(profile({ coarsePointer: true, smallViewport: true, mobileUA: true }))).toBe(true);
  });

  it('планшет із мобільним UA, але великим екраном → мобільний', () => {
    expect(isMobileLike(profile({ coarsePointer: true, mobileUA: true }))).toBe(true);
  });

  it('десктоп із мишею → не мобільний', () => {
    expect(isMobileLike(profile({}))).toBe(false);
  });

  it('десктоп із вузьким вікном браузера (без дотику) → не мобільний', () => {
    expect(isMobileLike(profile({ smallViewport: true }))).toBe(false);
  });

  it('сенсорний моноблок із великим екраном і десктопним UA → не мобільний', () => {
    expect(isMobileLike(profile({ coarsePointer: true }))).toBe(false);
  });
});

describe('resolveInitialQuality', () => {
  it('мобільний → "low" (швидкий режим без тіней)', () => {
    expect(resolveInitialQuality(profile({ coarsePointer: true, smallViewport: true }))).toBe('low');
  });

  it('десктоп → "high"', () => {
    expect(resolveInitialQuality(profile({}))).toBe('high');
  });
});
