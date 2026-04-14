import { formatEur } from "../lib/pricing";

function SummaryRow({ label, value }) {
  return (
    <div className="tipto-summary-row">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function SummaryPanel({ config, selection, selectionLabels, quoteReference, priceBreakdown }) {
  const showPrices = config?.pricing?.show_prices !== false;
  const priceLabel = config?.pricing?.price_display_label ?? "Richtprijs";

  return (
    <section className="tipto-panel tipto-summary-panel">
      <div className="tipto-panel-header">
        <div>
          <h2>Samenvatting</h2>
          <p>Een compacte samenvatting voor uw aanvraag of intern overleg.</p>
        </div>
      </div>

      <div className="tipto-summary-list">
        <SummaryRow label="Type" value={selectionLabels.railingStyle} />
        <SummaryRow label="Lengte" value={`${selection.length} cm`} />
        <SummaryRow label="Hoogte" value={`${selection.height} cm`} />
        <SummaryRow label="Profieldiepte" value={`${selection.depth} cm`} />
        <SummaryRow label="Materiaal" value={selectionLabels.material} />
        <SummaryRow label="Afwerking" value={selectionLabels.finish} />
        <SummaryRow label="Vulling" value={selectionLabels.infill} />
        <SummaryRow label="Montage" value={selectionLabels.mounting} />
        <SummaryRow
          label="Extra"
          value={
            selectionLabels.extraOptions.length
              ? selectionLabels.extraOptions.join(", ")
              : "Geen extra opties"
          }
        />

        {showPrices && priceBreakdown ? (
          <div className="tipto-summary-price-block">
            <SummaryRow label={priceLabel} value={formatEur(priceBreakdown.total)} />
            <p className="tipto-summary-price-note">incl. btw – indicatieprijs</p>
          </div>
        ) : (
          <SummaryRow label="Prijs" value={config?.brand?.price_label ?? "Prijs op aanvraag"} />
        )}
      </div>

      <div className="tipto-reference-box">
        <span>Status</span>
        <strong>
          {quoteReference ? `Aanvraag ontvangen: ${quoteReference}` : "Nog niet verzonden"}
        </strong>
      </div>
    </section>
  );
}

export default SummaryPanel;
