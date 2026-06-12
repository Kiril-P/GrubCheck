import { getDbOrThrow, upsertRenderModel } from "@grubcheck/db";
import { loadImportedAssetManifests, materializeImportedAsset } from "../lib/assets";
import { runTrackedJob } from "../lib/jobs";

export const importRustWearables = async () =>
  runTrackedJob("asset_import", async ({ stats, updateProgress }) => {
    const db = getDbOrThrow();
    const manifests = await loadImportedAssetManifests();
    let manifestsScanned = stats.manifestsScanned ?? 0;
    let importedModels = stats.importedModels ?? 0;

    for (let index = 0; index < manifests.length; index += 1) {
      const imported = await materializeImportedAsset(manifests[index]!);

      await upsertRenderModel(db, {
        ...imported.renderModel
      });

      manifestsScanned += 1;
      importedModels += 1;

      await updateProgress(index + 1, {
        manifestsScanned,
        importedModels
      });
    }

    return {
      manifestsScanned,
      importedModels
    };
  });

