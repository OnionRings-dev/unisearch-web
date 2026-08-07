import { useState } from "react";
import { getGoogleAuthUrl } from "@/lib/authApi";

type AuthLoginState = {
  loading: boolean;
  error: string;
  startGoogleLogin: () => Promise<void>;
};

export function useAuthLogin(): AuthLoginState {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const startGoogleLogin = async () => {
    setLoading(true);
    setError("");
    try {
      const url = await getGoogleAuthUrl();
      window.location.href = url;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Errore durante la richiesta di login";
      setError(message);
      setLoading(false);
    }
  };

  return { loading, error, startGoogleLogin };
}
