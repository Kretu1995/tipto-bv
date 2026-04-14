import { Canvas } from "@react-three/fiber";
import { ContactShadows, OrbitControls, PerspectiveCamera } from "@react-three/drei";
import { useMemo } from "react";

/** Clamp a value between min and max. */
function clamp(val, min, max) {
  return Math.max(min, Math.min(max, val));
}

/** Count posts for a given rail length (in metres). */
function postCount(lengthM, style) {
  const density = style === "architect" ? 1.2 : 1.4;
  return clamp(Math.round(lengthM * density), 2, 7);
}

/**
 * Materials used throughout the model.
 * Color comes from the selected finish hex; texture variant from material type.
 */
function useFrameMaterial(finishColor, material) {
  return useMemo(() => {
    const isRvs = material === "rvs";
    return {
      color: finishColor,
      metalness: isRvs ? 0.92 : 0.78,
      roughness: isRvs ? 0.18 : 0.32,
    };
  }, [finishColor, material]);
}

/**
 * Glazen vulling – glas paneel + glashouder-klemmen op elke paal.
 * Gebaseerd op de echte Tipto glasbalustradeproducten met vierkante klemmen.
 */
function GlassInfill({ railLength, panelHeight, postPositions, finishColor, frameProp }) {
  return (
    <group>
      {/* Glass panel */}
      <mesh position={[0, panelHeight / 2 + 0.02, 0]}>
        <boxGeometry args={[railLength - 0.08, panelHeight, 0.012]} />
        <meshPhysicalMaterial
          color="#cce0ee"
          transmission={0.88}
          roughness={0.05}
          metalness={0}
          ior={1.5}
          transparent
          opacity={0.82}
        />
      </mesh>

      {/* Glass clamps (klemmen) at each post */}
      {postPositions.map((x, i) => (
        <group key={`clamp-${i}`} position={[x, panelHeight * 0.25, 0]}>
          {/* Front clamp */}
          <mesh position={[0, 0, 0.018]} castShadow>
            <boxGeometry args={[frameProp.postW * 1.3, 0.055, 0.022]} />
            <meshStandardMaterial color={finishColor} metalness={0.78} roughness={0.28} />
          </mesh>
          {/* Back clamp */}
          <mesh position={[0, 0, -0.018]} castShadow>
            <boxGeometry args={[frameProp.postW * 1.3, 0.055, 0.022]} />
            <meshStandardMaterial color={finishColor} metalness={0.78} roughness={0.28} />
          </mesh>
          {/* Upper clamp set */}
          <mesh position={[0, panelHeight * 0.35, 0.018]} castShadow>
            <boxGeometry args={[frameProp.postW * 1.3, 0.055, 0.022]} />
            <meshStandardMaterial color={finishColor} metalness={0.78} roughness={0.28} />
          </mesh>
          <mesh position={[0, panelHeight * 0.35, -0.018]} castShadow>
            <boxGeometry args={[frameProp.postW * 1.3, 0.055, 0.022]} />
            <meshStandardMaterial color={finishColor} metalness={0.78} roughness={0.28} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

/**
 * Frameless glas (minimal stijl) – enkel U-profiel aan de basis, geen verticale palen.
 * Gebaseerd op de Tipto terrasfoto met volledig frameless systeem.
 */
function FramelessGlass({ railLength, panelHeight }) {
  return (
    <group>
      {/* Glass panel only for frameless layout */}
      <mesh position={[0, panelHeight / 2 + 0.04, 0]}>
        <boxGeometry args={[railLength - 0.04, panelHeight, 0.012]} />
        <meshPhysicalMaterial
          color="#cce0ee"
          transmission={0.92}
          roughness={0.04}
          metalness={0}
          ior={1.5}
          transparent
          opacity={0.78}
        />
      </mesh>
    </group>
  );
}

/**
 * Verticale spijlen – slanke rechthoekige profielen.
 * Gebaseerd op de Tipto aluminium balkonbalustradeproducten (zwart).
 */
function VerticalSpijlen({ railLength, panelHeight, finishColor, material }) {
  const matProps = useFrameMaterial(finishColor, material);
  const slatCount = clamp(Math.round(railLength * 4.8), 5, 28);
  const spacing   = railLength / (slatCount + 1);
  const slatW     = 0.016;
  const slatD     = 0.012;

  return (
    <group>
      {/* Bottom horizontal rail */}
      <mesh position={[0, 0.06, 0]} castShadow receiveShadow>
        <boxGeometry args={[railLength, 0.035, slatD * 2.5]} />
        <meshStandardMaterial {...matProps} />
      </mesh>

      {/* Spijlen */}
      {Array.from({ length: slatCount }, (_, i) => {
        const x = -railLength / 2 + spacing * (i + 1);
        return (
          <mesh key={i} position={[x, panelHeight / 2 + 0.06, 0]} castShadow receiveShadow>
            <boxGeometry args={[slatW, panelHeight, slatD]} />
            <meshStandardMaterial {...matProps} />
          </mesh>
        );
      })}
    </group>
  );
}

/**
 * Horizontale profielen – voor RVS (ronde buizen) of aluminium (vlakke profielen).
 * Gebaseerd op de Tipto RVS-producten met ronde horizontale buizen.
 */
function HorizontaleProfielen({ railLength, panelHeight, finishColor, material }) {
  const matProps  = useFrameMaterial(finishColor, material);
  const isRvs     = material === "rvs";
  const rowCount  = 4;
  const vertGap   = panelHeight / (rowCount + 1);
  const tubeH     = isRvs ? 0.016 : 0.014;
  const tubeD     = isRvs ? 0.016 : 0.010;

  return (
    <group>
      {Array.from({ length: rowCount }, (_, i) => (
        <mesh key={i} position={[0, vertGap * (i + 1), 0]} castShadow receiveShadow>
          <boxGeometry args={[railLength - 0.10, tubeH, tubeD]} />
          <meshStandardMaterial {...matProps} />
        </mesh>
      ))}
    </group>
  );
}

/**
 * Lamellen – bredere vlakke lamellen, architecturale privacy.
 */
function Lamellen({ railLength, panelHeight, finishColor, material }) {
  const matProps  = useFrameMaterial(finishColor, material);
  const count     = clamp(Math.round(railLength * 2.8), 4, 16);
  const spacing   = railLength / (count + 1);
  const lamelW    = 0.048;
  const lamelD    = 0.010;

  return (
    <group>
      {Array.from({ length: count }, (_, i) => (
        <mesh
          key={i}
          position={[-railLength / 2 + spacing * (i + 1), panelHeight / 2, 0]}
          castShadow
          receiveShadow
        >
          <boxGeometry args={[lamelW, panelHeight - 0.02, lamelD]} />
          <meshStandardMaterial {...matProps} />
        </mesh>
      ))}
    </group>
  );
}

/**
 * Infill switch – distributes to the right component.
 */
function Infill({ selection, finishColor, panelHeight, railLength, postPositions, frameProp, isFrameless }) {
  if (isFrameless && selection.infill === "glas") {
    return <FramelessGlass railLength={railLength} panelHeight={panelHeight} />;
  }

  if (selection.infill === "glas") {
    return (
      <GlassInfill
        railLength={railLength}
        panelHeight={panelHeight}
        postPositions={postPositions}
        finishColor={finishColor}
        frameProp={frameProp}
      />
    );
  }

  if (selection.infill === "verticale-spijlen") {
    return (
      <VerticalSpijlen
        railLength={railLength}
        panelHeight={panelHeight}
        finishColor={finishColor}
        material={selection.material}
      />
    );
  }

  if (selection.infill === "horizontale-profielen") {
    return (
      <HorizontaleProfielen
        railLength={railLength}
        panelHeight={panelHeight}
        finishColor={finishColor}
        material={selection.material}
      />
    );
  }

  if (selection.infill === "lamellen") {
    return (
      <Lamellen
        railLength={railLength}
        panelHeight={panelHeight}
        finishColor={finishColor}
        material={selection.material}
      />
    );
  }

  return null;
}

/**
 * Post geometry switch – round for RVS, square for aluminium/gepoedercoat staal.
 * Based on observed products: Tipto uses round stainless posts, square aluminum posts.
 */
function Post({ isRvs, finishColor, postH, postW, postD, mountOffset, style }) {
  const matProps = {
    color: finishColor,
    metalness: isRvs ? 0.92 : 0.78,
    roughness: isRvs ? 0.18 : 0.32,
  };

  return (
    <group>
      {/* Shaft */}
      <mesh position={[0, mountOffset, 0]} castShadow receiveShadow>
        {isRvs ? (
          <cylinderGeometry args={[postW / 2, postW / 2, postH, 16]} />
        ) : (
          <boxGeometry args={[postW, postH, postD]} />
        )}
        <meshStandardMaterial {...matProps} />
      </mesh>

      {/* Ball cap on RVS posts */}
      {isRvs && (
        <mesh position={[0, mountOffset + postH / 2 + postW * 0.5, 0]} castShadow>
          <sphereGeometry args={[postW * 0.62, 16, 16]} />
          <meshStandardMaterial {...matProps} />
        </mesh>
      )}

      {/* Design style: decorative collar */}
      {!isRvs && style === "architect" && (
        <mesh position={[0, mountOffset + postH / 2 - 0.04, 0]} castShadow>
          <boxGeometry args={[postW * 1.18, 0.025, postD * 1.18]} />
          <meshStandardMaterial {...matProps} />
        </mesh>
      )}
    </group>
  );
}

/**
 * Base / mount for a post.
 * Floor mount: square base plate with bolt heads.
 * Side mount: L-bracket bracket.
 */
function PostBase({ mounting, finishColor, postW, postD, postH }) {
  if (mounting === "zijmontage") {
    return (
      <mesh position={[0, -postH / 2 + 0.06, -postD * 0.55]} castShadow receiveShadow>
        <boxGeometry args={[postW * 1.5, 0.16, 0.028]} />
        <meshStandardMaterial color="#6B7078" metalness={0.65} roughness={0.42} />
      </mesh>
    );
  }

  return (
    <group position={[0, -postH / 2 + 0.008, 0]}>
      {/* Flat base plate */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[postW * 2.2, 0.016, postD * 2.2]} />
        <meshStandardMaterial color="#6B7078" metalness={0.65} roughness={0.42} />
      </mesh>
      {/* Bolt heads (four corners) */}
      {[[-1, -1], [-1, 1], [1, -1], [1, 1]].map(([sx, sz], i) => (
        <mesh key={i} position={[sx * postW * 0.72, 0.012, sz * postD * 0.72]} castShadow>
          <cylinderGeometry args={[0.006, 0.006, 0.012, 6]} />
          <meshStandardMaterial color="#888" metalness={0.7} roughness={0.4} />
        </mesh>
      ))}
    </group>
  );
}

/**
 * Main railing model. Assembles posts, top rail and infill.
 */
function RailingModel({ selection, finish }) {
  const lengthM   = Math.max(0.5, selection.length / 100);
  const heightM   = Math.max(0.8, selection.height / 100);
  const depthM    = Math.max(0.04, selection.depth / 100);
  const finishColor = finish?.hex ?? "#22262B";
  const isRvs     = selection.material === "rvs";
  const style     = selection.railingStyle;

  // Frameless: minimal style + glass infill
  const isFrameless = style === "minimal" && selection.infill === "glas";

  // Post dimensions
  const postW  = style === "architect" ? 0.046 : 0.036;
  const postD  = depthM * 0.72;
  const postH  = heightM;

  // Top rail dimensions (rectangular profile like real products)
  const railH = style === "architect" ? 0.055 : 0.038;
  const railD = style === "architect" ? depthM * 0.85 : depthM * 0.7;
  const innerSpan = Math.max(0.12, lengthM - postW);

  // Posts
  const nPosts  = isFrameless ? 0 : postCount(lengthM, style);
  const postGap = nPosts > 1 ? lengthM / (nPosts - 1) : 0;
  const postPositions = Array.from({ length: nPosts }, (_, i) =>
    -lengthM / 2 + postGap * i
  );

  const panelHeight = Math.max(0.42, heightM - railH - 0.05);

  const matProps = {
    color: finishColor,
    metalness: isRvs ? 0.92 : 0.78,
    roughness: isRvs ? 0.18 : 0.32,
  };

  // Design style: diagonal pattern instead of standard infill
  const isDesign = style === "design";

  return (
    <group>
      {/* Ground shadow plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow position={[0, -0.001, 0]}>
        <planeGeometry args={[8, 8]} />
        <shadowMaterial opacity={0.14} />
      </mesh>

      {/* Top rail */}
      {!isFrameless && (
        <mesh position={[0, heightM + railH / 2, 0]} castShadow receiveShadow>
          <boxGeometry args={[innerSpan, railH, railD]} />
          <meshStandardMaterial {...matProps} />
        </mesh>
      )}

      {/* Posts */}
      {postPositions.map((x, i) => (
        <group key={i} position={[x, postH / 2, 0]}>
          <Post
            isRvs={isRvs}
            finishColor={finishColor}
            postH={postH}
            postW={postW}
            postD={postD}
            mountOffset={0}
            style={style}
          />
          <PostBase
            mounting={selection.mounting}
            finishColor={finishColor}
            postW={postW}
            postD={postD}
            postH={postH}
          />
        </group>
      ))}

      {/* Infill */}
      {!isDesign ? (
        <Infill
          selection={selection}
          finishColor={finishColor}
          panelHeight={panelHeight}
          railLength={innerSpan}
          postPositions={postPositions}
          frameProp={{ postW, postD }}
          isFrameless={isFrameless}
        />
      ) : (
        <DesignFill
          railLength={innerSpan}
          panelHeight={panelHeight}
          finishColor={finishColor}
        />
      )}
    </group>
  );
}

/**
 * Design vulling – geometrisch diagonaal patroon.
 * Gebaseerd op de Tipto designbalustrade met kruisende diagonale staven.
 */
function DesignFill({ railLength, panelHeight, finishColor }) {
  const barW = 0.014;
  const barD = 0.010;
  const matProps = { color: finishColor, metalness: 0.78, roughness: 0.32 };

  // Diagonal bars at ~45° and ~-45° crossing pattern
  const count = Math.max(3, Math.round(railLength * 2));

  return (
    <group>
      {/* Top horizontal frame */}
      <mesh position={[0, panelHeight + 0.02, 0]} castShadow>
        <boxGeometry args={[railLength, barW * 1.5, barD]} />
        <meshStandardMaterial {...matProps} />
      </mesh>
      {/* Bottom horizontal frame */}
      <mesh position={[0, 0.018, 0]} castShadow>
        <boxGeometry args={[railLength, barW * 1.5, barD]} />
        <meshStandardMaterial {...matProps} />
      </mesh>

      {/* Diagonal bars */}
      {Array.from({ length: count }, (_, i) => {
        const spacing = railLength / count;
        const x = -railLength / 2 + spacing * i + spacing / 2;
        const angle = i % 2 === 0 ? Math.PI / 4 : -Math.PI / 4;
        const diagLen = Math.sqrt(railLength / count ** 2 + panelHeight ** 2) * 1.4;

        return (
          <mesh
            key={i}
            position={[x, panelHeight / 2, 0]}
            rotation={[0, 0, angle]}
            castShadow
          >
            <boxGeometry args={[barW, diagLen, barD]} />
            <meshStandardMaterial {...matProps} />
          </mesh>
        );
      })}
    </group>
  );
}

function RailingScene({ finish, selection }) {
  const cameraPos = selection.mounting === "zijmontage" ? [3.0, 1.8, 3.0] : [2.8, 1.6, 2.6];

  return (
    <Canvas dpr={[1, 1.75]} shadows gl={{ antialias: true, alpha: true }}>
      <color attach="background" args={["#F5F1E8"]} />
      <fog attach="fog" args={["#F5F1E8", 5, 9]} />
      <PerspectiveCamera makeDefault position={cameraPos} fov={34} />
      <ambientLight intensity={0.65} />
      <hemisphereLight intensity={0.4} color="#FFFFFF" groundColor="#C7B89B" />
      <directionalLight
        intensity={1.6}
        position={[3.5, 5, 3]}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-near={0.5}
        shadow-camera-far={14}
        shadow-camera-left={-4}
        shadow-camera-right={4}
        shadow-camera-top={4}
        shadow-camera-bottom={-4}
      />
      <spotLight intensity={0.5} position={[-2.5, 3.5, 1.5]} angle={0.4} penumbra={0.6} />
      <RailingModel selection={selection} finish={finish} />
      <ContactShadows position={[0, 0, 0]} opacity={0.28} blur={2.0} scale={6} far={3.5} />
      <OrbitControls
        enablePan={false}
        maxPolarAngle={Math.PI / 2.1}
        minDistance={2}
        maxDistance={5.5}
      />
    </Canvas>
  );
}

export default RailingScene;
