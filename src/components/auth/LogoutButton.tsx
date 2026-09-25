"use client";

import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/Button";

export function LogoutButton() {
  const { logout, user } = useAuth();
  return (
    <div className="flex items-center gap-3">
      {user && (
        <span className="hidden font-black text-sm text-slate-600  sm:inline">
          Hi, {user.firstName}
        </span>
      )}
      <Button variant="danger" size="sm" onClick={logout} className="cursor-pointer">
        Logout
      </Button>
    </div>
  );
}
