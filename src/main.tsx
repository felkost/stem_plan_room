/**
 * Composition root (Onion Architecture):
 * інфраструктурні реалізації створюються тут і впорскуються
 * в application-сервіси та React-презентацію через порти.
 */
import { createRoot } from 'react-dom/client';
import { MediaCaptureService } from './application/MediaCaptureService';
import { ViewerService } from './application/ViewerService';
import { detectDeviceProfile, resolveInitialQuality } from './infrastructure/device/deviceProfile';
import { saveBlobToDevice } from './infrastructure/media/download';
import { MediaRecorderVideoService } from './infrastructure/media/MediaRecorderVideoService';
import { ThreeSceneRenderer } from './infrastructure/three/ThreeSceneRenderer';
import { App } from './presentation/App';
import './presentation/styles.css';

const deviceProfile = detectDeviceProfile();
const initialQuality = resolveInitialQuality(deviceProfile);
const renderer = new ThreeSceneRenderer(initialQuality);
const viewer = new ViewerService(renderer);
const media = new MediaCaptureService(renderer, new MediaRecorderVideoService(), saveBlobToDevice);

/**
 * Стартовий лоадер живе в index.html (інлайн-CSS, видимий до завантаження
 * бандла); ховаємо його з фейдом після побудови сцени. Страхувальний таймер —
 * на випадок, коли transition не спрацює (reduced motion тощо).
 */
const hideBootLoader = () => {
  const boot = document.getElementById('boot-loader');
  if (!boot) return;
  boot.classList.add('boot-loader--hidden');
  boot.addEventListener('transitionend', () => boot.remove(), { once: true });
  window.setTimeout(() => boot.remove(), 700);
};

if (import.meta.env.DEV) {
  // дебаг-хук для інструментів розробки
  (window as unknown as Record<string, unknown>).__app = { renderer, viewer, media };
}

createRoot(document.getElementById('root')!).render(
  <App
    renderer={renderer}
    viewer={viewer}
    media={media}
    initialQuality={initialQuality}
    isTouch={deviceProfile.coarsePointer}
    onSceneReady={hideBootLoader}
  />,
);
