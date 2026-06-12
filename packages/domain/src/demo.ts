import { biomePresets } from "./biomes";
import type {
  CatalogItem,
  CatalogItemDetail,
  InternalStatus,
  MatchReview,
  RenderManifest,
  SyncRun
} from "./schema";

const now = new Date().toISOString();

const mkPrice = (priceMinor: number, listings: number) => ({
  source: "steam" as const,
  currency: "EUR",
  priceMinor,
  listings,
  capturedAt: now
});

const mkManifest = (
  renderModelId: string,
  slot: RenderManifest["slot"],
  layerOrder: number,
  previewColor: string,
  options?: Partial<RenderManifest>
): RenderManifest => ({
  renderModelId,
  slot,
  layerOrder,
  skeletonProfile: "grubcheck-humanoid-v1",
  bodyMasks: [],
  suppressesSlots: [],
  textureSet: {
    previewColor
  },
  transform: {
    position: [0, 0, 0],
    rotation: [0, 0, 0],
    scale: [1, 1, 1]
  },
  emissiveEnabled: false,
  ...options
});

const item = (
  props: Omit<CatalogItem, "id" | "published" | "itemKind" | "renderTarget" | "priceUpdatedAt">
): CatalogItem => ({
  id: props.slug,
  published: true,
  itemKind: "wearable",
  renderTarget: "mannequin",
  priceUpdatedAt: now,
  ...props
});

export const demoCatalogItems: CatalogItem[] = [
  item({
    slug: "forest-raider-hoodie",
    displayName: "Forest Raider Hoodie",
    baseTemplate: "hoodie",
    slot: "torso",
    layerOrder: 15,
    emissive: false,
    marketHashName: "Forest Raider Hoodie",
    iconUrl:
      "https://community.fastly.steamstatic.com/economy/image/6TMcQ7eX6E0EZl2byXi7vaVKyDk_zQLX05x6eLCFM9neAckxGDf7qU2e2gu64OnAeQ7835Ja5WrAfCk4nReh8DEiv5ddOas5pLYwSPi8vYJTENQ/360fx360f",
    latestPrice: mkPrice(1249, 63)
  }),
  item({
    slug: "desert-stalker-jacket",
    displayName: "Desert Stalker Jacket",
    baseTemplate: "jacket",
    slot: "torso",
    layerOrder: 30,
    emissive: false,
    marketHashName: "Desert Stalker Jacket",
    iconUrl:
      "https://community.fastly.steamstatic.com/economy/image/6TMcQ7eX6E0EZl2byXi7vaVKyDk_zQLX05x6eLCFM9neAckxGDf7qU2e2gu64OnAeQ7835Ja5WrCfCk4nReh8DEiv5daOaE5qbQ_RPm5kDOs1J0/360fx360f",
    latestPrice: mkPrice(1885, 28)
  }),
  item({
    slug: "snowblind-pants",
    displayName: "Snowblind Pants",
    baseTemplate: "pants",
    slot: "legs",
    layerOrder: 18,
    emissive: false,
    marketHashName: "Snowblind Pants",
    iconUrl:
      "https://community.fastly.steamstatic.com/economy/image/6TMcQ7eX6E0EZl2byXi7vaVKyDk_zQLX05x6eLCFM9neAckxGDf7qU2e2gu64OnAeQ7835Ja5WrAfCk4nReh8DEiv5deMuo5qbZfSPitnD-81Y/360fx360f",
    latestPrice: mkPrice(825, 41)
  }),
  item({
    slug: "naval-camo-kilt",
    displayName: "Naval Camo Kilt",
    baseTemplate: "kilt",
    slot: "legs",
    layerOrder: 26,
    emissive: false,
    marketHashName: "Naval Camo Kilt",
    iconUrl:
      "https://community.fastly.steamstatic.com/economy/image/6TMcQ7eX6E0EZl2byXi7vaVKyDk_zQLX05x6eLCFM9neAckxGDf7qU2e2gu64OnAeQ7835Ja5WrAfCk4nReh8DEiv5daO6s5pLYwSPj2uIJfF/360fx360f",
    latestPrice: mkPrice(645, 57)
  }),
  item({
    slug: "no-mercy-balaclava",
    displayName: "No Mercy Balaclava",
    baseTemplate: "balaclava",
    slot: "face",
    layerOrder: 10,
    emissive: true,
    marketHashName: "No Mercy Balaclava",
    iconUrl:
      "https://community.fastly.steamstatic.com/economy/image/6TMcQ7eX6E0EZl2byXi7vaVKyDk_zQLX05x6eLCFM9neAckxGDf7qU2e2gu64OnAeQ7835Ja5WrAfCk4nReh8DEiv5dcPqs5pLYwSPiqtYFfFA/360fx360f",
    latestPrice: mkPrice(2120, 9)
  }),
  item({
    slug: "raider-boots",
    displayName: "Raider Boots",
    baseTemplate: "boots",
    slot: "feet",
    layerOrder: 20,
    emissive: false,
    marketHashName: "Raider Boots",
    iconUrl:
      "https://community.fastly.steamstatic.com/economy/image/6TMcQ7eX6E0EZl2byXi7vaVKyDk_zQLX05x6eLCFM9neAckxGDf7qU2e2gu64OnAeQ7835Ja5WrAfCk4nReh8DEiv5dcOqs5pLYwSPi7v4ZTFQ/360fx360f",
    latestPrice: mkPrice(905, 34)
  })
];

