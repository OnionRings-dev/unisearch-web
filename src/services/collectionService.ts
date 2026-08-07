import type { Collection } from "@/types/api";
import { ENDPOINTS } from "@/config/endpoints";

export async function fetchCollections(token: string): Promise<Collection[]> {
  const response = await fetch(ENDPOINTS.COLLECTIONS, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(
      `Errore nel recupero delle collections: ${response.status} ${response.statusText}`,
    );
  }

  const data: Collection[] = await response.json();

  if (!Array.isArray(data)) {
    throw new Error("Formato risposta collections non valido");
  }

  return data.filter(
    (c): c is Collection =>
      typeof c.name === "string" &&
      c.name.length > 0 &&
      typeof c.alias === "string" &&
      c.alias.length > 0,
  );
}
