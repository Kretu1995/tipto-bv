import { useRef, useEffect, useState, useCallback, useMemo } from "react";
import { getRoundedCorners, getVertexDegree, sampleRoundedCorner } from "../lib/geometry";

/**
 * Professional 2D balustrade planner.
 *
 * Coordinate system:
 *   Plan  : x = right, y = up  (in centimetres)
 *   Canvas: x = right, y = down (CSS pixels, DPI-scaled internally)
 *
 * Modes:
 *   draw   — click to place vertices; connecting segments are created automatically.
 *   select — click/drag to select and move elements.
 *
 * Key rules enforced here:
 *   - Double-clicking a segment or its label enters inline text edit mode ONLY.
 *   - Backspace while editing only edits the numeric text — NEVER deletes a segment.
 *   - Backspace outside of text editing does NOT delete segments either.
 *   - Full segment/vertex deletion is ONLY via the explicit "Verwijder" (Delete) button
 *     or the keyboard Delete key (not Backspace).
 */

// ─── Constants ───────────────────────────────────────────────────────────────

const VERTEX_HIT_R  = 13;  // px – hit radius for vertices
const SEGMENT_HIT_W = 10;  // px – perpendicular hit width for segments
const SNAP_CM       = 25;  // cm – grid snap increment
const MINOR_GRID    = 25;  // cm
const MAJOR_GRID    = 100; // cm

// ─── Pure helpers ─────────────────────────────────────────────────────────────

function computeTransform(vertices, cssW, cssH) {
  const PAD          = 80;
  const MIN_SPAN_X   = 600;
  const MIN_SPAN_Y   = 500;
  const MAX_SCALE    = 2.2;

  const verts = Object.values(vertices);

  let minX, maxX, minY, maxY;
  if (verts.length === 0) {
    minX = -100; maxX = 500; minY = -150; maxY = 200;
  } else {
    const xs = verts.map(v => v.x);
    const ys = verts.map(v => v.y);
    minX = Math.min(...xs); maxX = Math.max(...xs);
    minY = Math.min(...ys); maxY = Math.max(...ys);
  }

  const midX = (minX + maxX) / 2;
  const midY = (minY + maxY) / 2;

  const bbW = Math.max(maxX - minX, MIN_SPAN_X);
  const bbH = Math.max(maxY - minY, MIN_SPAN_Y);

  const scale = Math.min(
    (cssW - 2 * PAD) / bbW,
    (cssH - 2 * PAD) / bbH,
    MAX_SCALE,
  );

  return {
    scale,
    ox: cssW / 2 - midX * scale,
    oy: cssH / 2 + midY * scale,
  };
}

function planToCanvas(px, py, tx) {
  return { cx: px * tx.scale + tx.ox, cy: -py * tx.scale + tx.oy };
}

function canvasToPlan(cx, cy, tx) {
  return { x: (cx - tx.ox) / tx.scale, y: -(cy - tx.oy) / tx.scale };
}

const ANGLE_LOCK_DEG = 7;
const MIN_DIST_CM    = 20;

function applySnap(x, y, snapOn, anchor) {
  let rx = x, ry = y;

  if (anchor) {
    const dx = rx - anchor.x;
    const dy = ry - anchor.y;
    const dist = Math.hypot(dx, dy);

    if (dist >= MIN_DIST_CM) {
      const deg = Math.atan2(dy, dx) * (180 / Math.PI);
      const near45 = Math.round(deg / 45) * 45;

      if (Math.abs(deg - near45) < ANGLE_LOCK_DEG) {
        const rad = near45 * (Math.PI / 180);
        if (near45 === 0 || Math.abs(near45) === 180) {
          ry = anchor.y;
        } else if (near45 === 90 || near45 === -90) {
          rx = anchor.x;
        } else {
          const cos = Math.cos(rad);
          const sin = Math.sin(rad);
          const proj = dx * cos + dy * sin;
          rx = anchor.x + proj * cos;
          ry = anchor.y + proj * sin;
        }
      }
    }
  }

  if (snapOn) {
    rx = Math.round(rx / SNAP_CM) * SNAP_CM;
    ry = Math.round(ry / SNAP_CM) * SNAP_CM;
  }

  return { x: rx, y: ry };
}

function distToSegmentPx(cx, cy, ax, ay, bx, by) {
  const dx = bx - ax, dy = by - ay;
  const len2 = dx * dx + dy * dy;
  if (len2 < 1) return Math.hypot(cx - ax, cy - ay);
  const t = Math.max(0, Math.min(1, ((cx - ax) * dx + (cy - ay) * dy) / len2));
  return Math.hypot(cx - (ax + t * dx), cy - (ay + t * dy));
}

