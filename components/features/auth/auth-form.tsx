"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { z } from "zod/mini";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { ErrorState } from "@/components/ui/state";
import { Link } from "@/i18n/navigation";
import { ApiError, MOCKING } from "@/lib/api/client";
import { api } from "@/lib/api/endpoints";
import { useCompleteSignIn } from "@/lib/hooks/use-session";
import { toast } from "@/lib/toast";

type Mode = "login" | "register";

const PHONE_RE = /^\+998 \(\d{2}\) \d{3}-\d{2}-\d{2}$/;

/** Formats as the user types: "90123" → "+998 (90) 123". Always Uzbek numbers (+998 and 9 digits). */
function formatPhone(raw: string) {
  let d = raw.replace(/\D/g, "");
  if (raw.startsWith("+998") || (d.startsWith("998") && d.length > 9)) d = d.slice(3);
  d = d.slice(0, 9);
  if (!d) return "";
  let out = `+998 (${d.slice(0, 2)}`;
  if (d.length > 2) out += `) ${d.slice(2, 5)}`;
  if (d.length > 5) out += `-${d.slice(5, 7)}`;
  if (d.length > 7) out += `-${d.slice(7, 9)}`;
  return out;
}

/** Sign-in and sign-up. Validates on blur, maps API field errors onto inputs, keeps typed values on failure. */
export function AuthForm({ mode, next }: { mode: Mode; next?: string }) {
  const t = useTranslations("auth");
  const complete = useCompleteSignIn();
  const [formError, setFormError] = useState<string | null>(null);

  const schema =
    mode === "login"
      ? z.object({
          login: z.string().check(z.trim(), z.minLength(1, t("required"))),
          password: z.string().check(z.minLength(1, t("required"))),
          fullName: z.optional(z.string()),
          phone: z.optional(z.string()),
          username: z.optional(z.string()),
        })
      : z.object({
          fullName: z.string().check(z.trim(), z.regex(/^\S{2,}(\s+\S+)+$/, t("badFullName"))),
          phone: z.string().check(z.regex(PHONE_RE, t("badPhone"))),
          username: z.string().check(z.regex(/^[a-zA-Z0-9_.]{3,20}$/, t("badUsername"))),
          password: z.string().check(z.minLength(8, t("shortPassword"))),
          login: z.optional(z.string()),
        });
  type Values = { login?: string; fullName?: string; phone?: string; username?: string; password: string };

  // The two modes share one form shape; each schema validates only its own fields.
  const form = useForm<Values>({ resolver: zodResolver(schema) as unknown as Resolver<Values>, mode: "onBlur" });
  const { errors, isSubmitting } = form.formState;
  const phoneField = form.register("phone");

  const onSubmit = form.handleSubmit(async (v) => {
    setFormError(null);
    try {
      const me =
        mode === "login"
          ? await api.auth.login({ login: v.login ?? "", password: v.password })
          : await api.auth.register({
              fullName: (v.fullName ?? "").replace(/\s+/g, " "),
              phone: `+${(v.phone ?? "").replace(/\D/g, "")}`,
              username: v.username ?? "",
              password: v.password,
            });
      toast.success(t("welcome", { name: me.displayName.split(" ")[0] }));
      complete(me, next?.startsWith("/") ? next : "/");
    } catch (e) {
      if (e instanceof ApiError && e.fields) {
        for (const [field, messages] of Object.entries(e.fields)) form.setError(field as keyof Values, { message: messages[0] });
      }
      setFormError(e instanceof ApiError ? e.message : t("required"));
    }
  });

  const describe = (name: keyof Values) => ({ invalid: !!errors[name], "aria-describedby": errors[name] ? `${name}-error` : undefined });

  return (
    <div className="w-full max-w-[420px] rounded-xl border border-border bg-surface p-6 shadow-sm sm:p-8">
      <header className="mb-6">
        <h1 className="text-2xl font-bold tracking-[-0.03em]">{mode === "login" ? t("loginTitle") : t("registerTitle")}</h1>
        <p className="mt-1.5 text-fg-muted">{mode === "login" ? t("loginSubtitle") : t("registerSubtitle")}</p>
      </header>

      <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
        {formError && <ErrorState title={formError} />}
        {mode === "login" ? (
          <Field htmlFor="login" label={t("login")} error={errors.login?.message}>
            <Input id="login" autoComplete="username" autoFocus placeholder={t("loginPlaceholder")} className="h-11" {...describe("login")} {...form.register("login")} />
          </Field>
        ) : (
          <>
            <Field htmlFor="fullName" label={t("fullName")} error={errors.fullName?.message}>
              <Input id="fullName" autoComplete="name" autoFocus placeholder={t("fullNamePlaceholder")} className="h-11" {...describe("fullName")} {...form.register("fullName")} />
            </Field>
            <Field htmlFor="phone" label={t("phone")} error={errors.phone?.message}>
              <Input
                id="phone"
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                placeholder={t("phonePlaceholder")}
                className="h-11 font-mono"
                {...describe("phone")}
                {...phoneField}
                onFocus={(e) => {
                  if (!e.target.value) e.target.value = "+998 (";
                }}
                onChange={(e) => {
                  e.target.value = formatPhone(e.target.value);
                  return phoneField.onChange(e);
                }}
                onBlur={(e) => {
                  if (e.target.value === "+998 (") e.target.value = "";
                  return phoneField.onBlur(e);
                }}
              />
            </Field>
            <Field htmlFor="username" label={t("username")} hint={t("usernameHint")} error={errors.username?.message}>
              <Input id="username" autoComplete="username" placeholder={t("usernamePlaceholder")} className="h-11" {...describe("username")} {...form.register("username")} />
            </Field>
          </>
        )}
        <Field htmlFor="password" label={t("password")} hint={mode === "register" ? t("passwordHint") : undefined} error={errors.password?.message}>
          <PasswordInput
            id="password"
            autoComplete={mode === "login" ? "current-password" : "new-password"}
            placeholder={mode === "login" ? t("passwordPlaceholder") : t("newPasswordPlaceholder")}
            showLabel={t("showPassword")}
            hideLabel={t("hidePassword")}
            className="h-11"
            {...describe("password")}
            {...form.register("password")}
          />
        </Field>
        {mode === "login" && (
          <Link href="/forgot-password" className="-mt-2 self-end text-sm text-accent-text hover:underline">
            {t("forgot")}
          </Link>
        )}
        <Button type="submit" size="lg" loading={isSubmitting} className="mt-1 w-full">
          {mode === "login" ? t("submitLogin") : t("submitRegister")}
        </Button>
      </form>

      <p className="mt-6 border-t border-border pt-5 text-center text-fg-muted">
        {mode === "login" ? t("loginFooter") : t("registerFooter")}{" "}
        <Link href={mode === "login" ? "/register" : "/login"} className="font-medium text-accent-text hover:underline">
          {mode === "login" ? t("submitRegister") : t("submitLogin")}
        </Link>
      </p>
      {MOCKING && <p className="mt-4 rounded-lg bg-surface-2 p-3 text-xs text-fg-muted">{t("mockHint")}</p>}
    </div>
  );
}
