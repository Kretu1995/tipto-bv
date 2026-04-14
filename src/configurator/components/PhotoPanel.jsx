import { useState, useCallback, useRef, useEffect } from "react";
import { analysePhoto } from "../lib/aiClient";

/**
 * PhotoPanel — foto uploaden + AI-analyse → automatisch toepassen in 2D/3D.
 *
 * Flow:
 *  1. Gebruiker sleept of selecteert een foto
 *  2. Foto wordt geanalyseerd (mock in dev, echte CV later plug-and-play)
 *  3. AI-resultaat toont geschatte afmetingen + materiaalsuggestie
 *  4. "Toepassen" past de geometrie + selectie aan in de configurator
 */

const ACCEPTED = ["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"];

function ConfidenceBar({ value }) {
  const pct = Math.round(value * 100);
  const color = pct >= 70 ? "#2D7D46" : pct >= 45 ? "#C4954A" : "#B53A2F";
  return (
    <div className="pp-conf">
      <div className="pp-conf__bar">
        <div className="pp-conf__fill" style={{ width: `${pct}%`, background: color }} />
      </div>
      <span className="pp-conf__label" style={{ color }}>{pct}% zekerheid</span>
    </div>
  );
}

function HintRow({ label, value, highlight }) {
  if (!value) return null;
  return (
    <div className={`pp-hint-row${highlight ? " pp-hint-row--hl" : ""}`}>
      <span className="pp-hint-label">{label}</span>
      <span className="pp-hint-value">{value}</span>
    </div>
  );
}

