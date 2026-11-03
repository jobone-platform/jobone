import React from "react";

export default function KPIWidgetSparkline({
  data = [0, 0, 0, 0, 0, 0, 0],
  color = "#3b82f6",
  height = 32,
  width = "100%",
  className = "",
}) {
  const safeData = Array.isArray(data) && data.length > 0 ? data : [0, 0, 0, 0, 0, 0, 0];
  const max = Math.max(...safeData, 1);
  const min = Math.min(...safeData, 0);
  const range = max - min || 1;

  // ViewBox coordinate space: 100 x 32
  const vbWidth = 100;
  const vbHeight = 32;

  const points = safeData
    .map((val, idx) => {
      const x = (idx / Math.max(safeData.length - 1, 1)) * vbWidth;
      const y = vbHeight - ((val - min) / range) * (vbHeight - 8) - 4;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

  const fillPoints = `0,${vbHeight} ${points} ${vbWidth},${vbHeight}`;
  const gradientId = `spark-grad-${color.replace(/[^a-zA-Z0-9]/g, "")}`;

  return (
    <div className={`relative overflow-hidden ${className}`} style={{ height }}>
      <svg
        viewBox={`0 0 ${vbWidth} ${vbHeight}`}
        preserveAspectRatio="none"
        className="w-full h-full overflow-visible"
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.3" />
            <stop offset="100%" stopColor={color} stopOpacity="0.0" />
          </linearGradient>
        </defs>
        <polygon points={fillPoints} fill={`url(#${gradientId})`} />
        <polyline
          points={points}
          fill="none"
          stroke={color}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

