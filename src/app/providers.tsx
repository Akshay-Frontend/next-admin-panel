"use client";

import { Suspense } from "react";
import { AuthProvider } from "@/context/AuthContext";
import { LocalProductsProvider } from "@/context/LocalProductsContext";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={null}>
      <AuthProvider>
        <LocalProductsProvider>{children}</LocalProductsProvider>
      </AuthProvider>
    </Suspense>
  );
}
