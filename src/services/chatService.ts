import { ENDPOINTS } from "@/config/endpoints";
import type {
  ChatListItem,
  ChatDetail,
  SaveChatRequest,
  SaveChatResponse,
} from "@/types/api";

async function authFetch(
  url: string,
  options: RequestInit = {},
  token: string,
): Promise<Response> {
  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });

  if (response.status === 401) {
    throw new Error("UNAUTHORIZED");
  }

  if (!response.ok) {
    throw new Error(
      `Errore ${response.status}: ${response.statusText}`,
    );
  }

  return response;
}

export async function saveChat(
  token: string,
  messages: unknown[],
  title: string,
  chatId?: number,
): Promise<number> {
  const body: SaveChatRequest = { messages, title };
  if (chatId !== undefined) {
    body.chat_id = chatId;
  }

  const response = await authFetch(
    ENDPOINTS.CHAT.SAVE,
    { method: "POST", body: JSON.stringify(body) },
    token,
  );

  const data: SaveChatResponse = await response.json();
  return data.chat_id;
}

export async function listChats(token: string): Promise<ChatListItem[]> {
  const response = await authFetch(ENDPOINTS.CHAT.HISTORY, {}, token);
  const data: ChatListItem[] = await response.json();
  return data;
}

export async function getChat(
  token: string,
  chatId: number,
): Promise<ChatDetail> {
  const response = await authFetch(
    ENDPOINTS.CHAT.DETAIL(chatId),
    {},
    token,
  );
  const data: ChatDetail = await response.json();
  return data;
}

export async function deleteChat(
  token: string,
  chatId: number,
): Promise<void> {
  await authFetch(
    ENDPOINTS.CHAT.DELETE(chatId),
    { method: "DELETE" },
    token,
  );
}
