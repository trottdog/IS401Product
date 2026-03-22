import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from "react";
import { User } from "@/lib/types";
import * as store from "@/lib/api/store";

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string, name?: string) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      await store.initializeStore();
      const authUser = await store.getAuthUser();
      setUser(authUser);
      setIsLoading(false);
    })();
  }, []);

  const login = async (email: string, password: string, name?: string): Promise<boolean> => {
    const u = await store.login(email, password, name);
    if (u) {
      setUser(u);
      return true;
    }
    return false;
  };

  const register = async (name: string, email: string, password: string): Promise<boolean> => {
    const u = await store.register(name, email, password);
    setUser(u);
    return true;
  };

  const logout = async () => {
    try {
      await store.logout();
    } catch {
      // Still clear local session so the UI signs out even if the request fails.
    } finally {
      setUser(null);
    }
  };

  const value = useMemo(() => ({
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
  }), [user, isLoading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
