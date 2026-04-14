import { useState, useCallback, useMemo } from "react";
import {
  createGeometry,
  makeId,
  addVertexWithId,
  addSegment,
  updateVertex,
  setVertexRounding,
  setSegmentRise,
  removeSegment,
  removeVertex,
  setSegmentLength,
  clearGeometry,
  geometryFromPoints,
  getAllSegments,
  getTotalLength,
  getBoundingBox,
} from "../lib/geometry";

/**
 * React state wrapper around the pure geometry engine.
 *
 * All geometry mutations flow through one history-aware commit function,
 * so undo stays consistent for drawing, moving, resizing and rounding.
 */
export function useGeometry() {
  const [history, setHistory] = useState(() => ({
    past: [],
    present: createGeometry(),
    lastAction: null,
  }));

  const geo = history.present;

  const commitGeometry = useCallback((updater, meta = null) => {
    setHistory((current) => {
      const nextGeo = typeof updater === "function" ? updater(current.present) : updater;
      if (nextGeo === current.present) return current;

      const mergeMove =
        meta?.type === "move-vertex" &&
        current.lastAction?.type === "move-vertex" &&
        current.lastAction.vertexId === meta.vertexId;

      if (mergeMove) {
        return {
          past: current.past,
          present: nextGeo,
          lastAction: meta,
        };
      }

      return {
        past: [...current.past, current.present],
        present: nextGeo,
        lastAction: meta,
      };
    });
  }, []);

  const segments = useMemo(() => getAllSegments(geo), [geo]);
  const totalLength = useMemo(() => getTotalLength(geo), [geo]);
  const boundingBox = useMemo(() => getBoundingBox(geo), [geo]);
  const vertices = useMemo(() => Object.values(geo.vertices), [geo]);

  const moveVertex = useCallback((id, x, y) => {
    commitGeometry((g) => updateVertex(g, id, x, y), { type: "move-vertex", vertexId: id });
  }, [commitGeometry]);

  const changeVertexRounding = useCallback((id, radiusCm) => {
    commitGeometry((g) => setVertexRounding(g, id, radiusCm));
  }, [commitGeometry]);

  const placeVertex = useCallback((x, y, connectToId = null) => {
    const id = makeId();
    commitGeometry((g) => {
      const withVertex = addVertexWithId(g, id, x, y);
      return connectToId ? addSegment(withVertex, connectToId, id) : withVertex;
    });
    return id;
  }, [commitGeometry]);

  const connectVertices = useCallback((startId, endId) => {
    commitGeometry((g) => addSegment(g, startId, endId));
  }, [commitGeometry]);

  const deleteSegment = useCallback((id) => {
    commitGeometry((g) => removeSegment(g, id));
  }, [commitGeometry]);

  const deleteVertex = useCallback((id) => {
    commitGeometry((g) => removeVertex(g, id));
  }, [commitGeometry]);

  const changeSegmentLength = useCallback((segId, lengthCm) => {
    commitGeometry((g) => setSegmentLength(g, segId, lengthCm));
  }, [commitGeometry]);

  /** Set the vertical rise of a stair segment (in cm). 0 = flat horizontal. */
  const changeSegmentRise = useCallback((segId, riseCm) => {
    commitGeometry((g) => setSegmentRise(g, segId, riseCm));
  }, [commitGeometry]);

  const clear = useCallback(() => {
    commitGeometry(clearGeometry());
  }, [commitGeometry]);

  const resetToLength = useCallback((lengthCm) => {
    const clamped = Math.max(50, Math.min(2000, lengthCm));
    commitGeometry(() => {
      const fresh = clearGeometry();
      const firstSegmentId = Object.keys(fresh.segments)[0];
      return setSegmentLength(fresh, firstSegmentId, clamped);
    });
  }, [commitGeometry]);

  const loadPreset = useCallback((points) => {
    commitGeometry(geometryFromPoints(points));
  }, [commitGeometry]);

  const undo = useCallback(() => {
    setHistory((current) => {
      if (current.past.length === 0) return current;

      return {
        past: current.past.slice(0, -1),
        present: current.past[current.past.length - 1],
        lastAction: null,
      };
    });
  }, []);

  const sealHistory = useCallback(() => {
    setHistory((current) => (
      current.lastAction == null
        ? current
        : { ...current, lastAction: null }
    ));
  }, []);

  return {
    geo,
    vertices,
    segments,
    totalLength,
    boundingBox,
    moveVertex,
    changeVertexRounding,
    placeVertex,
    connectVertices,
    deleteSegment,
    deleteVertex,
    changeSegmentLength,
    changeSegmentRise,
    clear,
    undo,
    sealHistory,
    canUndo: history.past.length > 0,
    resetToLength,
    loadPreset,
  };
}
