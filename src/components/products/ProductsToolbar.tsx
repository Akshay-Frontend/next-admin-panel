"use client";

import Link from "next/link";
import type { Category, SortField, SortOrder } from "@/types/product";
import { Input, Select } from "@/components/ui/Input";
import {  SORT_FIELDS } from "@/utils/urlParams";

interface Props {
  search: string;
  category: string;
  sortBy: SortField | "";
  order: SortOrder;
  pageSize: number;
  categories: Category[];
  categoriesLoading: boolean;
  onSearch: (v: string) => void;
  onCategory: (v: string) => void;
  onSort: (field: SortField | "", order: SortOrder) => void;
  onPageSize: (v: number) => void;
}

export function ProductsToolbar({
  search,
  category,
  sortBy,
  order,
  categories,
  categoriesLoading,
  onSearch,
  onCategory,
  onSort,
}: Props) {
  const sortValue = sortBy ? `${sortBy}-${order}` : "";

  const searchActive = search.trim().length > 0;

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-white p-3 sm:flex-row sm:flex-wrap sm:items-center">
      <div className="min-w-0 flex-1">
        <Input
          placeholder="Search products…"
          value={search}
          onChange={(e) => onSearch(e.target.value)}
        />
      </div>

      <Select
        value={category}
        onChange={(e) => onCategory(e.target.value)}
        disabled={categoriesLoading || searchActive}
        title={
          searchActive
            ? "Category filter is disabled while searching (API limitation)"
            : undefined
        }
        className="sm:w-52"
      >
        <option value="">
          {searchActive ? "All (search active)" : "All categories"}
        </option>
        {categories.map((c) => (
          <option key={c.slug} value={c.slug}>
            {c.name}
          </option>
        ))}
      </Select>

      <Select
        value={sortValue}
        onChange={(e) => {
          const v = e.target.value;
          if (!v) {
            onSort("", "asc");
            return;
          }
          const [field, ord] = v.split("-") as [SortField, SortOrder];
          onSort(field, ord);
        }}
        className="sm:w-52"
      >
        <option value="">Default order</option>
        {SORT_FIELDS.map((f) => (
          <optgroup key={f} label={f}>
            <option value={`${f}-asc`}>{f} — ascending</option>
            <option value={`${f}-desc`}>{f} — descending</option>
          </optgroup>
        ))}
      </Select>

      <Link
        href="/products/new"
        className="inline-flex items-center justify-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
      >
        + Add product
      </Link>
    </div>
  );
}
