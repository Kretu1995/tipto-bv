import { useState, useCallback } from "react";

export const WIZARD_STEPS = {
  METHOD: 1,
  CONFIGURE: 2,
  PRICE: 3,
  QUOTE: 4,
};

export const STEP_LABELS = {
  [WIZARD_STEPS.METHOD]: "Kies methode",
  [WIZARD_STEPS.CONFIGURE]: "Configureren",
  [WIZARD_STEPS.PRICE]: "Prijsindicatie",
  [WIZARD_STEPS.QUOTE]: "Offerte aanvragen",
};

export const TOTAL_STEPS = Object.keys(WIZARD_STEPS).length;

/**
 * Simple wizard step state machine.
 * Returns step, method and navigation helpers.
 */
export function useWizard() {
  const [step, setStep] = useState(WIZARD_STEPS.METHOD);
  const [method, setMethod] = useState(null); // 'configureren' | 'tekenen' | 'foto'

  const canGoNext = useCallback(
    (sketchData, photoToken) => {
      if (step === WIZARD_STEPS.METHOD) return method !== null;
      if (step === WIZARD_STEPS.CONFIGURE) {
        if (method === "tekenen") return sketchData !== null;
        if (method === "foto") return photoToken !== null;
        return true; // 3D configurator is always valid
      }
      return step < TOTAL_STEPS;
    },
    [step, method]
  );

  const goNext = useCallback(() => {
    setStep((s) => Math.min(s + 1, TOTAL_STEPS));
  }, []);

  const goBack = useCallback(() => {
    setStep((s) => Math.max(s - 1, WIZARD_STEPS.METHOD));
  }, []);

  const selectMethod = useCallback((selectedMethod) => {
    setMethod(selectedMethod);
    setStep(WIZARD_STEPS.CONFIGURE);
  }, []);

  return { step, method, selectMethod, goNext, goBack, canGoNext, setStep };
}
