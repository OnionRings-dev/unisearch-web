import { User, Bot, Loader2 } from "lucide-react";
import type { Message } from "./types";
import { parseLatexToHtml } from "./utils";
import { ThoughtTimer } from "./ThoughtTimer";
import { SourceLinks } from "./SourceLinks";
import { LiveReasoning } from "./LiveReasoning";

export const MessageBubble = ({
  message,
  onToggleRawText,
}: {
  message: Message;
  onToggleRawText: (messageId: string) => void;
}) => {
  const isUser = message.type === "user";

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
              : "rounded-2xl px-4 py-3 text-gray-900 dark:text-gray-100 w-full"
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

              <LiveReasoning
                phases={message.phases || []}
                thinkingText={message.thinkingText}
                foundLinks={message.foundLinks}
                isStreaming={!!message.isStreaming}
              />
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
            message.foundLinks &&
            message.foundLinks.length > 0 && (
              <SourceLinks links={message.foundLinks} />
            )}
        </div>
      </div>
    </div>
  );
};
