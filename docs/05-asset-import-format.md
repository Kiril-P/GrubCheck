# Asset Import Format

The worker expects `RUST_ASSET_DUMP_DIR` to contain one or more `manifest.json` files. Each manifest describes one importable wearable asset bundle.

For exact Rust fidelity, the public web app also needs a real exported mannequin GLB referenced by `NEXT_PUBLIC_MANNEQUIN_GLB_URL`. Without that, the site falls back to a procedural placeholder rig.

## Directory example

```text
asset-dump/
  wearables/
    forest-raider-hoodie/
      manifest.json
      hoodie.glb
      hoodie-diffuse.ktx2
      hoodie-normal.ktx2
```

## Manifest shape

```json
{
  "renderModelId": "hoodie-shell-v1",
  "slug": "forest-raider-hoodie",
  "label": "Forest Raider Hoodie",
  "baseTemplate": "hoodie",
  "slot": "torso",
  "skeletonProfile": "grubcheck-humanoid-v1",
  "bodyMasks": ["torso_base"],
  "suppressesSlots": [],
  "glbPath": "hoodie.glb",
  "textureSet": {
    "diffusePath": "hoodie-diffuse.ktx2",
    "normalPath": "hoodie-normal.ktx2",
    "previewColor": "#5b7a46"
  },
  "transform": {
    "position": [0, 0, 0],
    "rotation": [0, 0, 0],
    "scale": [1, 1, 1]
  },
  "importVersion": 1,
  "match": {
    "catalogSlug": "forest-raider-hoodie",
    "marketHashNames": ["Forest Raider Hoodie"],
    "skinLabel": "Forest Raider",
    "aliases": ["Forest Raider Hoodie"]
  }
}
```

## Notes

- `baseTemplate` must line up with the classifier output used in `catalog_items.base_template`.
- `slot` must be one of `head`, `face`, `torso`, `hands`, `legs`, `feet`, or `back`.
- `marketHashNames` is the strongest matching hint and should be present whenever possible.
- `previewColor` is used by the procedural fallback renderer when imported textures are unavailable to the browser.
- `transform` should be the exact rest-pose transform needed to line the wearable mesh up with the exported mannequin rig.
- If S3 config is present, files are uploaded during import. If only `ASSET_STORAGE_BASE_URL` is present, the importer assumes those asset keys are already reachable there.
- If you want exact Rust fidelity, export the mannequin and each wearable in the same static pose and coordinate space. The web app can then render the real GLBs instead of primitive shells.
