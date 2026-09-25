import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex flex-1 items-center justify-center px-4 py-12">
      <div className="max-w-md rounded-xl border border-slate-200 bg-white p-6 text-center shadow-sm">
        <h1 className="text-xl font-semibold text-slate-900">Product not found</h1>
        <p className="mt-2 text-sm text-slate-500">
          The URL you visited doesn wmatch any product.
        </p>
        <Link
          href="/products"
          className="mt-4 inline-block rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          Back to products
        </Link>
      </div>
    </main>
  );
}
