import { formatEur } from "../lib/pricing";

/**
 * Step 3 – Price breakdown panel.
 * Receives a priceBreakdown object from usePrice() and renders a clear summary.
 * Purely presentational: no state, no hooks.
 */
function PricePanel({ priceBreakdown, selectionLabels, config, onNext }) {
  const showPrices = config?.pricing?.show_prices !== false;
  const priceLabel = config?.pricing?.price_display_label ?? "Richtprijs";

  return (
    <div className="tipto-price-panel">
      <div className="tipto-panel-header">
        <div>
          <div className="tipto-eyebrow">Stap 3</div>
          <h2>Prijsindicatie</h2>
          <p>
            Op basis van uw configuratie berekenen we een automatische richtprijs. De definitieve
            prijs wordt bepaald na inmeting.
          </p>
        </div>
      </div>

      {showPrices && priceBreakdown ? (
        <>
          <div className="tipto-price-config-summary">
            <strong>Uw configuratie</strong>
            <div className="tipto-price-config-chips">
              {selectionLabels?.material && (
                <span className="tipto-chip">{selectionLabels.material}</span>
              )}
              {selectionLabels?.infill && (
                <span className="tipto-chip">{selectionLabels.infill}</span>
              )}
              {selectionLabels?.finish && (
                <span className="tipto-chip">{selectionLabels.finish}</span>
              )}
              {selectionLabels?.mounting && (
                <span className="tipto-chip">{selectionLabels.mounting}</span>
              )}
              <span className="tipto-chip">
                {Math.round(priceBreakdown.lengthMetres * 100)} cm
              </span>
            </div>
          </div>

          <div className="tipto-price-breakdown">
            <PriceLine
              label={`Basistarief (${Math.round(priceBreakdown.lengthMetres * 100)} cm × ${formatEur(priceBreakdown.effectivePerMeter)}/m)`}
              value={formatEur(priceBreakdown.baseLine)}
            />

            {priceBreakdown.finishSurcharge > 0 && (
              <PriceLine
                label="Afwerkingstoeslag"
                value={`+ ${formatEur(priceBreakdown.finishSurcharge)}`}
              />
            )}

            {priceBreakdown.mountingSurcharge > 0 && (
              <PriceLine
                label="Montagetoeslag"
                value={`+ ${formatEur(priceBreakdown.mountingSurcharge)}`}
              />
            )}

            {priceBreakdown.extrasTotal > 0 && (
              <PriceLine
                label="Extra opties"
                value={`+ ${formatEur(priceBreakdown.extrasTotal)}`}
              />
            )}

            <div className="tipto-price-divider" />

            <PriceLine
              label="Subtotaal excl. btw"
              value={formatEur(priceBreakdown.subtotal)}
              muted
            />

            <PriceLine
              label={`Btw ${Math.round(priceBreakdown.vatRate * 100)}%`}
              value={formatEur(priceBreakdown.vatAmount)}
              muted
            />

            <div className="tipto-price-total-row">
              <span>{priceLabel} incl. btw</span>
              <strong>{formatEur(priceBreakdown.total)}</strong>
            </div>
          </div>

          <p className="tipto-price-disclaimer">{priceBreakdown.disclaimer}</p>
        </>
      ) : (
        <div className="tipto-price-on-request">
          <div className="tipto-price-pill" style={{ fontSize: "1.1rem", padding: "14px 24px" }}>
            Prijs op aanvraag
          </div>
          <p>
            Vraag een offerte aan en onze adviseur bezorgt u een gedetailleerde prijsopgave op maat.
          </p>
        </div>
      )}

      <button
        type="button"
        className="tipto-primary-button"
        style={{ width: "100%", marginTop: "8px" }}
        onClick={onNext}
      >
        Offerte aanvragen →
      </button>
    </div>
  );
}

function PriceLine({ label, value, muted }) {
  return (
    <div className={`tipto-price-line ${muted ? "is-muted" : ""}`}>
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}

export default PricePanel;
