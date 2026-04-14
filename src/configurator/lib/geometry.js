/**
 * Pure geometry engine — single source of truth for the balustrade plan.
 *
 * All positions are in centimetres (cm).
 * Data shape:
 *   {
 *     vertices: { [id]: { id, x, y } },
 *     segments: { [id]: { id, startId, endId, rise } }
 *   }
 *
 * `rise` on a segment is the vertical height difference from start to end (cm).
 * rise = 0  → flat horizontal segment
 * rise > 0  → stair going up
 * rise < 0  → stair going down
 *
 * All mutation functions are pure: they accept the current geometry and
 * return a NEW geometry object. Nothing is mutated in place.
 */

export function makeId() {
  return Math.random().toString(36).slice(2, 9);
}

/** Create a new geometry with one default straight segment of 240 cm. */
export function createGeometry() {
  const vA  = { id: makeId(), x: 0,   y: 0, roundingRadius: 0 };
  const vB  = { id: makeId(), x: 240, y: 0, roundingRadius: 0 };
  const seg = { id: makeId(), startId: vA.id, endId: vB.id, rise: 0 };
  return {
    vertices: { [vA.id]: vA, [vB.id]: vB },
    segments: { [seg.id]: seg },
  };
}

/** Get full data for one segment including computed length and angle (radians). */
export function getSegmentData(geo, segId) {
  const seg = geo.segments[segId];
  if (!seg) return null;
  const start = geo.vertices[seg.startId];
  const end   = geo.vertices[seg.endId];
  if (!start || !end) return null;
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  return {
    ...seg,
    start,
    end,
    length: Math.hypot(dx, dy),
    angle:  Math.atan2(dy, dx),
    rise:   seg.rise ?? 0,
  };
}

/** Return all segments with computed data, skipping degenerate ones. */
export function getAllSegments(geo) {
  return Object.keys(geo.segments)
    .map(id => getSegmentData(geo, id))
    .filter(s => s && s.length > 0.01);
}

/** Sum of all segment lengths in cm. */
export function getTotalLength(geo) {
  const straight = getAllRenderedSegments(geo).reduce((sum, s) => sum + s.length, 0);
  const arcs = getRoundedCorners(geo).reduce((sum, c) => sum + c.arcLength, 0);
  return straight + arcs;
}

/**
 * Axis-aligned bounding box of all vertices.
 * Returns a sensible default when the geometry is empty.
 */
export function getBoundingBox(geo) {
  const verts = Object.values(geo.vertices);
  if (verts.length === 0) {
    return { minX: 0, maxX: 240, minY: -40, maxY: 40, width: 240, height: 80 };
  }
  const xs = verts.map(v => v.x);
  const ys = verts.map(v => v.y);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  return { minX, maxX, minY, maxY, width: maxX - minX, height: maxY - minY };
}

/** Move a vertex to a new position. Returns new geometry. */
export function updateVertex(geo, id, x, y) {
  const v = geo.vertices[id];
  if (!v) return geo;
  return { ...geo, vertices: { ...geo.vertices, [id]: { ...v, x, y } } };
}

export function setVertexRounding(geo, id, radiusCm) {
  const v = geo.vertices[id];
  if (!v) return geo;
  return {
    ...geo,
    vertices: {
      ...geo.vertices,
      [id]: { ...v, roundingRadius: Math.max(0, radiusCm || 0) },
    },
  };
}

/**
 * Add a new vertex. Returns new geometry.
 * The new vertex's ID is passed in so the caller can reference it synchronously.
 */
export function addVertexWithId(geo, id, x, y) {
  return { ...geo, vertices: { ...geo.vertices, [id]: { id, x, y, roundingRadius: 0 } } };
}

/** Add a segment between two existing vertex IDs. Returns new geometry. */
export function addSegment(geo, startId, endId, rise = 0) {
  const id = makeId();
  return { ...geo, segments: { ...geo.segments, [id]: { id, startId, endId, rise: rise || 0 } } };
}

