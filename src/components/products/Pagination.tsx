"use client";

import { Button } from "@/components/ui/Button";
import { cn } from "@/utils/cn";

interface Props {
  page: number;
  pageSize: number;
  total: number;
  onChange: (page: number) => void;
}

function buildPageList(current: number, totalPages: number): (number | "...")[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }
  const pages: (number | "...")[] = [1];
  const start = Math.max(2, current - 1);
  const end = Math.min(totalPages - 1, current + 1);
  if (start > 2) pages.push("...");
  for (let p = start; p <= end; p++) pages.push(p);
  if (end < totalPages - 1) pages.push("...");
  pages.push(totalPages);
  return pages;
}

export function Pagination({ page, pageSize, total, onChange }: Props) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(page, totalPages);
  const pages = buildPageList(safePage, totalPages);

  return (
    <nav className="flex flex-wrap items-center justify-center gap-3">
      <Button
        variant="secondary"
        size="sm"
        onClick={() => onChange(safePage - 1)}
        disabled={safePage <= 1}
      >
        Prev
      </Button>
      {pages.map((p, idx) =>
        p === "..." ? (
          <span key={`e-${idx}`} className="px-2 text-slate-400">
            …
          </span>
        ) : (
          <button
            key={p}
            onClick={() => onChange(p)}
            className={cn(
              "min-w-8 rounded-md border px-2 py-1 text-sm",
              p === safePage
                ? "border-indigo-600 bg-indigo-600 text-white"
                : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
            )}
          >
            {p}
          </button>
        )
      )}
      <Button
        variant="secondary"
        size="sm"
        onClick={() => onChange(safePage + 1)}
        disabled={safePage >= totalPages}
      >
        Next
      </Button>
    </nav>
  );
}
