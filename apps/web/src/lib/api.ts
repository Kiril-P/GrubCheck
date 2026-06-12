import {
  biomePresets,
  demoCatalogDetails,
  demoCatalogItems,
  demoInternalStatus,
  type CatalogItem,
  type CatalogItemDetail,
  type CatalogListResponse,
  type InternalStatus
} from "@grubcheck/domain";

const serverBaseUrl = process.env.API_BASE_URL ?? process.env.NEXT_PUBLIC_API_BASE_URL ?? "";
export const clientBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";

const fetchJson = async <T>(path: string, fallback: () => T | Promise<T>, revalidate = 60) => {
  if (!serverBaseUrl) {
    return fallback();
  }

  try {
    const response = await fetch(`${serverBaseUrl}${path}`, {
      next: { revalidate }
    });

    if (!response.ok) {
      throw new Error(`Request failed: ${response.status}`);
    }

    return (await response.json()) as T;
  } catch {
    return fallback();
  }
};

export const getCatalog = (input?: {
  q?: string;
  slot?: CatalogItem["slot"];
  page?: number;
  pageSize?: number;
}) => {
  const params = new URLSearchParams();

  if (input?.q) params.set("q", input.q);
  if (input?.slot) params.set("slot", input.slot);
  if (input?.page !== undefined) params.set("page", `${input.page}`);
  if (input?.pageSize !== undefined) params.set("pageSize", `${input.pageSize}`);

  const query = params.toString();

  return fetchJson<CatalogListResponse>(
    `/api/catalog/items${query ? `?${query}` : ""}`,
    () => {
      const filtered = demoCatalogItems.filter((item) => {
        const queryMatch = input?.q
          ? item.displayName.toLowerCase().includes(input.q.toLowerCase())
          : true;
        const slotMatch = input?.slot ? item.slot === input.slot : true;

        return queryMatch && slotMatch;
      });

      return {
        items: filtered,
        page: input?.page ?? 0,
        pageSize: input?.pageSize ?? 24,
        total: filtered.length
      };
    }
  );
};

export const getCatalogItemDetail = (slug: string) =>
  fetchJson<CatalogItemDetail | null>(
    `/api/catalog/items/${slug}`,
    () => demoCatalogDetails.find((item) => item.item.slug === slug) ?? null
  );

export const getBiomes = () =>
  fetchJson("/api/biomes", () => biomePresets);

export const getInternalStatus = () =>
  fetchJson<InternalStatus>("/internal/status", () => demoInternalStatus, 10);

