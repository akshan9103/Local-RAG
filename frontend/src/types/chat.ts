// path: frontend/src/types/chat.ts

export interface Citation {
  id: number;
  text: string;
  metadata: Record<string, any>;
}

export interface ChatMessage {
  id: number | string; // Adjusted to accept string for optimistic client IDs
  content: string;
  role: "assistant" | "user" | "system"; // Vercel AI SDK roles
  created_at?: string;
}

export interface KnowledgeBase {
  id: number;
  name: string;
}

export interface Chat {
  id: number;
  title: string;
  created_at: string;
  updated_at: string;
  knowledge_bases?: KnowledgeBase[];
  messages: ChatMessage[];
}