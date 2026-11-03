import React, { useState } from "react";
import axios from "axios";
import { API_BASE_URL } from "../config/api";
import Footer from "../components/Footer";
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
  FaFacebookF,
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
    { id: "employer", label: "Employer / Hiring", serverType: "inquiry" },
    { id: "candidate", label: "Candidate Help", serverType: "inquiry" },
    { id: "feedback", label: "Feedback & Ideas", serverType: "feedback" },
    { id: "complaint", label: "Report an Issue", serverType: "complaint" },
  ];

  const QUICK_SUBJECTS = [
    "Application Status",
    "Company Verification",
    "Recruiter Partnership",
    "Technical Bug Report",
    "Billing & Invoice",
  ];

  const SOCIAL_CHANNELS = [
    {
      name: "LinkedIn",
      icon: FaLinkedinIn,
      handle: "JobOne Professional Network",
      url: "https://www.linkedin.com/company/simtraksolutions/",
      color: "from-blue-600 to-blue-700",
      accent: "text-blue-600 dark:text-blue-400",
      badge: "50K+ Network",
      description:
        "Official company updates, verified hiring drives, executive opportunities, and employment market trends.",
    },
    {
      name: "WhatsApp Community",
      icon: FaWhatsapp,
      handle: "JobOne Alerts Channel",
      url: "https://whatsapp.com/channel/jobone",
      color: "from-emerald-500 to-green-600",
      accent: "text-emerald-600 dark:text-emerald-400",
      badge: "Instant Alerts",
      description:
        "Daily curated job notifications, interview walk-in notices, and direct recruiter contact alerts straight to your phone.",
    },
    {
      name: "Instagram",
      icon: FaInstagram,
      handle: "@jobone.official",
      url: "https://instagram.com/jobone.official",
      color: "from-pink-500 via-rose-500 to-purple-600",
      accent: "text-rose-500",
      badge: "35K+ Community",
      description:
        "Behind-the-scenes startup culture, salary negotiation masterclasses, tech resume breakdowns, and hiring stories.",
    },
    {
      name: "Twitter / X",
      icon: FaTwitter,
      handle: "@JobOne_India",
      url: "https://twitter.com/jobone_india",
      color: "from-sky-500 to-blue-600",
      accent: "text-sky-500",
      badge: "Realtime",
      description:
        "Real-time announcements, engineering recruitment threads, tech AMA sessions, and direct community engagement.",
    },
    {
      name: "YouTube Academy",
      icon: FaYoutube,
      handle: "JobOne Career Insights",
      url: "https://youtube.com/@jobone_careers",
      color: "from-red-600 to-rose-700",
      accent: "text-red-600 dark:text-red-400",
      badge: "Masterclasses",
      description:
        "Free coding interview prep, technical resume masterclasses, HR mock interviews, and career transition guides.",
    },
    {
      name: "GitHub Open Tech",
      icon: FaGithub,
      handle: "jobone-technologies",
      url: "https://github.com/jobone",
      color: "from-slate-800 to-slate-950",
      accent: "text-slate-900 dark:text-white",
      badge: "Developer Hub",
      description:
        "Open-source developer APIs, SDKs, design system tokens, and open career engineering infrastructure.",
    },
  ];

  const FAQS = [
    {
      q: "How fast does the JobOne support team typically respond?",
      a: "Our core support team responds within 2 business hours between Monday and Saturday (9:00 AM – 7:00 PM IST). Inquiries submitted outside these hours are prioritized on the next business morning.",
    },
    {
      q: "Is JobOne free for jobseekers and candidates?",
      a: "Yes! JobOne is 100% free for candidates. You can browse verified positions, submit direct applications, track application stages, and interact with hiring managers without any hidden fees.",
    },
    {
      q: "How do employers and recruiters get verified on JobOne?",
      a: "Companies submit company registration credentials, corporate emails, and GST/CIN verification during onboarding. Our administrative moderation team verifies each employer manually before live listings are approved.",
    },
    {
      q: "Can I schedule an enterprise demo or bulk hiring partnership?",
      a: "Absolutely. Select 'Employer / Hiring' in the contact form or email us directly at hiring@jobone.in to book a 1-on-1 walkthrough with an enterprise talent specialist.",
    },
    {
      q: "What should I do if I spot a suspicious or inaccurate posting?",
      a: "JobOne enforces zero-tolerance for fraudulent postings. Select 'Report an Issue' above with the Job ID or company name, or click the Report button on any job card. Our moderation team reviews reported items within 30 minutes.",
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
          "Failed to deliver your message. Please check your information and try again."
      );
    }
  };

  const copyEmailToClipboard = (email) => {
    navigator.clipboard.writeText(email);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2500);
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#f8fafc] dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans selection:bg-blue-600 selection:text-white transition-colors duration-150">
      
      {/* ─── 1. MODERN HERO BANNER ───────────────────────────────────────── */}
      <section className="relative pt-28 sm:pt-36 pb-14 sm:pb-20 overflow-hidden bg-gradient-to-b from-blue-50/70 via-indigo-50/30 to-transparent dark:from-slate-900/80 dark:via-slate-950 dark:to-slate-950 border-b border-slate-200/70 dark:border-slate-800/80">
        <div className="absolute top-10 left-1/3 w-96 h-96 bg-blue-500/10 dark:bg-blue-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-20 right-1/4 w-80 h-80 bg-indigo-500/10 dark:bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          {/* Support Indicator Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs text-xs font-bold text-slate-700 dark:text-slate-300 mb-4">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span>24/7 Dedicated Care & Assistance</span>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <span className="text-blue-600 dark:text-blue-400">Avg. Response &lt; 2 Hrs</span>
          </div>

          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-slate-900 dark:text-white tracking-tight leading-tight max-w-4xl mx-auto">
            Get in Touch With the <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 dark:from-blue-400 dark:to-indigo-300">JobOne Team</span>
          </h1>

          <p className="text-sm sm:text-lg text-slate-600 dark:text-slate-300 mt-4 max-w-2xl mx-auto font-medium leading-relaxed">
            Whether you're a candidate seeking your next career milestone, an employer scaling your engineering team, or a partner exploring collaboration, we're here to help.
          </p>
        </div>
      </section>

      {/* ─── 2. QUICK CONTACT CHANNELS STRIP (4 BENTO CARDS) ────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 sm:-mt-10 relative z-20 w-full">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Card 1: Jobseeker Help */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-lg hover:border-blue-300 dark:hover:border-blue-700 transition-all flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/70 border border-blue-200/60 dark:border-blue-800/60 flex items-center justify-center text-blue-600 dark:text-blue-400 mb-4 shadow-2xs">
                <Users size={22} />
              </div>
              <h3 className="text-base font-black text-slate-900 dark:text-white">
                Candidate Support
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                Application queries, resume uploads, verification assistance, and career profile guidance.
              </p>
            </div>
            <a
              href="mailto:support@jobone.in"
              className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1.5"
            >
              <span>support@jobone.in</span>
              <ArrowRight size={13} />
            </a>
          </div>

          {/* Card 2: Employer Inquiries */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-lg hover:border-indigo-300 dark:hover:border-indigo-700 transition-all flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/70 border border-indigo-200/60 dark:border-indigo-800/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-4 shadow-2xs">
                <Building2 size={22} />
              </div>
              <h3 className="text-base font-black text-slate-900 dark:text-white">
                Employer & Hiring
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                Talent acquisition packages, company verification, API integrations, and custom hiring plans.
              </p>
            </div>
            <a
              href="mailto:hiring@jobone.in"
              className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1.5"
            >
              <span>hiring@jobone.in</span>
              <ArrowRight size={13} />
            </a>
          </div>

          {/* Card 3: Instant WhatsApp & Phone */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-lg hover:border-emerald-300 dark:hover:border-emerald-700 transition-all flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-200/60 dark:border-emerald-800/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-4 shadow-2xs">
                <FaWhatsapp size={22} />
              </div>
              <h3 className="text-base font-black text-slate-900 dark:text-white">
                Helpline & WhatsApp
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                Instant conversational chat support for urgent hiring drives and candidate onboarding.
              </p>
            </div>
            <a
              href="https://wa.me/919876543210"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1.5"
            >
              <span>+91 98765 43210</span>
              <ExternalLink size={13} />
            </a>
          </div>

          {/* Card 4: Headquarters Location */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-lg hover:border-amber-300 dark:hover:border-amber-700 transition-all flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/70 border border-amber-200/60 dark:border-amber-800/60 flex items-center justify-center text-amber-600 dark:text-amber-400 mb-4 shadow-2xs">
                <MapPin size={22} />
              </div>
              <h3 className="text-base font-black text-slate-900 dark:text-white">
                JobOne Headquarters
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                Level 5, Simtrak Tower, Tech Park, Powai, Mumbai, MH 400076, India.
              </p>
            </div>
            <a
              href="https://maps.google.com/?q=Powai+Mumbai"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1.5"
            >
              <span>View On Maps</span>
              <ExternalLink size={13} />
            </a>
          </div>

        </div>
      </section>

      {/* ─── 3. MAIN SECTION: INQUIRY FORM + JOBONE SOCIAL HUB ─────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* ──── LEFT COLUMN: MODERN INQUIRY FORM (7 of 12 cols) ───────── */}
          <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-sm p-6 sm:p-8 md:p-10 transition-colors">
            
            <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                  Send a Direct Message
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Fill out the form below and our response specialists will get in touch.
                </p>
              </div>
              <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold">
                <Clock size={13} className="text-blue-500" />
                <span>Mon – Sat, 9am – 7pm</span>
              </div>
            </div>

            {status === "success" ? (
              /* Success confirmation state */
              <div className="text-center py-12 px-4 space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-md">
                  <CheckCircle2 size={36} />
                </div>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white">
                  Message Delivered Successfully!
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-300 max-w-md mx-auto leading-relaxed">
                  Thank you for reaching out to JobOne. Your inquiry ticket has been logged into our support queue. A representative will contact you via email shortly.
                </p>
                <div className="pt-4">
                  <button
                    type="button"
                    onClick={() => setStatus(null)}
                    className="px-6 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-blue-600/20 transition-all cursor-pointer"
                  >
                    Send Another Inquiry
                  </button>
                </div>
              </div>
            ) : (
              /* Main Form */
              <form onSubmit={handleSubmit} className="space-y-6">
                
                {/* Topic / Communication Type Selector */}
                <div>
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-wider mb-2.5 block">
                    What can we help you with?
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {COMMUNICATION_TYPES.map((type) => (
                      <button
                        key={type.id}
                        type="button"
                        onClick={() =>
                          setFormData({ ...formData, communicationType: type.id })
                        }
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                          formData.communicationType === type.id
                            ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                            : "bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-slate-300"
                        }`}
                      >
                        {type.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Name & Email Inputs */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-wider mb-2 block">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Adarsh Sharma"
                      className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-wider mb-2 block">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="e.g. adarsh@example.com"
                      className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    />
                  </div>
                </div>

                {/* Subject Input with Quick Suggestions */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-wider">
                      Subject *
                    </label>
                    <span className="text-[10px] text-slate-400 hidden sm:inline">
                      Quick tags below to auto-fill
                    </span>
                  </div>
                  <input
                    type="text"
                    required
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    placeholder="Brief summary of your inquiry..."
                    className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:ring-2 focus:ring-blue-500 transition-all mb-2"
                  />
                  <div className="flex flex-wrap gap-1.5">
                    {QUICK_SUBJECTS.map((sub) => (
                      <button
                        key={sub}
                        type="button"
                        onClick={() => setFormData({ ...formData, subject: sub })}
                        className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-blue-950/60 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer"
                      >
                        + {sub}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Detailed Message Textarea */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-wider">
                      Your Message *
                    </label>
                    <span className="text-[10px] font-bold text-slate-400">
                      {formData.message.length} chars
                    </span>
                  </div>
                  <textarea
                    required
                    rows={5}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Provide relevant details, including Job ID, application reference, or specific questions so we can assist promptly..."
                    className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-none leading-relaxed"
                  />
                </div>

                {/* Error Banner */}
                {status === "error" && errorMessage && (
                  <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-bold flex items-center gap-2">
                    <AlertCircle size={16} className="shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                {/* Submit Action Button */}
                <button
                  type="submit"
                  disabled={status === "sending"}
                  className={`w-full py-3.5 rounded-2xl text-white font-bold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-blue-600/25 ${
                    status === "sending"
                      ? "bg-blue-400 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700 hover:-translate-y-0.5 active:translate-y-0"
                  }`}
                >
                  <Send size={16} />
                  <span>{status === "sending" ? "Sending Message..." : "Submit Inquiry"}</span>
                </button>

                <p className="text-[11px] text-slate-400 text-center">
                  By submitting, you agree to JobOne's Privacy Policy. We never share your contact details.
                </p>
              </form>
            )}
          </div>

          {/* ──── RIGHT COLUMN: JOBONE SOCIAL HUB & COMMUNITY (5 of 12 cols) */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Social Hub Container */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-sm p-6 sm:p-7 transition-colors">
              <div className="flex items-center justify-between pb-3.5 mb-5 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
                    <Sparkles size={16} />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-900 dark:text-white">
                      JobOne Social Ecosystem
                    </h3>
                    <p className="text-[11px] text-slate-400">Connect with us on official platforms</p>
                  </div>
                </div>
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300">
                  Verified
                </span>
              </div>

              {/* Social Channels List */}
              <div className="space-y-3">
                {SOCIAL_CHANNELS.map((channel) => {
                  const Icon = channel.icon;
                  return (
                    <a
                      key={channel.name}
                      href={channel.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-sm transition-all flex items-start gap-3.5"
                    >
                      <div
                        className={`w-10 h-10 rounded-xl bg-gradient-to-br ${channel.color} text-white flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform`}
                      >
                        <Icon size={18} />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1 mb-0.5">
                          <h4 className="text-xs font-black text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
                            {channel.name}
                          </h4>
                          <span className="text-[10px] font-bold px-2 py-0.2 rounded-full bg-slate-200/70 dark:bg-slate-700 text-slate-700 dark:text-slate-300 shrink-0">
                            {channel.badge}
                          </span>
                        </div>
                        <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 truncate">
                          {channel.handle}
                        </p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                          {channel.description}
                        </p>
                      </div>

                      <ExternalLink
                        size={14}
                        className="text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 shrink-0 mt-1 transition-colors"
                      />
                    </a>
                  );
                })}
              </div>
            </div>

            {/* Direct Email Quick Copy Card */}
            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 dark:from-blue-900 dark:to-slate-900 rounded-3xl p-6 text-white shadow-lg shadow-blue-600/15">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="p-2.5 rounded-2xl bg-white/10 backdrop-blur-md">
                  <Headphones size={22} className="text-cyan-300" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-white/15 backdrop-blur-md">
                  Direct Inquiries
                </span>
              </div>

              <h4 className="text-lg font-black tracking-tight">Need Immediate Assistance?</h4>
              <p className="text-xs text-blue-100 mt-1 leading-relaxed">
                Copy our direct priority email desk or reach out over WhatsApp for urgent recruiter issues.
              </p>

              <div className="mt-4 p-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 flex items-center justify-between gap-2">
                <span className="text-xs font-mono font-bold truncate">support@jobone.in</span>
                <button
                  type="button"
                  onClick={() => copyEmailToClipboard("support@jobone.in")}
                  className="px-2.5 py-1 rounded-lg bg-white text-slate-900 text-xs font-bold hover:bg-blue-50 transition-colors flex items-center gap-1 shrink-0 cursor-pointer"
                >
                  {copiedEmail ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                  <span>{copiedEmail ? "Copied" : "Copy"}</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ─── 4. INTERACTIVE FAQ ACCORDION SECTION ───────────────────────── */}
      <section className="bg-slate-100/70 dark:bg-slate-900/60 py-14 sm:py-20 border-t border-slate-200/70 dark:border-slate-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 text-xs font-black uppercase tracking-wider mb-2.5 shadow-2xs">
              <HelpCircle size={14} />
              <span>Common Questions</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Frequently Asked Questions
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Quick answers about hiring partnerships, candidate profiles, and platform policies.
            </p>
          </div>

          <div className="space-y-3">
            {FAQS.map((faq, idx) => {
              const isOpen = activeFaq === idx;
              return (
                <div
                  key={idx}
                  className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-2xs transition-colors"
                >
                  <button
                    type="button"
                    onClick={() => setActiveFaq(isOpen ? -1 : idx)}
                    className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 cursor-pointer"
                  >
                    <span className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                      {faq.q}
                    </span>
                    <ChevronDown
                      size={18}
                      className={`text-slate-400 transition-transform duration-200 shrink-0 ${
                        isOpen ? "rotate-180 text-blue-600 dark:text-blue-400" : ""
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-4 sm:px-5 pb-5 pt-1 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-100 dark:border-slate-800/80">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── 5. FOOTER ─────────────────────────────────────────────────── */}
      <Footer />
    </div>
  );
}
