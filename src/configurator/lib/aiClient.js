/**
 * AI analysis abstraction layer.
 *
 * Current implementation: mock analysis that returns plausible hints.
 * Future implementation: swap analysePhoto() body to call a real CV endpoint
 * (e.g. GPT-4o Vision, AWS Rekognition) while keeping the same response contract.
 *
 * The contract is defined by the return shape of analysePhoto().
 * Neither PhotoUpload.jsx nor WizardApp.jsx needs to change when the real
 * implementation is plugged in.
 */

/**
 * Analyse an uploaded photo and return balustrade placement hints.
 *
 * @param {File}   file     Image file from file picker or drag-drop.
 * @param {string} ajaxUrl  WordPress admin-ajax.php URL.
 * @param {string} nonce    Security nonce.
 * @returns {Promise<AnalysisResult>}
 */
export async function analysePhoto(file, ajaxUrl, nonce) {
  // In mock/dev mode (no real endpoint available), return demo hints after a
  // short delay so the UI loading state is clearly visible.
  if (!ajaxUrl || ajaxUrl.includes("dev-nonce-local") || !nonce || nonce === "dev-nonce-local") {
    return simulateMockAnalysis(file);
  }

  try {
    const formData = new FormData();
    formData.append("action", "tipto_analyse_photo");
    formData.append("nonce", nonce);
    formData.append("photo", file);

    const response = await fetch(ajaxUrl, {
      method: "POST",
      body: formData,
      credentials: "same-origin",
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const result = await response.json();

    if (!result?.success) {
      // Server returned an error – fall back to mock so the user can still proceed.
      return simulateMockAnalysis(file);
    }

    return normaliseResult(result.data);
  } catch {
    // Network failure or unexpected response – fail gracefully with mock.
    return simulateMockAnalysis(file);
  }
}

/**
 * @typedef {object} AnalysisResult
 * @property {boolean} success
 * @property {number}  confidence          0.0 – 1.0
 * @property {boolean} isMock              true when mock data was returned
 * @property {Hints}   hints
 */

/**
 * @typedef {object} Hints
 * @property {number|null}  estimated_length_cm
 * @property {number|null}  estimated_height_cm
 * @property {string|null}  suggested_material   Matches product.materials value keys
 * @property {string|null}  suggested_infill     Matches product.infills value keys
 * @property {string}       notes                Human-readable Dutch description
 */

/** Simulate a plausible analysis result from image metadata. */
async function simulateMockAnalysis(file) {
  await delay(1400);

  // Vary hints based on file size as a cheap proxy for "image content".
  const seed = file?.size ?? 0;
  const isLarge = seed > 500_000;

  return {
    success: true,
    confidence: isLarge ? 0.68 : 0.52,
    isMock: true,
    hints: {
      estimated_length_cm: isLarge ? 340 : 220,
      estimated_height_cm: 105,
      suggested_material: "aluminium",
      suggested_infill: isLarge ? "glas" : "verticale-spijlen",
      notes: isLarge
        ? "De foto lijkt een groter buitenterras of balkon te tonen. Op basis van de beeldverhouding schatten we een breedte van ± 340 cm. Een glazen vulling past hier goed bij de open look."
        : "De foto toont een compacter platform of trap. We schatten de breedte op ± 220 cm. Verticale spijlen passen bij een klassieke en solide uitstraling.",
    },
  };
}

function normaliseResult(data) {
  return {
    success: true,
    confidence: data?.confidence ?? 0.5,
    isMock: false,
    hints: {
      estimated_length_cm: data?.hints?.estimated_length_cm ?? null,
      estimated_height_cm: data?.hints?.estimated_height_cm ?? null,
      suggested_material: data?.hints?.suggested_material ?? null,
      suggested_infill: data?.hints?.suggested_infill ?? null,
      notes: data?.hints?.notes ?? "",
    },
  };
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
