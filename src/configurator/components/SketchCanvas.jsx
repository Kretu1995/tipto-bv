import { useRef, useEffect, useState, useCallback } from "react";

/**
 * 2D drawing canvas for sketching balustrade layout.
 *
 * Coordinate space: logical units where 1 unit ≈ 1 cm.
 * The canvas fits its container; logical→screen scaling is computed on render.
 *
 * Drawing flow:
 *  - Click to place points (line segments connect automatically).
 *  - Double-click OR click near the first point (≤ 20px) to close/finish a polyline.
 *  - "Ongedaan" button removes the last placed point.
 *  - "Leeg" button clears everything.
 *  - "Segment beëindigen" finishes the current open polyline without closing.
 *  - Snap-to-grid toggle snaps points to a 25 cm grid.
 *
 * Data emitted to onChange:
 *   { polylines, totalLengthCm, segmentCount }
 */

// Logical canvas dimensions (1 unit = 1 cm equivalent, scale to container)
const LOGICAL_W = 900;
const LOGICAL_H = 450;
const GRID_CM   = 25;   // grid cell size in cm
const SNAP_CM   = 25;   // snap increment in cm

function distancePx(a, b, scale) {
  const dx = (a.x - b.x) * scale;
  const dy = (a.y - b.y) * scale;
  return Math.sqrt(dx * dx + dy * dy);
}

function logicalLengthCm(a, b) {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}

function snapToGrid(val) {
  return Math.round(val / SNAP_CM) * SNAP_CM;
}

function totalLength(polylines, currentPoints) {
  let total = 0;
  const allLines = [...polylines, currentPoints];
  for (const pts of allLines) {
    for (let i = 1; i < pts.length; i++) {
      total += logicalLengthCm(pts[i - 1], pts[i]);
    }
  }
  return Math.round(total);
}

