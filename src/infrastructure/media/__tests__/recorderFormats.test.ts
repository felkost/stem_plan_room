/**
 * Вибір формату відеозапису за можливостями браузера:
 * WebM для Chrome/Firefox/Edge, MP4-фолбек для Safari (iOS), null — без запису.
 */
import { describe, expect, it } from 'vitest';
import { pickRecorderFormat } from '../recorderFormats';

describe('pickRecorderFormat', () => {
  it('Chrome/Firefox: обирає WebM (VP9 у пріоритеті)', () => {
    const format = pickRecorderFormat((m) => m.startsWith('video/webm'));
    expect(format).toEqual({ mimeType: 'video/webm;codecs=vp9', extension: 'webm' });
  });

  it('Safari на iOS (без WebM): фолбек на MP4', () => {
    const format = pickRecorderFormat((m) => m.startsWith('video/mp4'));
    expect(format?.extension).toBe('mp4');
    expect(format?.mimeType).toContain('video/mp4');
  });

  it('WebM має пріоритет над MP4, якщо підтримуються обидва', () => {
    const format = pickRecorderFormat(() => true);
    expect(format?.extension).toBe('webm');
  });

  it('жоден формат не підтримується → null (кнопку запису сховано)', () => {
    expect(pickRecorderFormat(() => false)).toBeNull();
  });
});
