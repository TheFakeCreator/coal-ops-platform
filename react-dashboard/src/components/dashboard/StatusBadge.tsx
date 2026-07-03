"use client";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

// ============================================================
// StatusBadge — Equipment operational status indicator
// ============================================================

const statusConfig: Record<
  string,
  { variant: "default" | "outline" | "destructive"; dotColor: string }
> = {
  Active: { variant: "default", dotColor: "bg-emerald-400" },
  active: { variant: "default", dotColor: "bg-emerald-400" },
  "Under Maintenance": { variant: "outline", dotColor: "bg-amber-400" },
  "under maintenance": { variant: "outline", dotColor: "bg-amber-400" },
  Maintenance: { variant: "outline", dotColor: "bg-amber-400" },
  maintenance: { variant: "outline", dotColor: "bg-amber-400" },
  Decommissioned: { variant: "destructive", dotColor: "bg-rose-400" },
  decommissioned: { variant: "destructive", dotColor: "bg-rose-400" },
  Idle: { variant: "outline", dotColor: "bg-zinc-400" },
  idle: { variant: "outline", dotColor: "bg-zinc-400" },
};

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status] || {
    variant: "outline" as const,
    dotColor: "bg-zinc-400",
  };

  return (
    <Badge variant={config.variant} className={cn("gap-1.5 font-medium", className)}>
      <span
        className={cn("h-1.5 w-1.5 rounded-full", config.dotColor)}
        aria-hidden="true"
      />
      {status}
    </Badge>
  );
}
