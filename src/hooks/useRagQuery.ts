import { useState, useCallback, useRef } from "react";
import type { Message } from "@/components/rag/types";
import { ENDPOINTS } from "@/config/endpoints";

export interface PhaseData {
  phase: string;
  status?: string;
  startTime?: number;
  endTime?: number;
  count?: number;
  queries?: string[];
  iteration?: string;
  pages_count?: number;
  average_score?: number;
  threshold?: number;
  sufficient?: boolean;
  new_queries?: string[];
  evaluation_explanation?: string;
  similarity_score?: number;
  found?: boolean;
  found_links?: { url: string; title: string; iteration?: number }[];
}

export interface StreamingState {
  isLoading: boolean;
  phases: PhaseData[];
  answer: string;
  error: string | null;
  completed?: boolean;
  currentPhase?: string | null;
  webLinks?: { url: string; title: string }[];
}

export interface QueryParams {
  queryText: string;
  collection: string;
  token?: string;
  baseUrl?: string;
  executionMode?: "fast" | "deep";
  chatId?: number;
  previousMessages?: Message[];
}

export const useRagQuery = () => {
  const [state, setState] = useState<StreamingState>({
    isLoading: false,
    phases: [],
    answer: "",
    error: null,
    currentPhase: null as string | null,
  });

  const abortControllerRef = useRef<AbortController | null>(null);
  const requestIdRef = useRef(0);

  const query = useCallback(
    async ({
      queryText,
      collection,
      token,
      baseUrl = ENDPOINTS.QUERY,
      executionMode = "fast",
      chatId,
      previousMessages,
    }: QueryParams) => {
      const currentRequestId = ++requestIdRef.current;

      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      abortControllerRef.current = new AbortController();

      setState({
        isLoading: true,
        phases: [],
        answer: "",
        error: null,
        currentPhase: null,
      });

      let accumulatedAnswer = "";

      try {
        const headers: Record<string, string> = {
          "Content-Type": "application/json",
        };
        if (token) {
          headers["Authorization"] = `Bearer ${token}`;
        }

        const response = await fetch(baseUrl, {
          method: "POST",
          headers,
          mode: "cors",
          signal: abortControllerRef.current.signal,
          body: JSON.stringify({
            query: queryText,
            collection: collection,
            score_threshold: 0.6,
            max_iterations: 3,
            execution_mode: executionMode,
            chat_id: chatId,
            previous_messages: previousMessages,
          }),
        });

        if (!response.ok) {
          if (response.status === 404) {
            throw new Error(
              `Collection "${collection}" not found. Available collections: prova_cache`,
            );
          }
          if (response.status === 403) {
            throw new Error("LIMIT_REACHED");
          }
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const reader = response.body?.getReader();
        const decoder = new TextDecoder();

        if (!reader) {
          throw new Error("No response body");
        }

        let isStreamingAnswer = false;
        let buffer = "";

        while (true) {
          if (currentRequestId !== requestIdRef.current) {
            reader.cancel();
            break;
          }

          const { done, value } = await reader.read();

          if (done) {
            break;
          }

          const chunk = decoder.decode(value, { stream: true });
          buffer += chunk;

          const lines = buffer.split("\n");
          const residue = lines.pop() || "";

          for (const line of lines) {
            if (!line.trim()) continue;
            if (currentRequestId !== requestIdRef.current) break;

            try {
              try {
                const data = JSON.parse(line) as {
                  type: string;
                  data?: {
                    source?: string;
                    url?: string;
                    title?: string;
                  };
                  iteration?: number;
                };

                if (data.type === "search_result") {
                  const rawData = data.data;
                  if (!rawData?.url || !rawData?.title) {
                    continue;
                  }
                  const linkData = {
                    url: rawData.url,
                    title: rawData.title,
                    iteration: data.iteration,
                  };

                  setState((prevState) => {
                    const newPhases = [...prevState.phases];
                    const source = rawData.source || "milvus";
                    const targetPhase =
                      source === "web" ? "web_search" : "database_search";
                    const phaseIndex = newPhases
                      .map((p) => p.phase)
                      .lastIndexOf(targetPhase);

                    if (phaseIndex !== -1) {
                      const currentPhase = newPhases[phaseIndex];
                      const newLinks = currentPhase.found_links
                        ? [...currentPhase.found_links, linkData]
                        : [linkData];
                      newPhases[phaseIndex] = {
                        ...currentPhase,
                        found_links: newLinks,
                      };
                    } else {
                      newPhases.push({
                        phase: targetPhase,
                        status: "started",
                        found_links: [linkData],
                        startTime: Date.now(),
                      });
                    }

                    return { ...prevState, phases: newPhases };
                  });
                  continue;
                }
              } catch {
                const isFooter =
                  line.startsWith("Link:") ||
                  line.startsWith("Fonti:") ||
                  line.startsWith("Documenti utilizzati");

                if (line.includes("RISPOSTA FINALE")) {
                  isStreamingAnswer = true;
                }

                if (
                  isStreamingAnswer &&
                  !isFooter &&
                  !line.includes("RISPOSTA FINALE") &&
                  !line.includes("=======")
                ) {
                  accumulatedAnswer += line + "\n";
                }

                const now = Date.now();
                setState((prevState) => {
                  if (currentRequestId !== requestIdRef.current)
                    return prevState;
                  const newPhases = [...prevState.phases];

                  if (line.includes("GENERAZIONE QUERY + HyDE")) {
                    newPhases.push({
                      phase: "thinking",
                      status: "streaming",
                      evaluation_explanation: "Analisi della richiesta...",
                      startTime: now,
                    });
                  } else if (line.includes("💭 THINKING:")) {
                    const content = line.split("💭 THINKING:")[1].trim();
                    newPhases.push({
                      phase: "thinking",
                      status: "streaming",
                      evaluation_explanation: content,
                      startTime: now,
                    });
                  } else if (line.includes("🔍 Ricerca nel database")) {
                    newPhases.push({
                      phase: "database_search",
                      status: "started",
                      startTime: now,
                    });
                  } else if (line.includes("🌐 Ricerca nel web")) {
                    newPhases.push({
                      phase: "web_search",
                      status: "started",
                      startTime: now,
                    });
                  } else if (line.includes("📥 Deep fetch")) {
                    newPhases.push({
                      phase: "deep_fetch",
                      status: "started",
                      startTime: now,
                    });
                  } else if (line.includes("📊 Totale risultati")) {
                    const webMatch = line.match(/(\d+)\s+web/);
                    if (webMatch) {
                      newPhases.push({
                        phase: "web_search",
                        status: "completed",
                        count: parseInt(webMatch[1]),
                        startTime: now,
                      });
                    }
                  } else if (line.includes("📄 Estrazione contenuti")) {
                    const pagesMatch = line.match(
                      /OK\s*-\s*(\d+)\s*DB\s*\+\s*(\d+)\s*web/,
                    );
                    if (pagesMatch) {
                      const dbPages = parseInt(pagesMatch[1]);
                      const webPages = parseInt(pagesMatch[2]);
                      newPhases.push({
                        phase: "content_extraction",
                        status: "completed",
                        pages_count: dbPages + webPages,
                        startTime: now,
                      });
                      newPhases.push({
                        phase: "deep_fetch",
                        status: "completed",
                        startTime: now,
                      });
                    } else {
                      newPhases.push({
                        phase: "content_extraction",
                        status: "started",
                        startTime: now,
                      });
                    }
                  } else if (line.includes("OK Modello embedding")) {
                    // Skip silently
                  } else if (line.includes("📊 Score risultati")) {
                    // Skip
                  } else if (line.includes("🔄 ITERAZIONE")) {
                    const iterMatch = line.match(/ITERAZIONE (\d+)/);
                    const iterNum = iterMatch ? iterMatch[1] : "?";
                    newPhases.push({
                      phase: "iteration",
                      iteration: iterNum,
                      startTime: now,
                    });
                  } else if (line.includes("⚠️ Score misto")) {
                    newPhases.push({
                      phase: "partial_answer_generation",
                      status: "started",
                      startTime: now,
                    });
                  } else if (
                    line.includes("💬 Generazione risposta finale")
                  ) {
                    newPhases.push({
                      phase: "final_answer_generation",
                      status: "started",
                      startTime: now,
                    });
                  } else if (line.includes("✨ RISPOSTA FINALE")) {
                    newPhases.push({
                      phase: "streaming_start",
                      startTime: now,
                    });
                  }
                  return {
                    ...prevState,
                    phases: newPhases,
                    answer: isStreamingAnswer
                      ? accumulatedAnswer + buffer
                      : prevState.answer,
                  };
                });
              }
            } catch (e) {
              console.error("Error parsing line:", line, e);
            }
          }

          buffer = residue;
        }

        setState((prevState) => {
          if (currentRequestId !== requestIdRef.current) return prevState;
          return {
            ...prevState,
            isLoading: false,
            phases: [...prevState.phases, { phase: "streaming_end" }],
            completed: true,
          };
        });
      } catch (error) {
        if (currentRequestId !== requestIdRef.current) {
          return;
        }

        if (error instanceof Error && error.name === "AbortError") {
          setState((prevState) => ({
            ...prevState,
            isLoading: false,
            phases: [...prevState.phases, { phase: "streaming_end" }],
          }));
        } else {
          setState((prevState) => ({
            ...prevState,
            error:
              error instanceof Error ? error.message : "Unknown error",
            isLoading: false,
          }));
        }
      }
    },
    [],
  );

  const stop = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  }, []);

  const reset = useCallback(() => {
    setState({
      isLoading: false,
      phases: [],
      answer: "",
      error: null,
      currentPhase: null,
      webLinks: [],
    });
  }, []);

  return {
    ...state,
    query,
    reset,
    stop,
  };
};
