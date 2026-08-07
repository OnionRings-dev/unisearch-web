import React, { useState, useEffect } from "react";
import {
  Trash2,
  AlertTriangle,
  Moon,
  Sun,
  Plus,
  X,
  ArrowLeft,
  User,
  MessageSquare,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/ThemeProvider";
import { cn } from "@/lib/utils";
import type { Chat } from "@/types";
import { LegalModal } from "./LegalModal";

interface ChatSidebarProps {
  chats: Chat[];
  currentChatId: number | null;
  onSelectChat: (chatId: number) => void;
  onNewChat: () => void;
  onDeleteChat: (chatId: number) => void;
  isOpen: boolean;
  toggleSidebar: () => void;
  currentView: "chat" | "profile";
  onSwitchView: (view: "chat" | "profile") => void;
}

const ChatSidebar: React.FC<ChatSidebarProps> = ({
  chats,
  currentChatId,
  onSelectChat,
  onNewChat,
  onDeleteChat,
  isOpen,
  toggleSidebar,
  currentView,
  onSwitchView,
}) => {
  const [chatToDelete, setChatToDelete] = useState<number | null>(null);
  const [legalModalOpen, setLegalModalOpen] = useState(false);
  const [legalDocType, setLegalDocType] = useState<
    "terms" | "privacy" | "cookie"
  >("terms");

  const { theme, setTheme } = useTheme();

  const openLegal = (type: "terms" | "privacy" | "cookie") => {
    setLegalDocType(type);
    setLegalModalOpen(true);
  };

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const confirmDelete = () => {
    if (chatToDelete) {
      onDeleteChat(chatToDelete);
      setChatToDelete(null);
    }
  };

  return (
    <>
      <div
        className={cn(
          "fixed left-0 top-0 h-full bg-white/80 dark:bg-background/80 backdrop-blur-xl border-r border-gray-200 dark:border-gray-800 transition-all duration-300 z-30",
          isOpen ? "w-64" : "w-0 overflow-hidden border-none",
        )}
      >
        <div
          className={cn(
            "flex flex-col h-full w-64 transition-transform duration-300",
            !isOpen && "-translate-x-full",
          )}
        >
          {/* Header */}
          <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-white/50 dark:bg-background/50">
            <h2 className="font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#003366] dark:bg-blue-500"></span>
              Cronologia
            </h2>
            <button
              onClick={toggleSidebar}
              className="p-1.5 hover:bg-gray-100 dark:hover:bg-background rounded-md text-gray-500 dark:text-gray-400 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {currentView === "profile" && (
            <div className="p-4 border-b border-gray-100 dark:border-gray-800">
              <button
                onClick={() => onSwitchView("chat")}
                className="w-full flex items-center justify-center gap-2 p-2 rounded-lg bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 text-sm font-medium transition-all"
              >
                <ArrowLeft className="h-4 w-4" />
                Torna alla Chat
              </button>
            </div>
          )}
          <div className="p-4 flex-1 overflow-hidden flex flex-col">
            <button
              onClick={onNewChat}
              className="w-full bg-[#003366] hover:bg-[#004080] text-white p-2.5 rounded-lg flex items-center justify-center gap-2 mb-6 text-sm font-medium transition-all shadow-sm hover:shadow-md active:scale-95"
            >
              <Plus className="h-4 w-4" />
              Nuova Chat
            </button>

            <div className="flex-1 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
              {chats.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-48 text-gray-400 dark:text-gray-500 text-sm">
                  <MessageSquare className="h-10 w-10 mb-2 opacity-20" />
                  <span>Nessuna chat salvata</span>
                </div>
              ) : (
                chats.map((chat) => (
                  <ChatListItem
                    key={chat.id}
                    chat={chat}
                    isActive={currentChatId === chat.id}
                    onSelect={() => {
                      onSelectChat(chat.id);
                      if (currentView !== "chat") onSwitchView("chat");
                    }}
                    onDelete={(e) => {
                      e.stopPropagation();
                      setChatToDelete(chat.id);
                    }}
                  />
                ))
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/30 flex flex-col gap-2">
            <button
              onClick={toggleTheme}
              className="w-full flex items-center gap-3 p-2.5 rounded-lg text-sm font-medium transition-all text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800 hover:text-indigo-600 dark:hover:text-amber-400 border border-transparent"
            >
              {theme === "dark" ? (
                <>
                  <Sun className="w-5 h-5 text-amber-400" />
                  Modalità Chiara
                </>
              ) : (
                <>
                  <Moon className="w-5 h-5 text-indigo-600" />
                  Modalità Scura
                </>
              )}
            </button>

            <button
              onClick={() => onSwitchView("profile")}
              className={cn(
                "w-full flex items-center gap-3 p-2.5 rounded-lg text-sm font-medium transition-all",
                currentView === "profile"
                  ? "bg-[#003366] text-white shadow-md"
                  : "text-gray-600 dark:text-gray-400 hover:bg-white dark:hover:bg-gray-800 hover:text-[#003366] dark:hover:text-blue-400 border border-transparent hover:border-gray-200 dark:hover:border-gray-700",
              )}
            >
              <User className="h-5 w-5" />
              Il Mio Profilo
            </button>

            <div className="flex justify-center gap-4 text-[10px] text-gray-400 dark:text-gray-500 mt-2">
              <button
                onClick={() => openLegal("terms")}
                className="hover:text-[#003366] dark:hover:text-blue-400 transition-colors"
              >
                Termini
              </button>
              <button
                onClick={() => openLegal("privacy")}
                className="hover:text-[#003366] dark:hover:text-blue-400 transition-colors"
              >
                Privacy
              </button>
              <button
                onClick={() => openLegal("cookie")}
                className="hover:text-[#003366] dark:hover:text-blue-400 transition-colors"
              >
                Cookie
              </button>
            </div>
            <p className="text-[10px] text-center text-gray-400 dark:text-gray-600">
              Uni Search alpha v1.0
            </p>
          </div>
        </div>
      </div>

      <LegalModal
        isOpen={legalModalOpen}
        onClose={() => setLegalModalOpen(false)}
        documentType={legalDocType}
      />

      <DeleteConfirmationModal
        isOpen={!!chatToDelete}
        onClose={() => setChatToDelete(null)}
        onConfirm={confirmDelete}
      />
    </>
  );
};

