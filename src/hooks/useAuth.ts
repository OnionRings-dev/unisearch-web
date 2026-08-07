import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  clearStoredAuth,
  getStoredAuth,
  isTokenExpired,
  parseJwtPayload,
  storeAuth,
  type AuthState,
} from "@/lib/authStorage";
import { logout, refreshAccessToken } from "@/lib/authApi";

type AuthCallbackResult = {
  token: string;
  userId: number;
  email: string;
};

function parseCallbackParams():
  | { error: string }
  | { payload: AuthCallbackResult }
  | null {
  const params = new URLSearchParams(window.location.search);
  const error = params.get("error");
  if (error) return { error };

  const token = params.get("token");
  const userId = params.get("userId");
  const email = params.get("email");

  if (!token && !userId && !email) return null;

  if (!token || !userId || !email) {
    return { error: "Risposta login incompleta. Riprova." };
  }

  if (isTokenExpired(token)) {
    return { error: "Sessione scaduta. Riprova il login." };
  }

  return { payload: { token, userId: Number(userId), email } };
}

export type UseAuthResult = {
  auth: AuthState | null;
  initializing: boolean;
  callbackError: string;
  clearCallbackError: () => void;
  handleLogout: () => void;
};

export function useAuth(): UseAuthResult {
  const [auth, setAuth] = useState<AuthState | null>(getStoredAuth);
  const [initializing, setInitializing] = useState(!auth);
  const [callbackError, setCallbackError] = useState("");
  const refreshAttemptedRef = useRef(false);

  const refreshSession = useCallback(async () => {
    try {
      const refreshed = await refreshAccessToken();
      storeAuth(refreshed.access_token, refreshed.user_id, refreshed.email);
      setAuth({
        token: refreshed.access_token,
        userId: refreshed.user_id,
        email: refreshed.email,
      });
      return true;
    } catch {
      clearStoredAuth();
      setAuth(null);
      return false;
    } finally {
      setInitializing(false);
    }
  }, []);

  const handleLogout = useCallback(() => {
    logout().catch(() => undefined);
    clearStoredAuth();
    setAuth(null);
  }, []);

  const clearCallbackError = useCallback(() => {
    setCallbackError("");
  }, []);

  useEffect(() => {
    const result = parseCallbackParams();
    if (!result) {
      // Se non siamo in un callback e non abbiamo auth, proviamo il refresh
      if (!auth && !refreshAttemptedRef.current) {
        refreshAttemptedRef.current = true;
        refreshSession();
      } else if (auth) {
        setInitializing(false);
      }
      return;
    }

    if ("error" in result) {
      setCallbackError(result.error);
      setInitializing(false);
      return;
    }

    storeAuth(
      result.payload.token,
      result.payload.userId,
      result.payload.email,
    );
    setAuth(result.payload);
    setInitializing(false);
    window.history.replaceState({}, document.title, "/");
  }, [auth, refreshSession]);

  useEffect(() => {
    if (!auth) return;

    refreshAttemptedRef.current = false;
    if (isTokenExpired(auth.token)) {
      refreshSession();
    }
  }, [auth, refreshSession]);

  const tokenExpiryMs = useMemo(() => {
    if (!auth) return null;
    const payload = parseJwtPayload(auth.token);
    if (!payload?.exp) return null;
    return payload.exp * 1000;
  }, [auth]);

  useEffect(() => {
    if (!auth || !tokenExpiryMs) return;

    const refreshBufferMs = 60 * 1000;
    const timeoutMs = tokenExpiryMs - Date.now() - refreshBufferMs;
    if (timeoutMs <= 0) {
      refreshSession();
      return;
    }

    const timeoutId = window.setTimeout(() => {
      refreshSession();
    }, timeoutMs);
    return () => window.clearTimeout(timeoutId);
  }, [auth, tokenExpiryMs, refreshSession]);

  return {
    auth,
    initializing,
    callbackError,
    clearCallbackError,
    handleLogout,
  };
}