function formatLen(cm) {
  return `${Math.round(cm)} cm`;
}

function rrect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function drawPremiumTag(ctx, {
  x,
  y,
  text,
  variant = "default",
  paddingX = 10,
  height = 24,
}) {
  const styles = {
    default: {
      fill: "rgba(255,255,255,0.92)",
      stroke: "rgba(17,20,24,0.08)",
      color: "#22262B",
      shadow: "rgba(28,24,18,0.10)",
    },
    selected: {
      fill: "rgba(255,248,236,0.98)",
      stroke: "rgba(201,151,76,0.34)",
      color: "#8B6325",
      shadow: "rgba(201,151,76,0.18)",
    },
    stair: {
      fill: "rgba(247, 242, 232, 0.96)",
      stroke: "rgba(158, 116, 48, 0.20)",
      color: "#9A6820",
      shadow: "rgba(109, 86, 44, 0.12)",
    },
    editing: {
      fill: "rgba(255,244,220,0.98)",
      stroke: "rgba(201,151,76,0.48)",
      color: "#7A531D",
      shadow: "rgba(201,151,76,0.22)",
    },
    info: {
      fill: "rgba(246, 250, 252, 0.96)",
      stroke: "rgba(93, 132, 156, 0.22)",
      color: "#315A6B",
      shadow: "rgba(78, 120, 146, 0.12)",
    },
  };

  const style = styles[variant] ?? styles.default;
  const width = ctx.measureText(text).width + paddingX * 2;

  ctx.save();
  ctx.shadowColor = style.shadow;
  ctx.shadowBlur = 18;
  ctx.shadowOffsetY = 6;
  ctx.fillStyle = style.fill;
  rrect(ctx, x - width / 2, y - height / 2, width, height, 8);
  ctx.fill();
  ctx.shadowColor = "transparent";
  ctx.strokeStyle = style.stroke;
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.fillStyle = style.color;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, x, y + 0.5);
  ctx.restore();
}

// ─── Component ────────────────────────────────────────────────────────────────

