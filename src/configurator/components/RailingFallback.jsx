function RailingFallback({ config, selection, selectionLabels, finish, mode }) {
  return (
    <div className="tipto-fallback">
      <div className="tipto-fallback-visual" style={{ "--tipto-finish": finish?.hex ?? "#22262B" }}>
        <div className="tipto-fallback-rail" />
        <div className="tipto-fallback-panel" data-infill={selection.infill} />
      </div>
      <div className="tipto-fallback-copy">
        <strong>
          {mode === "fallback" ? config?.ui?.fallback_title : "Preview klaar zodra zichtbaar"}
        </strong>
        <p>
          {mode === "fallback"
            ? config?.ui?.fallback_text
            : "De 3D-scene wordt pas geladen wanneer de widget in beeld komt, om de pagina sneller te houden."}
        </p>
        <ul className="tipto-fallback-list">
          <li>{selection.length} cm lengte</li>
          <li>{selection.height} cm hoogte</li>
          <li>{selectionLabels.infill}</li>
          <li>{selectionLabels.mounting}</li>
        </ul>
      </div>
    </div>
  );
}

export default RailingFallback;
