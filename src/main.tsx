/**
 * Composition root (Onion Architecture):
 * інфраструктурні реалізації створюються тут і впорскуються
 * в application-сервіси та React-презентацію через порти.
 */
import { createRoot } from 'react-dom/client';
import { MediaCaptureService } from './application/MediaCaptureService';
import { ViewerService } from './application/ViewerService';
import { saveBlobToDevice } from './infrastructure/media/download';
import { MediaRecorderVideoService } from './infrastructure/media/MediaRecorderVideoService';
import { ThreeSceneRenderer } from './infrastructure/three/ThreeSceneRenderer';
import { App } from './presentation/App';
import './presentation/styles.css';

const renderer = new ThreeSceneRenderer();
const viewer = new ViewerService(renderer);
const media = new MediaCaptureService(renderer, new MediaRecorderVideoService(), saveBlobToDevice);

if (import.meta.env.DEV) {
  // дебаг-хук для інструментів розробки
  (window as unknown as Record<string, unknown>).__app = { renderer, viewer, media };
}

createRoot(document.getElementById('root')!).render(
  <App renderer={renderer} viewer={viewer} media={media} />,
);
