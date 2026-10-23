"use client";

import { Slot } from "@radix-ui/react-slot";
import { createContext, useCallback, useContext, useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Popover and Menu on the native HTML `popover` attribute: top-layer rendering,
 * Esc and light-dismiss come from the browser, so this costs ~1 KB instead of
 * Radix + floating-ui (~30 KB). Positioning is a few lines of JS.
 */

interface Ctx {
  id: string;
  open: boolean;
  setOpen: (open: boolean) => void;
  triggerRef: React.RefObject<HTMLElement | null>;
  /** When the browser last light-dismissed the popover (see PopoverTrigger). */
  dismissedAt: React.RefObject<number>;
  menu: boolean;
}
const PopoverCtx = createContext<Ctx | null>(null);
const usePopover = () => {
  const ctx = useContext(PopoverCtx);
  if (!ctx) throw new Error("Popover parts must be inside <Popover>");
  return ctx;
};

function Root({
  open: controlled,
  onOpenChange,
  menu,
  children,
}: {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  menu?: boolean;
  children: React.ReactNode;
}) {
  const [uncontrolled, setUncontrolled] = useState(false);
  const open = controlled ?? uncontrolled;
  const triggerRef = useRef<HTMLElement | null>(null);
  const dismissedAt = useRef(0);
  const id = useId();
  const setOpen = useCallback(
    (next: boolean) => {
      setUncontrolled(next);
      onOpenChange?.(next);
    },
    [onOpenChange],
  );
  return <PopoverCtx.Provider value={{ id, open, setOpen, triggerRef, dismissedAt, menu: !!menu }}>{children}</PopoverCtx.Provider>;
}

export function Popover(props: { open?: boolean; onOpenChange?: (open: boolean) => void; children: React.ReactNode }) {
  return <Root {...props} />;
}

export function Menu(props: { children: React.ReactNode }) {
  return <Root {...props} menu />;
}

export function PopoverTrigger({ asChild, children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { asChild?: boolean }) {
  const { id, open, setOpen, triggerRef, dismissedAt, menu } = usePopover();
  const Comp = asChild ? Slot : "button";
  return (
    <Comp
      ref={triggerRef as React.Ref<HTMLButtonElement>}
      type={asChild ? undefined : "button"}
      aria-expanded={open}
      aria-controls={id}
      aria-haspopup={menu ? "menu" : "dialog"}
      // Clicking the trigger of an open popover light-dismisses it first; don't reopen it.
      onClick={() => {
        if (performance.now() - dismissedAt.current > 300) setOpen(!open);
      }}
      onKeyDown={(e: React.KeyboardEvent) => {
        if (menu && (e.key === "ArrowDown" || e.key === "ArrowUp")) {
          e.preventDefault();
          setOpen(true);
        }
      }}
      {...props}
    >
      {children}
    </Comp>
  );
}
export const MenuTrigger = PopoverTrigger;

const GAP = 6;
const EDGE = 8;

function place(el: HTMLElement, trigger: HTMLElement, align: "start" | "end" | "center") {
  const t = trigger.getBoundingClientRect();
  const w = el.offsetWidth;
  const h = el.offsetHeight;
  let left = align === "start" ? t.left : align === "end" ? t.right - w : t.left + t.width / 2 - w / 2;
  left = Math.min(Math.max(EDGE, left), window.innerWidth - w - EDGE);
  const below = t.bottom + GAP;
  const top = below + h > window.innerHeight - EDGE && t.top - GAP - h > EDGE ? t.top - GAP - h : below;
  el.style.left = `${left}px`;
  el.style.top = `${top}px`;
}

export function PopoverContent({
  align = "end",
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { align?: "start" | "end" | "center" }) {
  const { id, open, setOpen, triggerRef, dismissedAt, menu } = usePopover();
  const ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    const trigger = triggerRef.current;
    if (!el || !trigger || !el.showPopover) return;
    if (!open) {
      if (el.matches(":popover-open")) el.hidePopover();
      return;
    }
    if (!el.matches(":popover-open")) el.showPopover();
    const reposition = () => place(el, trigger, align);
    reposition();
    if (menu) el.querySelector<HTMLElement>("[role^=menuitem]")?.focus();
    else el.querySelector<HTMLElement>("input, button, [tabindex]:not([tabindex='-1'])")?.focus();
    window.addEventListener("resize", reposition);
    window.addEventListener("scroll", reposition, true);
    return () => {
      window.removeEventListener("resize", reposition);
      window.removeEventListener("scroll", reposition, true);
    };
  }, [open, align, menu, triggerRef]);

  // Browser closed it (Esc, click outside): sync state and return focus to the trigger.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onBeforeToggle = (e: Event) => {
      if ((e as ToggleEvent).newState === "closed") dismissedAt.current = performance.now();
    };
    const onToggle = (e: Event) => {
      if ((e as ToggleEvent).newState === "closed") {
        setOpen(false);
        if (el.contains(document.activeElement) || document.activeElement === document.body) triggerRef.current?.focus();
      }
    };
    el.addEventListener("beforetoggle", onBeforeToggle);
    el.addEventListener("toggle", onToggle);
    return () => {
      el.removeEventListener("beforetoggle", onBeforeToggle);
      el.removeEventListener("toggle", onToggle);
    };
  }, [setOpen, triggerRef, dismissedAt]);

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (!menu) return;
    const items = [...e.currentTarget.querySelectorAll<HTMLElement>("[role^=menuitem]:not([aria-disabled=true])")];
    const i = items.indexOf(document.activeElement as HTMLElement);
    const move = (n: number) => {
      e.preventDefault();
      items[(n + items.length) % items.length]?.focus();
    };
    if (e.key === "ArrowDown") move(i + 1);
    else if (e.key === "ArrowUp") move(i - 1);
    else if (e.key === "Home") move(0);
    else if (e.key === "End") move(items.length - 1);
    else if (e.key === "Tab") setOpen(false);
  };

  return (
    <div
      ref={ref}
      id={id}
      popover="auto"
      role={menu ? "menu" : "dialog"}
      onKeyDown={onKeyDown}
      className={cn(
        "fixed inset-auto m-0 rounded-lg border border-border bg-surface text-fg shadow-lg",
        menu && "min-w-48 p-1",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
export const MenuContent = PopoverContent;

const itemClass =
  "flex h-9 w-full cursor-pointer items-center gap-2 rounded-md px-2 text-left text-fg outline-none select-none hover:bg-surface-2 focus-visible:bg-surface-2 focus-visible:outline-none [&_svg]:size-4 [&_svg]:text-fg-subtle";

export function MenuItem({
  onSelect,
  className,
  children,
}: {
  onSelect?: () => void;
  className?: string;
  children: React.ReactNode;
}) {
  const { setOpen } = usePopover();
  return (
    <button
      type="button"
      role="menuitem"
      tabIndex={-1}
      onClick={() => {
        setOpen(false);
        onSelect?.();
      }}
      className={cn(itemClass, className)}
    >
      {children}
    </button>
  );
}

export function MenuSeparator() {
  return <div role="separator" className="my-1 h-px bg-border" />;
}

const RadioCtx = createContext<{ value: string; onValueChange: (v: string) => void } | null>(null);

export function MenuRadioGroup({
  value,
  onValueChange,
  children,
}: {
  value: string;
  onValueChange: (v: string) => void;
  children: React.ReactNode;
}) {
  return (
    <RadioCtx.Provider value={{ value, onValueChange }}>
      <div role="group">{children}</div>
    </RadioCtx.Provider>
  );
}

export function MenuRadioItem({ value, children, lang }: { value: string; children: React.ReactNode; lang?: string }) {
  const radio = useContext(RadioCtx);
  const { setOpen } = usePopover();
  const checked = radio?.value === value;
  return (
    <button
      type="button"
      role="menuitemradio"
      aria-checked={checked}
      tabIndex={-1}
      lang={lang}
      onClick={() => {
        setOpen(false);
        radio?.onValueChange(value);
      }}
      className={cn(itemClass, "justify-between")}
    >
      {children}
      {checked && <span aria-hidden className="block size-1.5 rounded-full bg-accent" />}
    </button>
  );
}
