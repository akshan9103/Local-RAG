"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import {  LogOut } from "lucide-react";
import { api } from "@/lib/api";


export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
    }
  }, [router]);

const handleLogout = async () => {
  await api.post("/api/auth/logout"); // This asks the server to delete the cookie
  localStorage.removeItem("token");
  router.push("/login");
};


  return (
    <div className="min-h-screen bg-background">
     


        <div className="flex h-full flex-col">
          {/* Sidebar header */}
          <div className="flex h-16 items-center border-b pl-8">
            <Link
              href="/dashboard"
              className="flex items-center text-lg font-semibold hover:text-primary transition-colors"
            >
              <img
                src="/logo_v2.png"
                alt="Logo"
                className="w-16 h-16 rounded-lg"
              />
              LocalRAG.
            </Link>
          </div>

          {/* User profile and logout */}
          <div className="border-t p-4 space-y-4">
            <button
              onClick={handleLogout}
              className="flex w-full items-center rounded-lg px-3 py-2.5 text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors duration-200"
            >
              <LogOut className="mr-3 h-4 w-4" />
              Sign out
            </button>
          </div>
        </div>
    </div>
  );
};


