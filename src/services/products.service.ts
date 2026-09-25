import { api } from "@/lib/axios";
import type {
  Product,
  ProductFormValues,
  ProductListResponse,
  SortField,
  SortOrder,
} from "@/types/product";

interface ListArgs {
  limit: number;
  skip: number;
  search?: string;
  category?: string;
  sortBy?: SortField | "";
  order?: SortOrder;
  signal?: AbortSignal;
}

const SELECT_FIELDS =
  "id,title,category,price,rating,stock,thumbnail,brand,description,images";

export async function fetchProducts(
  args: ListArgs
): Promise<ProductListResponse> {
  const { limit, skip, search, category, sortBy, order, signal } = args;

  const params: Record<string, string | number> = {
    limit,
    skip,
    select: SELECT_FIELDS,
  };
  if (sortBy) {
    params.sortBy = sortBy;
    params.order = order ?? "asc";
  }

  let path = "/products";
  if (search && search.trim().length > 0) {
    path = "/products/search";
    params.q = search.trim();
  } else if (category) {
    path = `/products/category/${encodeURIComponent(category)}`;
  }

  const res = await api.get<ProductListResponse>(path, { params, signal });
  return res.data;
}

export async function fetchProductById(
  id: number | string,
  signal?: AbortSignal
): Promise<Product> {
  const res = await api.get<Product>(`/products/${id}`, { signal });
  return res.data;
}

export async function createProduct(
  values: ProductFormValues
): Promise<Product> {
  const res = await api.post<Product>("/products/add", values);
  return res.data;
}

export async function updateProduct(
  id: number,
  values: Partial<ProductFormValues>
): Promise<Product> {
  const res = await api.put<Product>(`/products/${id}`, values);
  return res.data;
}

export async function deleteProduct(id: number): Promise<{ id: number }> {
  const res = await api.delete<{ id: number }>(`/products/${id}`);
  return res.data;
}
