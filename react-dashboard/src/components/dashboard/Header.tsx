"use client";

import { RefreshCw, Clock, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// ============================================================
// Header — Top bar with title, refresh, and data freshness
// ============================================================

interface HeaderProps {
  title: string;
  subtitle?: string;
  lastUpdated: Date | null;
  queryTimeMs: number | null;
  onRefresh: () => void;
  isRefreshing: boolean;
}

export function Header({
  title,
  subtitle,
  lastUpdated,
  queryTimeMs,
  onRefresh,
  isRefreshing,
}: HeaderProps) {
  const freshness = getFreshnessState(lastUpdated);

  return (
    <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        {subtitle && (
          <p className="text-sm text-muted-foreground mt-0.5">{subtitle}</p>
        )}
      </div>

      <div className="flex items-center gap-3">
        {/* Data Freshness */}
        {lastUpdated && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <span
                className={cn(
                  "h-1.5 w-1.5 rounded-full",
                  freshness.dotColor
                )}
                aria-label={`Data freshness: ${freshness.label}`}
              />
              <Clock className="h-3 w-3" />
              <span>{formatTimeAgo(lastUpdated)}</span>
            </div>

            {queryTimeMs !== null && (
              <Tooltip>
                <TooltipTrigger
                  className="flex items-center gap-1 text-muted-foreground/60 cursor-default"
                >
                  <Zap className="h-3 w-3" />
                  <span>{queryTimeMs}ms</span>
                </TooltipTrigger>
                <TooltipContent>
                  Snowflake query time: {queryTimeMs}ms
                </TooltipContent>
              </Tooltip>
            )}
          </div>
        )}

        {/* Refresh Button */}
        <Tooltip>
          <TooltipTrigger
            className={cn(
              "inline-flex items-center justify-center rounded-lg border border-border bg-card p-1.5 transition-colors",
              "hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              "disabled:pointer-events-none disabled:opacity-50"
            )}
            onClick={onRefresh}
            disabled={isRefreshing}
            aria-label="Refresh data"
          >
            <RefreshCw
              className={cn("h-3.5 w-3.5", isRefreshing && "animate-spin")}
            />
          </TooltipTrigger>
          <TooltipContent>Refresh data from Snowflake</TooltipContent>
        </Tooltip>
      </div>
    </header>
  );
}

// ── Helpers ──────────────────────────────────────────────────

function getFreshnessState(lastUpdated: Date | null) {
  if (!lastUpdated) return { label: "Unknown", dotColor: "bg-zinc-500" };

  const ageMs = Date.now() - lastUpdated.getTime();
  const ageMinutes = ageMs / 1000 / 60;

  if (ageMinutes < 2)
    return { label: "Fresh", dotColor: "bg-emerald-400 animate-pulse" };
  if (ageMinutes < 10)
    return { label: "Recent", dotColor: "bg-amber-400" };
  return { label: "Stale", dotColor: "bg-rose-400" };
}

function formatTimeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 10) return "Just now";
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  return `${hours}h ago`;
}
