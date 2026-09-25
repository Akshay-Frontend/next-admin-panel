import axios, { AxiosError, AxiosHeaders } from "axios";
import type { ApiError } from "@/types/api";
import { tokenStore } from "./tokenStore";

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "https://dummyjson.com";

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
});

api.interceptors.request.use((config) => {
  const token = tokenStore.getToken();
  if (token) {
    const headers = AxiosHeaders.from(config.headers);
    headers.set("Authorization", `Bearer ${token}`);
    config.headers = headers;
  }
  return config;
});

let onUnauthorized: (() => void) | null = null;
export function setUnauthorizedHandler(fn: (() => void) | null) {
  onUnauthorized = fn;
}

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ message?: string }>) => {
    if (axios.isCancel(error) || error.code === "ERR_CANCELED") {
      return Promise.reject(error);
    }

    const status = error.response?.status ?? 0;
    const serverMsg = error.response?.data?.message;
    const isNetwork = !error.response;

    if (status === 401 && onUnauthorized) {
      onUnauthorized();
    }

    const normalized: ApiError = {
      status,
      message:
        serverMsg ||
        (isNetwork
          ? "Network error. Please check your connection."
          : error.message || "Something went wrong."),
      isNetwork,
      isAuth: status === 401 || status === 403,
    };
    return Promise.reject(normalized);
  }
);

export function isApiError(err: unknown): err is ApiError {
  return (
    typeof err === "object" &&
    err !== null &&
    "status" in err &&
    "message" in err &&
    "isNetwork" in err
  );
}
