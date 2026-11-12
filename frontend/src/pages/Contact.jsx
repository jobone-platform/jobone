import React, { useState } from "react";
import axios from "axios";
import { API_BASE_URL } from "../config/api";

import {
  Mail,
  Phone,
  MapPin,
  Clock,
  Send,
  MessageSquare,
  Sparkles,
  Building2,
  Users,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ChevronDown,
  HelpCircle,
  ArrowRight,
  ShieldCheck,
  Headphones,
  Check,
  Copy,
} from "lucide-react";
import {
  FaLinkedinIn,
  FaWhatsapp,
  FaInstagram,
  FaTwitter,
  FaYoutube,
  FaGithub,
} from "react-icons/fa";

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    communicationType: "inquiry",
    subject: "",
    message: "",
  });
  const [status, setStatus] = useState(null); // null | "sending" | "success" | "error"
  const [errorMessage, setErrorMessage] = useState("");
  const [activeFaq, setActiveFaq] = useState(0);
  const [copiedEmail, setCopiedEmail] = useState(false);

  const COMMUNICATION_TYPES = [
    { id: "inquiry", label: "General Inquiry" },
    { id: "employer", label: "Employer / Enterprise Hiring", serverType: "inquiry" },
    { id: "candidate", label: "Candidate Assistance", serverType: "inquiry" },
    { id: "feedback", label: "Product Feedback & Ideas", serverType: "feedback" },
    { id: "complaint", label: "Security & Report", serverType: "complaint" },
  ];

  const QUICK_SUBJECTS = [
    "Requisition Verification",
    "Candidate Dossier Query",
    "Enterprise Hiring Integration",
    "Technical Bug Report",
    "Billing & Invoicing",
  ];

  const SOCIAL_CHANNELS = [
    {
      name: "LinkedIn",
      icon: FaLinkedinIn,
      handle: "JobOne Professional Network",
      url: "https://www.linkedin.com/company/simtraksolutions/",
      badge: "Enterprise Network",
      description:
        "Official company announcements, verified hiring drives, executive opportunities, and employment market intelligence.",
    },
    {
      name: "WhatsApp Community",
      icon: FaWhatsapp,
      handle: "JobOne Alerts Channel",
      url: "https://whatsapp.com/channel/jobone",
      badge: "Realtime Alerts",
      description:
        "Curated daily notifications for critical technical openings and verified recruiter communications.",
    },
    {
      name: "Instagram",
      icon: FaInstagram,
      handle: "@jobone.official",
      url: "https://instagram.com/jobone.official",
      badge: "Engineering Culture",
      description:
        "Engineering leadership interviews, career advancement guides, and tech industry insights.",
    },
    {
      name: "Twitter / X",
      icon: FaTwitter,
      handle: "@JobOne_India",
      url: "https://twitter.com/jobone_india",
      badge: "Live Telemetry",
      description:
        "Real-time announcements, engineering recruitment threads, and direct platform status dispatches.",
    },
    {
      name: "YouTube Academy",
      icon: FaYoutube,
      handle: "JobOne Career Insights",
      url: "https://youtube.com/@jobone_careers",
      badge: "Masterclasses",
      description:
        "System design prep, technical resume breakdowns, and executive interview walkthroughs.",
    },
    {
      name: "GitHub Open Tech",
      icon: FaGithub,
      handle: "jobone-technologies",
      url: "https://github.com/jobone",
      badge: "Developer Hub",
      description:
        "Developer APIs, design system tokens, and open recruitment architecture specifications.",
    },
  ];

  const FAQS = [
    {
      q: "What is the typical response SLA for JobOne support?",
      a: "Our priority support operations desk responds within 2 business hours between Monday and Saturday (9:00 AM – 7:00 PM IST). Inquiries submitted outside these hours are prioritized on the next business morning.",
    },
    {
      q: "Is JobOne free for jobseekers and candidates?",
      a: "Yes. JobOne is 100% free for candidates. You can browse verified positions, submit direct applications, track application stages, and interact with hiring managers with complete transparency and zero hidden fees.",
    },
    {
      q: "How are hiring organizations and recruiters verified on JobOne?",
      a: "Organizations submit verified corporate email domains, company registration records, and regulatory credentials. Our administrative moderation team validates each profile before requisitions become visible.",
    },
    {
      q: "Can my company request an enterprise talent consultation?",
      a: "Yes. Select 'Employer / Enterprise Hiring' in the contact form or email our corporate partnerships desk directly at hiring@jobone.in to coordinate with an enterprise talent specialist.",
    },
    {
      q: "How does JobOne protect candidate data and prevent spam?",
      a: "JobOne operates under SOC 2 Type II and strict privacy guidelines. We do not sell or broker candidate contact details to third-party headhunters or marketing networks.",
    },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (status === "sending") return;
    setStatus("sending");
    setErrorMessage("");

    try {
      const selectedTypeObj = COMMUNICATION_TYPES.find(
        (t) => t.id === formData.communicationType
      );
      const serverType = selectedTypeObj?.serverType || "inquiry";

      await axios.post(`${API_BASE_URL}/contact`, {
        name: formData.name,
        email: formData.email,
        communicationType: serverType,
        subject: formData.subject,
        message: formData.message,
      });

      setStatus("success");
      setFormData({
        name: "",
        email: "",
        communicationType: "inquiry",
        subject: "",
        message: "",
      });
    } catch (err) {
      setStatus("error");
      setErrorMessage(
        err.response?.data?.message ||
          "Failed to deliver your inquiry. Please check your information and try again."
      );
    }
  };

  const copyEmailToClipboard = (email) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(email);
      setCopiedEmail(true);
      setTimeout(() => setCopiedEmail(false), 2500);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground font-sans transition-colors pt-24 pb-24">
      {/* ─── 1. EDITORIAL HERO BANNER ───────────────────────────────────────── */}
      <section className="relative pb-12 sm:pb-16 text-center overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-2 border border-border text-[11px] font-mono text-silver mb-4">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span>DIRECT INQUIRY DESK • RESPONSE &lt; 2 HRS</span>
          </div>

          <h1 className="text-3xl sm:text-5xl md:text-6xl font-display font-bold tracking-tight text-foreground max-w-4xl mx-auto leading-tight">
            Connect With JobOne Operations.
          </h1>

          <p className="text-sm sm:text-base text-foreground/70 mt-3 max-w-2xl mx-auto leading-relaxed">
            Whether you are scaling your engineering organization, evaluating enterprise recruitment solutions, or requesting candidate support, we are here to assist.
          </p>
        </div>
      </section>

      {/* ─── 2. QUICK CONTACT CHANNELS STRIP (4 BENTO CARDS) ────────────── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mb-12 w-full">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Candidate Support */}
          <div className="p-5 rounded-2xl bg-surface-1 border border-border flex flex-col justify-between hover:border-silver/40 transition-colors">
            <div>
              <div className="w-10 h-10 rounded-xl bg-surface-2 border border-border flex items-center justify-center text-foreground mb-3">
                <Users size={18} />
              </div>
              <h3 className="text-sm font-display font-bold text-foreground">
                Candidate Support
              </h3>
              <p className="text-xs text-foreground/60 mt-1 leading-relaxed">
                Application tracking, credential verification, and account assistance.
              </p>
            </div>
            <a
              href="mailto:support@jobone.in"
              className="mt-4 pt-3 border-t border-border text-xs font-mono font-semibold text-silver hover:underline flex items-center gap-1.5"
            >
              <span>support@jobone.in</span>
              <ArrowRight size={12} />
            </a>
          </div>

          {/* Card 2: Employer Inquiries */}
          <div className="p-5 rounded-2xl bg-surface-1 border border-border flex flex-col justify-between hover:border-silver/40 transition-colors">
            <div>
              <div className="w-10 h-10 rounded-xl bg-surface-2 border border-border flex items-center justify-center text-foreground mb-3">
                <Building2 size={18} />
              </div>
              <h3 className="text-sm font-display font-bold text-foreground">
                Enterprise Sourcing
              </h3>
              <p className="text-xs text-foreground/60 mt-1 leading-relaxed">
                Talent acquisition packages, company verification, and custom hiring SLAs.
              </p>
            </div>
            <a
              href="mailto:hiring@jobone.in"
              className="mt-4 pt-3 border-t border-border text-xs font-mono font-semibold text-silver hover:underline flex items-center gap-1.5"
            >
              <span>hiring@jobone.in</span>
              <ArrowRight size={12} />
            </a>
          </div>

          {/* Card 3: Instant WhatsApp */}
          <div className="p-5 rounded-2xl bg-surface-1 border border-border flex flex-col justify-between hover:border-silver/40 transition-colors">
            <div>
              <div className="w-10 h-10 rounded-xl bg-surface-2 border border-border flex items-center justify-center text-foreground mb-3">
                <FaWhatsapp size={18} />
              </div>
              <h3 className="text-sm font-display font-bold text-foreground">
                Conversational Helpline
              </h3>
              <p className="text-xs text-foreground/60 mt-1 leading-relaxed">
                Rapid communication desk for urgent recruitment coordination.
              </p>
            </div>
            <a
              href="https://wa.me/919876543210"
              target="_blank"
              rel="noreferrer"
              className="mt-4 pt-3 border-t border-border text-xs font-mono font-semibold text-silver hover:underline flex items-center gap-1.5"
            >
              <span>+91 98765 43210</span>
              <ExternalLink size={12} />
            </a>
          </div>

          {/* Card 4: Headquarters */}
          <div className="p-5 rounded-2xl bg-surface-1 border border-border flex flex-col justify-between hover:border-silver/40 transition-colors">
            <div>
              <div className="w-10 h-10 rounded-xl bg-surface-2 border border-border flex items-center justify-center text-foreground mb-3">
                <MapPin size={18} />
              </div>
              <h3 className="text-sm font-display font-bold text-foreground">
                Corporate Operations
              </h3>
              <p className="text-xs text-foreground/60 mt-1 leading-relaxed">
                Simtrak Tower, Tech District, Powai, Mumbai, MH 400076, India.
              </p>
            </div>
            <a
              href="https://maps.google.com/?q=Powai+Mumbai"
              target="_blank"
              rel="noreferrer"
              className="mt-4 pt-3 border-t border-border text-xs font-mono font-semibold text-silver hover:underline flex items-center gap-1.5"
            >
              <span>View On Map</span>
              <ExternalLink size={12} />
            </a>
          </div>
        </div>
      </section>

      {/* ─── 3. FORM & SOCIAL ECOSYSTEM ────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mb-16 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT: INQUIRY FORM */}
          <div className="lg:col-span-7 p-6 sm:p-8 rounded-3xl bg-surface-1 border border-border shadow-xl">
            <div className="flex items-center justify-between pb-4 mb-6 border-b border-border">
              <div>
                <h2 className="text-xl font-display font-bold text-foreground">
                  Dispatch an Inquiry
                </h2>
                <p className="text-xs text-foreground/60 mt-0.5">
                  Our operations specialists will review and route your request.
                </p>
              </div>
              <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-2 text-foreground/70 text-[11px] font-mono">
                <Clock size={12} className="text-silver" />
                <span>Mon–Sat • 9am–7pm</span>
              </div>
            </div>

            {status === "success" ? (
              <div className="text-center py-12 px-4 space-y-4">
                <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto shadow-sm">
                  <CheckCircle2 size={32} />
                </div>
                <h3 className="text-xl font-display font-bold text-foreground">
                  Inquiry Ticket Dispatched
                </h3>
                <p className="text-xs text-foreground/70 max-w-sm mx-auto leading-relaxed">
                  Thank you for contacting JobOne Operations. Your dossier has been logged into our response queue. A representative will contact you via email.
                </p>
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => setStatus(null)}
                    className="px-5 py-2.5 rounded-xl bg-foreground text-background font-semibold text-xs tracking-wide hover:opacity-90 transition cursor-pointer"
                  >
                    Submit Another Inquiry
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Topic Selector */}
                <div>
                  <label className="text-[11px] font-mono uppercase tracking-wider text-foreground/60 mb-2 block">
                    Inquiry Classification
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {COMMUNICATION_TYPES.map((type) => (
                      <button
                        key={type.id}
                        type="button"
                        onClick={() =>
                          setFormData({ ...formData, communicationType: type.id })
                        }
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer border ${
                          formData.communicationType === type.id
                            ? "bg-foreground text-background border-foreground shadow-sm"
                            : "bg-surface-2 text-foreground/70 border-border hover:border-silver/40"
                        }`}
                      >
                        {type.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Name & Email */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-mono uppercase tracking-wider text-foreground/60 mb-1.5 block">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Adarsh Sharma"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-surface-2 border border-border text-xs sm:text-sm text-foreground placeholder-foreground/30 focus:outline-none focus:border-silver/60 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-mono uppercase tracking-wider text-foreground/60 mb-1.5 block">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="e.g. adarsh@example.com"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-surface-2 border border-border text-xs sm:text-sm text-foreground placeholder-foreground/30 focus:outline-none focus:border-silver/60 transition-colors"
                    />
                  </div>
                </div>

                {/* Subject & Quick Tags */}
                <div>
                  <label className="text-[11px] font-mono uppercase tracking-wider text-foreground/60 mb-1.5 block">
                    Subject Line *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    placeholder="Brief summary of your inquiry..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-surface-2 border border-border text-xs sm:text-sm text-foreground placeholder-foreground/30 focus:outline-none focus:border-silver/60 transition-colors mb-2"
                  />
                  <div className="flex flex-wrap gap-1">
                    {QUICK_SUBJECTS.map((sub) => (
                      <button
                        key={sub}
                        type="button"
                        onClick={() => setFormData({ ...formData, subject: sub })}
                        className="text-[10px] font-mono px-2 py-0.5 rounded bg-surface-2 border border-border text-foreground/60 hover:text-foreground hover:border-silver/40 transition-colors cursor-pointer"
                      >
                        + {sub}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Message */}
                <div>
                  <label className="text-[11px] font-mono uppercase tracking-wider text-foreground/60 mb-1.5 block">
                    Inquiry Details *
                  </label>
                  <textarea
                    required
                    rows={5}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Provide relevant requisition identifiers, organization details, or questions..."
                    className="w-full p-3.5 rounded-xl bg-surface-2 border border-border text-xs sm:text-sm text-foreground placeholder-foreground/30 focus:outline-none focus:border-silver/60 transition-colors resize-none leading-relaxed"
                  />
                </div>

                {status === "error" && errorMessage && (
                  <div role="alert" className="p-3 rounded-xl border border-rose-500/20 bg-rose-500/10 text-rose-300 text-xs flex items-center gap-2">
                    <AlertCircle size={15} className="shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={status === "sending"}
                  className="w-full py-3.5 rounded-xl bg-foreground text-background font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 hover:opacity-90 active:scale-[0.99] transition shadow-md disabled:opacity-50 cursor-pointer"
                >
                  <Send size={15} />
                  <span>{status === "sending" ? "Dispatching..." : "Transmit Inquiry"}</span>
                </button>
              </form>
            )}
          </div>

          {/* RIGHT: SOCIAL ECOSYSTEM & DIRECT EMAIL */}
          <div className="lg:col-span-5 space-y-6">
            <div className="p-6 rounded-3xl bg-surface-1 border border-border shadow-xl">
              <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-border">
                <h3 className="text-sm font-display font-bold text-foreground">
                  Official Channels
                </h3>
                <span className="text-[10px] font-mono uppercase text-silver">
                  Verified Ecosystem
                </span>
              </div>

              <div className="space-y-2.5">
                {SOCIAL_CHANNELS.map((channel) => {
                  const Icon = channel.icon;
                  return (
                    <a
                      key={channel.name}
                      href={channel.url}
                      target="_blank"
                      rel="noreferrer"
                      className="p-3 rounded-xl bg-surface-2 border border-border hover:border-silver/50 transition-all flex items-start gap-3 group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-surface-1 border border-border flex items-center justify-center text-foreground shrink-0 group-hover:scale-105 transition-transform">
                        <Icon size={14} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1 mb-0.5">
                          <h4 className="text-xs font-semibold text-foreground group-hover:text-silver transition-colors truncate">
                            {channel.name}
                          </h4>
                          <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-surface-1 border border-border text-foreground/50">
                            {channel.badge}
                          </span>
                        </div>
                        <p className="text-[11px] text-foreground/50 line-clamp-1">
                          {channel.description}
                        </p>
                      </div>
                      <ExternalLink size={12} className="text-foreground/30 group-hover:text-foreground shrink-0 mt-0.5" />
                    </a>
                  );
                })}
              </div>
            </div>

            {/* Direct Copy Desk */}
            <div className="p-6 rounded-3xl bg-foreground text-background shadow-xl">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono uppercase tracking-widest text-background/60">
                  Priority Contact Desk
                </span>
                <Headphones size={16} />
              </div>

              <h4 className="text-base font-display font-bold mb-1">
                Direct Operations Email
              </h4>
              <p className="text-xs text-background/70 mb-4 leading-relaxed">
                For urgent enterprise requisitions or escalated platform issues.
              </p>

              <div className="p-2.5 rounded-xl bg-background/10 border border-background/20 flex items-center justify-between gap-2">
                <span className="text-xs font-mono font-semibold truncate">support@jobone.in</span>
                <button
                  type="button"
                  onClick={() => copyEmailToClipboard("support@jobone.in")}
                  className="px-2.5 py-1 rounded-lg bg-background text-foreground text-xs font-semibold hover:opacity-90 transition flex items-center gap-1 shrink-0 cursor-pointer"
                >
                  {copiedEmail ? <Check size={12} /> : <Copy size={12} />}
                  <span>{copiedEmail ? "Copied" : "Copy"}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 4. FAQS ACCORDION ───────────────────────────────────────────── */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="text-center mb-8">
          <span className="text-[11px] font-mono uppercase tracking-widest text-silver mb-1 block">
            Knowledge Base
          </span>
          <h2 className="text-2xl font-display font-bold text-foreground">
            Frequently Addressed Questions
          </h2>
        </div>

        <div className="space-y-2.5">
          {FAQS.map((faq, idx) => {
            const isOpen = activeFaq === idx;
            return (
              <div
                key={idx}
                className="rounded-2xl bg-surface-1 border border-border overflow-hidden transition-colors"
              >
                <button
                  type="button"
                  onClick={() => setActiveFaq(isOpen ? -1 : idx)}
                  className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 cursor-pointer"
                >
                  <span className="text-xs sm:text-sm font-semibold text-foreground">
                    {faq.q}
                  </span>
                  <ChevronDown
                    size={16}
                    className={`text-foreground/50 transition-transform duration-200 shrink-0 ${
                      isOpen ? "rotate-180 text-foreground" : ""
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-4 sm:px-5 pb-5 pt-1 text-xs text-foreground/70 leading-relaxed border-t border-border/60">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
