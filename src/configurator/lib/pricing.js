/**
 * Pure pricing calculation logic.
 * No React dependencies. Accepts selection state + pricing table from config.
 *
 * All prices in EUR. Pricing table is injected from WordPress config
 * so numbers are controllable without a frontend rebuild.
 */

/** Format a euro amount to display string. */
export function formatEur(amount) {
  return new Intl.NumberFormat("nl-BE", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Calculate a full price breakdown.
 *
 * @param {object} selection  Current configurator selection state.
 * @param {object} pricing    Pricing table from config.pricing.
 * @returns {object|null}     Price breakdown object, or null if input is invalid.
 */
export function calculatePrice(selection, pricing) {
  if (!pricing || !selection) return null;

  const lengthMetres = (selection.length ?? 0) / 100;

  if (lengthMetres <= 0) return null;

  // Base price per metre for chosen infill type.
  const infillBasePrices = pricing.base_per_meter_by_infill ?? {};
  const defaultBase = pricing.base_per_meter ?? 185;
  const basePerMeter = infillBasePrices[selection.infill] ?? defaultBase;

  // Material multiplier (applied to the per-metre base).
  const materialMultipliers = pricing.material_multipliers ?? {};
  const materialMultiplier = materialMultipliers[selection.material] ?? 1;

  // Effective per-metre rate after material multiplier.
  const effectivePerMeter = basePerMeter * materialMultiplier;

  // Base line total = effective rate × length in metres.
  const baseLine = round2(effectivePerMeter * lengthMetres);

  // Finish surcharge per metre (e.g. special coating).
  const finishSurcharges = pricing.finish_surcharges ?? {};
  const finishSurcharge = round2((finishSurcharges[selection.finish] ?? 0) * lengthMetres);

  // Mounting surcharge, fixed per project.
  const mountingSurcharges = pricing.mounting_surcharges ?? {};
  const mountingSurcharge = mountingSurcharges[selection.mounting] ?? 0;

  // Extra options – fixed price each.
  const extraOptionPrices = pricing.extra_option_prices ?? {};
  const extrasTotal = (selection.extraOptions ?? []).reduce(
    (sum, key) => sum + (extraOptionPrices[key] ?? 0),
    0
  );

  // Stair surcharge: fixed surcharge per stair segment.
  const stairCount = selection.stairSegmentCount ?? 0;
  const stairSurcharge = stairCount > 0
    ? stairCount * (pricing.stair_surcharge ?? 180)
    : 0;

  const subtotal = round2(baseLine + finishSurcharge + mountingSurcharge + extrasTotal + stairSurcharge);
  const vatRate = pricing.vat_rate ?? 0.21;
  const vatAmount = round2(subtotal * vatRate);
  const total = round2(subtotal + vatAmount);

  return {
    lengthMetres,
    effectivePerMeter: round2(effectivePerMeter),
    baseLine,
    finishSurcharge,
    mountingSurcharge,
    extrasTotal,
    stairSurcharge,
    subtotal,
    vatRate,
    vatAmount,
    total,
    currency: "EUR",
    disclaimer:
      pricing.disclaimer ??
      "Indicatieprijs, excl. definitieve opmeting, transport en montagekosten.",
    showPrices: pricing.show_prices !== false,
    label: pricing.price_display_label ?? "Richtprijs",
  };
}

function round2(n) {
  return Math.round(n * 100) / 100;
}
