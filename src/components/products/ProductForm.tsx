"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import type { Category, ProductFormValues } from "@/types/product";
import { Button } from "@/components/ui/Button";
import { Field, Input, Select, TextArea } from "@/components/ui/Input";

interface Props {
  mode: "create" | "edit";
  initial?: Partial<ProductFormValues>;
  categories: Category[];
  submitting: boolean;
  submitError?: string | null;
  onSubmit: (values: ProductFormValues) => Promise<void> | void;
  onCancel: () => void;
}

type Errors = Partial<Record<keyof ProductFormValues, string>>;

const emptyValues: ProductFormValues = {
  title: "",
  description: "",
  category: "",
  price: 0,
  stock: 0,
  brand: "",
  thumbnail: "",
};

export function ProductForm({
  mode,
  initial,
  categories,
  submitting,
  submitError,
  onSubmit,
  onCancel,
}: Props) {
  const [values, setValues] = useState<ProductFormValues>({
    ...emptyValues,
    ...initial,
  });
  const [errors, setErrors] = useState<Errors>({});
  const submitLockRef = useRef(false);

  useEffect(() => {
    setValues({ ...emptyValues, ...initial });
  }, [initial]);

  function set<K extends keyof ProductFormValues>(
    key: K,
    val: ProductFormValues[K]
  ) {
    setValues((prev) => ({ ...prev, [key]: val }));
  }

  function validate(): boolean {
    const next: Errors = {};
    if (!values.title.trim()) next.title = "Title is required";
    else if (values.title.length > 120) next.title = "Title is too long";
    if (!values.category.trim()) next.category = "Category is required";
    if (!values.description.trim())
      next.description = "Description is required";
    if (!Number.isFinite(values.price) || values.price < 0)
      next.price = "Price must be 0 or more";
    if (!Number.isInteger(values.stock) || values.stock < 0)
      next.stock = "Stock must be a whole number ≥ 0";
    if (values.thumbnail && !/^https?:\/\//.test(values.thumbnail))
      next.thumbnail = "Must start with http:// or https://";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (submitLockRef.current || submitting) return;
    if (!validate()) return;
    submitLockRef.current = true;
    try {
      await onSubmit(values);
    } finally {
      submitLockRef.current = false;
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-10"
      noValidate
    >
      <Field label="Title" error={errors.title}>
        <Input
          value={values.title}
          onChange={(e) => set("title", e.target.value)}
          invalid={!!errors.title}
        />
      </Field>

      <Field label="Description" error={errors.description}>
        <TextArea
          value={values.description}
          onChange={(e) => set("description", e.target.value)}
          invalid={!!errors.description}
        />
      </Field>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Category" error={errors.category}>
          <Select
            value={values.category}
            onChange={(e) => set("category", e.target.value)}
            invalid={!!errors.category}
          >
            <option value="">Select category…</option>
            {categories.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.name}
              </option>
            ))}
            {values.category &&
              !categories.some((c) => c.slug === values.category) && (
                <option value={values.category}>{values.category}</option>
              )}
          </Select>
        </Field>

        <Field label="Brand">
          <Input
            value={values.brand}
            onChange={(e) => set("brand", e.target.value)}
          />
        </Field>

        <Field label="Price (USD)" error={errors.price}>
          <Input
            type="number"
            min={0}
            step="0.01"
            value={Number.isFinite(values.price) ? values.price : 0}
            onChange={(e) => set("price", Number(e.target.value))}
            invalid={!!errors.price}
          />
        </Field>

        <Field label="Stock" error={errors.stock}>
          <Input
            type="number"
            min={0}
            step="1"
            value={values.stock}
            onChange={(e) => set("stock", Number(e.target.value))}
            invalid={!!errors.stock}
          />
        </Field>
      </div>

      <Field
        label="Thumbnail URL"
        hint="Optional. Uses a placeholder if empty."
        error={errors.thumbnail}
      >
        <Input
          type="url"
          placeholder="https://…"
          value={values.thumbnail}
          onChange={(e) => set("thumbnail", e.target.value)}
          invalid={!!errors.thumbnail}
        />
      </Field>

      {submitError && (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {submitError}
        </div>
      )}

      <div className="flex justify-end gap-2">
        <Button variant="secondary" type="button" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" loading={submitting}>
          {mode === "create" ? "Create" : "Save changes"}
        </Button>
      </div>
    </form>
  );
}
