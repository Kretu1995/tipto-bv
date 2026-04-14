import { useMemo } from "react";
import { getFinishOptions } from "../lib/defaults";

/**
 * Visual configuration strip.
 *
 * Renders horizontal groups of option chips for every configurable property.
 * Each chip shows an icon + label; the active one gets the accent style.
 *
 * NOTE: The "Stijl" (railing style) selector is intentionally absent.
 * The style is fixed internally to "architect" and is never shown to the customer.
 */

// ── Static icon maps ──────────────────────────────────────────────────────────

const INFILL_ICONS = {
  "glas":                  "▭",
  "verticale-spijlen":     "⦀",
  "horizontale-profielen": "≡",
  "horizontale-staven":    "⑇",
  "lamellen":              "▬",
};

const MATERIAL_ICONS = {
  "aluminium":              "◈",
  "rvs":                    "◎",
  "gepoedercoat-staal":     "◼",
};

const MOUNTING_ICONS = {
  "vloer":      "⊥",
  "zijmontage": "⊢",
};

// ── Chip ──────────────────────────────────────────────────────────────────────

function Chip({ icon, label, active, onClick, colorHex }) {
  return (
    <button
      className={`co-chip${active ? " co-chip--active" : ""}`}
      onClick={onClick}
      type="button"
    >
      {colorHex && (
        <span
          className="co-chip__swatch"
          style={{ background: colorHex }}
          aria-hidden
        />
      )}
      {!colorHex && icon && (
        <span className="co-chip__icon" aria-hidden>{icon}</span>
      )}
      {label}
    </button>
  );
}

// ── Group ─────────────────────────────────────────────────────────────────────

function Group({ label, children }) {
  return (
    <div className="co-group">
      <span className="co-group__label">{label}</span>
      <div className="co-group__chips">{children}</div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

function ConfigOptions({ config, selection, onChange }) {
  const product = config?.product ?? {};

  const infills  = product.infills         ?? [];
  const materials= product.materials       ?? [];
  const mountings= product.mountings       ?? [];
  const extras   = product.extra_options   ?? [];

  const finishOptions = useMemo(
    () => getFinishOptions(product.finishes ?? [], selection.material),
    [product.finishes, selection.material]
  );

  const heightRange = product.height_range ?? { min: 60, max: 120 };
  const heightStep  = 5;

  return (
    <div className="co">

      {/* ── Vulling ── */}
      {infills.length > 0 && (
        <Group label="Vulling">
          {infills.map(inf => (
            <Chip
              key={inf.value}
              icon={INFILL_ICONS[inf.value] ?? "▭"}
              label={inf.label}
              active={selection.infill === inf.value}
              onClick={() => onChange("infill", inf.value)}
            />
          ))}
        </Group>
      )}

      {/* ── Materiaal ── */}
      {materials.length > 0 && (
        <Group label="Materiaal">
          {materials.map(m => (
            <Chip
              key={m.value}
              icon={MATERIAL_ICONS[m.value] ?? "◈"}
              label={m.label}
              active={selection.material === m.value}
              onClick={() => onChange("material", m.value)}
            />
          ))}
        </Group>
      )}

      {/* ── Afwerking ── */}
      {finishOptions.length > 0 && (
        <Group label="Afwerking">
          {finishOptions.map(f => (
            <Chip
              key={f.value}
              label={f.label}
              colorHex={f.hex}
              active={selection.finish === f.value}
              onClick={() => onChange("finish", f.value)}
            />
          ))}
        </Group>
      )}

      {/* ── Montage ── */}
      {mountings.length > 0 && (
        <Group label="Montage">
          {mountings.map(mt => (
            <Chip
              key={mt.value}
              icon={MOUNTING_ICONS[mt.value] ?? "⊥"}
              label={mt.label}
              active={selection.mounting === mt.value}
              onClick={() => onChange("mounting", mt.value)}
            />
          ))}
        </Group>
      )}

      {/* ── Hoogte ── */}
      <Group label={`Hoogte — ${selection.height} cm`}>
        <div className="co-slider-wrap">
          <span className="co-slider-bound">{heightRange.min} cm</span>
          <input
            className="co-slider"
            type="range"
            min={heightRange.min}
            max={heightRange.max}
            step={heightStep}
            value={selection.height}
            onChange={e => onChange("height", Number(e.target.value))}
          />
          <span className="co-slider-bound">{heightRange.max} cm</span>
        </div>
      </Group>

      {/* ── Extra opties ── */}
      {extras.length > 0 && (
        <Group label="Extra's">
          {extras.map(opt => {
            const active = (selection.extraOptions ?? []).includes(opt.value);
            return (
              <button
                key={opt.value}
                className={`co-chip co-chip--toggle${active ? " co-chip--active" : ""}`}
                type="button"
                onClick={() => {
                  const cur = selection.extraOptions ?? [];
                  onChange(
                    "extraOptions",
                    active ? cur.filter(v => v !== opt.value) : [...cur, opt.value],
                  );
                }}
              >
                {active ? "✓ " : ""}{opt.label}
                {opt.price_display && (
                  <span className="co-chip__price"> +{opt.price_display}</span>
                )}
              </button>
            );
          })}
        </Group>
      )}
    </div>
  );
}

export default ConfigOptions;
