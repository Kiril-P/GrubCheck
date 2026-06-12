"use client";

import type { BiomeKey, BiomePreset, CatalogItemDetail } from "@grubcheck/domain";
import { composeEquippedLayers, layerScale, slotColorFallback } from "@grubcheck/render";
import { Canvas } from "@react-three/fiber";
import { Clone, OrbitControls, useGLTF } from "@react-three/drei";
import { Suspense, useMemo } from "react";

const mannequinGlbUrl = process.env.NEXT_PUBLIC_MANNEQUIN_GLB_URL ?? "";

const AssetMesh = ({
  glbUrl,
  transform
}: {
  glbUrl: string;
  transform?: {
    position: [number, number, number];
    rotation: [number, number, number];
    scale: [number, number, number];
  } | undefined;
}) => {
  const asset = useGLTF(glbUrl);

  return (
    <group
      position={transform?.position ?? [0, 0, 0]}
      rotation={transform?.rotation ?? [0, 0, 0]}
      scale={transform?.scale ?? [1, 1, 1]}
    >
      <Clone object={asset.scene} />
    </group>
  );
};

const SlotLayer = ({
  slot,
  layerOrder,
  color,
  emissive,
  glbUrl,
  transform
}: {
  slot: CatalogItemDetail["item"]["slot"];
  layerOrder: number;
  color: string;
  emissive: boolean;
  glbUrl?: string | undefined;
  transform?: {
    position: [number, number, number];
    rotation: [number, number, number];
    scale: [number, number, number];
  } | undefined;
}) => {
  const scale = layerScale(layerOrder);

  if (!slot) {
    return null;
  }

  if (glbUrl) {
    return <AssetMesh glbUrl={glbUrl} transform={transform} />;
  }

  const materialProps = emissive
    ? {
        color,
        emissive: color,
        emissiveIntensity: 0.5,
        metalness: 0.15,
        roughness: 0.52
      }
    : {
        color,
        metalness: 0.1,
        roughness: 0.75
      };

  const commonScale: [number, number, number] = [scale, scale, scale];

  switch (slot) {
    case "head":
      return (
        <mesh position={[0, 2.18, 0]} scale={commonScale}>
          <sphereGeometry args={[0.38, 32, 32]} />
          <meshStandardMaterial {...materialProps} />
        </mesh>
      );
    case "face":
      return (
        <mesh position={[0, 2.03, 0.22]} rotation={[0.2, 0, 0]} scale={commonScale}>
          <boxGeometry args={[0.6, 0.32, 0.18]} />
          <meshStandardMaterial {...materialProps} />
        </mesh>
      );
    case "torso":
      return (
        <mesh position={[0, 1.38, 0]} scale={commonScale}>
          <cylinderGeometry args={[0.55, 0.48, 1.08, 32]} />
          <meshStandardMaterial {...materialProps} />
        </mesh>
      );
    case "hands":
      return (
        <group scale={commonScale}>
          <mesh position={[-0.92, 1.2, 0]}>
            <boxGeometry args={[0.18, 0.6, 0.18]} />
            <meshStandardMaterial {...materialProps} />
          </mesh>
          <mesh position={[0.92, 1.2, 0]}>
            <boxGeometry args={[0.18, 0.6, 0.18]} />
            <meshStandardMaterial {...materialProps} />
          </mesh>
        </group>
      );
    case "legs":
      return (
        <group scale={commonScale}>
          <mesh position={[-0.24, 0.44, 0]}>
            <boxGeometry args={[0.34, 0.92, 0.34]} />
            <meshStandardMaterial {...materialProps} />
          </mesh>
          <mesh position={[0.24, 0.44, 0]}>
            <boxGeometry args={[0.34, 0.92, 0.34]} />
            <meshStandardMaterial {...materialProps} />
          </mesh>
        </group>
      );
    case "feet":
      return (
        <group scale={commonScale}>
          <mesh position={[-0.24, -0.15, 0.1]}>
            <boxGeometry args={[0.36, 0.16, 0.75]} />
            <meshStandardMaterial {...materialProps} />
          </mesh>
          <mesh position={[0.24, -0.15, 0.1]}>
            <boxGeometry args={[0.36, 0.16, 0.75]} />
            <meshStandardMaterial {...materialProps} />
          </mesh>
        </group>
      );
    case "back":
      return (
        <mesh position={[0, 1.3, -0.42]} scale={commonScale}>
          <boxGeometry args={[0.62, 0.82, 0.24]} />
          <meshStandardMaterial {...materialProps} />
        </mesh>
      );
  }
};

