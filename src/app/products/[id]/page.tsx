"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import axios from "axios";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { LogoutButton } from "@/components/auth/LogoutButton";
import { Loader } from "@/components/common/Loader";
import { ErrorState } from "@/components/common/ErrorState";
import { useLocalProducts } from "@/context/LocalProductsContext";
import { fetchProductById } from "@/services/products.service";
import { isApiError } from "@/lib/axios";
import type { Product } from "@/types/product";

export default function ProductDetailsRoot({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <AuthGuard>
      <ProductDetails params={params} />
    </AuthGuard>
  );
}

function ProductDetails({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: rawId } = use(params);
  const parsedId = Number(rawId);
  const isValidId = Number.isFinite(parsedId) && parsedId > 0;

  const { isLocalId, getLocal, applyOverlay, deletedSet } = useLocalProducts();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!isValidId) {
      setLoading(false);
      return;
    }
    if (deletedSet.has(parsedId)) {
      setLoading(false);
      return;
    }
    if (isLocalId(parsedId)) {
      const local = getLocal(parsedId);
      setProduct(local ?? null);
      setLoading(false);
      return;
    }
    const controller = new AbortController();
    setLoading(true);
    setError(null);
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
        setError(isApiError(err) ? err.message : "Failed to load product");
        setLoading(false);
      });
    return () => controller.abort();
  }, [parsedId, isValidId, isLocalId, getLocal, applyOverlay, deletedSet, attempt]);

  if (!isValidId) notFound();

  return (
    <>
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3">
          <Link href="/products" className="text-sm text-indigo-600 hover:underline">
              Back 
          </Link>
          <LogoutButton />
        </div>
      </header>

      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-4">
        {loading ? (
          <Loader label="Loading product..." />
        ) : error ? (
          <ErrorState message={error} onRetry={() => setAttempt((a) => a + 1)} />
        ) : !product ? (
          <NotFoundInline />
        ) : (
          <article className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="flex flex-col gap-3">
              <div className="relative aspect-square overflow-hidden rounded-lg bg-slate-100">
                <Image
                  src={product.thumbnail}
                  alt={product.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 400px"
                  className="object-cover"
                  unoptimized
                />
              </div>
              {product.images && product.images.length > 1 && (
                <div className="grid grid-cols-4 gap-2">
                  {product.images.slice(0, 4).map((src, i) => (
                    <div
                      key={i}
                      className="relative aspect-square overflow-hidden rounded bg-slate-100"
                    >
                      <Image
                        src={src}
                        alt={`${product.title} ${i + 1}`}
                        fill
                        sizes="80px"
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex flex-col gap-3">
              <div>
                <h1 className="text-2xl font-semibold text-slate-900">
                  {product.title}
                </h1>
                <p className="text-sm capitalize text-slate-500">
                  {product.category}
                  {product.brand && ` · ${product.brand}`}
                </p>
              </div>
              <p className="text-2xl font-bold text-indigo-600">
                ${product.price.toFixed(2)}
              </p>
              <div className="flex gap-4 text-sm text-slate-600">
                <span>★ {product.rating.toFixed(1)}</span>
                <span>In stock: {product.stock}</span>
              </div>
              <p className="text-sm leading-relaxed text-slate-700">
                {product.description}
              </p>
              <div className="flex gap-2 pt-2">
                <Link
                  href={`/products/${product.id}/edit`}
                  className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
                >
                  Edit
                </Link>
                <Link
                  href="/products"
                  className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                >
                  Back
                </Link>
              </div>

              {product.reviews && product.reviews.length > 0 && (
                <section className="mt-5 border-t border-slate-200 pt-4">
                  <h2 className="text-sm font-semibold text-slate-900">
                    Reviews
                  </h2>
                  <ul className="mt-2 flex flex-col gap-3">
                    {product.reviews.map((r, i) => (
                      <li
                        key={i}
                        className="rounded-md border border-slate-200 bg-slate-50 p-3 text-sm"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-slate-800">
                            {r.reviewerName}
                          </span>
                          <span className="text-xs text-slate-500">
                            ★ {r.rating}
                          </span>
                        </div>
                        <p className="mt-1 text-slate-600">{r.comment}</p>
                      </li>
                    ))}
                  </ul>
                </section>
              )}
            </div>
          </article>
        )}
      </main>
    </>
  );
}

function NotFoundInline() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-slate-200 bg-white py-16 text-center">
      <p className="text-lg font-semibold text-slate-900">Product not found</p>
      <p className="text-sm text-slate-500">
        The product you’re looking for doesn’t exist or was removed.
      </p>
      <Link
        href="/products"
        className="mt-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
      >
        Back to products
      </Link>
    </div>
  );
}
