import type { CatalogItem, EquipSlot } from "./schema";
import { normalizeName, slugify, titleCase } from "./utils";

type WearableRule = {
  template: string;
  aliases: string[];
  slot: EquipSlot;
  layerOrder: number;
};

const rule = (
  template: string,
  aliases: string[],
  slot: EquipSlot,
  layerOrder: number
): WearableRule => ({
  template,
  aliases,
  slot,
  layerOrder
});

const wearableRules = [
  rule("metal-facemask", ["metal facemask", "facemask"], "face", 35),
  rule("balaclava", ["balaclava"], "face", 10),
  rule("bandana", ["bandana"], "face", 6),
  rule("sunglasses", ["sunglasses"], "face", 5),
  rule("burlap-headwrap", ["headwrap"], "head", 8),
  rule("hoodie", ["hoodie"], "torso", 15),
  rule("shirt", ["shirt"], "torso", 10),
  rule("vest", ["vest"], "torso", 24),
  rule("jacket", ["jacket"], "torso", 30),
  rule("poncho", ["poncho"], "torso", 28),
  rule("roadsign-jacket", ["roadsign jacket"], "torso", 33),
  rule("pants", ["pants"], "legs", 18),
  rule("shorts", ["shorts"], "legs", 12),
  rule("kilt", ["kilt"], "legs", 26),
  rule("gloves", ["gloves"], "hands", 14),
  rule("boots", ["boots"], "feet", 20),
  rule("shoes", ["shoes"], "feet", 12),
  rule("boonie-hat", ["boonie hat"], "head", 12),
  rule("cap", ["cap"], "head", 10),
  rule("helmet", ["helmet"], "head", 32),
  rule("bucket-helmet", ["bucket helmet"], "head", 31),
  rule("hqm-helmet", ["hqm helmet", "metal helmet"], "head", 34),
  rule("backpack", ["backpack"], "back", 12)
].sort((left, right) =>
  Math.max(...right.aliases.map((alias) => alias.length)) -
  Math.max(...left.aliases.map((alias) => alias.length))
) satisfies WearableRule[];

const emissivePatterns = [/glow/i, /neon/i, /no mercy/i];

export const wearableTemplateRules = wearableRules;

export const classifyMarketItem = (
  marketHashName: string,
  options?: {
    iconUrl?: string | undefined;
    priceMinor?: number | null | undefined;
    listings?: number | null | undefined;
    priceCapturedAt?: string | null | undefined;
  }
): CatalogItem => {
  const normalized = normalizeName(marketHashName);
  const rule = wearableRules.find(({ aliases }) =>
    aliases.some((alias) => normalized.endsWith(alias) || normalized.includes(` ${alias} `))
  );
  const emissive = emissivePatterns.some((pattern) => pattern.test(marketHashName));
  const baseTemplate = rule?.template ?? "unsupported";
  const displayName = titleCase(marketHashName);

  return {
    id: slugify(`${marketHashName}-${baseTemplate}`),
    slug: slugify(marketHashName),
    displayName,
    baseTemplate,
    itemKind: rule ? "wearable" : "non_renderable",
    renderTarget: rule ? "mannequin" : "none",
    slot: rule?.slot ?? null,
    layerOrder: rule?.layerOrder ?? 0,
    published: false,
    emissive,
    marketHashName,
    iconUrl: options?.iconUrl,
    latestPrice:
      options?.priceCapturedAt === undefined
        ? null
        : {
            source: "steam",
            currency: "EUR",
            priceMinor: options.priceMinor ?? null,
            listings: options.listings ?? null,
            capturedAt: options.priceCapturedAt ?? new Date().toISOString()
          },
    priceUpdatedAt: options?.priceCapturedAt ?? null
  };
};

export const isWearable = (item: Pick<CatalogItem, "itemKind" | "slot">) =>
  item.itemKind === "wearable" && item.slot !== null;
