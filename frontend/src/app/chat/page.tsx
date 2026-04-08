//path: frontend/src/app/chat/page.tsx
"use client";

import { Bot, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function KnowledgeBaseDefaultPage() {
  const router = useRouter();

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-white to-neutral-100">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-white shadow-2xl rounded-3xl p-10 max-w-md w-full text-center border border-neutral-200"
      >
        {/* Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring" }}
          className="flex justify-center mb-6"
        >
          <div className="p-4 rounded-full bg-black text-white shadow-md">
            <Bot size={40} />
          </div>
        </motion.div>

        {/* Title */}
        <h2 className="text-2xl font-bold text-black">
          Select Your Knowledge Base
        </h2>

        {/* Description */}
        <p className="mt-3 text-sm text-neutral-600 leading-relaxed">
          Choose a knowledge base to begin your conversation.
        </p>

        {/* Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => router.push(`/knowledge-bases`)}
          className="mt-6 w-full bg-black text-white py-3 rounded-xl font-medium shadow-lg hover:bg-neutral-800 transition-all flex items-center justify-center gap-2"
        >
          select knowledge base 
          <ArrowRight size={16} />
        </motion.button>

        {/* Footer Hint */}
        <p className="mt-4 text-xs text-neutral-500">
          No knowledge base selected yet
        </p>
      </motion.div>
    </div>
  );
}
