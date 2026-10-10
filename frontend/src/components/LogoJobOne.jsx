import React from "react";

export default function JobOneLogo({
  width = 400,
  height = 300,
  primaryDotColor = "#00E5FF", // Glowing Cyan
  secondaryDotColor = "#0088CC", // Mid Blue
  tertiaryDotColor = "#004488", // Dark Blue
  textColor = "#FFFFFF", // Text color
  className = "",
  ...props
}) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 600 250"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      {/* --- PREMIUM GLOW FILTER --- */}
      <defs>
        <filter id="neonGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* ========================================== */}
      {/* 1. THE RADIATING SUNBURST DOT CLUSTER      */}
      {/* Perfectly mirrored across the Y=125 Axis   */}
      {/* ========================================== */}
      <g id="dot-cluster">
        {/* Inner Cyan Dots (Large, Glowing) */}
        <g fill={primaryDotColor} filter="url(#neonGlow)">
          <circle cx="120" cy="75" r="11" /> {/* Top */}
          <circle cx="120" cy="175" r="11" /> {/* Bottom */}
          <circle cx="80" cy="90" r="11" /> {/* Upper-Left */}
          <circle cx="80" cy="160" r="11" /> {/* Lower-Left */}
          <circle cx="60" cy="125" r="11" /> {/* Far-Left (Center Axis) */}
        </g>

        {/* Medium Blue Dots (Mid-size sunburst rays) */}
        <g fill={secondaryDotColor}>
          {/* Inner Right Tips (Framing the 'J') */}
          <circle cx="155" cy="55" r="7.5" />
          <circle cx="155" cy="195" r="7.5" />

          {/* Top & Bottom */}
          <circle cx="120" cy="40" r="7.5" />
          <circle cx="120" cy="210" r="7.5" />

          {/* Upper & Lower Left Ray 1 */}
          <circle cx="82.5" cy="50" r="7.5" />
          <circle cx="82.5" cy="200" r="7.5" />

          {/* Upper & Lower Left Ray 2 */}
          <circle cx="55" cy="65" r="7.5" />
          <circle cx="55" cy="185" r="7.5" />

          {/* Upper & Lower Left Ray 3 */}
          <circle cx="30" cy="92.5" r="7.5" />
          <circle cx="30" cy="157.5" r="7.5" />

          {/* Far Left (Center Axis) */}
          <circle cx="30" cy="125" r="7.5" />
        </g>

        {/* Dark Blue Dots (Small outer bounds) */}
        <g fill={tertiaryDotColor}>
          {/* Far Right Tips (Framing the 'J') */}
          <circle cx="190" cy="55" r="5" />
          <circle cx="190" cy="195" r="5" />

          {/* Top & Bottom Tips */}
          <circle cx="120" cy="10" r="5" />
          <circle cx="120" cy="240" r="5" />

          {/* Upper & Lower Left Outer */}
          <circle cx="70" cy="20" r="5" />
          <circle cx="70" cy="230" r="5" />

          {/* Far Upper & Lower Left */}
          <circle cx="26" cy="40" r="5" />
          <circle cx="26" cy="210" r="5" />

          {/* Furthest Left (Center Axis) */}
          <circle cx="5" cy="125" r="5" />
        </g>
      </g>

      {/* ========================================== */}
      {/* 2. PERFECTED TYPOGRAPHY                      */}
      {/* ========================================== */}
      <g id="text-elements" fill={textColor}>
        {/* Main Brand Name */}
        <text
          x="130"
          y="150"
          fontFamily="system-ui, -apple-system, sans-serif"
          fontSize="100"
          fontWeight="400"
          letterSpacing="2"
        >
          Jobone
        </text>

        {/* Subtitle */}
        <text
          x="200"
          y="185"
          fontFamily="system-ui, -apple-system, sans-serif"
          fontSize="21"
          fontWeight="400"
          letterSpacing="5"
        >
          For Everyone
        </text>
      </g>
    </svg>
  );
}
