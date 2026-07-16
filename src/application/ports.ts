/**
 * Application: порти (інтерфейси), які реалізує інфраструктурний шар.
 * Залежить лише від domain.
 */
import type { CameraPreset, QualityLevel } from '../domain/entities';

/** Порт 3D-рендерера сцени. */
export interface ISceneRenderer {
  /** Змонтувати canvas у контейнер і запустити цикл рендерингу. */
  mount(container: HTMLElement): void;
  dispose(): void;
  applyPreset(preset: CameraPreset): void;
  setAutoRotate(on: boolean): void;
  setQuality(quality: QualityLevel): void;
  /** Кадр сцени як PNG-Blob (рендер виконується примусово перед захопленням). */
  captureFrame(): Promise<Blob>;
  /** Відеопотік із canvas для запису. */
  getCaptureStream(fps: number): MediaStream;
}

/** Порт відеозапису. */
export interface IVideoRecorder {
  readonly isSupported: boolean;
  start(stream: MediaStream): void;
  /** Зупинити запис і повернути готовий файл. */
  stop(): Promise<Blob>;
  /** Розширення файлу для поточного кодека (webm). */
  readonly fileExtension: string;
}

/** Порт збереження файлу на машину користувача. */
export type FileSaver = (blob: Blob, fileName: string) => void;
