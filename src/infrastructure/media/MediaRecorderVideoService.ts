/**
 * Реалізація порту IVideoRecorder на MediaRecorder API.
 * Записує canvas-потік у WebM (VP9 → VP8 → за замовчуванням).
 */
import type { IVideoRecorder } from '../../application/ports';

const MIME_CANDIDATES = ['video/webm;codecs=vp9', 'video/webm;codecs=vp8', 'video/webm'];

export class MediaRecorderVideoService implements IVideoRecorder {
  private recorder: MediaRecorder | null = null;
  private chunks: Blob[] = [];
  private mimeType = '';

  get isSupported(): boolean {
    return typeof MediaRecorder !== 'undefined' && MIME_CANDIDATES.some((m) => MediaRecorder.isTypeSupported(m));
  }

  get fileExtension(): string {
    return 'webm';
  }

  start(stream: MediaStream): void {
    if (this.recorder) throw new Error('Запис уже триває');
    this.mimeType = MIME_CANDIDATES.find((m) => MediaRecorder.isTypeSupported(m)) ?? '';
    this.chunks = [];
    this.recorder = new MediaRecorder(stream, {
      mimeType: this.mimeType || undefined,
      videoBitsPerSecond: 8_000_000,
    });
    this.recorder.ondataavailable = (e) => {
      if (e.data.size > 0) this.chunks.push(e.data);
    };
    this.recorder.start(250);
  }

  stop(): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const recorder = this.recorder;
      if (!recorder) {
        reject(new Error('Запис не розпочато'));
        return;
      }
      recorder.onstop = () => {
        const blob = new Blob(this.chunks, { type: this.mimeType || 'video/webm' });
        this.chunks = [];
        this.recorder = null;
        // зупинити треки потоку
        recorder.stream.getTracks().forEach((track) => track.stop());
        resolve(blob);
      };
      recorder.stop();
    });
  }
}
