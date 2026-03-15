import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useLogin } from "@workspace/api-client-react";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import { Github, ChevronDown, ChevronUp, Copy, Check, AlertCircle } from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showSetup, setShowSetup] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [, navigate] = useLocation();
  const { login, oauthError } = useAuth();
  const { toast } = useToast();

  const loginMutation = useLogin({
    mutation: {
      onSuccess: (data) => {
        login(data.token);
        navigate("/");
      },
      onError: (error: unknown) => {
        const msg = error instanceof Error ? error.message : "Invalid credentials";
        toast({ title: "Login Failed", description: msg, variant: "destructive" });
      },
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate({ data: { email, password } });
  };

  const apiBase = import.meta.env.VITE_API_URL;
  const googleCallback = `${apiBase}/api/auth/google/callback`;
  const githubCallback = `${apiBase}/api/auth/github/callback`;

  function copyToClipboard(text: string, key: string) {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  }

  return (
    <div className="min-h-screen flex relative overflow-hidden bg-background">
      <div className="absolute inset-0 z-0">
        <img
          src={`${import.meta.env.BASE_URL}images/hero-bg.png`}
          alt=""
          className="w-full h-full object-cover opacity-20"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
      </div>

      <div className="flex-1 flex items-center justify-center p-4 z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md space-y-4"
        >
          <AnimatePresence>
            {oauthError && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex items-start gap-3 p-4 rounded-2xl bg-destructive/10 border border-destructive/30 text-destructive text-sm"
              >
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold mb-1">OAuth Sign-in Failed</p>
                  <p className="text-destructive/80">
                    The callback URL isn't registered. Click "OAuth Setup" below to see the required callback URLs.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="glass-panel p-8 rounded-3xl">
            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-emerald-400 mx-auto mb-4 flex items-center justify-center shadow-[0_0_30px_rgba(16,185,129,0.3)]">
                <img
                  src={`${import.meta.env.BASE_URL}images/logo.png`}
                  alt="Logo"
                  className="w-10 h-10 object-contain"
                />
              </div>
              <h1 className="text-3xl font-display font-bold text-foreground">Welcome Back</h1>
              <p className="text-muted-foreground mt-2">Manage your servers with MinePilot</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5 text-foreground/80">Email</label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="admin@server.com"
                  autoComplete="email"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5 text-foreground/80">Password</label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
              </div>
              <Button type="submit" className="w-full h-12 text-base mt-2" disabled={loginMutation.isPending}>
                {loginMutation.isPending ? "Signing in..." : "Sign In"}
              </Button>
            </form>

            <div className="mt-8 flex items-center gap-4">
              <div className="flex-1 h-px bg-border" />
              <span className="text-sm text-muted-foreground">or continue with</span>
              <div className="flex-1 h-px bg-border" />
            </div>

            <div className="mt-6 grid grid-cols-2 gap-4">
              <Button
                variant="outline"
                className="h-11"
                onClick={() => (window.location.href = `${import.meta.env.VITE_API_URL}/api/auth/google`)}
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Google
              </Button>
              <Button
                variant="outline"
                className="h-11"
                onClick={() => (window.location.href = `${import.meta.env.VITE_API_URL}/api/auth/github`)}
              >
                <Github className="w-5 h-5 mr-2" />
                GitHub
              </Button>
            </div>

            <p className="mt-8 text-center text-sm text-muted-foreground">
              Don't have an account?{" "}
              <Link href="/register" className="text-primary hover:underline font-medium">
                Create one
              </Link>
            </p>
          </div>

          <div className="glass-panel rounded-2xl overflow-hidden border border-border/50">
            <button
              onClick={() => setShowSetup(!showSetup)}
              className="w-full flex items-center justify-between p-4 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
                OAuth Setup Required — Add these callback URLs to your apps
              </span>
              {showSetup ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            <AnimatePresence>
              {showSetup && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="px-4 pb-5 space-y-4 border-t border-border/50 pt-4">
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                        Google — Authorized Redirect URI
                      </p>
                      <p className="text-xs text-muted-foreground mb-2">
                        Go to{" "}
                        <a
                          href="https://console.cloud.google.com/apis/credentials"
                          target="_blank"
                          rel="noreferrer"
                          className="text-primary hover:underline"
                        >
                          Google Cloud Console → APIs & Services → Credentials
                        </a>
                        , open your OAuth client, and add this to <strong>Authorized redirect URIs</strong>:
                      </p>
                      <div className="flex items-center gap-2 bg-background rounded-xl border border-border p-3">
                        <code className="text-xs text-primary flex-1 break-all">{googleCallback}</code>
                        <button
                          onClick={() => copyToClipboard(googleCallback, "google")}
                          className="shrink-0 text-muted-foreground hover:text-foreground transition-colors"
                          title="Copy"
                        >
                          {copied === "google" ? (
                            <Check className="w-4 h-4 text-green-400" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div>
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                        GitHub — Authorization Callback URL
                      </p>
                      <p className="text-xs text-muted-foreground mb-2">
                        Go to{" "}
                        <a
                          href="https://github.com/settings/developers"
                          target="_blank"
                          rel="noreferrer"
                          className="text-primary hover:underline"
                        >
                          GitHub → Settings → Developer Settings → OAuth Apps
                        </a>
                        , open your app, and set <strong>Authorization callback URL</strong> to:
                      </p>
                      <div className="flex items-center gap-2 bg-background rounded-xl border border-border p-3">
                        <code className="text-xs text-primary flex-1 break-all">{githubCallback}</code>
                        <button
                          onClick={() => copyToClipboard(githubCallback, "github")}
                          className="shrink-0 text-muted-foreground hover:text-foreground transition-colors"
                          title="Copy"
                        >
                          {copied === "github" ? (
                            <Check className="w-4 h-4 text-green-400" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    <p className="text-xs text-muted-foreground bg-primary/10 border border-primary/20 rounded-lg p-2">
                      After saving in your OAuth app, try signing in again.
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </div>
  );
}