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
  lightweight: { dpr: [1, 1.25], shadowMap: 1024, envResolution: 128, gridFade: 8, contactBlur: 1.4, lineOpacity: 0.9 },
  balanced:    { dpr: [1, 1.6],  shadowMap: 1536, envResolution: 256, gridFade: 10, contactBlur: 1.8, lineOpacity: 0.94 },
  high:        { dpr: [1.2, 2],  shadowMap: 2048, envResolution: 512, gridFade: 12, contactBlur: 2.2, lineOpacity: 0.98 },
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
  if (material === "rvs") {
    return { color: finishColor, metalness: 0.96, roughness: 0.08, clearcoat: 0.9, clearcoatRoughness: 0.04, envMapIntensity: 1.6, reflectivity: 0.95 };
  }
  if (material === "gepoedercoat-staal") {
    return { color: finishColor, metalness: 0.3, roughness: 0.5, clearcoat: 0.7, clearcoatRoughness: 0.22, envMapIntensity: 0.75 };
  }
  return { color: finishColor, metalness: 0.9, roughness: 0.18, clearcoat: 0.5, clearcoatRoughness: 0.15, envMapIntensity: 1.1 };
}

const GLASS_MAT = {
  color: "#d8e8f0", transmission: 0.88, roughness: 0.01, metalness: 0, ior: 1.52,
  thickness: 0.01, envMapIntensity: 1.5, transparent: true, opacity: 0.85,
  attenuationDistance: 1.8, attenuationColor: "#e8f4ff", specularIntensity: 1.0,
  specularColor: "#ffffff", side: 2,
};
const GLASS_THICKNESS = 0.01; // 10mm glass

// ─── Infill components ────────────────────────────────────────────────────────

function GlassInfill({ railLength, panelH, postXs, finishColor, postW }) {
  const clampMp = { color: finishColor, metalness: 0.9, roughness: 0.15, clearcoat: 0.6 };
  const boltMp = { color: "#70787f", metalness: 0.95, roughness: 0.08 };
  const glassBottom = 0.025;
  const glassTop = panelH - 0.01;
  const glassH = glassTop - glassBottom;
  const glassY = (glassBottom + glassTop) / 2;
  const gapFromPost = postW / 2 + 0.012;

  // Build dividers: post positions + segment edges
  const segLeft = -railLength / 2;
  const segRight = railLength / 2;
  const sortedPosts = [...postXs].sort((a, b) => a - b);

  // All divider points: segment edges + posts
  const dividers = [segLeft, ...sortedPosts, segRight];
  // Remove near-duplicates (when a post is at the edge)
  const uniqueDividers = [dividers[0]];
  for (let i = 1; i < dividers.length; i++) {
    if (Math.abs(dividers[i] - uniqueDividers[uniqueDividers.length - 1]) > 0.02) {
      uniqueDividers.push(dividers[i]);
    }
  }

  // Glass panels between each pair of dividers
  const panels = [];
  for (let i = 0; i < uniqueDividers.length - 1; i++) {
    const left = uniqueDividers[i];
    const right = uniqueDividers[i + 1];
    // Is left/right a post? Add gap. Is it a segment edge? No gap needed.
    const leftIsPost = sortedPosts.some(p => Math.abs(p - left) < 0.02);
    const rightIsPost = sortedPosts.some(p => Math.abs(p - right) < 0.02);
    const leftEdge = leftIsPost ? left + gapFromPost : left + 0.005;
    const rightEdge = rightIsPost ? right - gapFromPost : right - 0.005;
    const w = rightEdge - leftEdge;
    if (w > 0.03) {
      panels.push({ cx: (leftEdge + rightEdge) / 2, w });
    }
  }

  const bracketY1 = glassBottom + glassH * 0.25;
  const bracketY2 = glassBottom + glassH * 0.75;

  return (
    <group>
      {/* Glass panels */}
      {panels.map((p, i) => (
        <group key={`glass-${i}`}>
          <mesh position={[p.cx, glassY, 0]}>
            <boxGeometry args={[p.w, glassH, GLASS_THICKNESS]} />
            <meshPhysicalMaterial {...GLASS_MAT} />
          </mesh>
          <mesh position={[p.cx, glassTop, 0]}>
            <boxGeometry args={[p.w, 0.003, GLASS_THICKNESS]} />
            <meshPhysicalMaterial color="#b8dcc8" transparent opacity={0.5} roughness={0.1} />
          </mesh>
        </group>
      ))}

      {/* Brackets on each post (both sides) */}
      {sortedPosts.map((x, i) => (
        <group key={`brackets-${i}`} position={[x, 0, 0]}>
          {[bracketY1, bracketY2].map((by, bi) => (
            <group key={bi} position={[0, by, 0]}>
              {/* Left bracket */}
              <mesh position={[-(postW / 2 + 0.008), 0, 0]} castShadow>
                <boxGeometry args={[0.022, 0.055, postW * 0.95]} />
                <meshPhysicalMaterial {...clampMp} />
              </mesh>
              <mesh position={[-(postW / 2 + 0.008), 0, postW * 0.47 + 0.003]} rotation={[Math.PI / 2, 0, 0]} castShadow>
                <cylinderGeometry args={[0.005, 0.005, 0.006, 6]} />
                <meshPhysicalMaterial {...boltMp} />
              </mesh>
              {/* Right bracket */}
              <mesh position={[postW / 2 + 0.008, 0, 0]} castShadow>
                <boxGeometry args={[0.022, 0.055, postW * 0.95]} />
                <meshPhysicalMaterial {...clampMp} />
              </mesh>
              <mesh position={[postW / 2 + 0.008, 0, postW * 0.47 + 0.003]} rotation={[Math.PI / 2, 0, 0]} castShadow>
                <cylinderGeometry args={[0.005, 0.005, 0.006, 6]} />
                <meshPhysicalMaterial {...boltMp} />
              </mesh>
            </group>
          ))}
        </group>
      ))}
    </group>
  );
}

