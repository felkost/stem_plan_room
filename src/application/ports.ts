/**
 * Application: порти (інтерфейси), які реалізує інфраструктурний шар.
 * Залежить лише від domain.
 */
import type { CameraPreset, QualityLevel } from '../domain/entities';

/** Порт 3D-рендерера сцени. */
export interface ISceneRenderer {
  /**
   * Змонтувати canvas у контейнер і запустити цикл рендерингу.
   * onFirstFrame — викликається після ПЕРШОГО фактичного render() (не
   * одразу після побудови сцени), щоб UI ховав лоадер лише коли кадр
   * справді намальовано, а не з фіксованою затримкою «навмання».
   */
  mount(container: HTMLElement, onFirstFrame?: () => void): void;
  dispose(): void;
  applyPreset(preset: CameraPreset): void;
  setAutoRotate(on: boolean): void;
  /**
   * Слухач «перехоплення» керування: викликається, коли користувач починає
   * обертати/масштабувати/зсувати сцену мишею чи дотиком (автообертання вимикається).
   */
  setUserTakeoverListener(listener: (() => void) | null): void;
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
  /** Розширення файлу для поточного кодека (webm/mp4). */
  readonly fileExtension: string;
}

/**
 * Порт збереження файлу на пристрій користувача.
 * Повертає true, якщо файл збережено/передано, і false, якщо користувач
 * скасував збереження (наприклад, закрив системне меню «Поділитися»).
 */
export type FileSaver = (blob: Blob, fileName: string) => Promise<boolean>;
