"use client";

import Link from "next/link";
import Image from "next/image";
import type { Product } from "@/types/product";
import { Button } from "@/components/ui/Button";

interface Props {
  products: Product[];
  onDelete: (product: Product) => void;
}

export function ProductCards({ products, onDelete }: Props) {
  return (
    <div className="grid grid-cols-1 gap-3 md:hidden">
      {products.map((p) => (
        <div
          key={p.id}
          className="flex gap-3 rounded-lg border border-slate-200 bg-white p-3"
        >
          <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded bg-slate-100">
            <Image
              src={p.thumbnail}
              alt={p.title}
              fill
              sizes="80px"
              className="object-cover"
              unoptimized
            />
          </div>
          <div className="flex flex-1 flex-col">
            <Link
              href={`/products/${p.id}`}
              className="text-sm font-semibold text-slate-900 hover:text-indigo-600"
            >
              {p.title}
            </Link>
            <span className="text-xs capitalize text-slate-500">
              {p.category}
            </span>
            <div className="mt-1 flex flex-wrap gap-x-3 text-xs text-slate-600">
              <span className="font-medium text-slate-900">
                ${p.price.toFixed(2)}
              </span>
              <span>★ {p.rating.toFixed(1)}</span>
              <span>Stock: {p.stock}</span>
            </div>
            <div className="mt-2 flex gap-2">
              <Link
                href={`/products/${p.id}/edit`}
                className="rounded-md border border-slate-300 bg-green-300 px-2 py-1 text-xs text-slate-700 hover:bg-slate-50"
              >
                Edit
              </Link>
              <Button className="cursor-pointer"
                variant="danger"
                size="sm"
                onClick={() => onDelete(p)}
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