function FramelessGlass({ railLength, panelH }) {
  return (
    <group>
      {/* Glass panel */}
      <mesh position={[0, panelH / 2 + 0.04, 0]}>
        <boxGeometry args={[railLength - 0.03, panelH, 0.012]} />
        <meshPhysicalMaterial {...GLASS_MAT} transmission={0.91} />
      </mesh>
      {/* Glass edge — green tint visible at top */}
      <mesh position={[0, panelH + 0.04, 0]}>
        <boxGeometry args={[railLength - 0.03, 0.003, 0.012]} />
        <meshPhysicalMaterial color="#a8d0b8" transparent opacity={0.5} roughness={0.1} />
      </mesh>
      {/* U-channel base mount */}
      <mesh position={[0, 0.016, 0]} castShadow>
        <boxGeometry args={[railLength - 0.01, 0.032, 0.03]} />
        <meshPhysicalMaterial color="#707880" metalness={0.92} roughness={0.12} clearcoat={0.55} />
      </mesh>
      {/* U-channel inner groove (visible slot) */}
      <mesh position={[0, 0.033, 0]}>
        <boxGeometry args={[railLength - 0.02, 0.002, 0.015]} />
        <meshPhysicalMaterial color="#404850" metalness={0.8} roughness={0.3} />
      </mesh>
      {/* Top cap handrail */}
      <mesh position={[0, panelH + 0.04 + 0.01, 0]} castShadow>
        <boxGeometry args={[railLength - 0.01, 0.02, 0.026]} />
        <meshPhysicalMaterial color="#707880" metalness={0.92} roughness={0.12} clearcoat={0.55} />
      </mesh>
    </group>
  );
}

function VerticalSpijlen({ railLength, panelH, finishColor, material, totalLength = 0 }) {
  const mp = frameMat(finishColor, material);
  const barSize = 0.016;

  // Target pitch ~10.5cm
  const targetPitch = 0.105;

  // How many bars fit if we need margin >= targetPitch on each side?
  // usable = railLength, we want nBars spaced so total span INCLUDING margins = railLength
  // nBars cells of equal width: cellWidth = railLength / nBars, bar in center of each cell
  const nBars = Math.max(1, Math.floor(railLength / targetPitch));
  const cellWidth = railLength / nBars;

  // Each bar sits in the center of its cell — guaranteed equal spacing everywhere
  const bars = [];
  for (let i = 0; i < nBars; i++) {
    bars.push(-railLength / 2 + cellWidth * (i + 0.5));
  }

  const barBottom = 0.02;
  const barTop = panelH;
  const barH = barTop - barBottom;
  const barY = (barBottom + barTop) / 2;

  return (
    <group>
      {bars.map((x, i) => (
        <mesh key={i} position={[x, barY, 0]} castShadow>
          <boxGeometry args={[barSize, barH, barSize]} />
          <meshPhysicalMaterial {...mp} />
        </mesh>
      ))}
    </group>
  );
}

function HorizontaleProfielen({ railLength, panelH, finishColor, material }) {
  const mp = frameMat(finishColor, material);
  const rows = panelH > 0.7 ? 5 : 4;
  const bottomY = 0.06;
  const topY = panelH - 0.01;
  const gap = (topY - bottomY) / (rows - 1);

  return (
    <group>
      {Array.from({ length: rows }, (_, i) => (
        <mesh key={i} position={[0, bottomY + gap * i, 0]} castShadow>
          <boxGeometry args={[railLength, 0.025, 0.02]} />
          <meshPhysicalMaterial {...mp} />
        </mesh>
      ))}
    </group>
  );
}

