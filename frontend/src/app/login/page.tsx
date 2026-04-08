"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api, ApiError } from "@/lib/api";
import { Loader2 } from "lucide-react";

interface LoginResponse {
  access_token: string;
  token_type: string;
}

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const username = formData.get("username");
    const password = formData.get("password");

try {
  const formUrlEncoded = new URLSearchParams();
  formUrlEncoded.append("username", username as string);
  formUrlEncoded.append("password", password as string);

  // The request to FastAPI
  const response = await api.post("/api/auth/token", formUrlEncoded, {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
  });

  // 1. Destructure the role from the JSON response
  const { access_token, token_type, role} = response;
   


  // 2. Keep this for your API utility (if it uses Bearer headers)
  localStorage.setItem("token", access_token);

  // 3. Navigate based on role
  // Your FastAPI has already set the 'token' cookie in the browser
  if (role === 'admin') {
    router.push("/dashboard");
  } else {
    router.push("/knowledge-bases");
  }

} catch (err) {
  if (err instanceof ApiError) {
    setError(err.message);
  } else {
    setError("Login failed. Please check your credentials.");
  }
} finally {
  setLoading(false);
}
  };
  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center px-4 sm:px-6 lg:px-8 selection:bg-blue-100 selection:text-blue-900 pt-16">
      <div className="w-full max-w-md">
        
        {/* Main Login Card */}
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-8 space-y-6">
          
          {/* Header */}
          <div className="text-center space-y-1.5">
            <h1 className="text-2xl font-semibold text-slate-800 tracking-tight">
              System Access
            </h1>
            <p className="text-sm text-slate-500 font-light">
              Sign in to access the LocalRAG interface.
            </p>
          </div>

          {/* Form */}
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="space-y-4">
              
              {/* Username Input */}
              <div className="space-y-1.5">
                <label
                  htmlFor="username"
                  className="block text-sm font-medium text-slate-700"
                >
                  Username
                </label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  disabled={loading}
                  className="block w-full px-3 py-2 bg-slate-50/50 border border-slate-300 rounded-md text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all disabled:opacity-50"
                  placeholder="Enter your username"
                />
              </div>

              {/* Password Input */}
              <div className="space-y-1.5">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-slate-700"
                >
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  disabled={loading}
                  className="block w-full px-3 py-2 bg-slate-50/50 border border-slate-300 rounded-md text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all disabled:opacity-50"
                  placeholder="Enter your password"
                />
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 rounded-md bg-red-50 border border-red-100 text-red-600 text-sm flex items-center">
                {error}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center gap-2 py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-white rounded-md font-medium text-sm transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Authenticating...
                </>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          {/* Footer Link */}
          <div className="text-center pt-2">
            <Link
              href="/register"
              className="text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors"
            >
              Need an account? <span className="underline underline-offset-2">Register here</span>
            </Link>
          </div>
          
        </div>
      </div>
    </main>
  );
}