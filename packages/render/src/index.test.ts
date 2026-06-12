import { describe, expect, test } from "bun:test";
import type { CatalogItemDetail, RenderManifest } from "@grubcheck/domain";
import { composeEquippedLayers } from "./index";

const buildDetail = (
  slug: string,
  slot: NonNullable<CatalogItemDetail["item"]["slot"]>,
  layerOrder: number,
  suppressesSlots: RenderManifest["suppressesSlots"] = []
): CatalogItemDetail => ({
  item: {
    id: slug,
    slug,
    displayName: slug,
    baseTemplate: slug,
    itemKind: "wearable",
    renderTarget: "mannequin",
    slot,
    layerOrder,
    published: true,
    emissive: false,
    marketHashName: slug,
    latestPrice: null,
    priceUpdatedAt: null
  },
  renderManifest: {
    renderModelId: `${slug}-model`,
    slot,
    layerOrder,
    skeletonProfile: "grubcheck-humanoid-v1",
    bodyMasks: [],
    suppressesSlots,
    textureSet: {
      previewColor: "#ffffff"
    },
    emissiveEnabled: false
  },
  matchStatus: "matched",
  notes: []
});

describe("composeEquippedLayers", () => {
  test("keeps lower torso layers when no suppression exists", () => {
    const hoodie = buildDetail("hoodie", "torso", 15);
    const jacket = buildDetail("jacket", "torso", 30);

    const layers = composeEquippedLayers([hoodie, jacket]);

    expect(layers.map((layer) => layer.slug)).toEqual(["hoodie", "jacket"]);
  });

  test("hides suppressed lower slot layers", () => {
    const backpack = buildDetail("backpack", "back", 12);
    const jacket = buildDetail("jacket", "torso", 30, ["back"]);

    const layers = composeEquippedLayers([backpack, jacket]);

    expect(layers.map((layer) => layer.slug)).toEqual(["jacket"]);
  });
});

