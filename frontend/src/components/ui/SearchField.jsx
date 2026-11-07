import React, { forwardRef } from "react";
import { Search, X } from "lucide-react";

export const SearchField = forwardRef(function SearchField(
  {
    value,
    onChange,
    onClear,
    placeholder = "Search postings, companies, keywords...",
    className = "",
    size = "md", // "sm" | "md" | "lg"
    ariaLabel = "Search input",
    autoFocus = false,
    ...props
  },
  ref
) {
  const sizeStyles = {
    sm: "py-1.5 pl-8 pr-7 text-xs rounded-xl",
    md: "py-2.5 pl-10 pr-9 text-sm rounded-xl",
    lg: "py-3.5 pl-12 pr-10 text-base rounded-2xl",
  };

  const iconSizes = {
    sm: "w-3.5 h-3.5 left-2.5",
    md: "w-4 h-4 left-3.5",
    lg: "w-5 h-5 left-4",
  };

  const clearSizes = {
    sm: "right-2 p-0.5",
    md: "right-2.5 p-1",
    lg: "right-3.5 p-1.5",
  };

  const handleClear = () => {
    if (onClear) onClear();
    else if (onChange) onChange({ target: { value: "" } });
  };

  return (
    <div className={`relative flex items-center w-full ${className}`}>
      <Search
        className={`absolute pointer-events-none text-[var(--theme-text-muted)] ${iconSizes[size] || iconSizes.md}`}
      />
      <input
        ref={ref}
        type="search"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        aria-label={ariaLabel}
        autoFocus={autoFocus}
        className={`w-full bg-[var(--theme-input-bg)] text-[var(--theme-text)] placeholder:text-[var(--theme-text-muted)] border border-[var(--theme-border)] hover:border-[var(--theme-border-silver)] focus:border-zinc-400 dark:focus:border-zinc-600 focus:outline-none focus:ring-1 focus:ring-zinc-400 transition-all font-medium ${
          sizeStyles[size] || sizeStyles.md
        }`}
        {...props}
      />
      {value && (
        <button
          type="button"
          onClick={handleClear}
          aria-label="Clear search"
          className={`absolute text-[var(--theme-text-muted)] hover:text-[var(--theme-text)] rounded-full hover:bg-[var(--theme-surface-hover)] transition-colors cursor-pointer ${
            clearSizes[size] || clearSizes.md
          }`}
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
});

export default SearchField;