function HorizontaleStaven({ railLength, panelH, finishColor, material }) {
  const isRvs = material === "rvs";
  const mp = frameMat(finishColor, material);
  const barCount = panelH > 0.75 ? 5 : 4;
  const bottomY = 0.06;
  const topY = panelH - 0.01;
  const gap = (topY - bottomY) / (barCount - 1);

  return (
    <group>
      {Array.from({ length: barCount }, (_, i) => {
        const y = bottomY + gap * i;
        return isRvs ? (
          <mesh key={i} position={[0, y, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
            <cylinderGeometry args={[0.01, 0.01, railLength, 20]} />
            <meshPhysicalMaterial {...mp} />
          </mesh>
        ) : (
          <mesh key={i} position={[0, y, 0]} castShadow>
            <boxGeometry args={[railLength, 0.02, 0.016]} />
            <meshPhysicalMaterial {...mp} />
          </mesh>
        );
      })}
      {isRvs && Array.from({ length: barCount }, (_, bi) => {
        const y = bottomY + gap * bi;
        return [-(railLength / 2 - 0.02), (railLength / 2 - 0.02)].map((x, j) => (
          <mesh key={`${bi}-${j}`} position={[x, y, 0]} castShadow>
            <cylinderGeometry args={[0.016, 0.016, 0.01, 20]} />
            <meshPhysicalMaterial {...mp} />
          </mesh>
        ));
      })}
    </group>
  );
}

function Lamellen({ railLength, panelH, finishColor, material }) {
  const mp = frameMat(finishColor, material);
  const count = Math.max(4, Math.round(railLength / 0.055));
  const spacing = railLength / (count + 1);
  const lamelBottom = 0.028;
  const lamelTop = panelH;
  const lamelH = lamelTop - lamelBottom;
  const lamelY = (lamelBottom + lamelTop) / 2;

  return (
    <group>
      {Array.from({ length: count }, (_, i) => (
        <mesh key={i} position={[-railLength / 2 + spacing * (i + 1), lamelY, 0]} rotation={[0, 0.1, 0]} castShadow>
          <boxGeometry args={[0.04, lamelH, 0.007]} />
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
  const mp = frameMat(color, "gepoedercoat-staal");
  return (
    <mesh position={[(from[0] + to[0]) / 2, (from[1] + to[1]) / 2, 0]} rotation={[0, 0, Math.atan2(dy, dx) - Math.PI / 2]} castShadow>
      <boxGeometry args={[barW, length, barD]} />
      <meshPhysicalMaterial {...mp} />
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
            {showCross && <DiagonalBar from={[leftX, topY]} to={[rightX, bottomY]} color={finishColor} />}
          </group>
        );
      })}
    </group>
  );
}

// ─── Post + base ──────────────────────────────────────────────────────────────

function Post({ finishColor, postH, postW, postD, material }) {
  const mp = frameMat(finishColor, material || "aluminium");
  return (
    <group>
      {/* Rectangular post body — same for all materials */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[postW, postH, postD]} />
        <meshPhysicalMaterial {...mp} />
      </mesh>
      {/* Top end cap */}
      <mesh position={[0, postH / 2 + 0.005, 0]} castShadow>
        <boxGeometry args={[postW + 0.006, 0.01, postD + 0.006]} />
        <meshPhysicalMaterial {...mp} />
      </mesh>
      {/* Chamfer groove top */}
      <mesh position={[0, postH / 2 - 0.025, 0]} castShadow>
        <boxGeometry args={[postW + 0.002, 0.003, postD + 0.002]} />
        <meshPhysicalMaterial {...mp} envMapIntensity={0.6} />
      </mesh>
      {/* Chamfer groove bottom */}
      <mesh position={[0, -postH / 2 + 0.06, 0]} castShadow>
        <boxGeometry args={[postW + 0.002, 0.003, postD + 0.002]} />
        <meshPhysicalMaterial {...mp} envMapIntensity={0.6} />
      </mesh>
    </group>
  );
}

function PostBase({ mounting, finishColor, postW, postD, postH }) {
  const bracketMat = { color: "#505860", metalness: 0.88, roughness: 0.2, clearcoat: 0.45, clearcoatRoughness: 0.15 };
  const boltMat = { color: "#8d949b", metalness: 0.94, roughness: 0.12, clearcoat: 0.35 };

  if (mounting === "zijmontage") {
    const plateDepth = 0.01;
    const plateWidth = postW * 1.55;
    const plateHeight = PLATFORM_HEIGHT * 0.52;
    const armDepth = Math.max(0.022, postD * 0.7);
    const plateZ = postD / 2 + plateDepth / 2 - 0.003;
    const armZ = postD / 2 - armDepth / 2 + 0.002;
    const armY = PLATFORM_HEIGHT * 0.14;
    const boltZ = plateZ - 0.001;
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
        {[[-plateWidth * 0.28, plateHeight * 0.26], [plateWidth * 0.28, plateHeight * 0.26],
          [-plateWidth * 0.28, -plateHeight * 0.18], [plateWidth * 0.28, -plateHeight * 0.18]].map(([bx, by], i) => (
          <mesh key={i} position={[bx, by, boltZ]} rotation={[Math.PI / 2, 0, 0]} castShadow>
            <cylinderGeometry args={[0.004, 0.004, 0.012, 8]} />
            <meshPhysicalMaterial {...boltMat} />
          </mesh>
        ))}
      </group>
    );
  }

  // Floor mount — always rectangular
  const baseSize = postW * 2.0;
  return (
    <group position={[0, -postH / 2 + 0.006, 0]}>
      <mesh castShadow>
        <boxGeometry args={[baseSize, 0.012, baseSize]} />
        <meshPhysicalMaterial {...bracketMat} />
      </mesh>
      <mesh position={[0, 0.01, 0]} castShadow>
        <boxGeometry args={[postW + 0.008, 0.008, postD + 0.008]} />
        <meshPhysicalMaterial {...bracketMat} />
      </mesh>
      {/* Anchor bolts */}
      {[[-1,-1],[-1,1],[1,-1],[1,1]].map(([sx,sz],i) => (
        <mesh key={i} position={[sx * baseSize * 0.3, 0.012, sz * baseSize * 0.3]} castShadow>
          <cylinderGeometry args={[0.004, 0.004, 0.01, 8]} />
          <meshPhysicalMaterial {...boltMat} />
        </mesh>
      ))}
    </group>
  );
}

// ─── Single rail section ─────────────────────────────────────────────────────

function RailSection({ lengthM, heightM, selection, finishColor, showStartPost = true, showEndPost = true, startIsFreeEnd = true, endIsFreeEnd = true }) {
  const depthM    = Math.max(0.04, (selection.depth ?? 6) / 100);
  // Glass: no handrail by default, unless "handrail-glas" extra option is selected
  const hasHandrailOption = (selection.extraOptions ?? []).includes("handrail-glas");
  const showHandrail = selection.infill !== "glas" || hasHandrailOption;

  // Uniform profile thickness for spijlen-style: posts = bars = rails
  const isSpijlenStyle = selection.infill === "verticale-spijlen";
  const postW  = isSpijlenStyle ? 0.016 : 0.044;
  const postD  = isSpijlenStyle ? 0.016 : depthM * 0.7;
  const postH  = heightM;
  const railH  = isSpijlenStyle ? 0.016 : 0.05;
  const railD  = isSpijlenStyle ? 0.016 : depthM * 0.82;
  const panelH = heightM;

  // At free ends: rail extends postW/2 PAST the end post center (flush with outer edge).
  // At junctions: rail stops at the center of the shared corner post.
  const startExtra = startIsFreeEnd ? postW / 2 : 0;
  const endExtra   = endIsFreeEnd   ? postW / 2 : 0;
  const railSpan   = Math.max(0.05, lengthM + startExtra + endExtra);
  const railOffsetX = (endExtra - startExtra) / 2;
  const fillSpan   = railSpan;
  const fillOffsetX = railOffsetX;

  // For spijlen: only end posts at free ends (no intermediate posts, no junction posts)
  // For other types: posts every ~85cm
  const isSpijlenInfill = selection.infill === "verticale-spijlen";
  let posts;
  if (isSpijlenInfill) {
    posts = [];
    if (showStartPost && startIsFreeEnd) posts.push({ x: -lengthM / 2, isFreeEnd: true });
    if (showEndPost && endIsFreeEnd) posts.push({ x: lengthM / 2, isFreeEnd: true });
  } else {
    const nPosts = Math.max(2, Math.min(10, Math.round(lengthM / 0.85) + 1));
    const postGap = nPosts > 1 ? lengthM / (nPosts - 1) : 0;
    posts = Array.from({ length: nPosts }, (_, i) => {
      const isStart = i === 0;
      const isEnd = i === nPosts - 1;
      if (isStart && !showStartPost) return null;
      if (isEnd && !showEndPost) return null;
      return { x: -lengthM / 2 + postGap * i, isFreeEnd: (isStart && startIsFreeEnd) || (isEnd && endIsFreeEnd) };
    }).filter(Boolean);
  }

  const postXs = posts.map(p => p.x);
  const mp = frameMat(finishColor, selection.material);

  // Handrail Y: sits exactly on top of posts
  const railY = heightM;

  return (
    <group>
      {/* ── Handrail — rectangular, shown for non-glass infills ── */}
      {showHandrail && (
        <group position={[railOffsetX, railY + railH / 2, 0]}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[railSpan, railH, railD]} />
            <meshPhysicalMaterial {...mp} />
          </mesh>
          <mesh position={[0, railH / 2 + 0.002, 0]}>
            <boxGeometry args={[railSpan - 0.003, 0.003, railD - 0.004]} />
            <meshPhysicalMaterial {...mp} envMapIntensity={1.4} roughness={0.1} />
          </mesh>
        </group>
      )}

      {/* ── End caps on free ends ── */}
      {showHandrail && startIsFreeEnd && (
        <mesh position={[railOffsetX - railSpan / 2 - 0.003, railY + railH / 2, 0]} castShadow>
          <boxGeometry args={[0.006, railH + 0.002, railD + 0.002]} />
          <meshPhysicalMaterial {...mp} />
        </mesh>
      )}
      {showHandrail && endIsFreeEnd && (
        <mesh position={[railOffsetX + railSpan / 2 + 0.003, railY + railH / 2, 0]} castShadow>
          <boxGeometry args={[0.006, railH + 0.002, railD + 0.002]} />
          <meshPhysicalMaterial {...mp} />
        </mesh>
      )}

      {/* ── Posts — centered at their X position, bottom at y=0 ── */}
      {posts.map((post, i) => (
        <group key={i} position={[post.x, postH / 2, 0]}>
          <Post finishColor={finishColor} postH={postH} postW={postW} postD={postD} material={selection.material} />
          <PostBase mounting={selection.mounting} finishColor={finishColor} postW={postW} postD={postD} postH={postH} />
        </group>
      ))}

      {/* ── Bottom rail — same profile as handrail ── */}
      {selection.infill !== "glas" && (
        <mesh position={[fillOffsetX, railH / 2, 0]} castShadow>
          <boxGeometry args={[fillSpan, railH, railD]} />
          <meshPhysicalMaterial {...mp} />
        </mesh>
      )}

      {/* ── Infill — trimmed and offset to match ── */}
      <group position={[fillOffsetX, 0, 0]}>
      {selection.infill === "glas" ? (
        <GlassInfill railLength={fillSpan} panelH={panelH} postXs={postXs.map(x => x - fillOffsetX)} finishColor={finishColor} postW={postW} />
      ) : selection.infill === "verticale-spijlen" ? (
        <VerticalSpijlen railLength={fillSpan} panelH={panelH} finishColor={finishColor} material={selection.material} totalLength={selection.length ?? 0} />
      ) : selection.infill === "horizontale-profielen" ? (
        <HorizontaleProfielen railLength={fillSpan} panelH={panelH} finishColor={finishColor} material={selection.material} />
      ) : selection.infill === "horizontale-staven" ? (
        <HorizontaleStaven railLength={fillSpan} panelH={panelH} finishColor={finishColor} material={selection.material} />
      ) : selection.infill === "lamellen" ? (
        <Lamellen railLength={fillSpan} panelH={panelH} finishColor={finishColor} material={selection.material} />
      ) : (
        <DesignFill railLength={fillSpan} panelH={panelH} finishColor={finishColor} />
      )}
      </group>
    </group>
  );
}

