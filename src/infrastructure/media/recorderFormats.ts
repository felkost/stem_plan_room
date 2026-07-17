/**
 * Вибір формату відеозапису: WebM (Chrome/Firefox/Edge) з фолбеком на MP4
 * (Safari на iOS/macOS не підтримує WebM у MediaRecorder).
 * Чиста функція — тестується без браузера через переданий предикат.
 */

export interface RecorderFormat {
  mimeType: string;
  extension: 'webm' | 'mp4';
}

const FORMAT_CANDIDATES: RecorderFormat[] = [
  { mimeType: 'video/webm;codecs=vp9', extension: 'webm' },
  { mimeType: 'video/webm;codecs=vp8', extension: 'webm' },
  { mimeType: 'video/webm', extension: 'webm' },
  { mimeType: 'video/mp4;codecs=avc1', extension: 'mp4' },
  { mimeType: 'video/mp4', extension: 'mp4' },
];

/** Перший підтримуваний формат за пріоритетом або null, якщо запис недоступний. */
export function pickRecorderFormat(
  isTypeSupported: (mimeType: string) => boolean,
): RecorderFormat | null {
  return FORMAT_CANDIDATES.find((f) => isTypeSupported(f.mimeType)) ?? null;
}
