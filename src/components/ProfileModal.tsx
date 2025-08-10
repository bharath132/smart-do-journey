import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ProfileModal({ onComplete }: { onComplete?: () => void }) {
  const [open, setOpen] = useState(false);
  const [username, setUsername] = useState("");
  const [age, setAge] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    supabase.auth.getUser().then(({ data, error }) => {
      if (error) return;
      if (!mounted) return;
      const user = data.user;
      if (!user) {
        setOpen(false);
        return;
      }
      const meta = (user.user_metadata || {}) as any;
      const hasProfile = Boolean(meta.username) && (meta.age !== undefined && meta.age !== null);
      if (!hasProfile) {
        setOpen(true);
        if (meta.username) setUsername(meta.username);
        if (meta.age !== undefined && meta.age !== null) setAge(String(meta.age));
      } else {
        onComplete?.();
      }
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_evt, session) => {
      const user = session?.user;
      const meta = (user?.user_metadata || {}) as any;
      const hasProfile = Boolean(meta?.username) && (meta?.age !== undefined && meta?.age !== null);
      if (user && !hasProfile) setOpen(true);
    });
    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, [onComplete]);

  async function save() {
    setSaving(true);
    setError(null);
    try {
      const parsedAge = age ? parseInt(age, 10) : undefined;
      if (!username || !parsedAge || parsedAge <= 0) {
        throw new Error("Please provide a valid username and age");
      }
      const { error } = await supabase.auth.updateUser({ data: { username, age: parsedAge } });
      if (error) throw error;
      setOpen(false);
      onComplete?.();
    } catch (e: any) {
      setError(e?.message ?? "Failed to save profile");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Complete your profile</DialogTitle>
          <DialogDescription>We use this to personalize your experience.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-3 py-2">
          <div className="grid gap-2">
            <Label htmlFor="p-username">Username</Label>
            <Input id="p-username" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="yourname" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="p-age">Age</Label>
            <Input id="p-age" type="number" min={1} value={age} onChange={(e) => setAge(e.target.value)} placeholder="18" />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <div className="flex justify-end">
            <Button onClick={save} disabled={saving}>{saving ? "Saving…" : "Save"}</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
