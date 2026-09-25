"use client";
import { AuthGuard } from "@/components/auth/AuthGuard";
import AddaNewProduct from "@/components/common/AddNewProduct";

export default function NewProductRoot() {
  return (
    <AuthGuard>
      <AddaNewProduct />
    </AuthGuard>
  );
}
