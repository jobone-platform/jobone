import { API_BASE_URL } from "../config/api";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import { Loader2, ShieldAlert, Lock, KeyRound } from "lucide-react";
import { useAuth } from "../routes/Context";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const { loginAdmin, authStatus, role } = useAuth();

  // If already logged in as admin, redirect to dashboard
  useEffect(() => {
    if (authStatus === "authenticated" && role === "admin") {
      navigate("/admin/dashboard", { replace: true });
    }
  }, [authStatus, role, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (loading) return;

    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail || !password) {
      setError("Please provide both admin email and password.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const { data } = await axios.post(
        `${API_BASE_URL}/admin/login`,
        {
          email: normalizedEmail,
          password,
        },
      );

      loginAdmin(data.token, data);
      const redirectPath = location.state?.from?.pathname;
      navigate(redirectPath || "/admin/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Invalid Admin Credentials (Check email and password case sensitivity)");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFill = () => {
    setEmail("admin@gmail.com");
    setPassword("Admin@123");
    setError("");
  };

  return (
    <div className="min-h-screen bg-slate-950 flex justify-center items-center p-4 py-12 font-sans relative overflow-y-auto">
      {/* Background styling for Admin area */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-rose-600/15 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-indigo-600/15 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="bg-slate-900/90 backdrop-blur-2xl border border-slate-800 p-8 sm:p-12 rounded-3xl w-full max-w-lg shadow-2xl relative z-10">
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-rose-500/15 text-rose-400 rounded-2xl flex items-center justify-center mx-auto mb-5 border border-rose-500/30 shadow-inner">
            <ShieldAlert size={42} />
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Admin Portal
          </h1>
          <p className="text-slate-400 text-base font-medium mt-2">
            Secure administrative console. Authorized personnel only.
          </p>
        </div>

        {error && (
          <div role="alert" className="bg-rose-500/15 border border-rose-500/50 text-rose-300 text-sm font-bold p-4 rounded-2xl mb-8 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-widest mb-2">
              Admin Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-4 bg-slate-800/80 border border-slate-700 rounded-2xl text-white outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-all text-base placeholder-slate-500 font-medium"
              placeholder="admin@gmail.com"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-widest mb-2">
              Master Password
            </label>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-4 pl-12 bg-slate-800/80 border border-slate-700 rounded-2xl text-white outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-all text-base placeholder-slate-500 font-medium"
                placeholder="••••••••"
              />
              <Lock
                size={20}
                className="absolute left-4 top-4.5 text-slate-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-rose-600 hover:bg-rose-700 text-white font-black text-base rounded-2xl transition-all shadow-xl shadow-rose-600/25 flex items-center justify-center gap-2 mt-4 disabled:opacity-70 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-rose-500 focus-visible:outline-none cursor-pointer"
          >
            {loading ? (
              <Loader2 size={22} className="animate-spin" />
            ) : (
              "Sign In to Dashboard"
            )}
          </button>
        </form>

        {/* Credentials Helper Box */}
        <div className="mt-8 pt-6 border-t border-slate-800 text-center">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Active Credentials
            </span>
            <button
              type="button"
              onClick={handleQuickFill}
              className="text-xs font-bold text-rose-400 hover:text-rose-300 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <KeyRound size={13} /> Auto-fill Default
            </button>
          </div>
          <div className="bg-slate-800/60 border border-slate-700/80 rounded-xl p-3 text-xs text-slate-300 flex flex-col sm:flex-row sm:justify-between items-center gap-1 font-mono">
            <span>admin@gmail.com</span>
            <span className="text-slate-500 hidden sm:inline">•</span>
            <span className="font-bold text-white">Admin@123</span>
          </div>
        </div>
      </div>
    </div>
  );
}
