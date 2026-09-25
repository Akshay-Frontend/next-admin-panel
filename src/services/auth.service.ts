import { api } from "@/lib/axios";
import type { LoginPayload, LoginResponse, AuthUser } from "@/types/auth";

export async function login(payload: LoginPayload): Promise<LoginResponse> {
  const res = await api.post<LoginResponse>("/auth/login", payload);
  return res.data;
}

export async function fetchCurrentUser(): Promise<AuthUser> {
  const res = await api.get<AuthUser>("/auth/me");
  return res.data;
}
