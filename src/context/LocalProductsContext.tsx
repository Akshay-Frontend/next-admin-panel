"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { Product, ProductFormValues } from "@/types/product";

const STORAGE_KEY = "nexgensis_local_products_v1";
const LOCAL_ID_OFFSET = 1_000_000;

interface LocalState {
  added: Product[];
  edits: Record<number, Partial<Product>>;
  deleted: number[];
}

const emptyState: LocalState = { added: [], edits: {}, deleted: [] };

interface LocalProductsContextValue {
  added: Product[];
  edits: Record<number, Partial<Product>>;
  deletedSet: Set<number>;
  isLocalId: (id: number) => boolean;
  getLocal: (id: number) => Product | undefined;
  applyOverlay: (product: Product) => Product;
  addProduct: (values: ProductFormValues) => Product;
  editProduct: (id: number, values: Partial<ProductFormValues>) => void;
  deleteProduct: (id: number) => void;
}

const LocalProductsContext = createContext<LocalProductsContextValue | null>(
  null
);

function loadInitial(): LocalState {
  if (typeof window === "undefined") return emptyState;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyState;
    const parsed = JSON.parse(raw) as LocalState;
    return {
      added: Array.isArray(parsed.added) ? parsed.added : [],
      edits: parsed.edits && typeof parsed.edits === "object" ? parsed.edits : {},
      deleted: Array.isArray(parsed.deleted) ? parsed.deleted : [],
    };
  } catch {
    return emptyState;
  }
}

export function LocalProductsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [state, setState] = useState<LocalState>(emptyState);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setState(loadInitial());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // storage full or blocked — non-fatal
    }
  }, [state, hydrated]);

  const deletedSet = useMemo(() => new Set(state.deleted), [state.deleted]);

  const isLocalId = useCallback(
    (id: number) => id >= LOCAL_ID_OFFSET,
    []
  );

  const getLocal = useCallback(
    (id: number) => state.added.find((p) => p.id === id),
    [state.added]
  );

  const applyOverlay = useCallback(
    (product: Product) => {
      const edit = state.edits[product.id];
      return edit ? { ...product, ...edit } : product;
    },
    [state.edits]
  );

  const addProduct = useCallback((values: ProductFormValues) => {
    const created: Product = {
      id: LOCAL_ID_OFFSET + Date.now(),
      title: values.title,
      description: values.description,
      category: values.category,
      price: values.price,
      stock: values.stock,
      brand: values.brand,
      thumbnail: values.thumbnail || "https://placehold.co/200x200?text=No+Image",
      images: values.thumbnail ? [values.thumbnail] : [],
      rating: 0,
    };
    setState((prev) => ({ ...prev, added: [created, ...prev.added] }));
    return created;
  }, []);

  const editProduct = useCallback(
    (id: number, values: Partial<ProductFormValues>) => {
      setState((prev) => {
        if (id >= LOCAL_ID_OFFSET) {
          return {
            ...prev,
            added: prev.added.map((p) =>
              p.id === id ? { ...p, ...values } : p
            ),
          };
        }
        return {
          ...prev,
          edits: { ...prev.edits, [id]: { ...prev.edits[id], ...values } },
        };
      });
    },
    []
  );

  const deleteProduct = useCallback(
    (id: number) => {
      setState((prev) => {
        if (id >= LOCAL_ID_OFFSET) {
          return {
            ...prev,
            added: prev.added.filter((p) => p.id !== id),
          };
        }
        if (prev.deleted.includes(id)) return prev;
        return { ...prev, deleted: [...prev.deleted, id] };
      });
    },
    []
  );

  const value = useMemo<LocalProductsContextValue>(
    () => ({
      added: state.added,
      edits: state.edits,
      deletedSet,
      isLocalId,
      getLocal,
      applyOverlay,
      addProduct,
      editProduct,
      deleteProduct,
    }),
    [
      state.added,
      state.edits,
      deletedSet,
      isLocalId,
      getLocal,
      applyOverlay,
      addProduct,
      editProduct,
      deleteProduct,
    ]
  );

  return (
    <LocalProductsContext.Provider value={value}>
      {children}
    </LocalProductsContext.Provider>
  );
}

export function useLocalProducts() {
  const ctx = useContext(LocalProductsContext);
  if (!ctx)
    throw new Error(
      "useLocalProducts must be used inside LocalProductsProvider"
    );
  return ctx;
}
