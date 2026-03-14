import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useGetMe } from "@workspace/api-client-react";
import type { User } from "@workspace/api-client-react";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  token: string | null;
  oauthError: string | null;
  login: (token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [oauthError, setOauthError] = useState<string | null>(null);

  const [token, setToken] = useState<string | null>(() => {
    const urlParams = new URLSearchParams(window.location.search);

    // Handle OAuth error
    const error = urlParams.get("error");
    if (error) {
      window.history.replaceState({}, document.title, window.location.pathname);
      // Will be set in useEffect
    }

    // Handle OAuth callback token in URL
    const urlToken = urlParams.get("token");
    if (urlToken) {
      localStorage.setItem("minepilot_token", urlToken);
      window.history.replaceState({}, document.title, window.location.pathname);
      return urlToken;
    }

    return localStorage.getItem("minepilot_token");
  });

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const error = urlParams.get("error");
    if (error === "oauth_failed") {
      setOauthError("OAuth sign-in failed. Make sure the callback URL is registered in your OAuth app settings.");
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const { data: user, isLoading } = useGetMe({
    query: {
      enabled: !!token,
      retry: false,
    },
  });

  const login = (newToken: string) => {
    localStorage.setItem("minepilot_token", newToken);
    setToken(newToken);
  };

  const logout = () => {
    localStorage.removeItem("minepilot_token");
    setToken(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user: user || null,
        isLoading: isLoading && !!token,
        token,
        oauthError,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
