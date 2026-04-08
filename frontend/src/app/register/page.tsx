"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api, ApiError } from "@/lib/api";
import { Loader2 } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setValidationErrors((prev) => ({
        ...prev,
        email: "Please enter a valid email address",
      }));
      return false;
    }
    setValidationErrors((prev) => ({ ...prev, email: "" }));
    return true;
  };

  const validatePassword = (password: string) => {
    if (password.length < 8) {
      setValidationErrors((prev) => ({
        ...prev,
        password: "Password must be at least 8 characters long",
      }));
      return false;
    }
    if (!/[A-Z]/.test(password)) {
      setValidationErrors((prev) => ({
        ...prev,
        password: "Password must contain at least one uppercase letter",
      }));
      return false;
    }
    if (!/[a-z]/.test(password)) {
      setValidationErrors((prev) => ({
        ...prev,
        password: "Password must contain at least one lowercase letter",
      }));
      return false;
    }
    if (!/[0-9]/.test(password)) {
      setValidationErrors((prev) => ({
        ...prev,
        password: "Password must contain at least one number",
      }));
      return false;
    }
    setValidationErrors((prev) => ({ ...prev, password: "" }));
    return true;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setValidationErrors({ email: "", password: "", confirmPassword: "" });

    const formData = new FormData(e.currentTarget);
    const username = formData.get("username") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    // Validate email and password
    const isEmailValid = validateEmail(email);
    const isPasswordValid = validatePassword(password);

    if (password !== confirmPassword) {
      setValidationErrors((prev) => ({
        ...prev,
        confirmPassword: "Passwords do not match",
      }));
      return;
    }

    if (!isEmailValid || !isPasswordValid) {
      return;
    }

    setLoading(true);

    try {
      await api.post("/api/auth/register", {
        username,
        email,
        password,
      });

      router.push("/login");
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Registration failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Helper for input classes to keep the JSX clean
  const getInputClasses = (hasError: boolean) => {
    const baseClasses = "block w-full px-3 py-2 bg-slate-50/50 rounded-md text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 transition-all disabled:opacity-50 border";
    const normalClasses = "border-slate-300 focus:ring-blue-500/20 focus:border-blue-500";
    const errorClasses = "border-red-300 focus:ring-red-500/20 focus:border-red-500";
    
    return `${baseClasses} ${hasError ? errorClasses : normalClasses}`;
  };

  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center px-4 sm:px-6 lg:px-8 selection:bg-blue-100 selection:text-blue-900 pt-16 pb-12">
      <div className="w-full max-w-md">
        
        {/* Main Registration Card */}
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-8 space-y-6">
          
          {/* Header */}
          <div className="text-center space-y-1.5">
            <h1 className="text-2xl font-semibold text-slate-800 tracking-tight">
              System Registration
            </h1>
            <p className="text-sm text-slate-500 font-light">
              Provision a new account for the LocalRAG interface.
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
                  className={getInputClasses(false)}
                  placeholder="Enter your username"
                />
              </div>

              {/* Email Input */}
              <div className="space-y-1.5">
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-slate-700"
                >
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  disabled={loading}
                  className={getInputClasses(!!validationErrors.email)}
                  placeholder="Enter your academic email"
                  onChange={(e) => validateEmail(e.target.value)}
                />
                {validationErrors.email && (
                  <p className="text-xs text-red-600 font-medium">
                    {validationErrors.email}
                  </p>
                )}
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
                  className={getInputClasses(!!validationErrors.password)}
                  placeholder="Create a secure password"
                  onChange={(e) => validatePassword(e.target.value)}
                />
                {validationErrors.password && (
                  <p className="text-xs text-red-600 font-medium">
                    {validationErrors.password}
                  </p>
                )}
              </div>

              {/* Confirm Password Input */}
              <div className="space-y-1.5">
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-slate-700"
                >
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  disabled={loading}
                  className={getInputClasses(!!validationErrors.confirmPassword)}
                  placeholder="Confirm your password"
                />
                {validationErrors.confirmPassword && (
                  <p className="text-xs text-red-600 font-medium">
                    {validationErrors.confirmPassword}
                  </p>
                )}
              </div>
            </div>

            {/* General API Error Message */}
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
                  Registering...
                </>
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          {/* Footer Link */}
          <div className="text-center pt-2">
            <Link
              href="/login"
              className="text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors"
            >
              Already have an account? <span className="underline underline-offset-2">Sign in</span>
            </Link>
          </div>
          
        </div>
      </div>
    </main>
  );
}

