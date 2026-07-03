"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

// ============================================================
// ChartCard — Wrapper for all dashboard charts
// ============================================================

interface ChartCardProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
  contentClassName?: string;
  delay?: number;
}

export function ChartCard({
  title,
  description,
  children,
  action,
  className,
  contentClassName,
  delay = 0,
}: ChartCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: delay * 0.1, ease: "easeOut" }}
      className={cn(
        "rounded-xl border border-border bg-card overflow-hidden",
        className
      )}
    >
      <div className="flex items-start justify-between px-5 pt-5 pb-1">
        <div>
          <h3 className="text-sm font-medium text-foreground">{title}</h3>
          {description && (
            <p className="text-xs text-muted-foreground mt-0.5">
              {description}
            </p>
          )}
        </div>
        {action && <div className="flex-shrink-0">{action}</div>}
      </div>
      <div className={cn("px-5 pb-5 pt-2", contentClassName)}>{children}</div>
    </motion.div>
  );
}

// ============================================================
// ChartCardSkeleton — Loading placeholder for charts
// ============================================================

export function ChartCardSkeleton({ height = 300 }: { height?: number }) {
  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="px-5 pt-5 pb-1 space-y-1">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-3 w-56" />
      </div>
      <div className="px-5 pb-5 pt-2">
        <Skeleton className="w-full rounded-lg" style={{ height }} />
      </div>
    </div>
  );
}
