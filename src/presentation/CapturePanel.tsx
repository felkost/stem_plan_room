import { useEffect, useRef, useState } from 'react';
import type { MediaCaptureService } from '../application/MediaCaptureService';

interface Props {
  media: MediaCaptureService;
  onToast: (message: string) => void;
}

function formatTime(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

/** Кнопки захоплення: скріншот (PNG) і відеозапис (WebM/MP4) зі збереженням на пристрій. */
export function CapturePanel({ media, onToast }: Props) {
  const [recording, setRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [busy, setBusy] = useState(false);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current !== null) window.clearInterval(timerRef.current);
    };
  }, []);

  const takeScreenshot = async () => {
    setBusy(true);
    try {
      const saved = await media.takeScreenshot();
      onToast(saved ? 'Скріншот збережено на пристрій' : 'Збереження скасовано');
    } catch (e) {
      onToast(`Помилка скріншота: ${e instanceof Error ? e.message : e}`);
    } finally {
      setBusy(false);
    }
  };

  const toggleRecording = async () => {
    if (!recording) {
      try {
        media.startRecording();
        setSeconds(0);
        setRecording(true);
        timerRef.current = window.setInterval(() => setSeconds((s) => s + 1), 1000);
        onToast('Запис розпочато');
      } catch (e) {
        onToast(`Помилка запису: ${e instanceof Error ? e.message : e}`);
      }
    } else {
      if (timerRef.current !== null) {
        window.clearInterval(timerRef.current);
        timerRef.current = null;
      }
      setRecording(false);
      try {
        const saved = await media.stopRecording();
        onToast(saved ? 'Відео збережено на пристрій' : 'Збереження скасовано');
      } catch (e) {
        onToast(`Помилка збереження відео: ${e instanceof Error ? e.message : e}`);
      }
    }
  };

  return (
    <>
      <button className="btn" onClick={takeScreenshot} disabled={busy || recording} title="Зберегти кадр сцени у PNG">
        📷 Скріншот
      </button>
      {media.isRecordingSupported && (
        <button
          className={`btn${recording ? ' recording' : ''}`}
          onClick={toggleRecording}
          title="Записати відео сцени (WebM або MP4 — залежно від браузера)"
        >
          {recording ? `⏹ Зупинити (${formatTime(seconds)})` : '⏺ Запис відео'}
        </button>
      )}
    </>
  );
}
