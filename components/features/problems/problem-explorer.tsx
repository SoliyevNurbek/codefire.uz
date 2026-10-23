"use client";

import { keepPreviousData, useInfiniteQuery, useQuery, useQueryClient } from "@tanstack/react-query";
import { useWindowVirtualizer } from "@tanstack/react-virtual";
import { ArrowUpDown, Flame, RotateCcw, Search, SearchX, Tags } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { StatusIcon } from "@/components/features/status-icon";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/controls";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/menu";
import { Kbd, Skeleton } from "@/components/ui/misc";
import { Difficulty } from "@/components/ui/rank";
import { Select } from "@/components/ui/select";
import { EmptyState, ErrorState } from "@/components/ui/state";
import { Spinner } from "@/components/ui/spinner";
import { Link, useRouter } from "@/i18n/navigation";
import { api } from "@/lib/api/endpoints";
import type { Paginated, ProblemQuery, ProblemSort, ProblemSummary } from "@/lib/api/types";
import { useDebounced } from "@/lib/hooks/use-debounced";
import { problemQueryToSearch as toSearchParams } from "@/lib/problem-query";
import { useMe } from "@/lib/hooks/use-session";
import { qk } from "@/lib/query-keys";
import { RANK_TEXT, RANKS } from "@/lib/rank";
import { cn, formatNumber } from "@/lib/utils";

const MIN = 800;
const MAX = 3000;
const STEPS = Array.from({ length: (MAX - MIN) / 100 + 1 }, (_, i) => MIN + i * 100);

const sameQuery = (a: ProblemQuery, b: ProblemQuery) => toSearchParams(a) === toSearchParams(b);

