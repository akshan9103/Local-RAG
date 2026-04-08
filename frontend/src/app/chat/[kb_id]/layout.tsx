//path: frontend/src/app/chat/[kb_id]/layout.tsx
import ChatSidebar from "@/components/chat/ChatSidebar"; // Your combined sidebar component

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen overflow-hidden bg-white dark:bg-zinc-900">
      {/* 1. Global Toaster for errors/success messages */}

      {/* 2. The Sidebar stays fixed on the left */}
      <ChatSidebar />

      {/* 3. The main chat area changes based on the URL */}
      <main className="flex-1 flex flex-col min-w-0">
        {children}
      </main>
    </div>
  );
}