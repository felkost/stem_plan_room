/**
 * Інфраструктура: визначення профілю пристрою (телефон/планшет/десктоп).
 * Детекція читає браузерні API лише в момент виклику; правила-рішення —
 * чисті функції, придатні для unit-тестів без DOM.
 */
import type { QualityLevel } from '../../domain/entities';

export interface DeviceProfile {
  /** Основний спосіб вводу — дотик (pointer: coarse). */
  coarsePointer: boolean;
  /** В'юпорт телефонного розміру (менша сторона < 700 CSS px). */
  smallViewport: boolean;
  /** Браузер повідомляє, що це мобільний пристрій (UA-Client-Hints або UA). */
  mobileUA: boolean;
}

/** Прочитати профіль поточного пристрою з браузерних API. */
export function detectDeviceProfile(): DeviceProfile {
  const uaData = (navigator as Navigator & { userAgentData?: { mobile?: boolean } }).userAgentData;
  return {
    coarsePointer: window.matchMedia('(pointer: coarse)').matches,
    smallViewport: Math.min(window.innerWidth, window.innerHeight) < 700,
    mobileUA: uaData?.mobile ?? /iPhone|iPad|iPod|Android/i.test(navigator.userAgent),
  };
}

/** Телефон/планшет: сенсорний ввід у поєднанні з малим екраном або мобільним UA. */
export function isMobileLike(profile: DeviceProfile): boolean {
  return profile.coarsePointer && (profile.smallViewport || profile.mobileUA);
}

/**
 * Стартова якість графіки: на мобільних — «швидкий режим» (без тіней,
 * pixel ratio 1) заради плавності й батареї; користувач може ввімкнути
 * високу якість перемикачем у тулбарі.
 */
export function resolveInitialQuality(profile: DeviceProfile): QualityLevel {
  return isMobileLike(profile) ? 'low' : 'high';
}