// ─── Corner cap — fills the gap above the corner post between two rail ends ──

function CornerCap({ position, selection, finishColor }) {
  const depthM = Math.max(0.04, (selection.depth ?? 6) / 100);
  const isSpijlen = selection.infill === "verticale-spijlen";
  // Spijlen: no corner cap — rails flow through continuously
  if (isSpijlen) return null;

  const railH = 0.05;
  const railD = depthM * 0.82;
  const postW = 0.044;
  const heightM = Math.max(0.6, (selection.height ?? 105) / 100);
  const mp = frameMat(finishColor, selection.material);
  const hasHandrailOption = (selection.extraOptions ?? []).includes("handrail-glas");
  const showHandrail = selection.infill !== "glas" || hasHandrailOption;
  const capY = heightM + railH / 2;

  if (!showHandrail) return null;

  return (
    <group position={[position.x, capY, position.z]}>
      <mesh castShadow>
        <boxGeometry args={[postW + 0.008, railH, railD]} />
        <meshPhysicalMaterial {...mp} />
      </mesh>
    </group>
  );
}

// ─── Flat segment in 3D space ────────────────────────────────────────────────

function RailSegment({ segData, selection, finishColor }) {
  const transform = segmentToWorldTransform(segData);
  const lengthM   = transform.isSloped ? transform.slopedLength : segData.length / 100;
  const heightM   = Math.max(0.6, (selection.height ?? 105) / 100);

  if (transform.isSloped) {
    return (
      <group position={[transform.center.x, transform.center.y, transform.center.z]} rotation={[0, transform.yaw, 0]}>
        <group rotation={[0, 0, transform.pitch]}>
          <RailSection lengthM={lengthM} heightM={heightM} selection={selection} finishColor={finishColor}
            showStartPost={segData.showStartPost !== false} showEndPost={segData.showEndPost !== false}
            startIsFreeEnd={!segData.startIsJunction} endIsFreeEnd={!segData.endIsJunction} />
        </group>
      </group>
    );
  }

  return (
    <group position={[transform.center.x, 0, transform.center.z]} rotation={[0, transform.yaw, 0]}>
      <RailSection lengthM={lengthM} heightM={heightM} selection={selection} finishColor={finishColor}
        showStartPost={segData.showStartPost !== false} showEndPost={segData.showEndPost !== false}
        startIsFreeEnd={!segData.startIsJunction} endIsFreeEnd={!segData.endIsJunction} />
    </group>
  );
}

