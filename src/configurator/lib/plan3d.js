/**
 * Canonical 2D plan → 3D world mapping.
 *
 * Source of truth:
 * - Plan coordinates are stored in centimetres.
 * - Plan X grows to the right.
 * - Plan Y grows upward.
 *
 * Chosen 3D mapping:
 * - World X grows to the right.
 * - World Y is vertical (height).
 * - World Z grows toward the camera, so plan-up maps away from camera.
 * - Therefore: (x, y) -> (x/100, 0, -y/100)
 *
 * IMPORTANT: The plan→world mapping negates the Z axis (plan Y → world -Z).
 * This reversal flips the winding order of arcs. Any code that renders arcs
 * in 3D must account for this by inverting the arc direction.
 * See: RoundedCornerConnector in Scene3D.jsx
 *
 * This module is the ONLY place that may define how plan directions become
 * world-space directions and yaw/pitch rotations.
 */

export const PLAN_TO_WORLD_Z_SIGN = -1;
export const CM_TO_WORLD_UNITS = 1 / 100;

/**
 * Height of the concrete platform in world units (metres).
 * All railing elements sit on top of this platform (y = 0 world = top face).
 * The concrete block extends from y = -PLATFORM_HEIGHT to y = 0.
 */
export const PLATFORM_HEIGHT = 0.30;

/** Convert one plan point (cm) into one world point (m) on the XZ plane. */
export function planPointToWorld(point) {
  return {
    x: point.x * CM_TO_WORLD_UNITS,
    y: 0,
    z: point.y * PLAN_TO_WORLD_Z_SIGN * CM_TO_WORLD_UNITS,
  };
}

/** Convert a plan-space direction vector (cm) into a world-space XZ vector (m). */
export function planVectorToWorld(dx, dy) {
  return {
    x: dx * CM_TO_WORLD_UNITS,
    z: dy * PLAN_TO_WORLD_Z_SIGN * CM_TO_WORLD_UNITS,
  };
}

/**
 * Convert a geometry segment into world transform data.
 *
 * For flat segments (rise = 0):
 *   pitch = 0, slopedLength = horizontal length
 *
 * For stair segments (rise != 0):
 *   pitch = elevation angle (radians, positive = going up)
 *   slopedLength = actual 3D length of the segment
 *   center.y = rise / 2 (vertical midpoint)
 *
 * The local rail mesh runs along +X. To align it in world space:
 *   1. rotate by yaw around world Y   (horizontal orientation)
 *   2. rotate by pitch around local Z (elevation tilt)
 */
export function segmentToWorldTransform(segment) {
  const start = planPointToWorld(segment.start);
  const end   = planPointToWorld(segment.end);

  const rise = (segment.rise || 0) / 100; // cm → metres

  const worldDx = end.x - start.x;
  const worldDz = end.z - start.z;
  const horizontalDist = Math.hypot(worldDx, worldDz);

  const yaw   = Math.atan2(-worldDz, worldDx);
  const pitch = Math.atan2(rise, horizontalDist); // 0 for flat segments

  const endWithRise = { ...end, y: rise };

  return {
    start,
    end: endWithRise,
    center: {
      x: (start.x + end.x) / 2,
      y: rise / 2,
      z: (start.z + end.z) / 2,
    },
    worldDx,
    worldDz,
    yaw,
    pitch,
    slopedLength: Math.hypot(horizontalDist, rise),
    isSloped: Math.abs(rise) > 0.01,
  };
}

/** Convert the plan bbox center into world-space center coordinates. */
export function bboxCenterToWorld(bbox) {
  return planPointToWorld({
    x: (bbox.minX + bbox.maxX) / 2,
    y: (bbox.minY + bbox.maxY) / 2,
  });
}
