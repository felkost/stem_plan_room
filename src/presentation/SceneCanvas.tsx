import { useEffect, useRef } from 'react';
import type { ISceneRenderer } from '../application/ports';

interface Props {
  renderer: ISceneRenderer;
  /** Викликається одразу після побудови сцени (mount синхронний). */
  onReady?: () => void;
}

/** Хост для three.js-канваса: монтує рендерер у div і прибирає його при демонтажі. */
export function SceneCanvas({ renderer, onReady }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    renderer.mount(el);
    onReady?.();
    return () => renderer.dispose();
  }, [renderer]);

  return <div className="scene-canvas" ref={ref} />;
}
