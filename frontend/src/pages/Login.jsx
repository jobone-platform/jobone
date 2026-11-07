import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { Eye, EyeOff, User, Building2, Shield, Lock, Mail, ArrowRight } from "lucide-react";
import { API_BASE_URL } from "../config/api";
import { useAuth } from "../routes/Context";
import AuthLayout from "../components/AuthLayout";
import GoogleAuthButton, { AuthDivider } from "../components/GoogleAuthButton";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { loginUser, loginEmployer, authStatus, role } = useAuth();

  const resolveTab = () => {
    try {
      const params = new URLSearchParams(location.search);
      const queryTab = params.get("tab")?.toLowerCase();
      const stateTab = location.state?.tab?.toLowerCase();
      const candidateAliases = ["user", "candidate", "jobseeker"];
      const employerAliases = ["employer", "recruiter", "company"];

      if (employerAliases.includes(queryTab) || employerAliases.includes(stateTab)) {
        return "employer";
      }
      if (candidateAliases.includes(queryTab) || candidateAliases.includes(stateTab)) {
        return "user";
      }
    } catch (_err) {
      /* ignore */
    }
    return "user";
  };

  const [activeTab, setActiveTab] = useState(resolveTab);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const queryTab = params.get("tab")?.toLowerCase();
    const stateTab = location.state?.tab?.toLowerCase();
    const target = queryTab || stateTab;
    if (target) {
      if (["employer", "recruiter", "company"].includes(target)) {
        setActiveTab("employer");
      } else if (["user", "candidate", "jobseeker"].includes(target)) {
        setActiveTab("user");
      }
    }
  }, [location.search, location.state]);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(location.state?.error || "");
  const [loading, setLoading] = useState(false);

  // If already authenticated, redirect to role portal
  useEffect(() => {
    if (authStatus === "authenticated") {
      if (role === "employer") {
        navigate("/employerdashboard", { replace: true });
      } else if (role === "jobseeker") {
        navigate("/userdashboard", { replace: true });
      } else if (role === "admin") {
        navigate("/admin/dashboard", { replace: true });
      }
    }
  }, [authStatus, role, navigate]);

  useEffect(() => {
    const savedEmail =
      activeTab === "user"
        ? localStorage.getItem("lastJobseekerEmail")
        : localStorage.getItem("lastEmployerEmail");

    if (savedEmail) {
      setEmail(savedEmail);
    } else {
      setEmail("");
    }
    setPassword("");
  }, [activeTab]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail || !password) {
      setError("Please provide both email and password.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const endpoint =
        activeTab === "employer"
          ? `${API_BASE_URL}/employer/login`
          : `${API_BASE_URL}/user/login`;

      const { data } = await axios.post(endpoint, { email: normalizedEmail, password });
      const redirectPath = location.state?.from?.pathname;

      if (activeTab === "employer") {
        loginEmployer(data.token, data);
        localStorage.setItem("lastEmployerEmail", normalizedEmail);
        navigate(redirectPath || "/employerdashboard");
      } else {
        loginUser(data.token, data);
        localStorage.setItem("lastJobseekerEmail", normalizedEmail);
        navigate(redirectPath || "/userdashboard");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Welcome Back"
      subtitle={
        activeTab === "user"
          ? "Sign in to search verified positions and track applications"
          : "Sign in to manage active job requisitions and review candidate pools"
      }
      badge="Career Workspace Authentication"
      roleType={activeTab}
    >
      {/* Role Switcher Pill */}
      <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-[var(--theme-surface-elevated)] border border-[var(--theme-border)] mb-6">
        <button
          type="button"
          onClick={() => {
            setActiveTab("user");
            setError("");
          }}
          className={`flex items-center justify-center gap-2 py-2.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
            activeTab === "user"
              ? "bg-[var(--theme-surface)] text-[var(--theme-text)] shadow-sm border border-[var(--theme-border-silver)]"
              : "text-[var(--theme-text-muted)] hover:text-[var(--theme-text)]"
          }`}
        >
          <User className="w-3.5 h-3.5" />
          <span>Candidate</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab("employer");
            setError("");
          }}
          className={`flex items-center justify-center gap-2 py-2.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
            activeTab === "employer"
              ? "bg-[var(--theme-surface)] text-[var(--theme-text)] shadow-sm border border-[var(--theme-border-silver)]"
              : "text-[var(--theme-text-muted)] hover:text-[var(--theme-text)]"
          }`}
        >
          <Building2 className="w-3.5 h-3.5" />
          <span>Employer ATS</span>
        </button>
      </div>

      {/* Error Notice */}
      {error && (
        <div className="mb-5 p-3 rounded-xl bg-[var(--theme-danger-bg)] border border-[var(--theme-danger)]/30 text-xs text-rose-400 font-medium">
          {error}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-[var(--theme-text-muted)] uppercase tracking-wider mb-1.5">
            {activeTab === "employer" ? "Business Email Address" : "Email Address"}
          </label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--theme-text-subtle)]" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={activeTab === "employer" ? "recruiter@company.com" : "name@example.com"}
              className="w-full pl-10 pr-4 py-2.5 bg-[var(--theme-input-bg)] border border-[var(--theme-border)] text-[var(--theme-text)] placeholder-[var(--theme-input-placeholder)] text-xs sm:text-sm rounded-xl outline-none focus:border-[var(--theme-border-focus)] transition-colors"
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-semibold text-[var(--theme-text-muted)] uppercase tracking-wider">
              Password
            </label>
            <Link
              to="/forgot-password"
              className="text-xs text-[var(--theme-text-muted)] hover:text-[var(--theme-text)] hover:underline font-medium"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--theme-text-subtle)]" />
            <input
              type={showPassword ? "text" : "password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full pl-10 pr-10 py-2.5 bg-[var(--theme-input-bg)] border border-[var(--theme-border)] text-[var(--theme-text)] placeholder-[var(--theme-input-placeholder)] text-xs sm:text-sm rounded-xl outline-none focus:border-[var(--theme-border-focus)] transition-colors"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--theme-text-subtle)] hover:text-[var(--theme-text)] cursor-pointer"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-xl bg-[var(--theme-surface-elevated)] hover:bg-[var(--theme-surface-hover)] border border-[var(--theme-border-silver)] text-[var(--theme-text)] font-bold text-xs sm:text-sm tracking-wide transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 hover:scale-[1.01] active:scale-[0.99]"
        >
          {loading ? (
            <span>Signing in...</span>
          ) : (
            <>
              <span>Sign In to {activeTab === "employer" ? "ATS Console" : "Workspace"}</span>
              <ArrowRight className="w-4 h-4 text-[var(--theme-accent-silver)]" />
            </>
          )}
        </button>
      </form>

      {/* Divider */}
      <AuthDivider text="or continue with" />

      {/* Google Authentication Component */}
      <div className="mb-6">
        <GoogleAuthButton
          role={activeTab === "employer" ? "employer" : "candidate"}
          mode="login"
          onError={setError}
        />
      </div>

      {/* Sign Up Redirect */}
      <div className="text-center text-xs text-[var(--theme-text-muted)] space-y-3">
        <p>
          Don't have an account yet?{" "}
          <Link
            to={activeTab === "employer" ? "/employerregisteroption" : "/userregister"}
            className="text-[var(--theme-text)] font-bold hover:underline"
          >
            Create an account
          </Link>
        </p>

        {/* Admin Portal Shortcut */}
        <div className="pt-3 border-t border-[var(--theme-border)]">
          <Link
            to="/admin/login"
            className="inline-flex items-center gap-1.5 text-[11px] text-[var(--theme-text-subtle)] hover:text-[var(--theme-text)] font-medium"
          >
            <Shield className="w-3.5 h-3.5 text-amber-500/80" />
            <span>Administrator Security Console</span>
          </Link>
        </div>
      </div>
    </AuthLayout>
  );
}
