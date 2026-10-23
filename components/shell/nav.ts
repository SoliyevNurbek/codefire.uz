import {
  Binary,
  CircleHelp,
  Dumbbell,
  GraduationCap,
  House,
  Info,
  ListChecks,
  Map,
  Newspaper,
  Shield,
  SquareCode,
  ChartNoAxesColumn,
  Trophy,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  key: string; // messages: nav.<key>
  href: string;
  icon: LucideIcon;
  /** Not built yet: shows a "coming soon" badge and page. */
  soon?: boolean;
}

export const NAV_GROUPS: { key: string; items: NavItem[]; label?: false }[] = [
  { key: "main", label: false, items: [{ key: "home", href: "/", icon: House }] },
  {
    key: "practice",
    items: [
      { key: "problems", href: "/problems", icon: SquareCode },
      { key: "submissions", href: "/submissions", icon: ListChecks },
      { key: "contests", href: "/contests", icon: Trophy },
      { key: "trainings", href: "/contests?tab=trainings", icon: Dumbbell },
    ],
  },
  {
    key: "learn",
    items: [
      { key: "courses", href: "/courses", icon: GraduationCap, soon: true },
      { key: "roadmap", href: "/roadmap", icon: Map, soon: true },
      { key: "algorithms", href: "/algorithms", icon: Binary, soon: true },
    ],
  },
  {
    key: "community",
    items: [
      { key: "rating", href: "/rating", icon: ChartNoAxesColumn },
      { key: "clans", href: "/clans", icon: Shield, soon: true },
      { key: "blogs", href: "/blogs", icon: Newspaper, soon: true },
    ],
  },
  {
    key: "platform",
    items: [
      { key: "howItWorks", href: "/how-it-works", icon: CircleHelp, soon: true },
      { key: "about", href: "/about", icon: Info, soon: true },
    ],
  },
];

/** Phone bottom bar: the four main sections plus the menu button. */
export const TAB_ITEMS: NavItem[] = [
  { key: "home", href: "/", icon: House },
  { key: "problems", href: "/problems", icon: SquareCode },
  { key: "contests", href: "/contests", icon: Trophy },
  { key: "rating", href: "/rating", icon: ChartNoAxesColumn },
];

export function isActive(pathname: string, href: string, search = "") {
  const [path, query] = href.split("?");
  if (path === "/") return pathname === "/";
  if (query) return pathname === path && search.includes(query);
  if (path === "/contests" && search.includes("tab=trainings")) return false;
  return pathname === path || pathname.startsWith(`${path}/`);
}
