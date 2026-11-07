import React from "react";

export default function Container({
  children,
  size = "default", // "narrow" | "default" | "wide" | "full"
  className = "",
  ...props
}) {
  const sizeStyles = {
    narrow: "max-w-4xl",
    default: "max-w-7xl",
    wide: "max-w-[1440px]",
    full: "max-w-full",
  };

  return (
    <div
      className={`mx-auto w-full px-4 sm:px-6 lg:px-8 ${
        sizeStyles[size] || sizeStyles.default
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

