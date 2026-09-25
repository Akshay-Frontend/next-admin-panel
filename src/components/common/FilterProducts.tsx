"use Client";
    
import { useLocalProducts } from "@/context/LocalProductsContext";
import { useDebounce } from "@/hooks/useDebounce";
import { useProductQuery } from "@/hooks/useProductQuery";
import { isApiError } from "@/lib/axios";
import { fetchCategories } from "@/services/categories.service";
import { fetchProducts } from "@/services/products.service";
import { Category, Product, SortField, SortOrder } from "@/types/product";
import axios from "axios";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ProductsToolbar } from "../products/ProductsToolbar";
import { Loader } from "./Loader";
import { ErrorState } from "./ErrorState";
import { EmptyState } from "./EmptyState";
import { ProductTable } from "../products/ProductTable";
import { ProductCards } from "../products/ProductCards";
import { Pagination } from "../products/Pagination";
import DeleteModal  from "./DeleteModal";

const FilterProducts = () => {
  const { query, setQuery } = useProductQuery();
  const { added, deletedSet, applyOverlay, deleteProduct } = useLocalProducts();

  const [rawSearch, setRawSearch] = useState(query.search);
  const debouncedSearch = useDebounce(rawSearch, 400);

  useEffect(() => {
    if (debouncedSearch !== query.search) {
      setQuery({ search: debouncedSearch }, { resetPage: true });
    }
  }, [debouncedSearch, query.search, setQuery]);

  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  const requestIdRef = useRef(0);

  useEffect(() => {
    const requestId = ++requestIdRef.current;
    const controller = new AbortController();
    setLoading(true);
    setError(null);

    const skip = (query.page - 1) * query.pageSize;
    fetchProducts({
      limit: query.pageSize,
      skip,
      search: query.search,
      category: query.category,
      sortBy: query.sortBy,
      order: query.order,
      signal: controller.signal,
    })
      .then((res) => {
        if (requestId !== requestIdRef.current) return;
        setProducts(res.products);
        setTotal(res.total);
        setLoading(false);
      })
      .catch((err: unknown) => {
        if (axios.isCancel(err)) return;
        if (requestId !== requestIdRef.current) return;
        setError(isApiError(err) ? err.message : "Failed to load products");
        setLoading(false);
      });

    return () => controller.abort();
  }, [
    query.page,
    query.pageSize,
    query.search,
    query.category,
    query.sortBy,
    query.order,
    attempt,
  ]);

  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    setCategoriesLoading(true);
    fetchCategories(controller.signal)
      .then((c) => setCategories(c))
      .catch(() => setCategories([]))
      .finally(() => setCategoriesLoading(false));
    return () => controller.abort();
  }, []);

  const visibleProducts = useMemo(() => {
    const overlayed = products
      .filter((p) => !deletedSet.has(p.id))
      .map(applyOverlay);

    const isFirstPage = query.page === 1;
    const noFilters = !query.search && !query.category;
    if (isFirstPage && noFilters && added.length > 0) {
      const combined = [...added, ...overlayed];
      return combined.slice(0, query.pageSize);
    }
    return overlayed;
  }, [
    products,
    deletedSet,
    applyOverlay,
    query.page,
    query.pageSize,
    query.search,
    query.category,
    added,
  ]);

  const [pendingDelete, setPendingDelete] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState(false);

  const onConfirmDelete = useCallback(() => {
    if (!pendingDelete) return;
    setDeleting(true);
    deleteProduct(pendingDelete.id);
    setDeleting(false);
    setPendingDelete(null);
  }, [pendingDelete, deleteProduct]);

  const offset = (query.page - 1) * query.pageSize;
  const rangeStart = visibleProducts.length === 0 ? 0 : offset + 1;
  const rangeEnd = offset + visibleProducts.length;
  return (
    <>
      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-4 px-4 py-4">
        <ProductsToolbar
          search={rawSearch}
          category={query.category}
          sortBy={query.sortBy}
          order={query.order}
          pageSize={query.pageSize}
          categories={categories}
          categoriesLoading={categoriesLoading}
          onSearch={setRawSearch}
          onCategory={(v) =>
            setQuery({ category: v, search: "" }, { resetPage: true })
          }
          onSort={(field: SortField | "", ord: SortOrder) =>
            setQuery({ sortBy: field, order: ord }, { resetPage: true })
          }
          onPageSize={(v) => setQuery({ pageSize: v }, { resetPage: true })}
        />

        {loading ? (
          <Loader label="Loading products..." />
        ) : error ? (
          <ErrorState
            message={error}
            onRetry={() => setAttempt((a) => a + 1)}
          />
        ) : visibleProducts.length === 0 ? (
          <EmptyState
            title="No products found"
            description="Try changing your search or filters."
          />
        ) : (
          <>
            <p className="text-xs text-slate-500">
              Showing {rangeStart}–{rangeEnd} of {total}
            </p>
            <ProductTable
              products={visibleProducts}
              onDelete={setPendingDelete}
            />
            <ProductCards
              products={visibleProducts}
              onDelete={setPendingDelete}
            />
            <div className="mt-2">
              <Pagination
                page={query.page}
                pageSize={query.pageSize}
                total={total}
                onChange={(p) => setQuery({ page: p })}
              />
            </div>
          </>
        )}
      </main>

      <DeleteModal
        open={!!pendingDelete}
        title="Delete product?"
        description={
          pendingDelete
            ? `“${pendingDelete.title}” will be removed from your view. (DummyJSON does not truly persist deletes.)`
            : undefined
        }
        confirmLabel="Delete"
        destructive
        loading={deleting}
        onConfirm={onConfirmDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </>
  );
};

export default FilterProducts;
