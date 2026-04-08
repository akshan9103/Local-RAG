// path: frontend/src/app/chat/[kb_id]/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { v4 as uuidv4 } from "uuid";
import { useChat } from "ai/react";
import { ChatInterface } from "@/components/chat/ChatInterface";
import { api } from "@/lib/api";

export default function NewChatPage({ params }: { params: { kb_id: string } }) {
  // 1. Generate ID on mount to ensure API URL is ready immediately
  const [chatId] = useState<string>(() => uuidv4());
  const [token, setToken] = useState<string>("");
  const [hasStartedChat, setHasStartedChat] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setToken(localStorage.getItem("token") || "");
  }, []);

  const { messages, input, handleInputChange, handleSubmit, isLoading, stop, reload, error } = useChat({
    api: `http://localhost:8001/api/chat/new/${chatId}/messages`,
    headers: { Authorization: `Bearer ${token}` },
    onFinish: async () => {
      // 1. Tell sidebar the stream is done
      window.dispatchEvent(new CustomEvent("chat-finished", { detail: { id: chatId } }));

      // 2. VERIFICATION LOOP: Make sure the DB is actually ready
      let ready = false;
      let attempts = 0;

      while (!ready && attempts < 5) {
        try {
          const res = await api.get(`http://localhost:8001/api/chat/${chatId}`, {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
          });
          
          if (res.ok) {
            ready = true;
          } else {
            // Wait 1 second before trying again
            await new Promise(resolve => setTimeout(resolve, 1000));
            attempts++;
          }
        } catch (e) {
          await new Promise(resolve => setTimeout(resolve, 1000));
          attempts++;
        }
      }

      // 3. FINAL PUSH: Now we know the ChatPage will find the data!
      router.push(`/chat/${params.kb_id}/${chatId}`, { scroll: false });
    }
  });

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    // Immediately hide the "Empty State" and show the chat layout
    setHasStartedChat(true);

    try {
      // 1. Create chat in the DB first
      const response = await fetch("http://localhost:8001/api/chat/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          id: chatId,
          title: "Generating...", // Temporary DB placeholder
          knowledge_base_ids: [Number(params.kb_id)],
        }),
      });

      if (!response.ok) throw new Error("Failed to create chat");

      // 2. Silently update the URL so Next.js doesn't unmount our component
      window.history.replaceState(null, "", `/chat/${params.kb_id}/${chatId}`);

      // 3. TRIGGER THE SKELETON LOADER
      // Tell the sidebar that a chat is generating right now
      window.dispatchEvent(new CustomEvent("chat-started", { 
        detail: { id: chatId } 
      }));

      // 4. Start streaming the AI response
      handleSubmit(e);
      
    } catch (err) {
      console.error("Failed to create chat", err);
      setHasStartedChat(false); // Revert UI if DB creation fails
    }
  };

  return (
    <ChatInterface
      messages={messages}
      input={input}
      handleInputChange={(e) => handleInputChange(e)}      
      onSubmit={onSubmit}
      isLoading={isLoading}
      hasStartedChat={hasStartedChat}
      stop={stop}
      reload={reload}
      error={error}
    />
  );
}