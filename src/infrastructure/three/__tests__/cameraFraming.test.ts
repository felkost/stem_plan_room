import { describe, expect, it } from 'vitest';
import { framedFov } from '../cameraFraming';

describe('framedFov', () => {
  it('не змінює FOV на широких (landscape) екранах', () => {
    expect(framedFov(55, 16 / 9)).toBe(55);
    expect(framedFov(55, 21 / 9)).toBe(55);
  });

  it('розширює FOV на портретних екранах, з межею MAX_FOV', () => {
    const iphonePortrait = 375 / 812;
    const fov = framedFov(55, iphonePortrait);
    expect(fov).toBeGreaterThan(55);
    expect(fov).toBeLessThanOrEqual(78);
  });

  it('однаковий (клампований) FOV для дуже вузьких aspect', () => {
    expect(framedFov(55, 0.4)).toBe(framedFov(55, 0.2));
  });

  it('не ділить на нуль/від’ємне значення', () => {
    expect(framedFov(55, 0)).toBe(55);
    expect(framedFov(55, -1)).toBe(55);
  });
});
