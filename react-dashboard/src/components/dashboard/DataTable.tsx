"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { StatusBadge } from "./StatusBadge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatNumber } from "@/lib/analytics";
import type { ManagerPerformance, EquipmentStatusGroup } from "@/types/data";
import { Trophy, Medal, Award } from "lucide-react";

// ============================================================
// DataTable — Reusable sortable table with row hover effects
// ============================================================

interface Column<T> {
  key: string;
  header: string;
  render: (row: T, index: number) => React.ReactNode;
  align?: "left" | "right" | "center";
  width?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  emptyMessage?: string;
  className?: string;
}

export function DataTable<T>({
  columns,
  data,
  emptyMessage = "No data available",
  className,
}: DataTableProps<T>) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className={cn("overflow-x-auto", className)}>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border">
            {columns.map((col) => (
              <th
                key={col.key}
                className={cn(
                  "pb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground",
                  col.align === "right" && "text-right",
                  col.align === "center" && "text-center",
                  col.align === "left" && "text-left",
                  !col.align && "text-left"
                )}
                style={{ width: col.width }}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIndex) => (
            <motion.tr
              key={rowIndex}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: rowIndex * 0.03 }}
              className="border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors"
            >
              {columns.map((col) => (
                <td
                  key={col.key}
                  className={cn(
                    "py-2.5",
                    col.align === "right" && "text-right",
                    col.align === "center" && "text-center"
                  )}
                >
                  {col.render(row, rowIndex)}
                </td>
              ))}
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ============================================================
// Pre-built Table Configurations
// ============================================================

const rankIcons = [
  <Trophy key="1" className="h-3.5 w-3.5 text-amber-400" />,
  <Medal key="2" className="h-3.5 w-3.5 text-zinc-300" />,
  <Award key="3" className="h-3.5 w-3.5 text-amber-600" />,
];

export const managerColumns: Column<ManagerPerformance>[] = [
  {
    key: "rank",
    header: "#",
    width: "40px",
    render: (_, i) => (
      <span className="flex items-center justify-center">
        {i < 3 ? rankIcons[i] : (
          <span className="text-xs text-muted-foreground">{i + 1}</span>
        )}
      </span>
    ),
    align: "center",
  },
  {
    key: "name",
    header: "Manager",
    render: (row) => (
      <div>
        <span className="font-medium text-foreground">{row.name}</span>
        <span className="block text-xs text-muted-foreground">
          {row.topRegion}
        </span>
      </div>
    ),
  },
  {
    key: "totalTons",
    header: "Total Tons",
    align: "right",
    render: (row) => (
      <span className="font-mono text-foreground tabular-nums">
        {formatNumber(row.totalTons)}
      </span>
    ),
  },
  {
    key: "shifts",
    header: "Shifts",
    align: "right",
    render: (row) => (
      <span className="font-mono text-muted-foreground tabular-nums">
        {row.shiftCount}
      </span>
    ),
  },
  {
    key: "avg",
    header: "Avg/Shift",
    align: "right",
    render: (row) => (
      <span className="font-mono text-emerald-400 tabular-nums">
        {formatNumber(row.avgTonsPerShift, 1)}
      </span>
    ),
  },
];

export const equipmentStatusColumns: Column<EquipmentStatusGroup>[] = [
  {
    key: "status",
    header: "Status",
    render: (row) => <StatusBadge status={row.status} />,
  },
  {
    key: "count",
    header: "Count",
    align: "right",
    render: (row) => (
      <span className="font-mono text-foreground tabular-nums">
        {row.count}
      </span>
    ),
  },
  {
    key: "percentage",
    header: "Share",
    align: "right",
    render: (row) => (
      <div className="flex items-center justify-end gap-2">
        <div className="w-16 h-1.5 rounded-full bg-muted overflow-hidden">
          <div
            className="h-full rounded-full bg-primary transition-all duration-500"
            style={{ width: `${row.percentage}%` }}
          />
        </div>
        <span className="font-mono text-xs text-muted-foreground tabular-nums w-10 text-right">
          {row.percentage.toFixed(0)}%
        </span>
      </div>
    ),
  },
];

// ============================================================
// DataTableSkeleton — Loading placeholder
// ============================================================

export function DataTableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      <div className="flex gap-4 pb-2 border-b border-border">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-3 w-24 ml-auto" />
        <Skeleton className="h-3 w-16" />
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4 items-center py-1">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-20 ml-auto" />
          <Skeleton className="h-4 w-14" />
        </div>
      ))}
    </div>
  );
}
