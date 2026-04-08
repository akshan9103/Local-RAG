'use client'

import { useEffect, useState, useMemo, useRef } from "react"
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { Plus, PanelLeftClose, PanelLeftOpen, Search, Loader2, SquarePen, Trash2, LogOut, Database, MoreHorizontal } from 'lucide-react'

import { api, ApiError } from "@/lib/api"
import { useToast } from "@/components/ui/use-toast"
import { Skeleton } from "@/components/ui/skeleton"

// ---------------- TYPES ----------------
interface KnowledgeBase {
  id: number;
  name: string;
}

interface Chat {
  id: number | string;
  title: string;
  created_at: string;
  updated_at: string;
  knowledge_bases: KnowledgeBase[];
}

// ---------------- COMPONENT ----------------
export default function ChatSidebar() {
  const { toast } = useToast()
  const router = useRouter()
  
  const params = useParams() as {
    kb_id?: string
    chat_id?: string
  }
  
  const activeChatId = params?.chat_id || null;

  // State
  const [chats, setChats] = useState<Chat[]>([])
  const [loading, setLoading] = useState(true)
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [isCreating, setIsCreating] = useState(false)
  
  const [pendingChatId, setPendingChatId] = useState<string | null>(null);

  // ---------------- API CALLS & EVENTS ----------------
  useEffect(() => {
    fetchChats()

    const handleChatStarted = (e: Event) => {
      const { id } = (e as CustomEvent).detail || {};
      if (id) setPendingChatId(id);
    }

    const handleChatFinished = (e: Event) => {
      const { id } = (e as CustomEvent).detail || {};
      if (!id) {
        setPendingChatId(null);
        fetchChats(true);
        return;
      }

      let attempts = 0;

      const pollForTitle = async () => {
        if (attempts > 24) { 
          setPendingChatId(null); 
          fetchChats(true);
          return;
        }

        try {
          const endpoint = params.kb_id 
            ? `/api/chat/list?knowledge_base_ids=${params.kb_id}` 
            : `/api/chat`;
            
          const data: Chat[] = await api.get(endpoint);
          const targetChat = data.find(c => String(c.id) === String(id));
          
          if (targetChat && targetChat.title === "Generating...") {
            attempts++;
            setTimeout(pollForTitle, 5000); 
          } else {
            setChats(data);
            setPendingChatId(null);
          }
        } catch (error) {
          console.error("Polling error:", error);
          setPendingChatId(null);
        }
      };

      setTimeout(pollForTitle, 3000);
    }

    window.addEventListener("chat-started", handleChatStarted);
    window.addEventListener("chat-finished", handleChatFinished);

    return () => {
      window.removeEventListener("chat-started", handleChatStarted);
      window.removeEventListener("chat-finished", handleChatFinished);
    }
  }, [params.kb_id])

  const fetchChats = async (silent = false) => {
    try {
      if (!silent && chats.length === 0) setLoading(true)
      
      const endpoint = params.kb_id 
        ? `/api/chat/list?knowledge_base_ids=${params.kb_id}` 
        : `/api/chat/list`

      const data = await api.get(endpoint)
      setChats(data)
    } catch (error) {
      console.error("Failed to fetch chats:", error)
      if (error instanceof ApiError && !silent) {
        toast({ title: "Failed to load history", description: error.message, variant: "destructive" })
      }
    } finally {
      if (!silent) setLoading(false)
    }
  }

  const handleNewChat = () => {
    const targetKbId = params.kb_id || 'default';
    router.push(`/chat/${targetKbId}`);
    if (window.innerWidth < 640) setIsCollapsed(true);
  }

  const handleRenameChat = async (chatId: number | string, newTitle: string) => {
    try {
      setChats(prev => prev.map(c => c.id === chatId ? { ...c, title: newTitle } : c))
      await api.put(`/api/chat/${chatId}/title`, { title: newTitle })
    } catch (error) {
      fetchChats(true)
      toast({ title: "Error renaming chat", variant: "destructive" })
    }
  }

  const handleDeleteChat = async (chatId: number | string) => {
    try {
      setChats(prev => prev.filter(c => c.id !== chatId))
      await api.delete(`/api/chat/${chatId}`)
      
      if (activeChatId === String(chatId)) {
        router.push(`/chat/${params.kb_id || 'default'}`)
      }
    } catch (error) {
      fetchChats(true)
      toast({ title: "Error deleting chat", variant: "destructive" })
    }
  }

  const handleLogout = async () => {
    await api.post("/api/auth/logout");
    localStorage.removeItem("token");
    router.push("/login");
  };

  // ---------------- DATA PROCESSING ----------------
  const sortedFilteredChats = useMemo(() => {
    return chats
      .filter((chat) => chat.title.toLowerCase().includes(searchQuery.toLowerCase()))
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }, [chats, searchQuery])

  // Extract KB name from the first available chat object
  const activeKbName = useMemo(() => {
    if (chats.length > 0 && chats[0].knowledge_bases && chats[0].knowledge_bases.length > 0) {
      return chats[0].knowledge_bases[0].name;
    }
    return null;
  }, [chats])

  // ---------------- RENDER ----------------
  return (
    <aside className={`relative flex flex-col h-screen bg-white/50 backdrop-blur-xl border-r border-gray-200/60 shadow-[4px_0_24px_rgba(0,0,0,0.02)] transition-all duration-400 ease-[cubic-bezier(0.25,1,0.5,1)] dark:bg-zinc-950/50 dark:border-zinc-800/60 dark:shadow-[4px_0_24px_rgba(0,0,0,0.2)] ${isCollapsed ? "w-0 opacity-0 overflow-hidden sm:w-[72px] sm:opacity-100" : "w-[280px]"}`}>
      
      {/* Header */}
      <div className="flex flex-col p-4 gap-4">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <Link href="/dashboard" className="flex items-center gap-3 text-lg font-bold hover:text-primary transition-all duration-300 transform hover:scale-[1.02]">
              <div className="relative">
                <img src="/logo_v2.png" alt="Logo" className="w-8 h-8 rounded-xl shadow-sm" />
                <div className="absolute inset-0 rounded-xl ring-1 ring-inset ring-black/10 dark:ring-white/10" />
              </div>
              <span className="tracking-tight bg-clip-text text-transparent bg-gradient-to-br from-gray-900 to-gray-600 dark:from-white dark:to-zinc-400">LocalRAG.</span>
            </Link>
          )}
          <button onClick={() => setIsCollapsed(!isCollapsed)} className={`p-2 text-gray-400 rounded-xl hover:text-gray-900 hover:bg-gray-100 dark:text-zinc-500 dark:hover:text-zinc-200 dark:hover:bg-zinc-800/80 transition-all duration-200 ${isCollapsed ? "mx-auto bg-gray-50/50 dark:bg-zinc-900/50" : ""}`}>
            {isCollapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
          </button>
        </div>
        
        {!isCollapsed && (
          <button onClick={handleNewChat} disabled={isCreating} className="group relative flex items-center justify-center gap-2 px-3 py-2.5 text-sm font-semibold transition-all duration-300 rounded-xl bg-gray-900 text-white shadow-md hover:shadow-lg hover:-translate-y-0.5 hover:bg-gray-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white overflow-hidden">
            <div className="absolute inset-0 bg-white/20 dark:bg-black/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
            {isCreating ? <Loader2 size={16} className="animate-spin relative z-10" /> : <Plus size={18} className="relative z-10" />}
            <span className="truncate relative z-10">New Chat</span>
          </button>
        )}
      </div>

      {!isCollapsed && (
        <div className="px-4 pb-3 flex flex-col gap-3">
          {/* Search Bar */}
          <div className="group relative transition-all duration-300">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
            <input type="text" placeholder="Search chats..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full py-2.5 pl-10 pr-4 text-sm bg-gray-100/80 border-transparent rounded-xl focus:bg-white focus:border-blue-500/30 focus:ring-4 focus:ring-blue-500/10 dark:bg-zinc-900/80 dark:text-zinc-200 dark:focus:bg-zinc-950 dark:focus:border-blue-500/30 dark:focus:ring-blue-500/10 outline-none transition-all duration-300 placeholder:text-gray-400 font-medium shadow-inner" />
          </div>

          {/* Active Knowledge Base Title */}
          {activeKbName && (
            <div className="flex items-center gap-2 px-3 py-2 bg-blue-50/60 dark:bg-blue-900/10 border border-blue-100/50 dark:border-blue-800/30 rounded-lg animate-in fade-in slide-in-from-top-2 duration-300">
              <Database size={14} className="text-blue-600 dark:text-blue-400" />
              <div className="flex flex-col">
                <span className="text-[10px] font-bold tracking-widest uppercase text-blue-500/80 dark:text-blue-400/80">Active Context</span>
                <span className="text-xs font-semibold text-blue-700 dark:text-blue-300 truncate">{activeKbName}</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* CHAT LIST SECTION */}
      <div className="flex-1 overflow-y-auto px-3 pb-4 scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-zinc-800">
        {loading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="w-6 h-6 text-gray-300 dark:text-zinc-700 animate-spin" />
          </div>
        ) : (
          <div className="space-y-1 mt-2">
            {!isCollapsed && (
              <h3 className="px-3 py-2 mb-1 text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-zinc-500 sticky top-0 bg-white/90 dark:bg-zinc-950/90 backdrop-blur-sm z-10">
                Recent Chats
              </h3>
            )}

            {/* THE LOADING SKELETON */}
            {pendingChatId && !isCollapsed && (
              <div className="flex items-center h-11 px-3 rounded-xl bg-blue-50/50 border border-blue-100/50 dark:bg-blue-900/10 dark:border-blue-800/30">
                <Loader2 size={16} className="flex-shrink-0 mr-3 text-blue-500/60 animate-spin" />
                <Skeleton className="h-4 w-2/3 bg-blue-200/50 dark:bg-blue-800/30 rounded" />
              </div>
            )}

            {/* FLAT LIST */}
            {sortedFilteredChats.length === 0 && !pendingChatId ? (
              <div className="p-6 mt-4 text-sm text-center text-gray-400 dark:text-zinc-600 border border-dashed border-gray-200 dark:border-zinc-800 rounded-xl mx-2">
                {!isCollapsed && "No previous chats found."}
              </div>
            ) : (
              sortedFilteredChats.map((chat) => {
                const itemKbId = params.kb_id || chat.knowledge_bases?.[0]?.id?.toString() || 'default'
                return (
                  <ChatItem
                    key={chat.id}
                    chat={chat}
                    kbId={itemKbId}
                    isActive={activeChatId === String(chat.id)}
                    isCollapsed={isCollapsed}
                    onRename={handleRenameChat}
                    onDelete={handleDeleteChat}
                  />
                )
              })
            )}
          </div>
        )}
      </div>

      <div className="p-4 border-t border-gray-100 dark:border-zinc-800/80 bg-gray-50/30 dark:bg-zinc-950/30">
        <button onClick={handleLogout} className={`group flex w-full items-center text-gray-500 dark:text-zinc-400 rounded-xl py-2.5 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30 dark:hover:text-red-400 transition-all duration-200 ${isCollapsed ? "justify-center px-0" : "px-4 gap-3"}`}>
          <LogOut size={18} className="flex-shrink-0 transition-transform duration-300 group-hover:-translate-x-1" />
          {!isCollapsed && <span className="text-sm font-semibold">Sign out</span>}
        </button>
      </div>
    </aside>
  )
}

// ---------------- SUB-COMPONENT: CHAT ITEM ----------------
function ChatItem({ chat, kbId, isActive, isCollapsed, onRename, onDelete }: { 
  chat: Chat, kbId: string, isActive: boolean, isCollapsed: boolean, onRename: (id: number | string, title: string) => void, onDelete: (id: number | string) => void 
}) {
  const [isEditing, setIsEditing] = useState(false)
  const [editTitle, setEditTitle] = useState(chat.title)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isEditing && inputRef.current) inputRef.current.focus()
  }, [isEditing])

  const handleSave = () => {
    if (editTitle.trim() && editTitle !== chat.title) {
      onRename(chat.id, editTitle.trim())
    } else {
      setEditTitle(chat.title)
    }
    setIsEditing(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSave()
    if (e.key === 'Escape') {
      setEditTitle(chat.title)
      setIsEditing(false)
    }
  }

  // Initial letter avatar for collapsed state
  const firstLetter = chat.title ? chat.title.charAt(0).toUpperCase() : 'C';

  if (isCollapsed) {
    return (
      <Link href={`/chat/${kbId}/${chat.id}`} className={`flex items-center justify-center w-10 h-10 mx-auto mb-2 rounded-xl transition-all duration-300 ${isActive ? "bg-gray-900 text-white shadow-md dark:bg-white dark:text-zinc-900" : "text-gray-500 bg-gray-100 hover:bg-gray-200 hover:text-gray-900 dark:bg-zinc-900 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"}`} title={chat.title}>
        <span className="text-sm font-bold">{firstLetter}</span>
      </Link>
    )
  }

  return (
    <div className={`group relative flex items-center h-[2.6rem] px-3 text-sm rounded-xl transition-all duration-300 cursor-pointer overflow-hidden ${isActive ? "bg-white text-gray-900 font-semibold shadow-[0_2px_10px_rgba(0,0,0,0.04)] ring-1 ring-black/5 dark:bg-zinc-900 dark:text-white dark:ring-white/10 dark:shadow-none" : "text-gray-600 dark:text-zinc-400 hover:bg-gray-100/80 dark:hover:bg-zinc-900/50 hover:text-gray-900 dark:hover:text-zinc-200"}`}>
      
      {/* Active Indicator Line */}
      {isActive && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-1/2 bg-gray-900 dark:bg-white rounded-r-full" />
      )}

      <Link href={`/chat/${kbId}/${chat.id}`} className={`flex items-center flex-1 min-w-0 h-full overflow-hidden transition-transform duration-300 ${isActive ? "pl-1" : "group-hover:translate-x-1"}`}>
        {isEditing ? (
          <input ref={inputRef} value={editTitle} onChange={(e) => setEditTitle(e.target.value)} onKeyDown={handleKeyDown} onBlur={handleSave} onClick={(e) => e.preventDefault()} className="flex-1 w-full bg-transparent outline-none focus:outline-none focus:ring-0 border-none p-0 text-sm font-medium text-gray-900 dark:text-white placeholder-gray-400" />
        ) : (
          <span className="truncate pr-12">{chat.title}</span>
        )}
      </Link>

      {!isEditing && (
        <div className={`absolute right-2 flex items-center gap-1 pl-6 py-1 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0 ${isActive ? 'bg-gradient-to-l from-white via-white to-transparent dark:from-zinc-900 dark:via-zinc-900' : 'bg-gradient-to-l from-gray-100 via-gray-100 to-transparent dark:from-zinc-900 dark:via-zinc-900'}`}>
          <button onClick={(e) => { e.preventDefault(); setIsEditing(true) }} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:text-zinc-500 dark:hover:text-blue-400 dark:hover:bg-blue-900/30 transition-all duration-200 rounded-md" title="Rename"><SquarePen size={14} /></button>
          <button onClick={(e) => { e.preventDefault(); if(confirm('Are you sure you want to delete this chat?')) onDelete(chat.id) }} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:text-zinc-500 dark:hover:text-red-400 dark:hover:bg-red-900/30 transition-all duration-200 rounded-md" title="Delete chat"><Trash2 size={14} /></button>
        </div>
      )}
    </div>
  )
}