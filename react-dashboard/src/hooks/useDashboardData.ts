// ============================================================
// useDashboardData — Custom Hook for Dashboard Data Management
// ============================================================

"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import type {
  DashboardApiResponse,
  ProductionRecord,
  HaulageRecord,
} from "@/types/data";
import type { DashboardAnalytics } from "@/types/data";
import { computeAllAnalytics } from "@/lib/analytics";

interface UseDashboardDataReturn {
  /** Raw production records */
  production: ProductionRecord[];
  /** Raw haulage records */
  haulage: HaulageRecord[];
  /** All computed analytics and metrics */
  analytics: DashboardAnalytics | null;
  /** Loading state */
  isLoading: boolean;
  /** Error message if fetch failed */
  error: string | null;
  /** When data was last fetched */
  lastUpdated: Date | null;
  /** API query time in ms */
  queryTimeMs: number | null;
  /** Manually trigger a data refresh */
  refresh: () => void;
  /** Whether a refresh is currently in progress */
  isRefreshing: boolean;
}

export function useDashboardData(): UseDashboardDataReturn {
  const [production, setProduction] = useState<ProductionRecord[]>([]);
  const [haulage, setHaulage] = useState<HaulageRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [queryTimeMs, setQueryTimeMs] = useState<number | null>(null);

  const fetchData = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      setError(null);

      const response = await fetch("/api/data");

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      const json: DashboardApiResponse = await response.json();

      if ("error" in json && (json as any).error) {
        throw new Error((json as any).error);
      }

      setProduction(json.production || []);
      setHaulage(json.haulage || []);
      setLastUpdated(new Date());
      setQueryTimeMs(json.meta?.queryTimeMs || null);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to load dashboard data";
      setError(message);
      console.error("[Dashboard] Data fetch error:", message);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchData(false);
  }, [fetchData]);

  // Memoized analytics — only recomputed when raw data changes
  const analytics = useMemo(() => {
    if (production.length === 0 && haulage.length === 0) return null;
    return computeAllAnalytics(production, haulage);
  }, [production, haulage]);

  const refresh = useCallback(() => {
    fetchData(true);
  }, [fetchData]);

  return {
    production,
    haulage,
    analytics,
    isLoading,
    error,
    lastUpdated,
    queryTimeMs,
    refresh,
    isRefreshing,
  };
}
