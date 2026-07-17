interface Props {
  hidden?: boolean;
}

const LETTERS: { letter: string; className: string }[] = [
  { letter: 'S', className: 'stem-s' },
  { letter: 'T', className: 'stem-t' },
  { letter: 'E', className: 'stem-e' },
  { letter: 'M', className: 'stem-m' },
];

/** Екран завантаження сцени: кола S-T-E-M обертаються по орбіті навколо центру. */
export function Loader({ hidden }: Props) {
  return (
    <div className={`loader${hidden ? ' loader--hidden' : ''}`} role="status" aria-label="Завантаження сцени">
      <div className="loader-orbit">
        {LETTERS.map(({ letter, className }) => (
          <span className={`loader-circle ${className}`} key={letter}>
            <span className="loader-label">{letter}</span>
          </span>
        ))}
      </div>
      <p className="loader-text">Завантаження сцени…</p>
    </div>
  );
}
