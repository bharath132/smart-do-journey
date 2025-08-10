import { useState } from "react";
import { useNavigate } from "react-router-dom";
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
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

export default function AuthButtons() {
  const navigate = useNavigate();
  const { user, isGuest, signIn, signUp, signOut, enableGuestMode, disableGuestMode } = useAuth();
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [username, setUsername] = useState("");
  const [age, setAge] = useState("");
  const [confirm, setConfirm] = useState("");

  async function handleAuth() {
    setLoading(true);
    setError(null);
    try {
      if (mode === "signin") {
        if (!email || !password) {
          throw new Error("Please enter email and password");
        }
        await signIn(email, password);
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
        await signUp(email, password, username || undefined, parsedAge);
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

  if (user || isGuest) {
    return (
      <div className="flex items-center gap-2">
        {user && (
          <span className="text-sm text-muted-foreground hidden sm:inline">
            {user.email}
          </span>
        )}
        {isGuest && (
          <span className="text-sm text-muted-foreground hidden sm:inline">
            Guest Mode
          </span>
        )}
        <Button
          variant="outline"
          size="sm"
          onClick={async () => {
            if (isGuest) {
              disableGuestMode();
            } else {
              await signOut();
            }
            // Navigate back to welcome page
            navigate('/');
          }}
        >
          {isGuest ? "Exit Guest Mode" : "Sign out"}
        </Button>
      </div>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">Login</Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl">{mode === "signin" ? "Welcome Back" : "Create Account"}</DialogTitle>
          <DialogDescription>
            {mode === "signin"
              ? "Sign in to access your personalized task dashboard"
              : "Join us to start your productivity journey"}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Button type="button" variant="outline" onClick={handleGoogle} className="w-full">
            <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </Button>
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">or continue with email</span>
            </div>
          </div>
          <div className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email address</Label>
              <Input 
                id="email" 
                type="email" 
                value={email} 
                onChange={e => setEmail(e.target.value)} 
                placeholder="Enter your email"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input 
                id="password" 
                type="password" 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
                placeholder="Enter your password"
                required
              />
            </div>
            {mode === "signup" && (
              <>
                <div className="grid gap-2">
                  <Label htmlFor="confirm">Confirm password</Label>
                  <Input 
                    id="confirm" 
                    type="password" 
                    value={confirm} 
                    onChange={e => setConfirm(e.target.value)} 
                    placeholder="Confirm your password"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="username">Username (optional)</Label>
                  <Input 
                    id="username" 
                    value={username} 
                    onChange={e => setUsername(e.target.value)} 
                    placeholder="Choose a username"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="age">Age (optional)</Label>
                  <Input 
                    id="age" 
                    type="number" 
                    min={1} 
                    value={age} 
                    onChange={e => setAge(e.target.value)} 
                    placeholder="Your age"
                  />
                </div>
              </>
            )}
            {error && (
              <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
                {error}
              </div>
            )}
          </div>
        </div>
        <DialogFooter className="flex-col gap-2">
          <Button onClick={handleAuth} disabled={loading} className="w-full">
            {loading ? "Please wait..." : mode === "signin" ? "Sign In" : "Create Account"}
          </Button>
          <Button 
            variant="ghost" 
            type="button" 
            onClick={() => {
              setMode(mode === "signin" ? "signup" : "signin");
              setError(null);
            }}
            className="w-full"
          >
            {mode === "signin" ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