function PhotoPanel({ config, onApplyHints, onClose }) {
  const inputRef   = useRef(null);
  const [file,     setFile]     = useState(null);
  const [preview,  setPreview]  = useState(null);
  const [dragging, setDragging] = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [result,   setResult]   = useState(null); // AnalysisResult
  const [error,    setError]    = useState(null);
  const [applied,  setApplied]  = useState(false);

  // Escape to close
  useEffect(() => {
    const h = e => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);

  const processFile = useCallback(async (f) => {
    if (!f || !ACCEPTED.includes(f.type)) {
      setError("Gebruik een JPEG, PNG of WebP bestand.");
      return;
    }
    if (f.size > 12_000_000) {
      setError("Bestand is te groot (max. 12 MB).");
      return;
    }

    setFile(f);
    setError(null);
    setResult(null);
    setApplied(false);
    setPreview(URL.createObjectURL(f));
    setLoading(true);

    try {
      const res = await analysePhoto(
        f,
        config?.ajaxUrl  ?? "",
        config?.aiNonce  ?? "dev-nonce-local",
      );
      setResult(res);
    } catch (err) {
      setError("Analyse mislukt. Probeer opnieuw.");
    } finally {
      setLoading(false);
    }
  }, [config]);

  const handleDrop = useCallback(e => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files?.[0];
    if (f) processFile(f);
  }, [processFile]);

  const handleApply = useCallback(() => {
    if (!result?.hints) return;
    onApplyHints(result.hints);
    setApplied(true);
    setTimeout(onClose, 900);
  }, [result, onApplyHints, onClose]);

  const hints = result?.hints;

  return (
    <div className="pp-overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="pp-panel" role="dialog" aria-modal="true" aria-label="Foto-analyse">

        {/* Header */}
        <div className="pp-header">
          <div>
            <div className="pp-eyebrow">AI-assistent</div>
            <h2 className="pp-title">Foto uploaden</h2>
          </div>
          <button className="pp-close" onClick={onClose} aria-label="Sluiten">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M1 1L15 15M15 1L1 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        <div className="pp-body">
          <p className="pp-intro">
            Upload een foto van uw terras, balkon of trap. De AI schat automatisch de afmetingen en stelt een configuratie voor. U kunt alles daarna zelf aanpassen.
          </p>

          {/* Drop zone / preview */}
          {!preview ? (
            <div
              className={`pp-dropzone${dragging ? " pp-dropzone--over" : ""}`}
              onClick={() => inputRef.current?.click()}
              onDragOver={e => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
              role="button"
              tabIndex={0}
              onKeyDown={e => { if (e.key === "Enter") inputRef.current?.click(); }}
            >
              <div className="pp-dropzone__icon" aria-hidden>
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                  <rect x="2" y="6" width="28" height="22" rx="3" stroke="currentColor" strokeWidth="1.8"/>
                  <circle cx="10" cy="13" r="2.5" stroke="currentColor" strokeWidth="1.8"/>
                  <path d="M2 22L9 16L14 20L20 14L30 22" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M16 3L16 1M16 1L13 4M16 1L19 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div className="pp-dropzone__text">
                <strong>Sleep een foto hierheen</strong>
                <span>of klik om te bladeren</span>
              </div>
              <div className="pp-dropzone__formats">JPEG · PNG · WebP · max 12 MB</div>
            </div>
          ) : (
            <div className="pp-preview-wrap">
              <img className="pp-preview-img" src={preview} alt="Geüploade foto" />
              <button
                className="pp-preview-change"
                onClick={() => {
                  setFile(null);
                  setPreview(null);
                  setResult(null);
                  setApplied(false);
                  setError(null);
                  if (preview) URL.revokeObjectURL(preview);
                }}
              >
                Andere foto
              </button>
            </div>
          )}

          <input
            ref={inputRef}
            type="file"
            accept={ACCEPTED.join(",")}
            style={{ display: "none" }}
            onChange={e => { const f = e.target.files?.[0]; if (f) processFile(f); }}
          />

          {/* Error */}
          {error && <div className="pp-error" role="alert">{error}</div>}

          {/* Loading */}
          {loading && (
            <div className="pp-loading">
              <span className="pp-spinner" aria-hidden />
              <span>Foto wordt geanalyseerd…</span>
            </div>
          )}

          {/* Results */}
          {result && !loading && (
            <div className="pp-result">
              <div className="pp-result__header">
                <span className="pp-result__title">AI-schatting</span>
                {result.isMock && (
                  <span className="pp-mock-badge">demo modus</span>
                )}
              </div>

              <ConfidenceBar value={result.confidence} />

              <div className="pp-hints">
                <HintRow
                  label="Geschatte lengte"
                  value={hints?.estimated_length_cm ? `± ${hints.estimated_length_cm} cm` : null}
                  highlight
                />
                <HintRow
                  label="Geschatte hoogte"
                  value={hints?.estimated_height_cm ? `± ${hints.estimated_height_cm} cm` : null}
                />
                <HintRow
                  label="Aanbevolen materiaal"
                  value={hints?.suggested_material
                    ? hints.suggested_material.charAt(0).toUpperCase() + hints.suggested_material.slice(1).replace("-", " ")
                    : null}
                />
                <HintRow
                  label="Aanbevolen vulling"
                  value={hints?.suggested_infill
                    ? hints.suggested_infill.charAt(0).toUpperCase() + hints.suggested_infill.slice(1).replace(/-/g, " ")
                    : null}
                />
              </div>

              {hints?.notes && (
                <p className="pp-notes">{hints.notes}</p>
              )}
            </div>
          )}

          {/* Apply button */}
          {result && !loading && !applied && (
            <button className="pp-apply-btn" onClick={handleApply}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
                <path d="M3 8H13M9 4L13 8L9 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Toepassen in 2D-planner &amp; 3D-preview
            </button>
          )}

          {applied && (
            <div className="pp-applied">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
                <path d="M3 9L7 13L15 5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Configuratie toegepast!
            </div>
          )}

          {!preview && !loading && (
            <p className="pp-disclaimer">
              De AI-schatting is een startpunt — pas de vorm en afmetingen daarna vrij aan in de planner.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default PhotoPanel;
