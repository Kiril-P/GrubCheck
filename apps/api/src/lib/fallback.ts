import {
  biomePresets,
  demoCatalogDetails,
  demoCatalogItems,
  demoInternalStatus,
  type CatalogItem,
  type CatalogListResponse
} from "@grubcheck/domain";

export const listFallbackCatalog = (input: {
  q?: string;
  slot?: CatalogItem["slot"];
  page?: number;
  pageSize?: number;
}): CatalogListResponse => {
  const page = Math.max(input.page ?? 0, 0);
  const pageSize = Math.min(Math.max(input.pageSize ?? 24, 1), 60);
  const filtered = demoCatalogItems.filter((item) => {
    const queryMatch = input.q
      ? item.displayName.toLowerCase().includes(input.q.toLowerCase())
      : true;
    const slotMatch = input.slot ? item.slot === input.slot : true;

    return queryMatch && slotMatch;
  });

  return {
    items: filtered.slice(page * pageSize, page * pageSize + pageSize),
    page,
    pageSize,
    total: filtered.length
  };
};

export const getFallbackCatalogDetail = (slug: string) =>
  demoCatalogDetails.find((item) => item.item.slug === slug) ?? null;

export const getFallbackBiomes = () => biomePresets;

export const getFallbackStatus = () => demoInternalStatus;

