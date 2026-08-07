import type { StudentProfile } from "@/types/api";
import { ENDPOINTS } from "@/config/endpoints";

export async function fetchProfile(token: string): Promise<StudentProfile> {
  const response = await fetch(ENDPOINTS.USER.PROFILE, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (response.status === 401) {
    throw new Error("UNAUTHORIZED");
  }

  if (!response.ok) {
    throw new Error(
      `Errore nel recupero del profilo: ${response.status} ${response.statusText}`,
    );
  }

  return response.json() as Promise<StudentProfile>;
}

export async function updateProfile(
  token: string,
  profile: StudentProfile,
): Promise<StudentProfile> {
  const response = await fetch(ENDPOINTS.USER.PROFILE, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(profile),
  });

  if (response.status === 401) {
    throw new Error("UNAUTHORIZED");
  }

  if (!response.ok) {
    throw new Error(
      `Errore nell'aggiornamento del profilo: ${response.status} ${response.statusText}`,
    );
  }

  return response.json() as Promise<StudentProfile>;
}

export async function deleteAccount(token: string): Promise<void> {
  const response = await fetch(ENDPOINTS.USER.DELETE, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({} as Record<string, string>));
    throw new Error(
      data.detail || `Errore ${response.status}: ${data.error || response.statusText}`,
    );
  }
}
