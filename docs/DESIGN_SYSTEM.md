# Codefire design system

Living reference: run the app and open `/design-system`. Tokens live in `app/globals.css`;
components live in `components/ui/`. Components never use raw hex values or arbitrary colors.
They only use the semantic tokens below.

## Principles

1. **Flat and crisp.** Solid backgrounds only. No gradients, patterns, glows or decorative shapes.
   Depth comes from 1px borders, spacing and at most `shadow-sm`.
2. **Content first, dense where it matters.** Tables are compact (36px rows, 13px text).
   Only the landing page gets generous whitespace.
3. **One accent, used sparingly.** Fire orange marks the primary action, the active nav item,
   the focus ring and key numbers. Nothing else.
4. **Heat means skill.** The rank ladder follows flame temperature. Problem difficulty uses the
   same ladder, so one color language covers users and problems.
5. **Both themes are first-class.** Every token is defined for light and dark. Theme follows the
   system by default, and next-themes sets it before first paint, so there is no flash.

## Color tokens

Two tiers: reference hex values (only in `globals.css`) → semantic tokens (used everywhere,
exposed to Tailwind as `bg-surface`, `text-fg-muted`, `text-verdict-ac`, …).

### Surfaces and text

| Token            | Light     | Dark      | Use                                 |
| ---------------- | --------- | --------- | ----------------------------------- |
| `bg`             | `#fafafa` | `#09090b` | Page background                     |
| `surface`        | `#ffffff` | `#121214` | Cards, tables, inputs               |
| `surface-2`      | `#f4f4f5` | `#1c1c1f` | Table header, hover, subtle fills   |
| `surface-3`      | `#e4e4e7` | `#27272a` | Pressed state, skeletons            |
| `border`         | `#e4e4e7` | `#27272a` | Default 1px border                  |
| `border-strong`  | `#d4d4d8` | `#3f3f46` | Inputs, secondary buttons           |
| `fg`             | `#18181b` | `#fafafa` | Primary text                        |
| `fg-muted`       | `#52525b` | `#a1a1aa` | Secondary text (7.7:1 / 7.8:1)      |
| `fg-subtle`      | `#71717a` | `#8b8b94` | Hints, meta. The minimum for text (4.8:1 / 5.5:1 on surface) |

### Accent

| Token         | Light     | Dark      | Note                                                   |
| ------------- | --------- | --------- | ------------------------------------------------------ |
| `accent`      | `#f97316` | `#f97316` | Fill only (primary button, active tab bar, checkbox)   |
| `accent-on`   | `#18181b` | `#09090b` | Text on accent fill: 6.3:1                             |
| `accent-text` | `#c2410c` | `#fb923c` | Orange used as text/links: 5.2:1 / 8.8:1               |
| `accent-soft` | `#fff7ed` | `#2a1608` | Highlighted row (own row in standings), accent badge   |
| `ring`        | `#ea580c` | `#f97316` | Focus outline, 2px, offset 2px (≥3:1 non-text)         |

**Why dark text on orange buttons:** white on `#F97316` is 2.8:1 and fails WCAG AA. Dark text
keeps the true brand orange and passes at 6.3:1.

### Verdicts

Verdict colors appear only in verdicts and solve status. Badges use the tone as text, a 10% tint
as fill and a 25% tint as the border.

| Verdict              | Tone      | Light     | Dark      |
| -------------------- | --------- | --------- | --------- |
| Accepted (AC)        | `ac`      | `#15803d` | `#4ade80` |
| Wrong answer, RE     | `wa`      | `#b91c1c` | `#f87171` |
| TLE, MLE             | `tle`     | `#b45309` | `#fbbf24` |
| Compilation error    | `ce`      | `#475569` | `#94a3b8` |
| Pending / Running    | `pending` | `#52525b` | `#a1a1aa` (+ spinner) |

### Rank ladder

| Rank    | Rating    | Light     | Dark      | Heat         |
| ------- | --------- | --------- | --------- | ------------ |
| Spark   | 0–1199    | `#71717a` | `#a1a1aa` | ash          |
| Ember   | 1200–1399 | `#991b1b` | `#f87171` | deep red     |
| Flame   | 1400–1699 | `#c2410c` | `#fb923c` | orange       |
| Blaze   | 1700–1999 | `#a16207` | `#facc15` | yellow       |
| Inferno | 2000–2399 | `#1d4ed8` | `#60a5fa` | blue (hottest flame) |
| Phoenix | 2400+     | `#6d28d9` | `#a78bfa` | violet       |

All rank colors pass 4.5:1 as text on `surface` in both themes. Logic is in `lib/rank.ts`.
Rank badges carry a flame glyph (Spark: a spark glyph), so they never read as verdicts even
where the hues overlap (Ember / WA).

## Typography

- **Geist** (UI) and **JetBrains Mono** (code, problem IDs, verdicts, numbers in tables). Both
  load via `next/font` with `display: swap` and the latin + cyrillic subsets.
- Tables always use `tabular-nums`. Large numbers are grouped with a thin space (`12 480`) via
  `formatNumber`.

| Token       | Size / line | Use                                    |
| ----------- | ----------- | -------------------------------------- |
| `text-2xs`  | 11 / 16     | Kbd, rare table meta                   |
| `text-xs`   | 12 / 16     | Badges, hints, column headers          |
| `text-sm`   | 13 / 20     | Table cells                            |
| `text-base` | 14 / 22     | UI body (default)                      |
| `text-md`   | 16 / 26     | Reading text: statements, blog posts (max 68ch) |
| `text-lg`   | 18          | Section titles                         |
| `text-2xl`  | 24          | Page titles                            |
| `text-4xl`+ | 36+         | Landing only, `tracking-tight`         |

