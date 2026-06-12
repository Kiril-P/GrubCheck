"use client";

import {
  biomeMap,
  demoCatalogDetails,
  demoCatalogItems,
  type BiomeKey,
  type BiomePreset,
  type CatalogItem,
  type CatalogItemDetail,
  type CatalogListResponse
} from "@grubcheck/domain";
import Link from "next/link";
import { startTransition, useDeferredValue, useEffect, useState } from "react";
import { clientBaseUrl } from "../lib/api";
import { MannequinViewer } from "./mannequin-viewer";

type SlotFilter = Exclude<CatalogItem["slot"], null> | "all";

const slotOptions: Array<{ label: string; value: SlotFilter }> = [
  { label: "All slots", value: "all" },
  { label: "Head", value: "head" },
  { label: "Face", value: "face" },
  { label: "Torso", value: "torso" },
  { label: "Hands", value: "hands" },
  { label: "Legs", value: "legs" },
  { label: "Feet", value: "feet" },
  { label: "Back", value: "back" }
];

const currencyFormatter = new Intl.NumberFormat("en-IE", {
  style: "currency",
  currency: "EUR"
});

const fallbackCatalog = (query: string, slot: SlotFilter): CatalogListResponse => {
  const filtered = demoCatalogItems.filter((item) => {
    const queryMatch = query
      ? item.displayName.toLowerCase().includes(query.toLowerCase())
      : true;
    const slotMatch = slot === "all" ? true : item.slot === slot;

    return queryMatch && slotMatch;
  });

  return {
    items: filtered,
    page: 0,
    pageSize: 24,
    total: filtered.length
  };
};

const fallbackDetail = (slug: string) =>
  demoCatalogDetails.find((detail) => detail.item.slug === slug) ?? null;

const formatPrice = (item: CatalogItem) =>
  item.latestPrice?.priceMinor !== null && item.latestPrice?.priceMinor !== undefined
    ? currencyFormatter.format(item.latestPrice.priceMinor / 100)
    : "No price";

