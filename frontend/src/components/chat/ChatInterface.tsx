"use client";

import { useRef, useEffect, useMemo, useState } from "react";
import { Send, User, Command, Sparkles, Square, RefreshCw, AlertTriangle, ArrowDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Answer } from "@/components/chat/answer";
import { parseLLMResponse } from "@/lib/chat-utils";
import { Message } from "ai/react";
import TextareaAutosize from 'react-textarea-autosize';

interface ChatInterfaceProps {
  messages: Message[];
  input: string;
  handleInputChange: (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  isLoading: boolean;
  hasStartedChat: boolean;
  stop: () => void;
  reload: () => void;
  error?: Error;
}

export function ChatInterface({
  messages,
  input,
  handleInputChange,
  onSubmit,
  isLoading,
  hasStartedChat,
  stop,
  reload,
  error
}: ChatInterfaceProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  
  // Smart Scroll State
  const [isAtBottom, setIsAtBottom] = useState(true);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    // If we are within 100px of the bottom, consider it "at bottom"
    setIsAtBottom(scrollHeight - scrollTop - clientHeight < 100);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Auto-scroll ONLY if the user is already at the bottom
  useEffect(() => {
    if (isAtBottom) {
      scrollToBottom();
    }
  }, [messages, isAtBottom]);

  // Parse citations on the fly
  const processedMessages = useMemo(() => {
    return messages.map((m) => {
      if (m.role !== "assistant") return m;
      const { text, citations } = parseLLMResponse(m.content);
      return { ...m, content: text, citations };
    });
  }, [messages]);

  return (
    <div className="relative flex flex-col h-[100dvh] bg-background font-sans selection:bg-primary/30">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />

      {/* Main Chat Area */}
      <div 
        className="flex-1 overflow-y-auto px-4 py-8 space-y-8 relative z-10 custom-scrollbar"
        onScroll={handleScroll}
      >
        <div className="max-w-4xl mx-auto space-y-8 pb-32">
          
          {/* Empty State */}
          {!hasStartedChat && processedMessages.length === 0 && !isLoading && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center justify-center h-[60vh] text-center">
              <div className="relative w-20 h-20 mb-6 flex items-center justify-center">
                <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse" />
                <div className="relative bg-gradient-to-br from-primary to-primary/60 text-primary-foreground p-4 rounded-2xl shadow-xl shadow-primary/25">
                  <Sparkles className="w-8 h-8" />
                </div>
              </div>
              <h2 className="text-3xl font-semibold tracking-tight mb-2 text-foreground">How can I help you today?</h2>
            </motion.div>
          )}

          {/* Messages Loop */}
          <AnimatePresence mode="popLayout">
            {processedMessages.map((message, index) => {
              const isLastMessage = index === processedMessages.length - 1;
              const isAssistantGenerating = isLoading && isLastMessage && message.role === "assistant";

              return (
                <motion.div key={message.id} layout initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} className={`flex w-full ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`flex items-start gap-4 max-w-[85%] md:max-w-[75%] ${message.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                    <div className={`shrink-0 w-9 h-9 mt-1 rounded-full flex items-center justify-center shadow-sm ${message.role === "assistant" ? "bg-card border border-border/50" : "bg-primary/10 text-primary"}`}>
                      {message.role === "assistant" ? <Command className="w-5 h-5 text-foreground/70" /> : <User className="w-5 h-5" />}
                    </div>
                    <div className={`relative px-5 py-4 text-[15px] leading-relaxed shadow-sm overflow-hidden ${message.role === "assistant" ? "bg-card/60 backdrop-blur-sm border border-border/50 rounded-2xl rounded-tl-sm w-full" : "bg-gradient-to-br from-primary to-primary/90 text-primary-foreground rounded-2xl rounded-tr-sm"}`}>
                      {message.role === "assistant" ? (
                        <div>
                          <Answer markdown={message.content} citations={(message as any).citations} />
                          {/* Blinking Cursor Effect */}
                          {isAssistantGenerating && (
                            <span className="ml-1 inline-block w-2 h-4 bg-foreground animate-pulse align-middle" />
                          )}
                        </div>
                      ) : (
                        <div className="whitespace-pre-wrap font-medium">{message.content}</div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>

          {/* Typing Indicator (Only shows before the first token arrives) */}
          {isLoading && processedMessages.at(-1)?.role !== "assistant" && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-start gap-4">
              <div className="shrink-0 w-9 h-9 rounded-full bg-card border flex items-center justify-center shadow-sm"><Command className="w-5 h-5 animate-pulse text-foreground/70" /></div>
              <div className="bg-card/60 border rounded-2xl rounded-tl-sm px-5 py-4 flex items-center gap-1.5 h-[52px]">
                 <div className="w-2 h-2 rounded-full bg-primary/60 animate-pulse" />
                 <div className="w-2 h-2 rounded-full bg-primary/60 animate-pulse delay-75" />
                 <div className="w-2 h-2 rounded-full bg-primary/60 animate-pulse delay-150" />
              </div>
            </motion.div>
          )}

          {/* Error State */}
          {error && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 p-4 mt-4 text-sm text-red-600 bg-red-50 rounded-lg border border-red-100 max-w-4xl mx-auto">
              <AlertTriangle className="w-5 h-5" />
              <p>There was an error generating the response. Please try again.</p>
            </motion.div>
          )}

          <div ref={messagesEndRef} className="h-4" />
        </div>
      </div>

      {/* Floating Controls Area */}
      <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6 bg-gradient-to-t from-background via-background/95 to-transparent z-20">
        <div className="max-w-3xl mx-auto flex flex-col items-center gap-3">
          
          {/* Smart Scroll Down Button */}
          {!isAtBottom && (
            <button 
              onClick={scrollToBottom}
              className="absolute -top-12 right-0 p-2 bg-background border rounded-full shadow-md text-foreground/70 hover:text-foreground transition-all"
            >
              <ArrowDown className="w-4 h-4" />
            </button>
          )}

          {/* Stop / Regenerate Controls */}
          {hasStartedChat && (
            <div className="flex justify-center w-full">
              {isLoading ? (
                <button onClick={stop} className="flex items-center gap-2 px-4 py-2 text-xs font-medium bg-background border rounded-full shadow-sm text-muted-foreground hover:text-foreground transition-colors">
                  <Square className="w-3 h-3 fill-current" /> Stop Generating
                </button>
              ) : processedMessages.length > 0 && !error ? (
                <button onClick={() => reload()} className="flex items-center gap-2 px-4 py-2 text-xs font-medium bg-background border rounded-full shadow-sm text-muted-foreground hover:text-foreground transition-colors">
                  <RefreshCw className="w-3 h-3" /> Regenerate
                </button>
              ) : null}
            </div>
          )}

          {/* Input Form with Auto-Resize Textarea */}
          <form ref={formRef} onSubmit={onSubmit} className="relative w-full flex items-end bg-card border shadow-xl rounded-3xl overflow-hidden focus-within:ring-2 focus-within:ring-primary/20">
            <TextareaAutosize
              value={input}
                onChange={(e) => handleInputChange(e)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  formRef.current?.requestSubmit(); // Triggers the onSubmit
                }
              }}
              placeholder="Ask anything... (Shift+Enter for new line)"
              maxRows={8}
              className="flex-1 px-6 py-4 bg-transparent outline-none resize-none min-h-[56px] text-[15px]"
            />
            <div className="pr-2 pb-2 self-end">
              <button type="submit" disabled={isLoading || !input.trim()} className="p-2.5 m-1 rounded-full bg-primary text-primary-foreground disabled:opacity-40 transition-transform active:scale-95">
                <Send className="w-4 h-4 ml-0.5" />
              </button>
            </div>
          </form>
          <p className="text-center text-xs text-muted-foreground font-medium">
             AI can make mistakes. Verify important information.
          </p>
        </div>
      </div>
    </div>
  );
}