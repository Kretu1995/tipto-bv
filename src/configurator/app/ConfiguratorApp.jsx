import { useState, useCallback, useMemo } from "react";

import Planner2D     from "../components/Planner2D";
import Scene3D       from "../components/Scene3D";
import ConfigOptions from "../components/ConfigOptions";
import QuoteModal    from "../components/QuoteModal";
import PhotoPanel    from "../components/PhotoPanel";
import Presets       from "../components/Presets";

import { useGeometry }  from "../hooks/useGeometry";
import { usePrice }     from "../hooks/usePrice";
import { formatEur }    from "../lib/pricing";
import {
  createInitialState,
  getFinishOptions,
  getLabelByValue,
  FIXED_RAILING_STYLE,
} from "../lib/defaults";


function ConfiguratorApp({ config }) {
  const product = config?.product ?? {};

  // ── Geometry ──────────────────────────────────────────────────────────────
  const {
    geo,
    vertices,
    segments,
    totalLength,
    moveVertex,
    changeVertexRounding,
    placeVertex,
    connectVertices,
    deleteSegment,
    deleteVertex,
    changeSegmentLength,
    changeSegmentRise,
    clear,
    undo,
    sealHistory,
    canUndo,
    resetToLength,
    loadPreset,
  } = useGeometry();

  // ── Selection (railingStyle is NOT in here — always FIXED_RAILING_STYLE) ──
  const [selection, setSelection] = useState(() => createInitialState(config));

  const updateSelection = useCallback((field, value) => {
    setSelection(cur => {
      const next = { ...cur, [field]: value };
      if (field === "material") {
        const avail = getFinishOptions(product.finishes ?? [], value);
        if (!avail.some(f => f.value === cur.finish)) {
          next.finish = avail[0]?.value ?? cur.finish;
        }
      }
      return next;
    });
  }, [product.finishes]);

  // ── AI hints ──────────────────────────────────────────────────────────────
  const applyAIHints = useCallback((hints) => {
    if (!hints) return;
    if (hints.estimated_length_cm && hints.estimated_length_cm > 10) {
      resetToLength(hints.estimated_length_cm);
    }
    setSelection(cur => {
      const next = { ...cur };
      if (hints.estimated_height_cm) {
        const { min = 80, max = 120 } = product.height_range ?? {};
        next.height = Math.max(min, Math.min(max, hints.estimated_height_cm));
      }
      if (hints.suggested_material) {
        const allowed = (product.materials ?? []).map(m => m.value);
        if (allowed.includes(hints.suggested_material)) {
          next.material = hints.suggested_material;
          const avail = getFinishOptions(product.finishes ?? [], hints.suggested_material);
          next.finish = avail[0]?.value ?? cur.finish;
        }
      }
      if (hints.suggested_infill) {
        const allowed = (product.infills ?? []).map(i => i.value);
        if (allowed.includes(hints.suggested_infill)) next.infill = hints.suggested_infill;
      }
      return next;
    });
  }, [resetToLength, product]);

  // ── Finish / labels ───────────────────────────────────────────────────────
  const finishOptions = useMemo(
    () => getFinishOptions(product.finishes ?? [], selection.material),
    [product.finishes, selection.material],
  );
  const finishData = useMemo(
    () => finishOptions.find(f => f.value === selection.finish) ?? null,
    [finishOptions, selection.finish],
  );
  const selectionLabels = useMemo(() => ({
    material:     getLabelByValue(product.materials      ?? [], selection.material),
    finish:       getLabelByValue(finishOptions,               selection.finish),
    infill:       getLabelByValue(product.infills        ?? [], selection.infill),
    mounting:     getLabelByValue(product.mountings      ?? [], selection.mounting),
    extraOptions: (product.extra_options ?? [])
      .filter(o => (selection.extraOptions ?? []).includes(o.value))
      .map(o => o.label),
  }), [product, finishOptions, selection]);

  // ── Price ─────────────────────────────────────────────────────────────────
  // Count stair segments for pricing surcharge
  const stairSegmentCount = useMemo(
    () => segments.filter(s => (s.rise ?? 0) !== 0).length,
    [segments]
  );
  const selectionForPrice = useMemo(() => ({
    ...selection,
    length: Math.max(1, totalLength),
    stairSegmentCount,
  }), [selection, totalLength, stairSegmentCount]);
  const price = usePrice(selectionForPrice, config);

  // ── UI state ──────────────────────────────────────────────────────────────
  const [quoteOpen,       setQuoteOpen]       = useState(false);
  const [photoOpen,       setPhotoOpen]       = useState(false);
  const [quoteRef,        setQuoteRef]        = useState("");
  const [showDimensions,  setShowDimensions]  = useState(false);
  const [qualityMode,     setQualityMode]     = useState("balanced");

  const totalLengthCm = Math.round(totalLength);
  const priceLabel = price?.showPrices ? formatEur(price.total) : null;
  const hasRoundedCorners = (selection.extraOptions ?? []).includes("zaokraglenia");

  // The full selection passed to 3D — injects the fixed internal style
  const selectionFor3D = useMemo(() => ({
    ...selection,
    length: totalLength,
    railingStyle: FIXED_RAILING_STYLE,
  }), [selection, totalLength]);

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="tc">

      {/* ── Top bar ── */}
      <header className="tc__topbar">
        <div className="tc__brand">
          <span className="tc__brand-mark">T</span>
          <span className="tc__brand-name">{config?.brand?.name ?? "Tipto"}</span>
          <span className="tc__brand-sep" aria-hidden>·</span>
          <span className="tc__brand-sub">Balustrade Configurator</span>
        </div>

        <div className="tc__topbar-meta">
          <div className="tc__stat">
            <span className="tc__stat-val">{totalLengthCm} cm</span>
            <span className="tc__stat-lbl">lengte</span>
          </div>
          <div className="tc__stat">
            <span className="tc__stat-val">{selection.height} cm</span>
            <span className="tc__stat-lbl">hoogte</span>
          </div>
          {priceLabel && (
            <div className="tc__price-chip">
              <span className="tc__price-chip-val">{priceLabel}</span>
              <span className="tc__price-chip-lbl">richtprijs incl. btw</span>
            </div>
          )}
        </div>

        <button className="tc__cta" onClick={() => setQuoteOpen(true)}>
          Offerte aanvragen
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
            <path d="M3 7H11M8 4L11 7L8 10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </header>

      {/* ── Workspace ── */}
      <main className="tc__workspace">

        {/* 2D Planner */}
        <div className="tc__pane tc__pane--2d">
          <div className="tc__pane-header">
            <span className="tc__pane-label">2D Planner</span>
            <button className="tc__pane-ai-btn" onClick={() => setPhotoOpen(true)} type="button">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
                <rect x="1" y="2" width="10" height="8" rx="1.2" stroke="currentColor" strokeWidth="1.3"/>
                <circle cx="4" cy="5.5" r="1.2" stroke="currentColor" strokeWidth="1.2"/>
                <path d="M1 8.5L3.5 6.5L5.5 7.5L7.5 5.5L11 8.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Foto analyseren
            </button>
          </div>

          {/* Presets row */}
          <div className="tc__presets-row">
            <Presets onLoad={loadPreset} />
          </div>

          <div className="tc__pane-body">
            <Planner2D
              geo={geo}
              vertices={vertices}
              segments={segments}
              totalLength={totalLength}
              hasRoundingEnabled={hasRoundedCorners}
              moveVertex={moveVertex}
              setVertexRounding={changeVertexRounding}
              placeVertex={placeVertex}
              connectVertices={connectVertices}
              deleteSegment={deleteSegment}
              deleteVertex={deleteVertex}
              changeSegmentLength={changeSegmentLength}
              changeSegmentRise={changeSegmentRise}
              clear={clear}
              undo={undo}
              sealHistory={sealHistory}
              canUndo={canUndo}
            />
          </div>
        </div>

        {/* 3D Preview */}
        <div className="tc__pane tc__pane--3d">
          <div className="tc__pane-header">
            <span className="tc__pane-label">3D Preview</span>
            <div className="tc__pane-actions">
              <div className="tc__quality-switch" role="group" aria-label="3D kwaliteit">
                {[
                  ["lightweight", "Light"],
                  ["balanced", "Balanced"],
                  ["high", "High"],
                ].map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    className={`tc__quality-btn${qualityMode === value ? " tc__quality-btn--active" : ""}`}
                    onClick={() => setQualityMode(value)}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <button
                className={`tc__dim-toggle${showDimensions ? " tc__dim-toggle--active" : ""}`}
                onClick={() => setShowDimensions(s => !s)}
                type="button"
                title="Maatvoering tonen / verbergen"
              >
                <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden>
                  <path d="M2 10H11M2 10V8M11 10V8M4 10V6M7 10V4M10 10V7" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
                </svg>
                {showDimensions ? "Maten verbergen" : "Maten tonen"}
              </button>
            </div>
          </div>

          <div className="tc__pane-body tc__scene-wrap tc__scene-wrap--plain">
            <Scene3D
              geo={geo}
              selection={selectionFor3D}
              finish={finishData}
              showDimensions={showDimensions}
              qualityMode={qualityMode}
            />
          </div>
        </div>
      </main>

      {/* ── Config strip ── */}
      <section className="tc__config">
        <ConfigOptions config={config} selection={selection} onChange={updateSelection} />
      </section>

      {/* ── Footer price bar ── */}
      <footer className="tc__footbar">
        <div className="tc__footbar-stats">
          <span className="tc__footbar-item"><strong>{totalLengthCm} cm</strong> totale lengte</span>
          <span className="tc__footbar-sep" aria-hidden>·</span>
          <span className="tc__footbar-item"><strong>{selectionLabels.infill}</strong></span>
          <span className="tc__footbar-sep" aria-hidden>·</span>
          <span className="tc__footbar-item"><strong>{selectionLabels.material}</strong></span>
          {selectionLabels.finish && (
            <><span className="tc__footbar-sep" aria-hidden>·</span>
            <span className="tc__footbar-item">{selectionLabels.finish}</span></>
          )}
          {stairSegmentCount > 0 && (
            <><span className="tc__footbar-sep" aria-hidden>·</span>
            <span className="tc__footbar-item">
              <strong>{stairSegmentCount}</strong> trap{stairSegmentCount > 1 ? "segmenten" : "segment"}
            </span></>
          )}
        </div>
        <div className="tc__footbar-right">
          {price?.showPrices && (
            <div className="tc__footbar-price">
              <span className="tc__footbar-price-val">{formatEur(price.total)}</span>
              <span className="tc__footbar-price-note">richtprijs incl. btw</span>
            </div>
          )}
          <button className="tc__cta tc__cta--lg" onClick={() => setQuoteOpen(true)}>
            Offerte aanvragen →
          </button>
        </div>
      </footer>

      {/* ── Modals ── */}
      {photoOpen && (
        <PhotoPanel
          config={config}
          onApplyHints={applyAIHints}
          onClose={() => setPhotoOpen(false)}
        />
      )}
      {quoteOpen && (
        <QuoteModal
          config={config}
          selection={{ ...selectionFor3D }}
          selectionLabels={selectionLabels}
          priceBreakdown={price}
          totalLength={totalLength}
          sketchData={null}
          photoToken={null}
          onClose={() => setQuoteOpen(false)}
          onSuccess={ref => { setQuoteRef(ref); setQuoteOpen(false); }}
        />
      )}
      {quoteRef && !quoteOpen && (
        <div className="tc__toast" role="status">
          ✓ Aanvraag verzonden — referentie: {quoteRef}
        </div>
      )}
    </div>
  );
}

export default ConfiguratorApp;
