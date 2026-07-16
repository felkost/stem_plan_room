import type { QualityLevel } from '../domain/entities';
import type { ViewerService } from '../application/ViewerService';

interface Props {
  viewer: ViewerService;
  activePreset: string;
  onPreset: (id: string) => void;
  autoRotate: boolean;
  onAutoRotate: (on: boolean) => void;
  quality: QualityLevel;
  onQuality: (q: QualityLevel) => void;
  children?: React.ReactNode;
}

/** Панель керування: пресети камери, автообертання, якість + медіа-кнопки. */
export function Toolbar({ viewer, activePreset, onPreset, autoRotate, onAutoRotate, quality, onQuality, children }: Props) {
  return (
    <div className="toolbar ui-card">
      {viewer.presets.map((p) => (
        <button
          key={p.id}
          className={`btn${activePreset === p.id ? ' active' : ''}`}
          onClick={() => onPreset(p.id)}
        >
          {p.label}
        </button>
      ))}
      <div className="divider" />
      <button
        className={`btn${autoRotate ? ' active' : ''}`}
        onClick={() => onAutoRotate(!autoRotate)}
        title="Автоматичне обертання сцени перед камерою"
      >
        ⟳ Обертання
      </button>
      <button
        className="btn"
        onClick={() => onQuality(quality === 'high' ? 'low' : 'high')}
        title="Перемикач якості графіки (тіні, роздільність)"
      >
        {quality === 'high' ? '✦ Висока якість' : '✧ Швидкий режим'}
      </button>
      <div className="divider" />
      {children}
    </div>
  );
}