Weights: 400 body, 500 labels/buttons, 600 headings and emphasis. Labels use sentence case,
never all caps.

## Shape, space, elevation, motion

- **Radius:** `rounded-lg` (8px) cards and inputs, `rounded-md` (6px) buttons, `rounded-full`
  badges, `rounded-sm` (4px) checkboxes and kbd.
- **Spacing:** Tailwind 4px scale. Card padding `p-4`, page gutter `px-4` / `sm:px-6`, max
  content width 1280px, right rail 320px.
- **Elevation:** `shadow-sm` on cards and secondary buttons. Nothing larger except overlays
  (dialogs, popovers), which also get a border.
- **Motion:** 150ms `transition-colors` by default, 200ms max. No entrance animations. The
  global `prefers-reduced-motion` rule disables all motion.
- **Icons:** lucide-react, 16px in controls, 18px in nav, default stroke.

## Components (`components/ui/`)

| Component | File | Variants / notes |
| --- | --- | --- |
| Button | `button.tsx` | `primary` (one per view), `secondary`, `ghost`, `danger`, `link`; sizes `sm` 32, `md` 36, `lg` 44, `icon`, `icon-sm`; `loading` shows a spinner and sets `aria-busy` |
| Input, Field | `input.tsx` | `leading` icon, `trailing` (kbd hint), `invalid`. Field wires up label, hint and error text |
| Badge | `badge.tsx` | `neutral` (tags), `outline` (Div, unrated), `accent` (rated); `mono` |
| VerdictBadge | `verdict-badge.tsx` | The only way to render a verdict. Short code by default, `full` for the Uzbek label, `test` for the test number |
| RankBadge, UserHandle, Difficulty | `rank.tsx` | Rank pill; username colored by rank; problem difficulty as a 5-step heat bar + rating |
| Card | `card.tsx` | `Card`, `CardHeader` (title + action, 48px), `CardBody` |
| Table | `table.tsx` | `Th`/`Td` take `numeric` (right-aligned mono); `Tr highlight` for own row |
| Tabs, Segmented | `tabs.tsx` | Underline tabs for sections; segmented control for 2–4 modes (ICPC/IOI) |
| Checkbox, Switch | `controls.tsx` | Native inputs (`appearance-none`), `role="switch"` for Switch. Zero JS |
| Select | `select.tsx` | Native `<select>`: platform pickers on mobile. `AutoSubmitSelect` submits its GET form on change |
| Popover, Menu | `menu.tsx` | Native HTML `popover`: top layer, Esc and light-dismiss from the browser; arrow keys in menus. ~1 KB instead of Radix + floating-ui |
| Dialog, Drawer | `dialog.tsx` | Radix Dialog; used only by lazily loaded overlays (palette, shortcuts, mobile drawer) |
| Countdown | `countdown.tsx` | One shared 1s clock; fixed `ch` width so ticking never shifts layout |
| LinkTabs | `link-tabs.tsx` | Tabs as real links (`?tab=`): server-rendered and shareable |
| Tooltip | `tooltip.tsx` | Inverted (fg background), 300ms delay |
| Kbd, Skeleton, Avatar, Separator, Spinner | `misc.tsx`, `spinner.tsx` | Avatar reserves its size (no CLS) |
| EmptyState, ErrorState | `state.tsx` | Required on every data view |

## Writing rules (Uzbek, Latin script)

- Buttons name the action: **Yuborish**, **Qatnashish**, **Ro'yxatdan o'tish**. The result toast
  reuses the same verb.
- Errors say what happened and what to do next. They don't apologize.
  Example: "Bu email allaqachon ro'yxatdan o'tgan. Kirish sahifasiga o'ting."
- Empty states invite an action: "Hali urinishlar yo'q" + "Masalalarga o'tish".
- Sentence case everywhere. Keep the apostrophe in o', g' and in ʼ positions as a plain `'`.

## Accessibility baseline

- Text contrast ≥ 4.5:1 and UI/focus contrast ≥ 3:1 in both themes (values above are measured).
- Visible `:focus-visible` outline on every interactive element.
- Icon-only buttons have `aria-label`. Status icons have labels. Verdict badges expose the full
  Uzbek label to screen readers.
- Touch targets: `lg` buttons (44px) on mobile primary actions. Dense table rows on mobile get a
  larger tap area via the whole-row link.

## Patterns

- **Coming soon.** Sections that are not built yet (courses, roadmap, algorithms, clans, blogs,
  settings) carry a "Tez kunda" pill in the sidebar and render `components/shell/coming-soon.tsx`:
  what is coming, plus the two places to go now (problems, contests).
- **Personal data on public pages.** Pages are server-rendered for everyone (cacheable); the
  signed-in layer (solve status, registration) loads on the client. `useMe()` reports "loading"
  until hydration finishes, so the first client render always matches the server HTML.
- **No Intl for display formats.** Numbers and dates are formatted by hand (`lib/utils.ts`,
  `lib/time.ts`): browsers ship different ICU data (some have no Uzbek at all), and any
  difference from the server render breaks hydration.
- **Charts.** One sequential hue (accent) for magnitude. Rank colors are not used to tell data
  apart in charts: as a categorical palette they fail colorblind separation (Inferno/Phoenix),
  so tiers are always named in text next to the color.
