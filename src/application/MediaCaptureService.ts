/**
 * Application: сценарії захоплення медіа — скріншот сцени та відеозапис.
 * Файли генеруються на клієнті та зберігаються на машину користувача через FileSaver.
 */
import type { FileSaver, ISceneRenderer, IVideoRecorder } from './ports';

function timestamp(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}_${pad(d.getHours())}-${pad(d.getMinutes())}-${pad(d.getSeconds())}`;
}

export class MediaCaptureService {
  constructor(
    private readonly renderer: ISceneRenderer,
    private readonly recorder: IVideoRecorder,
    private readonly saveFile: FileSaver,
  ) {}

  get isRecordingSupported(): boolean {
    return this.recorder.isSupported;
  }

  async takeScreenshot(): Promise<void> {
    const blob = await this.renderer.captureFrame();
    this.saveFile(blob, `stem-kabinet_${timestamp()}.png`);
  }

  startRecording(): void {
    const stream = this.renderer.getCaptureStream(30);
    this.recorder.start(stream);
  }

  async stopRecording(): Promise<void> {
    const blob = await this.recorder.stop();
    this.saveFile(blob, `stem-kabinet_${timestamp()}.${this.recorder.fileExtension}`);
  }
}
