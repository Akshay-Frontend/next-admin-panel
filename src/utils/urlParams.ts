import type {
  ProductQuery,
  SortField,
  SortOrder,
} from "@/types/product";

export const PAGE_SIZES = [10, 20, 50] as const;
export const DEFAULT_PAGE_SIZE = 10;
export const SORT_FIELDS: SortField[] = ["title", "price", "rating"];

export function parseProductQuery(
  params: URLSearchParams | ReadonlyURLSearchParamsLike
): ProductQuery {
  const get = (k: string) => params.get(k);

  const rawPage = Number(get("page"));
  const page = Number.isFinite(rawPage) && rawPage >= 1 ? Math.floor(rawPage) : 1;

  const rawSize = Number(get("size"));
  const pageSize = (PAGE_SIZES as readonly number[]).includes(rawSize)
    ? rawSize
    : DEFAULT_PAGE_SIZE;

  const search = (get("q") ?? "").slice(0, 200);
  const category = (get("category") ?? "").slice(0, 100);

  const rawSort = get("sortBy") ?? "";
  const sortBy: SortField | "" = (SORT_FIELDS as string[]).includes(rawSort)
    ? (rawSort as SortField)
    : "";

  const rawOrder = get("order");
  const order: SortOrder = rawOrder === "desc" ? "desc" : "asc";

  return { page, pageSize, search, category, sortBy, order };
}

export function buildQueryString(next: Partial<ProductQuery>): string {
  const params = new URLSearchParams();
  if (next.page && next.page > 1) params.set("page", String(next.page));
  if (next.pageSize && next.pageSize !== DEFAULT_PAGE_SIZE)
    params.set("size", String(next.pageSize));
  if (next.search) params.set("q", next.search);
  if (next.category) params.set("category", next.category);
  if (next.sortBy) {
    params.set("sortBy", next.sortBy);
    if (next.order && next.order !== "asc") params.set("order", next.order);
  }
  const s = params.toString();
  return s ? `?${s}` : "";
}

interface ReadonlyURLSearchParamsLike {
  get(name: string): string | null;
}
