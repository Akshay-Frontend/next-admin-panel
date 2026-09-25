"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { isApiError } from "@/lib/axios";
import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Input";
import { CircleX, LockKeyhole, UserRound } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { login, isSubmitting, isAuthenticated, isReady } = useAuth();

  const [username, setUsername] = useState("emilys");
  const [password, setPassword] = useState("emilyspass");
  const [errors, setErrors] = useState<{
    username?: string;
    password?: string;
  }>({});
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (isReady && isAuthenticated) {
      router.replace("/products");
    }
  }, [isReady, isAuthenticated, router]);

  function validate(): boolean {
    const next: typeof errors = {};

    if (!username.trim()) {
      next.username = "Username is required";
    }

    if (!password) {
      next.password = "Password is required";
    } else if (password.length < 4) {
      next.password = "Password is too short";
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError(null);

    if (!validate()) return;
    if (isSubmitting) return;

    try {
      await login({
        username: username.trim(),
        password,
      });

      router.replace("/products");
    } catch (err) {
      if (isApiError(err)) {
        setFormError(err.message);
      } else {
        setFormError("Unable to log in. Please try again.");
      }
    }
  }

  return (
    <main className="relative flex h-screen  items-center justify-center overflow-hidden bg-black px-4 py-10">
      <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-indigo-500/20 blur-3xl" />
      <div className="absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-purple-500/20 blur-3xl" />

      <div className="relative z-10 w-full max-w-md">
        <div className="rounded-3xl border border-white/20 bg-white/95 p-8 shadow-2xl backdrop-blur-xl">
          <div className="text-center">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
              Welcome
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Sign in to continue to your account
            </p>
          </div>

          <form
            className="mt-8 flex flex-col gap-5"
            onSubmit={onSubmit}
            noValidate
          >
            <Field label="Username" error={errors.username}>
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                  <UserRound />
                </span>

                <Input
                  autoFocus
                  autoComplete="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  invalid={!!errors.username}
                  disabled={isSubmitting}
                  className="pl-10"
                  placeholder="Enter your username"
                />
              </div>
            </Field>

            <Field label="Password" error={errors.password}>
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                  <LockKeyhole />
                </span>

                <Input
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  invalid={!!errors.password}
                  disabled={isSubmitting}
                  className="pl-10"
                  placeholder="Enter your password"
                />
              </div>
            </Field>
            {formError && (
              <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                <span><CircleX /></span>
                <span>{formError}</span>
              </div>
            )}

            <div className="flex items-end justify-end   text-sm">
              <button
                type="button"
                className="font-medium text-indigo-600 cursor-pointer"
              >
                Forgot password?
              </button>
            </div>

            <Button
              type="submit"
              loading={isSubmitting}
              className="mt-1 h-12 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-base font-semibold shadow-lg cursor-pointer"
            >
              {isSubmitting ? "Signing in..." : "Sign in"}
            </Button>
          </form>
        </div>
      </div>
    </main>
  );
}
