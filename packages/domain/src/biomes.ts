import type { BiomePreset } from "./schema";

export const biomePresets: BiomePreset[] = [
  {
    key: "neutral",
    label: "Neutral Studio",
    description: "Balanced key light for judging palette and material contrast.",
    lightRig: {
      ambientIntensity: 1.4,
      directionalIntensity: 1.8,
      directionalPosition: [5, 8, 5],
      hemisphereSky: "#f1e6d3",
      hemisphereGround: "#463a33"
    },
    background: {
      top: "#ede3d4",
      bottom: "#9b7755",
      accent: "#f5c27a",
      fog: "#e5c9a8"
    },
    camera: {
      position: [0, 1.6, 4.4],
      target: [0, 1.25, 0],
      fov: 34
    }
  },
  {
    key: "forest",
    label: "Forest",
    description: "Green-heavy woodland lighting with cool shade and warm sun bleed.",
    lightRig: {
      ambientIntensity: 0.95,
      directionalIntensity: 1.7,
      directionalPosition: [4, 7, 2],
      hemisphereSky: "#9ccf99",
      hemisphereGround: "#21311e"
    },
    background: {
      top: "#466b42",
      bottom: "#101d12",
      accent: "#c5aa63",
      fog: "#547f4e"
    },
    camera: {
      position: [0, 1.7, 4.6],
      target: [0, 1.25, 0],
      fov: 36
    }
  },
  {
    key: "desert",
    label: "Desert",
    description: "Harsh high-angle sun tuned for sand, dust, and dry shadows.",
    lightRig: {
      ambientIntensity: 1.05,
      directionalIntensity: 2.1,
      directionalPosition: [6, 9, 3],
      hemisphereSky: "#f7d7a6",
      hemisphereGround: "#6b4524"
    },
    background: {
      top: "#e6bb72",
      bottom: "#6a4320",
      accent: "#ffe0a1",
      fog: "#c78f46"
    },
    camera: {
      position: [0, 1.75, 4.9],
      target: [0, 1.2, 0],
      fov: 36
    }
  },
  {
    key: "snow",
    label: "Snow",
    description: "Cold overcast light with icy bounce for arctic kit checks.",
    lightRig: {
      ambientIntensity: 1.3,
      directionalIntensity: 1.45,
      directionalPosition: [3, 8, 4],
      hemisphereSky: "#dbedff",
      hemisphereGround: "#6b7d93"
    },
    background: {
      top: "#cbe4f7",
      bottom: "#6b86a5",
      accent: "#ffffff",
      fog: "#c3d7e7"
    },
    camera: {
      position: [0, 1.6, 4.7],
      target: [0, 1.2, 0],
      fov: 35
    }
  }
];

export const biomeMap = Object.fromEntries(
  biomePresets.map((biome) => [biome.key, biome] as const)
) as Record<BiomePreset["key"], BiomePreset>;
