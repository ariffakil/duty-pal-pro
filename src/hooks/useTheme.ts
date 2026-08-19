import { useCallback, useEffect, useState } from "react";

export type ThemeMode = "dark" | "light";

const KEY = "mytime.theme";

/** Toggles the `dark` class on <html> and remembers the choice per device. */
export function useTheme() {
  const [theme, setTheme] = useState<ThemeMode>("dark");

  useEffect(() => {
    const stored = window.localStorage.getItem(KEY) as ThemeMode | null;
    const next: ThemeMode = stored === "light" || stored === "dark" ? stored : "dark";
    setTheme(next);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  const toggle = useCallback(() => {
    setTheme((t) => {
      const next: ThemeMode = t === "dark" ? "light" : "dark";
      window.localStorage.setItem(KEY, next);
      return next;
    });
  }, []);

  return { theme, toggle };
}
