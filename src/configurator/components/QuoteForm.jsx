import { useState, useTransition } from "react";
import { formatEur } from "../lib/pricing";

/**
 * Step 4 – Quote request form.
 * Extended to include price breakdown, sketch data and photo token.
 */
function QuoteForm({ config, selection, selectionLabels, priceBreakdown, sketchData, photoToken, onSuccess }) {
  const [formState, setFormState] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    postcode: "",
    message: "",
    consent: false,
  });
  const [status, setStatus]         = useState({ type: "", message: "" });
  const [isPending, startTransition] = useTransition();

  const showPrices = config?.pricing?.show_prices !== false;
  const priceLabel = config?.pricing?.price_display_label ?? "Richtprijs";

  const handleSubmit = (event) => {
    event.preventDefault();

    startTransition(async () => {
      setStatus({ type: "", message: "" });

      const formData = new FormData();
      formData.append("action", config?.request?.action ?? "tipto_submit_quote");
      formData.append("nonce", config?.request?.nonce ?? "");
      formData.append("name", formState.name);
      formData.append("email", formState.email);
      formData.append("phone", formState.phone);
      formData.append("company", formState.company);
      formData.append("postcode", formState.postcode);
      formData.append("message", formState.message);
      formData.append("consent", formState.consent ? "1" : "");
      formData.append("railingStyle", selection.railingStyle);
      formData.append("length", String(selection.length));
      formData.append("height", String(selection.height));
      formData.append("depth", String(selection.depth));
      formData.append("material", selection.material);
      formData.append("finish", selection.finish);
      formData.append("infill", selection.infill);
      formData.append("mounting", selection.mounting);
      formData.append("priceLabel", config?.brand?.price_label ?? "Prijs op aanvraag");
      selection.extraOptions.forEach((option) => formData.append("extraOptions[]", option));

      // New extended fields
      if (priceBreakdown) {
        formData.append("priceBreakdown", JSON.stringify(priceBreakdown));
      }
      if (sketchData) {
        formData.append("sketchData", JSON.stringify(sketchData));
      }
      if (photoToken) {
        formData.append("photoToken", photoToken);
      }

      try {
        const response = await fetch(config?.request?.ajaxUrl ?? "", {
          method: "POST",
          body: formData,
          credentials: "same-origin",
        });

        const result = await response.json();

        if (!response.ok || !result?.success) {
          throw new Error(result?.data?.message || config?.contact?.errorText);
        }

        setStatus({
          type: "success",
          message: result.data?.message || config?.contact?.successText,
        });
        onSuccess(result.data?.reference || "");
        setFormState({ name: "", email: "", phone: "", company: "", postcode: "", message: "", consent: false });
      } catch (error) {
        setStatus({
          type: "error",
          message: error.message || config?.contact?.errorText,
        });
      }
    });
  };

  const updateField = (field, value) => {
    setFormState((current) => ({ ...current, [field]: value }));
  };

  return (
    <section className="tipto-panel">
      <div className="tipto-panel-header">
        <div>
          <div className="tipto-eyebrow">Stap 4</div>
          <h2>{config?.ui?.quote_button_text ?? "Offerte aanvragen"}</h2>
          <p>Stuur de huidige configuratie rechtstreeks door naar Tipto.</p>
        </div>
      </div>

      <form className="tipto-form" onSubmit={handleSubmit}>
        <div className="tipto-form-grid">
          <label>
            <span>Naam *</span>
            <input
              type="text"
              required
              autoComplete="name"
              value={formState.name}
              onChange={(e) => updateField("name", e.target.value)}
            />
          </label>

          <label>
            <span>E-mail *</span>
            <input
              type="email"
              required
              autoComplete="email"
              value={formState.email}
              onChange={(e) => updateField("email", e.target.value)}
            />
          </label>

          <label>
            <span>Telefoon</span>
            <input
              type="tel"
              autoComplete="tel"
              value={formState.phone}
              onChange={(e) => updateField("phone", e.target.value)}
            />
          </label>

          <label>
            <span>Postcode / Gemeente</span>
            <input
              type="text"
              autoComplete="postal-code"
              value={formState.postcode}
              onChange={(e) => updateField("postcode", e.target.value)}
            />
          </label>
        </div>

        <label>
          <span>Bedrijf (optioneel)</span>
          <input
            type="text"
            autoComplete="organization"
            value={formState.company}
            onChange={(e) => updateField("company", e.target.value)}
          />
        </label>

        <label>
          <span>Opmerkingen / projectdetails</span>
          <textarea
            rows="4"
            value={formState.message}
            placeholder={`Bijv. terrasrenovatie, ${selection.length} cm breed, ${selectionLabels?.infill?.toLowerCase() ?? ""} gewenst, trapbalustrade…`}
            onChange={(e) => updateField("message", e.target.value)}
          />
        </label>

        <div className="tipto-inline-summary">
          <strong>Configuratiesamenvatting</strong>
          <div className="tipto-inline-summary-rows">
            <span>
              {selectionLabels?.railingStyle}, {selection.length} × {selection.height} cm,{" "}
              {selectionLabels?.material}, {selectionLabels?.finish}, {selectionLabels?.infill},{" "}
              {selectionLabels?.mounting}
            </span>
            {showPrices && priceBreakdown && (
              <span className="tipto-inline-price">
                {priceLabel}: <strong>{formatEur(priceBreakdown.total)}</strong> incl. btw
              </span>
            )}
            {sketchData?.totalLengthCm > 0 && (
              <span>Schets: totale lengte {sketchData.totalLengthCm} cm</span>
            )}
            {photoToken && <span>Foto geüpload ✓</span>}
          </div>
        </div>

        <label className="tipto-consent">
          <input
            type="checkbox"
            checked={formState.consent}
            required
            onChange={(e) => updateField("consent", e.target.checked)}
          />
          <span>
            Ik geef toestemming om mijn gegevens te gebruiken voor deze offerteaanvraag.
            {config?.brand?.privacy_url ? (
              <>
                {" "}
                <a href={config.brand.privacy_url} target="_blank" rel="noopener noreferrer">
                  Privacybeleid
                </a>
              </>
            ) : null}
          </span>
        </label>

        {status.message ? (
          <div className={`tipto-form-status is-${status.type}`}>{status.message}</div>
        ) : null}

        <button type="submit" className="tipto-primary-button tipto-submit-btn" disabled={isPending}>
          {isPending
            ? "Bezig met verzenden..."
            : config?.ui?.submit_text ?? "Aanvraag verzenden"}
        </button>
      </form>
    </section>
  );
}

export default QuoteForm;
