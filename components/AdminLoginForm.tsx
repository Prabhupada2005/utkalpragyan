"use client";

import { useState } from "react";
import Link from "next/link";
import { Lock, User, KeyRound, AlertCircle } from "lucide-react";
import { loginAdmin } from "@/app/admin/courses/actions";

export default function AdminLoginForm() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const result = await loginAdmin(formData);

    if (!result.success) {
      setError(result.error || "Login failed");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
        <div className="bg-teal-900 p-6 text-center text-white space-y-2">
          <div className="w-12 h-12 bg-teal-800 border border-teal-600 rounded-full flex items-center justify-center mx-auto">
            <Lock className="w-6 h-6 text-teal-300" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">
            Utkalpragyan Admin
          </h1>
          <p className="text-xs text-teal-200">
            Restricted Portal • Enter Admin Credentials to Continue
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-xs font-medium p-3 rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
              Admin User ID
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                name="userId"
                required
                placeholder="Enter Admin ID"
                className="w-full border border-slate-300 rounded-lg pl-9 pr-3 py-2.5 text-sm text-slate-900 focus:outline-teal-600"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
              Password
            </label>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="password"
                name="password"
                required
                placeholder="••••••••"
                className="w-full border border-slate-300 rounded-lg pl-9 pr-3 py-2.5 text-sm text-slate-900 focus:outline-teal-600"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-teal-700 hover:bg-teal-800 disabled:bg-slate-400 text-white font-bold py-2.5 rounded-lg text-sm transition shadow-sm"
          >
            {loading ? "Verifying Credentials..." : "Sign In to Admin Portal"}
          </button>

          <div className="text-center pt-2 border-t border-slate-100">
            <Link
              href="/"
              className="text-xs font-semibold text-slate-500 hover:text-slate-800"
            >
              ← Return to Public Website
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}