import type { CatalogItemDetail, EquipSlot, RenderManifest } from "@grubcheck/domain";

export type LayeredRenderManifest = RenderManifest & {
  slug: string;
  displayName: string;
  hidden: boolean;
};

type SlotState = Record<EquipSlot, boolean>;

const initialSlotState = (): SlotState => ({
  head: true,
  face: true,
  torso: true,
  hands: true,
  legs: true,
  feet: true,
  back: true
});

export const composeEquippedLayers = (items: CatalogItemDetail[]) => {
  const layers = items
    .filter((item) => item.renderManifest)
    .sort((left, right) => (left.renderManifest?.layerOrder ?? 0) - (right.renderManifest?.layerOrder ?? 0))
    .map((item) => item.renderManifest!);

  const visibleSlots = initialSlotState();

  layers.forEach((layer, index) => {
    const hiddenByHigherLayer = layers.some(
      (candidate, candidateIndex) =>
        candidateIndex > index && candidate.suppressesSlots.includes(layer.slot)
    );

    if (hiddenByHigherLayer) {
      visibleSlots[layer.slot] = false;
    }
  });

  return items
    .filter((item) => item.renderManifest)
    .sort((left, right) => (left.renderManifest?.layerOrder ?? 0) - (right.renderManifest?.layerOrder ?? 0))
    .map((item) => {
      const renderManifest = item.renderManifest!;
      const hidden = !visibleSlots[renderManifest.slot];

      return {
        ...renderManifest,
        slug: item.item.slug,
        displayName: item.item.displayName,
        hidden
      } satisfies LayeredRenderManifest;
    })
    .filter((layer) => !layer.hidden);
};

export const layerScale = (layerOrder: number) => 1 + layerOrder * 0.0035;

export const slotColorFallback = (slot: EquipSlot) =>
  ({
    head: "#826b58",
    face: "#6d5c4b",
    torso: "#8a7867",
    hands: "#7d6858",
    legs: "#726556",
    feet: "#5d5045",
    back: "#5a493a"
  })[slot];