export const CatalogWorkbench = ({
  initialCatalog,
  biomes
}: {
  initialCatalog: CatalogListResponse;
  biomes: BiomePreset[];
}) => {
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);
  const [slot, setSlot] = useState<SlotFilter>("all");
  const [catalog, setCatalog] = useState(initialCatalog);
  const [selectedSlug, setSelectedSlug] = useState(initialCatalog.items[0]?.slug ?? null);
  const [equippedItems, setEquippedItems] = useState<Record<string, CatalogItemDetail>>({});
  const [detailCache, setDetailCache] = useState<Record<string, CatalogItemDetail>>({});
  const [biomeKey, setBiomeKey] = useState<BiomeKey>("neutral");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);

    startTransition(() => {
      const applyResult = async () => {
        if (!clientBaseUrl) {
          const result = fallbackCatalog(deferredQuery, slot);

          if (!cancelled) {
            setCatalog(result);
            setIsLoading(false);
          }

          return;
        }

        const params = new URLSearchParams();
        if (deferredQuery) params.set("q", deferredQuery);
        if (slot !== "all") params.set("slot", slot);

        try {
          const response = await fetch(`${clientBaseUrl}/api/catalog/items?${params.toString()}`);

          if (!response.ok) {
            throw new Error("Catalog request failed.");
          }

          const result = (await response.json()) as CatalogListResponse;

          if (!cancelled) {
            setCatalog(result);
          }
        } catch {
          if (!cancelled) {
            setCatalog(fallbackCatalog(deferredQuery, slot));
          }
        } finally {
          if (!cancelled) {
            setIsLoading(false);
          }
        }
      };

      void applyResult();
    });

    return () => {
      cancelled = true;
    };
  }, [deferredQuery, slot]);

  const loadDetail = async (slug: string) => {
    const cached = detailCache[slug];

    if (cached) {
      return cached;
    }

    const detail = clientBaseUrl
      ? await fetch(`${clientBaseUrl}/api/catalog/items/${slug}`)
          .then(async (response) => {
            if (!response.ok) {
              throw new Error("Item detail request failed.");
            }

            return (await response.json()) as CatalogItemDetail;
          })
          .catch(() => fallbackDetail(slug))
      : fallbackDetail(slug);

    if (detail) {
      setDetailCache((current: Record<string, CatalogItemDetail>) => ({
        ...current,
        [slug]: detail
      }));
    }

    return detail;
  };

  const toggleEquip = async (item: CatalogItem) => {
    setSelectedSlug(item.slug);

    if (equippedItems[item.slug]) {
      setEquippedItems((current: Record<string, CatalogItemDetail>) => {
        const next = { ...current };
        delete next[item.slug];
        return next;
      });
      return;
    }

    const detail = await loadDetail(item.slug);

    if (!detail) {
      return;
    }

    setEquippedItems((current: Record<string, CatalogItemDetail>) => ({
      ...current,
      [item.slug]: detail
    }));
  };

  const selectedDetail =
    (selectedSlug ? detailCache[selectedSlug] : null) ?? (selectedSlug ? fallbackDetail(selectedSlug) : null);

  return (
    <div className="workspace">
      <div className="workspace-main">
        <MannequinViewer
          equippedItems={Object.values(equippedItems)}
          biomeKey={biomeKey}
          biomeMap={biomeMap}
          title="Mannequin Preview"
          caption="Data-driven slot layering with four lighting presets. Imported GLBs can replace these procedural shells without changing the scene logic."
        />
        <section className="panel feature-panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">Biome Presets</p>
              <h2>Lighting Conditions</h2>
            </div>
            <p>Switch lighting without resetting the equipped kit.</p>
          </div>
          <div className="chip-row">
            {biomes.map((biome) => (
              <button
                key={biome.key}
                className={biomeKey === biome.key ? "chip active" : "chip"}
                onClick={() => setBiomeKey(biome.key)}
                type="button"
              >
                {biome.label}
              </button>
            ))}
          </div>
        </section>
      </div>
      <aside className="panel sidebar">
        <div className="panel-header">
          <div>
            <p className="eyebrow">Catalog</p>
            <h2>Wearable Search</h2>
          </div>
          <p>{catalog.total} published wearables</p>
        </div>
        <label className="field">
          <span>Search</span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Forest, camo, balaclava..."
          />
        </label>
        <label className="field">
          <span>Slot</span>
          <select value={slot} onChange={(event) => setSlot(event.target.value as typeof slot)}>
            {slotOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <div className="equipped-bar">
          <span>Equipped</span>
          <strong>{Object.keys(equippedItems).length}</strong>
        </div>
        <div className="catalog-grid">
          {catalog.items.map((item) => {
            const isEquipped = Boolean(equippedItems[item.slug]);

            return (
              <article key={item.id} className={isEquipped ? "catalog-card equipped" : "catalog-card"}>
                <button
                  className="catalog-card-button"
                  onClick={() => void toggleEquip(item)}
                  type="button"
                >
                  <div>
                    <p className="catalog-slot">{item.slot ?? "unsupported"}</p>
                    <h3>{item.displayName}</h3>
                  </div>
                  <p className="catalog-template">{item.baseTemplate}</p>
                  <div className="catalog-meta">
                    <span>{formatPrice(item)}</span>
                    <span>{item.latestPrice?.listings ?? 0} listings</span>
                  </div>
                </button>
                <div className="catalog-actions">
                  <button
                    className={isEquipped ? "toggle equipped" : "toggle"}
                    onClick={() => void toggleEquip(item)}
                    type="button"
                  >
                    {isEquipped ? "Unequip" : "Equip"}
                  </button>
                  <Link href={`/items/${item.slug}`}>Inspect</Link>
                </div>
              </article>
            );
          })}
          {!catalog.items.length && (
            <div className="catalog-empty">
              <h3>No published wearables matched</h3>
              <p>Broaden the query or import more matched assets into the catalog.</p>
            </div>
          )}
        </div>
        {isLoading && <p className="loading-note">Refreshing catalog…</p>}
      </aside>
      <section className="panel detail-panel">
        <div className="panel-header">
          <div>
            <p className="eyebrow">Selected Item</p>
            <h2>{selectedDetail?.item.displayName ?? "Choose a wearable"}</h2>
          </div>
          {selectedDetail?.item.latestPrice && (
            <p>{formatPrice(selectedDetail.item)}</p>
          )}
        </div>
        {selectedDetail ? (
          <>
            <p className="detail-copy">
              {selectedDetail.renderManifest
                ? `Render model ${selectedDetail.renderManifest.renderModelId} is attached and ready for mannequin composition.`
                : "No render manifest is attached yet. This item will stay hidden until asset matching succeeds."}
            </p>
            <div className="detail-stats">
              <span>Slot: {selectedDetail.item.slot}</span>
              <span>Layer: {selectedDetail.item.layerOrder}</span>
              <span>Status: {selectedDetail.matchStatus}</span>
            </div>
            <ul className="detail-notes">
              {selectedDetail.notes.map((note) => (
                <li key={note}>{note}</li>
              ))}
            </ul>
          </>
        ) : (
          <p className="detail-copy">
            Search the catalog and click a wearable to inspect or equip it on the mannequin.
          </p>
        )}
      </section>
    </div>
  );
};
