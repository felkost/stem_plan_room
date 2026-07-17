/**
 * Реалізація порту IVideoRecorder на MediaRecorder API.
 * Формат обирається за можливостями браузера: WebM (VP9 → VP8) або MP4
 * для Safari на iOS — див. recorderFormats.ts.
 */
import type { IVideoRecorder } from '../../application/ports';
import { pickRecorderFormat, type RecorderFormat } from './recorderFormats';

export class MediaRecorderVideoService implements IVideoRecorder {
  private recorder: MediaRecorder | null = null;
  private chunks: Blob[] = [];
  private format: RecorderFormat | null = null;

  private get supportedFormat(): RecorderFormat | null {
    if (typeof MediaRecorder === 'undefined') return null;
    return pickRecorderFormat((m) => MediaRecorder.isTypeSupported(m));
  }

  get isSupported(): boolean {
    return this.supportedFormat !== null;
  }

  get fileExtension(): string {
    // під час запису — формат, з яким його розпочато
    return (this.format ?? this.supportedFormat)?.extension ?? 'webm';
  }

  start(stream: MediaStream): void {
    if (this.recorder) throw new Error('Запис уже триває');
    this.format = this.supportedFormat;
    if (!this.format) throw new Error('Браузер не підтримує запис відео');
    this.chunks = [];
    this.recorder = new MediaRecorder(stream, {
      mimeType: this.format.mimeType,
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
      const format = this.format;
      if (!recorder || !format) {
        reject(new Error('Запис не розпочато'));
        return;
      }
      recorder.onstop = () => {
        const blob = new Blob(this.chunks, { type: format.mimeType });
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
