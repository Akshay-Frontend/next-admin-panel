"use client";

import { use, useEffect, useState } from "react";

import Link from "next/link";
import { notFound, useRouter } from "next/navigation";
import axios from "axios";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { LogoutButton } from "@/components/auth/LogoutButton";
import { ProductForm } from "@/components/products/ProductForm";
import { Loader } from "@/components/common/Loader";
import { ErrorState } from "@/components/common/ErrorState";
import { useLocalProducts } from "@/context/LocalProductsContext";
import { fetchCategories } from "@/services/categories.service";
import { fetchProductById, updateProduct } from "@/services/products.service";
import { isApiError } from "@/lib/axios";
import type {
  Category,
  Product,
  ProductFormValues,
} from "@/types/product";

export default function EditProductRoot({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <AuthGuard>
      <EditProductPage params={params} />
    </AuthGuard>
  );
}

function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { id: rawId } = use(params);
  const parsedId = Number(rawId);
  const isValidId = Number.isFinite(parsedId) && parsedId > 0;

  const { editProduct, isLocalId, getLocal, applyOverlay, deletedSet } =
    useLocalProducts();

  const [product, setProduct] = useState<Product | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    fetchCategories(controller.signal)
      .then(setCategories)
      .catch(() => setCategories([]));
    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (!isValidId) {
      setLoading(false);
      return;
    }
    if (deletedSet.has(parsedId)) {
      setProduct(null);
      setLoading(false);
      return;
    }
    if (isLocalId(parsedId)) {
      setProduct(getLocal(parsedId) ?? null);
      setLoading(false);
      return;
    }
    const controller = new AbortController();
    setLoading(true);
    setLoadError(null);
    fetchProductById(parsedId, controller.signal)
      .then((p) => {
        setProduct(applyOverlay(p));
        setLoading(false);
      })
      .catch((err: unknown) => {
        if (axios.isCancel(err)) return;
        if (isApiError(err) && err.status === 404) {
          setProduct(null);
          setLoading(false);
          return;
        }
        setLoadError(isApiError(err) ? err.message : "Failed to load product");
        setLoading(false);
      });
    return () => controller.abort();
  }, [parsedId, isValidId, isLocalId, getLocal, applyOverlay, deletedSet, attempt]);

  if (!isValidId) notFound();

  async function onSubmit(values: ProductFormValues) {
    if (submitting || !product) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      if (!isLocalId(product.id)) {
        await updateProduct(product.id, values).catch((err) => {
          if (axios.isCancel(err)) return;
          console.warn("Server update failed (expected on DummyJSON):", err);
        });
      }
      editProduct(product.id, values);
      router.replace(`/products/${product.id}`);
    } catch (err) {
      setSubmitError(isApiError(err) ? err.message : "Failed to save changes");
      setSubmitting(false);
    }
  }

  return (
    <>
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
          <Link
            href={product ? `/products/${product.id}` : "/products"}
            className="bg-gray-600 text-black py-1 px-3 text-lg font-bold rounded-md"
          >
               Back 
          </Link>
          <LogoutButton />
        </div>
      </header>
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-4">
        <h1 className="mb-4 text-lg font-semibold text-slate-900">
          Edit product
        </h1>
        {loading ? (
          <Loader />
        ) : loadError ? (
          <ErrorState
            message={loadError}
            onRetry={() => setAttempt((a) => a + 1)}
          />
        ) : !product ? (
          <ErrorState message="Product not found." />
        ) : (
          <ProductForm
            mode="edit"
            initial={{
              title: product.title,
              description: product.description ?? "",
              category: product.category,
              price: product.price,
              stock: product.stock,
              brand: product.brand ?? "",
              thumbnail: product.thumbnail ?? "",
            }}
            categories={categories}
            submitting={submitting}
            submitError={submitError}
            onSubmit={onSubmit}
            onCancel={() =>
              router.replace(`/products/${product.id}`)
            }
          />
        )}
      </main>
    </>
  );
}
