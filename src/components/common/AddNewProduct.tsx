"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { LogoutButton } from "../auth/LogoutButton";
import { ProductForm } from "../products/ProductForm";
import { createProduct } from "@/services/products.service";
import { fetchCategories } from "@/services/categories.service";
import { Category, ProductFormValues } from "@/types/product";
import { useLocalProducts } from "@/context/LocalProductsContext";
import { isApiError } from "@/lib/axios";

function AddaNewProduct() {
  const router = useRouter();
  const { addProduct } = useLocalProducts();
  const [categories, setCategories] = useState<Category[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    fetchCategories(controller.signal)
      .then(setCategories)
      .catch(() => setCategories([]));
    return () => controller.abort();
  }, []);

  async function onSubmit(values: ProductFormValues) {
    if (submitting) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      await createProduct(values).catch((err) => {
        if (axios.isCancel(err)) return;
        console.warn("Server create failed (expected on DummyJSON):", err);
      });
      addProduct(values);
      router.replace("/products");
    } catch (err) {
      setSubmitError(
        isApiError(err) ? err.message : "Failed to create product",
      );
      setSubmitting(false);
    }
  }

  return (
    <>
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
          <div className="bg-gray-600 font-semibold py-1 px-3 rounded-md ">
            <Link href="/products">Back</Link>
          </div>
          <LogoutButton />
        </div>
      </header>
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-4">
        <h1 className="mb-4 text-lg font-semibold">Add product</h1>
        <ProductForm
          mode="create"
          categories={categories}
          submitting={submitting}
          submitError={submitError}
          onSubmit={onSubmit}
          onCancel={() => router.replace("/products")}
        />
      </main>
    </>
  );
}

export default AddaNewProduct;
