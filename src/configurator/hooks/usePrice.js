import { useMemo } from "react";
import { calculatePrice } from "../lib/pricing";

/**
 * Reactive wrapper around calculatePrice.
 * Recalculates whenever selection or config.pricing changes.
 *
 * @param {object} selection   Current configurator selection state.
 * @param {object} config      Full frontend config (uses config.pricing).
 * @returns {object|null}      Price breakdown object, or null.
 */
export function usePrice(selection, config) {
  return useMemo(
    () => calculatePrice(selection, config?.pricing),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      selection?.length,
      selection?.material,
      selection?.finish,
      selection?.infill,
      selection?.mounting,
      // stringify extra options to detect changes without deep compare
      JSON.stringify(selection?.extraOptions),
      config?.pricing,
    ]
  );
}
