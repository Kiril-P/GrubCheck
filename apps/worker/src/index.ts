import { getDb, listInternalStatus } from "@grubcheck/db";
import {
  importRustWearables,
  matchWearableAssets,
  runFullPipeline,
  snapshotSteamPrices,
  syncAssets,
  syncSteamMarketCatalog
} from "./jobs";

const command = Bun.argv[2] ?? "status";

const handlers = {
  status: async () => {
    const db = getDb();

    if (!db) {
      return {
        mode: "demo",
        message: "No DATABASE_URL configured. Worker can only run in dry setup mode."
      };
    }

    return listInternalStatus(db);
  },
  "sync:steam-market": syncSteamMarketCatalog,
  "sync:assets": syncAssets,
  "sync:prices": snapshotSteamPrices,
  "sync:all": runFullPipeline,
  "match:assets": matchWearableAssets,
  "import:assets": importRustWearables
} as const;

const handler = handlers[command as keyof typeof handlers];

if (!handler) {
  console.error(`Unknown worker command: ${command}`);
  process.exit(1);
}

try {
  const result = await handler();
  console.log(JSON.stringify(result, null, 2));
} catch (error) {
  console.error(error);
  process.exit(1);
}
