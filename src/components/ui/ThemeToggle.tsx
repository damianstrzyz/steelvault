import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/lib/themeContext";

export function ThemeToggle() {
  const { theme, toggle } = useTheme();
  return (
    <button type="button" onClick={toggle} aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"} className="grid size-11 place-items-center rounded-xl text-muted hover:bg-surface-2 hover:text-fg">
      {theme === "dark" ? <Sun className="size-5" /> : <Moon className="size-5" />}
    </button>
  );
}
