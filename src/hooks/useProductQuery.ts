"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback, useMemo } from "react";
import {
  buildQueryString,
  parseProductQuery,
} from "@/utils/urlParams";
import type { ProductQuery } from "@/types/product";

export function useProductQuery() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const query = useMemo(
    () => parseProductQuery(searchParams),
    [searchParams]
  );

  const setQuery = useCallback(
    (patch: Partial<ProductQuery>, opts?: { resetPage?: boolean }) => {
      const merged: ProductQuery = {
        ...query,
        ...patch,
        page: opts?.resetPage ? 1 : patch.page ?? query.page,
      };
      const qs = buildQueryString(merged);
      router.replace(`${pathname}${qs}`, { scroll: false });
    },
    [query, router, pathname]
  );

  return { query, setQuery };
}