function Planner2D({
  geo,
  vertices,
  segments,
  totalLength,
  hasRoundingEnabled,
  moveVertex,
  setVertexRounding,
  placeVertex,
  connectVertices,
  deleteSegment,
  deleteVertex,
  changeSegmentLength,
  changeSegmentRise,
  clear,
  undo,
  sealHistory,
  canUndo,
}) {
  const canvasRef    = useRef(null);
  const txRef        = useRef(null);
  const dragMovedRef = useRef(false);

  const [mode,        setMode]        = useState("draw");
  const [pendingId,   setPendingId]   = useState(null);
  const [snapOn,      setSnapOn]      = useState(true);
  const [hovered,     setHovered]     = useState(null);
  const [selected,    setSelected]    = useState(null);
  const [dragging,    setDragging]    = useState(null);
  const [mousePos,    setMousePos]    = useState(null);
  const [editLength,  setEditLength]  = useState(null); // { segId, value }
  const [drawKey,     setDrawKey]     = useState(0);
  const [cornerHandlePos, setCornerHandlePos] = useState(null);

  const pendingVertex     = pendingId ? geo.vertices[pendingId] ?? null : null;
  const selectedVertex    = selected?.type === "vertex" ? geo.vertices[selected.id] ?? null : null;
  const selectedVertexDeg = selectedVertex ? getVertexDegree(geo, selectedVertex.id) : 0;
  const canEditRounding   = hasRoundingEnabled && selectedVertexDeg === 2;

  // Currently selected segment (for stair panel)
  const selectedSegment = selected?.type === "segment"
    ? segments.find(s => s.id === selected.id) ?? null
    : null;

  // ── Resize observer ──────────────────────────────────────────────────────

  useEffect(() => {
    const wrap = canvasRef.current?.parentElement;
    if (!wrap) return;
    const ro = new ResizeObserver(() => setDrawKey(k => k + 1));
    ro.observe(wrap);
    return () => ro.disconnect();
  }, []);

  // ── Snapped ghost-line target + active angle label ───────────────────────

  const ghostTarget = useMemo(() => {
    if (!mousePos || !txRef.current) return null;
    const plan = canvasToPlan(mousePos.cx, mousePos.cy, txRef.current);
    const snapped = applySnap(plan.x, plan.y, snapOn, pendingVertex);

    let angleLabel = null;
    if (pendingVertex) {
      const dx = plan.x - pendingVertex.x;
      const dy = plan.y - pendingVertex.y;
      const dist = Math.hypot(dx, dy);
      if (dist >= MIN_DIST_CM) {
        const deg = Math.atan2(dy, dx) * (180 / Math.PI);
        const near45 = Math.round(deg / 45) * 45;
        if (Math.abs(deg - near45) < ANGLE_LOCK_DEG) {
          const norm = ((near45 % 360) + 360) % 360;
          if (norm === 0 || norm === 180)       angleLabel = "horiz";
          else if (norm === 90 || norm === 270) angleLabel = "vert";
          else                                  angleLabel = "45°";
        }
      }
    }

    return { ...snapped, angleLabel };
  }, [mousePos, snapOn, pendingVertex]);

  // ── Hit testing ──────────────────────────────────────────────────────────

  const findHit = useCallback((cx, cy) => {
    const tx = txRef.current;
    if (!tx) return null;
    for (const v of vertices) {
      const p = planToCanvas(v.x, v.y, tx);
      if (Math.hypot(cx - p.cx, cy - p.cy) < VERTEX_HIT_R) {
        return { id: v.id, type: "vertex" };
      }
    }
    for (const seg of segments) {
      const a = planToCanvas(seg.start.x, seg.start.y, tx);
      const b = planToCanvas(seg.end.x,   seg.end.y,   tx);
      if (distToSegmentPx(cx, cy, a.cx, a.cy, b.cx, b.cy) < SEGMENT_HIT_W) {
        return { id: seg.id, type: "segment" };
      }
    }
    return null;
  }, [vertices, segments]);

  // ── Canvas draw ──────────────────────────────────────────────────────────

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const dpr  = window.devicePixelRatio || 1;
    const cssW = canvas.parentElement?.clientWidth  || 800;
    const cssH = canvas.parentElement?.clientHeight || 400;

    canvas.width        = cssW * dpr;
    canvas.height       = cssH * dpr;
    canvas.style.width  = `${cssW}px`;
    canvas.style.height = `${cssH}px`;

    ctx.save();
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, cssW, cssH);

    const tx = computeTransform(geo.vertices, cssW, cssH);
    txRef.current = tx;
    const roundedCorners = hasRoundingEnabled ? getRoundedCorners(geo) : [];
    const roundedCornerMap = new Map(roundedCorners.map((corner) => [corner.vertexId, corner]));

    // Background
    const bg = ctx.createLinearGradient(0, 0, cssW, cssH);
    bg.addColorStop(0, "#FCFAF6");
    bg.addColorStop(1, "#F2ECE2");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, cssW, cssH);

    const glow = ctx.createRadialGradient(cssW * 0.78, cssH * 0.1, 0, cssW * 0.78, cssH * 0.1, cssW * 0.55);
    glow.addColorStop(0, "rgba(201,151,76,0.11)");
    glow.addColorStop(1, "rgba(201,151,76,0)");
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, cssW, cssH);

    // Grid viewport bounds
    const planL = canvasToPlan(0, cssH / 2, tx).x;
    const planR = canvasToPlan(cssW, cssH / 2, tx).x;
    const planB = canvasToPlan(cssW / 2, cssH, tx).y;
    const planT = canvasToPlan(cssW / 2, 0, tx).y;

    // Minor grid
    ctx.strokeStyle = "rgba(26, 31, 36, 0.035)";
    ctx.lineWidth   = 1;
    for (let x = Math.floor(planL / MINOR_GRID) * MINOR_GRID; x <= Math.ceil(planR / MINOR_GRID) * MINOR_GRID; x += MINOR_GRID) {
      const { cx } = planToCanvas(x, 0, tx);
      ctx.beginPath(); ctx.moveTo(cx, 0); ctx.lineTo(cx, cssH); ctx.stroke();
    }
    for (let y = Math.floor(planB / MINOR_GRID) * MINOR_GRID; y <= Math.ceil(planT / MINOR_GRID) * MINOR_GRID; y += MINOR_GRID) {
      const { cy } = planToCanvas(0, y, tx);
      ctx.beginPath(); ctx.moveTo(0, cy); ctx.lineTo(cssW, cy); ctx.stroke();
    }

    // Major grid + labels
    ctx.strokeStyle = "rgba(36, 31, 26, 0.075)";
    ctx.lineWidth   = 1.2;
    ctx.fillStyle   = "rgba(59, 53, 46, 0.28)";
    ctx.font        = "600 10px Manrope, sans-serif";
    ctx.textAlign   = "right";
    ctx.textBaseline = "bottom";

    for (let x = Math.floor(planL / MAJOR_GRID) * MAJOR_GRID; x <= Math.ceil(planR / MAJOR_GRID) * MAJOR_GRID; x += MAJOR_GRID) {
      const { cx } = planToCanvas(x, 0, tx);
      ctx.beginPath(); ctx.moveTo(cx, 0); ctx.lineTo(cx, cssH); ctx.stroke();
      if (cx > 20 && cx < cssW - 4) ctx.fillText(`${x}`, cx - 2, cssH - 3);
    }
    for (let y = Math.floor(planB / MAJOR_GRID) * MAJOR_GRID; y <= Math.ceil(planT / MAJOR_GRID) * MAJOR_GRID; y += MAJOR_GRID) {
      const { cy } = planToCanvas(0, y, tx);
      ctx.beginPath(); ctx.moveTo(0, cy); ctx.lineTo(cssW, cy); ctx.stroke();
    }

    // ── Segments ──
    segments.forEach(seg => {
      const startPlan = roundedCornerMap.get(seg.start.id)?.tangentByNeighbor[seg.end.id] ?? seg.start;
      const endPlan   = roundedCornerMap.get(seg.end.id)?.tangentByNeighbor[seg.start.id] ?? seg.end;
      const a   = planToCanvas(startPlan.x, startPlan.y, tx);
      const b   = planToCanvas(endPlan.x,   endPlan.y,   tx);
      const isH = hovered?.id === seg.id  && hovered?.type  === "segment";
      const isS = selected?.id === seg.id && selected?.type === "segment";
      const isEditing = editLength?.segId === seg.id;
      const isStair = (seg.rise ?? 0) !== 0;

      ctx.lineCap  = "round";
      ctx.lineJoin = "round";

      // Soft underlay for depth
      ctx.strokeStyle = "rgba(255,255,255,0.95)";
      ctx.lineWidth   = isEditing || isS ? 12 : isH ? 10 : 9;
      ctx.setLineDash([]);
      ctx.beginPath(); ctx.moveTo(a.cx, a.cy); ctx.lineTo(b.cx, b.cy); ctx.stroke();

      ctx.save();
      ctx.shadowColor = isEditing
        ? "rgba(201,151,76,0.28)"
        : isS
          ? "rgba(201,151,76,0.20)"
          : isH
            ? "rgba(48,86,109,0.18)"
            : "rgba(20,26,33,0.10)";
      ctx.shadowBlur = isEditing ? 20 : isS ? 18 : 10;
      ctx.shadowOffsetY = 6;

      // Premium line hierarchy
      if (isStair) {
        ctx.setLineDash([10, 7]);
        ctx.strokeStyle = isEditing ? "#D39D49" : isS ? "#C4954A" : isH ? "#A8732D" : "#B78843";
        ctx.lineWidth   = isEditing ? 5 : isS ? 4.5 : isH ? 4 : 3.5;
      } else {
        ctx.setLineDash([]);
        ctx.strokeStyle = isEditing ? "#D39D49" : isS ? "#C4954A" : isH ? "#3E5868" : "#20252B";
        ctx.lineWidth   = isEditing ? 5 : isS ? 4.5 : isH ? 4 : 3.25;
      }
      ctx.beginPath(); ctx.moveTo(a.cx, a.cy); ctx.lineTo(b.cx, b.cy); ctx.stroke();
      ctx.restore();
      ctx.setLineDash([]);

      if (isS || isEditing) {
        ctx.save();
        ctx.setLineDash([2, 8]);
        ctx.strokeStyle = isEditing ? "rgba(201,151,76,0.52)" : "rgba(201,151,76,0.34)";
        ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.arc(a.cx, a.cy, 10, 0, Math.PI * 2); ctx.stroke();
        ctx.beginPath(); ctx.arc(b.cx, b.cy, 10, 0, Math.PI * 2); ctx.stroke();
        ctx.restore();
      }

      // Length label
      const mx = (a.cx + b.cx) / 2;
      const my = (a.cy + b.cy) / 2;
      const riseLabel = String.fromCharCode(8593);
      const label = isStair
        ? `${formatLen(seg.length)} ↑${Math.round(Math.abs(seg.rise))}`
        : formatLen(seg.length);

      ctx.font = `${isEditing || isS ? "700" : "600"} 11px Manrope, sans-serif`;
      drawPremiumTag(ctx, {
        x: mx,
        y: my,
        text: label,
        variant: isEditing ? "editing" : isS ? "selected" : isStair ? "stair" : "default",
      });
    });

    // ── Rounded corners ──
    roundedCorners.forEach((corner) => {
      const points = sampleRoundedCorner(corner, 18);
      if (points.length < 2) return;

      ctx.strokeStyle = selected?.id === corner.vertexId ? "#C4954A" : "rgba(32,37,43,0.92)";
      ctx.lineWidth = selected?.id === corner.vertexId ? 4.5 : 3.25;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.shadowColor = selected?.id === corner.vertexId ? "rgba(201,151,76,0.20)" : "rgba(20,26,33,0.08)";
      ctx.shadowBlur = selected?.id === corner.vertexId ? 14 : 8;
      ctx.shadowOffsetY = 4;
      ctx.beginPath();

      points.forEach((point, index) => {
        const { cx, cy } = planToCanvas(point.x, point.y, tx);
        if (index === 0) ctx.moveTo(cx, cy);
        else ctx.lineTo(cx, cy);
      });
      ctx.stroke();
      ctx.shadowColor = "transparent";
    });

    // ── Ghost line (draw mode) ──
    if (canEditRounding && selectedVertex) {
      const { cx, cy } = planToCanvas(selectedVertex.x, selectedVertex.y, tx);
      setCornerHandlePos((current) => {
        const next = { left: cx + 18, top: cy - 18 };
        if (
          current &&
          Math.abs(current.left - next.left) < 0.5 &&
          Math.abs(current.top - next.top) < 0.5
        ) return current;
        return next;
      });
    } else {
      setCornerHandlePos((current) => (current == null ? current : null));
    }

    if (mode === "draw" && pendingVertex && ghostTarget) {
      const pv     = planToCanvas(pendingVertex.x, pendingVertex.y, tx);
      const gt     = planToCanvas(ghostTarget.x,   ghostTarget.y,   tx);
      const locked = !!ghostTarget.angleLabel;

      ctx.lineCap     = "round";
      ctx.lineWidth   = 1.5;
      ctx.strokeStyle = locked ? "rgba(80,180,200,0.75)" : "rgba(196,149,74,0.55)";
      ctx.setLineDash(locked ? [0] : [7, 5]);
      ctx.beginPath(); ctx.moveTo(pv.cx, pv.cy); ctx.lineTo(gt.cx, gt.cy); ctx.stroke();
      ctx.setLineDash([]);

      if (locked) {
        const bx = gt.cx + 10, by = gt.cy - 16;
        const bl = ghostTarget.angleLabel;
        ctx.font = "700 10px Manrope, sans-serif";
        drawPremiumTag(ctx, { x: bx + 14, y: by, text: bl, variant: "info", paddingX: 8, height: 18 });
      }

      const len = Math.hypot(ghostTarget.x - pendingVertex.x, ghostTarget.y - pendingVertex.y);
      if (len > 5) {
        const lx = (pv.cx + gt.cx) / 2, ly = (pv.cy + gt.cy) / 2;
        const lb = formatLen(len);
        ctx.font = "600 11px Manrope, sans-serif";
        drawPremiumTag(ctx, { x: lx, y: ly, text: lb, variant: locked ? "info" : "selected" });
      }
    }

    // ── Vertices ──
    vertices.forEach(v => {
      const { cx, cy } = planToCanvas(v.x, v.y, tx);
      const isH = hovered?.id  === v.id && hovered?.type  === "vertex";
      const isS = selected?.id === v.id && selected?.type === "vertex";
      const isP = v.id === pendingId;

      if (isP) {
        ctx.strokeStyle = "rgba(196,149,74,0.35)";
        ctx.lineWidth   = 1;
        ctx.setLineDash([3, 3]);
        ctx.beginPath(); ctx.arc(cx, cy, 18, 0, Math.PI * 2); ctx.stroke();
        ctx.setLineDash([]);
      }

      const r = isP || isS ? 7 : isH ? 6 : 5;
      ctx.save();
      ctx.shadowColor = isS || isP ? "rgba(201,151,76,0.24)" : isH ? "rgba(62,88,104,0.14)" : "rgba(20,26,33,0.10)";
      ctx.shadowBlur = isS || isP ? 16 : 10;
      ctx.shadowOffsetY = 4;
      ctx.beginPath(); ctx.arc(cx, cy, r + 4, 0, Math.PI * 2);
      ctx.fillStyle = isS || isP ? "rgba(255,250,240,0.92)" : isH ? "rgba(244,247,250,0.88)" : "rgba(255,255,255,0.9)";
      ctx.fill();
      ctx.shadowColor = "transparent";
      ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fillStyle = isS || isP ? "#C4954A" : isH ? "#3E5868" : "#20252B";
      ctx.fill();
      ctx.strokeStyle = "#fff";
      ctx.lineWidth   = isS || isP ? 2 : 1.5;
      ctx.stroke();
      ctx.restore();
    });

    // ── Ghost target dot ──
    if (mode === "draw" && ghostTarget) {
      const { cx, cy } = planToCanvas(ghostTarget.x, ghostTarget.y, tx);
      ctx.beginPath(); ctx.arc(cx, cy, 3.5, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(196,149,74,0.8)";
      ctx.fill();
    }

    ctx.restore();
  }, [geo, vertices, segments, hovered, selected, pendingId, pendingVertex, ghostTarget, mode, drawKey, hasRoundingEnabled, canEditRounding, selectedVertex, editLength]);

  // ── Event helpers ────────────────────────────────────────────────────────

  function getPos(e) {
    const r = canvasRef.current.getBoundingClientRect();
    return { cx: e.clientX - r.left, cy: e.clientY - r.top };
  }

  // ── Event handlers ───────────────────────────────────────────────────────

  const handleMouseDown = useCallback(e => {
    if (e.button !== 0) return;
    dragMovedRef.current = false;
    const pos = getPos(e);
    const hit = findHit(pos.cx, pos.cy);

    if (mode === "select") {
      setSelected(hit);
      if (hit?.type === "vertex") setDragging({ vertexId: hit.id });
    } else {
      if (hit?.type === "vertex") {
        if (pendingId && pendingId !== hit.id) {
          connectVertices(pendingId, hit.id);
          setPendingId(hit.id);
        } else {
          setPendingId(hit.id);
        }
        dragMovedRef.current = true;
      }
    }
  }, [mode, pendingId, findHit, connectVertices]);

  const handleMouseMove = useCallback(e => {
    const pos = getPos(e);
    setMousePos(pos);

    if (!dragging) {
      setHovered(findHit(pos.cx, pos.cy));
      return;
    }

    dragMovedRef.current = true;
    const tx = txRef.current;
    if (!tx) return;
    const plan = canvasToPlan(pos.cx, pos.cy, tx);
    const snapped = applySnap(plan.x, plan.y, snapOn, null);
    moveVertex(dragging.vertexId, snapped.x, snapped.y);
  }, [dragging, findHit, snapOn, moveVertex]);

  const handleMouseUp = useCallback(() => {
    if (dragging) sealHistory?.();
    setDragging(null);
  }, [dragging, sealHistory]);

  const handleClick = useCallback(e => {
    if (e.detail === 2 || dragMovedRef.current) return;
    const pos = getPos(e);
    const tx  = txRef.current;
    if (!tx) return;
    const hit = findHit(pos.cx, pos.cy);

    if (mode === "draw") {
      if (hit?.type === "vertex") return;
      const plan    = canvasToPlan(pos.cx, pos.cy, tx);
      const snapped = applySnap(plan.x, plan.y, snapOn, pendingVertex);
      const newId   = placeVertex(snapped.x, snapped.y, pendingId);
      setPendingId(newId);
    } else {
      setSelected(hit);
    }
  }, [mode, pendingId, pendingVertex, snapOn, placeVertex, findHit]);

  const handleDblClick = useCallback(e => {
    if (mode === "draw") {
      setPendingId(null);
      return;
    }
    const pos = getPos(e);
    const hit = findHit(pos.cx, pos.cy);

    // Double-click on a vertex with rounding enabled → edit rounding
    if (mode === "select" && hasRoundingEnabled && hit?.type === "vertex") {
      if (getVertexDegree(geo, hit.id) === 2) {
        setSelected(hit);
        const vertex = geo.vertices[hit.id];
        setVertexRounding(hit.id, Math.max(25, vertex?.roundingRadius ?? 0));
        return;
      }
    }

    // Double-click on ANY segment (selected or not) → open inline length editor
    if (mode === "select" && hit?.type === "segment") {
      setSelected(hit);
      const seg = segments.find(s => s.id === hit.id);
      if (seg) setEditLength({ segId: seg.id, value: String(Math.round(seg.length)) });
      return;
    }

    // Fallback: double-click on already-selected segment (clicked on the label area)
    if (mode === "select" && selected?.type === "segment" && !hit) {
      const seg = segments.find(s => s.id === selected.id);
      if (seg) setEditLength({ segId: seg.id, value: String(Math.round(seg.length)) });
    }
  }, [mode, selected, segments, findHit, hasRoundingEnabled, geo, setVertexRounding]);

  const handleMouseLeave = useCallback(() => {
    setMousePos(null);
    setHovered(null);
    if (dragging) {
      sealHistory?.();
      setDragging(null);
    }
  }, [dragging, sealHistory]);

  const handleKeyDown = useCallback(e => {
    // Ctrl+Z / Cmd+Z — undo
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z") {
      e.preventDefault();
      undo?.();
      return;
    }

    // Escape — cancel pending / deselect
    if (e.key === "Escape") {
      setPendingId(null);
      setSelected(null);
    }

    // Delete key ONLY — remove selected element.
    // Backspace is intentionally excluded: it must never delete a segment,
    // whether or not the inline editor is active.
    if (e.key === "Delete" && selected && !editLength) {
      if (selected.type === "segment") deleteSegment(selected.id);
      else deleteVertex(selected.id);
      setSelected(null);
    }
  }, [selected, editLength, deleteSegment, deleteVertex, undo]);

  // ── Cursor style ──────────────────────────────────────────────────────────

  const cursor = useMemo(() => {
    if (mode === "draw")             return "crosshair";
    if (dragging)                    return "grabbing";
    if (hovered?.type === "vertex")  return "grab";
    if (hovered?.type === "segment") return "pointer";
    return "default";
  }, [mode, dragging, hovered]);

  // ── Inline length editor position ─────────────────────────────────────────

  const editSeg = editLength ? segments.find(s => s.id === editLength.segId) : null;
  const editPos = useMemo(() => {
    if (!editSeg || !txRef.current) return null;
    const a = planToCanvas(editSeg.start.x, editSeg.start.y, txRef.current);
    const b = planToCanvas(editSeg.end.x,   editSeg.end.y,   txRef.current);
    return { cx: (a.cx + b.cx) / 2, cy: (a.cy + b.cy) / 2 };
  }, [editSeg]);

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="p2d" tabIndex={0} onKeyDown={handleKeyDown} style={{ outline: "none" }}>

      {/* ── Toolbar ── */}
      <div className="p2d__toolbar">
        <div className="p2d__mode-group">
          <button
            className={`p2d__tool ${mode === "draw" ? "p2d__tool--active" : ""}`}
            onClick={() => { setMode("draw"); setSelected(null); }}
            title="Tekenen (klik om punten te plaatsen)"
          >
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden>
              <path d="M1 12L4.5 8.5M4.5 8.5L8.5 1L12 4.5L4.5 8.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Tekenen
          </button>
          <button
            className={`p2d__tool ${mode === "select" ? "p2d__tool--active" : ""}`}
            onClick={() => { setMode("select"); setPendingId(null); }}
            title="Selecteren (klik of slepen)"
          >
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden>
              <path d="M2 2L5.5 11L7 7L11 5.5L2 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Selecteren
          </button>
        </div>

        <div className="p2d__actions">
          <button
            className={`p2d__tool ${snapOn ? "p2d__tool--snap-on" : ""}`}
            onClick={() => setSnapOn(s => !s)}
            title={snapOn ? "Snap uitschakelen" : "Snap inschakelen (25 cm raster)"}
          >
            {snapOn ? "◉ 25 cm" : "○ vrij"}
          </button>

          {mode === "draw" && pendingId && (
            <button className="p2d__tool" onClick={() => setPendingId(null)} title="Lijn beëindigen (Esc)">
              ↵ Beëindigen
            </button>
          )}

          <button
            className="p2d__tool"
            onClick={() => undo?.()}
            disabled={!canUndo}
            title="Vorige stap ongedaan maken (Ctrl+Z)"
          >
            Ongedaan maken
          </button>

          {selected && (
            <button
              className="p2d__tool p2d__tool--danger"
              onClick={() => {
                if (selected.type === "segment") deleteSegment(selected.id);
                else deleteVertex(selected.id);
                setSelected(null);
              }}
            >
              ✕ Verwijder
            </button>
          )}

          {canEditRounding && selectedVertex && (
            <button
              className="p2d__tool"
              onClick={() => setVertexRounding(selectedVertex.id, selectedVertex.roundingRadius > 0 ? 0 : 25)}
            >
              {selectedVertex.roundingRadius > 0 ? "Afronding uit" : "Afronding 25 cm"}
            </button>
          )}

          <button
            className="p2d__tool"
            onClick={() => { clear(); setPendingId(null); setSelected(null); }}
          >
            Leegmaken
          </button>
        </div>

        <div className="p2d__length">
          <span className="p2d__length-val">{Math.round(totalLength)} cm</span>
          <span className="p2d__length-lbl">totaal</span>
        </div>
      </div>

      {/* ── Canvas ── */}
      <div className="p2d__canvas-wrap" style={{ cursor }}>
        <canvas
          ref={canvasRef}
          className="p2d__canvas"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onClick={handleClick}
          onDoubleClick={handleDblClick}
          onMouseLeave={handleMouseLeave}
        />

        {/* ── Inline length editor ── */}
        {editPos && editLength && (
          <div
            className="p2d__len-editor"
            style={{ left: editPos.cx, top: editPos.cy }}
          >
            <input
              className="p2d__len-input"
              type="number"
              value={editLength.value}
              min={10}
              max={2000}
              step={1}
              onChange={e => setEditLength(prev => ({ ...prev, value: e.target.value }))}
              onKeyDown={e => {
                // Allow Backspace to edit text only — never propagate to canvas
                e.stopPropagation();
                if (e.key === "Enter") {
                  const v = parseFloat(editLength.value);
                  if (!isNaN(v) && v >= 10) changeSegmentLength(editLength.segId, v);
                  setEditLength(null);
                } else if (e.key === "Escape") {
                  setEditLength(null);
                }
              }}
              onBlur={() => setEditLength(null)}
              autoFocus
            />
            <span className="p2d__len-unit">cm</span>
          </div>
        )}

        {/* ── Corner rounding handle ── */}
        {canEditRounding && selectedVertex && cornerHandlePos && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setVertexRounding(selectedVertex.id, selectedVertex.roundingRadius > 0 ? 0 : 25);
            }}
            title="Hoekafronding schakelen"
            style={{
              position: "absolute",
              left: cornerHandlePos.left,
              top: cornerHandlePos.top,
              width: 32,
              height: 32,
              borderRadius: 999,
              border: "1px solid rgba(0,0,0,0.12)",
              background: "rgba(255,255,255,0.96)",
              color: "#8B6325",
              boxShadow: "0 8px 18px rgba(0,0,0,0.12)",
              fontSize: 18,
              fontWeight: 700,
              display: "grid",
              placeItems: "center",
              cursor: "pointer",
            }}
          >
            R
          </button>
        )}

        {/* ── Corner rounding slider panel ── */}
        {canEditRounding && selectedVertex && (
          <div
            style={{
              position: "absolute",
              right: 16,
              bottom: 16,
              width: 220,
              padding: "12px 14px",
              borderRadius: 14,
              background: "rgba(255,255,255,0.94)",
              border: "1px solid rgba(0,0,0,0.08)",
              boxShadow: "0 12px 30px rgba(0,0,0,0.08)",
            }}
          >
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.04em", textTransform: "uppercase", color: "#7b6b56", marginBottom: 8 }}>
              Hoekafronding
            </div>
            <div style={{ fontSize: 20, fontWeight: 700, color: "#1A1A1A", marginBottom: 10 }}>
              {Math.round(selectedVertex.roundingRadius ?? 0)} cm
            </div>
            <input
              type="range"
              min={0}
              max={150}
              step={5}
              value={selectedVertex.roundingRadius ?? 0}
              onChange={(e) => setVertexRounding(selectedVertex.id, Number(e.target.value))}
              style={{ width: "100%" }}
            />
          </div>
        )}

        {/* ── Stair segment panel (select mode, segment selected) ── */}
        {mode === "select" && selectedSegment && changeSegmentRise && (
          <div className="p2d__stair-panel">
            <div className="p2d__stair-panel-label">Trapsegment</div>
            <label className="p2d__stair-row">
              <span>Hoogteverschil (cm)</span>
              <input
                type="number"
                className="p2d__stair-input"
                min={0}
                max={600}
                step={5}
                value={selectedSegment.rise ?? 0}
                onChange={e => {
                  const v = parseFloat(e.target.value);
                  changeSegmentRise(selectedSegment.id, isNaN(v) ? 0 : Math.max(0, v));
                }}
              />
            </label>
            {(selectedSegment.rise ?? 0) > 0 && (
              <div className="p2d__stair-hint">
                Helling: {Math.round(
                  Math.atan2(selectedSegment.rise, selectedSegment.length) * (180 / Math.PI)
                )}°
                &nbsp;·&nbsp;
                3D lengte: {Math.round(Math.hypot(selectedSegment.length, selectedSegment.rise))} cm
              </div>
            )}
            {(selectedSegment.rise ?? 0) > 0 && (
              <button
                className="p2d__stair-reset"
                onClick={() => changeSegmentRise(selectedSegment.id, 0)}
              >
                Trap verwijderen
              </button>
            )}
          </div>
        )}
      </div>

      {/* ── Status bar ── */}
      <div className="p2d__status">
        {mode === "draw" ? (
          pendingId
            ? "Klik om volgend punt te plaatsen — Esc of dubbelklik om lijn te beëindigen"
            : "Klik op het canvas om het eerste punt te plaatsen"
        ) : (
          selected
            ? `${selected.type === "segment" ? "Segment" : "Punt"} geselecteerd — Delete om te verwijderen${selected.type === "segment" ? " — dubbelklik om lengte te bewerken" : ""}`
            : "Klik om te selecteren — sleep een punt om te verplaatsen"
        )}
      </div>
    </div>
  );
}

export default Planner2D;
