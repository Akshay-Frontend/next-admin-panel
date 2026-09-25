"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Loader } from "@/components/common/Loader";

export default function HomePage() {
  const router = useRouter();
  const { isReady, isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isReady) return;
    router.replace(isAuthenticated ? "/products" : "/login");
  }, [isReady, isAuthenticated, router]);

  return <Loader label="Redirecting..." />;
}
