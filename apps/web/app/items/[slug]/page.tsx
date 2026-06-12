import Link from "next/link";
import { biomeMap } from "@grubcheck/domain";
import { MannequinViewer } from "../../../src/components/mannequin-viewer";
import { getBiomes, getCatalogItemDetail } from "../../../src/lib/api";

export default async function ItemPage({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [detail, biomes] = await Promise.all([getCatalogItemDetail(slug), getBiomes()]);

  if (!detail) {
    return (
      <section className="panel">
        <div className="panel-header">
          <div>
            <p className="eyebrow">Catalog</p>
            <h2>Item not found</h2>
          </div>
        </div>
        <p className="detail-copy">This item is not published or does not have a known catalog record yet.</p>
      </section>
    );
  }

  return (
    <div className="item-page">
      <div className="item-page-main">
        <MannequinViewer
          equippedItems={[detail]}
          biomeKey="neutral"
          biomeMap={biomeMap}
          title={detail.item.displayName}
          caption="Single-item neutral preview. Imported GLBs and texture maps attach through the same render manifest contract used on the main workbench."
        />
      </div>
      <aside className="panel detail-panel">
        <div className="panel-header">
          <div>
            <p className="eyebrow">Item Detail</p>
            <h2>{detail.item.displayName}</h2>
          </div>
          <p>{detail.item.latestPrice ? `€${(detail.item.latestPrice.priceMinor ?? 0) / 100}` : "No price"}</p>
        </div>
        <div className="detail-stats">
          <span>Slot: {detail.item.slot}</span>
          <span>Layer: {detail.item.layerOrder}</span>
          <span>Match: {detail.matchStatus}</span>
          <span>Biomes: {biomes.length}</span>
        </div>
        <ul className="detail-notes">
          {detail.notes.map((note) => (
            <li key={note}>{note}</li>
          ))}
        </ul>
        <div className="catalog-actions">
          <Link href="/">Back to workbench</Link>
        </div>
      </aside>
    </div>
  );
}
