export * from "./importRustWearables";
export * from "./matchWearableAssets";
export * from "./snapshotSteamPrices";
export * from "./syncSteamMarketCatalog";

import { importRustWearables } from "./importRustWearables";
import { matchWearableAssets } from "./matchWearableAssets";
import { snapshotSteamPrices } from "./snapshotSteamPrices";
import { syncSteamMarketCatalog } from "./syncSteamMarketCatalog";

export const syncAssets = async () => {
  const imported = await importRustWearables();
  const matched = await matchWearableAssets();

  return {
    imported,
    matched
  };
};

export const runFullPipeline = async () => {
  const steam = await syncSteamMarketCatalog();
  const assets = await syncAssets();
  const prices = await snapshotSteamPrices();

  return {
    steam,
    assets,
    prices
  };
};

