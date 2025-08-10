import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Settings } from "lucide-react";

export type AppSettings = {
  enableConfetti: boolean;
};

const STORAGE_KEY = "gamified-settings";

export default function SettingsMenu({ onChange }: { onChange?: (s: AppSettings) => void }) {
  const [settings, setSettings] = useState<AppSettings>({ enableConfetti: true });

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as AppSettings;
        setSettings(parsed);
        onChange?.(parsed);
      } catch {}
    } else {
      onChange?.(settings);
    }
  }, []);

  function update(patch: Partial<AppSettings>) {
    const next = { ...settings, ...patch };
    setSettings(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    onChange?.(next);
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Settings className="h-4 w-4" />
          Settings
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Preferences</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuCheckboxItem
          checked={settings.enableConfetti}
          onCheckedChange={(v) => update({ enableConfetti: Boolean(v) })}
        >
          Enable confetti
        </DropdownMenuCheckboxItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
