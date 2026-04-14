import { useState, useCallback, useEffect } from "react";
import { formatEur } from "../lib/pricing";

/**
 * Premium slide-in quote modal.
 *
 * Collects contact data and sends a quote request via WordPress AJAX.
 * On success, shows a confirmation screen.
 */

const EMPTY_FORM = {
  name:    "",
  email:   "",
  phone:   "",
  postcode:"",
  message: "",
};

function Field({ label, id, type = "text", value, onChange, required, placeholder }) {
  return (
    <div className="qm-field">
      <label className="qm-label" htmlFor={id}>
        {label}{required && <span className="qm-required" aria-hidden>*</span>}
      </label>
      {type === "textarea" ? (
        <textarea
          id={id}
          className="qm-input qm-input--textarea"
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          rows={4}
        />
      ) : (
        <input
          id={id}
          className="qm-input"
          type={type}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          required={required}
          autoComplete={type === "email" ? "email" : type === "tel" ? "tel" : "off"}
        />
      )}
    </div>
  );
}

function SummaryRow({ label, value }) {
  if (!value) return null;
  return (
    <div className="qm-summary-row">
      <span className="qm-summary-label">{label}</span>
      <span className="qm-summary-value">{value}</span>
    </div>
  );
}

function QuoteModal({ config, selection, selectionLabels, priceBreakdown, sketchData, photoToken, totalLength, onClose, onSuccess }) {
  const [form,      setForm]      = useState(EMPTY_FORM);
  const [sending,   setSending]   = useState(false);
  const [error,     setError]     = useState(null);
  const [submitted, setSubmitted] = useState(false);

  // Close on Escape
  useEffect(() => {
    const handler = e => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  // Trap scroll
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  const set = useCallback((key, val) => {
    setForm(f => ({ ...f, [key]: val }));
  }, []);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    setSending(true);
    setError(null);

    try {
      const payload = {
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        postcode: form.postcode.trim(),
        message: form.message.trim(),
        selection,
        selectionLabels: selectionLabels ?? {},
        totalLengthCm: Math.round(totalLength ?? 0),
        priceBreakdown: priceBreakdown ?? {},
      };

      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();

      if (!json.success) throw new Error(json.error ?? "Onbekende fout.");

      setSubmitted(true);
      onSuccess?.(json.data?.reference ?? "");
    } catch (err) {
      setError(err.message);
    } finally {
      setSending(false);
    }
  }, [form, config, selection, selectionLabels, priceBreakdown, sketchData, photoToken, totalLength, onSuccess]);

  const totalLengthCm = totalLength ? Math.round(totalLength) : null;

  return (
    <div className="qm-overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="qm-panel" role="dialog" aria-modal="true" aria-label="Offerte aanvragen">

        {/* Header */}
        <div className="qm-header">
          <div>
            <div className="qm-eyebrow">Tipto</div>
            <h2 className="qm-title">Offerte aanvragen</h2>
          </div>
          <button className="qm-close" onClick={onClose} aria-label="Sluiten">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M1 1L17 17M17 1L1 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        {submitted ? (
          /* ── Success ── */
          <div className="qm-success">
            <div className="qm-success__icon">✓</div>
            <h3>Aanvraag ontvangen!</h3>
            <p>We nemen zo snel mogelijk contact met u op om uw configuratie te bespreken.</p>
            <button className="qm-btn-primary" onClick={onClose}>Sluiten</button>
          </div>
        ) : (
          /* ── Form ── */
          <form className="qm-body" onSubmit={handleSubmit} noValidate>

            {/* Configuration summary */}
            <div className="qm-summary">
              <div className="qm-summary-title">Uw configuratie</div>
              <SummaryRow label="Totale lengte"  value={totalLengthCm ? `${totalLengthCm} cm` : null} />
              <SummaryRow label="Hoogte"          value={selection.height ? `${selection.height} cm` : null} />
              <SummaryRow label="Stijl"           value={selectionLabels?.railingStyle} />
              <SummaryRow label="Vulling"         value={selectionLabels?.infill} />
              <SummaryRow label="Materiaal"       value={selectionLabels?.material} />
              <SummaryRow label="Afwerking"       value={selectionLabels?.finish} />
              <SummaryRow label="Montage"         value={selectionLabels?.mounting} />
              {(selectionLabels?.extraOptions?.length > 0) && (
                <SummaryRow label="Extra's" value={selectionLabels.extraOptions.join(", ")} />
              )}
              {priceBreakdown?.showPrices && (
                <div className="qm-price-line">
                  <span>{priceBreakdown.label ?? "Richtprijs"}</span>
                  <span className="qm-price-amount">{formatEur(priceBreakdown.total)}</span>
                </div>
              )}
              {priceBreakdown?.disclaimer && (
                <p className="qm-disclaimer">{priceBreakdown.disclaimer}</p>
              )}
            </div>

            {/* Contact fields */}
            <div className="qm-fields">
              <Field
                label="Naam" id="qm-name" value={form.name}
                onChange={v => set("name", v)} required
                placeholder="Voor- en achternaam"
              />
              <Field
                label="E-mailadres" id="qm-email" type="email" value={form.email}
                onChange={v => set("email", v)} required
                placeholder="u@voorbeeld.be"
              />
              <div className="qm-fields-row">
                <Field
                  label="Telefoon" id="qm-phone" type="tel" value={form.phone}
                  onChange={v => set("phone", v)}
                  placeholder="+32 …"
                />
                <Field
                  label="Postcode" id="qm-postcode" value={form.postcode}
                  onChange={v => set("postcode", v)}
                  placeholder="1000"
                />
              </div>
              <Field
                label="Opmerkingen" id="qm-message" type="textarea" value={form.message}
                onChange={v => set("message", v)}
                placeholder="Aanvullende informatie, specifieke wensen, locatie…"
              />
            </div>

            {error && (
              <div className="qm-error" role="alert">{error}</div>
            )}

            <button
              className="qm-btn-primary"
              type="submit"
              disabled={sending || !form.name || !form.email}
            >
              {sending ? (
                <><span className="qm-spinner" aria-hidden /> Bezig met verzenden…</>
              ) : (
                "Aanvraag versturen →"
              )}
            </button>

            <p className="qm-privacy">
              Uw gegevens worden uitsluitend gebruikt om uw offerteaanvraag te verwerken.
            </p>
          </form>
        )}
      </div>
    </div>
  );
}

export default QuoteModal;
