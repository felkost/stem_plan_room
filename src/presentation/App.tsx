import { useCallback, useEffect, useRef, useState } from 'react';
import type { MediaCaptureService } from '../application/MediaCaptureService';
import type { ISceneRenderer } from '../application/ports';
import type { ViewerService } from '../application/ViewerService';
import { SCENE_TITLE } from '../domain/classroomLayout';
import type { QualityLevel } from '../domain/entities';
import { CapturePanel } from './CapturePanel';
import { HelpOverlay } from './HelpOverlay';
import { SceneCanvas } from './SceneCanvas';
import { Toolbar } from './Toolbar';

interface Props {
  renderer: ISceneRenderer;
  viewer: ViewerService;
  media: MediaCaptureService;
  /** Стартова якість, визначена за профілем пристрою в composition root. */
  initialQuality: QualityLevel;
  /** Основний ввід — дотик: інша довідка та підказки. */
  isTouch: boolean;
  /** Сцена готова — composition root ховає стартовий лоадер із index.html. */
  onSceneReady?: () => void;
}

export function App({ renderer, viewer, media, initialQuality, isTouch, onSceneReady }: Props) {
  const [activePreset, setActivePreset] = useState('overview');
  const [autoRotate, setAutoRotateState] = useState(true);
  const [quality, setQualityState] = useState<QualityLevel>(initialQuality);
  const [helpOpen, setHelpOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const toastKey = useRef(0);

  const showToast = useCallback((message: string) => {
    toastKey.current += 1;
    setToast(message);
  }, []);

  // Коли користувач береться за мишу/дотик, автообертання вимикається в рендерері —
  // синхронізуємо стан кнопки «Обертання»
  useEffect(() => {
    viewer.onUserTakeover(() => setAutoRotateState(false));
    return () => viewer.onUserTakeover(null);
  }, [viewer]);

  const handlePreset = (id: string) => {
    setActivePreset(id);
    viewer.applyPreset(id);
  };

  const handleAutoRotate = (on: boolean) => {
    setAutoRotateState(on);
    viewer.setAutoRotate(on);
  };

  const handleQuality = (q: QualityLevel) => {
    setQualityState(q);
    viewer.setQuality(q);
  };

  return (
    <div className="app">
      <SceneCanvas renderer={renderer} onReady={onSceneReady} />
      <div className="title-card ui-card">
        <h1>{SCENE_TITLE}</h1>
        <p>Інтерактивна 3D-модель кабінету за планом.</p>
      </div>
      <HelpOverlay open={helpOpen} onToggle={() => setHelpOpen((v) => !v)} isTouch={isTouch} />
      <Toolbar
        viewer={viewer}
        activePreset={activePreset}
        onPreset={handlePreset}
        autoRotate={autoRotate}
        onAutoRotate={handleAutoRotate}
        quality={quality}
        onQuality={handleQuality}
      >
        <CapturePanel media={media} onToast={showToast} />
      </Toolbar>
      {toast && (
        <div className="toast ui-card" key={toastKey.current} onAnimationEnd={() => setToast(null)}>
          {toast}
        </div>
      )}
    </div>
  );
}