export function ProblemExplorer({
  initialQuery,
  initialPage,
  tags,
}: {
  initialQuery: ProblemQuery;
  initialPage: Paginated<ProblemSummary>;
  tags: string[];
}) {
  const t = useTranslations("problems");
  const ts = useTranslations("status");
  const tc = useTranslations("common");
  const router = useRouter();
  const client = useQueryClient();
  const { data: me } = useMe();

  const [search, setSearch] = useState(initialQuery.search ?? "");
  const [filters, setFilters] = useState<Omit<ProblemQuery, "search" | "page">>({
    tags: initialQuery.tags,
    minDifficulty: initialQuery.minDifficulty,
    maxDifficulty: initialQuery.maxDifficulty,
    status: initialQuery.status,
    sort: initialQuery.sort,
  });
  const debouncedSearch = useDebounced(search, 200);
  const query: ProblemQuery = useMemo(() => ({ ...filters, search: debouncedSearch || undefined }), [filters, debouncedSearch]);

  // Filters live in the URL (shareable, survive reload) without a server round trip.
  useEffect(() => {
    const qs = toSearchParams(query);
    const url = `${window.location.pathname}${qs ? `?${qs}` : ""}`;
    if (url !== `${window.location.pathname}${window.location.search}`) window.history.replaceState(null, "", url);
    try {
      localStorage.setItem("cf-problem-filters", qs);
    } catch {
      /* ignore */
    }
  }, [query]);

  const list = useInfiniteQuery({
    queryKey: qk.problems(query),
    queryFn: ({ pageParam, signal }) => api.problems.list({ ...query, page: pageParam }, { signal }),
    initialPageParam: 1,
    getNextPageParam: (last) => (last.page * last.pageSize < last.count ? last.page + 1 : undefined),
    initialData: sameQuery(query, initialQuery) ? { pages: [initialPage], pageParams: [1] } : undefined,
    placeholderData: keepPreviousData, // keep the old rows while new filters load: no flicker
  });

  // Personal solve status is layered on top of the public (cacheable) list.
  const statuses = useQuery({ queryKey: qk.statuses, queryFn: () => api.problems.statuses(), enabled: !!me, staleTime: 60_000 });

  const rows = useMemo(() => list.data?.pages.flatMap((p) => p.results) ?? [], [list.data]);
  const total = list.data?.pages[0]?.count ?? 0;

  const tableRef = useRef<HTMLTableSectionElement>(null);
  const [scrollMargin, setScrollMargin] = useState(0);
  useLayoutEffect(() => {
    const el = tableRef.current;
    if (el) setScrollMargin(el.getBoundingClientRect().top + window.scrollY);
  }, []);
  const virtualizer = useWindowVirtualizer({
    count: rows.length,
    estimateSize: () => 41,
    overscan: 12,
    scrollMargin,
    initialRect: { width: 1280, height: 900 }, // SSR renders the first screen of rows
  });
  const items = virtualizer.getVirtualItems();
  const last = items[items.length - 1];

  useEffect(() => {
    if (last && last.index >= rows.length - 20 && list.hasNextPage && !list.isFetchingNextPage) void list.fetchNextPage();
  }, [last, rows.length, list]);

  const prefetch = (id: string) => {
    router.prefetch(`/problems/${id}`);
    void client.prefetchQuery({ queryKey: qk.problem(id), queryFn: () => api.problems.get(id), staleTime: 60_000 });
  };

  const active =
    !!search || !!filters.tags?.length || !!filters.minDifficulty || !!filters.maxDifficulty || !!filters.status || !!filters.sort;
  const reset = () => {
    setSearch("");
    setFilters({});
  };
  const toggleTag = (tag: string) =>
    setFilters((f) => {
      const next = f.tags?.includes(tag) ? f.tags.filter((x) => x !== tag) : [...(f.tags ?? []), tag];
      return { ...f, tags: next.length ? next : undefined };
    });

  const paddingTop = items.length ? items[0].start - virtualizer.options.scrollMargin : 0;
  const paddingBottom = items.length ? virtualizer.getTotalSize() - (last.end - virtualizer.options.scrollMargin) : 0;

  return (
    <div className="flex flex-col gap-4">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <Input
          data-page-search
          aria-label={t("searchLabel")}
          placeholder={t("searchPlaceholder")}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          leading={list.isFetching && !list.isFetchingNextPage ? <Spinner /> : <Search />}
          trailing={<Kbd className="max-sm:hidden">/</Kbd>}
          className="w-full sm:w-60"
        />

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="secondary" className={cn(filters.tags?.length && "border-accent/60")}>
              <Tags aria-hidden />
              {filters.tags?.length ? t("tagsSelected", { count: filters.tags.length }) : t("tags")}
            </Button>
          </PopoverTrigger>
          <PopoverContent align="start" className="w-64 p-1">
            <ul className="max-h-80 overflow-y-auto">
              {tags.map((tag) => (
                <li key={tag}>
                  <label className="flex h-9 cursor-pointer items-center gap-2.5 rounded-md px-2 hover:bg-surface-2">
                    <Checkbox checked={filters.tags?.includes(tag) ?? false} onCheckedChange={() => toggleTag(tag)} />
                    {tag}
                  </label>
                </li>
              ))}
            </ul>
            {!!filters.tags?.length && (
              <div className="border-t border-border p-1">
                <Button variant="ghost" size="sm" className="w-full" onClick={() => setFilters((f) => ({ ...f, tags: undefined }))}>
                  {t("clearTags")}
                </Button>
              </div>
            )}
          </PopoverContent>
        </Popover>

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="secondary" className={cn((filters.minDifficulty || filters.maxDifficulty) && "border-accent/60")}>
              <Flame aria-hidden />
              {t("difficulty")}
              {(filters.minDifficulty || filters.maxDifficulty) && (
                <span className="font-mono text-xs text-fg-muted tabular-nums">
                  {filters.minDifficulty ?? MIN}–{filters.maxDifficulty ?? MAX}
                </span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent align="start" className="w-72 p-3">
            <div className="grid grid-cols-3 gap-1.5">
              {RANKS.map((rank, i) => {
                const from = Math.max(MIN, rank.min);
                const to = (RANKS[i + 1]?.min ?? MAX + 1) - 1;
                const on = filters.minDifficulty === from && filters.maxDifficulty === Math.min(to, MAX);
                return (
                  <button
                    key={rank.id}
                    type="button"
                    aria-pressed={on}
                    onClick={() => setFilters((f) => (on ? { ...f, minDifficulty: undefined, maxDifficulty: undefined } : { ...f, minDifficulty: from, maxDifficulty: Math.min(to, MAX) }))}
                    className={cn(
                      "h-8 rounded-md border border-border text-xs font-semibold transition-colors duration-150 hover:bg-surface-2",
                      RANK_TEXT[rank.id],
                      on && "border-current bg-surface-2",
                    )}
                  >
                    {rank.name}
                  </button>
                );
              })}
            </div>
            <div className="mt-3 flex items-center gap-2">
              <Select
                aria-label={`${t("difficulty")} min`}
                value={filters.minDifficulty ?? MIN}
                onChange={(e) => setFilters((f) => ({ ...f, minDifficulty: Number(e.target.value) === MIN ? undefined : Number(e.target.value) }))}
                className="flex-1 font-mono"
              >
                {STEPS.map((s) => (
                  <option key={s} value={s} disabled={s > (filters.maxDifficulty ?? MAX)}>
                    {s}
                  </option>
                ))}
              </Select>
              <span className="text-fg-subtle">–</span>
              <Select
                aria-label={`${t("difficulty")} max`}
                value={filters.maxDifficulty ?? MAX}
                onChange={(e) => setFilters((f) => ({ ...f, maxDifficulty: Number(e.target.value) === MAX ? undefined : Number(e.target.value) }))}
                className="flex-1 font-mono"
              >
                {STEPS.map((s) => (
                  <option key={s} value={s} disabled={s < (filters.minDifficulty ?? MIN)}>
                    {s}
                  </option>
                ))}
              </Select>
            </div>
          </PopoverContent>
        </Popover>

        {me && (
          <Select
            aria-label={t("status")}
            value={filters.status ?? ""}
            onChange={(e) => setFilters((f) => ({ ...f, status: (e.target.value || undefined) as ProblemQuery["status"] }))}
          >
            <option value="">{t("status")}: {t("statusAny")}</option>
            <option value="solved">{t("statusSolved")}</option>
            <option value="attempted">{t("statusAttempted")}</option>
            <option value="unsolved">{t("statusUnsolved")}</option>
          </Select>
        )}

        <div className="flex items-center gap-1.5">
          <ArrowUpDown aria-hidden className="size-4 text-fg-subtle" />
          <Select
            aria-label={t("sort")}
            value={filters.sort ?? ""}
            onChange={(e) => setFilters((f) => ({ ...f, sort: (e.target.value || undefined) as ProblemSort | undefined }))}
          >
            <option value="">{t("sortNew")}</option>
            <option value="difficulty">{t("sortEasy")}</option>
            <option value="-difficulty">{t("sortHard")}</option>
            <option value="-solved">{t("sortPopular")}</option>
          </Select>
        </div>

        {active && (
          <Button variant="ghost" onClick={reset}>
            <RotateCcw aria-hidden />
            {t("reset")}
          </Button>
        )}

        <p className="ml-auto text-sm text-fg-subtle tabular-nums" aria-live="polite">
          {t("results", { count: formatNumber(total) })}
        </p>
      </div>

      {list.isError && !rows.length ? (
        <ErrorState
          title={tc("errorTitle")}
          description={tc("errorBody")}
          action={
            <Button size="sm" variant="secondary" onClick={() => void list.refetch()}>
              {tc("retry")}
            </Button>
          }
        />
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className={cn("w-full border-collapse text-sm tabular-nums transition-opacity duration-150", list.isPlaceholderData && "opacity-60")}>
              <thead className="bg-surface-2">
                <tr className="h-8 text-left text-xs text-fg-muted">
                  <th scope="col" className="w-10 pl-4 font-medium">
                    <span className="sr-only">{t("status")}</span>
                  </th>
                  <th scope="col" className="w-14 px-3 font-medium">{t("colId")}</th>
                  <th scope="col" className="px-3 font-medium">{t("colName")}</th>
                  <th scope="col" className="hidden px-3 font-medium md:table-cell">{t("colTags")}</th>
                  <th scope="col" className="w-36 px-3 font-medium max-sm:pr-4">{t("colDifficulty")}</th>
                  <th scope="col" className="hidden w-24 px-3 text-right font-medium lg:table-cell">{t("colAcceptance")}</th>
                  <th scope="col" className="hidden w-28 pr-4 pl-3 text-right font-medium sm:table-cell">{t("colSolved")}</th>
                </tr>
              </thead>
              <tbody ref={tableRef}>
                {paddingTop > 0 && <tr aria-hidden style={{ height: paddingTop }} />}
                {items.map((item) => {
                  const p = rows[item.index];
                  const status = statuses.data?.[p.id] ?? p.status;
                  return (
                    <tr
                      key={p.id}
                      ref={virtualizer.measureElement}
                      data-index={item.index}
                      onMouseEnter={() => prefetch(p.id)}
                      onFocus={() => prefetch(p.id)}
                      className="group relative h-10 border-t border-border transition-colors duration-150 hover:bg-surface-2/60"
                    >
                      <td className="pl-4">
                        <StatusIcon status={status} labels={{ solved: ts("solved"), attempted: ts("attempted") }} />
                      </td>
                      <td className="px-3 font-mono text-fg-muted">{p.id}</td>
                      <td className="min-w-36 px-3 py-1.5">
                        {/* The whole row is the link target (stretched), so touch targets stay large. */}
                        <Link
                          href={`/problems/${p.id}`}
                          prefetch={false}
                          className="line-clamp-2 font-medium after:absolute after:inset-0 group-hover:text-accent-text sm:line-clamp-1"
                        >
                          {p.name}
                        </Link>
                      </td>
                      <td className="hidden px-3 md:table-cell">
                        <span className="flex max-w-56 gap-1 overflow-hidden">
                          {p.tags.slice(0, 3).map((tag) => (
                            <Badge key={tag}>{tag}</Badge>
                          ))}
                        </span>
                      </td>
                      <td className="px-3">
                        <Difficulty rating={p.difficulty} />
                      </td>
                      <td className="hidden px-3 text-right font-mono text-fg-muted lg:table-cell">{p.acceptance.toFixed(1)}%</td>
                      <td className="hidden pr-4 pl-3 text-right font-mono text-fg-muted sm:table-cell">{formatNumber(p.solvedCount)}</td>
                    </tr>
                  );
                })}
                {paddingBottom > 0 && <tr aria-hidden style={{ height: paddingBottom }} />}
              </tbody>
            </table>
          </div>

          {!rows.length && !list.isFetching && (
            <EmptyState
              icon={<SearchX />}
              title={t("emptyTitle")}
              description={t("emptyBody")}
              action={
                <Button size="sm" variant="secondary" onClick={reset}>
                  {t("reset")}
                </Button>
              }
            />
          )}
          {!rows.length && list.isFetching && <TableSkeleton />}
          {list.isFetchingNextPage && (
            <div className="flex h-10 items-center justify-center border-t border-border text-fg-subtle">
              <Spinner />
            </div>
          )}
        </Card>
      )}
    </div>
  );
}

export function TableSkeleton({ rows = 8 }: { rows?: number }) {
  return (
    <div aria-hidden>
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="flex h-10 items-center gap-4 border-t border-border px-4">
          <Skeleton className="size-4 rounded-full" />
          <Skeleton className="h-3 w-10" />
          <Skeleton className="h-3 flex-1" />
          <Skeleton className="hidden h-3 w-24 md:block" />
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-3 w-12" />
        </div>
      ))}
    </div>
  );
}