const ProceduralMannequin = () => (
  <group>
    <mesh position={[0, 2.15, 0]}>
      <sphereGeometry args={[0.32, 32, 32]} />
      <meshStandardMaterial color="#d1b18c" roughness={0.82} />
    </mesh>
    <mesh position={[0, 1.35, 0]}>
      <cylinderGeometry args={[0.48, 0.34, 1, 32]} />
      <meshStandardMaterial color="#c59c78" roughness={0.88} />
    </mesh>
    <mesh position={[0, 0.35, 0]}>
      <boxGeometry args={[0.72, 0.48, 0.34]} />
      <meshStandardMaterial color="#b58766" roughness={0.9} />
    </mesh>
    <mesh position={[-0.7, 1.35, 0]} rotation={[0, 0, 0.16]}>
      <boxGeometry args={[0.22, 1.08, 0.22]} />
      <meshStandardMaterial color="#caa07d" roughness={0.88} />
    </mesh>
    <mesh position={[0.7, 1.35, 0]} rotation={[0, 0, -0.16]}>
      <boxGeometry args={[0.22, 1.08, 0.22]} />
      <meshStandardMaterial color="#caa07d" roughness={0.88} />
    </mesh>
    <mesh position={[-0.22, 0.38, 0]}>
      <boxGeometry args={[0.26, 1.18, 0.26]} />
      <meshStandardMaterial color="#bf9470" roughness={0.9} />
    </mesh>
    <mesh position={[0.22, 0.38, 0]}>
      <boxGeometry args={[0.26, 1.18, 0.26]} />
      <meshStandardMaterial color="#bf9470" roughness={0.9} />
    </mesh>
  </group>
);

const BaseMannequin = () =>
  mannequinGlbUrl ? <AssetMesh glbUrl={mannequinGlbUrl} /> : <ProceduralMannequin />;

const ViewerScene = ({
  biome,
  equippedItems
}: {
  biome: BiomePreset;
  equippedItems: CatalogItemDetail[];
}) => {
  const layers = useMemo(() => composeEquippedLayers(equippedItems), [equippedItems]);

  return (
    <>
      <color attach="background" args={[biome.background.bottom]} />
      <fog attach="fog" args={[biome.background.fog, 6, 11]} />
      <ambientLight intensity={biome.lightRig.ambientIntensity} color={biome.lightRig.hemisphereSky} />
      <directionalLight
        intensity={biome.lightRig.directionalIntensity}
        position={biome.lightRig.directionalPosition}
        color={biome.background.accent}
        castShadow
      />
      <hemisphereLight
        intensity={0.55}
        color={biome.lightRig.hemisphereSky}
        groundColor={biome.lightRig.hemisphereGround}
      />
      <Suspense fallback={<ProceduralMannequin />}>
        <BaseMannequin />
        {layers.map((layer) => (
          <SlotLayer
            key={layer.slug}
            slot={layer.slot}
            layerOrder={layer.layerOrder}
            color={layer.textureSet.previewColor ?? slotColorFallback(layer.slot)}
            emissive={layer.emissiveEnabled}
            glbUrl={layer.glbUrl}
            transform={layer.transform}
          />
        ))}
      </Suspense>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.48, 0]}>
        <circleGeometry args={[3.8, 48]} />
        <meshStandardMaterial color={biome.background.top} roughness={1} />
      </mesh>
      <OrbitControls
        enablePan={false}
        minDistance={3}
        maxDistance={6}
        minPolarAngle={Math.PI / 2.6}
        maxPolarAngle={Math.PI / 1.9}
        target={biome.camera.target}
      />
    </>
  );
};

export const MannequinViewer = ({
  equippedItems,
  biomeKey,
  biomeMap,
  title,
  caption
}: {
  equippedItems: CatalogItemDetail[];
  biomeKey: BiomeKey;
  biomeMap: Record<BiomeKey, BiomePreset>;
  title?: string;
  caption?: string;
}) => {
  const biome = biomeMap[biomeKey];

  return (
    <section className="viewer-shell">
      <div className="viewer-copy">
        <div>
          <p className="eyebrow">Preview Rig</p>
          <h2>{title ?? biome.label}</h2>
        </div>
        <p>
          {caption ?? biome.description}{" "}
          {mannequinGlbUrl
            ? "Real mannequin asset mode is active."
            : "Procedural fallback is active until a real Rust mannequin GLB is provided."}
        </p>
      </div>
      <div className="viewer-canvas">
        <Canvas camera={{ position: biome.camera.position, fov: biome.camera.fov }}>
          <ViewerScene biome={biome} equippedItems={equippedItems} />
        </Canvas>
      </div>
    </section>
  );
};
