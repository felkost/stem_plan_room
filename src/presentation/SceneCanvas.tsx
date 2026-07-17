import { useEffect, useRef } from 'react';
import type { ISceneRenderer } from '../application/ports';

interface Props {
  renderer: ISceneRenderer;
  /** Викликається після побудови сцени (mount відкладено на кадр після першого пейнта). */
  onReady?: () => void;
}

/** Хост для three.js-канваса: монтує рендерер у div і прибирає його при демонтажі. */
export function SceneCanvas({ renderer, onReady }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // Важка синхронна збірка сцени відкладена подвійним rAF на кадр ПІСЛЯ
    // першого пейнта: стартовий лоадер встигає з'явитись, а його
    // transform-анімація вже йде на компазиторі й не завмирає, поки
    // main thread будує сцену. Таймер-фолбек — для прихованої вкладки,
    // де rAF заморожений (сцена має змонтуватися й там).
    let started = false;
    const start = () => {
      if (started) return;
      started = true;
      renderer.mount(el);
      onReady?.();
    };
    let raf2 = 0;
    const raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(start);
    });
    const fallback = window.setTimeout(start, 400);
    return () => {
      started = true;
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
      window.clearTimeout(fallback);
      renderer.dispose();
    };
  }, [renderer]);

  return <div className="scene-canvas" ref={ref} />;
}
