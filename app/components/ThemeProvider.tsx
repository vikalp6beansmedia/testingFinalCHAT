"use client";

import { createContext, useContext, useEffect, useState } from "react";

const THEMES = [
  { id: "blue",   label: "Ocean",   color: "#6c8eff" },
  { id: "purple", label: "Violet",  color: "#a855f7" },
  { id: "green",  label: "Forest",  color: "#22c55e" },
  { id: "orange", label: "Sunset",  color: "#f97316" },
  { id: "rose",   label: "Rose",    color: "#f43f5e" },
] as const;

type ThemeId = typeof THEMES[number]["id"];

const ThemeCtx = createContext<{ theme: ThemeId; setTheme: (t: ThemeId) => void; themes: typeof THEMES }>({
  theme: "blue", setTheme: () => {}, themes: THEMES,
});

export function useTheme() { return useContext(ThemeCtx); }
export { THEMES };

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeId>("blue");

  useEffect(() => {
    const saved = localStorage.getItem("cf_theme") as ThemeId | null;
    if (saved && THEMES.find(t => t.id === saved)) {
      setThemeState(saved);
      document.documentElement.setAttribute("data-theme", saved === "blue" ? "" : saved);
    }
  }, []);

  function setTheme(t: ThemeId) {
    setThemeState(t);
    localStorage.setItem("cf_theme", t);
    document.documentElement.setAttribute("data-theme", t === "blue" ? "" : t);
  }

  return (
    <ThemeCtx.Provider value={{ theme, setTheme, themes: THEMES }}>
      {children}
    </ThemeCtx.Provider>
  );
}