function SketchCanvas({ onChange, config }) {
  const canvasRef      = useRef(null);
  const [polylines, setPolylines]       = useState([]);
  const [currentPoints, setCurrentPoints] = useState([]);
  const [mousePos, setMousePos]         = useState(null);
  const [snapEnabled, setSnapEnabled]   = useState(true);
  const [history, setHistory]           = useState([]); // for undo

  // Compute scale: logical → canvas pixels
  const getScale = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return 1;
    return canvas.width / LOGICAL_W;
  }, []);

  // Convert canvas-relative pixel coords to logical coords
  const toLogical = useCallback(
    (px, py) => {
      const s = getScale();
      let lx = px / s;
      let ly = py / s;
      if (snapEnabled) {
        lx = snapToGrid(lx);
        ly = snapToGrid(ly);
      }
      return { x: lx, y: ly };
    },
    [getScale, snapEnabled]
  );

  // Draw everything on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const s   = getScale();

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Background
    ctx.fillStyle = "#faf7f2";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Grid
    ctx.strokeStyle = "rgba(183,139,86,0.12)";
    ctx.lineWidth   = 1;
    const gridPx = GRID_CM * s;
    for (let x = 0; x < canvas.width; x += gridPx) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    for (let y = 0; y < canvas.height; y += gridPx) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }

    // Completed polylines
    for (const pts of polylines) {
      drawPolyline(ctx, pts, s, "#8e6537", 3, true);
    }

    // Current in-progress polyline
    if (currentPoints.length > 0) {
      drawPolyline(ctx, currentPoints, s, "#b78b56", 2.5, false);

      // Ghost line to mouse cursor
      if (mousePos) {
        const last = currentPoints[currentPoints.length - 1];
        ctx.setLineDash([6, 4]);
        ctx.strokeStyle = "rgba(183,139,86,0.5)";
        ctx.lineWidth   = 1.5;
        ctx.beginPath();
        ctx.moveTo(last.x * s, last.y * s);
        ctx.lineTo(mousePos.x * s, mousePos.y * s);
        ctx.stroke();
        ctx.setLineDash([]);
      }
    }

    // Length labels on completed polylines
    for (const pts of polylines) {
      drawLengthLabels(ctx, pts, s);
    }
    if (currentPoints.length > 1) {
      drawLengthLabels(ctx, currentPoints, s);
    }
  }, [polylines, currentPoints, mousePos, getScale]);

  function drawPolyline(ctx, pts, s, color, width, closed) {
    if (pts.length < 2) {
      // Draw just a point
      if (pts.length === 1) {
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(pts[0].x * s, pts[0].y * s, 5, 0, Math.PI * 2);
        ctx.fill();
      }
      return;
    }

    ctx.strokeStyle = color;
    ctx.lineWidth   = width;
    ctx.lineCap     = "round";
    ctx.lineJoin    = "round";
    ctx.setLineDash([]);
    ctx.beginPath();
    ctx.moveTo(pts[0].x * s, pts[0].y * s);
    for (let i = 1; i < pts.length; i++) {
      ctx.lineTo(pts[i].x * s, pts[i].y * s);
    }
    if (closed) ctx.closePath();
    ctx.stroke();

    // Vertex dots
    ctx.fillStyle = color;
    for (const pt of pts) {
      ctx.beginPath();
      ctx.arc(pt.x * s, pt.y * s, 5, 0, Math.PI * 2);
      ctx.fill();
    }

    // First point highlight (close target)
    ctx.strokeStyle = "rgba(142,101,55,0.4)";
    ctx.lineWidth   = 1;
    ctx.beginPath();
    ctx.arc(pts[0].x * s, pts[0].y * s, 14, 0, Math.PI * 2);
    ctx.stroke();
  }

  function drawLengthLabels(ctx, pts, s) {
    ctx.font         = `${Math.round(11 * s)}px Manrope, sans-serif`;
    ctx.fillStyle    = "#5d4b32";
    ctx.textAlign    = "center";
    ctx.textBaseline = "middle";

    for (let i = 1; i < pts.length; i++) {
      const a  = pts[i - 1];
      const b  = pts[i];
      const mx = ((a.x + b.x) / 2) * s;
      const my = ((a.y + b.y) / 2) * s;
      const len = Math.round(logicalLengthCm(a, b));

      ctx.fillStyle = "rgba(255,250,242,0.85)";
      const label = `${len} cm`;
      const tw    = ctx.measureText(label).width;
      ctx.fillRect(mx - tw / 2 - 3, my - 9 * s, tw + 6, 18 * s);

      ctx.fillStyle = "#5d4b32";
      ctx.fillText(label, mx, my);
    }
  }

  // Handle canvas click
  const handleClick = useCallback(
    (event) => {
      if (event.detail === 2) return; // handled by dblclick
      const rect = canvasRef.current.getBoundingClientRect();
      const s    = getScale();
      const rawX = (event.clientX - rect.left) * (canvasRef.current.width / rect.width);
      const rawY = (event.clientY - rect.top) * (canvasRef.current.height / rect.height);
      const pt   = toLogical(rawX / s, rawY / s);

      setCurrentPoints((prev) => {
        const next = [...prev, pt];

        // Check if click is near first point (close shape)
        if (prev.length >= 2) {
          const first = prev[0];
          if (distancePx(first, pt, s * getScale()) < 20) {
            // Close and save polyline
            setPolylines((pl) => [...pl, prev]);
            setHistory((h) => [...h, { type: "close", points: prev }]);
            emitChange([...polylines, prev], []);
            return [];
          }
        }

        setHistory((h) => [...h, { type: "add", point: pt }]);
        emitChange(polylines, next);
        return next;
      });
    },
    [toLogical, getScale, polylines]
  );

  // Double-click finishes current polyline
  const handleDblClick = useCallback(() => {
    if (currentPoints.length >= 2) {
      const saved = [...currentPoints];
      setPolylines((pl) => [...pl, saved]);
      setHistory((h) => [...h, { type: "finish", points: saved }]);
      emitChange([...polylines, saved], []);
      setCurrentPoints([]);
    }
  }, [currentPoints, polylines]);

  const handleMouseMove = useCallback(
    (event) => {
      const rect = canvasRef.current.getBoundingClientRect();
      const s    = getScale();
      const rawX = (event.clientX - rect.left) * (canvasRef.current.width / rect.width);
      const rawY = (event.clientY - rect.top) * (canvasRef.current.height / rect.height);
      setMousePos(toLogical(rawX / s, rawY / s));
    },
    [toLogical, getScale]
  );

  const handleMouseLeave = useCallback(() => setMousePos(null), []);

  function emitChange(pl, cp) {
    const total = totalLength(pl, cp);
    const segCount = pl.reduce((s, pts) => s + Math.max(0, pts.length - 1), 0) +
                     Math.max(0, cp.length - 1);
    onChange?.({
      polylines: pl,
      currentPoints: cp,
      totalLengthCm: total,
      segmentCount: segCount,
    });
  }

  const handleUndo = useCallback(() => {
    // Remove the last placed point from currentPoints, or the last finished polyline
    setCurrentPoints((cp) => {
      if (cp.length > 0) {
        const next = cp.slice(0, -1);
        emitChange(polylines, next);
        return next;
      }
      // No current points: undo last finished polyline
      setPolylines((pl) => {
        const next = pl.slice(0, -1);
        emitChange(next, []);
        return next;
      });
      return cp;
    });
  }, [polylines]);

  const handleClear = useCallback(() => {
    setPolylines([]);
    setCurrentPoints([]);
    setHistory([]);
    onChange?.({ polylines: [], currentPoints: [], totalLengthCm: 0, segmentCount: 0 });
  }, [onChange]);

  const handleFinishSegment = useCallback(() => {
    if (currentPoints.length >= 2) {
      const saved = [...currentPoints];
      setPolylines((pl) => [...pl, saved]);
      emitChange([...polylines, saved], []);
      setCurrentPoints([]);
    }
  }, [currentPoints, polylines]);

  // Resize canvas to container
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const observer = new ResizeObserver(() => {
      const w = canvas.parentElement?.clientWidth ?? 800;
      canvas.width  = w;
      canvas.height = Math.round(w * (LOGICAL_H / LOGICAL_W));
    });
    observer.observe(canvas.parentElement);
    return () => observer.disconnect();
  }, []);

  const totalLenCm = totalLength(polylines, currentPoints);
  const maxLen     = config?.product?.length_range?.max ?? 600;

  return (
    <div className="tipto-sketch-wrapper">
      <div className="tipto-sketch-header">
        <div>
          <h3>2D-schets</h3>
          <p>
            Klik om punten te plaatsen. Dubbelklik of klik op het eerste punt om een segment af te
            sluiten.
          </p>
        </div>
        <div className="tipto-sketch-meta">
          <span className="tipto-price-pill">
            Totale lengte: <strong>{totalLenCm} cm</strong>
          </span>
        </div>
      </div>

      <div className="tipto-sketch-canvas-wrapper">
        <canvas
          ref={canvasRef}
          className="tipto-sketch-canvas"
          onClick={handleClick}
          onDoubleClick={handleDblClick}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        />
      </div>

      {totalLenCm > maxLen && (
        <p className="tipto-sketch-warning">
          De getekende totale lengte ({totalLenCm} cm) overschrijdt het maximum van {maxLen} cm. De
          configuratie wordt gebruikt voor de indicatieprijs.
        </p>
      )}

      <div className="tipto-sketch-toolbar">
        <button
          type="button"
          className="tipto-sketch-btn"
          onClick={() => setSnapEnabled((v) => !v)}
          title={snapEnabled ? "Snap uitschakelen" : "Snap inschakelen"}
        >
          {snapEnabled ? "Snap: aan" : "Snap: uit"}
        </button>

        {currentPoints.length >= 2 && (
          <button type="button" className="tipto-sketch-btn" onClick={handleFinishSegment}>
            Segment beëindigen
          </button>
        )}

        <button
          type="button"
          className="tipto-sketch-btn"
          onClick={handleUndo}
          disabled={polylines.length === 0 && currentPoints.length === 0}
        >
          ← Ongedaan
        </button>

        <button
          type="button"
          className="tipto-sketch-btn tipto-sketch-btn--danger"
          onClick={handleClear}
          disabled={polylines.length === 0 && currentPoints.length === 0}
        >
          Leeg maken
        </button>
      </div>

      {polylines.length === 0 && currentPoints.length === 0 && (
        <div className="tipto-sketch-hint">
          <strong>Tip:</strong> Klik op het canvas om het eerste punt te plaatsen. Elke klik voegt
          een punt toe. Dubbelklik om het segment te beëindigen.
        </div>
      )}
    </div>
  );
}

export default SketchCanvas;