/** Set the vertical rise of a segment (for stair railings). rise is in cm. */
export function setSegmentRise(geo, segId, rise) {
  const seg = geo.segments[segId];
  if (!seg) return geo;
  return {
    ...geo,
    segments: {
      ...geo.segments,
      [segId]: { ...seg, rise: rise || 0 },
    },
  };
}

/** Remove a segment and any resulting orphaned vertices. Returns new geometry. */
export function removeSegment(geo, id) {
  const { [id]: _removed, ...segments } = geo.segments;
  return _pruneOrphans({ ...geo, segments });
}

/** Remove a vertex and all connected segments. Returns new geometry. */
export function removeVertex(geo, id) {
  const segments = {};
  Object.values(geo.segments).forEach(s => {
    if (s.startId !== id && s.endId !== id) segments[s.id] = s;
  });
  const { [id]: _v, ...vertices } = geo.vertices;
  return _pruneOrphans({ vertices, segments });
}

/**
 * Adjust the end vertex of a segment to achieve exactly newLengthCm.
 * The start vertex stays fixed; the end vertex moves along the same direction.
 */
export function setSegmentLength(geo, segId, newLengthCm) {
  const seg = getSegmentData(geo, segId);
  if (!seg || seg.length < 0.01) return geo;
  const ratio = newLengthCm / seg.length;
  const newX  = seg.start.x + (seg.end.x - seg.start.x) * ratio;
  const newY  = seg.start.y + (seg.end.y - seg.start.y) * ratio;
  return updateVertex(geo, seg.endId, newX, newY);
}

/** Reset geometry to the default (one 240 cm straight segment). */
export function clearGeometry() {
  return createGeometry();
}

/**
 * Build a geometry from an ordered list of {x, y} plan-coordinates (cm).
 * Creates one vertex per point and one segment between each consecutive pair.
 * Minimum 2 points required; returns default geometry otherwise.
 */
export function geometryFromPoints(points) {
  if (!points || points.length < 2) return createGeometry();
  const vertices = {};
  const segments = {};
  const ids = points.map(() => makeId());

  points.forEach((p, i) => {
    vertices[ids[i]] = { id: ids[i], x: p.x, y: p.y, roundingRadius: 0 };
  });

  for (let i = 0; i < points.length - 1; i++) {
    const segId = makeId();
    segments[segId] = { id: segId, startId: ids[i], endId: ids[i + 1], rise: 0 };
  }

  return { vertices, segments };
}

export function getVertexDegree(geo, vertexId) {
  let degree = 0;
  Object.values(geo.segments).forEach((seg) => {
    if (seg.startId === vertexId || seg.endId === vertexId) degree += 1;
  });
  return degree;
}

function getVertexNeighbors(geo, vertexId) {
  const neighbors = [];
  Object.values(geo.segments).forEach((seg) => {
    if (seg.startId === vertexId && geo.vertices[seg.endId]) neighbors.push(geo.vertices[seg.endId]);
    if (seg.endId === vertexId && geo.vertices[seg.startId]) neighbors.push(geo.vertices[seg.startId]);
  });
  return neighbors;
}

function normalizeVector(x, y) {
  const length = Math.hypot(x, y);
  if (length < 1e-6) return null;
  return { x: x / length, y: y / length, length };
}

