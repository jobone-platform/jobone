import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useLocation, Link } from "react-router-dom";
import {
  Loader2,
  Shield,
  ShieldAlert,
  Lock,
  Mail,
  ArrowLeft,
  User,
  Building2,
  CheckCircle2,
  X,
  KeyRound,
  Terminal,
} from "lucide-react";
import { API_BASE_URL } from "../config/api";
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

  // If already authenticated as admin, redirect to dashboard
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
      setError("Please provide both administrator email and access token.");
      return;
    }

    setLoading(true);
    setError("");
    setLoggedOutNotice(false);

    try {
      const { data } = await axios.post(`${API_BASE_URL}/admin/login`, {
        email: normalizedEmail,
        password,
      });

      loginAdmin(data.token, data);
      const redirectPath = location.state?.from?.pathname;
      navigate(redirectPath || "/admin/dashboard");
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Invalid Administrator Credentials. Please check access permissions."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-dark text-slate-100 flex flex-col justify-center items-center p-4 sm:p-8 relative selection:bg-silver/30 selection:text-white">
      {/* Return to general portal */}
      <Link
        to="/login"
        className="fixed top-4 left-4 sm:top-6 sm:left-6 z-50 flex items-center gap-2 px-3.5 py-2 rounded-full bg-surface-dark border border-white/10 text-xs font-mono text-slate-400 hover:text-white hover:border-silver/40 transition-all backdrop-blur-md shadow-lg group"
      >
        <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
        <span className="hidden sm:inline">Candidate & Employer Portal</span>
        <span className="sm:hidden">Public Portal</span>
      </Link>

      {/* Background Architectural Mesh & Subtle Lighting */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-white/[0.02] rounded-full blur-3xl" />
        <div className="absolute inset-0 [background-image:linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-40" />
      </div>

      <div className="w-full max-w-md relative z-10 my-auto">
        {/* Security badge and telemetry */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[11px] font-mono text-silver mb-4">
            <Shield size={12} className="text-silver" />
            <span>SECURE GATEWAY • CONSOLE ACCESS</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-display font-bold tracking-tight text-white mb-2">
            Administrator Terminal
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-xs mx-auto">
            Restricted access. Internal platform governance and audit controls.
          </p>
        </div>

        {/* Console Box */}
        <div className="bg-surface-dark/90 backdrop-blur-xl border border-white/10 rounded-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-silver/50 to-transparent" />

          {/* Flash Logout Alert */}
          {loggedOutNotice && (
            <div
              role="status"
              className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-mono p-3 rounded-xl mb-5 flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <CheckCircle2 size={15} className="shrink-0" />
                <span>Console session safely terminated.</span>
              </div>
              <button
                type="button"
                onClick={() => setLoggedOutNotice(false)}
                className="text-emerald-400/70 hover:text-emerald-200 cursor-pointer"
              >
                <X size={14} />
              </button>
            </div>
          )}

          {/* Error Alert */}
          {error && (
            <div
              role="alert"
              className="bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-mono p-3.5 rounded-xl mb-5 text-center"
            >
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-[11px] font-mono tracking-wider uppercase text-slate-400 mb-1.5">
                Admin Identifier / Email
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@jobone.io"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-black/60 border border-white/10 text-white placeholder-slate-500 text-sm font-mono focus:outline-none focus:border-silver/80 transition-colors"
                />
                <Mail size={16} className="absolute left-3.5 top-3.5 text-slate-500 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-mono tracking-wider uppercase text-slate-400 mb-1.5">
                Master Security Key
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-black/60 border border-white/10 text-white placeholder-slate-500 text-sm font-mono focus:outline-none focus:border-silver/80 transition-colors"
                />
                <Lock size={16} className="absolute left-3.5 top-3.5 text-slate-500 pointer-events-none" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-3 py-3.5 rounded-xl bg-white text-black font-semibold text-sm flex items-center justify-center gap-2 hover:bg-silver transition-all shadow-md active:scale-[0.99] disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Authenticating Console...</span>
                </>
              ) : (
                <>
                  <KeyRound size={16} />
                  <span>Authenticate Session</span>
                </>
              )}
            </button>
          </form>

          {/* Quick links to user portals */}
          <div className="mt-6 pt-5 border-t border-white/10">
            <p className="text-[11px] font-mono text-center text-slate-500 uppercase tracking-wider mb-3">
              Standard User Portals
            </p>
            <div className="grid grid-cols-2 gap-2">
              <Link
                to="/login?tab=user"
                className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 text-xs text-slate-300 transition-colors"
              >
                <User size={13} className="text-silver" />
                <span>Candidate</span>
              </Link>
              <Link
                to="/login?tab=employer"
                className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 text-xs text-slate-300 transition-colors"
              >
                <Building2 size={13} className="text-silver" />
                <span>Employer</span>
              </Link>
            </div>
          </div>
        </div>

        <div className="text-center mt-6 text-[11px] font-mono text-slate-500">
          <span>JobOne Governance v2.4 • SOC 2 Protected</span>
        </div>
      </div>
    </div>
  );
}
