"use client";

import Link from "next/link";
import Image from "next/image";
import type { Product } from "@/types/product";
import { Button } from "@/components/ui/Button";

interface Props {
  products: Product[];
  onDelete: (product: Product) => void;
}

export function ProductTable({ products, onDelete }: Props) {
  return (
    <div className="hidden overflow-x-auto rounded-lg border border-slate-200 bg-white md:block">
      <table className="w-full text-sm">
        <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
          <tr>
            <th className="w-16 px-3 py-2">Image</th>
            <th className="px-3 py-2">Title</th>
            <th className="px-3 py-2">Category</th>
            <th className="px-3 py-2 text-right">Price</th>
            <th className="px-3 py-2 text-right">Rating</th>
            <th className="px-3 py-2 text-right">Stock</th>
            <th className="px-3 py-2 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <tr
              key={p.id}
              className="border-t border-slate-100 hover:bg-slate-50/60"
            >
              <td className="px-3 py-2">
                <div className="relative h-10 w-10 overflow-hidden rounded bg-slate-100">
                  <Image
                    src={p.thumbnail}
                    alt={p.title}
                    fill
                    sizes="40px"
                    className="object-cover"
                    unoptimized
                  />
                </div>
              </td>
              <td className="px-3 py-2 font-medium text-slate-900">
                <Link
                  href={`/products/${p.id}`}
                  className="hover:text-indigo-600"
                >
                  {p.title}
                </Link>
              </td>
              <td className="px-3 py-2 capitalize text-slate-600">
                {p.category}
              </td>
              <td className="px-3 py-2 text-right text-slate-900">
                ${p.price.toFixed(2)}
              </td>
              <td className="px-3 py-2 text-right text-slate-700">
                {p.rating.toFixed(1)}
              </td>
              <td className="px-3 py-2 text-right text-slate-700">{p.stock}</td>
              <td className="px-3 py-2">
                <div className="flex justify-end gap-1">
                  <Link
                    href={`/products/${p.id}/edit`}
                    className="rounded-md border border-slate-300 bg-white px-2 py-1 text-xs text-slate-700 hover:bg-slate-50"
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
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
