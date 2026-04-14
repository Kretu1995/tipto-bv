export function getFirstValue(options = [], fallback = "") {
  return options[0]?.value ?? fallback;
}

export function getFinishOptions(finishes = [], material) {
  const scoped = finishes.filter((finish) => !finish.material || finish.material === material);
  return scoped.length ? scoped : finishes;
}

export function getLabelByValue(options = [], value) {
  return options.find((option) => option.value === value)?.label ?? value ?? "-";
}

/**
 * Build initial selection state from config.
 * railingStyle is intentionally NOT part of the mutable selection — it is fixed
 * internally as "architect" and never exposed to the customer UI.
 */
export function createInitialState(config) {
  const product = config?.product ?? {};
  const defaults = product.defaults ?? {};
  const initialMaterial = defaults.material ?? getFirstValue(product.materials, "aluminium");
  const initialFinish =
    defaults.finish ?? getFirstValue(getFinishOptions(product.finishes, initialMaterial), "zwart-structuur");

  return {
    // railingStyle is NOT included here — always "architect" internally
    length: defaults.length ?? 240,
    height: defaults.height ?? 105,
    depth: defaults.depth ?? 6,
    material: initialMaterial,
    finish: initialFinish,
    infill: defaults.infill ?? getFirstValue(product.infills, "glas"),
    mounting: defaults.mounting ?? getFirstValue(product.mountings, "vloer"),
    extraOptions: [],
  };
}

/** The fixed internal railing style. Never visible to the customer. */
export const FIXED_RAILING_STYLE = "architect";
