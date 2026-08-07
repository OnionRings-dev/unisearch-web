export interface Message {
  id: string;
  type: "user" | "assistant";
  content: string;
  timestamp: Date;
  reasoningText?: string;
  thinkingText?: string;
  isStreaming?: boolean;
  showRawText?: boolean;
  query?: string;
  foundLinks?: { url: string; title: string; iteration?: number; source?: string }[];
  webLinks?: { url: string; title: string }[];
  phases?: { phase: string; status?: string; [key: string]: unknown }[];
}

export interface RagInterfaceProps {
  userId: number;
  token: string;
  userEmail: string;
  onLogout: () => void;
}
