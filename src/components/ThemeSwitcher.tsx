import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Sun, Moon, Palette } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const THEMES = [
  { key: "light", label: "Light" },
  { key: "dark", label: "Dark" },
  { key: "system", label: "System" },
  { key: "ocean", label: "Ocean" },
  { key: "forest", label: "Forest" },
  { key: "sunset", label: "Sunset" },
] as const;

function enableThemeTransition() {
  const root = document.documentElement;
  root.classList.add("theme-transition");
  window.setTimeout(() => {
    root.classList.remove("theme-transition");
  }, 250);
}

export default function ThemeSwitcher() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  const isDark = (resolvedTheme || theme) === "dark";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          {isDark ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
          Theme
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        <DropdownMenuLabel className="flex items-center gap-2">
          <Palette className="h-4 w-4" />
          Choose theme
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {THEMES.map((t) => (
          <DropdownMenuItem
            key={t.key}
            onClick={() => {
              enableThemeTransition();
              setTheme(t.key);
            }}
            className="flex items-center gap-2"
          >
            <span
              className="inline-block h-3 w-3 rounded-full border"
              style={{
                background:
                  t.key === "ocean"
                    ? "linear-gradient(135deg, hsl(200 90% 45%) 0%, hsl(185 70% 60%) 100%)"
                    : t.key === "forest"
                    ? "linear-gradient(135deg, hsl(145 45% 35%) 0%, hsl(120 40% 60%) 100%)"
                    : t.key === "sunset"
                    ? "linear-gradient(135deg, hsl(15 85% 55%) 0%, hsl(45 90% 60%) 100%)"
                    : "hsl(var(--primary))",
              }}
            />
            {t.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}


