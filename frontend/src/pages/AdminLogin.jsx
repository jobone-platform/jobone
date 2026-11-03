import { API_BASE_URL } from "../config/api";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useLocation, Link } from "react-router-dom";
import {
  Loader2,
  ShieldAlert,
  Lock,
  ArrowLeft,
  User,
  Building2,
  CheckCircle2,
  X,
} from "lucide-react";
import { useAuth } from "../routes/Context";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const { loginAdmin, authStatus, role } = useAuth();

  const [loggedOutNotice, setLoggedOutNotice] = useState(
    Boolean(location.state?.loggedOut)
  );

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
    setLoggedOutNotice(false);

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
      setError(
        err.response?.data?.message ||
          "Invalid Admin Credentials (Check email and password case sensitivity)"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-3 sm:p-6 py-10 sm:py-12 font-sans relative overflow-y-auto">
      {/* Floating Return Button to Candidate & Employer Portal */}
      <Link
        to="/login"
        className="fixed top-3 left-3 sm:top-6 sm:left-6 z-50 flex items-center gap-1.5 sm:gap-2 bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/80 rounded-full px-3 py-2 sm:px-4 sm:py-2.5 text-xs sm:text-sm font-bold transition-all backdrop-blur-md shadow-xl group cursor-pointer"
      >
        <ArrowLeft
          size={16}
          className="transition-transform group-hover:-translate-x-1 text-slate-400 group-hover:text-white"
        />
        <span className="hidden sm:inline">Candidate & Employer Portal</span>
        <span className="sm:hidden">User Portal</span>
      </Link>

      {/* Ambient background glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-rose-600/15 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-indigo-600/15 rounded-full blur-[120px] pointer-events-none" />

      <div className="bg-slate-900/90 backdrop-blur-2xl border border-slate-800 p-6 sm:p-10 md:p-12 rounded-3xl w-full max-w-lg shadow-2xl relative z-10 my-auto mt-14 sm:mt-auto">
        {/* Header Branding */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-rose-500/15 text-rose-400 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-rose-500/30 shadow-inner">
            <ShieldAlert size={42} />
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Admin Portal
          </h1>
          <p className="text-slate-400 text-sm sm:text-base font-medium mt-1.5">
            Secure administrative console. Authorized personnel only.
          </p>
        </div>

        {/* Successful Logout Flash Banner */}
        {loggedOutNotice && (
          <div
            role="status"
            className="bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs sm:text-sm font-bold p-3.5 sm:p-4 rounded-2xl mb-6 text-center flex items-center justify-between gap-2 shadow-sm animate-in fade-in slide-in-from-top-2"
          >
            <div className="flex items-center gap-2 text-left">
              <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
              <span>You have been safely signed out of the Admin Console.</span>
            </div>
            <button
              type="button"
              onClick={() => setLoggedOutNotice(false)}
              className="text-emerald-400/80 hover:text-emerald-200 p-1 cursor-pointer"
            >
              <X size={14} />
            </button>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div
            role="alert"
            className="bg-rose-500/15 border border-rose-500/50 text-rose-300 text-sm font-bold p-4 rounded-2xl mb-6 text-center"
          >
            {error}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-5">
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
            className="w-full py-4 bg-rose-600 hover:bg-rose-700 text-white font-black text-base rounded-2xl transition-all shadow-xl shadow-rose-600/25 flex items-center justify-center gap-2 mt-2 disabled:opacity-70 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-rose-500 focus-visible:outline-none cursor-pointer"
          >
            {loading ? (
              <Loader2 size={22} className="animate-spin" />
            ) : (
              "Sign In to Dashboard"
            )}
          </button>
        </form>

        {/* Switcher to Candidate & Employer Login */}
        <div className="mt-8 pt-6 border-t border-slate-800/80">
          <div className="text-center mb-4">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Not an Administrator?
            </p>
            <p className="text-xs text-slate-500 mt-0.5">
              Access candidate job search or employer recruitment dashboards
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => navigate("/login?tab=user", { state: { tab: "user" } })}
              className="flex items-center justify-center gap-2.5 py-3.5 px-4 rounded-2xl bg-blue-600/15 hover:bg-blue-600/25 border border-blue-500/30 text-blue-300 hover:text-white font-bold text-xs sm:text-sm transition-all shadow-sm hover:scale-[1.02] active:scale-[0.98] cursor-pointer group"
            >
              <User
                size={16}
                className="text-blue-400 group-hover:scale-110 transition-transform"
              />
              <span>Candidate Login</span>
            </button>

            <button
              type="button"
              onClick={() => navigate("/login?tab=employer", { state: { tab: "employer" } })}
              className="flex items-center justify-center gap-2.5 py-3.5 px-4 rounded-2xl bg-indigo-600/15 hover:bg-indigo-600/25 border border-indigo-500/30 text-indigo-300 hover:text-white font-bold text-xs sm:text-sm transition-all shadow-sm hover:scale-[1.02] active:scale-[0.98] cursor-pointer group"
            >
              <Building2
                size={16}
                className="text-indigo-400 group-hover:scale-110 transition-transform"
              />
              <span>Employer Login</span>
            </button>
          </div>

          <div className="mt-4 text-center">
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors font-medium hover:underline cursor-pointer"
            >
              <span>Return to General Login & Registration</span>
              <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
