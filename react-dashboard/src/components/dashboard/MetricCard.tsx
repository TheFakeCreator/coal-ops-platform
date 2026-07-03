"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import type { LucideIcon } from "lucide-react";

// ============================================================
// AnimatedNumber — Counts up from 0 to target value
// ============================================================

function AnimatedNumber({
  value,
  duration = 1200,
  decimals = 0,
  formatter,
}: {
  value: number;
  duration?: number;
  decimals?: number;
  formatter?: (n: number) => string;
}) {
  const [display, setDisplay] = useState(0);
  const frameRef = useRef<number>(0);
  const startRef = useRef<number>(0);
  const prevValueRef = useRef(0);

  useEffect(() => {
    const from = prevValueRef.current;
    const to = value;
    prevValueRef.current = value;

    if (from === to) {
      setDisplay(to);
      return;
    }

    startRef.current = performance.now();

    const animate = (now: number) => {
      const elapsed = now - startRef.current;
      const progress = Math.min(elapsed / duration, 1);
      // easeOutExpo
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setDisplay(from + (to - from) * eased);

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate);
      }
    };

    frameRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameRef.current);
  }, [value, duration]);

  const formatted = formatter
    ? formatter(display)
    : display.toLocaleString("en-US", {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      });

  return <>{formatted}</>;
}

// ============================================================
// SparkLine — Tiny inline trend chart
// ============================================================

function SparkLine({
  data,
  color = "#3b82f6",
  width = 80,
  height = 32,
}: {
  data: number[];
  color?: string;
  width?: number;
  height?: number;
}) {
  if (data.length < 2) return null;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const padding = 2;

  const points = data
    .map((val, i) => {
      const x = (i / (data.length - 1)) * (width - padding * 2) + padding;
      const y =
        height - padding - ((val - min) / range) * (height - padding * 2);
      return `${x},${y}`;
    })
    .join(" ");

  const areaPoints = `${padding},${height - padding} ${points} ${width - padding},${height - padding}`;

  return (
    <svg
      width={width}
      height={height}
      className="overflow-visible"
      aria-hidden="true"
    >
      <defs>
        <linearGradient
          id={`spark-gradient-${color.replace("#", "")}`}
          x1="0"
          y1="0"
          x2="0"
          y2="1"
        >
          <stop offset="0%" stopColor={color} stopOpacity={0.3} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      <polygon
        points={areaPoints}
        fill={`url(#spark-gradient-${color.replace("#", "")})`}
      />
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// ============================================================
// MetricCard — Primary KPI display component
// ============================================================

interface MetricCardProps {
  title: string;
  value: number;
  unit?: string;
  icon: LucideIcon;
  decimals?: number;
  formatter?: (n: number) => string;
  trend?: number[];
  trendColor?: string;
  accentColor?: "blue" | "emerald" | "amber" | "rose" | "violet";
  description?: string;
  className?: string;
  delay?: number;
}

const accentStyles = {
  blue: {
    iconBg: "bg-blue-500/10",
    iconColor: "text-blue-400",
    glow: "hover:glow-blue",
    border: "hover:border-blue-500/20",
  },
  emerald: {
    iconBg: "bg-emerald-500/10",
    iconColor: "text-emerald-400",
    glow: "hover:glow-emerald",
    border: "hover:border-emerald-500/20",
  },
  amber: {
    iconBg: "bg-amber-500/10",
    iconColor: "text-amber-400",
    glow: "hover:glow-amber",
    border: "hover:border-amber-500/20",
  },
  rose: {
    iconBg: "bg-rose-500/10",
    iconColor: "text-rose-400",
    glow: "hover:glow-rose",
    border: "hover:border-rose-500/20",
  },
  violet: {
    iconBg: "bg-violet-500/10",
    iconColor: "text-violet-400",
    glow: "hover:glow-blue",
    border: "hover:border-violet-500/20",
  },
};

export function MetricCard({
  title,
  value,
  unit,
  icon: Icon,
  decimals = 0,
  formatter,
  trend,
  trendColor,
  accentColor = "blue",
  description,
  className,
  delay = 0,
}: MetricCardProps) {
  const accent = accentStyles[accentColor];
  const sparkColor =
    trendColor ||
    {
      blue: "#3b82f6",
      emerald: "#10b981",
      amber: "#f59e0b",
      rose: "#ef4444",
      violet: "#8b5cf6",
    }[accentColor];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: delay * 0.1, ease: "easeOut" }}
      className={cn(
        "group relative rounded-xl border border-border bg-card p-5 transition-all duration-300 overflow-hidden",
        accent.glow,
        accent.border,
        className
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-3 flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <div
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-lg flex-shrink-0",
                accent.iconBg
              )}
            >
              <Icon className={cn("h-4 w-4", accent.iconColor)} />
            </div>
            <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground truncate">
              {title}
            </span>
          </div>

          <div className="flex items-baseline gap-1.5 flex-wrap">
            <span className="text-2xl font-semibold tracking-tight font-mono tabular-nums">
              <AnimatedNumber
                value={value}
                decimals={decimals}
                formatter={formatter}
              />
            </span>
            {unit && (
              <span className="text-sm text-muted-foreground font-medium">
                {unit}
              </span>
            )}
          </div>

          {description && (
            <p className="text-xs text-muted-foreground truncate">{description}</p>
          )}
        </div>

        {trend && trend.length > 1 && (
          <div className="mt-6 flex-shrink-0 opacity-60 group-hover:opacity-100 transition-opacity">
            <SparkLine data={trend} color={sparkColor} width={64} height={32} />
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ============================================================
// MetricCardSkeleton — Loading placeholder
// ============================================================

export function MetricCardSkeleton() {
  return (
    <div className="rounded-xl border border-border bg-card p-5 space-y-3">
      <div className="flex items-center gap-2">
        <Skeleton className="h-8 w-8 rounded-lg" />
        <Skeleton className="h-3 w-24" />
      </div>
      <Skeleton className="h-8 w-32" />
      <Skeleton className="h-3 w-20" />
    </div>
  );
}
