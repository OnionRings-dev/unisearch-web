import { useState, useEffect, useRef } from "react";
import { Loader2, ChevronRight, ChevronDown, Globe, FileText, Sparkles, Check } from "lucide-react";
import type { PhaseData } from "@/hooks/useRagQuery";

interface LiveReasoningProps {
  phases: PhaseData[];
  thinkingText?: string;
  foundLinks?: { url: string; title: string; source?: string }[];
  isStreaming: boolean;
}

type Stage = "thinking" | "db_search" | "db_read" | "web_search" | "web_read" | "done";

export const LiveReasoning = ({ phases: _phases, thinkingText, foundLinks = [], isStreaming }: LiveReasoningProps) => {
  const [dbExpanded, setDbExpanded] = useState(false);
  const [webExpanded, setWebExpanded] = useState(false);
  const [thinkExpanded, setThinkExpanded] = useState(false);
  const [readIdx, setReadIdx] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const mountTimeRef = useRef(Date.now());

  const safeLinks = Array.isArray(foundLinks) ? foundLinks : [];

  const milvusLinks = safeLinks.filter(l => l.source !== "web");
  const webLinks = safeLinks.filter(l => l.source === "web");

  const hasDbLinks = milvusLinks.length > 0;
  const hasWebLinks = webLinks.length > 0;
  const hasThinking = !!thinkingText;
  const totalSeconds = Math.max(1, Math.round((Date.now() - mountTimeRef.current) / 1000));

  let stage: Stage = "thinking";
  if (!isStreaming) stage = "done";
  else if (hasWebLinks) stage = "web_read";
  else if (hasDbLinks) stage = "db_read";
  else if (hasThinking) stage = "db_search";
  else stage = "thinking";

  const stageOrder: Stage[] = ["thinking", "db_search", "db_read", "web_read", "done"];
  const stageIdx = stageOrder.indexOf(stage);
  const past = (s: Stage) => stageOrder.indexOf(s) < stageIdx;
  const isAt = (s: Stage) => s === stage;
  const color = (s: Stage) => isAt(s) ? "text-blue-600 dark:text-blue-400" : past(s) ? "text-gray-400 dark:text-gray-500" : "text-gray-300 dark:text-gray-600";

  useEffect(() => {
    if (thinkingText && isStreaming) setThinkExpanded(true);
  }, [!!thinkingText, isStreaming]);

  useEffect(() => {
    if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }

    if (stage === "db_read" && milvusLinks.length > 1) {
      setDbExpanded(true);
      setReadIdx(0);
      let idx = 0;
      const max = Math.min(milvusLinks.length, 5);
      intervalRef.current = setInterval(() => { idx++; if (idx >= max || stage !== "db_read") { if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; } return; } setReadIdx(idx); }, 1000);
    } else if (stage === "web_read" && webLinks.length > 1) {
      setWebExpanded(true);
      setReadIdx(0);
      let idx = 0;
      const max = Math.min(webLinks.length, 5);
      intervalRef.current = setInterval(() => { idx++; if (idx >= max || stage !== "web_read") { if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; } return; } setReadIdx(idx); }, 1000);
    }

    return () => { if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; } };
  }, [stage, milvusLinks.length, webLinks.length]);

  useEffect(() => {
    if (containerRef.current) containerRef.current.scrollTop = containerRef.current.scrollHeight;
  }, [stage, readIdx]);

  const content = (
    <>
      {/* Thinking */}
      <div className={color("thinking")}>
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => thinkingText && setThinkExpanded(!thinkExpanded)}>
          {isAt("thinking") ? <Loader2 className="w-3 h-3 flex-shrink-0 animate-spin" /> : <Check className="w-3 h-3 flex-shrink-0 text-green-500" />}
          <span className={isAt("thinking") ? "animate-pulse" : ""}>
            {isAt("thinking") ? "Analysing your question..." : "Question analysed"}
          </span>
          {thinkingText && <ChevronRight className={`w-3 h-3 flex-shrink-0 transition-transform ${thinkExpanded ? "rotate-90" : ""}`} />}
        </div>
        {thinkExpanded && thinkingText && (
          <div className="pl-5 mt-1 text-gray-500 dark:text-gray-400 whitespace-pre-wrap leading-relaxed border-l-2 border-blue-100 dark:border-blue-900/30">{thinkingText}</div>
        )}
      </div>

      {/* Searching DB (after thinking, before DB links arrive) */}
      {hasThinking && !hasDbLinks && isStreaming && (
        <div className="text-gray-400 dark:text-gray-500">
          <div className="flex items-center gap-2">
            <Loader2 className="w-3 h-3 flex-shrink-0 animate-spin" />
            <span>Searching internal documents...</span>
          </div>
        </div>
      )}

      {/* DB Results */}
      {hasDbLinks && (
        <>
          <div className={past("db_read") ? "text-gray-400 dark:text-gray-500" : "text-blue-600 dark:text-blue-400"}>
            <div className="flex items-center gap-2">
              <Check className="w-3 h-3 flex-shrink-0 text-green-500" />
              <span>{milvusLinks.length} documents found</span>
            </div>
          </div>

          <div className={past("web_read") || isAt("done") ? "text-gray-400 dark:text-gray-500" : isAt("db_read") ? "text-blue-600 dark:text-blue-400" : ""}>
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => setDbExpanded(!dbExpanded)}>
              <FileText className="w-3 h-3 flex-shrink-0" />
              <span>Internal documents ({milvusLinks.length})</span>
              <ChevronRight className={`w-3 h-3 flex-shrink-0 transition-transform ${dbExpanded ? "rotate-90" : ""}`} />
            </div>
            {dbExpanded && (
              <div className="pl-5 mt-1 space-y-0.5 border-l-2 border-blue-100 dark:border-blue-900/30 max-h-[100px] overflow-y-auto">
                {milvusLinks.map((link, i) => <a key={i} href={link.url} target="_blank" rel="noopener noreferrer" className="block text-blue-600 dark:text-blue-400 hover:underline truncate">{link.title || link.url}</a>)}
              </div>
            )}
          </div>

          {/* DB reading */}
          {isAt("db_read") && milvusLinks.length > 1 && (
            <div className="text-blue-600 dark:text-blue-400">
              <div className="flex items-center gap-2">
                <Sparkles className="w-3 h-3 flex-shrink-0 animate-pulse" />
                <span className="animate-pulse">Reading: {milvusLinks[Math.min(readIdx, milvusLinks.length - 1)]?.title || "document"}</span>
              </div>
            </div>
          )}
        </>
      )}

      {/* DB Summary */}
      {hasDbLinks && !isStreaming && (
        <div className="flex items-center gap-2 text-gray-400 dark:text-gray-500">
          <Check className="w-3 h-3 flex-shrink-0 text-green-500" />
          <span>Analysed {milvusLinks.length} documents from Data Search</span>
        </div>
      )}

      {/* Searching Web (between db_read and web_read) */}
      {past("db_read") && !isAt("web_read") && !hasWebLinks && (
        <div className="text-gray-400 dark:text-gray-500">
          <div className="flex items-center gap-2">
            <Loader2 className="w-3 h-3 flex-shrink-0 animate-spin" />
            <span>Searching the web...</span>
          </div>
        </div>
      )}

      {/* Web Results */}
      {hasWebLinks && (
        <>
          <div className={past("web_read") ? "text-gray-400 dark:text-gray-500" : "text-blue-600 dark:text-blue-400"}>
            <div className="flex items-center gap-2">
              <Check className="w-3 h-3 flex-shrink-0 text-green-500" />
              <span>{webLinks.length} results from web</span>
            </div>
          </div>

          <div className={isAt("done") ? "text-gray-400 dark:text-gray-500" : "text-blue-600 dark:text-blue-400"}>
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => setWebExpanded(!webExpanded)}>
              <Globe className="w-3 h-3 flex-shrink-0" />
              <span>Web pages ({webLinks.length})</span>
              <ChevronRight className={`w-3 h-3 flex-shrink-0 transition-transform ${webExpanded ? "rotate-90" : ""}`} />
            </div>
            {webExpanded && (
              <div className="pl-5 mt-1 space-y-0.5 border-l-2 border-green-100 dark:border-green-900/30 max-h-[100px] overflow-y-auto">
                {webLinks.map((link, i) => <a key={i} href={link.url} target="_blank" rel="noopener noreferrer" className="block text-green-600 dark:text-green-400 hover:underline truncate">{link.title || link.url}</a>)}
              </div>
            )}
          </div>

          {/* Web reading */}
          {isAt("web_read") && webLinks.length > 1 && (
            <div className="text-blue-600 dark:text-blue-400">
              <div className="flex items-center gap-2">
                <Sparkles className="w-3 h-3 flex-shrink-0 animate-pulse" />
                <span className="animate-pulse">Reading: {webLinks[Math.min(readIdx, webLinks.length - 1)]?.title || "page"}</span>
              </div>
            </div>
          )}
        </>
      )}

      {/* Web Summary */}
      {hasWebLinks && !isStreaming && (
        <div className="flex items-center gap-2 text-gray-400 dark:text-gray-500">
          <Check className="w-3 h-3 flex-shrink-0 text-green-500" />
          <span>Analysed {webLinks.length} pages from Web Search</span>
        </div>
      )}
    </>
  );

  return (
    <div className="mb-3">
      {!isStreaming ? (
        <details className="group" open>
          <summary className="flex items-center gap-2 text-xs font-semibold text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 py-0.5 cursor-pointer select-none marker:content-none list-none">
            <span className="group-open:hidden"><ChevronRight className="w-3.5 h-3.5 flex-shrink-0 inline" /></span>
            <span className="hidden group-open:inline"><ChevronDown className="w-3.5 h-3.5 flex-shrink-0" /></span>
            <span>Reasoning Process</span>
            <Check className="w-3 h-3 text-green-500 flex-shrink-0" />
            <span className="text-[10px] text-gray-400 font-normal">· {milvusLinks.length} docs + {webLinks.length} web · {totalSeconds}s</span>
          </summary>
          <div ref={containerRef} className="text-xs space-y-1.5 pl-4 border-l-2 border-gray-100 dark:border-gray-800 mt-1">
            {content}
          </div>
        </details>
      ) : (
        <div ref={containerRef} className="text-xs space-y-1.5">
          {content}
        </div>
      )}
    </div>
  );
};
