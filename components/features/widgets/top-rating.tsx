import { getTranslations } from "next-intl/server";
import { Card, CardHeader } from "@/components/ui/card";
import { UserHandle } from "@/components/ui/rank";
import { Link } from "@/i18n/navigation";
import { api } from "@/lib/api/endpoints";

/** Right-rail widget: top 10 by rating. Server-rendered, revalidated with the page. */
export async function TopRatingCard() {
  const t = await getTranslations();
  const users = await api.users.list({ sort: "rating" }).then((r) => r.results.slice(0, 10)).catch(() => null);
  return (
    <Card>
      <CardHeader
        title={t("dashboard.topRating")}
        action={
          <Link href="/rating" className="text-sm text-accent-text hover:underline">
            {t("common.seeAll")}
          </Link>
        }
      />
      {users ? (
        <ol className="py-1">
          {users.map((u, i) => (
            <li key={u.username} className="flex h-9 items-center gap-3 px-4 text-sm">
              <span className="w-5 text-right font-mono text-fg-subtle tabular-nums">{i + 1}</span>
              <UserHandle username={u.username} rating={u.rating} className="min-w-0 flex-1 truncate" />
              <span className="font-mono text-fg-muted tabular-nums">{u.rating}</span>
            </li>
          ))}
        </ol>
      ) : (
        <p className="px-4 py-6 text-fg-muted">{t("common.errorBody")}</p>
      )}
    </Card>
  );
}
