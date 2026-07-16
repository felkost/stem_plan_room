/**
 * Application: сценарії керування переглядом сцени.
 */
import { CAMERA_PRESETS } from '../domain/classroomLayout';
import type { CameraPreset, QualityLevel } from '../domain/entities';
import type { ISceneRenderer } from './ports';

export class ViewerService {
  constructor(private readonly renderer: ISceneRenderer) {}

  get presets(): CameraPreset[] {
    return CAMERA_PRESETS;
  }

  applyPreset(id: string): void {
    const preset = CAMERA_PRESETS.find((p) => p.id === id);
    if (preset) this.renderer.applyPreset(preset);
  }

  setAutoRotate(on: boolean): void {
    this.renderer.setAutoRotate(on);
  }

  setQuality(quality: QualityLevel): void {
    this.renderer.setQuality(quality);
  }
}
