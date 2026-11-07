import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import IconButton from "./IconButton";

export default function Pagination({
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  className = "",
}) {
  if (totalPages <= 1) return null;

  const getPages = () => {
    const pages = [];
    const delta = 1;
    const left = currentPage - delta;
    const right = currentPage + delta + 1;

    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= left && i < right)) {
        pages.push(i);
      } else if (pages[pages.length - 1] !== "...") {
        pages.push("...");
      }
    }
    return pages;
  };

  return (
    <nav
      aria-label="Pagination Navigation"
      className={`flex items-center justify-center gap-1.5 sm:gap-2 ${className}`}
    >
      <IconButton
        icon={<ChevronLeft className="w-4 h-4" />}
        label="Previous page"
        size="sm"
        variant="outline"
        disabled={currentPage <= 1}
        onClick={() => onPageChange(currentPage - 1)}
      />

      {getPages().map((page, idx) => {
        if (page === "...") {
          return (
            <span
              key={`ellipsis-${idx}`}
              className="px-2 py-1 text-xs text-[var(--theme-text-muted)] select-none"
            >
              &hellip;
            </span>
          );
        }

        const isCurrent = page === currentPage;
        return (
          <button
            key={page}
            type="button"
            aria-current={isCurrent ? "page" : undefined}
            onClick={() => onPageChange(page)}
            className={`min-w-8 h-8 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              isCurrent
                ? "bg-[var(--theme-text)] text-[var(--theme-bg)] shadow-xs"
                : "text-[var(--theme-text-muted)] hover:text-[var(--theme-text)] hover:bg-[var(--theme-card)]"
            }`}
          >
            {page}
          </button>
        );
      })}

      <IconButton
        icon={<ChevronRight className="w-4 h-4" />}
        label="Next page"
        size="sm"
        variant="outline"
        disabled={currentPage >= totalPages}
        onClick={() => onPageChange(currentPage + 1)}
      />
    </nav>
  );
}

