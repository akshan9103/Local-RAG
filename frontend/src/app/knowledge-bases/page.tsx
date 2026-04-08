"use client";

import { api, ApiError } from "@/lib/api"; 
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { 
  Folder, 
  FileText, 
  Calendar, 
  CheckCircle2, 
  AlertCircle, 
  Search,
  Loader2,
  ArrowRight,
  LogOut,
  Database,
  Layers
} from "lucide-react";

// --- Types ---
interface ProcessingTask {
  id: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  error_message: string | null;
}

interface Document {
  id: number;
  file_name: string;
  content_type: string;
  processing_tasks: ProcessingTask[];
}

interface KnowledgeBase {
  id: number;
  name: string;
  description: string;
  created_at: string;
  documents: Document[];
}

export default function KnowledgeBasePage() {
  const [knowledgeBases, setKnowledgeBases] = useState<KnowledgeBase[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  
  const { toast } = useToast();
  const router = useRouter();

  // Helper to format date cleanly
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
    });
  };

  useEffect(() => {
    fetchKnowledgeBases();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchKnowledgeBases = async () => {
    try {
      const data = await api.get("/api/knowledge-base");
      setKnowledgeBases(data);
    } catch (error) {
      if (error instanceof ApiError) {
        toast({
          title: "System Error",
          description: error.message,
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const filteredKBs = knowledgeBases.filter((kb) =>
    kb.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const handleLogout = async () => {
    try {
      await api.post("/api/auth/logout"); 
      localStorage.removeItem("token");
      router.push("/login");
    } catch (error) {
      toast({
        title: "Logout failed",
        description: "There was a problem logging out. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFC] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-100/80 via-slate-50 to-slate-100 p-6 md:p-10 selection:bg-indigo-100 selection:text-indigo-900">
      
      {/* Header Section */}
      <div className="max-w-6xl mx-auto mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6 animate-in fade-in slide-in-from-top-4 duration-700">
        <div className="space-y-1">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 bg-indigo-50 rounded-xl">
              <Database className="w-5 h-5 text-indigo-600" />
            </div>
            <span className="text-sm font-semibold tracking-wider text-indigo-600 uppercase">Workspace</span>
          </div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600 tracking-tight">
            Knowledge Bases
          </h1>
          <p className="text-slate-500 font-medium">
            Select your knowledge base for retrieval-augmented generation.
          </p>
        </div>
        
        {/* --- Logout Button --- */}
        <button
          onClick={handleLogout}
          className="group relative inline-flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 text-slate-700 text-sm font-medium rounded-xl hover:bg-slate-50 hover:text-rose-600 hover:border-rose-100 transition-all duration-300 shadow-sm hover:shadow overflow-hidden"
        >
          <div className="absolute inset-0 bg-rose-50/50 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
          <LogOut size={16} className="relative z-10 transition-transform group-hover:-translate-x-0.5" />
          <span className="relative z-10">Logout</span>
        </button>
      </div>

      {/* Toolbar */}
      <div className="max-w-6xl mx-auto mb-10 animate-in fade-in duration-700 delay-150 fill-mode-backwards">
        <div className="relative max-w-md group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors duration-300 group-focus-within:text-indigo-500 text-slate-400">
            <Search size={18} />
          </div>
          <input
            type="text"
            placeholder="Search collections..."
            className="w-full pl-11 pr-4 py-3.5 bg-white border border-slate-200 rounded-2xl text-sm text-slate-900 placeholder-slate-400 shadow-sm focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-400 transition-all duration-300 font-medium"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto pb-20">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-72 bg-white/60 animate-pulse rounded-2xl border border-slate-200 shadow-sm" />
            ))}
          </div>
        ) : filteredKBs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredKBs.map((kb, index) => (
              <div
                key={kb.id}
                className="group relative bg-white border border-slate-200/80 rounded-2xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:-translate-y-1 hover:border-indigo-200 transition-all duration-400 ease-out overflow-hidden flex flex-col animate-in fade-in slide-in-from-bottom-4 fill-mode-backwards"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Accent Top Border */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                {/* Card Header */}
                <div className="p-6 border-b border-slate-50 flex flex-col items-start">
                  <div className="w-full flex items-start justify-between mb-4">
                    <div className="p-3 bg-slate-50 text-slate-500 rounded-xl group-hover:text-indigo-600 transition-colors duration-300 border border-slate-100 group-hover:bg-indigo-50 group-hover:border-indigo-100">
                      <Layers size={22} className="transition-transform duration-300 group-hover:scale-110" />
                    </div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase bg-slate-50 px-2.5 py-1 rounded-full tracking-wider border border-slate-100 shadow-sm">
                      ID: {kb.id}
                    </span>
                  </div>
                  <h3 className="font-bold text-lg text-slate-800 truncate w-full tracking-tight group-hover:text-indigo-950 transition-colors">
                    {kb.name}
                  </h3>
                  <p className="mt-1.5 text-sm text-slate-500 line-clamp-2 h-10 font-medium leading-relaxed">
                    {kb.description || "No system description provided."}
                  </p>
                </div>

                {/* Card Body - Documents */}
                <div className="p-6 flex-grow bg-slate-50/30">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                      <Folder size={12} />
                      Indexed Files
                    </h4>
                    <span className="text-xs font-bold text-slate-600 bg-white shadow-sm border border-slate-100 px-2 py-0.5 rounded-md">
                      {kb.documents.length}
                    </span>
                  </div>
                  
                  <div className="space-y-2">
                    {kb.documents.length > 0 ? (
                      kb.documents.slice(0, 3).map((doc) => {
                        const status = doc.processing_tasks[0]?.status || 'pending';
                        return (
                          <div key={doc.id} className="flex items-center justify-between text-sm p-2.5 bg-white border border-slate-100 rounded-xl hover:border-slate-300 transition-colors shadow-sm">
                            <div className="flex items-center gap-3 truncate pr-4">
                              <div className={`p-1.5 rounded-lg shrink-0 ${
                                status === 'completed' ? 'bg-emerald-50 text-emerald-500' : 
                                status === 'failed' ? 'bg-rose-50 text-rose-500' : 
                                'bg-blue-50 text-blue-500'
                              }`}>
                                <FileText size={14} />
                              </div>
                              <span className="truncate text-slate-700 font-medium text-xs">
                                {doc.file_name}
                              </span>
                            </div>
                            {status === 'completed' ? (
                              <CheckCircle2 size={16} className="text-emerald-500 shrink-0 drop-shadow-sm" title="Completed" />
                            ) : status === 'failed' ? (
                              <AlertCircle size={16} className="text-rose-500 shrink-0 drop-shadow-sm" title="Failed" />
                            ) : (
                              <Loader2 size={16} className="text-blue-500 animate-spin shrink-0" title="Processing" />
                            )}
                          </div>
                        );
                      })
                    ) : (
                      <div className="flex flex-col items-center justify-center py-4 text-slate-400">
                        <div className="w-8 h-8 rounded-full border border-dashed border-slate-300 flex items-center justify-center mb-2">
                          <FileText size={12} className="text-slate-300" />
                        </div>
                        <p className="text-xs font-medium">No documents yet.</p>
                      </div>
                    )}
                    {kb.documents.length > 3 && (
                      <p className="text-[11px] text-slate-500 font-semibold pl-1 pt-1 text-center">
                        + {kb.documents.length - 3} more
                      </p>
                    )}
                  </div>
                </div>

                {/* Card Footer */}
                <div className="px-6 py-4 bg-white border-t border-slate-100 flex justify-between items-center mt-auto">
                  <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
                    <Calendar size={14} />
                    <span>{formatDate(kb.created_at)}</span>
                  </div>
                  
                  <button 
                    onClick={() => router.push(`/chat/${kb.id}`)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 text-white text-xs font-bold rounded-lg hover:bg-indigo-600 transition-all duration-300 group/btn shadow-md hover:shadow-lg hover:shadow-indigo-500/20"
                  >
                    Open Chat
                    <ArrowRight size={14} className="group-hover/btn:translate-x-1 transition-transform duration-300" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-32 bg-white/60 backdrop-blur-sm rounded-3xl border border-slate-200 border-dashed shadow-sm animate-in fade-in duration-700">
            <div className="p-6 bg-slate-50 rounded-full text-slate-400 mb-6 border border-slate-100 shadow-inner">
              <Database size={40} className="text-slate-300" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 tracking-tight">No collections found</h3>
            <p className="text-slate-500 font-medium mt-2">Adjust your search parameters or provision a new knowledge base.</p>
          </div>
        )}
      </div>
    </div>
  );
}