function RoundedCornerConnector({ corner, selection, finishColor }) {
  const depthM = Math.max(0.04, (selection.depth ?? 6) / 100);
  const isSpijlen = selection.infill === "verticale-spijlen";
  const railH = isSpijlen ? 0.016 : 0.05;
  const railD = isSpijlen ? 0.016 : depthM * 0.82;
  const postW = isSpijlen ? 0.016 : 0.044;
  const postD = isSpijlen ? 0.016 : depthM * 0.7;
  const heightM = Math.max(0.6, (selection.height ?? 105) / 100);
  const mp = frameMat(finishColor, selection.material);
  const hasHandrailOption = (selection.extraOptions ?? []).includes("handrail-glas");
  const showHandrail = selection.infill !== "glas" || hasHandrailOption;

  const handrailY = heightM + railH / 2;
  const baseRailY = 0.018;
  const levels = showHandrail ? [handrailY, baseRailY] : [baseRailY];

  const corner3D = { ...corner, direction: -corner.direction };
  const points = sampleRoundedCorner(corner3D, 16).map(planPointToWorld);
  if (points.length < 2) return null;

  // Corner vertex position in world space (for the corner post)
  const cornerWorld = planPointToWorld({ x: corner.x, y: corner.y });

  return (
    <group>
      {/* Corner post — hidden for spijlen (continuous look) */}
      {!isSpijlen && (
        <group position={[cornerWorld.x, heightM / 2, cornerWorld.z]}>
          <Post finishColor={finishColor} postH={heightM} postW={postW} postD={postD} material={selection.material} />
          <PostBase mounting={selection.mounting} finishColor={finishColor} postW={postW} postD={postD} postH={heightM} />
        </group>
      )}

      {/* Curved rail segments at each level */}
      {levels.map((y, levelIndex) => (
        points.slice(0, -1).map((point, index) => {
          const next = points[index + 1];
          const dx = next.x - point.x;
          const dz = next.z - point.z;
          const length = Math.hypot(dx, dz);
          if (length < 0.005) return null;

          const segH = levelIndex === 0 ? railH : 0.018;
          const segD = levelIndex === 0 ? railD : postD * 0.8;

          return (
            <mesh key={`${corner.vertexId}-${levelIndex}-${index}`}
              position={[(point.x + next.x) / 2, y, (point.z + next.z) / 2]}
              rotation={[0, Math.atan2(-dz, dx), 0]} castShadow receiveShadow>
              <boxGeometry args={[length + 0.002, segH, segD]} />
              <meshPhysicalMaterial {...mp} />
            </mesh>
          );
        })
      ))}
    </group>
  );
}

