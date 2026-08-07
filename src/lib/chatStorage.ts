import type { Chat } from "@/types";
import type { Message } from "@/components/rag/types";

interface StoredMessage extends Omit<Message, "timestamp"> {
  timestamp: string;
}

interface StoredChat extends Omit<Chat, "id"> {
  id: number;
  updated_at: string;
  messages: StoredMessage[];
}

export interface LocalChat extends Chat {
  updated_at: string;
  messages: Message[];
}

const STORAGE_PREFIX = "uni-search-chats";

const getStorageKey = (userKey: string) => `${STORAGE_PREFIX}:${userKey}`;

const getChatTitle = (firstMessage: string) => {
  const trimmed = firstMessage.trim();
  return trimmed ? trimmed.slice(0, 50) : "Nuova Chat";
};

const toStoredMessage = (message: Message): StoredMessage => ({
  ...message,
  timestamp: message.timestamp.toISOString(),
});

const toRuntimeMessage = (message: StoredMessage): Message => ({
  ...message,
  timestamp: new Date(message.timestamp),
});

const toRuntimeChat = (chat: StoredChat): LocalChat => ({
  id: chat.id,
  title: chat.title,
  created_at: chat.created_at,
  updated_at: chat.updated_at,
  messages: chat.messages.map(toRuntimeMessage),
});

const sortByRecent = (chats: StoredChat[]) =>
  [...chats].sort(
    (a, b) =>
      new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime(),
  );

const parseStoredChats = (raw: string | null): StoredChat[] => {
  if (!raw) return [];

  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed.flatMap((entry) => {
      if (!entry || typeof entry !== "object") return [];

      const maybeChat = entry as Partial<StoredChat>;
      if (
        typeof maybeChat.id !== "number" ||
        typeof maybeChat.title !== "string" ||
        typeof maybeChat.created_at !== "string" ||
        typeof maybeChat.updated_at !== "string" ||
        !Array.isArray(maybeChat.messages)
      ) {
        return [];
      }

      const messages = maybeChat.messages.flatMap((message) => {
        if (!message || typeof message !== "object") return [];

        const maybeMessage = message as Partial<StoredMessage>;
        if (
          typeof maybeMessage.id !== "string" ||
          (maybeMessage.type !== "user" && maybeMessage.type !== "assistant") ||
          typeof maybeMessage.content !== "string" ||
          typeof maybeMessage.timestamp !== "string"
        ) {
          return [];
        }

        return [maybeMessage as StoredMessage];
      });

      return [{ ...maybeChat, messages } as StoredChat];
    });
  } catch (error) {
    console.error("Failed to parse local chats from storage", error);
    return [];
  }
};

const readChats = (userKey: string): StoredChat[] => {
  if (!userKey || typeof window === "undefined") return [];
  const raw = window.localStorage.getItem(getStorageKey(userKey));
  return sortByRecent(parseStoredChats(raw));
};

const writeChats = (userKey: string, chats: StoredChat[]) => {
  if (!userKey || typeof window === "undefined") return;
  window.localStorage.setItem(getStorageKey(userKey), JSON.stringify(chats));
};

const generateUniqueChatId = (chats: StoredChat[]) => {
  let candidate = Date.now() + Math.floor(Math.random() * 1000);
  while (chats.some((chat) => chat.id === candidate)) {
    candidate += 1;
  }
  return candidate;
};

export const listChats = (userKey: string): Chat[] =>
  readChats(userKey).map(({ id, title, created_at }) => ({
    id,
    title,
    created_at,
  }));

export const getChat = (userKey: string, chatId: number): LocalChat | null => {
  const chat = readChats(userKey).find((entry) => entry.id === chatId);
  return chat ? toRuntimeChat(chat) : null;
};

export const createChat = (
  userKey: string,
  firstMessage: string,
  initialMessages: Message[],
): LocalChat => {
  const chats = readChats(userKey);
  const now = new Date().toISOString();
  const newChat: StoredChat = {
    id: generateUniqueChatId(chats),
    title: getChatTitle(firstMessage),
    created_at: now,
    updated_at: now,
    messages: initialMessages.map(toStoredMessage),
  };

  const updatedChats = sortByRecent([newChat, ...chats]);
  writeChats(userKey, updatedChats);

  return toRuntimeChat(newChat);
};

export const updateChat = (
  userKey: string,
  chatId: number,
  messages: Message[],
): LocalChat | null => {
  const chats = readChats(userKey);
  const chatIndex = chats.findIndex((entry) => entry.id === chatId);
  if (chatIndex === -1) return null;

  const now = new Date().toISOString();
  const firstUserMessage = messages.find((message) => message.type === "user");
  const updatedChat: StoredChat = {
    ...chats[chatIndex],
    title: firstUserMessage ? getChatTitle(firstUserMessage.content) : "Nuova Chat",
    updated_at: now,
    messages: messages.map(toStoredMessage),
  };

  const nextChats = [...chats];
  nextChats[chatIndex] = updatedChat;
  const sortedChats = sortByRecent(nextChats);
  writeChats(userKey, sortedChats);

  return toRuntimeChat(updatedChat);
};

export const deleteChat = (userKey: string, chatId: number) => {
  const chats = readChats(userKey);
  const filtered = chats.filter((chat) => chat.id !== chatId);
  writeChats(userKey, filtered);
};