const manifests = new Map<string, RenderManifest>([
  [
    "forest-raider-hoodie",
    mkManifest("hoodie-shell-v1", "torso", 15, "#5b7a46", {
      bodyMasks: ["torso_base"],
      textureSet: {
        previewColor: "#5b7a46"
      }
    })
  ],
  [
    "desert-stalker-jacket",
    mkManifest("jacket-shell-v1", "torso", 30, "#9d7a43", {
      bodyMasks: ["torso_base"],
      suppressesSlots: ["back"]
    })
  ],
  [
    "snowblind-pants",
    mkManifest("pants-shell-v1", "legs", 18, "#d4dde4", {
      bodyMasks: ["legs_base"]
    })
  ],
  [
    "naval-camo-kilt",
    mkManifest("kilt-shell-v1", "legs", 26, "#30506b", {
      bodyMasks: ["legs_base"],
      suppressesSlots: ["back"]
    })
  ],
  [
    "no-mercy-balaclava",
    mkManifest("balaclava-shell-v1", "face", 10, "#c9d0d6", {
      emissiveEnabled: true,
      textureSet: {
        previewColor: "#c9d0d6",
        emissiveUrl: "/emissive/no-mercy-balaclava.png"
      }
    })
  ],
  [
    "raider-boots",
    mkManifest("boots-shell-v1", "feet", 20, "#54402d")
  ]
]);

export const demoCatalogDetails: CatalogItemDetail[] = demoCatalogItems.map((catalogItem) => ({
  item: catalogItem,
  renderManifest: manifests.get(catalogItem.slug) ?? null,
  matchStatus: manifests.has(catalogItem.slug) ? "matched" : "review",
  notes: manifests.has(catalogItem.slug)
    ? ["Procedural demo render active until imported Rust assets are available."]
    : ["No render manifest attached yet."]
}));

export const demoSyncRuns: SyncRun[] = [
  {
    id: "steam-market-run-demo",
    job: "steam_market_catalog",
    status: "succeeded",
    cursor: 5160,
    stats: {
      pagesFetched: 517,
      itemsFetched: 5164,
      wearableCandidates: 1268
    },
    startedAt: now,
    finishedAt: now,
    errorMessage: null
  },
  {
    id: "asset-match-run-demo",
    job: "asset_match",
    status: "running",
    cursor: 42,
    stats: {
      matched: 18,
      review: 5
    },
    startedAt: now,
    finishedAt: null,
    errorMessage: null
  }
];

export const demoMatchReviews: MatchReview[] = [
  {
    id: "review-naval-camo-kilt",
    marketHashName: "Naval Camo Kilt",
    reason: "Multiple candidate texture folders matched the same normalized label.",
    confidence: 0.58,
    createdAt: now
  }
];

export const demoInternalStatus: InternalStatus = {
  recentRuns: demoSyncRuns,
  matchReviews: demoMatchReviews,
  unpublishedWearables: 1244,
  failedImports: 0
};

export const demoBiomes = biomePresets;
