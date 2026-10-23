import { CircleCheck, CircleDot, Inbox, Plus, Search, Send } from "lucide-react";
import type { Metadata } from "next";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Checkbox, Switch } from "@/components/ui/controls";
import { Field, Input } from "@/components/ui/input";
import { Avatar, Kbd, Skeleton } from "@/components/ui/misc";
import { Difficulty, RankBadge, UserHandle } from "@/components/ui/rank";
import { EmptyState, ErrorState } from "@/components/ui/state";
import { Table, TBody, Td, Th, THead, Tr } from "@/components/ui/table";
import { SegmentedList, SegmentedTrigger, Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { VerdictBadge } from "@/components/ui/verdict-badge";
import { RANKS } from "@/lib/rank";
import { formatNumber } from "@/lib/utils";
import type { Verdict } from "@/lib/verdict";

export const metadata: Metadata = { title: "Dizayn tizimi", robots: { index: false } };

const SURFACES = [
  ["bg", "Sahifa foni"],
  ["surface", "Karta, jadval"],
  ["surface-2", "Sarlavha, hover"],
  ["surface-3", "Bosilgan, skeleton"],
  ["border", "Chegara"],
  ["border-strong", "Kiritish chegarasi"],
] as const;

const TEXT = [
  ["fg", "Asosiy matn"],
  ["fg-muted", "Ikkilamchi"],
  ["fg-subtle", "Yordamchi"],
  ["accent-text", "Urg'u matni"],
] as const;

const PROBLEMS: {
  id: string;
  name: string;
  tags: string[];
  rating: number;
  solved: number;
  status: "solved" | "attempted" | "none";
}[] = [
  { id: "37A", name: "Ikki son yig'indisi", tags: ["matematika"], rating: 800, solved: 12480, status: "solved" },
  { id: "112B", name: "Toshkent metrosi", tags: ["graflar", "BFS"], rating: 1350, solved: 3021, status: "attempted" },
  { id: "208C", name: "Eng uzun palindrom", tags: ["satrlar", "DP"], rating: 1600, solved: 1288, status: "none" },
  { id: "315D", name: "Paxta dalasi", tags: ["geometriya"], rating: 1900, solved: 402, status: "solved" },
  { id: "421E", name: "Segment daraxti", tags: ["ma'lumotlar tuzilmasi"], rating: 2200, solved: 97, status: "none" },
  { id: "500F", name: "Samarqand yo'llari", tags: ["graflar", "oqimlar"], rating: 2650, solved: 11, status: "none" },
];

const USERS = [
  { username: "jasur_k", rating: 1040 },
  { username: "malika.dev", rating: 1310 },
  { username: "sardorbek", rating: 1560 },
  { username: "nodira_a", rating: 1840 },
  { username: "timur", rating: 2215 },
  { username: "aziz_uz", rating: 2731 },
];

const VERDICT_LIST: { v: Verdict; test?: number }[] = [
  { v: "AC" },
  { v: "WA", test: 7 },
  { v: "TLE", test: 12 },
  { v: "MLE", test: 3 },
  { v: "RE", test: 5 },
  { v: "CE" },
  { v: "PENDING" },
  { v: "RUNNING", test: 14 },
];

function Section({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return (
    <section className="grid gap-4 border-t border-border py-10 lg:grid-cols-[240px_1fr] lg:gap-10">
      <div>
        <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
        <p className="mt-1 text-fg-muted">{description}</p>
      </div>
      <div className="min-w-0">{children}</div>
    </section>
  );
}

function Swatch({ token, label }: { token: string; label: string }) {
  return (
    <div className="flex items-center gap-3">
      <span
        className="size-9 shrink-0 rounded-md border border-border-strong"
        style={{ backgroundColor: `var(--${token})` }}
      />
      <div className="min-w-0">
        <p className="font-mono text-xs text-fg">--{token}</p>
        <p className="text-xs text-fg-subtle">{label}</p>
      </div>
    </div>
  );
}

function StatusIcon({ status }: { status: "solved" | "attempted" | "none" }) {
  if (status === "solved")
    return <CircleCheck aria-label="Yechilgan" className="size-4 text-verdict-ac" />;
  if (status === "attempted")
    return <CircleDot aria-label="Urinilgan" className="size-4 text-verdict-tle" />;
  return <span aria-label="Urinilmagan" className="block size-4" />;
}

export default function DesignSystemPage() {
  return (
    <main className="mx-auto max-w-[1280px] px-4 pb-24 sm:px-6">
      <header className="flex items-center justify-between gap-4 py-8">
        <div>
          <p className="font-mono text-sm text-accent-text">codefire / dizayn tizimi</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight">Tokenlar va komponentlar</h1>
        </div>
        <ThemeToggle />
      </header>

      <Section
        title="Reyting zinapoyasi"
        description="Rang olov haroratiga mos: kuldan qizil, to'q sariq, sariq, ko'k va binafsharangga. Masala qiyinligi ham shu shkalada."
      >
        <div className="grid gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
          {RANKS.map((rank, i) => {
            const user = USERS[i];
            const next = RANKS[i + 1];
            return (
              <div key={rank.id} className="flex flex-col gap-3 bg-surface p-4">
                <div className="flex items-center justify-between">
                  <RankBadge rating={user.rating} />
                  <span className="font-mono text-xs text-fg-subtle tabular-nums">
                    {rank.min}
                    {next ? `–${next.min - 1}` : "+"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <UserHandle username={user.username} rating={user.rating} />
                  <Difficulty rating={user.rating} />
                </div>
              </div>
            );
          })}
        </div>
      </Section>

      <Section title="Verdiktlar" description="Har joyda bir xil ko'rinish. Qisqa kod mono shriftda, to'liq nom esa tooltip va ekran o'quvchisi uchun.">
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap gap-2">
            {VERDICT_LIST.map(({ v, test }) => (
              <VerdictBadge key={v} verdict={v} test={test} />
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            {(["AC", "WA", "TLE", "CE"] as const).map((v) => (
              <VerdictBadge key={v} verdict={v} full />
            ))}
          </div>
        </div>
      </Section>

      <Section title="Ranglar" description="Tekis fon, faqat 1px chegaralar. To'q sariq urg'u faqat asosiy tugma, faol navigatsiya, fokus va muhim raqamlarda.">
        <div className="grid gap-6">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {SURFACES.map(([t, l]) => (
              <Swatch key={t} token={t} label={l} />
            ))}
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {TEXT.map(([t, l]) => (
              <Swatch key={t} token={t} label={l} />
            ))}
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <Swatch token="accent" label="Urg'u (to'ldirish)" />
            <Swatch token="accent-soft" label="Urg'u foni" />
            <Swatch token="ring" label="Fokus halqasi" />
          </div>
        </div>
      </Section>

      <Section title="Tipografiya" description="Geist — interfeys, JetBrains Mono — kod, ID, verdikt va jadvaldagi raqamlar. Asos 14px, jadval 13px, matn o'qish uchun 16px.">
        <div className="flex flex-col gap-4">
          <p className="text-4xl font-semibold tracking-tight">Har kuni bitta masala</p>
          <p className="text-2xl font-semibold tracking-tight">Haftalik musobaqa #48</p>
          <p className="text-lg font-semibold">Kirish ma&apos;lumotlari</p>
          <p className="max-w-[68ch] text-md text-fg">
            Birinchi qatorda <span className="font-mono">n</span> butun son berilgan (1 ≤ n ≤ 2·10⁵). Ikkinchi
            qatorda massiv elementlari joylashgan. Eng uzun o&apos;suvchi qism ketma-ketlik uzunligini toping.
          </p>
          <p className="text-fg-muted">Ikkilamchi matn — 14px, zinc-600.</p>
          <p className="font-mono text-sm">
            37A · 1 s · 256 MB · <span className="text-accent-text">12 480</span> yechim
          </p>
        </div>
      </Section>

      <Section title="Tugmalar" description="Asosiy tugma sahifada bitta. To'q sariq fon ustida qora matn — oq matn AA kontrastdan o'tmaydi.">
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <Button>
              <Send /> Yuborish
            </Button>
            <Button variant="secondary">Misollarda sinash</Button>
            <Button variant="ghost">Bekor qilish</Button>
            <Button variant="danger">Klandan chiqish</Button>
            <Button variant="link">Barcha musobaqalar</Button>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button size="sm">Ro&apos;yxatdan o&apos;tish</Button>
            <Button size="lg">Masala yechishni boshlash</Button>
            <Button loading>Yuborilmoqda</Button>
            <Button variant="secondary" disabled>
              Tugadi
            </Button>
            <Button variant="secondary" size="icon" aria-label="Qo'shish">
              <Plus />
            </Button>
          </div>
        </div>
      </Section>

      <Section title="Kiritish" description="8px radius, fokusda to'q sariq halqa. Xato matni nima bo'lganini va qanday tuzatishni aytadi.">
        <div className="grid max-w-xl gap-4">
          <Input
            aria-label="Masala qidirish"
            placeholder="Masala nomi yoki ID, masalan 37A"
            leading={<Search />}
            trailing={<Kbd>/</Kbd>}
          />
          <Field htmlFor="username" label="Foydalanuvchi nomi" hint="Lotin harflari, raqam va _ belgisi, 3–20 ta.">
            <Input id="username" defaultValue="malika.dev" />
          </Field>
          <Field htmlFor="email" label="Email" error="Bu email allaqachon ro'yxatdan o'tgan. Kirish sahifasiga o'ting.">
            <Input id="email" defaultValue="aziz@mail.uz" invalid aria-describedby="email-error" />
          </Field>
          <div className="flex flex-wrap items-center gap-6">
            <label className="flex items-center gap-2">
              <Checkbox defaultChecked /> Yechilganlarni yashirish
            </label>
            <label className="flex items-center gap-2">
              <Switch defaultChecked /> Vim rejimi
            </label>
          </div>
        </div>
      </Section>

      <Section title="Belgilar va tablar" description="Belgilar to'liq yumaloq. Tablar ostida 2px urg'u chizig'i; ICPC/IOI kabi rejimlar uchun segmentli tanlov.">
        <div className="flex flex-col gap-6">
          <div className="flex flex-wrap items-center gap-2">
            <Badge>graflar</Badge>
            <Badge>DP</Badge>
            <Badge variant="outline" mono>
              Div 2
            </Badge>
            <Badge variant="accent">Reytingli</Badge>
            <Badge variant="outline">Reytingsiz</Badge>
            <RankBadge rating={1840} showRating />
          </div>
          <Tabs defaultValue="contests">
            <TabsList>
              <TabsTrigger value="contests">Musobaqalar</TabsTrigger>
              <TabsTrigger value="trainings">Mashg&apos;ulotlar</TabsTrigger>
            </TabsList>
            <TabsContent value="contests" className="text-fg-muted">
              3 ta musobaqa boshlanmagan, 1 tasi davom etmoqda.
            </TabsContent>
            <TabsContent value="trainings" className="text-fg-muted">
              Mashg&apos;ulotlar ro&apos;yxati.
            </TabsContent>
          </Tabs>
          <Tabs defaultValue="icpc">
            <SegmentedList aria-label="Natijalar rejimi">
              <SegmentedTrigger value="icpc">ICPC</SegmentedTrigger>
              <SegmentedTrigger value="ioi">IOI</SegmentedTrigger>
            </SegmentedList>
          </Tabs>
        </div>
      </Section>

      <Section title="Jadval" description="Zich: 36px qator, 13px matn, raqamlar mono va o'ngga tekislangan. Sarlavha yopishqoq.">
        <Card className="overflow-hidden">
          <Table>
            <THead>
              <tr>
                <Th className="w-10">
                  <span className="sr-only">Holat</span>
                </Th>
                <Th className="w-16">ID</Th>
                <Th>Nomi</Th>
                <Th className="hidden md:table-cell">Teglar</Th>
                <Th>Qiyinlik</Th>
                <Th numeric>Yechganlar</Th>
              </tr>
            </THead>
            <TBody>
              {PROBLEMS.map((p) => (
                <Tr key={p.id}>
                  <Td>
                    <StatusIcon status={p.status} />
                  </Td>
                  <Td mono className="text-fg-muted">
                    {p.id}
                  </Td>
                  <Td>
                    <a href="#" className="font-medium hover:text-accent-text">
                      {p.name}
                    </a>
                  </Td>
                  <Td className="hidden md:table-cell">
                    <span className="flex gap-1">
                      {p.tags.map((t) => (
                        <Badge key={t}>{t}</Badge>
                      ))}
                    </span>
                  </Td>
                  <Td>
                    <Difficulty rating={p.rating} />
                  </Td>
                  <Td numeric className="text-fg-muted">
                    {formatNumber(p.solved)}
                  </Td>
                </Tr>
              ))}
            </TBody>
          </Table>
        </Card>
      </Section>

      <Section title="Holatlar" description="Har sahifada yuklanish, bo'sh va xato holatlari loyihalangan. Skeletonlar joyni oldindan egallaydi (CLS yo'q).">
        <div className="grid gap-4 lg:grid-cols-3">
          <Card>
            <CardHeader title="Yuklanmoqda" />
            <CardBody className="flex flex-col gap-3">
              {[0, 1, 2].map((i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="size-8 rounded-full" />
                  <div className="flex flex-1 flex-col gap-1.5">
                    <Skeleton className="h-3 w-2/3" />
                    <Skeleton className="h-3 w-1/3" />
                  </div>
                </div>
              ))}
            </CardBody>
          </Card>
          <Card>
            <CardHeader title="Bo'sh" />
            <EmptyState
              icon={<Inbox />}
              title="Hali urinishlar yo'q"
              description="Birinchi masalani yeching — natijalar shu yerda chiqadi."
              action={<Button size="sm">Masalalarga o&apos;tish</Button>}
              className="py-8"
            />
          </Card>
          <div className="flex flex-col gap-4">
            <ErrorState
              title="Masalalar yuklanmadi"
              description="Server javob bermadi. Internetni tekshirib, qayta urining."
              action={
                <Button size="sm" variant="secondary">
                  Qayta urinish
                </Button>
              }
            />
            <Card>
              <CardBody className="flex items-center gap-3">
                <Avatar name="Nodira Aliyeva" size={40} />
                <div className="flex-1">
                  <UserHandle username="nodira_a" rating={1840} />
                  <p className="text-xs text-fg-subtle">Toshkent · TATU</p>
                </div>
                <span className="font-mono text-sm text-fg-muted">
                  <Kbd>Ctrl</Kbd> <Kbd>K</Kbd>
                </span>
              </CardBody>
            </Card>
          </div>
        </div>
      </Section>
    </main>
  );
}