// ─── Concrete platform ────────────────────────────────────────────────────────

const FRONT_OVERHANG = 0.01;

function ConcreteBlock({ bbox, mounting }) {
  const w = mounting === "zijmontage" ? Math.max(bbox.width / 100, 0.30) : Math.max((bbox.width / 100) + 0.06, 0.50);
  const d = Math.max((bbox.height / 100) + 0.06, 0.70);
  const frontShift = mounting === "zijmontage" ? 0 : 0.05;
  const zFront = -(bbox.minY / 100) + frontShift;
  const cz = zFront - d / 2;
  const cx = (bbox.minX + bbox.maxX) / 200;

  return (
    <group>
      {/* Main body */}
      <mesh position={[cx, -PLATFORM_HEIGHT / 2, cz]} receiveShadow castShadow>
        <boxGeometry args={[w, PLATFORM_HEIGHT, d]} />
        <meshStandardMaterial color="#b8b0a5" roughness={0.95} metalness={0.01} />
      </mesh>
      {/* Polished top surface */}
      <mesh position={[cx, -0.001, cz]} receiveShadow>
        <boxGeometry args={[w - 0.002, 0.005, d - 0.002]} />
        <meshStandardMaterial color="#c8c1b6" roughness={0.82} metalness={0.02} />
      </mesh>
      {/* Front chamfer edge */}
      <mesh position={[cx, -0.004, cz + d / 2 - 0.004]}>
        <boxGeometry args={[w - 0.004, 0.008, 0.008]} />
        <meshStandardMaterial color="#a8a197" roughness={0.9} metalness={0.01} />
      </mesh>
    </group>
  );
}

const STEP_WIDTH = 0.85;

