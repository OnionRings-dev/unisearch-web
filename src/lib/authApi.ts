const API_BASE = import.meta.env.VITE_API_URL || "/api";

export async function getGoogleAuthUrl(): Promise<string> {
  const response = await fetch(`${API_BASE}/auth/google/login`);
  if (!response.ok) {
    throw new Error("Errore durante la richiesta di login");
  }
  const data = await response.json();
  if (!data?.url) {
    throw new Error("Risposta login non valida");
  }
  return data.url as string;
}

export type RefreshResponse = {
  access_token: string;
  user_id: number;
  email: string;
};

export async function refreshAccessToken(): Promise<RefreshResponse> {
  const response = await fetch(`${API_BASE}/auth/refresh`, {
    method: "POST",
    credentials: "include",
  });
  if (!response.ok) {
    throw new Error("Impossibile rinnovare la sessione");
  }
  return response.json() as Promise<RefreshResponse>;
}

export async function logout(): Promise<void> {
  await fetch(`${API_BASE}/auth/logout`, {
    method: "POST",
    credentials: "include",
  });
}
