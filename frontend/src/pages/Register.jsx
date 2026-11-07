import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { User, Building2, Mail, ArrowRight } from "lucide-react";
import AuthLayout from "../components/AuthLayout";
import GoogleAuthButton, { AuthDivider } from "../components/GoogleAuthButton";

export default function Register() {
  const navigate = useNavigate();
  const [error, setError] = useState("");

  return (
    <AuthLayout
      title="Create Your Account"
      subtitle="Join verified professionals and enterprise recruiters on JobOne"
      badge="Candidate Registration Gateway"
      roleType="candidate"
    >
      {/* Role Selection Tabs */}
      <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-[var(--theme-surface-elevated)] border border-[var(--theme-border)] mb-6">
        <button
          type="button"
          className="flex items-center justify-center gap-2 py-2.5 text-xs font-bold rounded-lg bg-[var(--theme-surface)] text-[var(--theme-text)] border border-[var(--theme-border-silver)] shadow-sm"
        >
          <User className="w-3.5 h-3.5" />
          <span>I'm a Candidate</span>
        </button>

        <button
          type="button"
          onClick={() => navigate("/employerregisteroption")}
          className="flex items-center justify-center gap-2 py-2.5 text-xs font-bold rounded-lg text-[var(--theme-text-muted)] hover:text-[var(--theme-text)] transition-colors cursor-pointer"
        >
          <Building2 className="w-3.5 h-3.5" />
          <span>I'm an Employer</span>
        </button>
      </div>

      {error && (
        <div className="mb-5 p-3 rounded-xl bg-[var(--theme-danger-bg)] border border-[var(--theme-danger)]/30 text-xs text-rose-400 font-medium">
          {error}
        </div>
      )}

      {/* Primary Email Signup CTA */}
      <button
        type="button"
        onClick={() => navigate("/userregister")}
        className="w-full py-3 rounded-xl bg-[var(--theme-surface-elevated)] hover:bg-[var(--theme-surface-hover)] border border-[var(--theme-border-silver)] text-[var(--theme-text)] font-bold text-xs sm:text-sm tracking-wide transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.005] active:scale-[0.99]"
      >
        <Mail className="w-4 h-4 text-[var(--theme-accent-silver)]" />
        <span>Continue with Email & Password</span>
        <ArrowRight className="w-4 h-4 text-[var(--theme-accent-silver)]" />
      </button>

      {/* Divider */}
      <AuthDivider text="or continue with" />

      {/* Google Quick Registration */}
      <div className="mb-6">
        <GoogleAuthButton
          role="candidate"
          mode="register"
          onError={setError}
        />
      </div>

      {/* Terms Notice */}
      <p className="text-[11px] text-[var(--theme-text-subtle)] text-center mt-5 leading-relaxed">
        By registering, you agree to our{" "}
        <Link to="/contact?subject=terms" className="text-[var(--theme-text)] hover:underline font-medium">
          Terms of Service
        </Link>{" "}
        and{" "}
        <Link to="/contact?subject=privacy" className="text-[var(--theme-text)] hover:underline font-medium">
          Privacy Policy
        </Link>.
      </p>

      {/* Sign In Link */}
      <div className="text-center text-xs text-[var(--theme-text-muted)] mt-6 pt-5 border-t border-[var(--theme-border)]">
        Already have an account?{" "}
        <Link to="/login" className="text-[var(--theme-text)] font-bold hover:underline">
          Sign In here
        </Link>
      </div>
    </AuthLayout>
  );
}
