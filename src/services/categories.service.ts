import { api } from "@/lib/axios";
import type { Category } from "@/types/product";

export async function fetchCategories(
  signal?: AbortSignal
): Promise<Category[]> {
  const res = await api.get<Category[]>("/products/categories", { signal });
  return res.data;
}
