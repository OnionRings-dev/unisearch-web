import React, { useState, useRef, useEffect, useCallback } from "react";
import type { Chat } from "@/types";
import type { StudentProfile } from "@/types/api";
import { Button } from "@/components/ui/button";
import { useRagQuery } from "@/hooks/useRagQuery";
import { useCollections } from "@/hooks/useCollections";
import { fetchProfile } from "@/services/profileService";
import { Bot, RotateCcw, LogOut, PanelLeft, User } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  createChat,
  deleteChat,
  getChat,
  listChats,
  updateChat,
} from "@/lib/chatStorage";
import ChatSidebar from "../ChatSidebar";
import { ProfileView } from "../ProfileView";

import type { Message, RagInterfaceProps } from "./types";
import { getReasoningText } from "./utils";
import { ErrorBanner, LimitBanner } from "./Banners";
import { ChatInput } from "./ChatInput";
import { MessageBubble } from "./MessageBubble";

export const RagInterface = ({
  userId,
  token,
  userEmail,
  onLogout,
}: RagInterfaceProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentInput, setCurrentInput] = useState("");
  const [selectedCollection, setSelectedCollection] = useState<string>("");
  const [showCollectionDropdown, setShowCollectionDropdown] = useState(false);
  const [collectionFilter, setCollectionFilter] = useState("");
  const [executionMode] = useState<"fast" | "deep">("fast");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const isSubmittingRef = useRef(false);

  const prevLoadingRef = useRef(false);
  const [isLimitBannerDismissed, setIsLimitBannerDismissed] = useState(false);

  const { collections, isLoading: collectionsLoading, error: collectionsError, defaultCollection } = useCollections(token);

  useEffect(() => {
    if (defaultCollection && !selectedCollection) {
      setSelectedCollection(defaultCollection);
    }
  }, [defaultCollection, selectedCollection]);

  // Chat History Sidebar State
  const [chats, setChats] = useState<Chat[]>([]);
  const [currentChatId, setCurrentChatId] = useState<number | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentView, setCurrentView] = useState<"chat" | "profile">("chat");
  const [, setStudentContext] = useState<string | undefined>(undefined);

  const {
    isLoading,
    phases,
    answer,
    error,
    query: executeQuery,
    reset,
    stop,
  } = useRagQuery();

  const chatStorageUserKey = userEmail;

  const fetchUserChats = useCallback(() => {
    setChats(listChats(chatStorageUserKey));
  }, [chatStorageUserKey]);

  useEffect(() => {
    fetchUserChats();
  }, [fetchUserChats]);

  const fetchStudentProfile = useCallback(async () => {
    try {
      const profile: StudentProfile = await fetchProfile(token);
      const parts: string[] = [];
      if (profile.degree_program)
        parts.push(`Corso di Laurea: ${profile.degree_program}`);
      if (profile.degree_class) parts.push(`Classe: ${profile.degree_class}`);
      if (profile.degree_type) parts.push(`Tipo: ${profile.degree_type}`);
      if (profile.enrollment_year)
        parts.push(`Anno: ${profile.enrollment_year}`);
      if (profile.campus) parts.push(`Sede: ${profile.campus}`);
      if (parts.length > 0) {
        setStudentContext(`Informazioni sullo studente: ${parts.join(", ")}.`);
      } else {
        setStudentContext(undefined);
      }
    } catch {
      setStudentContext(undefined);
    }
  }, [token]);

  useEffect(() => {
    fetchStudentProfile();
  }, [fetchStudentProfile]);

  const handleNewChat = useCallback(() => {
    setMessages([]);
    setCurrentInput("");
    setCurrentChatId(null);
    skipNextSave.current = false;
    reset();
    if (window.innerWidth < 768) setIsSidebarOpen(false);
  }, [reset]);

  const handleDeleteChat = useCallback(
    (chatId: number) => {
      deleteChat(chatStorageUserKey, chatId);
      setChats(listChats(chatStorageUserKey));
      if (currentChatId === chatId) {
        handleNewChat();
      }
    },
    [chatStorageUserKey, currentChatId, handleNewChat],
  );

  const skipNextSave = useRef(false);

  const handleSelectChat = (chatId: number) => {
    skipNextSave.current = true;

    const chat = getChat(chatStorageUserKey, chatId);
    if (!chat) {
      skipNextSave.current = false;
      fetchUserChats();
      return;
    }

    setCurrentChatId(chatId);
    setMessages(chat.messages);

    if (window.innerWidth < 768) setIsSidebarOpen(false);
  };

  useEffect(() => {
    if (isLoading) {
      setIsLimitBannerDismissed(false);
    }
  }, [isLoading]);

  useEffect(() => {
    const wasLoading = prevLoadingRef.current;
    prevLoadingRef.current = isLoading;

    if (isLoading && !wasLoading) {
      const userMessages = messages.filter((m) => m.type === "user");
      const lastUserMessage = userMessages[userMessages.length - 1];

      if (lastUserMessage) {
        setTimeout(() => {
          const element = document.getElementById(`msg-${lastUserMessage.id}`);
          if (element) {
            element.scrollIntoView({ behavior: "smooth", block: "start" });
          }
        }, 150);
      }
    } else if (!isLoading && !wasLoading) {
      if (messages.length > 0) {
        messagesEndRef.current?.scrollIntoView({
          behavior: "auto",
          block: "start",
        });
      }
    }
  }, [messages.length, isLoading]);

  useEffect(() => {
    const handleClickOutside = (event: PointerEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowCollectionDropdown(false);
        setCollectionFilter("");
      }
    };

    if (showCollectionDropdown) {
      document.addEventListener("pointerdown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("pointerdown", handleClickOutside);
    };
  }, [showCollectionDropdown]);

  useEffect(() => {
    if (!isLoading || !messages.length) return;
    const hasPhases = phases.length > 0;
    if (!hasPhases && !answer) return;

    setMessages((prev) => {
      const newMessages = [...prev];
      const lastMessage = newMessages[newMessages.length - 1];
      if (!lastMessage || lastMessage.type !== "assistant") return prev;

      const updated = { ...lastMessage };

      if (hasPhases) {
        const lastPhase = phases[phases.length - 1];
        const thinkingPhase = phases.filter((p) => p.phase === "thinking").pop();
        updated.reasoningText = getReasoningText(lastPhase);
        updated.thinkingText = thinkingPhase?.evaluation_explanation;
        updated.foundLinks = phases.flatMap((p) => p.found_links || []);
        updated.phases = phases as Message["phases"];
      }

      if (answer) {
        const pipelinePrefixes = ["Inizio pipeline", "====", "📝", "🔍", "🔄", "🌐", "📥",
          "📊", "📄", "⚠️", "💬", "💭", "🎯", "ATTENZIONE", "OK ", "Analisi completezza",
          "Generazione risposta", "RISPOSTA FINALE"]
        const clean = answer.split("\n").filter(line => {
          const t = line.trim()
          if (!t) return false
          return !pipelinePrefixes.some(p => t.startsWith(p))
        }).join("\n")
        updated.content = clean || answer
      }

      newMessages[newMessages.length - 1] = updated;
      return newMessages;
    });
  }, [phases, answer, isLoading, messages.length]);

  useEffect(() => {
    if (isLoading || !messages.length) return;
    setMessages((prev) => {
      return prev.map((msg, i) => {
        if (i === prev.length - 1 && msg.type === "assistant" && msg.isStreaming) {
          return { ...msg, isStreaming: false, reasoningText: undefined };
        }
        return msg;
      });
    });
  }, [isLoading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading || isSubmittingRef.current) return;
    if (collectionsLoading || !selectedCollection) return;

    const trimmedInput = currentInput.trim();
    if (!trimmedInput) return;
    isSubmittingRef.current = true;

    reset();
    skipNextSave.current = false;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: trimmedInput,
      timestamp: new Date(),
    };

    const assistantMessage: Message = {
      id: (Date.now() + 1).toString(),
      type: "assistant",
      content: "",
      timestamp: new Date(),
      isStreaming: true,
      query: trimmedInput,
    };

    const initialMessages = [userMessage, assistantMessage];
    setMessages((prev) => [...prev, ...initialMessages]);

    let activeChatId = currentChatId;
    if (!currentChatId) {
      const createdChat = createChat(
        chatStorageUserKey,
        trimmedInput,
        initialMessages,
      );
      setCurrentChatId(createdChat.id);
      setChats(listChats(chatStorageUserKey));
      activeChatId = createdChat.id;
    }

    setCurrentInput("");

    let contextualQuery = trimmedInput;
    const prevUserMessages = messages.filter((m) => m.type === "user");
    if (prevUserMessages.length > 0) {
      const allPrevQueries = prevUserMessages
        .map((m, i) => `[${i + 1}] ${m.content}`)
        .join("\n");
      contextualQuery = `DOMANDA CORRENTE: ${trimmedInput}\nSTORICO DOMANDE:\n${allPrevQueries}`;
    }

    executeQuery({
      queryText: contextualQuery,
      collection: selectedCollection,
      token,
      executionMode,
      chatId: activeChatId ?? undefined,
      previousMessages: messages,
    });

    setTimeout(() => {
      isSubmittingRef.current = false;
    }, 1000);
  };

  useEffect(() => {
    if (!currentChatId || messages.length === 0) return;

    if (skipNextSave.current) {
      skipNextSave.current = false;
      return;
    }

    const timeoutId = setTimeout(() => {
      const updated = updateChat(chatStorageUserKey, currentChatId, messages);
      if (updated) {
        setChats(listChats(chatStorageUserKey));
      }
    }, 400);

    return () => clearTimeout(timeoutId);
  }, [messages, userId, currentChatId, chatStorageUserKey]);

  const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);

  return (
    <React.Fragment>
      <div className="h-screen bg-background flex overflow-hidden">
        <ChatSidebar
          chats={chats}
          currentChatId={currentChatId}
          onSelectChat={handleSelectChat}
          onNewChat={handleNewChat}
          onDeleteChat={handleDeleteChat}
          isOpen={isSidebarOpen}
          toggleSidebar={toggleSidebar}
          currentView={currentView}
          onSwitchView={setCurrentView}
        />

        <div
          className={cn(
            "hidden md:block transition-all duration-300 ease-in-out shrink-0",
            isSidebarOpen ? "w-64" : "w-0",
          )}
        />

        <div
          className={cn(
            "flex-1 flex flex-col h-full transition-all duration-300 ease-in-out min-w-0",
            isSidebarOpen ? "translate-x-64 md:translate-x-0" : "translate-x-0",
          )}
        >
          {/* Header */}
          <div className="border-b border-gray-200 dark:border-gray-800 bg-white/95 dark:bg-background/95 backdrop-blur-sm sticky top-0 z-10 shrink-0">
            <div className="relative flex items-center h-[65px] px-4">
              {!isSidebarOpen && (
                <button
                  onClick={toggleSidebar}
                  className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md text-gray-500 dark:text-gray-400 transition-colors z-20"
                  title="Apri sidebar"
                >
                  <PanelLeft className="w-5 h-5" />
                </button>
              )}

              <div className="absolute inset-y-0 left-12 right-0 md:left-0 flex justify-center pointer-events-none">
                <div className="w-full max-w-4xl px-4 flex items-center justify-between pointer-events-auto">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-linear-to-br from-[#003366] to-[#004080] rounded-full flex items-center justify-center shadow-sm">
                      {currentView === "chat" ? (
                        <Bot className="w-4 h-4 text-white" />
                      ) : (
                        <User className="w-4 h-4 text-white" />
                      )}
                    </div>
                    <div>
                      <h1 className="font-semibold text-gray-900 dark:text-gray-100">
                        {currentView === "chat"
                          ? "Uni Search"
                          : "Profilo Utente"}
                      </h1>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {currentView === "chat"
                          ? "Ricerca intelligente universitaria"
                          : "Gestione account"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center">
                    {currentView === "chat" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleNewChat}
                        className="shadow-sm mr-2 hidden md:flex"
                      >
                        <RotateCcw className="w-4 h-4 mr-2" />
                        Nuova Chat
                      </Button>
                    )}
                    {currentView === "profile" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentView("chat")}
                        className="shadow-sm mr-2 flex"
                      >
                        Torna alla Chat
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={onLogout}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      <LogOut className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {currentView === "chat" ? (
            <div
              ref={messagesContainerRef}
              className="flex-1 overflow-y-auto w-full relative"
            >
              <div className="max-w-4xl mx-auto px-2 md:px-4 pt-2 md:pt-4 min-h-full flex flex-col relative">
                <div className="flex-1">
                  {messages.length === 0 ? (
                    <div className="h-full flex flex-col justify-center min-h-[35vh] md:min-h-[60vh]">
                      <div className="shrink-0 py-6">
                        <div className="text-center">
                          <div className="w-16 h-16 bg-[#003366]/10 dark:bg-[#003366]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Bot className="w-8 h-8 text-[#003366] dark:text-[#4A90E2]" />
                          </div>
                          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                            Assistente Universitario
                          </h2>
                          <p className="text-gray-600 dark:text-gray-400 text-sm max-w-md mx-auto">
                            Fai una domanda sui corsi, esami o qualsiasi aspetto
                            universitario.
                          </p>
                          {collectionsLoading && (
                            <p className="text-gray-400 dark:text-gray-500 text-xs mt-2">
                              Caricamento università disponibili...
                            </p>
                          )}
                          {collectionsError && (
                            <p className="text-red-500 text-xs mt-2">
                              {collectionsError}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="md:hidden fixed bottom-0 left-0 right-0 pt-3 pb-8 bg-white/95 dark:bg-background/95 backdrop-blur-md border-t border-gray-200 dark:border-gray-800 shadow-lg z-10">
                        <div className="px-6">
                          {error && <ErrorBanner error={error} />}

                          <ChatInput
                            value={currentInput}
                            onChange={setCurrentInput}
                            onSubmit={handleSubmit}
                            onStop={stop}
                            isLoading={isLoading}
                            selectedCollection={selectedCollection}
                            setSelectedCollection={setSelectedCollection}
                            showCollectionDropdown={showCollectionDropdown}
                            setShowCollectionDropdown={
                              setShowCollectionDropdown
                            }
                            collectionFilter={collectionFilter}
                            setCollectionFilter={setCollectionFilter}
                            collections={collections}
                            dropdownRef={dropdownRef}
                            formRef={formRef}
                          />
                        </div>
                      </div>

                      <div className="hidden md:flex shrink-0 px-4">
                        <div className="w-full max-w-2xl mx-auto">
                          {error && <ErrorBanner error={error} />}

                          <ChatInput
                            value={currentInput}
                            onChange={setCurrentInput}
                            onSubmit={handleSubmit}
                            onStop={stop}
                            isLoading={isLoading}
                            selectedCollection={selectedCollection}
                            setSelectedCollection={setSelectedCollection}
                            showCollectionDropdown={showCollectionDropdown}
                            setShowCollectionDropdown={
                              setShowCollectionDropdown
                            }
                            collectionFilter={collectionFilter}
                            setCollectionFilter={setCollectionFilter}
                            collections={collections}
                            dropdownRef={dropdownRef}
                            formRef={formRef}
                            className="bg-white/95 dark:bg-gray-900/30 backdrop-blur-md shadow-lg border-gray-200 dark:border-gray-800"
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {messages.map((message) => (
                        <MessageBubble
                          key={message.id}
                          message={message}
                          onToggleRawText={(messageId: string) => {
                            setMessages((prev) =>
                              prev.map((m) =>
                                m.id === messageId
                                  ? { ...m, showRawText: !m.showRawText }
                                  : m,
                              ),
                            );
                          }}
                        />
                      ))}
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {messages.length > 0 && (
                  <div className="sticky bottom-0 z-20 w-full pt-32 pb-2 md:pb-4 mt-auto pointer-events-none">
                    <div className="absolute inset-0 overflow-hidden">
                      <div
                        className="absolute inset-0 backdrop-blur-xl"
                        style={{
                          maskImage:
                            "linear-gradient(to top, black 0%, black 30%, transparent 100%)",
                          WebkitMaskImage:
                            "linear-gradient(to top, black 0%, black 30%, transparent 100%)",
                        }}
                      />
                      <div className="absolute inset-0 bg-linear-to-t from-background via-background/80 to-transparent" />
                    </div>

                    <div className="relative pointer-events-auto px-4">
                      {error === "LIMIT_REACHED" && !isLimitBannerDismissed && (
                        <LimitBanner
                          onDismiss={() => setIsLimitBannerDismissed(true)}
                        />
                      )}
                      <ChatInput
                        value={currentInput}
                        onChange={setCurrentInput}
                        onSubmit={handleSubmit}
                        onStop={stop}
                        isLoading={isLoading}
                        selectedCollection={selectedCollection}
                        setSelectedCollection={setSelectedCollection}
                        showCollectionDropdown={showCollectionDropdown}
                        setShowCollectionDropdown={setShowCollectionDropdown}
                        collectionFilter={collectionFilter}
                        setCollectionFilter={setCollectionFilter}
                        collections={collections}
                        dropdownRef={dropdownRef}
                        formRef={formRef}
                        className="bg-white/95 dark:bg-card/50 backdrop-blur-md shadow-lg border-gray-200 dark:border-white/10"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <ProfileView
              userId={userId}
              token={token}
              initialEmail={userEmail}
              onLogout={onLogout}
              onProfileUpdated={fetchStudentProfile}
            />
          )}
        </div>
      </div>
    </React.Fragment>
  );
};