interface ChatListItemProps {
  chat: Chat;
  isActive: boolean;
  onSelect: () => void;
  onDelete: (e: React.MouseEvent) => void;
}

const ChatListItem: React.FC<ChatListItemProps> = ({
  chat,
  isActive,
  onSelect,
  onDelete,
}) => (
  <div
    className={cn(
      "w-full group relative rounded-lg transition-all duration-200 border",
      isActive
        ? "bg-blue-50/50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-800/50 text-[#003366] dark:text-blue-100 shadow-sm"
        : "hover:bg-gray-50 dark:hover:bg-gray-800/50 border-transparent text-gray-700 dark:text-gray-300",
    )}
  >
    <button
      onClick={onSelect}
      className="w-full text-left p-3 pr-8 rounded-lg text-sm"
    >
      <div className="font-medium truncate">{chat.title || "Nuova Chat"}</div>
      <div className="flex items-center justify-between mt-1">
        <span className="text-[10px] text-gray-400 dark:text-gray-500 font-medium bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded">
          {new Date(chat.created_at).toLocaleDateString()}
        </span>
      </div>
    </button>
    <button
      onClick={onDelete}
      className="absolute right-2 top-1/2 -translate-y-1/2 opacity-100 md:opacity-0 md:group-hover:opacity-100 p-2 md:p-1.5 hover:bg-red-100 dark:hover:bg-red-900/30 text-gray-400 hover:text-red-500 rounded transition-all"
      title="Elimina chat"
    >
      <Trash2 className="h-4 w-4" />
    </button>
  </div>
);

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isOpen && e.key === "Enter") {
        onConfirm();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onConfirm]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <Card className="w-full max-w-sm bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 shadow-2xl">
        <CardContent className="p-6">
          <div className="flex flex-col items-center text-center">
            <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-4">
              <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">
              Elimina Chat
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              Sei sicuro di voler eliminare questa chat? Questa azione non può
              essere annullata.
            </p>
            <div className="flex w-full gap-3">
              <Button variant="outline" className="flex-1" onClick={onClose}>
                Annulla
              </Button>
              <Button
                variant="destructive"
                className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                onClick={onConfirm}
              >
                Elimina
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ChatSidebar;
