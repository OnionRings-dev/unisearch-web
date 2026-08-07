import { useState, useCallback, useRef } from 'react'

export interface PhaseData {
  phase: string
  status?: string
  startTime?: number
  endTime?: number
  count?: number
  queries?: string[]
  iteration?: string
  pages_count?: number
  average_score?: number
  threshold?: number
  sufficient?: boolean
  new_queries?: string[]
  evaluation_explanation?: string
  similarity_score?: number
  found?: boolean
  found_links?: { url: string; title: string; iteration?: number }[]
}

export interface StreamingState {
  isLoading: boolean
  phases: PhaseData[]
  answer: string
  error: string | null
  completed?: boolean
  currentPhase?: string | null
  webLinks?: { url: string; title: string }[]
}

export const useRagQuery = () => {
  const [state, setState] = useState<StreamingState>({
    isLoading: false,
    phases: [],
    answer: '',
    error: null,
    currentPhase: null as string | null,
  })

  const abortControllerRef = useRef<AbortController | null>(null)
  const requestIdRef = useRef(0)

  const query = useCallback(async (queryText: string, collection: string = "unimi", token?: string, baseUrl: string = "/api", executionMode: "fast" | "deep" = "fast", chatId?: number, previousMessages?: unknown[]) => {
    const currentRequestId = ++requestIdRef.current

    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    abortControllerRef.current = new AbortController()

    setState({
      isLoading: true,
      phases: [],
      answer: '',
      error: null,
      currentPhase: null,
    })

    let accumulatedAnswer = ''

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      }
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }

      const response = await fetch(`${baseUrl}/query`, {
        method: 'POST',
        headers,
        mode: 'cors',
        signal: abortControllerRef.current.signal,
        body: JSON.stringify({
          query: queryText,
          collection: collection,
          score_threshold: 0.6,
          max_iterations: 3,
          execution_mode: executionMode,
          chat_id: chatId,
          previous_messages: previousMessages,
        })
      })

      console.log('Response status:', response.status, response.statusText)
      console.log('Response headers:', Object.fromEntries(response.headers.entries()))

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error(`Collection "${collection}" not found. Available collections: prova_cache`)
        }
        if (response.status === 403) {
          throw new Error("LIMIT_REACHED")
        }
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()

      if (!reader) {
        throw new Error('No response body')
      }

      let isStreamingAnswer = false
      let buffer = ''

      while (true) {
        // Check if this request is still valid
        if (currentRequestId !== requestIdRef.current) {
          console.log('Request cancelled (new request started)')
          reader.cancel()
          break
        }

        const { done, value } = await reader.read()

        if (done) {
          console.log('Stream completed')
          break
        }

        // Logic fixed: buffer preserves residue across chunks.
        const chunk = decoder.decode(value, { stream: true })
        buffer += chunk

        let lines = buffer.split('\n')

        // The last element is always the residue (incomplete line or empty if ends in newline)
        const residue = lines.pop() || ''

        // Process complete lines
        for (const line of lines) {
          if (!line.trim()) continue

          // Safety check
          if (currentRequestId !== requestIdRef.current) break

          try {
            // Priority: Try to parse as JSON first
            try {
              const data = JSON.parse(line)
              console.log('Received JSON data:', data.type, data)

              if (data.type === 'search_result') {
                setState(prevState => {
                  const newPhases = [...prevState.phases]
                  const source = data.data?.source || "milvus"
                  const targetPhase = source === "web" ? "web_search" : "database_search"
                  const phaseIndex = newPhases.map(p => p.phase).lastIndexOf(targetPhase)
                  const linkData = { ...data.data, iteration: data.iteration }

                  if (phaseIndex !== -1) {
                    const currentPhase = newPhases[phaseIndex]
                    const newLinks = currentPhase.found_links ? [...currentPhase.found_links, linkData] : [linkData]
                    newPhases[phaseIndex] = { ...currentPhase, found_links: newLinks }
                  } else {
                    newPhases.push({ phase: targetPhase, status: 'started', found_links: [linkData], startTime: Date.now() })
                  }

                  return { ...prevState, phases: newPhases }
                })
                continue;
              }
            } catch (e) {
               // If JSON fails, treat as Text Data (QDA/Orchestrator format)

               const isFooter = line.startsWith("Link:") || line.startsWith("Fonti:") || line.startsWith("Documenti utilizzati")

               if (line.includes("RISPOSTA FINALE")) {
                 isStreamingAnswer = true
               }

               if (isStreamingAnswer && !isFooter && !line.includes("RISPOSTA FINALE") && !line.includes("=======")) {
                 accumulatedAnswer += line + "\n"
               }

               // 2. React State Update
               const now = Date.now()
               setState(prevState => {
                 if (currentRequestId !== requestIdRef.current) return prevState
                 let newPhases = [...prevState.phases]

                // Phase Mapping Logic
                if (line.includes("GENERAZIONE QUERY + HyDE")) {
                  newPhases.push({ phase: 'thinking', status: 'streaming', evaluation_explanation: "Analisi della richiesta...", startTime: now })
                } else if (line.includes("💭 THINKING:")) {
                  const content = line.split("💭 THINKING:")[1].trim()
                  newPhases.push({ phase: 'thinking', status: 'streaming', evaluation_explanation: content, startTime: now })
                } else if (line.includes("🔍 Ricerca nel database")) {
                  newPhases.push({ phase: 'database_search', status: 'started', startTime: now })
                } else if (line.includes("🌐 Ricerca nel web")) {
                  newPhases.push({ phase: 'web_search', status: 'started', startTime: now })
                } else if (line.includes("📥 Deep fetch")) {
                  newPhases.push({ phase: 'deep_fetch', status: 'started', startTime: now })
                } else if (line.includes("📊 Totale risultati")) {
                  const webMatch = line.match(/(\d+)\s+web/)
                  if (webMatch) {
                    newPhases.push({ phase: 'web_search', status: 'completed', count: parseInt(webMatch[1]), startTime: now })
                  }
                } else if (line.includes("📄 Estrazione contenuti")) {
                  const pagesMatch = line.match(/OK\s*-\s*(\d+)\s*DB\s*\+\s*(\d+)\s*web/)
                  if (pagesMatch) {
                    const dbPages = parseInt(pagesMatch[1])
                    const webPages = parseInt(pagesMatch[2])
                    newPhases.push({ phase: 'content_extraction', status: 'completed', pages_count: dbPages + webPages, startTime: now })
                    newPhases.push({ phase: 'deep_fetch', status: 'completed', startTime: now })
                  } else {
                    newPhases.push({ phase: 'content_extraction', status: 'started', startTime: now })
                  }
                } else if (line.includes("OK Modello embedding")) {
                  // Skip silently
                } else if (line.includes("📊 Score risultati")) {
                  // Skip — scores are internal
                } else if (line.includes("🔄 ITERAZIONE")) {
                  const iterMatch = line.match(/ITERAZIONE (\d+)/)
                  const iterNum = iterMatch ? iterMatch[1] : "?"
                  newPhases.push({ phase: 'iteration', iteration: iterNum, startTime: now })
                } else if (line.includes("⚠️ Score misto")) {
                  newPhases.push({ phase: 'partial_answer_generation', status: 'started', startTime: now })
                } else if (line.includes("💬 Generazione risposta finale")) {
                  newPhases.push({ phase: 'final_answer_generation', status: 'started', startTime: now })
                } else if (line.includes("✨ RISPOSTA FINALE")) {
                  newPhases.push({ phase: 'streaming_start', startTime: now })
                }
                return {
                  ...prevState,
                  phases: newPhases,
                  answer: isStreamingAnswer ? accumulatedAnswer + buffer : prevState.answer
                }
              })
            }

          } catch (e) {
            console.error('Error parsing line:', line, e)
          }
        }

        buffer = residue
      }


      console.log('Streaming loop completed')

      // Ensure loading state is reset when stream finishes successfully
      setState(prevState => {
        if (currentRequestId !== requestIdRef.current) return prevState
        return {
          ...prevState,
          isLoading: false,
          phases: [...prevState.phases, { phase: 'streaming_end' }],
          completed: true
        }
      })
    } catch (error) {
      if (currentRequestId !== requestIdRef.current) {
        return
      }

      if (error instanceof Error && error.name === 'AbortError') {
        // This block handles manual stop (where ID matches).
        // If ID didn't match (implicit abort from new query), we already returned above.
        setState(prevState => ({
          ...prevState,
          isLoading: false,
          phases: [...prevState.phases, { phase: 'streaming_end' }]
        }))
      } else {
        setState(prevState => ({
          ...prevState,
          error: error instanceof Error ? error.message : 'Unknown error',
          isLoading: false
        }))
      }
    }
  }, [])

  const stop = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      abortControllerRef.current = null
    }
  }, [])

  const reset = useCallback(() => {
    setState({
      isLoading: false,
      phases: [],
      answer: '',
      error: null,
      currentPhase: null,
      webLinks: [],
    })
  }, [])

  return {
    ...state,
    query,
    reset,
    stop
  }
}