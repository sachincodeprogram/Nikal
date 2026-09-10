import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import { api, loadStoredToken, setAuthToken } from "../api/client";
import { User } from "../types";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  // idToken comes from Firebase Phone Auth on the client (wired up once the
  // Firebase project is configured — see mobile/README "Firebase setup").
  loginWithFirebaseToken: (idToken: string, name?: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshMe: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const token = await loadStoredToken();
      if (token) {
        try {
          const { data } = await api.get("/users/me");
          setUser(data);
        } catch {
          await setAuthToken(null);
        }
      }
      setLoading(false);
    })();
  }, []);

  async function loginWithFirebaseToken(idToken: string, name?: string) {
    const { data } = await api.post("/auth/firebase", { idToken, name });
    await setAuthToken(data.token);
    setUser(data.user);
  }

  async function logout() {
    await setAuthToken(null);
    setUser(null);
  }

  async function refreshMe() {
    const { data } = await api.get("/users/me");
    setUser(data);
  }

  return (
    <AuthContext.Provider
      value={{ user, loading, loginWithFirebaseToken, logout, refreshMe }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
