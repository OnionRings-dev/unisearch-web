import { useState, useEffect } from "react";
import { User, Bot, ChevronDown, ChevronRight, Loader2, Globe } from "lucide-react";
import { Loader } from "@/components/loader";
import type { Message } from "./types";
import { parseLatexToHtml } from "./utils";
import { ThoughtTimer } from "./ThoughtTimer";
import { SourceLinks } from "./SourceLinks";

export const MessageBubble = ({
  message,
  onToggleRawText,
}: {
  message: Message;
  onToggleRawText: (messageId: string) => void;
}) => {
  const isUser = message.type === "user";
  const [isThinkingExpanded, setIsThinkingExpanded] = useState(false);
  const [userToggled, setUserToggled] = useState(false);

  const isReasoningPhase = message.isStreaming && !message.content;
  const isStreamingAnswer = message.isStreaming && message.content;

  useEffect(() => {
    if (isReasoningPhase) {
      setIsThinkingExpanded(true);
      setUserToggled(false);
    } else if (isStreamingAnswer && !userToggled) {
      setIsThinkingExpanded(false);
      setUserToggled(false);
    } else if (!message.isStreaming && !userToggled) {
      setIsThinkingExpanded(false);
    }
  }, [isReasoningPhase, isStreamingAnswer, message.isStreaming, userToggled]);

  const handleToggle = () => {
    if (isReasoningPhase) return;
    setUserToggled(true);
    setIsThinkingExpanded(!isThinkingExpanded);
  };

  const milvusLinks = (message.foundLinks || []).filter(l => l.source !== "web");
  const webLinks = (message.foundLinks || []).filter(l => l.source === "web");
  const [showAllMilvus, setShowAllMilvus] = useState(false);
  const [showAllWeb, setShowAllWeb] = useState(false);
  const MAX_VISIBLE = 5;

  return (
    <div
      id={`msg-${message.id}`}
      className={`flex gap-2 md:gap-4 ${isUser ? "justify-end" : "justify-start"} mb-4 md:mb-6 px-2 md:px-0`}
    >
      <div
        className={`flex gap-2 md:gap-3 max-w-[95%] md:max-w-[85%] ${isUser ? "flex-row-reverse" : "flex-row"}`}
      >
        {/* Avatar: Visible for User always, Hidden for Bot on Mobile */}
        <div
          className={`flex-shrink-0 w-8 h-8 md:w-10 md:h-10 rounded-full items-center justify-center shadow-sm ${
            isUser
              ? "flex bg-gradient-to-br from-[#003366] to-[#004080] text-white"
              : "hidden md:flex bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 text-gray-600 dark:text-gray-300"
          }`}
        >
          {isUser ? (
            <User className="w-4 h-4 md:w-5 md:h-5" />
          ) : (
            <Bot className="w-4 h-4 md:w-5 md:h-5" />
          )}
        </div>

        {/* Message Content: Boxed for User always, Unboxed for Bot on Mobile */}
        <div
          className={`relative group ${
            isUser
              ? "rounded-2xl px-3 py-2.5 md:px-4 md:py-3 shadow-sm bg-[#003366] text-white"
              : "rounded-2xl px-4 py-3 md:shadow-sm md:bg-white md:dark:bg-gray-800 md:border md:border-gray-200 md:dark:border-gray-700 text-gray-900 dark:text-gray-100 w-full"
          }`}
        >
          {!isUser && message.content && (
            <button
              onClick={() => onToggleRawText(message.id)}
              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-md bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-xs"
              title="Mostra testo grezzo dal backend"
            >
              🔍
            </button>
          )}
          {isUser ? (
            <div className="text-sm whitespace-pre-wrap">{message.content}</div>
          ) : (
            <div className="space-y-3">
              {message.isStreaming && !message.content ? (
                <div className="flex items-center gap-2 text-[#003366] dark:text-blue-400 font-medium mb-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span className="text-sm">Thinking</span>
                  <ThoughtTimer />
                </div>
              ) : null}

              {(message.thinkingText ||
                (message.foundLinks && message.foundLinks.length > 0)) && (
                <div className="mb-4">
                  <button
                    onClick={handleToggle}
                    className={`flex items-center gap-2 text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1 transition-colors ${isReasoningPhase ? "cursor-default" : "hover:text-gray-700 dark:hover:text-gray-200"}`}
                  >
                    {isThinkingExpanded ? (
                      <ChevronDown className="w-4 h-4" />
                    ) : (
                      <ChevronRight className="w-4 h-4" />
                    )}
                    <span>Reasoning Process</span>
                  </button>

                  {isThinkingExpanded ? (
                    <div className="pl-4 border-l-2 border-gray-100 dark:border-gray-700 mt-2 space-y-4">
                      {message.thinkingText && (
                        <div>
                          <div className="text-xs uppercase font-bold text-gray-400 mb-1">
                            Thinking Process
                          </div>
                          {message.isStreaming ? (
                            <Loader
                              variant="text-shimmer"
                              text={message.thinkingText}
                              size="sm"
                              className="mt-1"
                            />
                          ) : (
                            <div className="text-xs text-gray-500 dark:text-gray-400 whitespace-pre-wrap">
                              {message.thinkingText}
                            </div>
                          )}
                        </div>
                      )}

                      {message.foundLinks && message.foundLinks.length > 0 && (
                        <div>
                          <div className="text-xs uppercase font-bold text-gray-400 mb-1">
                            Retrieved Documents
                          </div>
                          <div className="space-y-3">
                            {milvusLinks.length > 0 && (
                              <div className="mb-2">
                                <div className="text-[10px] font-semibold text-gray-400 mb-1 bg-gray-50 dark:bg-gray-800 px-1 rounded w-fit">
                                  Data Search ({milvusLinks.length})
                                </div>
                                <ul className="space-y-0.5 pl-1 border-l-2 border-gray-100 dark:border-gray-800">
                                  {(showAllMilvus ? milvusLinks : milvusLinks.slice(0, MAX_VISIBLE)).map((link, idx) => (
                                    <li key={idx} className="text-xs pl-2">
                                      <a
                                        href={link.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-600 hover:underline flex items-center gap-1"
                                      >
                                        <span className="truncate max-w-[250px]">
                                          {link.title || link.url}
                                        </span>
                                      </a>
                                    </li>
                                  ))}
                                  {milvusLinks.length > MAX_VISIBLE && (
                                    <li className="text-xs pl-2">
                                      <button
                                        onClick={() => setShowAllMilvus(!showAllMilvus)}
                                        className="text-blue-400 hover:text-blue-600 text-[11px]"
                                      >
                                        {showAllMilvus ? "Mostra meno" : `Mostra tutti (${milvusLinks.length})`}
                                      </button>
                                    </li>
                                  )}
                                </ul>
                              </div>
                            )}
                            {webLinks.length > 0 && (
                              <div className="mb-2">
                                <div className="text-[10px] font-semibold text-green-600 dark:text-green-400 mb-1 bg-green-50 dark:bg-green-900/20 px-1 rounded w-fit flex items-center gap-1">
                                  <Globe className="w-3 h-3" /> Web ({webLinks.length})
                                </div>
                                <ul className="space-y-0.5 pl-1 border-l-2 border-green-100 dark:border-green-900/30">
                                  {(showAllWeb ? webLinks : webLinks.slice(0, MAX_VISIBLE)).map((link, idx) => (
                                    <li key={idx} className="text-xs pl-2">
                                      <a
                                        href={link.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-green-600 hover:underline flex items-center gap-1"
                                      >
                                        <span className="truncate max-w-[250px]">
                                          {link.title || link.url}
                                        </span>
                                      </a>
                                    </li>
                                  ))}
                                  {webLinks.length > MAX_VISIBLE && (
                                    <li className="text-xs pl-2">
                                      <button
                                        onClick={() => setShowAllWeb(!showAllWeb)}
                                        className="text-green-400 hover:text-green-600 text-[11px]"
                                      >
                                        {showAllWeb ? "Mostra meno" : `Mostra tutti (${webLinks.length})`}
                                      </button>
                                    </li>
                                  )}
                                </ul>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="pl-6 text-xs text-gray-400 italic">
                      {message.isStreaming
                        ? message.foundLinks && message.foundLinks.length > 0
                          ? `Analisi in corso (${message.foundLinks.length} documenti trovati)...`
                          : "Analisi in corso..."
                        : message.foundLinks && message.foundLinks.length > 0
                          ? `Analisi completata (${message.foundLinks.length} documenti utilizzati)`
                          : "Analisi completata"}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {message.reasoningText && !message.isStreaming && (
            <div className="text-xs text-gray-400 italic flex items-center gap-2">
              <span>{message.reasoningText}</span>
            </div>
          )}

          {message.showRawText && message.content && (
            <div className="mb-3 p-2 bg-gray-100 dark:bg-gray-800 rounded text-xs font-mono border">
              <div className="text-gray-600 dark:text-gray-400 mb-1">
                📄 Testo grezzo:{" "}
              </div>
              <pre className="whitespace-pre-wrap text-gray-800 dark:text-gray-200">
                {message.content}
              </pre>
            </div>
          )}

          {!isUser &&
            (message.content ||
              (!message.thinkingText && message.isStreaming)) &&
            (message.isStreaming ? (
              <div className="py-1">
                <div className="text-sm text-gray-700 dark:text-gray-300">
                  <div
                    dangerouslySetInnerHTML={{
                      __html: parseLatexToHtml(message.content || ""),
                    }}
                  />
                </div>
                <span className="inline-block w-2 h-5 bg-[#003366] animate-pulse ml-1"></span>
              </div>
            ) : (
              <div className="py-1">
                <div className="text-sm text-gray-900 dark:text-gray-100">
                  <div
                    dangerouslySetInnerHTML={{
                      __html: parseLatexToHtml(message.content),
                    }}
                  />
                </div>
              </div>
            ))}

          {/* Source Links Section - Always visible below answer */}
          {!isUser &&
            !message.isStreaming &&
            message.content &&
            message.foundLinks &&
            message.foundLinks.length > 0 && (
              <SourceLinks links={message.foundLinks} />
            )}
        </div>
      </div>
    </div>
  );
};
