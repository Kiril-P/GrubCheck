import { CatalogWorkbench } from "../src/components/catalog-workbench";
import { getBiomes, getCatalog } from "../src/lib/api";

export default async function HomePage() {
  const [catalog, biomes] = await Promise.all([getCatalog(), getBiomes()]);

  return <CatalogWorkbench initialCatalog={catalog} biomes={biomes} />;
}

