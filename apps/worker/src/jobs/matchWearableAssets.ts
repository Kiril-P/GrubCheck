import {
  createMatchReview,
  getDbOrThrow,
  listWearableCatalogItems,
  publishCatalogItem,
  upsertSkinVariant
} from "@grubcheck/db";
import { normalizeName, slugify } from "@grubcheck/domain";
import { loadImportedAssetManifests, materializeImportedAsset } from "../lib/assets";
import { runTrackedJob } from "../lib/jobs";

const findCandidates = (
  itemPool: Awaited<ReturnType<typeof listWearableCatalogItems>>,
  imported: Awaited<ReturnType<typeof materializeImportedAsset>>
) => {
  const exactBySlug = imported.matchHints.catalogSlug
    ? itemPool.filter((item) => item.slug === imported.matchHints.catalogSlug)
    : [];

  if (exactBySlug.length) {
    return exactBySlug;
  }

  const exactByMarketHash = imported.matchHints.marketHashNames.length
    ? itemPool.filter((item) => imported.matchHints.marketHashNames.includes(item.marketHashName))
    : [];

  if (exactByMarketHash.length) {
    return exactByMarketHash;
  }

  const templateCandidates = itemPool.filter(
    (item) => item.baseTemplate === imported.matchHints.baseTemplate
  );

  return templateCandidates.filter((item) => {
    const normalizedName = normalizeName(item.marketHashName);

    if (imported.matchHints.normalizedLabel && normalizedName.includes(imported.matchHints.normalizedLabel)) {
      return true;
    }

    return imported.matchHints.aliases.some((alias) => normalizedName.includes(normalizeName(alias)));
  });
};

export const matchWearableAssets = async () =>
  runTrackedJob("asset_match", async ({ stats, updateProgress }) => {
    const db = getDbOrThrow();
    const catalog = await listWearableCatalogItems(db);
    const manifests = await loadImportedAssetManifests();
    let matched = stats.matched ?? 0;
    let review = stats.review ?? 0;

    for (let index = 0; index < manifests.length; index += 1) {
      const imported = await materializeImportedAsset(manifests[index]!);
      const candidates = findCandidates(catalog, imported);

      if (candidates.length === 1) {
        const [candidate] = candidates;

        await upsertSkinVariant(db, {
          id: `variant:${candidate!.slug}`,
          catalogItemId: candidate!.id,
          renderModelId: imported.renderModel.id,
          glbUrl: imported.renderModel.defaultGlbUrl,
          textureSet: imported.renderModel.defaultTextureSet,
          matchStatus: "matched",
          importVersion: imported.importVersion,
          notes: ["Imported from Rust asset dump."]
        });

        await publishCatalogItem(db, candidate!.id, true);
        matched += 1;
      } else {
        review += 1;
        await createMatchReview(db, {
          id: `review:${slugify(`${imported.renderModel.slug}-${index}`)}`,
          marketHashName:
            imported.matchHints.marketHashNames[0] ?? `${imported.renderModel.label} (${imported.matchHints.baseTemplate})`,
          reason:
            candidates.length > 1
              ? "Multiple catalog items matched the imported asset manifest."
              : "No catalog item matched the imported asset manifest.",
          confidence: candidates.length > 1 ? 4500 : 2000
        });
      }

      await updateProgress(index + 1, {
        matched,
        review
      });
    }

    return {
      matched,
      review
    };
  });

