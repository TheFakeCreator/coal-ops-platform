// ============================================================
// Analytics Engine — Pure Data Transformation Functions
// ============================================================
// These functions take raw Snowflake data and compute business
// metrics, trends, rankings, and chart-ready data structures.
// All functions are pure — no side effects, no API calls.
// ============================================================

import type {
  ProductionRecord,
  HaulageRecord,
  KPIMetrics,
  ChartDataPoint,
  TimeSeriesPoint,
  EfficiencyDataPoint,
  ManagerPerformance,
  EquipmentStatusGroup,
  TripDurationStat,
  DestinationBreakdown,
  DashboardAnalytics,
} from "@/types/data";

// ── Helpers ──────────────────────────────────────────────────

function getTripDurationMinutes(trip: HaulageRecord): number {
  const start = new Date(trip.TRIP_START).getTime();
  const end = new Date(trip.TRIP_END).getTime();
  const diff = end - start;
  return diff > 0 ? diff / (1000 * 60) : 0;
}

function groupBy<T>(items: T[], keyFn: (item: T) => string): Map<string, T[]> {
  const map = new Map<string, T[]>();
  for (const item of items) {
    const key = keyFn(item);
    const group = map.get(key) || [];
    group.push(item);
    map.set(key, group);
  }
  return map;
}

// ── KPI Computation ──────────────────────────────────────────

export function computeKPIs(
  production: ProductionRecord[],
  haulage: HaulageRecord[]
): KPIMetrics {
  const totalExtraction = production.reduce(
    (sum, r) => sum + (r.TONS_EXTRACTED || 0),
    0
  );
  const totalFuelConsumed = haulage.reduce(
    (sum, r) => sum + (r.FUEL_CONSUMED_LITERS || 0),
    0
  );
  const totalTonsTransported = haulage.reduce(
    (sum, r) => sum + (r.TONS_TRANSPORTED || 0),
    0
  );
  const totalTrips = haulage.length;

  const avgFuelEfficiency =
    totalFuelConsumed > 0 ? totalTonsTransported / totalFuelConsumed : 0;

  const tripDurations = haulage.map(getTripDurationMinutes).filter((d) => d > 0);
  const avgTripDurationMinutes =
    tripDurations.length > 0
      ? tripDurations.reduce((a, b) => a + b, 0) / tripDurations.length
      : 0;

  const uniqueSites = new Set(production.map((r) => r.SITE_NAME)).size;
  const equipmentTypes = new Set(haulage.map((r) => r.EQUIPMENT_TYPE));
  const uniqueEquipmentTypes = equipmentTypes.size;

  const statusGroups = groupBy(haulage, (r) => r.OPERATIONAL_STATUS);
  const activeEquipmentCount = statusGroups.get("Active")?.length || 0;
  const totalEquipmentCount = haulage.length;

  return {
    totalExtraction,
    totalFuelConsumed,
    totalTrips,
    totalTonsTransported,
    avgFuelEfficiency,
    avgTripDurationMinutes,
    uniqueSites,
    uniqueEquipmentTypes,
    activeEquipmentCount,
    totalEquipmentCount,
  };
}

// ── Production Analytics ─────────────────────────────────────

export function getProductionByRegion(
  production: ProductionRecord[]
): ChartDataPoint[] {
  const groups = groupBy(production, (r) => r.REGION);
  return Array.from(groups, ([name, records]) => ({
    name,
    value: records.reduce((sum, r) => sum + r.TONS_EXTRACTED, 0),
  })).sort((a, b) => b.value - a.value);
}

export function getProductionByCoalType(
  production: ProductionRecord[]
): ChartDataPoint[] {
  const groups = groupBy(production, (r) => r.PRIMARY_COAL_TYPE);
  return Array.from(groups, ([name, records]) => ({
    name,
    value: records.reduce((sum, r) => sum + r.TONS_EXTRACTED, 0),
  })).sort((a, b) => b.value - a.value);
}

export function getProductionBySite(
  production: ProductionRecord[]
): ChartDataPoint[] {
  const groups = groupBy(production, (r) => r.SITE_NAME);
  return Array.from(groups, ([name, records]) => ({
    name,
    value: records.reduce((sum, r) => sum + r.TONS_EXTRACTED, 0),
  })).sort((a, b) => b.value - a.value);
}

export function getProductionTimeSeries(
  production: ProductionRecord[]
): TimeSeriesPoint[] {
  const groups = groupBy(production, (r) => {
    const d = new Date(r.EXTRACTION_DATE);
    return d.toISOString().split("T")[0]; // YYYY-MM-DD
  });

  return Array.from(groups, ([date, records]) => ({
    date,
    value: records.reduce((sum, r) => sum + r.TONS_EXTRACTED, 0),
  })).sort((a, b) => a.date.localeCompare(b.date));
}