export function getRoundedCornerData(geo, vertexId) {
  const vertex = geo.vertices[vertexId];
  if (!vertex || (vertex.roundingRadius ?? 0) <= 0) return null;

  const neighbors = getVertexNeighbors(geo, vertexId);
  if (neighbors.length !== 2) return null;

  const vecA = normalizeVector(neighbors[0].x - vertex.x, neighbors[0].y - vertex.y);
  const vecB = normalizeVector(neighbors[1].x - vertex.x, neighbors[1].y - vertex.y);
  if (!vecA || !vecB) return null;

  const dot = Math.max(-1, Math.min(1, vecA.x * vecB.x + vecA.y * vecB.y));
  const cornerAngle = Math.acos(dot);
  if (cornerAngle < 0.15 || cornerAngle >= Math.PI - 0.05) return null;

  const requestedRadius = vertex.roundingRadius ?? 0;
  const requestedTrim = requestedRadius / Math.tan(cornerAngle / 2);
  if (!Number.isFinite(requestedTrim) || requestedTrim <= 0) return null;

  const maxTrim = Math.min(vecA.length, vecB.length) * 0.45;
  const trim = Math.min(requestedTrim, maxTrim);
  if (trim <= 0.01) return null;

  const radius = trim * Math.tan(cornerAngle / 2);
  const bisector = normalizeVector(vecA.x + vecB.x, vecA.y + vecB.y);
  if (!bisector) return null;

  const centerDistance = radius / Math.sin(cornerAngle / 2);
  const tangentA = { x: vertex.x + vecA.x * trim, y: vertex.y + vecA.y * trim };
  const tangentB = { x: vertex.x + vecB.x * trim, y: vertex.y + vecB.y * trim };
  const center = { x: vertex.x + bisector.x * centerDistance, y: vertex.y + bisector.y * centerDistance };
  const cross = vecA.x * vecB.y - vecA.y * vecB.x;

  return {
    vertexId,
    vertex,
    radius,
    trim,
    center,
    tangentByNeighbor: {
      [neighbors[0].id]: tangentA,
      [neighbors[1].id]: tangentB,
    },
    startAngle: Math.atan2(tangentA.y - center.y, tangentA.x - center.x),
    endAngle: Math.atan2(tangentB.y - center.y, tangentB.x - center.x),
    direction: cross >= 0 ? 1 : -1,
    arcAngle: Math.PI - cornerAngle,
    arcLength: radius * (Math.PI - cornerAngle),
  };
}

export function getRoundedCorners(geo) {
  return Object.keys(geo.vertices)
    .map((vertexId) => getRoundedCornerData(geo, vertexId))
    .filter(Boolean);
}

export function sampleRoundedCorner(corner, steps = 12) {
  if (!corner) return [];

  let start = corner.startAngle;
  let end = corner.endAngle;

  if (corner.direction > 0 && end < start) end += Math.PI * 2;
  if (corner.direction < 0 && end > start) end -= Math.PI * 2;

  return Array.from({ length: steps + 1 }, (_, index) => {
    const t = index / steps;
    const angle = start + (end - start) * t;
    return {
      x: corner.center.x + Math.cos(angle) * corner.radius,
      y: corner.center.y + Math.sin(angle) * corner.radius,
    };
  });
}

function getRoundedCornerMap(geo) {
  const map = new Map();
  getRoundedCorners(geo).forEach((corner) => {
    map.set(corner.vertexId, corner);
  });
  return map;
}

export function getRenderedSegmentData(geo, segId) {
  const seg = geo.segments[segId];
  const raw = getSegmentData(geo, segId);
  if (!seg || !raw) return null;

  const corners = getRoundedCornerMap(geo);
  const start = corners.get(seg.startId)?.tangentByNeighbor[seg.endId] ?? raw.start;
  const end = corners.get(seg.endId)?.tangentByNeighbor[seg.startId] ?? raw.end;
  const dx = end.x - start.x;
  const dy = end.y - start.y;

  return {
    ...raw,
    start,
    end,
    length: Math.hypot(dx, dy),
    angle: Math.atan2(dy, dx),
  };
}

export function getAllRenderedSegments(geo) {
  return Object.keys(geo.segments)
    .map((id) => getRenderedSegmentData(geo, id))
    .filter((s) => s && s.length > 0.01);
}

// ─── Private helpers ────────────────────────────────────────────────────────

function _pruneOrphans(geo) {
  const used = new Set();
  Object.values(geo.segments).forEach(s => {
    used.add(s.startId);
    used.add(s.endId);
  });
  const vertices = {};
  Object.values(geo.vertices).forEach(v => {
    if (used.has(v.id)) vertices[v.id] = v;
  });
  return { ...geo, vertices };
}
