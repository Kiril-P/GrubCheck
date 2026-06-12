import { normalizeName, slugify, type EquipSlot } from "@grubcheck/domain";
import path from "node:path";
import { z } from "zod";
import { workerEnv } from "../config";
import { uploadAsset } from "./storage";

const importedAssetManifestSchema = z.object({
  renderModelId: z.string(),
  slug: z.string(),
  label: z.string(),
  baseTemplate: z.string(),
  slot: z.enum(["head", "face", "torso", "hands", "legs", "feet", "back"]),
  skeletonProfile: z.string().default("grubcheck-humanoid-v1"),
  bodyMasks: z.array(z.string()).default([]),
  suppressesSlots: z
    .array(z.enum(["head", "face", "torso", "hands", "legs", "feet", "back"]))
    .default([]),
  glbPath: z.string().optional(),
  textureSet: z
    .object({
      diffusePath: z.string().optional(),
      normalPath: z.string().optional(),
      emissivePath: z.string().optional(),
      previewColor: z.string().optional()
    })
    .default({}),
  transform: z
    .object({
      position: z.tuple([z.number(), z.number(), z.number()]).default([0, 0, 0]),
      rotation: z.tuple([z.number(), z.number(), z.number()]).default([0, 0, 0]),
      scale: z.tuple([z.number(), z.number(), z.number()]).default([1, 1, 1])
    })
    .default({}),
  importVersion: z.number().int().default(1),
  match: z
    .object({
      catalogSlug: z.string().optional(),
      marketHashNames: z.array(z.string()).default([]),
      skinLabel: z.string().optional(),
      aliases: z.array(z.string()).default([])
    })
    .default({})
});

export type ImportedAssetManifest = z.infer<typeof importedAssetManifestSchema> & {
  manifestPath: string;
  assetRoot: string;
};

const assetUrlKey = (slug: string, relativePath: string) =>
  `imports/${slug}/${relativePath.replace(/^\.?\//, "").replace(/\\/g, "/")}`;

const contentTypeFor = (filePath: string) => {
  if (filePath.endsWith(".glb")) return "model/gltf-binary";
  if (filePath.endsWith(".ktx2")) return "image/ktx2";
  if (filePath.endsWith(".png")) return "image/png";
  if (filePath.endsWith(".jpg") || filePath.endsWith(".jpeg")) return "image/jpeg";
  return "application/octet-stream";
};

export const loadImportedAssetManifests = async () => {
  const root = workerEnv.RUST_ASSET_DUMP_DIR;

  if (!root) {
    return [];
  }

  const manifests: ImportedAssetManifest[] = [];
  const glob = new Bun.Glob("**/manifest.json");

  for await (const relativePath of glob.scan({ cwd: root, absolute: false })) {
    const manifestPath = path.join(root, relativePath);
    const manifestFile = Bun.file(manifestPath);

    if (!(await manifestFile.exists())) {
      continue;
    }

    const parsed = importedAssetManifestSchema.parse(await manifestFile.json());
    manifests.push({
      ...parsed,
      manifestPath,
      assetRoot: path.dirname(manifestPath)
    });
  }

  return manifests;
};

const resolveUploadedUrl = async (
  slug: string,
  assetRoot: string,
  assetPath?: string
) => {
  if (!assetPath) {
    return undefined;
  }

  const absolutePath = path.resolve(assetRoot, assetPath);
  return uploadAsset(assetUrlKey(slug, assetPath), absolutePath, contentTypeFor(absolutePath));
};

export const materializeImportedAsset = async (manifest: ImportedAssetManifest) => ({
  renderModel: {
    id: manifest.renderModelId,
    slug: manifest.slug,
    label: manifest.label,
    renderTarget: "mannequin" as const,
    slot: manifest.slot as EquipSlot,
    skeletonProfile: manifest.skeletonProfile,
    bodyMasks: manifest.bodyMasks,
    suppressesSlots: manifest.suppressesSlots,
    defaultGlbUrl: await resolveUploadedUrl(manifest.slug, manifest.assetRoot, manifest.glbPath),
    defaultTextureSet: {
      diffuseUrl: await resolveUploadedUrl(
        manifest.slug,
        manifest.assetRoot,
        manifest.textureSet.diffusePath
      ),
      normalUrl: await resolveUploadedUrl(
        manifest.slug,
        manifest.assetRoot,
        manifest.textureSet.normalPath
      ),
      emissiveUrl: await resolveUploadedUrl(
        manifest.slug,
        manifest.assetRoot,
        manifest.textureSet.emissivePath
      ),
      previewColor: manifest.textureSet.previewColor
    },
    transform: manifest.transform
  },
  matchHints: {
    catalogSlug: manifest.match.catalogSlug,
    marketHashNames: manifest.match.marketHashNames,
    skinLabel: manifest.match.skinLabel,
    aliases: manifest.match.aliases,
    normalizedLabel: normalizeName(manifest.match.skinLabel ?? manifest.label),
    normalizedSlug: slugify(manifest.slug),
    baseTemplate: manifest.baseTemplate
  },
  importVersion: manifest.importVersion
});
