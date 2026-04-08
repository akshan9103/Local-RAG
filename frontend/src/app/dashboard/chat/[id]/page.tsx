"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useChat } from "ai/react";
import { Send, User, Bot, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import DashboardLayout from "@/components/layout/dashboard-layout";
import { api, ApiError } from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";
import { Answer } from "@/components/chat/answer";

// --- Types ---
interface ChatMessage {
  id: number;
  content: string;
  role: "assistant" | "user";
  created_at: string;
}

interface Chat {
  id: number;
  title: string;
  messages: ChatMessage[];
}

interface Citation {
  id: number;
  text: string;
  metadata: Record<string, any>;
}

declare module "ai/react" {
  interface Message {
    citations?: Citation[];
  }
}

// --- Utils ---
const markdownParse = (text: string) => {
  return text
    .replace(/\[\[([cC])itation/g, "[citation")
    .replace(/[cC]itation:(\d+)]]/g, "citation:$1]")
    .replace(/\[\[([cC]itation:\d+)]](?!])/g, `[$1]`)
    .replace(/\[[cC]itation:(\d+)]/g, "[citation]($1)");
};

const parseLLMResponse = (content: string) => {
  if (!content.includes("__LLM_RESPONSE__")) {
    return { text: markdownParse(content), citations: [] };
  }

  try {
    const [base64Part, responseText] = content.split("__LLM_RESPONSE__");
    const contextData = base64Part
      ? (JSON.parse(atob(base64Part.trim())) as {
          context: Array<{ page_content: string; metadata: Record<string, any> }>;
        })
      : null;

    const citations: Citation[] =
      contextData?.context.map((citation, index) => ({
        id: index + 1,
        text: citation.page_content,
        metadata: citation.metadata,
      })) || [];

    return { text: markdownParse(responseText || ""), citations };
  } catch (e) {
    console.error("Failed to parse LLM response:", e);
    return { text: markdownParse(content), citations: [] };
  }
};

// --- Component ---
export default function ChatPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    setMessages,
  } = useChat({
    api: `http://localhost:8001/api/chat/${params.id}/messages`,
    headers: {
      Authorization: `Bearer ${
        typeof window !== "undefined" ? window.localStorage.getItem("token") || "" : ""
      }`,
    },
  });

  // Fetch chat
  useEffect(() => {
    const fetchChat = async () => {
      try {
        const data: Chat = await api.get(`/api/chat/${params.id}`);
        const formattedMessages = data.messages.map((msg) => ({
          id: msg.id.toString(),
          role: msg.role,
          content: msg.content,
        }));
        setMessages(formattedMessages);
      } catch (error) {
        console.error("Failed:", error);
        if (error instanceof ApiError) {
          toast({
            title: "Connection Error",
            description: error.message,
            variant: "destructive",
          });
        }
        router.push("/dashboard/chat");
      } finally {
        setIsInitialLoad(false);
      }
    };

    if (isInitialLoad) fetchChat();
  }, [params.id, isInitialLoad, setMessages, router, toast]);

  // Auto scroll
  useEffect(() => {
    if (!isInitialLoad) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isInitialLoad]);

  const processedMessages = useMemo(() => {
    return messages.map((message) => {
      if (message.role !== "assistant" || !message.content) return message;
      const { text, citations } = parseLLMResponse(message.content);
      return { ...message, content: text, citations };
    });
  }, [messages]);

  return (
    <DashboardLayout>
      <div className="flex flex-col h-dvh bg-gradient-to-b from-background to-background/80">

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 scroll-smooth pb-32">

          {processedMessages.length === 0 && !isLoading && !isInitialLoad && (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground opacity-70">
              <Sparkles className="w-12 h-12 mb-4 text-primary/50" />
              <p className="text-lg font-medium">Start a conversation</p>
              <p className="text-sm">Type a message below to begin.</p>
            </div>
          )}

          <AnimatePresence initial={false}>
            {processedMessages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 15, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.3 }}
                className={`flex items-start space-x-3 ${
                  message.role === "assistant" ? "justify-start" : "justify-end"
                }`}
              >
                {message.role === "assistant" && (
                  <div className="w-8 h-8 flex items-center justify-center rounded-full bg-secondary/50 border">
                    <img src="/logo.png" className="h-6 w-6 rounded-full" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] md:max-w-[75%] rounded-2xl px-5 py-3 shadow-sm ${
                    message.role === "assistant"
                      ? "bg-card border"
                      : "bg-primary text-primary-foreground"
                  }`}
                >
                  {message.role === "assistant" ? (
                    <Answer markdown={message.content} citations={message.citations} />
                  ) : (
                    <div className="whitespace-pre-wrap">{message.content}</div>
                  )}
                </div>

                {message.role === "user" && (
                  <div className="w-8 h-8 rounded-full bg-primary/20 border flex items-center justify-center">
                    <User className="h-4 w-4 text-primary" />
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Typing */}
          {isLoading && (
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 flex items-center justify-center rounded-full bg-secondary/50 border">
                <Bot className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="bg-card border rounded-2xl px-4 py-3 flex space-x-1">
                <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce delay-150" />
                <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce delay-300" />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="sticky bottom-0 z-50 bg-background/60 backdrop-blur-xl supports-[backdrop-filter]:bg-background/40 border-t p-4 pb-6">

          <form
            onSubmit={handleSubmit}
            className="max-w-4xl mx-auto flex items-center 
            bg-background/70 backdrop-blur-lg border rounded-xl shadow-lg px-2"
          >
            <input
              value={input}
              onChange={handleInputChange}
              placeholder="Message the assistant..."
              className="w-full px-4 py-3 bg-transparent outline-none text-sm"
            />

            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="p-2 rounded-lg bg-primary text-white disabled:opacity-50"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>

          <p className="text-center mt-2 text-xs text-muted-foreground">
            AI can make mistakes. Verify important info.
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}