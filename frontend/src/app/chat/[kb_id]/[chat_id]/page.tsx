// path: frontend/src/app/chat/[kb_id]/[chat_id]/page.tsx
"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useChat } from "ai/react";
import { api } from "@/lib/api";
import { ChatInterface } from "@/components/chat/ChatInterface";

export default function ChatPage({ params }: { params: { kb_id: string; chat_id: string } }) {
  const router = useRouter();
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [token, setToken] = useState<string | null>(null);
  
  // Track if we've already fetched the history to prevent infinite loops
  const hasFetchedHistory = useRef(false);

  // 1. Get Token first
  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    if (!savedToken) {
      router.push("/login"); // Safety check
      return;
    }
    setToken(savedToken);
  }, [router]);

  // 2. Initialize useChat ONLY when token is ready
  const { messages, input, handleInputChange, handleSubmit, isLoading, setMessages, stop, reload, error } = useChat({
    api: `http://localhost:8001/api/chat/${params.chat_id}/messages`,
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    // If the user lands here via a push, we want to ensure we don't clear 
    // any existing optimistic state if we were to pass it via a store.
  });

  // 3. Fetch History with Retry Logic
  useEffect(() => {
    if (!token || hasFetchedHistory.current) return;

    const fetchChat = async (retries = 3) => {
      try {
        const data = await api.get(`/api/chat/${params.chat_id}`);
        
        // Transform backend messages to Vercel AI SDK format
        const formattedMessages = data.messages.map((msg: any) => ({
          id: String(msg.id),
          role: msg.role,
          content: msg.content,
        }));

        setMessages(formattedMessages);
        hasFetchedHistory.current = true;
        setIsInitialLoad(false);
      } catch (err: any) {
        if (err.status === 404 && retries > 0) {
          // If the DB is still catching up from the 'New' chat creation, wait and retry
          console.warn(`Chat not found, retrying... (${retries} left)`);
          setTimeout(() => fetchChat(retries - 1), 1000);
        } else {
          console.error("Failed to fetch chat history:", err);
          setIsInitialLoad(false);
          // Only redirect if it's truly gone after retries
          if (err.status === 404) router.push("/dashboard");
        }
      }
    };

    fetchChat();
  }, [params.chat_id, token, setMessages, router]);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    handleSubmit(e);
  };

  // Prevent rendering the interface until we are sure we have the token 
  // and have attempted the first load.
  if (!token) return null;

  return (
    <ChatInterface
      messages={messages}
      input={input}
      handleInputChange={(e) => handleInputChange(e)}      
      onSubmit={onSubmit}
      isLoading={isLoading}
      hasStartedChat={messages.length > 0 || !isInitialLoad}
      stop={stop}
      reload={reload}
      error={error} 
    />
  );
}