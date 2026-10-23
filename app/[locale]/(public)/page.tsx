import { cookies } from "next/headers";
import { setRequestLocale } from "next-intl/server";
import { Dashboard } from "@/components/features/home/dashboard";
import { Landing } from "@/components/features/home/landing";
import { api } from "@/lib/api/endpoints";

/** "/" is the landing page when signed out and the personal dashboard when signed in. */
export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const cookie = (await cookies()).toString();
  const me = cookie ? await api.auth.me({ cookie }).catch(() => null) : null;
  return me ? <Dashboard me={me} cookie={cookie} /> : <Landing />;
}
