import { z } from "zod";

const steamMarketResultSchema = z.object({
  name: z.string(),
  hash_name: z.string(),
  sell_listings: z.number().int().nullable().optional(),
  sell_price: z.number().int().nullable().optional(),
  app_icon: z.string().url().optional(),
  app_name: z.string(),
  sale_price_text: z.string().optional(),
  sell_price_text: z.string().optional(),
  asset_description: z.object({
    appid: z.number().int(),
    classid: z.string().optional(),
    icon_url: z.string().optional(),
    market_hash_name: z.string(),
    market_name: z.string(),
    commodity: z.number().int().optional(),
    tradable: z.number().int().optional()
  })
});

const steamMarketPageSchema = z.object({
  success: z.boolean(),
  start: z.number().int(),
  pagesize: z.number().int(),
  total_count: z.number().int(),
  results: z.array(steamMarketResultSchema)
});

export type SteamMarketPage = z.infer<typeof steamMarketPageSchema>;
export type SteamMarketResult = z.infer<typeof steamMarketResultSchema>;

const marketUrl = (start: number) =>
  `https://steamcommunity.com/market/search/render/?appid=252490&norender=1&count=10&start=${start}`;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const fetchSteamMarketPage = async (start: number, retries = 3): Promise<SteamMarketPage> => {
  for (let attempt = 0; attempt < retries; attempt += 1) {
    const response = await fetch(marketUrl(start), {
      headers: {
        accept: "application/json"
      }
    });

    if (response.ok) {
      return steamMarketPageSchema.parse(await response.json());
    }

    if (attempt < retries - 1) {
      await sleep(350 * (attempt + 1));
      continue;
    }

    throw new Error(`Steam market request failed with ${response.status} at start=${start}.`);
  }

  throw new Error(`Steam market request exhausted retries at start=${start}.`);
};

