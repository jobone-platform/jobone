import React from "react";
import { Link } from "react-router-dom";
import {
  Briefcase,
  Users,
  ShieldCheck,
  CheckCircle2,
  Cpu,
  Layers,
  ArrowRight,
  Sparkles,
  Zap,
  BarChart3,
  Search,
} from "lucide-react";

export default function Services() {
  const serviceOfferings = [
    {
      badge: "Discovery & Sourcing",
      title: "Direct Requisition Publishing",
      description:
        "Publish high-impact roles to our verified candidate base. Benefit from algorithmic matching that connects roles with qualified applicants based on skills, experience, and verified projects.",
      features: [
        "Architectural job listing presentation",
        "Targeted role-matching telemetry",
        "Integrated screening questions & assessments",
        "Direct applicant tracking & review workflow",
      ],
    },
    {
      badge: "Recruitment Infrastructure",
      title: "Enterprise ATS & Pipeline Management",
      description:
        "Streamline your entire talent acquisition workflow with a unified candidate management system. Move candidates seamlessly from applied to interview, assignment, offer, and hire.",
      features: [
        "Kanban & structured stage pipelines",
        "Multi-stakeholder team feedback collection",
        "Candidate document verification hub",
        "Automated applicant status dispatch",
      ],
    },
    {
      badge: "Integrity & Trust",
      title: "Candidate Verification Standard",
      description:
        "Eliminate resume inflation and qualification fraud. JobOne verifies candidate identities, education credentials, employment history, and technical proficiencies.",
      features: [
        "Pre-screened candidate dossiers",
        "Document authentication standard",
        "Benchmark skill verification",
        "Zero-bot human review protocols",
      ],
    },
    {
      badge: "Executive Solutions",
      title: "Recruiter Concierge & Custom Sourcing",
      description:
        "For hyper-growth tech teams and specialized technical requisitions, our talent operations team curates bespoke candidate shortlists within 48 hours.",
      features: [
        "Dedicated talent acquisition specialist",
        "Hand-curated candidate shortlists",
        "Confidential executive searches",
        "Rapid turnaround SLA guarantees",
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground pt-24 pb-24 transition-colors">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-20">
        {/* --- EDITORIAL HERO --- */}
        <section className="text-center pt-8 pb-12 relative overflow-hidden">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-2 border border-border text-[11px] font-mono text-silver mb-6">
            <Layers size={13} className="text-silver" />
            <span>ENTERPRISE TALENT SOLUTIONS</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-display font-bold tracking-tight text-foreground max-w-4xl mx-auto leading-tight mb-6">
            Infrastructure for World-Class Talent Acquisition.
          </h1>

          <p className="text-base sm:text-xl text-foreground/70 max-w-2xl mx-auto leading-relaxed font-sans">
            JobOne provides modern recruiting teams with verified talent pipelines, streamlined candidate evaluation, and precision hiring architecture.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 mt-8">
            <Link
              to="/employerregister"
              className="px-6 py-3 rounded-xl bg-foreground text-background font-semibold text-xs sm:text-sm hover:opacity-90 transition shadow-md"
            >
              Start Hiring on JobOne
            </Link>
            <Link
              to="/contact"
              className="px-6 py-3 rounded-xl border border-border text-foreground hover:bg-surface-2 font-semibold text-xs sm:text-sm transition"
            >
              Schedule Enterprise Consultation
            </Link>
          </div>
        </section>

        {/* --- SERVICES GRID --- */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {serviceOfferings.map((service, idx) => (
            <div
              key={idx}
              className="p-8 rounded-3xl bg-surface-1 border border-border hover:border-silver/50 transition-all duration-200 flex flex-col justify-between shadow-sm hover:shadow-xl"
            >
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-silver mb-2 block">
                  {service.badge}
                </span>
                <h3 className="text-xl sm:text-2xl font-display font-bold text-foreground mb-3">
                  {service.title}
                </h3>
                <p className="text-xs sm:text-sm text-foreground/70 leading-relaxed font-sans mb-6">
                  {service.description}
                </p>

                <div className="space-y-2 pt-4 border-t border-border">
                  {service.features.map((feat, fIdx) => (
                    <div key={fIdx} className="flex items-center gap-2 text-xs text-foreground/80">
                      <CheckCircle2 size={14} className="text-silver shrink-0" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-6 mt-6 border-t border-border/60">
                <Link
                  to="/employerregister"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-foreground hover:text-silver transition-colors"
                >
                  <span>Deploy for your organization</span>
                  <ArrowRight size={13} />
                </Link>
              </div>
            </div>
          ))}
        </section>

        {/* --- ENTERPRISE SLA & GUARANTEES --- */}
        <section className="p-8 sm:p-12 rounded-3xl bg-surface-1 border border-border shadow-2xl">
          <div className="max-w-3xl mb-8">
            <span className="text-xs font-mono uppercase tracking-widest text-silver mb-2 block">
              Performance Guarantees
            </span>
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-foreground mb-3">
              Built for Engineering Speed & Precision
            </h2>
            <p className="text-xs sm:text-sm text-foreground/70 leading-relaxed">
              Whether you are hiring your first 10 engineers or scaling across international offices, JobOne provides the reliability and structure modern teams demand.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-surface-2 border border-border">
              <div className="text-2xl font-display font-extrabold text-foreground mb-1">
                48 Hours
              </div>
              <h4 className="text-xs font-bold text-foreground uppercase tracking-wider mb-1">
                Candidate Delivery
              </h4>
              <p className="text-xs text-foreground/60">
                High-fit candidate shortlists delivered within two business days of role approval.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-surface-2 border border-border">
              <div className="text-2xl font-display font-extrabold text-foreground mb-1">
                100%
              </div>
              <h4 className="text-xs font-bold text-foreground uppercase tracking-wider mb-1">
                Direct Contact
              </h4>
              <p className="text-xs text-foreground/60">
                No third-party recruiters or headhunters standing between you and your candidates.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-surface-2 border border-border">
              <div className="text-2xl font-display font-extrabold text-foreground mb-1">
                SOC 2
              </div>
              <h4 className="text-xs font-bold text-foreground uppercase tracking-wider mb-1">
                Enterprise Security
              </h4>
              <p className="text-xs text-foreground/60">
                Full data compliance, role-based access control, and encrypted communication channels.
              </p>
            </div>
          </div>
        </section>

        {/* --- BOTTOM CTA --- */}
        <section className="text-center py-10 border-t border-border">
          <h2 className="text-2xl sm:text-3xl font-display font-bold text-foreground mb-3">
            Accelerate your hiring pipeline today.
          </h2>
          <p className="text-xs sm:text-sm text-foreground/60 max-w-md mx-auto mb-6">
            Get started in under 3 minutes or speak with our enterprise talent architects.
          </p>
          <div className="flex justify-center gap-3">
            <Link
              to="/employerregister"
              className="px-6 py-3 rounded-xl bg-foreground text-background font-semibold text-xs tracking-wide hover:opacity-90 transition"
            >
              Create Employer Account
            </Link>
            <Link
              to="/contact"
              className="px-6 py-3 rounded-xl border border-border text-foreground font-semibold text-xs hover:bg-surface-2 transition"
            >
              Contact Enterprise Sales
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
