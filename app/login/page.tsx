"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { loginStudent, registerStudent } from "@/app/auth/actions";
import { User, Mail, Phone, Lock, AlertCircle, BookOpen } from "lucide-react";

export default function StudentLoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const result =
      mode === "login"
        ? await loginStudent(formData)
        : await registerStudent(formData);

    if (!result.success) {
      setError(result.error || "Authentication failed");
      setLoading(false);
    } else {
      router.push("/");
      router.refresh();
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center px-4 py-12">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
        {/* Top Banner */}
        <div className="bg-teal-900 p-6 text-center text-white space-y-2">
          <div className="w-12 h-12 bg-teal-800 border border-teal-600 rounded-full flex items-center justify-center mx-auto">
            <BookOpen className="w-6 h-6 text-teal-300" />
          </div>
          <h1 className="text-2xl font-black tracking-tight">Utkalpragyan</h1>
          <p className="text-xs text-teal-200">
            Student Learning Portal • UPSC & State PSC Geology
          </p>
        </div>

        {/* Mode Switch Tabs */}
        <div className="grid grid-cols-2 border-b border-slate-200 bg-slate-100 p-1 m-6 mb-0 rounded-xl">
          <button
            type="button"
            onClick={() => {
              setMode("login");
              setError(null);
            }}
            className={`py-2 text-xs font-bold rounded-lg transition ${
              mode === "login"
                ? "bg-white text-teal-900 shadow-sm"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            Student Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("register");
              setError(null);
            }}
            className={`py-2 text-xs font-bold rounded-lg transition ${
              mode === "register"
                ? "bg-white text-teal-900 shadow-sm"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            New Registration
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-xs font-medium p-3 rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          {mode === "register" ? (
            <>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 uppercase">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    name="name"
                    required
                    placeholder="Enter your full name"
                    className="w-full border border-slate-300 rounded-lg pl-9 pr-3 py-2.5 text-sm"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 uppercase">
                  Email ID
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    name="email"
                    required
                    placeholder="student@example.com"
                    className="w-full border border-slate-300 rounded-lg pl-9 pr-3 py-2.5 text-sm"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 uppercase">
                  Mobile Number (10 Digits)
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="tel"
                    name="phone"
                    required
                    placeholder="9876543210"
                    className="w-full border border-slate-300 rounded-lg pl-9 pr-3 py-2.5 text-sm"
                  />
                </div>
              </div>
            </>
          ) : (
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 uppercase">
                Email ID or Mobile Number
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  name="identifier"
                  required
                  placeholder="Enter Email or 10-digit Mobile"
                  className="w-full border border-slate-300 rounded-lg pl-9 pr-3 py-2.5 text-sm"
                />
              </div>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 uppercase">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="password"
                name="password"
                required
                placeholder="••••••••"
                className="w-full border border-slate-300 rounded-lg pl-9 pr-3 py-2.5 text-sm"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-teal-700 hover:bg-teal-800 disabled:bg-slate-400 text-white font-bold py-3 rounded-lg text-sm transition shadow-sm"
          >
            {loading
              ? "Please wait..."
              : mode === "login"
              ? "Sign In to Learning Portal"
              : "Create Student Account"}
          </button>

          <div className="text-center pt-3 border-t border-slate-100">
            <Link
              href="/"
              className="text-xs font-semibold text-slate-500 hover:text-slate-800"
            >
              ← Back to Homepage
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}