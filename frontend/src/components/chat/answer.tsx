"use client";

import React, { FC, useMemo, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
// Ensure you have highlight.js styles imported somewhere in your app!
// import 'highlight.js/styles/github-dark.css'; 
import { FileIcon } from "react-file-icon";
import { Check, Copy } from "lucide-react";

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";

// --- Types ---
interface Citation {
  id: number;
  text: string;
  metadata: Record<string, any>;
}

interface CitationInfo {
  knowledge_base: { name: string };
  document: { file_name: string };
}

// --- Helper Hook ---
const useDebouncedValue = <T,>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
};

// --- Copy Button Component ---
const CopyButton = ({ text }: { text: string }) => {
  const [isCopied, setIsCopied] = useState(false);

  const copy = async () => {
    await navigator.clipboard.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <button
      onClick={copy}
      className="flex items-center gap-1.5 text-zinc-400 hover:text-zinc-100 transition-colors bg-transparent border-none cursor-pointer"
      title="Copy code"
    >
      {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
      <span>{isCopied ? "Copied!" : "Copy code"}</span>
    </button>
  );
};

// --- Main Component ---
export const Answer: FC<{
  markdown: string;
  citations?: Citation[];
}> = ({ markdown, citations = [] }) => {
  const [citationInfoMap, setCitationInfoMap] = useState<Record<string, CitationInfo>>({});
  const debouncedCitations = useDebouncedValue(citations, 300);

  // Smoothly handle the "Thinking" state blocks
  const processedMarkdown = useMemo(() => {
    if (!markdown) return "";
    return markdown
      .replace(/<think>/g, ":::thought\n")
      .replace(/<\/think>/g, "\n:::");
  }, [markdown]);

  // Fetch Metadata for Citations
  useEffect(() => {
    const fetchCitationInfo = async () => {
      const infoMap: Record<string, CitationInfo> = { ...citationInfoMap };
      let updated = false;

      for (const citation of debouncedCitations) {
        const { kb_id, document_id } = citation.metadata;
        if (!kb_id || !document_id) continue;

        const key = `${kb_id}-${document_id}`;
        if (infoMap[key]) continue;

        try {
          const [kb, doc] = await Promise.all([
            api.get(`/api/knowledge-base/${kb_id}`),
            api.get(`/api/knowledge-base/${kb_id}/documents/${document_id}`),
          ]);

          infoMap[key] = {
            knowledge_base: { name: kb.name },
            document: { file_name: doc.file_name },
          };
          updated = true;
        } catch (error) {
          console.error("Failed to fetch citation info:", error);
        }
      }

      if (updated) setCitationInfoMap(infoMap);
    };

    if (debouncedCitations.length > 0) fetchCitationInfo();
  }, [debouncedCitations]);

  // Custom Citation Component
  const CitationLink = useMemo(() => (props: any) => {
    const citationId = props.href?.match(/^(\d+)$/)?.[1];
    const index = citationId ? parseInt(citationId) - 1 : -1;
    const citation = debouncedCitations.find(c => c.id.toString() === props.href.toString());
    if (!citation) return <span className="text-zinc-400">[{props.href}]</span>;

    const info = citationInfoMap[`${citation.metadata.kb_id}-${citation.metadata.document_id}`];

    return (
      <Popover>
        <PopoverTrigger asChild>
          <button className="inline-flex items-center justify-center mx-0.5 relative -top-1 h-4 w-4 text-[10px] font-bold rounded-full bg-blue-50 border border-blue-200 text-blue-600 hover:bg-blue-600 hover:text-white transition-colors">
            {props.href}
          </button>
        </PopoverTrigger>
        <PopoverContent side="top" align="start" className="w-80 p-0 overflow-hidden shadow-2xl border-zinc-200">
          <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="p-4 space-y-3">
            {info ? (
              <div className="flex items-center gap-3 bg-zinc-50 p-2 rounded-lg border border-zinc-100">
                <div className="w-8 h-8">
                   <FileIcon extension={info.document.file_name.split(".").pop() || ""} labelUppercase color="#fff" />
                </div>
                <div className="flex flex-col min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-tight text-zinc-400">Source Material</p>
                  <p className="text-xs font-semibold text-zinc-700 truncate">{info.document.file_name}</p>
                </div>
              </div>
            ) : (
              <Skeleton className="h-10 w-full" />
            )}
            <div className="text-sm text-zinc-600 leading-relaxed max-h-32 overflow-y-auto pr-1">
              <span className="font-serif italic">"{citation.text}"</span>
            </div>
            {citation.metadata.page && (
              <div className="text-[10px] font-medium text-zinc-400 uppercase">Page {citation.metadata.page}</div>
            )}
          </motion.div>
        </PopoverContent>
      </Popover>
    );
  }, [debouncedCitations, citationInfoMap]);

  if (!markdown) {
    return (
      <div className="space-y-3 max-w-2xl">
        <Skeleton className="h-4 w-[40%]" />
        <Skeleton className="h-4 w-[90%]" />
        <Skeleton className="h-4 w-[75%]" />
        <Skeleton className="h-4 w-[85%]" />
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }} 
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="prose prose-zinc prose-sm md:prose-base max-w-full leading-normal dark:prose-invert"
    >
      <Markdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
        components={{
          a: CitationLink,
          
          // Render standard paragraphs
          p: ({ children, node }: any) => {
            const content = node.children[0]?.value;
            if (content === ":::" || content === ":::thought") return null;
            return <p className="mb-4 last:mb-0">{children}</p>;
          },
          
          // Replace standard <pre> so we can handle block styling entirely in the <code> block
          pre: ({ children }: any) => <div className="not-prose my-6">{children}</div>,

          // Enhanced Code and Thought Blocks
          code: ({ inline, className, children, ...props }: any) => {
            const content = children?.toString() || "";

            // 1. Handle Custom "Thought" Block
            if (content.startsWith(":::thought")) {
              return (
                <div className="my-4 border-l-2 border-zinc-200 bg-zinc-50/50 py-3 pl-5 pr-4 rounded-r-xl italic text-zinc-500">
                   <div className="flex items-center gap-2 mb-2 not-italic font-semibold text-zinc-400 text-xs uppercase tracking-widest">
                     <span className="animate-pulse">●</span> Thinking Process
                   </div>
                   {content.replace(":::thought", "").replace(":::", "")}
                </div>
              );
            }

            // Extract language from className (e.g., "language-javascript")
            const match = /language-(\w+)/.exec(className || "");
            const language = match ? match[1] : "";

            // 2. Handle Multi-line Code Blocks
            if (!inline && match) {
              return (
                <div className="rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-[#0d1117] shadow-sm">
                  {/* Header Bar */}
                  <div className="flex items-center justify-between px-4 py-2 bg-[#161b22] border-b border-zinc-800 text-xs font-sans text-zinc-400 select-none">
                    <span className="lowercase">{language}</span>
                    <CopyButton text={content.replace(/\n$/, "")} />
                  </div>
                  {/* Code Content */}
                  <div className="p-4 overflow-x-auto text-[13px] leading-snug font-mono">
                    <code className={className} {...props}>
                      {children}
                    </code>
                  </div>
                </div>
              );
            }

            // 3. Handle Inline Code (e.g., `const x = 5`)
            return (
              <code 
                className="px-1.5 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-pink-600 dark:text-pink-400 font-mono text-[13px] before:content-none after:content-none" 
                {...props}
              >
                {children}
              </code>
            );
          }
        }}
      >
        {processedMarkdown}
      </Markdown>
    </motion.div>
  );
};