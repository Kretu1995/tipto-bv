/**
 * Presets — 5 quick-start layout buttons.
 * Each preset is a list of {x, y} plan-coordinates (cm).
 * Clicking a preset calls onLoad(points), which triggers loadPreset() in useGeometry.
 */

const PRESETS = [
  {
    id: "recht",
    label: "Recht",
    points: [
      { x: 0,   y: 0 },
      { x: 300, y: 0 },
    ],
    // SVG: single horizontal line
    svg: (
      <svg width="36" height="24" viewBox="0 0 36 24" fill="none">
        <line x1="3" y1="12" x2="33" y2="12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
        <circle cx="3"  cy="12" r="2.5" fill="currentColor"/>
        <circle cx="33" cy="12" r="2.5" fill="currentColor"/>
      </svg>
    ),
  },
  {
    id: "l-vorm",
    label: "L-vorm",
    points: [
      { x: 0,   y: 200 },
      { x: 0,   y: 0   },
      { x: 250, y: 0   },
    ],
    svg: (
      <svg width="36" height="24" viewBox="0 0 36 24" fill="none">
        <polyline points="6,3 6,21 33,21" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
        <circle cx="6"  cy="3"  r="2.2" fill="currentColor"/>
        <circle cx="6"  cy="21" r="2.2" fill="currentColor"/>
        <circle cx="33" cy="21" r="2.2" fill="currentColor"/>
      </svg>
    ),
  },
  {
    id: "u-vorm",
    label: "U-vorm",
    points: [
      { x: 0,   y: 200 },
      { x: 0,   y: 0   },
      { x: 300, y: 0   },
      { x: 300, y: 200 },
    ],
    svg: (
      <svg width="36" height="24" viewBox="0 0 36 24" fill="none">
        <polyline points="4,3 4,21 32,21 32,3" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
        <circle cx="4"  cy="3"  r="2.2" fill="currentColor"/>
        <circle cx="4"  cy="21" r="2.2" fill="currentColor"/>
        <circle cx="32" cy="21" r="2.2" fill="currentColor"/>
        <circle cx="32" cy="3"  r="2.2" fill="currentColor"/>
      </svg>
    ),
  },
  {
    id: "hoek",
    label: "Hoek 90°",
    points: [
      { x: 0,   y: 0   },
      { x: 200, y: 0   },
      { x: 200, y: 200 },
    ],
    svg: (
      <svg width="36" height="24" viewBox="0 0 36 24" fill="none">
        <polyline points="3,21 20,21 20,3" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
        <circle cx="3"  cy="21" r="2.2" fill="currentColor"/>
        <circle cx="20" cy="21" r="2.2" fill="currentColor"/>
        <circle cx="20" cy="3"  r="2.2" fill="currentColor"/>
        <rect x="20" y="14" width="7" height="7" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.4"/>
      </svg>
    ),
  },
  {
    id: "trap",
    label: "Trappenhal",
    points: [
      { x: 0,   y: 0   },
      { x: 150, y: 0   },
      { x: 300, y: 150 },
      { x: 300, y: 300 },
    ],
    svg: (
      <svg width="36" height="24" viewBox="0 0 36 24" fill="none">
        <polyline points="3,21 14,21 28,7 28,3" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
        <circle cx="3"  cy="21" r="2.2" fill="currentColor"/>
        <circle cx="14" cy="21" r="2.2" fill="currentColor"/>
        <circle cx="28" cy="7"  r="2.2" fill="currentColor"/>
        <circle cx="28" cy="3"  r="2.2" fill="currentColor"/>
      </svg>
    ),
  },
];

function Presets({ onLoad }) {
  return (
    <div className="presets">
      <span className="presets__label">Snelstart</span>
      <div className="presets__list">
        {PRESETS.map(p => (
          <button
            key={p.id}
            className="presets__btn"
            type="button"
            title={p.label}
            onClick={() => onLoad(p.points)}
          >
            <span className="presets__icon" aria-hidden>{p.svg}</span>
            <span className="presets__name">{p.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export default Presets;
