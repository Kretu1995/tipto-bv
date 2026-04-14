import { useRef, useEffect, useMemo, Suspense } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera, Environment, Grid, Html, Line, ContactShadows } from "@react-three/drei";
import { getAllRenderedSegments, getBoundingBox, getRoundedCorners, sampleRoundedCorner } from "../lib/geometry";
import {
  bboxCenterToWorld,
  planPointToWorld,
  segmentToWorldTransform,
  PLATFORM_HEIGHT,
} from "../lib/plan3d";

// ─── Camera fitting ───────────────────────────────────────────────────────────

const QUALITY_PRESETS = {
  lightweight: {
    dpr: [1, 1.25],
    shadowMap: 1024,
    envResolution: 128,
    gridFade: 8,
    contactBlur: 1.4,
    lineOpacity: 0.9,
  },
  balanced: {
    dpr: [1, 1.6],
    shadowMap: 1536,
    envResolution: 256,
    gridFade: 10,
    contactBlur: 1.8,
    lineOpacity: 0.94,
  },
  high: {
    dpr: [1.2, 2],
    shadowMap: 2048,
    envResolution: 512,
    gridFade: 12,
    contactBlur: 2.2,
    lineOpacity: 0.98,
  },
};

function getCameraSetup(bbox) {
  const center = bboxCenterToWorld(bbox);
  const diag = Math.max(Math.hypot(bbox.width, bbox.height) / 100, 1.6);
  const dist = diag * 1.48 + 2.95;
  return {
    position: [center.x + dist * 0.78, dist * 0.62 + PLATFORM_HEIGHT, center.z + dist * 0.58],
    target:   [center.x, 0.64, center.z - Math.min(bbox.height / 260, 0.16)],
  };
}

function CameraFitter({ bbox }) {
  const { camera } = useThree();
  const ctrlRef    = useRef(null);

  useEffect(() => {
    const { position, target } = getCameraSetup(bbox);
    camera.position.set(...position);
    if (ctrlRef.current) {
      ctrlRef.current.target.set(...target);
      ctrlRef.current.update();
    }
  }, [bbox.minX, bbox.maxX, bbox.minY, bbox.maxY]); // eslint-disable-line

  return (
    <OrbitControls
      ref={ctrlRef}
      makeDefault
      enablePan={false}
      enableDamping
      dampingFactor={0.08}
      maxPolarAngle={Math.PI / 2.06}
      minPolarAngle={Math.PI / 5.6}
      minDistance={1.7}
      maxDistance={18}
    />
  );
}

// ─── Material helpers ─────────────────────────────────────────────────────────

function frameMat(finishColor, material) {
  const isRvs = material === "rvs";
  return {
    color: finishColor,
    metalness: isRvs ? 0.96 : 0.82,
    roughness: isRvs ? 0.16 : 0.27,
    clearcoat: isRvs ? 0.78 : 0.42,
    clearcoatRoughness: isRvs ? 0.1 : 0.22,
    envMapIntensity: isRvs ? 1.25 : 0.95,
  };
}

// ─── Infill components ────────────────────────────────────────────────────────

