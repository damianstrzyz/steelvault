import { createContext, useContext } from "react";

export type Theme = "dark" | "light";
export interface ThemeState { theme: Theme; toggle: () => void }

export const ThemeContext = createContext<ThemeState | null>(null);

export function useTheme(): ThemeState {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used inside <ThemeProvider>");
  return ctx;
}
