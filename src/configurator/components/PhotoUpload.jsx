import { useState, useRef, useCallback } from "react";
import { analysePhoto } from "../lib/aiClient";

/**
 * Step 2 (method=foto) – photo upload with AI analysis.
 *
 * Flow:
 *  1. User drags / selects an image file.
 *  2. Client-side preview is shown immediately.
 *  3. File is uploaded to WordPress (tipto_upload_photo).
 *  4. Server runs AI analysis (or mock on localhost).
 *  5. Analysis hints are shown with an "Apply to configuration" button.
 *
 * Props:
 *   config           – full frontend config (for AJAX URLs + nonces)
 *   onUploadComplete – called with (photoToken) when upload succeeds
 *   onApplyHints     – called with hints object; parent applies to selection
 */
function PhotoUpload({ config, onUploadComplete, onApplyHints }) {
  const [file, setFile]           = useState(null);
  const [preview, setPreview]     = useState(null);
  const [uploading, setUploading] = useState(false);
  const [analysing, setAnalysing] = useState(false);
  const [analysis, setAnalysis]   = useState(null);
  const [error, setError]         = useState("");
  const [isDragOver, setIsDragOver] = useState(false);
  const inputRef = useRef(null);

  const ACCEPTED = "image/jpeg,image/png,image/webp,image/heic";
  const MAX_MB   = 8;

  const processFile = useCallback(
    async (selectedFile) => {
      if (!selectedFile) return;

      if (!selectedFile.type.startsWith("image/")) {
        setError("Alleen afbeeldingen zijn toegestaan (JPEG, PNG, WebP).");
        return;
      }

      if (selectedFile.size > MAX_MB * 1024 * 1024) {
        setError(`Het bestand is te groot. Maximum is ${MAX_MB} MB.`);
        return;
      }

      setError("");
      setAnalysis(null);
      setFile(selectedFile);

      // Local preview via FileReader
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target.result);
      reader.readAsDataURL(selectedFile);

      // Upload to WordPress
      setUploading(true);

      try {
        const ajaxUrl = config?.request?.ajaxUrl ?? "";
        const nonce   = config?.request?.uploadNonce ?? config?.request?.nonce ?? "";

        let photoToken = null;

        if (ajaxUrl && nonce && !nonce.includes("dev-nonce-local")) {
          const formData = new FormData();
          formData.append("action", config?.request?.uploadAction ?? "tipto_upload_photo");
          formData.append("nonce", nonce);
          formData.append("photo", selectedFile);

          const uploadResponse = await fetch(ajaxUrl, {
            method: "POST",
            body: formData,
            credentials: "same-origin",
          });

          const uploadResult = await uploadResponse.json();

          if (!uploadResult?.success) {
            throw new Error(uploadResult?.data?.message ?? "Upload mislukt.");
          }

          photoToken = uploadResult.data?.token ?? null;
        } else {
          // Dev mode: use a placeholder token
          photoToken = "dev-mock-token";
        }

        onUploadComplete?.(photoToken);
        setUploading(false);

        // Trigger AI analysis
        setAnalysing(true);
        const aiResult = await analysePhoto(
          selectedFile,
          ajaxUrl,
          config?.request?.aiNonce ?? nonce
        );
        setAnalysis(aiResult);
        setAnalysing(false);
      } catch (err) {
        setUploading(false);
        setAnalysing(false);
        setError(err.message ?? "Er is iets misgegaan. Probeer opnieuw.");
      }
    },
    [config, onUploadComplete]
  );

  const handleFileChange = (e) => {
    processFile(e.target.files?.[0] ?? null);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    processFile(e.dataTransfer.files?.[0] ?? null);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => setIsDragOver(false);

  const handleApplyHints = () => {
    if (analysis?.hints) {
      onApplyHints?.(analysis.hints);
    }
  };

  const handleReset = () => {
    setFile(null);
    setPreview(null);
    setAnalysis(null);
    setError("");
    onUploadComplete?.(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className="tipto-photo-upload">
      <div className="tipto-panel-header">
        <div>
          <h3>Foto uploaden</h3>
          <p>
            Upload een foto van uw terras, balkon of trap. AI doet een eerste voorstel voor de
            plaatsing.
          </p>
        </div>
      </div>

      {!file ? (
        <div
          className={`tipto-dropzone ${isDragOver ? "is-dragover" : ""}`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => inputRef.current?.click()}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
          aria-label="Klik of sleep een foto hierheen"
        >
          <span className="tipto-dropzone-icon">📷</span>
          <strong>Sleep een foto hierheen</strong>
          <span>of klik om een bestand te kiezen</span>
          <span className="tipto-dropzone-hint">JPEG, PNG of WebP – max. {MAX_MB} MB</span>
          <input
            ref={inputRef}
            type="file"
            accept={ACCEPTED}
            className="tipto-file-input-hidden"
            onChange={handleFileChange}
            aria-hidden="true"
          />
        </div>
      ) : (
        <div className="tipto-photo-result">
          <div className="tipto-photo-preview-wrapper">
            <img
              src={preview}
              alt="Geüploade foto"
              className="tipto-photo-preview"
            />
            <button
              type="button"
              className="tipto-photo-reset"
              onClick={handleReset}
              aria-label="Andere foto kiezen"
            >
              ✕
            </button>
          </div>

          {uploading && (
            <div className="tipto-ai-status">
              <span className="tipto-ai-spinner" aria-hidden="true" /> Foto wordt geüpload...
            </div>
          )}

          {analysing && (
            <div className="tipto-ai-status">
              <span className="tipto-ai-spinner" aria-hidden="true" /> AI analyseert de foto...
            </div>
          )}

          {analysis && !analysing && (
            <div className="tipto-ai-result">
              <div className="tipto-ai-result-header">
                <strong>AI-analyse</strong>
                {analysis.isMock && (
                  <span className="tipto-ai-mock-badge">Demo-modus</span>
                )}
                <span className="tipto-ai-confidence">
                  Betrouwbaarheid: {Math.round((analysis.confidence ?? 0) * 100)}%
                </span>
              </div>

              <p className="tipto-ai-notes">{analysis.hints?.notes}</p>

              <div className="tipto-ai-hints">
                {analysis.hints?.estimated_length_cm != null && (
                  <div className="tipto-ai-hint-item">
                    <span>Geschatte lengte</span>
                    <strong>{analysis.hints.estimated_length_cm} cm</strong>
                  </div>
                )}
                {analysis.hints?.estimated_height_cm != null && (
                  <div className="tipto-ai-hint-item">
                    <span>Geschatte hoogte</span>
                    <strong>{analysis.hints.estimated_height_cm} cm</strong>
                  </div>
                )}
                {analysis.hints?.suggested_material && (
                  <div className="tipto-ai-hint-item">
                    <span>Aanbevolen materiaal</span>
                    <strong>{analysis.hints.suggested_material}</strong>
                  </div>
                )}
                {analysis.hints?.suggested_infill && (
                  <div className="tipto-ai-hint-item">
                    <span>Aanbevolen vulling</span>
                    <strong>{analysis.hints.suggested_infill}</strong>
                  </div>
                )}
              </div>

              <button
                type="button"
                className="tipto-primary-button"
                onClick={handleApplyHints}
                style={{ marginTop: "12px" }}
              >
                Voorstel toepassen op configuratie →
              </button>

              <p className="tipto-ai-disclaimer">
                Dit is een automatisch voorstel. U kunt daarna alle instellingen handmatig
                aanpassen.
              </p>
            </div>
          )}
        </div>
      )}

      {error && <p className="tipto-form-status is-error">{error}</p>}
    </div>
  );
}

export default PhotoUpload;
