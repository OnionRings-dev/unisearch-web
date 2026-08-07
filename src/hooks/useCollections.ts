import { useState, useEffect, useCallback } from "react";
import type { Collection } from "@/types/api";
import { fetchCollections } from "@/services/collectionService";

export interface UseCollectionsResult {
  collections: Collection[];
  isLoading: boolean;
  error: string | null;
  defaultCollection: string | null;
  refetch: () => void;
}

export function useCollections(token: string): UseCollectionsResult {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchCollections(token);
      setCollections(data);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Errore sconosciuto";
      setError(message);
      setCollections([]);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      load();
    }
  }, [token, load]);

  const defaultCollection: string | null =
    collections.length > 0 ? collections[0].name : null;

  return {
    collections,
    isLoading,
    error,
    defaultCollection,
    refetch: load,
  };
}
