import { STEP_LABELS, TOTAL_STEPS, WIZARD_STEPS } from "../hooks/useWizard";

/**
 * Wizard navigation shell.
 * Renders step indicator bar + previous/next navigation.
 * Purely presentational – receives all state as props.
 */
function WizardShell({ step, canGoNext, onNext, onBack, children }) {
  const steps = Object.values(WIZARD_STEPS);

  return (
    <div className="tipto-wizard">
      <div className="tipto-wizard-steps">
        {steps.map((s) => (
          <div
            key={s}
            className={`tipto-wizard-step ${step === s ? "is-active" : ""} ${step > s ? "is-done" : ""}`}
          >
            <div className="tipto-wizard-step-circle">
              {step > s ? <span>✓</span> : <span>{s}</span>}
            </div>
            <span className="tipto-wizard-step-label">{STEP_LABELS[s]}</span>
          </div>
        ))}

        <div
          className="tipto-wizard-progress"
          style={{ width: `${((step - 1) / (TOTAL_STEPS - 1)) * 100}%` }}
        />
      </div>

      <div className="tipto-wizard-body">{children}</div>

      {step > WIZARD_STEPS.METHOD && (
        <div className="tipto-wizard-nav">
          <button
            type="button"
            className="tipto-wizard-back-btn"
            onClick={onBack}
          >
            ← Vorige stap
          </button>

          {step < TOTAL_STEPS && (
            <button
              type="button"
              className="tipto-primary-button tipto-wizard-next-btn"
              onClick={onNext}
              disabled={!canGoNext}
              title={!canGoNext ? "Voltooi eerst deze stap om verder te gaan." : undefined}
            >
              Volgende stap →
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default WizardShell;
