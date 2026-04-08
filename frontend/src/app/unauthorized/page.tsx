"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ShieldAlert, ArrowLeft, Home } from "lucide-react";

export default function Unauthorized() {
  const router = useRouter();
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    // Run a visible countdown interval instead of a silent timeout
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          router.push("/");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [router]);

  return (
    <main className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 selection:bg-blue-100 selection:text-blue-900">
      <div className="max-w-md w-full text-center space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        {/* Icon & Heading */}
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 bg-red-50 border border-red-100 rounded-full flex items-center justify-center text-red-600 shadow-sm">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-semibold text-slate-800 tracking-tight">
              Access Denied
            </h1>
            <p className="text-slate-500 font-light text-base">
              You do not have the required permissions to view this segment of the system.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            onClick={() =>
              window.history.length > 1 ? router.back() : router.push("/")
            }
            className="w-full sm:w-auto px-6 py-2.5 bg-white border border-slate-300 hover:bg-slate-50 hover:border-slate-400 text-slate-700 rounded-md font-medium text-sm transition-all shadow-sm flex items-center justify-center gap-2 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            Return Previous
          </button>

          <button
            onClick={() => router.push("/")}
            className="w-full sm:w-auto px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-md font-medium text-sm transition-all shadow-sm flex items-center justify-center gap-2 group"
          >
            <Home className="w-4 h-4 text-slate-300 group-hover:text-white transition-colors" />
            System Home
          </button>
        </div>

        {/* Redirect Notice */}
        <div className="pt-8">
          <p className="text-sm text-slate-400 font-medium">
            Redirecting to home in <span className="text-slate-600">{countdown}</span> seconds...
          </p>
        </div>

      </div>
    </main>
  );
}