import { ENDPOINTS } from "@/config/endpoints";
import type { GoogleLoginResponse, RefreshResponse } from "@/types/api";

export type { RefreshResponse } from "@/types/api";

export async function getGoogleAuthUrl(): Promise<string> {
  const response = await fetch(ENDPOINTS.AUTH.GOOGLE_LOGIN);
  if (!response.ok) {
    throw new Error("Errore durante la richiesta di login");
  }
  const data = (await response.json()) as GoogleLoginResponse;
  if (!data?.url) {
    throw new Error("Risposta login non valida");
  }
  return data.url;
}

export async function refreshAccessToken(): Promise<RefreshResponse> {
  const response = await fetch(ENDPOINTS.AUTH.REFRESH, {
    method: "POST",
    credentials: "include",
  });
  if (!response.ok) {
    throw new Error("Impossibile rinnovare la sessione");
  }
  return response.json() as Promise<RefreshResponse>;
}

export async function logout(): Promise<void> {
  await fetch(ENDPOINTS.AUTH.LOGOUT, {
    method: "POST",
    credentials: "include",
  });
}
