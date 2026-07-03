// ============================================================
// Chart Theme — Shared Recharts configuration
// ============================================================

export const CHART_COLORS = {
  blue: "#3b82f6",
  emerald: "#10b981",
  amber: "#f59e0b",
  rose: "#ef4444",
  violet: "#8b5cf6",
  cyan: "#06b6d4",
  pink: "#ec4899",
  indigo: "#6366f1",
};

export const CHART_PALETTE = [
  CHART_COLORS.blue,
  CHART_COLORS.emerald,
  CHART_COLORS.amber,
  CHART_COLORS.violet,
  CHART_COLORS.cyan,
  CHART_COLORS.rose,
  CHART_COLORS.pink,
  CHART_COLORS.indigo,
];

export const CHART_TOOLTIP_STYLE: React.CSSProperties = {
  backgroundColor: "hsl(240 6% 10%)",
  border: "1px solid hsl(240 4% 16%)",
  borderRadius: "8px",
  padding: "8px 12px",
  boxShadow: "0 4px 20px rgba(0,0,0,0.4)",
  fontSize: "12px",
  color: "#fafafa",
};

export const CHART_GRID_STYLE = {
  strokeDasharray: "3 3",
  stroke: "hsl(240 4% 16%)",
  vertical: false,
};

export const CHART_AXIS_STYLE = {
  stroke: "#71717a",
  fontSize: 11,
  tickLine: false as const,
  axisLine: false as const,
};

export const CHART_ANIMATION = {
  duration: 800,
  easing: "ease-out" as const,
};
