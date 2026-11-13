import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

/**
 * Reusable responsive grid of feature/benefit cards shared across Candidate and Employer homepages.
 */
export default function FeatureGrid({ items = [], columns = 3 }) {
  const gridCols =
    columns === 4
      ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
      : columns === 2
      ? "grid-cols-1 md:grid-cols-2"
      : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3";

  return (
    <div className={`grid ${gridCols} gap-5 sm:gap-6`}>
      {items.map((item, idx) => {
        const Icon = item.icon;
        return (
          <motion.div
            key={item.title}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ duration: 0.35, delay: Math.min(idx * 0.05, 0.3) }}
            className="group relative rounded-2xl border border-[var(--theme-border)] hover:border-[var(--theme-border-silver)] bg-[var(--theme-surface)] p-6 shadow-xs hover:shadow-lg transition-all duration-200 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between gap-3 mb-4">
                <div className="w-11 h-11 rounded-xl bg-[var(--theme-surface-elevated)] border border-[var(--theme-border)] flex items-center justify-center text-[var(--theme-accent-silver)] group-hover:scale-105 transition-transform">
                  {Icon && <Icon className="w-5 h-5" />}
                </div>
                {item.tag && (
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[var(--theme-surface-elevated)] border border-[var(--theme-border)] text-[var(--theme-text-muted)]">
                    {item.tag}
                  </span>
                )}
              </div>

              <h3 className="text-lg font-bold text-[var(--theme-text)] mb-2">
                {item.title}
              </h3>

              <p className="text-xs sm:text-sm text-[var(--theme-text-muted)] leading-relaxed">
                {item.description}
              </p>
            </div>

            {item.to && item.ctaLabel && (
              <div className="mt-5 pt-4 border-t border-[var(--theme-border)]">
                <Link
                  to={item.to}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--theme-text)] hover:text-[var(--theme-accent-silver)] transition-colors group/link"
                >
                  <span>{item.ctaLabel}</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover/link:translate-x-1 transition-transform" />
                </Link>
              </div>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}

