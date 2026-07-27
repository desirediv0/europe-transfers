"use client";

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { api } from "@/lib/api";
import env from "@/config/env.config";
import type { User } from "@/lib/types";

export type VerificationStep = "UPLOAD_ID" | "PENDING_REVIEW" | "ID_REJECTED" | "VERIFIED";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  verificationStep: VerificationStep | null;
  login: (email: string, code: string) => Promise<{ verificationStep: VerificationStep; user: User }>;
  register: (data: { name: string; email: string; phone: string; password: string; confirmPassword: string }) => Promise<void>;
  requestOtp: (email: string) => Promise<void>;
  verifyOtp: (email: string, code: string) => Promise<{ verificationStep: VerificationStep; user: User }>;
  uploadId: (file: File) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

async function tryRefresh(): Promise<boolean> {
  try {
    const res = await fetch(`${env.API_URL}/auth/refresh`, {
      method: "POST",
      credentials: "include",
    });
    return res.ok;
  } catch {
    return false;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [verificationStep, setVerificationStep] = useState<VerificationStep | null>(null);

  const setUserFromData = useCallback((data: User) => {
    setUser(data);
    if (!data.isEmailVerified) {
      setVerificationStep(null);
    } else if (!data.idDocumentUrl) {
      setVerificationStep("UPLOAD_ID");
    } else if (data.idDocumentStatus === "PENDING") {
      setVerificationStep("PENDING_REVIEW");
    } else if (data.idDocumentStatus === "REJECTED") {
      setVerificationStep("ID_REJECTED");
    } else {
      setVerificationStep("VERIFIED");
    }
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const data = await api.get<User>("/users/me");
      setUserFromData(data);
    } catch {
      const refreshed = await tryRefresh();
      if (refreshed) {
        try {
          const data = await api.get<User>("/users/me");
          setUserFromData(data);
        } catch {
          setUser(null);
          setVerificationStep(null);
        }
      } else {
        setUser(null);
        setVerificationStep(null);
      }
    }
  }, [setUserFromData]);

  useEffect(() => {
    refreshUser().finally(() => setLoading(false));
  }, [refreshUser]);

  useEffect(() => {
    if (!user) return;
    const interval = setInterval(() => {
      tryRefresh();
    }, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [user]);

  const login = async (email: string, code: string) => {
    const data = await api.post<{ user: User; verificationStep: VerificationStep }>("/auth/login", { email, code });
    setUser(data.user);
    setVerificationStep(data.verificationStep);
    return data;
  };

  const register = async (formData: { name: string; email: string; phone: string; password: string; confirmPassword: string }) => {
    await api.post("/auth/register", formData);
  };

  const requestOtp = async (email: string) => {
    await api.post("/auth/otp/request", { email });
  };

  const verifyOtp = async (email: string, code: string) => {
    const data = await api.post<{ user: User; verificationStep: VerificationStep }>("/auth/otp/verify", { email, code });
    setUser(data.user);
    setVerificationStep(data.verificationStep);
    return data;
  };

  const uploadId = async (file: File) => {
    const form = new FormData();
    form.append("file", file);
    const data = await api.post<User>("/auth/upload-id", form);
    setUser(data);
    setVerificationStep("PENDING_REVIEW");
  };

  const logout = async () => {
    await api.post("/auth/logout");
    setUser(null);
    setVerificationStep(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, verificationStep, login, register, requestOtp, verifyOtp, uploadId, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
