import {
  getDbOrThrow,
  getMarketItemsByHashNames,
  insertPriceSnapshot,
  listWearableCatalogItems
} from "@grubcheck/db";
import { runTrackedJob } from "../lib/jobs";

export const snapshotSteamPrices = async () =>
  runTrackedJob("price_snapshot", async ({ stats, updateProgress }) => {
    const db = getDbOrThrow();
    const catalog = await listWearableCatalogItems(db);
    const marketRows = await getMarketItemsByHashNames(
      db,
      catalog.map((item) => item.marketHashName)
    );
    const marketByHashName = new Map(marketRows.map((row) => [row.marketHashName, row]));
    const capturedAt = new Date();
    const capturedDay = capturedAt.toISOString().slice(0, 10);
    let snapshotted = stats.snapshotted ?? 0;

    for (let index = 0; index < catalog.length; index += 1) {
      const item = catalog[index]!;
      const marketRow = marketByHashName.get(item.marketHashName);

      if (!marketRow) {
        continue;
      }

      await insertPriceSnapshot(db, {
        id: `price:${item.id}:${capturedDay}`,
        source: "steam",
        catalogItemId: item.id,
        currency: marketRow.currency,
        priceMinor: marketRow.sellPriceMinor ?? null,
        listings: marketRow.sellListings ?? null,
        capturedAt,
        capturedDay
      });

      snapshotted += 1;

      await updateProgress(index + 1, {
        snapshotted
      });
    }

    return {
      snapshotted
    };
  });

