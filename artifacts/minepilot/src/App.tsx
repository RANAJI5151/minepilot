import { Switch, Route, Router as WouterRouter, Redirect } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/lib/auth";
import { Layout } from "@/components/Layout";
import NotFound from "@/pages/not-found";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Dashboard from "@/pages/Dashboard";
import Servers from "@/pages/Servers";
import ServerAdd from "@/pages/ServerAdd";
import ServerDetail from "@/pages/ServerDetail";
import Marketplace from "@/pages/Marketplace";
import AiAssistant from "@/pages/AiAssistant";
import LogAnalyzer from "@/pages/LogAnalyzer";
import Settings from "@/pages/Settings";
import { ReactNode } from "react";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30000,
      retry: 1,
    },
  },
});

function ProtectedRoute({ children }: { children: ReactNode }) {
  const { token, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground animate-pulse text-lg">Loading…</div>
      </div>
    );
  }

  if (!token) {
    return <Redirect to="/login" />;
  }

  return <Layout>{children}</Layout>;
}

function PublicRoute({ children }: { children: ReactNode }) {
  const { token, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground animate-pulse text-lg">Loading…</div>
      </div>
    );
  }

  if (token) {
    return <Redirect to="/" />;
  }

  return <>{children}</>;
}

function Router() {
  return (
    <Switch>
      <Route path="/login">
        <PublicRoute><Login /></PublicRoute>
      </Route>
      <Route path="/register">
        <PublicRoute><Register /></PublicRoute>
      </Route>
      <Route path="/servers/new">
        <ProtectedRoute><ServerAdd /></ProtectedRoute>
      </Route>
      <Route path="/servers/:id">
        {(params) => (
          <ProtectedRoute><ServerDetail id={parseInt(params.id)} /></ProtectedRoute>
        )}
      </Route>
      <Route path="/servers">
        <ProtectedRoute><Servers /></ProtectedRoute>
      </Route>
      <Route path="/plugins">
        <ProtectedRoute><Marketplace /></ProtectedRoute>
      </Route>
      <Route path="/ai">
        <ProtectedRoute><AiAssistant /></ProtectedRoute>
      </Route>
      <Route path="/logs">
        <ProtectedRoute><LogAnalyzer /></ProtectedRoute>
      </Route>
      <Route path="/settings">
        <ProtectedRoute><Settings /></ProtectedRoute>
      </Route>
      <Route path="/">
        <ProtectedRoute><Dashboard /></ProtectedRoute>
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
        </AuthProvider>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
