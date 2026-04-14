/**
 * Step 1 – Method selector.
 * Three large cards: quick 3D configure / draw sketch / upload photo.
 */
function MethodSelector({ onSelect }) {
  const methods = [
    {
      id: "configureren",
      icon: "⬛",
      title: "3D-configurator",
      description:
        "Kies direct stijl, afmetingen, materiaal en afwerking. Bekijk het resultaat live in 3D.",
      cta: "Direct configureren",
    },
    {
      id: "tekenen",
      icon: "✏️",
      title: "2D-schets tekenen",
      description:
        "Teken zelf de plattegrond van uw terras, balkon of trap en stel de lengte van elk segment in.",
      cta: "Schets starten",
    },
    {
      id: "foto",
      icon: "📷",
      title: "Foto uploaden",
      description:
        "Upload een foto van de locatie. AI analyseert de afmetingen en doet een eerste voorstel voor de configuratie.",
      cta: "Foto uploaden",
    },
  ];

  return (
    <div className="tipto-method-selector">
      <div className="tipto-method-intro">
        <div className="tipto-eyebrow">Stap 1</div>
        <h2>Hoe wilt u starten?</h2>
        <p>
          Kies de methode die het beste past bij uw situatie. U kunt daarna altijd handmatig
          aanpassen.
        </p>
      </div>

      <div className="tipto-method-cards">
        {methods.map((m) => (
          <button
            key={m.id}
            className="tipto-method-card"
            onClick={() => onSelect(m.id)}
            type="button"
          >
            <span className="tipto-method-icon" aria-hidden="true">
              {m.icon}
            </span>
            <strong className="tipto-method-title">{m.title}</strong>
            <p className="tipto-method-desc">{m.description}</p>
            <span className="tipto-method-cta">{m.cta} →</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export default MethodSelector;