// ── Fleet & Equipment Analytics ──────────────────────────────

export function getFuelEfficiencyByEquipment(
  haulage: HaulageRecord[]
): EfficiencyDataPoint[] {
  const groups = groupBy(haulage, (r) => r.EQUIPMENT_TYPE);
  return Array.from(groups, ([name, records]) => {
    const totalTons = records.reduce((s, r) => s + r.TONS_TRANSPORTED, 0);
    const totalFuel = records.reduce((s, r) => s + r.FUEL_CONSUMED_LITERS, 0);
    return {
      name,
      efficiency: totalFuel > 0 ? totalTons / totalFuel : 0,
      totalTons,
      totalFuel,
      tripCount: records.length,
    };
  }).sort((a, b) => b.efficiency - a.efficiency);
}

export function getEquipmentStatus(
  haulage: HaulageRecord[]
): EquipmentStatusGroup[] {
  const groups = groupBy(haulage, (r) => r.OPERATIONAL_STATUS);
  const total = haulage.length;
  return Array.from(groups, ([status, records]) => ({
    status,
    count: records.length,
    percentage: total > 0 ? (records.length / total) * 100 : 0,
  })).sort((a, b) => b.count - a.count);
}

export function getTripDurationStats(
  haulage: HaulageRecord[]
): TripDurationStat[] {
  const groups = groupBy(haulage, (r) => r.EQUIPMENT_TYPE);
  return Array.from(groups, ([equipmentType, records]) => {
    const durations = records.map(getTripDurationMinutes).filter((d) => d > 0);
    return {
      equipmentType,
      avgMinutes:
        durations.length > 0
          ? durations.reduce((a, b) => a + b, 0) / durations.length
          : 0,
      minMinutes: durations.length > 0 ? Math.min(...durations) : 0,
      maxMinutes: durations.length > 0 ? Math.max(...durations) : 0,
      tripCount: records.length,
    };
  }).sort((a, b) => b.tripCount - a.tripCount);
}

export function getDestinationBreakdown(
  haulage: HaulageRecord[]
): DestinationBreakdown[] {
  const groups = groupBy(haulage, (r) => r.DESTINATION_YARD);
  return Array.from(groups, ([yard, records]) => {
    const totalTons = records.reduce((s, r) => s + r.TONS_TRANSPORTED, 0);
    return {
      yard,
      totalTons,
      tripCount: records.length,
      avgLoad: records.length > 0 ? totalTons / records.length : 0,
    };
  }).sort((a, b) => b.totalTons - a.totalTons);
}

// ── People Analytics ─────────────────────────────────────────

export function getTopShiftManagers(
  production: ProductionRecord[]
): ManagerPerformance[] {
  const groups = groupBy(production, (r) => r.SHIFT_MANAGER);
  return Array.from(groups, ([name, records]) => {
    const totalTons = records.reduce((s, r) => s + r.TONS_EXTRACTED, 0);
    const regionCounts = new Map<string, number>();
    records.forEach((r) =>
      regionCounts.set(r.REGION, (regionCounts.get(r.REGION) || 0) + 1)
    );
    const topRegion = Array.from(regionCounts.entries()).sort(
      (a, b) => b[1] - a[1]
    )[0]?.[0] || "N/A";

    return {
      name,
      totalTons,
      shiftCount: records.length,
      avgTonsPerShift: records.length > 0 ? totalTons / records.length : 0,
      topRegion,
    };
  }).sort((a, b) => b.totalTons - a.totalTons);
}

// ── Full Analytics Computation ───────────────────────────────

export function computeAllAnalytics(
  production: ProductionRecord[],
  haulage: HaulageRecord[]
): DashboardAnalytics {
  return {
    kpis: computeKPIs(production, haulage),
    productionByRegion: getProductionByRegion(production),
    productionByCoalType: getProductionByCoalType(production),
    productionTimeSeries: getProductionTimeSeries(production),
    fuelEfficiencyByEquipment: getFuelEfficiencyByEquipment(haulage),
    equipmentStatus: getEquipmentStatus(haulage),
    tripDurationStats: getTripDurationStats(haulage),
    topManagers: getTopShiftManagers(production),
    destinationBreakdown: getDestinationBreakdown(haulage),
    productionBySite: getProductionBySite(production),
  };
}

// ── Formatting Utilities ─────────────────────────────────────

export function formatNumber(value: number, decimals = 0): string {
  return value.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

export function formatCompact(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return value.toFixed(0);
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${Math.round(minutes)}m`;
  const hrs = Math.floor(minutes / 60);
  const mins = Math.round(minutes % 60);
  return `${hrs}h ${mins}m`;
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export function formatDateTime(dateStr: string): string {
  return new Date(dateStr).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}
