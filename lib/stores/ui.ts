"use client";

import { create } from "zustand";

/**
 * Sidebar collapse is applied by an inline script (see SidebarScript) before
 * first paint via html[data-sidebar], so there is no layout shift. This store
 * mirrors it for React.
 */
interface UiState {
  collapsed: boolean;
  drawerOpen: boolean;
  paletteOpen: boolean;
  shortcutsOpen: boolean;
  toggleCollapsed: () => void;
  setDrawer: (open: boolean) => void;
  setPalette: (open: boolean) => void;
  setShortcuts: (open: boolean) => void;
}

const readCollapsed = () =>
  typeof document !== "undefined" && document.documentElement.dataset.sidebar === "collapsed";

export const useUi = create<UiState>((set, get) => ({
  collapsed: readCollapsed(),
  drawerOpen: false,
  paletteOpen: false,
  shortcutsOpen: false,
  toggleCollapsed: () => {
    const collapsed = !get().collapsed;
    document.documentElement.dataset.sidebar = collapsed ? "collapsed" : "expanded";
    try {
      localStorage.setItem("cf-sidebar", collapsed ? "collapsed" : "expanded");
    } catch {
      /* ignore */
    }
    set({ collapsed });
  },
  setDrawer: (drawerOpen) => set({ drawerOpen }),
  setPalette: (paletteOpen) => set({ paletteOpen }),
  setShortcuts: (shortcutsOpen) => set({ shortcutsOpen }),
}));
