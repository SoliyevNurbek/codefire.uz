import type { Metadata, Viewport } from "next";
import { Geist, JetBrains_Mono } from "next/font/google";
import { notFound } from "next/navigation";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Providers } from "@/components/providers";
import { routing } from "@/i18n/routing";
import "katex/dist/katex.min.css";
import "../globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin", "cyrillic"], display: "swap" });
const jetbrainsMono = JetBrains_Mono({ variable: "--font-jetbrains-mono", subsets: ["latin", "cyrillic"], display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL("https://codefire.uz"),
  title: { default: "Codefire — algoritmik masalalar va musobaqalar", template: "%s — Codefire" },
  description: "Algoritmik masalalar, reytingli musobaqalar va kurslar — O'zbekiston dasturchilari uchun.",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#121214" },
  ],
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

// Applies the remembered sidebar state before first paint (no layout shift).
const sidebarScript = `try{var s=localStorage.getItem("cf-sidebar");if(s)document.documentElement.dataset.sidebar=s}catch(e){}`;

export default async function LocaleLayout({ children, params }: { children: React.ReactNode; params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);
  const t = await getTranslations("topbar");

  return (
    <html lang={locale} className={`${geistSans.variable} ${jetbrainsMono.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: sidebarScript }} />
      </head>
      <body className="antialiased">
        <a
          href="#main"
          className="fixed top-2 left-2 z-[100] -translate-y-16 rounded-md bg-accent px-3 py-2 font-medium text-accent-on focus:translate-y-0"
        >
          {t("skip")}
        </a>
        <NextIntlClientProvider>
          <Providers>{children}</Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
