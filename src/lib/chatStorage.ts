import type { Chat } from "@/types";
import type { Message } from "@/components/rag/types";
import type { ChatListItem } from "@/types/api";
import {
  saveChat as apiSaveChat,
  listChats as apiListChats,
  getChat as apiGetChat,
  deleteChat as apiDeleteChat,
} from "@/services/chatService";

export interface LocalChat extends Chat {
  updated_at: string;
  messages: Message[];
}

export { type Chat } from "@/types";

const getChatTitle = (firstMessage: string): string => {
  const trimmed = firstMessage.trim();
  return trimmed ? trimmed.slice(0, 50) : "Nuova Chat";
};

const toStoredMessages = (messages: Message[]): unknown[] =>
  messages.map((message) => ({
    ...message,
    timestamp: message.timestamp.toISOString(),
  }));

const toRuntimeMessages = (rawMessages: unknown[]): Message[] =>
  (rawMessages as Array<Record<string, unknown>>).map(
    (message) =>
      ({
        ...message,
        timestamp: new Date(message.timestamp as string),
      }) as Message,
  );

const toApiChatListItem = (item: ChatListItem): Chat => ({
  id: item.id,
  title: item.title,
  created_at: item.created_at,
});

export const listChats = async (token: string): Promise<Chat[]> => {
  const data = await apiListChats(token);
  return data.map(toApiChatListItem);
};

export const getChat = async (
  token: string,
  chatId: number,
): Promise<LocalChat | null> => {
  try {
    const chat = await apiGetChat(token, chatId);
    return {
      id: chat.id,
      title: chat.title,
      created_at: chat.created_at,
      updated_at: chat.updated_at,
      messages: toRuntimeMessages(chat.messages),
    };
  } catch {
    return null;
  }
};

export const createChat = async (
  token: string,
  firstMessage: string,
  initialMessages: Message[],
): Promise<LocalChat> => {
  const title = getChatTitle(firstMessage);
  const storedMessages = toStoredMessages(initialMessages);
  const chatId = await apiSaveChat(token, storedMessages, title);
  const now = new Date().toISOString();
  return {
    id: chatId,
    title,
    created_at: now,
    updated_at: now,
    messages: initialMessages,
  };
};

export const updateChat = async (
  token: string,
  chatId: number,
  messages: Message[],
): Promise<LocalChat | null> => {
  try {
    const storedMessages = toStoredMessages(messages);
    const firstUserMessage = messages.find((message) => message.type === "user");
    const title = firstUserMessage
      ? getChatTitle(firstUserMessage.content)
      : "Nuova Chat";
    await apiSaveChat(token, storedMessages, title, chatId);
    const updated = await apiGetChat(token, chatId);
    return {
      id: updated.id,
      title: updated.title,
      created_at: updated.created_at,
      updated_at: updated.updated_at,
      messages: toRuntimeMessages(updated.messages),
    };
  } catch {
    return null;
  }
};

export const deleteChat = async (
  token: string,
  chatId: number,
): Promise<void> => {
  await apiDeleteChat(token, chatId);
};
