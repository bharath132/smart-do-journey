import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function AuthButtons() {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [username, setUsername] = useState("");
  const [age, setAge] = useState("");
  const [confirm, setConfirm] = useState("");

  useEffect(() => {
    let isMounted = true;
    supabase.auth.getUser().then(({ data }) => {
      if (!isMounted) return;
      setUserEmail(data.user?.email ?? null);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserEmail(session?.user?.email ?? null);
    });
    return () => {
      isMounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  async function handleAuth() {
    setLoading(true);
    setError(null);
    try {
      if (mode === "signin") {
        if (!email || !password) {
          throw new Error("Please enter email and password");
        }
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        if (!email || !password) {
          throw new Error("Email and password are required");
        }
        if (password !== confirm) {
          throw new Error("Passwords do not match");
        }
        const parsedAge = age ? parseInt(age, 10) : undefined;
        if (age && (isNaN(parsedAge as number) || parsedAge! <= 0)) {
          throw new Error("Please enter a valid age");
        }
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
            data: {
              username: username || undefined,
              age: parsedAge,
            },
          },
        });
        if (error) throw error;
      }
      setOpen(false);
      setEmail("");
      setPassword("");
      setUsername("");
      setAge("");
      setConfirm("");
    } catch (e: any) {
      const msg = e?.message ?? "Authentication failed";
      // Common supabase messages mapping
      if (/Invalid login credentials/i.test(msg)) {
        setError("Invalid email or password");
      } else if (/Email rate limit|over email rate limit/i.test(msg)) {
        setError("Too many attempts. Please try again later.");
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    setError(null);
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/`,
          skipBrowserRedirect: false,
          queryParams: { prompt: "select_account" },
        },
      });
      if (error) throw error;
      if (data?.url) {
        // Some environments require manual redirect
        window.location.assign(data.url);
      }
    } catch (e: any) {
      setError(e?.message ?? "Google sign-in failed");
    }
  }

  if (userEmail) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground hidden sm:inline">{userEmail}</span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => supabase.auth.signOut()}
        >
          Sign out
        </Button>
      </div>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">Login</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{mode === "signin" ? "Log in" : "Create account"}</DialogTitle>
          <DialogDescription>
            {mode === "signin"
              ? "Enter your credentials to access your tasks."
              : "Create an account to sync your tasks."}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-2">
          <Button type="button" variant="outline" onClick={handleGoogle}>
            Continue with Google
          </Button>
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">or</span>
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" />
          </div>
          {mode === "signup" && (
            <>
              <div className="grid gap-2">
                <Label htmlFor="username">Username</Label>
                <Input id="username" value={username} onChange={e => setUsername(e.target.value)} placeholder="yourname" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="age">Age</Label>
                <Input id="age" type="number" min={1} value={age} onChange={e => setAge(e.target.value)} placeholder="18" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="confirm">Retype password</Label>
                <Input id="confirm" type="password" value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="••••••••" />
              </div>
            </>
          )}
          {error && <p className="text-sm text-destructive">{error}</p>}
          <div className="flex items-center justify-between">
            <Button variant="ghost" type="button" onClick={() => setMode(mode === "signin" ? "signup" : "signin")}>
              {mode === "signin" ? "Create an account" : "Have an account? Log in"}
            </Button>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleAuth} disabled={loading}>
            {loading ? "Please wait…" : mode === "signin" ? "Log in" : "Sign up"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
