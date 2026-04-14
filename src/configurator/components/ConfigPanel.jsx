import { getLabelByValue } from "../lib/defaults";

function OptionCards({ title, options, value, onChange }) {
  return (
    <div className="tipto-field">
      <div className="tipto-field-label">{title}</div>
      <div className="tipto-card-options">
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            className={`tipto-card-option ${value === option.value ? "is-active" : ""}`}
            onClick={() => onChange(option.value)}
          >
            <strong>{option.label}</strong>
            {option.description ? <span>{option.description}</span> : null}
          </button>
        ))}
      </div>
    </div>
  );
}

function ConfigPanel({
  config,
  finishOptions,
  selection,
  onChange,
  onToggleExtraOption
}) {
  const product = config?.product ?? {};
  const brand = config?.brand ?? {};

  return (
    <section className="tipto-panel">
      <div className="tipto-panel-header">
        <div>
          <h2>Configureer uw balustrade</h2>
          <p>Pas afmetingen, uitstraling en montage aan. De preview werkt meteen mee.</p>
        </div>
        <div className="tipto-price-pill">{brand.price_label ?? "Prijs op aanvraag"}</div>
      </div>

      <OptionCards
        title="Type balustrade"
        options={product.railing_styles ?? []}
        value={selection.railingStyle}
        onChange={(value) => onChange("railingStyle", value)}
      />

      <div className="tipto-field-grid">
        <label className="tipto-range">
          <span className="tipto-field-label">
            Lengte
            <strong>{selection.length} cm</strong>
          </span>
          <input
            type="range"
            min={product.length_range?.min}
            max={product.length_range?.max}
            step={product.length_range?.step}
            value={selection.length}
            onChange={(event) => onChange("length", Number(event.target.value))}
          />
        </label>

        <label className="tipto-range">
          <span className="tipto-field-label">
            Hoogte
            <strong>{selection.height} cm</strong>
          </span>
          <input
            type="range"
            min={product.height_range?.min}
            max={product.height_range?.max}
            step={product.height_range?.step}
            value={selection.height}
            onChange={(event) => onChange("height", Number(event.target.value))}
          />
        </label>

        <label className="tipto-range">
          <span className="tipto-field-label">
            Profieldiepte
            <strong>{selection.depth} cm</strong>
          </span>
          <input
            type="range"
            min={product.depth_range?.min}
            max={product.depth_range?.max}
            step={product.depth_range?.step}
            value={selection.depth}
            onChange={(event) => onChange("depth", Number(event.target.value))}
          />
        </label>
      </div>

      <OptionCards
        title="Materiaal"
        options={product.materials ?? []}
        value={selection.material}
        onChange={(value) => onChange("material", value)}
      />

      <div className="tipto-field">
        <div className="tipto-field-label">Kleur / afwerking</div>
        <div className="tipto-swatch-grid">
          {finishOptions.map((finish) => (
            <button
              key={finish.value}
              type="button"
              className={`tipto-swatch ${selection.finish === finish.value ? "is-active" : ""}`}
              onClick={() => onChange("finish", finish.value)}
            >
              <span className="tipto-swatch-chip" style={{ backgroundColor: finish.hex }} />
              <span>{finish.label}</span>
            </button>
          ))}
        </div>
      </div>

      <OptionCards
        title="Type vulling"
        options={product.infills ?? []}
        value={selection.infill}
        onChange={(value) => onChange("infill", value)}
      />

      <OptionCards
        title="Montage"
        options={product.mountings ?? []}
        value={selection.mounting}
        onChange={(value) => onChange("mounting", value)}
      />

      <div className="tipto-field">
        <div className="tipto-field-label">Extra opties</div>
        <div className="tipto-check-grid">
          {(product.extra_options ?? []).map((option) => (
            <label key={option.value} className="tipto-check-item">
              <input
                type="checkbox"
                checked={selection.extraOptions.includes(option.value)}
                onChange={() => onToggleExtraOption(option.value)}
              />
              <span>{option.label}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="tipto-config-note">
        <strong>{brand.name}</strong>
        <span>
          {getLabelByValue(product.materials, selection.material)} en{" "}
          {getLabelByValue(finishOptions, selection.finish)} vormen de actieve afwerking.
        </span>
      </div>
    </section>
  );
}

export default ConfigPanel;