function StairFlightBlock({ segData }) {
  const rise = segData.rise ?? 0;
  if (Math.abs(rise) < 1) return null;

  const t = segmentToWorldTransform(segData);
  const riseM = rise / 100;
  const horizontalM = segData.length / 100;
  const nSteps = Math.max(Math.round(Math.abs(riseM) / 0.175), 2);
  const tread = horizontalM / nSteps;
  const stepH = riseM / nSteps;
  const floorY = riseM >= 0 ? -PLATFORM_HEIGHT : riseM - PLATFORM_HEIGHT;
  const stepCenterZ = -(STEP_WIDTH / 2 - FRONT_OVERHANG);

  return (
    <group position={[t.start.x, 0, t.start.z]} rotation={[0, t.yaw, 0]}>
      {Array.from({ length: nSteps }, (_, i) => {
        const treadTop = (i + 1) * stepH;
        const boxH = Math.abs(treadTop - floorY);
        const centerY = (treadTop + floorY) / 2;
        return (
          <group key={i}>
            <mesh position={[(i + 0.5) * tread, centerY, stepCenterZ]} receiveShadow castShadow>
              <boxGeometry args={[tread, boxH, STEP_WIDTH]} />
              <meshStandardMaterial color="#beb5aa" roughness={0.92} metalness={0.02} />
            </mesh>
            <mesh position={[(i + 1) * tread - 0.012, treadTop + 0.006, stepCenterZ]} receiveShadow>
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
  return <Html position={position} center occlude={false} zIndexRange={[100, 0]} style={{ pointerEvents: "none" }}><div className="dim3d dim3d__label">{text}</div></Html>;
}

function ArrowHead({ position, angle, color = "#D8C8A8", size = 0.08 }) {
  const wing = size * 0.52;
  const left = [position[0] - Math.cos(angle - Math.PI / 6) * wing, position[1], position[2] - Math.sin(angle - Math.PI / 6) * wing];
  const right = [position[0] - Math.cos(angle + Math.PI / 6) * wing, position[1], position[2] - Math.sin(angle + Math.PI / 6) * wing];
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
  const center = [(top[0] + bottom[0]) / 2, (top[1] + bottom[1]) / 2, (top[2] + bottom[2]) / 2];
  return (
    <group>
      <Line points={[bottom, top]} color={guideColor} lineWidth={1.35} transparent opacity={0.95} />
      <Line points={[[t.end.x, 0.02, t.end.z], bottom]} color={guideColor} lineWidth={1} dashed dashSize={0.03} gapSize={0.02} transparent opacity={0.7} />
      <Line points={[[t.end.x, t.end.y + 0.02, t.end.z], top]} color={guideColor} lineWidth={1} dashed dashSize={0.03} gapSize={0.02} transparent opacity={0.7} />
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
      <Line points={[[t.start.x, 0.04, t.start.z], start]} color={guideColor} lineWidth={1} dashed dashSize={0.04} gapSize={0.025} transparent opacity={0.75} />
      <Line points={[[t.end.x, t.end.y + 0.04, t.end.z], end]} color={guideColor} lineWidth={1} dashed dashSize={0.04} gapSize={0.025} transparent opacity={0.75} />
      <ArrowHead position={start} angle={angle} color={guideColor} />
      <ArrowHead position={end} angle={angle + Math.PI} color={guideColor} />
      <DimLabel position={[t.center.x, labelY, t.center.z]} text={`${lenCm} cm`} />
      {(seg.rise ?? 0) !== 0 && <VerticalRiseDimension seg={seg} />}
    </group>
  );
}

function DimensionAnnotationsWithArrows({ segments, heightM }) {
  if (!segments || segments.length === 0) return null;
  return <>{segments.map(seg => <SegmentDimension key={`dim-arrow-${seg.id}`} seg={seg} heightM={heightM} />)}</>;
}

function BoundingBoxDimensions({ bbox }) {
  if (!bbox || bbox.width <= 0.01 || bbox.height <= 0.01) return null;
  const minX = bbox.minX / 100, maxX = bbox.maxX / 100, minZ = -(bbox.maxY / 100), maxZ = -(bbox.minY / 100);
  const widthY = 0.12, depthY = 0.18, xDimZ = maxZ + 0.28, zDimX = minX - 0.26;
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

// ─── Scene internals ─────────────────────────────────────────────────────────

function SceneInner({ segments, roundedCorners, junctionPositions, selection, finishColor, bbox, showDimensions, qualityMode }) {
  const center = bboxCenterToWorld(bbox);
  const heightM = Math.max(0.6, (selection.height ?? 105) / 100);
  const sh = Math.max(Math.hypot(bbox.width, bbox.height) / 200 + 2.5, 4);
  const quality = QUALITY_PRESETS[qualityMode] ?? QUALITY_PRESETS.balanced;

  const floorY = useMemo(() => {
    const minRise = Math.min(0, ...segments.map(s => (s.rise ?? 0) / 100));
    return minRise - PLATFORM_HEIGHT - 0.001;
  }, [segments]);

  const flatBbox = useMemo(() => {
    const flat = segments.filter(s => Math.abs(s.rise ?? 0) < 1);
    if (flat.length === 0) return null;
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    for (const s of flat) {
      minX = Math.min(minX, s.start.x, s.end.x); maxX = Math.max(maxX, s.start.x, s.end.x);
      minY = Math.min(minY, s.start.y, s.end.y); maxY = Math.max(maxY, s.start.y, s.end.y);
    }
    return { minX, maxX, minY, maxY, width: maxX - minX, height: maxY - minY };
  }, [segments]);

  return (
    <>
      <color attach="background" args={["#f0ebe2"]} />
      <fog attach="fog" args={["#f0ebe2", 9, 26]} />
      <CameraFitter bbox={bbox} />

      <Environment preset="apartment" background={false} resolution={quality.envResolution} />

      {/* Sky / backdrop */}
      <mesh position={[center.x, 5, center.z - 7.5]}><planeGeometry args={[30, 15]} /><meshBasicMaterial color="#f5f0e8" /></mesh>

      {/* Studio lighting */}
      <ambientLight intensity={0.25} color="#F8F0E4" />
      <hemisphereLight intensity={0.45} color="#FFF8EE" groundColor="#7B8792" />

      <directionalLight intensity={3.0} position={[center.x + 5.5, 9.5, center.z + 4.2]} color="#FFF2E4" castShadow
        shadow-mapSize-width={quality.shadowMap} shadow-mapSize-height={quality.shadowMap}
        shadow-camera-near={0.5} shadow-camera-far={30}
        shadow-camera-left={-sh} shadow-camera-right={sh} shadow-camera-top={sh} shadow-camera-bottom={-sh}
        shadow-bias={-0.0008} shadow-normalBias={0.025} />

      <directionalLight intensity={1.0} position={[center.x - 5, 5.5, center.z + 3]} color="#D0E4F6" />
      <pointLight intensity={2.2} position={[center.x + 0.5, 3.5, center.z - 5.5]} color="#FFD9A6" decay={2} />
      <pointLight intensity={0.5} position={[center.x, 0.3, center.z + 1.5]} color="#E8E0D4" decay={2} />

      <ConcreteBlock bbox={flatBbox ?? bbox} mounting={selection.mounting} />

      {segments.filter(s => Math.abs(s.rise ?? 0) >= 1).map(s => (
        <StairFlightBlock key={`stair-${s.id}`} segData={s} />
      ))}

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, floorY, 0]}>
        <planeGeometry args={[30, 30]} />
        <meshStandardMaterial color="#d2cac0" roughness={0.92} metalness={0.02} />
      </mesh>

      <ContactShadows position={[center.x, floorY + 0.004, center.z]}
        scale={Math.max(6, Math.hypot(bbox.width, bbox.height) / 90)}
        blur={quality.contactBlur} opacity={0.3}
        far={qualityMode === "lightweight" ? 6 : 8}
        resolution={quality.shadowMap} color="#1f140d" />

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, floorY + 0.001, 0]} receiveShadow>
        <planeGeometry args={[40, 40]} /><shadowMaterial opacity={0.28} color="#1A0F08" />
      </mesh>

      <Grid position={[center.x, floorY + 0.002, center.z]} args={[40, 40]}
        cellSize={0.5} cellThickness={0.30} cellColor="#B8B0A8"
        sectionSize={1} sectionThickness={0.65} sectionColor="#9A9288"
        fadeDistance={quality.gridFade} fadeStrength={3.0} infiniteGrid />

      {segments.map(seg => (
        <RailSegment key={seg.id} segData={seg} selection={selection} finishColor={finishColor} />
      ))}

      {(selection.extraOptions ?? []).includes("zaokraglenia") && roundedCorners.map((corner) => (
        <RoundedCornerConnector key={corner.vertexId} corner={corner} selection={selection} finishColor={finishColor} />
      ))}

      {/* Corner caps — fill the gap above corner posts at every junction vertex */}
      {junctionPositions.map((pos, i) => (
        <CornerCap key={`cap-${i}`} position={pos} selection={selection} finishColor={finishColor} />
      ))}

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
      const candidate = { segId: seg.id, bias: dx - dy, length: seg.length };
      vertexOwners[raw.startId] = rankOwner(vertexOwners[raw.startId], candidate);
      vertexOwners[raw.endId] = rankOwner(vertexOwners[raw.endId], candidate);
    });
    return segments.map(seg => {
      const raw = geo.segments[seg.id];
      const startDegree = raw ? (vertexCount[raw.startId] || 0) : 0;
      const endDegree = raw ? (vertexCount[raw.endId] || 0) : 0;
      return {
        ...seg, startIsJunction: startDegree >= 2, endIsJunction: endDegree >= 2,
        showStartPost: raw ? startDegree <= 1 || vertexOwners[raw.startId]?.segId === seg.id : true,
        showEndPost: raw ? endDegree <= 1 || vertexOwners[raw.endId]?.segId === seg.id : true,
      };
    });
  }, [geo, segments]);

  // Find junction vertices (degree >= 2) and convert to world positions
  const junctionPositions = useMemo(() => {
    const vertexCount = {};
    Object.values(geo.segments).forEach(seg => {
      vertexCount[seg.startId] = (vertexCount[seg.startId] || 0) + 1;
      vertexCount[seg.endId]   = (vertexCount[seg.endId]   || 0) + 1;
    });
    const positions = [];
    const seen = new Set();
    Object.entries(vertexCount).forEach(([vid, count]) => {
      if (count >= 2 && !seen.has(vid) && geo.vertices[vid]) {
        seen.add(vid);
        const v = geo.vertices[vid];
        const world = planPointToWorld({ x: v.x, y: v.y });
        positions.push(world);
      }
    });
    return positions;
  }, [geo]);

  const initCam = useMemo(() => getCameraSetup(bbox), []); // eslint-disable-line

  if (enrichedSegments.length === 0) {
    return <div className="scene3d__empty"><p>Teken een balustrade in de 2D-planner om de 3D-preview te zien.</p></div>;
  }

  return (
    <Canvas dpr={quality.dpr} shadows gl={{ antialias: true }}>
      <color attach="background" args={["#EAE4D8"]} />
      <fog attach="fog" args={["#EAE4D8", 9, 24]} />
      <PerspectiveCamera makeDefault position={initCam.position} fov={28} />
      <Suspense fallback={null}>
        <SceneInner segments={enrichedSegments} roundedCorners={roundedCorners}
          junctionPositions={junctionPositions}
          selection={selection} finishColor={finishColor} bbox={bbox}
          showDimensions={showDimensions} qualityMode={qualityMode} />
      </Suspense>
    </Canvas>
  );
}

export default Scene3D;
