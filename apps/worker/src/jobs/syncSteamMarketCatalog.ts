import { upsertCatalogItem, upsertMarketItem } from "@grubcheck/db";
import { classifyMarketItem, isWearable } from "@grubcheck/domain";
import { getDbOrThrow } from "@grubcheck/db";
import { fetchSteamMarketPage } from "../lib/steam";
import { runTrackedJob } from "../lib/jobs";

export const syncSteamMarketCatalog = async () =>
  runTrackedJob("steam_market_catalog", async ({ cursor, stats, updateProgress }) => {
    const db = getDbOrThrow();
    let start = cursor;
    let pagesFetched = stats.pagesFetched ?? 0;
    let itemsFetched = stats.itemsFetched ?? 0;
    let wearableCandidates = stats.wearableCandidates ?? 0;
    let totalCount = stats.totalCount ?? 0;

    while (true) {
      const page = await fetchSteamMarketPage(start);

      totalCount = page.total_count;

      if (!page.results.length) {
        break;
      }

      for (const result of page.results) {
        const classified = classifyMarketItem(result.hash_name, {
          iconUrl: result.app_icon,
          priceMinor: result.sell_price ?? null,
          listings: result.sell_listings ?? null,
          priceCapturedAt: new Date().toISOString()
        });

        await upsertMarketItem(db, {
          id: `steam:${result.hash_name}`,
          source: "steam",
          marketHashName: result.hash_name,
          classId: result.asset_description.classid,
          iconUrl: result.app_icon,
          currency: "EUR",
          sellPriceMinor: result.sell_price ?? null,
          sellListings: result.sell_listings ?? null,
          classifiedItemKind: classified.itemKind,
          classifiedTemplate: classified.baseTemplate,
          classifiedSlot: classified.slot,
          emissive: classified.emissive,
          rawPayload: result as unknown as Record<string, unknown>
        });

        if (isWearable(classified)) {
          wearableCandidates += 1;
          await upsertCatalogItem(db, {
            ...classified,
            published: false
          });
        }
      }

      pagesFetched += 1;
      itemsFetched += page.results.length;
      start += page.results.length;

      await updateProgress(start, {
        pagesFetched,
        itemsFetched,
        wearableCandidates,
        totalCount
      });

      if (start >= page.total_count) {
        break;
      }
    }

    return {
      pagesFetched,
      itemsFetched,
      wearableCandidates,
      totalCount
    };
  });

