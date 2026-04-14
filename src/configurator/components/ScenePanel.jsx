import { lazy, Suspense, useMemo } from "react";
import { canUseWebGL, getFinishData } from "../lib/utils";
import { useInView } from "../hooks/useInView";
import RailingFallback from "./RailingFallback";

const RailingScene = lazy(() => import("./RailingScene"));

function ScenePanel({ config, selection, selectionLabels }) {
  const [ref, isInView] = useInView();
  const webglEnabled = useMemo(() => canUseWebGL(), []);
  const activeFinish = getFinishData(config?.product?.finishes, selection.finish);

  return (
    <section className="tipto-preview-panel" ref={ref}>
      <div className="tipto-preview-copy">
        <div>
          <span className="tipto-preview-badge">Realtime preview</span>
          <h2>Visualiseer direct de impact van elke keuze</h2>
        </div>
        <p>{config?.brand?.tagline}</p>
      </div>

      <div className="tipto-preview-stage">
        {webglEnabled && isInView ? (
          <Suspense fallback={<div className="tipto-loader">{config?.ui?.loader_text}</div>}>
            <RailingScene finish={activeFinish} selection={selection} />
          </Suspense>
        ) : (
          <RailingFallback
            config={config}
            selection={selection}
            selectionLabels={selectionLabels}
            finish={activeFinish}
            mode={webglEnabled ? "lazy" : "fallback"}
          />
        )}
      </div>
    </section>
  );
}

export default ScenePanel;