function GlassInfill({ railLength, panelH, postXs, finishColor, postW }) {
  return (
    <group>
      <mesh position={[0, panelH / 2 + 0.02, 0]}>
        <boxGeometry args={[railLength - 0.08, panelH, 0.012]} />
        <meshPhysicalMaterial color="#dce9f2" transmission={0.94} roughness={0.035} metalness={0} ior={1.5} thickness={0.03} envMapIntensity={1.1} transparent opacity={0.76} attenuationDistance={1.8} attenuationColor="#f5fbff" />
      </mesh>
      {postXs.map((x, i) => (
        <group key={i} position={[x, panelH * 0.25, 0]}>
          {[0.018, -0.018].map((z, j) => (
            <mesh key={j} position={[0, 0, z]} castShadow>
              <boxGeometry args={[postW * 1.08, 0.048, 0.018]} />
              <meshPhysicalMaterial color={finishColor} metalness={0.82} roughness={0.24} clearcoat={0.4} />
            </mesh>
          ))}
          {[0.018, -0.018].map((z, j) => (
            <mesh key={`u${j}`} position={[0, panelH * 0.35, z]} castShadow>
              <boxGeometry args={[postW * 1.08, 0.048, 0.018]} />
              <meshPhysicalMaterial color={finishColor} metalness={0.82} roughness={0.24} clearcoat={0.4} />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  );
}

function FramelessGlass({ railLength, panelH }) {
  return (
    <group>
      <mesh position={[0, panelH / 2 + 0.04, 0]}>
        <boxGeometry args={[railLength - 0.04, panelH, 0.012]} />
        <meshPhysicalMaterial color="#dce9f2" transmission={0.97} roughness={0.028} metalness={0} ior={1.5} thickness={0.032} envMapIntensity={1.18} transparent opacity={0.74} attenuationDistance={1.9} attenuationColor="#f6fbff" />
      </mesh>
    </group>
  );
}

function VerticalSpijlen({ railLength, panelH, finishColor, material }) {
  const mp      = frameMat(finishColor, material);
  const count   = Math.max(4, Math.round(railLength * 4.8));
  const spacing = railLength / (count + 1);

  return (
    <group>
      {/* Bottom rail / neut */}
      <mesh position={[0, 0.06, 0]} castShadow receiveShadow>
        <boxGeometry args={[railLength, 0.035, 0.025]} />
        <meshPhysicalMaterial {...mp} />
      </mesh>
      {Array.from({ length: count }, (_, i) => (
        <mesh key={i} position={[-railLength / 2 + spacing * (i + 1), panelH / 2 + 0.06, 0]} castShadow>
          <boxGeometry args={[0.016, panelH, 0.012]} />
          <meshPhysicalMaterial {...mp} />
        </mesh>
      ))}
    </group>
  );
}

/**
 * HorizontaleProfielen — flat rectangular horizontal bars.
 * Inspired by Tipto projects with flat bar infill.
 */
function HorizontaleProfielen({ railLength, panelH, finishColor, material }) {
  const mp     = frameMat(finishColor, material);
  const rows   = panelH > 0.7 ? 4 : 3;
  const vertGap = panelH / (rows + 1);

  return (
    <group>
      {Array.from({ length: rows }, (_, i) => (
        <mesh key={i} position={[0, vertGap * (i + 1), 0]} castShadow>
          <boxGeometry args={[railLength - 0.10, 0.018, 0.016]} />
          <meshPhysicalMaterial {...mp} />
        </mesh>
      ))}
    </group>
  );
}

/**
 * HorizontaleStaven — round/cylindrical horizontal bars.
 * Based on real Tipto projects: 3–5 round stainless or rectangular powder-coated
 * bars evenly spaced between posts. Common in both indoor stair railings and
 * outdoor balustrades photographed in the Tipto portfolio.
 *
 * Key visual characteristics from photos:
 *   • Round posts (RVS) or rectangular posts (steel/aluminium)
 *   • 3–5 horizontal cylindrical bars (RVS) or rectangular bars (others)
 *   • Even vertical spacing between 10 cm from bottom and 10 cm from top rail
 *   • Post mounting: round rosette-style connectors for RVS, welded for steel
 */
function HorizontaleStaven({ railLength, panelH, finishColor, material }) {
  const isRvs = material === "rvs";
  const mp = frameMat(finishColor, material);
  const barCount = panelH > 0.75 ? 4 : 3;
  const barRadius = isRvs ? 0.011 : 0; // 0 = use box geometry for non-RVS
  const barH = isRvs ? 0 : 0.016; // box height for non-RVS

  const bottomY = 0.10;
  const topY = panelH - 0.08;
  const gap = (topY - bottomY) / (barCount - 1);

  return (
    <group>
      {Array.from({ length: barCount }, (_, i) => {
        const y = bottomY + gap * i;
        return isRvs ? (
          /* Round bar (cylinder rotated along X axis) */
          <mesh key={i} position={[0, y, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
            <cylinderGeometry args={[barRadius, barRadius, railLength - 0.06, 14]} />
            <meshPhysicalMaterial {...mp} />
          </mesh>
        ) : (
          /* Flat rectangular bar */
          <mesh key={i} position={[0, y, 0]} castShadow>
            <boxGeometry args={[railLength - 0.06, 0.018, 0.014]} />
            <meshPhysicalMaterial {...mp} />
          </mesh>
        );
      })}
      {/* Mounting rosettes on post positions for RVS */}
      {isRvs && Array.from({ length: barCount }, (_, bi) => {
        const y = bottomY + gap * bi;
        return [-(railLength / 2 - 0.04), (railLength / 2 - 0.04)].map((x, j) => (
          <mesh key={`${bi}-${j}`} position={[x, y, 0]} castShadow>
            <cylinderGeometry args={[0.018, 0.018, 0.012, 12]} />
            <meshPhysicalMaterial color={finishColor} metalness={0.96} roughness={0.14} clearcoat={0.82} />
          </mesh>
        ));
      })}
    </group>
  );
}

function Lamellen({ railLength, panelH, finishColor, material }) {
  const mp      = frameMat(finishColor, material);
  const count   = Math.max(4, Math.round(railLength * 2.8));
  const spacing = railLength / (count + 1);

  return (
    <group>
      {Array.from({ length: count }, (_, i) => (
        <mesh key={i} position={[-railLength / 2 + spacing * (i + 1), panelH / 2, 0]} castShadow>
          <boxGeometry args={[0.048, panelH - 0.02, 0.010]} />
          <meshPhysicalMaterial {...mp} />
        </mesh>
      ))}
    </group>
  );
}

function DiagonalBar({ from, to, color, barW = 0.014, barD = 0.010 }) {
  const dx = to[0] - from[0];
  const dy = to[1] - from[1];
  const length = Math.hypot(dx, dy);

  if (length < 0.08) return null;

  return (
    <mesh
      position={[(from[0] + to[0]) / 2, (from[1] + to[1]) / 2, 0]}
      rotation={[0, 0, Math.atan2(dy, dx) - Math.PI / 2]}
      castShadow
    >
      <boxGeometry args={[barW, length, barD]} />
      <meshStandardMaterial color={color} metalness={0.78} roughness={0.32} />
    </mesh>
  );
}

function DesignFill({ railLength, panelH, finishColor }) {
  const bayCount = Math.max(1, Math.min(4, Math.round(railLength / 0.8)));
  const bayWidth = railLength / bayCount;
  const bottomY = 0.018;
  const topY = Math.max(bottomY + 0.18, panelH - 0.018);
  const showCross = bayWidth >= 1.2;

  return (
    <group>
      {Array.from({ length: bayCount }, (_, i) => {
        const leftX = -railLength / 2 + bayWidth * i + 0.02;
        const rightX = -railLength / 2 + bayWidth * (i + 1) - 0.02;
        return (
          <group key={i}>
            <DiagonalBar from={[leftX, bottomY]} to={[rightX, topY]} color={finishColor} />
            {showCross && (
              <DiagonalBar from={[leftX, topY]} to={[rightX, bottomY]} color={finishColor} />
            )}
          </group>
        );
      })}
    </group>
  );
}

// ─── Post + base ──────────────────────────────────────────────────────────────

function Post({ isRvs, finishColor, postH, postW, postD }) {
  const mp = {
    color: finishColor,
    metalness: isRvs ? 0.96 : 0.84,
    roughness: isRvs ? 0.14 : 0.24,
    clearcoat: isRvs ? 0.88 : 0.42,
    clearcoatRoughness: isRvs ? 0.08 : 0.2,
  };
  return (
    <group>
      <mesh castShadow receiveShadow>
        {isRvs
          ? <cylinderGeometry args={[postW / 2, postW / 2, postH, 16]} />
          : <boxGeometry args={[postW, postH, postD]} />}
        <meshPhysicalMaterial {...mp} />
      </mesh>
      {/* Spherical cap on RVS round post (bolkop) */}
      {isRvs && (
        <mesh position={[0, postH / 2 + postW * 0.5, 0]} castShadow>
          <sphereGeometry args={[postW * 0.62, 16, 16]} />
          <meshPhysicalMaterial {...mp} />
        </mesh>
      )}
      {/* Architect style: small cap detail on rectangular post */}
      {!isRvs && (
        <mesh position={[0, postH / 2 - 0.04, 0]} castShadow>
          <boxGeometry args={[postW * 1.18, 0.025, postD * 1.18]} />
          <meshPhysicalMaterial {...mp} />
        </mesh>
      )}
      {!isRvs && (
        <mesh position={[0, -postH / 2 + 0.1, 0]} castShadow>
          <boxGeometry args={[postW * 1.08, 0.018, postD * 1.08]} />
          <meshPhysicalMaterial color={finishColor} metalness={0.82} roughness={0.2} clearcoat={0.35} />
        </mesh>
      )}
    </group>
  );
}

/**
 * PostBase — mounting hardware at the base of each post.
 *
 * Vloer montage (floor):
 *   Horizontal base plate with anchor bolts, sits on top of the concrete platform.
 *
 * Zijmontage (side):
 *   Vertical mounting plate with anchor bolts, positioned on the outward face
 *   of the concrete platform — communicating that the post is bolted to the
 *   side edge of a floor slab or terrace.
 */
function PostBase({ mounting, finishColor, postW, postD, postH, isFreeEnd = true }) {
  const bracketMat = {
    color: "#505860",
    metalness: 0.86,
    roughness: 0.24,
    clearcoat: 0.42,
    clearcoatRoughness: 0.18,
  };
  const boltMat = {
    color: "#8d949b",
    metalness: 0.92,
    roughness: 0.18,
    clearcoat: 0.32,
  };
  if (mounting === "zijmontage") {
    // Plate at the BACK of the post (–Z side) so it sits on the slab outer face.
    // Group sits at slab mid-height: world y = –PLATFORM_HEIGHT/2.
    // Plate must protrude past the slab on ALL faces.
    // Slab extends 3 cm past posts on left/right (w = +0.06) and 1 cm on front.
    // 0.045 m ensures 1.5 cm protrusion on the widest (left/right) faces.
    const plateDepth = 0.01;
    const plateWidth = postW * 1.55;
    const plateHeight = PLATFORM_HEIGHT * 0.52;
    const armDepth = Math.max(0.022, postD * 0.7);
    const plateZ = postD / 2 + plateDepth / 2 - 0.003;
    const armZ = postD / 2 - armDepth / 2 + 0.002;
    const armY = PLATFORM_HEIGHT * 0.14;
    const boltZ  = plateZ - 0.001;
    return (
      <group position={[0, -postH / 2 - PLATFORM_HEIGHT / 2 + 0.055, 0]}>
        <mesh position={[0, armY, armZ]} castShadow>
          <boxGeometry args={[postW * 0.78, PLATFORM_HEIGHT * 0.22, armDepth]} />
          <meshPhysicalMaterial {...bracketMat} />
        </mesh>
        <mesh position={[0, -PLATFORM_HEIGHT * 0.03, plateZ]} castShadow>
          <boxGeometry args={[plateWidth, plateHeight, plateDepth]} />
          <meshPhysicalMaterial {...bracketMat} />
        </mesh>
        <mesh position={[0, PLATFORM_HEIGHT * 0.25, plateZ + 0.001]} castShadow>
          <boxGeometry args={[plateWidth * 0.74, 0.026, plateDepth * 1.8]} />
          <meshPhysicalMaterial {...bracketMat} />
        </mesh>
        {/* Anchor bolts going into the slab (–Z direction) */}
        {[[-plateWidth * 0.28, plateHeight * 0.26], [plateWidth * 0.28, plateHeight * 0.26],
          [-plateWidth * 0.28, -plateHeight * 0.18], [plateWidth * 0.28, -plateHeight * 0.18]].map(([bx, by], i) => (
          <mesh key={i} position={[bx, by, boltZ]} rotation={[Math.PI / 2, 0, 0]} castShadow>
            <cylinderGeometry args={[0.004, 0.004, 0.012, 12]} />
            <meshPhysicalMaterial {...boltMat} />
          </mesh>
        ))}
      </group>
    );
  }

  // Floor mount: horizontal plate + anchor bolts on top of concrete
  return (
    <group position={[0, -postH / 2 + 0.008, 0]}>
      <mesh castShadow>
        <boxGeometry args={[postW * 2.05, 0.014, postD * 2.05]} />
        <meshPhysicalMaterial color="#69717a" metalness={0.82} roughness={0.26} clearcoat={0.28} />
      </mesh>
      {[[-1,-1],[-1,1],[1,-1],[1,1]].map(([sx,sz],i) => (
        <mesh key={i} position={[sx*postW*0.64, 0.012, sz*postD*0.64]} castShadow>
          <cylinderGeometry args={[0.0048, 0.0048, 0.011, 8]} />
          <meshPhysicalMaterial {...boltMat} />
        </mesh>
      ))}
    </group>
  );
}

// ─── Single rail section (pre-transformed, centered at origin along X axis) ──

function RailSection({
  lengthM,
  heightM,
  selection,
  finishColor,
  showStartPost = true,
  showEndPost = true,
  startIsFreeEnd = true,
  endIsFreeEnd = true,
}) {
  const depthM      = Math.max(0.04, (selection.depth ?? 6) / 100);
  const isRvs       = selection.material === "rvs";
  const isAluGlas   = selection.infill === "glas" && selection.material === "aluminium";
  // Frameless = glass without posts (gepoedercoat + glas). RVS and aluminium get posts.
  const isFrameless = selection.infill === "glas" && !isRvs && !isAluGlas;

  const postW   = 0.046;
  const postD   = depthM * 0.72;
  const postH   = heightM;
  const railH   = 0.055;
  const railD   = depthM * 0.85;
  const panelH  = Math.max(0.42, heightM - railH - 0.05);
  const innerSpan = Math.max(0.12, lengthM - postW);

  const nPosts  = isFrameless ? 0 : Math.max(2, Math.min(8, Math.round(lengthM * 1.35)));
  const postGap = nPosts > 1 ? lengthM / (nPosts - 1) : 0;

  const posts = Array.from({ length: nPosts }, (_, i) => {
    const isStart = i === 0;
    const isEnd   = i === nPosts - 1;
    if (isStart && !showStartPost) return null;
    if (isEnd && !showEndPost) return null;
    return {
      x: -lengthM / 2 + postGap * i,
      isFreeEnd: (isStart && startIsFreeEnd) || (isEnd && endIsFreeEnd),
    };
  }).filter(Boolean);

  const postXs = posts.map(p => p.x);
  const mp = frameMat(finishColor, selection.material);

  return (
    <group>
      {/* Top handrail — hidden for aluminium + glas (posts visible, no top bar) */}
      {!isFrameless && !isAluGlas && (
        <mesh position={[0, heightM + railH / 2, 0]} castShadow receiveShadow>
          <boxGeometry args={[innerSpan, railH, railD]} />
          <meshPhysicalMaterial {...mp} />
        </mesh>
      )}

      {/* Posts with base hardware */}
      {posts.map((post, i) => (
        <group key={i} position={[post.x, postH / 2, 0]}>
          <Post
            isRvs={isRvs}
            finishColor={finishColor}
            postH={postH} postW={postW} postD={postD}
          />
          <PostBase
            mounting={selection.mounting}
            finishColor={finishColor}
            postW={postW} postD={postD} postH={postH}
            isFreeEnd={post.isFreeEnd}
          />
        </group>
      ))}

      {/* Infill panel */}
      {isFrameless ? (
        <FramelessGlass railLength={lengthM} panelH={panelH} />
      ) : selection.infill === "glas" ? (
        <GlassInfill railLength={innerSpan} panelH={panelH} postXs={postXs} finishColor={finishColor} postW={postW} />
      ) : selection.infill === "verticale-spijlen" ? (
        <VerticalSpijlen railLength={innerSpan} panelH={panelH} finishColor={finishColor} material={selection.material} />
      ) : selection.infill === "horizontale-profielen" ? (
        <HorizontaleProfielen railLength={innerSpan} panelH={panelH} finishColor={finishColor} material={selection.material} />
      ) : selection.infill === "horizontale-staven" ? (
        <HorizontaleStaven railLength={innerSpan} panelH={panelH} finishColor={finishColor} material={selection.material} />
      ) : selection.infill === "lamellen" ? (
        <Lamellen railLength={innerSpan} panelH={panelH} finishColor={finishColor} material={selection.material} />
      ) : (
        <DesignFill railLength={innerSpan} panelH={panelH} finishColor={finishColor} />
      )}
    </group>
  );
}

// ─── Flat segment in 3D space ─────────────────────────────────────────────────

function RailSegment({ segData, selection, finishColor }) {
  const transform = segmentToWorldTransform(segData);
  const lengthM   = transform.isSloped ? transform.slopedLength : segData.length / 100;
  const heightM   = Math.max(0.6, (selection.height ?? 105) / 100);

  if (transform.isSloped) {
    // Stair segment: yaw (horizontal) + pitch (elevation)
    // Outer group: horizontal orientation
    // Inner group: elevation tilt around local Z
    return (
      <group
        position={[transform.center.x, transform.center.y, transform.center.z]}
        rotation={[0, transform.yaw, 0]}
      >
        <group rotation={[0, 0, transform.pitch]}>
          <RailSection
            lengthM={lengthM}
            heightM={heightM}
            selection={selection}
            finishColor={finishColor}
            showStartPost={segData.showStartPost !== false}
            showEndPost={segData.showEndPost !== false}
            startIsFreeEnd={!segData.startIsJunction}
            endIsFreeEnd={!segData.endIsJunction}
          />
        </group>
      </group>
    );
  }

  const yOffset = 0;

  return (
    <group position={[transform.center.x, yOffset, transform.center.z]} rotation={[0, transform.yaw, 0]}>
      <RailSection
        lengthM={lengthM}
        heightM={heightM}
        selection={selection}
        finishColor={finishColor}
        showStartPost={segData.showStartPost !== false}
        showEndPost={segData.showEndPost !== false}
        startIsFreeEnd={!segData.startIsJunction}
        endIsFreeEnd={!segData.endIsJunction}
      />
    </group>
  );
}

/**
 * RoundedCornerConnector — curved connector at rounding vertices.
 *
 * The plan→world mapping negates Z (plan Y → world -Z), which reverses the
 * winding order of arcs. We correct this by inverting the corner direction
 * before sampling — this is the "proper transform layer" fix.
 */
function RoundedCornerConnector({ corner, selection, finishColor }) {
  const depthM = Math.max(0.04, (selection.depth ?? 6) / 100);
  const railH = 0.055;
  const railD = depthM * 0.85;
  const isFrameless = selection.infill === "glas" && selection.material !== "rvs";
  const heightM = Math.max(0.6, (selection.height ?? 105) / 100);
  const levels = isFrameless
    ? [0.06, Math.max(0.02, heightM * 0.45)]
    : [heightM + railH / 2, 0.10];

  // Invert direction to compensate for the plan→world Z-sign flip
  const corner3D = { ...corner, direction: -corner.direction };
  const points = sampleRoundedCorner(corner3D, 12).map(planPointToWorld);

  if (points.length < 2) return null;

  return (
    <group>
      {levels.map((y, levelIndex) => (
        points.slice(0, -1).map((point, index) => {
          const next = points[index + 1];
          const dx = next.x - point.x;
          const dz = next.z - point.z;
          const length = Math.hypot(dx, dz);
          if (length < 0.01) return null;

          return (
            <mesh
              key={`${corner.vertexId}-${levelIndex}-${index}`}
              position={[(point.x + next.x) / 2, y, (point.z + next.z) / 2]}
              rotation={[0, Math.atan2(-dz, dx), 0]}
              castShadow
              receiveShadow
            >
              <boxGeometry args={[length, isFrameless ? 0.02 : railH, isFrameless ? 0.02 : railD]} />
              <meshPhysicalMaterial color={finishColor} metalness={0.82} roughness={0.24} clearcoat={0.4} />
            </mesh>
          );
        })
      ))}
    </group>
  );
}

// ─── Concrete platform ────────────────────────────────────────────────────────

/**
 * ConcreteBlock — 30 cm concrete slab under flat railing sections.
 *
 * The railing sits at the FRONT EDGE (viewer side, +Z) of the slab.
 * The slab extends behind the railing toward the building interior (–Z direction).
 * A small overhang (FRONT_OVERHANG) protrudes in front of the railing line.
 */
const FRONT_OVERHANG = 0.01; // 1 cm — railing sits at the very front edge of the slab

function ConcreteBlock({ bbox, mounting }) {
  // Zijmontage: slab flush with railing endpoints — no extension in any direction.
  // Posts land exactly on the slab face so corner posts are never buried in concrete.
  // Op de vloer: small overhang all round (3 cm sides, 5 cm front).
  const w = mounting === "zijmontage"
    ? Math.max(bbox.width  / 100, 0.30)
    : Math.max((bbox.width  / 100) + 0.06, 0.50);
  const d = Math.max((bbox.height / 100) + 0.06, 0.70);

  const frontShift = mounting === "zijmontage" ? 0 : 0.05;
  const zFront = -(bbox.minY / 100) + frontShift;
  const cz = zFront - d / 2;
  const cx = (bbox.minX + bbox.maxX) / 200;

  return (
    <group>
      <mesh position={[cx, -PLATFORM_HEIGHT / 2, cz]} receiveShadow castShadow>
        <boxGeometry args={[w, PLATFORM_HEIGHT, d]} />
        <meshStandardMaterial color="#c4bcb1" roughness={0.92} metalness={0.02} />
      </mesh>
      {/* Top-edge definition strip */}
      <mesh position={[cx, -0.001, cz]}>
        <boxGeometry args={[w + 0.005, 0.003, d + 0.005]} />
        <meshStandardMaterial color="#a39b91" roughness={0.94} metalness={0.01} />
      </mesh>
    </group>
  );
}

/**
 * StairFlightBlock — realistic stair steps beneath a sloped railing segment.
 *
 * Works for both ascending (rise > 0) and descending (rise < 0) flights.
 * Group is always anchored at the START vertex of the segment at y = 0 (world).
 * Steps travel along local +X (= yaw direction) and use signed stepH:
 *   rise > 0 → steps climb upward   (flat landing is at the start/bottom)
 *   rise < 0 → steps descend downward (flat landing is at the start/top)
 *
 * The slab extends behind the railing (same FRONT_OVERHANG as ConcreteBlock).
 */
const STEP_CONCRETE   = "#B2ADA5";
const STEP_EDGE_COLOR = "#9A9590";
const STEP_WIDTH = 0.85; // metres — perpendicular to stair, from front overhang into interior

function StairFlightBlock({ segData }) {
  const rise = segData.rise ?? 0;
  if (Math.abs(rise) < 1) return null;

  const t = segmentToWorldTransform(segData);
  const riseM       = rise / 100;          // signed metres
  const horizontalM = segData.length / 100;

  // Aim for ~17.5 cm per step (Belgian norm 17–18 cm)
  const nSteps = Math.max(Math.round(Math.abs(riseM) / 0.175), 2);
  const tread  = horizontalM / nSteps;     // horizontal depth per step (m)
  const stepH  = riseM / nSteps;           // signed: + ascending, – descending

  // Bottom of the stair well — where the foundation floor is
  const floorY = riseM >= 0
    ? -PLATFORM_HEIGHT                     // ascending: bottom landing at y = –0.30
    : riseM - PLATFORM_HEIGHT;             // descending: bottom landing at y = rise – 0.30

  // Z offset: same FRONT_OVERHANG as ConcreteBlock — railing at front edge, slab behind
  const stepCenterZ = -(STEP_WIDTH / 2 - FRONT_OVERHANG);

  return (
    <group position={[t.start.x, 0, t.start.z]} rotation={[0, t.yaw, 0]}>
      {Array.from({ length: nSteps }, (_, i) => {
        const treadTop = (i + 1) * stepH;             // signed tread height
        const boxH     = Math.abs(treadTop - floorY); // always positive
        const centerY  = (treadTop + floorY) / 2;
        const noseY    = treadTop + 0.006;

        return (
          <group key={i}>
            {/* Main step body — solid from foundation floor to tread top */}
            <mesh position={[(i + 0.5) * tread, centerY, stepCenterZ]} receiveShadow castShadow>
              <boxGeometry args={[tread, boxH, STEP_WIDTH]} />
              <meshStandardMaterial color="#beb5aa" roughness={0.92} metalness={0.02} />
            </mesh>
            {/* Nosing strip at the leading edge of each tread */}
            <mesh position={[(i + 1) * tread - 0.012, noseY, stepCenterZ]} receiveShadow>
              <boxGeometry args={[0.025, 0.012, STEP_WIDTH + 0.01]} />
              <meshStandardMaterial color="#a79e94" roughness={0.88} metalness={0.03} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}

// ─── 3D Dimension annotations ─────────────────────────────────────────────────

function DimLabel({ position, text }) {
  return (
    <Html
      position={position}
      center
      occlude={false}
      zIndexRange={[100, 0]}
      style={{ pointerEvents: "none" }}
    >
      <div className="dim3d dim3d__label">
        {text}
      </div>
    </Html>
  );
}

function ArrowHead({ position, angle, color = "#D8C8A8", size = 0.08 }) {
  const wing = size * 0.52;
  const left = [
    position[0] - Math.cos(angle - Math.PI / 6) * wing,
    position[1],
    position[2] - Math.sin(angle - Math.PI / 6) * wing,
  ];
  const right = [
    position[0] - Math.cos(angle + Math.PI / 6) * wing,
    position[1],
    position[2] - Math.sin(angle + Math.PI / 6) * wing,
  ];

  return (
    <>
      <Line points={[left, position]} color={color} lineWidth={1.4} transparent opacity={0.95} />
      <Line points={[right, position]} color={color} lineWidth={1.4} transparent opacity={0.95} />
    </>
  );
}

function VerticalRiseDimension({ seg, offsetX = 0.16, offsetZ = 0.08 }) {
  const t = segmentToWorldTransform(seg);
  const guideColor = "#C4954A";
  const top = [t.end.x + offsetX, t.end.y + 0.02, t.end.z + offsetZ];
  const bottom = [t.end.x + offsetX, 0.02, t.end.z + offsetZ];
  const center = [
    (top[0] + bottom[0]) / 2,
    (top[1] + bottom[1]) / 2,
    (top[2] + bottom[2]) / 2,
  ];

  return (
    <group>
      <Line points={[bottom, top]} color={guideColor} lineWidth={1.35} transparent opacity={0.95} />
      <Line
        points={[[t.end.x, 0.02, t.end.z], bottom]}
        color={guideColor}
        lineWidth={1}
        dashed
        dashSize={0.03}
        gapSize={0.02}
        transparent
        opacity={0.7}
      />
      <Line
        points={[[t.end.x, t.end.y + 0.02, t.end.z], top]}
        color={guideColor}
        lineWidth={1}
        dashed
        dashSize={0.03}
        gapSize={0.02}
        transparent
        opacity={0.7}
      />
      <ArrowHead position={top} angle={-Math.PI / 2} color={guideColor} size={0.06} />
      <ArrowHead position={bottom} angle={Math.PI / 2} color={guideColor} size={0.06} />
      <DimLabel position={center} text={`↑ ${Math.round(Math.abs(seg.rise))} cm`} />
    </group>
  );
}

function SegmentDimension({ seg, heightM }) {
  const t = segmentToWorldTransform(seg);
  const labelY = (seg.rise ?? 0) / 200 + heightM + 0.26;
  const lenCm = Math.round(seg.length);
  const guideColor = "#D8C8A8";
  const start = [t.start.x, labelY, t.start.z];
  const end = [t.end.x, labelY, t.end.z];
  const angle = Math.atan2(t.end.z - t.start.z, t.end.x - t.start.x);

  return (
    <group>
      <Line points={[start, end]} color={guideColor} lineWidth={1.4} transparent opacity={0.95} />
      <Line
        points={[[t.start.x, 0.04, t.start.z], start]}
        color={guideColor}
        lineWidth={1}
        dashed
        dashSize={0.04}
        gapSize={0.025}
        transparent
        opacity={0.75}
      />
      <Line
        points={[[t.end.x, t.end.y + 0.04, t.end.z], end]}
        color={guideColor}
        lineWidth={1}
        dashed
        dashSize={0.04}
        gapSize={0.025}
        transparent
        opacity={0.75}
      />
      <ArrowHead position={start} angle={angle} color={guideColor} />
      <ArrowHead position={end} angle={angle + Math.PI} color={guideColor} />
      <DimLabel position={[t.center.x, labelY, t.center.z]} text={`${lenCm} cm`} />
      {(seg.rise ?? 0) !== 0 && <VerticalRiseDimension seg={seg} />}
    </group>
  );
}

function DimensionAnnotationsWithArrows({ segments, heightM }) {
  if (!segments || segments.length === 0) return null;

  return (
    <>
      {segments.map(seg => (
        <SegmentDimension key={`dim-arrow-${seg.id}`} seg={seg} heightM={heightM} />
      ))}
    </>
  );
}

function BoundingBoxDimensions({ bbox }) {
  if (!bbox || bbox.width <= 0.01 || bbox.height <= 0.01) return null;

  const minX = bbox.minX / 100;
  const maxX = bbox.maxX / 100;
  const minZ = -(bbox.maxY / 100);
  const maxZ = -(bbox.minY / 100);
  const widthY = 0.12;
  const depthY = 0.18;
  const xDimZ = maxZ + 0.28;
  const zDimX = minX - 0.26;
  const guideColor = "#cab89a";

  return (
    <>
      <Line points={[[minX, widthY, xDimZ], [maxX, widthY, xDimZ]]} color={guideColor} lineWidth={1.2} transparent opacity={0.9} />
      <ArrowHead position={[minX, widthY, xDimZ]} angle={0} color={guideColor} size={0.055} />
      <ArrowHead position={[maxX, widthY, xDimZ]} angle={Math.PI} color={guideColor} size={0.055} />
      <DimLabel position={[(minX + maxX) / 2, widthY, xDimZ]} text={`${Math.round(bbox.width)} cm`} />

      <Line points={[[zDimX, depthY, minZ], [zDimX, depthY, maxZ]]} color={guideColor} lineWidth={1.2} transparent opacity={0.9} />
      <ArrowHead position={[zDimX, depthY, minZ]} angle={-Math.PI / 2} color={guideColor} size={0.055} />
      <ArrowHead position={[zDimX, depthY, maxZ]} angle={Math.PI / 2} color={guideColor} size={0.055} />
      <DimLabel position={[zDimX, depthY, (minZ + maxZ) / 2]} text={`${Math.round(bbox.height)} cm`} />
    </>
  );
}

function DimensionAnnotations({ segments, heightM }) {
  if (!segments || segments.length === 0) return null;

  return (
    <>
      {segments.map(seg => {
        const t = segmentToWorldTransform(seg);
        const labelY = (seg.rise ?? 0) / 200 + heightM + 0.26;
        const lenCm  = Math.round(seg.length);

        return (
          <group key={`dim-${seg.id}`}>
            {/* Segment length label above the handrail */}
            <DimLabel
              position={[t.center.x, labelY, t.center.z]}
              text={`${lenCm} cm`}
            />
            {/* Show rise for stair segments */}
            {(seg.rise ?? 0) !== 0 && (
              <DimLabel
                position={[t.center.x, labelY + 0.22, t.center.z]}
                text={`↑ ${Math.round(Math.abs(seg.rise))} cm`}
              />
            )}
          </group>
        );
      })}
    </>
  );
}

// ─── Scene internals (inside Canvas) ─────────────────────────────────────────

function SceneInner({ segments, roundedCorners, selection, finishColor, bbox, showDimensions, qualityMode }) {
  const center  = bboxCenterToWorld(bbox);
  const heightM = Math.max(0.6, (selection.height ?? 105) / 100);
  const sh      = Math.max(Math.hypot(bbox.width, bbox.height) / 200 + 2.5, 4);
  const quality = QUALITY_PRESETS[qualityMode] ?? QUALITY_PRESETS.balanced;

  // Floor drops to the bottom of the lowest stair flight so stairs don't go underground
  const floorY = useMemo(() => {
    const minRise = Math.min(0, ...segments.map(s => (s.rise ?? 0) / 100));
    return minRise - PLATFORM_HEIGHT - 0.001;
  }, [segments]);

  // ConcreteBlock covers only flat (non-stair) segments to avoid overlap with StairFlightBlock
  const flatBbox = useMemo(() => {
    const flat = segments.filter(s => Math.abs(s.rise ?? 0) < 1);
    if (flat.length === 0) return null;
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    for (const s of flat) {
      minX = Math.min(minX, s.start.x, s.end.x);
      maxX = Math.max(maxX, s.start.x, s.end.x);
      minY = Math.min(minY, s.start.y, s.end.y);
      maxY = Math.max(maxY, s.start.y, s.end.y);
    }
    return { minX, maxX, minY, maxY, width: maxX - minX, height: maxY - minY };
  }, [segments]);

  return (
    <>
      <color attach="background" args={["#f4ede2"]} />
      <fog attach="fog" args={["#f4ede2", 8, 24]} />
      <CameraFitter bbox={bbox} />

      <Environment preset="city" background={false} resolution={quality.envResolution} />

      <mesh position={[center.x, 4.8, center.z - 7.2]}>
        <planeGeometry args={[28, 14]} />
        <meshBasicMaterial color="#f7f1e7" />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[center.x, 6.9, center.z]}>
        <ringGeometry args={[6, 11, 48]} />
        <meshBasicMaterial color="#f1e5ce" transparent opacity={0.32} side={2} />
      </mesh>

      {/* ── 3-point studio lighting ── */}
      <ambientLight intensity={0.34} color="#F8F0E4" />
      <hemisphereLight intensity={0.55} color="#FFF8EE" groundColor="#7B8792" />

      {/* Key light */}
      <directionalLight
        intensity={2.5}
        position={[center.x + 5.5, 8.5, center.z + 4.2]}
        color="#FFF6ED"
        castShadow
        shadow-mapSize-width={quality.shadowMap}
        shadow-mapSize-height={quality.shadowMap}
        shadow-camera-near={0.5}
        shadow-camera-far={30}
        shadow-camera-left={-sh}
        shadow-camera-right={sh}
        shadow-camera-top={sh}
        shadow-camera-bottom={-sh}
        shadow-bias={-0.0008}
        shadow-normalBias={0.025}
      />

      {/* Fill light */}
      <directionalLight intensity={0.82} position={[center.x - 5, 4.4, center.z + 3]} color="#D8E8F8" />

      {/* Rim light */}
      <pointLight intensity={1.5} position={[center.x + 0.5, 2.8, center.z - 4.8]} color="#FFD9A6" decay={2} />

      {/* ── Concrete slab — only under flat segments, at the front edge ── */}
      <ConcreteBlock bbox={flatBbox ?? bbox} mounting={selection.mounting} />

      {/* ── Stair steps — one flight per sloped segment ── */}
      {segments.filter(s => Math.abs(s.rise ?? 0) >= 1).map(s => (
        <StairFlightBlock key={`stair-${s.id}`} segData={s} />
      ))}

      {/* ── Floor around the platform ── */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, floorY, 0]}>
        <planeGeometry args={[30, 30]} />
        <meshStandardMaterial color="#d5cdc0" roughness={0.92} metalness={0.02} />
      </mesh>

      <ContactShadows
        position={[center.x, floorY + 0.004, center.z]}
        scale={Math.max(6, Math.hypot(bbox.width, bbox.height) / 90)}
        blur={quality.contactBlur}
        opacity={0.28}
        far={qualityMode === "lightweight" ? 6 : 8}
        resolution={quality.shadowMap}
        color="#1f140d"
      />

      {/* Shadow receiver on floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, floorY + 0.001, 0]} receiveShadow>
        <planeGeometry args={[40, 40]} />
        <shadowMaterial opacity={0.26} color="#1A0F08" />
      </mesh>

      {/* Floor grid */}
      <Grid
        position={[center.x, floorY + 0.002, center.z]}
        args={[40, 40]}
        cellSize={0.5}
        cellThickness={0.30}
        cellColor="#B8B0A8"
        sectionSize={1}
        sectionThickness={0.65}
        sectionColor="#9A9288"
        fadeDistance={quality.gridFade}
        fadeStrength={3.0}
        infiniteGrid
      />

      {/* ── Railing segments ── */}
      {segments.map(seg => (
        <RailSegment
          key={seg.id}
          segData={seg}
          selection={selection}
          finishColor={finishColor}
        />
      ))}

      {(selection.extraOptions ?? []).includes("zaokraglenia") && roundedCorners.map((corner) => (
        <RoundedCornerConnector
          key={corner.vertexId}
          corner={corner}
          selection={selection}
          finishColor={finishColor}
        />
      ))}

      {/* ── 3D dimension annotations (toggled by button) ── */}
      {showDimensions && (
        <>
          <DimensionAnnotationsWithArrows segments={segments} heightM={heightM} />
          <BoundingBoxDimensions bbox={bbox} />
        </>
      )}
    </>
  );
}

// ─── Public component ─────────────────────────────────────────────────────────

function Scene3D({ geo, selection, finish, showDimensions = false, qualityMode = "balanced" }) {
  const segments       = useMemo(() => getAllRenderedSegments(geo), [geo]);
  const roundedCorners = useMemo(() => getRoundedCorners(geo), [geo]);
  const bbox           = useMemo(() => getBoundingBox(geo), [geo]);
  const finishColor    = finish?.hex ?? "#22262B";
  const quality        = QUALITY_PRESETS[qualityMode] ?? QUALITY_PRESETS.balanced;

  // Enrich each segment with junction flags — avoids duplicate posts at shared vertices
  const enrichedSegments = useMemo(() => {
    const vertexCount = {};
    const vertexOwners = {};
    Object.values(geo.segments).forEach(seg => {
      vertexCount[seg.startId] = (vertexCount[seg.startId] || 0) + 1;
      vertexCount[seg.endId]   = (vertexCount[seg.endId]   || 0) + 1;
    });

    const rankOwner = (current, candidate) => {
      if (!current) return candidate;
      if (candidate.bias !== current.bias) return candidate.bias > current.bias ? candidate : current;
      if (candidate.length !== current.length) return candidate.length > current.length ? candidate : current;
      return candidate.segId < current.segId ? candidate : current;
    };

    segments.forEach(seg => {
      const raw = geo.segments[seg.id];
      if (!raw) return;

      const dx = Math.abs(raw.endId && geo.vertices[raw.endId] ? geo.vertices[raw.endId].x - geo.vertices[raw.startId].x : 0);
      const dy = Math.abs(raw.endId && geo.vertices[raw.endId] ? geo.vertices[raw.endId].y - geo.vertices[raw.startId].y : 0);
      const candidate = {
        segId: seg.id,
        bias: dx - dy,
        length: seg.length,
      };

      vertexOwners[raw.startId] = rankOwner(vertexOwners[raw.startId], candidate);
      vertexOwners[raw.endId] = rankOwner(vertexOwners[raw.endId], candidate);
    });

    return segments.map(seg => {
      const raw = geo.segments[seg.id];
      const startDegree = raw ? (vertexCount[raw.startId] || 0) : 0;
      const endDegree = raw ? (vertexCount[raw.endId] || 0) : 0;
      return {
        ...seg,
        startIsJunction: startDegree >= 2,
        endIsJunction: endDegree >= 2,
        showStartPost: raw ? startDegree <= 1 || vertexOwners[raw.startId]?.segId === seg.id : true,
        showEndPost: raw ? endDegree <= 1 || vertexOwners[raw.endId]?.segId === seg.id : true,
      };
    });
  }, [geo, segments]);

  const initCam = useMemo(() => getCameraSetup(bbox), []); // eslint-disable-line

  if (enrichedSegments.length === 0) {
    return (
      <div className="scene3d__empty">
        <p>Teken een balustrade in de 2D-planner om de 3D-preview te zien.</p>
      </div>
    );
  }

  return (
    <Canvas
      dpr={quality.dpr}
      shadows
      gl={{ antialias: true }}
    >
      <color attach="background" args={["#EAE4D8"]} />
      <fog attach="fog" args={["#EAE4D8", 9, 24]} />
      <PerspectiveCamera makeDefault position={initCam.position} fov={28} />

      <Suspense fallback={null}>
        <SceneInner
          segments={enrichedSegments}
          roundedCorners={roundedCorners}
        selection={selection}
        finishColor={finishColor}
        bbox={bbox}
        showDimensions={showDimensions}
        qualityMode={qualityMode}
      />
      </Suspense>
    </Canvas>
  );
}

export default Scene3D;
