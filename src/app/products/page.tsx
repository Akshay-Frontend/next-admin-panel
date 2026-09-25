"use client";

import { AuthGuard } from "@/components/auth/AuthGuard";
import FilterProducts from "@/components/common/FilterProducts";
import UserProfile from "@/components/common/UserProfile";

export default function ProductsPageRoot() {
  return (
    <AuthGuard>
      <UserProfile/>
      <FilterProducts/>
      
    </AuthGuard>
  );
}
