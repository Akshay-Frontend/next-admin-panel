"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { login as loginRequest } from "@/services/auth.service";
import { tokenStore } from "@/lib/tokenStore";
import { setUnauthorizedHandler } from "@/lib/axios";
import type { AuthUser, LoginPayload } from "@/types/auth";

interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isReady: boolean;
  isSubmitting: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const submittingRef = useRef(false);

  useEffect(() => {
    const stored = tokenStore.getUser<AuthUser>();
    if (stored && tokenStore.getToken()) {
      setUser(stored);
    }
    setIsReady(true);
  }, []);

  const logout = useCallback(() => {
    tokenStore.clearToken();
    tokenStore.clearUser();
    setUser(null);
    router.replace("/login");
  }, [router]);

  useEffect(() => {
    setUnauthorizedHandler(() => {
      tokenStore.clearToken();
      tokenStore.clearUser();
      setUser(null);
    });
    return () => setUnauthorizedHandler(null);
  }, []);

  const login = useCallback(async (payload: LoginPayload) => {
    if (submittingRef.current) return;
    submittingRef.current = true;
    setIsSubmitting(true);
    try {
      const data = await loginRequest(payload);
      tokenStore.setToken(data.accessToken);
      const nextUser: AuthUser = {
        id: data.id,
        username: data.username,
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        gender: data.gender,
        image: data.image,
      };
      tokenStore.setUser(nextUser);
      setUser(nextUser);
    } finally {
      submittingRef.current = false;
      setIsSubmitting(false);
    }
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: !!user,
      isReady,
      isSubmitting,
      login,
      logout,
    }),
    [user, isReady, isSubmitting, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
