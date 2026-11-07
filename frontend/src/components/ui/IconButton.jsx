import React, { forwardRef } from "react";

function renderIcon(icon, defaultProps = {}) {
  if (!icon) return null;
  if (React.isValidElement(icon)) return icon;
  const IconComponent = icon;
  return <IconComponent {...defaultProps} />;
}

export const IconButton = forwardRef(function IconButton(
  {
    icon,
    label, // accessible aria-label (required for a11y)
    variant = "ghost", // "ghost" | "secondary" | "outline" | "silver" | "danger"
    size = "md", // "sm" | "md" | "lg"
    className = "",
    disabled = false,
    loading = false,
    type = "button",
    onClick,
    ...props
  },
  ref
) {
  const sizeStyles = {
    sm: "w-8 h-8 rounded-lg text-xs",
    md: "w-10 h-10 rounded-xl text-sm",
    lg: "w-12 h-12 rounded-2xl text-base",
  };

  const iconSizes = {
    sm: "w-3.5 h-3.5",
    md: "w-4 h-4",
    lg: "w-5 h-5",
  };

  const variantStyles = {
    ghost:
      "text-[var(--theme-text-muted)] hover:text-[var(--theme-text)] hover:bg-[var(--theme-card)] focus:ring-zinc-400",
    secondary:
      "bg-[var(--theme-card)] text-[var(--theme-text)] border border-[var(--theme-border)] hover:border-[var(--theme-border-silver)] hover:bg-[var(--theme-surface-hover)] focus:ring-zinc-400",
    outline:
      "border border-[var(--theme-border)] text-[var(--theme-text)] hover:border-zinc-400 hover:bg-[var(--theme-surface-hover)] focus:ring-zinc-400",
    silver:
      "bg-gradient-to-br from-zinc-200 via-zinc-100 to-zinc-300 dark:from-zinc-800 dark:via-zinc-700 dark:to-zinc-800 text-zinc-950 dark:text-white border border-[var(--theme-border-silver)] hover:scale-105 active:scale-95 shadow-sm focus:ring-zinc-400",
    danger:
      "text-rose-500 hover:text-rose-400 hover:bg-rose-500/10 focus:ring-rose-500",
  };

  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      aria-label={label}
      title={label}
      className={`inline-flex items-center justify-center shrink-0 transition-all duration-200 select-none cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-offset-[var(--theme-bg)] active:scale-95 ${
        sizeStyles[size] || sizeStyles.md
      } ${variantStyles[variant] || variantStyles.ghost} ${className}`}
      {...props}
    >
      {loading ? (
        <svg
          className="animate-spin w-4 h-4 text-current opacity-80"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v8H4z"
          />
        </svg>
      ) : (
        renderIcon(icon, { className: iconSizes[size] || iconSizes.md })
      )}
    </button>
  );
});

export default IconButton;

