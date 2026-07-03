"use client";

import { useState, useCallback } from "react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useDashboardData } from "@/hooks/useDashboardData";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Header } from "@/components/dashboard/Header";
import { MetricCard, MetricCardSkeleton } from "@/components/dashboard/MetricCard";
import { ChartCard, ChartCardSkeleton } from "@/components/dashboard/ChartCard";
import {
  DataTable,
  DataTableSkeleton,
  managerColumns,
  equipmentStatusColumns,
} from "@/components/dashboard/DataTable";
import { formatNumber, formatDuration, formatDate } from "@/lib/analytics";
import {
  CHART_COLORS,
  CHART_PALETTE,
  CHART_TOOLTIP_STYLE,
  CHART_GRID_STYLE,
  CHART_AXIS_STYLE,
  CHART_ANIMATION,
} from "@/lib/chart-theme";
import {
  Pickaxe,
  Truck,
  Fuel,
  Timer,
  Gauge,
  MapPin,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

// Recharts imports
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

// ============================================================
// Dashboard — Main Page
// ============================================================

export default function Dashboard() {
  const {
    analytics,
    production,
    isLoading,
    error,
    lastUpdated,
    queryTimeMs,
    refresh,
    isRefreshing,
  } = useDashboardData();

  const [activeSection, setActiveSection] = useState("overview");

  const handleRefresh = useCallback(() => {
    refresh();
    toast.info("Refreshing data from Snowflake...");
  }, [refresh]);

  const handleSectionChange = useCallback((id: string) => {
    setActiveSection(id);
    const el = document.getElementById(`section-${id}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, []);

  // ── Error State ──────────────────────────────────────────
  if (error && !analytics) {
    return (
      <TooltipProvider>
        <div className="flex h-screen items-center justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center gap-4 text-center max-w-md px-6"
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-destructive/10">
              <AlertCircle className="h-7 w-7 text-destructive" />
            </div>
            <h2 className="text-xl font-semibold">Connection Error</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {error}
            </p>
            <button
              onClick={handleRefresh}
              className="mt-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              Try Again
            </button>
          </motion.div>
        </div>
      </TooltipProvider>
    );
  }

  // ── Main Layout ──────────────────────────────────────────
  return (
    <TooltipProvider>
      <div className="flex h-screen overflow-hidden">
        <Sidebar
          activeSection={activeSection}
          onSectionChange={handleSectionChange}
        />

        <main className="flex-1 overflow-y-auto">
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <Header
              title="Coal Operations Command Center"
              subtitle="Real-time telemetry and production analytics · Snowflake → dbt → Next.js"
              lastUpdated={lastUpdated}
              queryTimeMs={queryTimeMs}
              onRefresh={handleRefresh}
              isRefreshing={isRefreshing}
            />

            {isLoading ? (
              <LoadingSkeleton />
            ) : analytics ? (
              <DashboardContent analytics={analytics} production={production} />
            ) : null}
          </div>
        </main>
      </div>
    </TooltipProvider>
  );
}

// ============================================================
// Dashboard Content — All sections
// ============================================================

import type { DashboardAnalytics } from "@/types/data";
import type { ProductionRecord } from "@/types/data";

interface DashboardContentProps {
  analytics: DashboardAnalytics;
  production: ProductionRecord[];
}

function DashboardContent({ analytics, production }: DashboardContentProps) {
  const { kpis } = analytics;

  // Sparkline data from time series
  const sparkData = analytics.productionTimeSeries.map((p) => p.value);

  return (
    <div className="space-y-8">
      {/* ── Overview KPIs ─────────────────────────────────── */}
      <section id="section-overview" aria-label="Key Performance Indicators">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          <MetricCard
            title="Total Extraction"
            value={kpis.totalExtraction}
            unit="Tons"
            icon={Pickaxe}
            accentColor="blue"
            trend={sparkData}
            formatter={(n) => formatNumber(n)}
            delay={0}
          />
          <MetricCard
            title="Fleet Trips"
            value={kpis.totalTrips}
            icon={Truck}
            accentColor="emerald"
            description={`${kpis.uniqueEquipmentTypes} equipment types`}
            delay={1}
          />
          <MetricCard
            title="Fuel Efficiency"
            value={kpis.avgFuelEfficiency}
            unit="T/L"
            icon={Gauge}
            accentColor="violet"
            decimals={2}
            description="Tons transported per liter"
            delay={2}
          />
          <MetricCard
            title="Fuel Consumed"
            value={kpis.totalFuelConsumed}
            unit="L"
            icon={Fuel}
            accentColor="amber"
            formatter={(n) => formatNumber(n)}
            delay={3}
          />
          <MetricCard
            title="Avg Trip Duration"
            value={kpis.avgTripDurationMinutes}
            icon={Timer}
            accentColor="rose"
            formatter={(n) => formatDuration(n)}
            delay={4}
          />
        </div>
      </section>

      {/* ── Production Analytics ──────────────────────────── */}
      <section id="section-production" aria-label="Production Analytics">
        <SectionTitle
          title="Production Analytics"
          description="Extraction performance across regions, sites, and time"
        />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Daily Production Trend — Full width area chart */}
          <ChartCard
            title="Daily Production Trend"
            description="Tons extracted over time"
            className="lg:col-span-2"
            delay={5}
          >
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={analytics.productionTimeSeries}
                  margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient
                      id="productionGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="0%"
                        stopColor={CHART_COLORS.blue}
                        stopOpacity={0.3}
                      />
                      <stop
                        offset="100%"
                        stopColor={CHART_COLORS.blue}
                        stopOpacity={0}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid {...CHART_GRID_STYLE} />
                  <XAxis
                    dataKey="date"
                    {...CHART_AXIS_STYLE}
                    tickFormatter={(d) => formatDate(d)}
                  />
                  <YAxis {...CHART_AXIS_STYLE} />
                  <Tooltip
                    contentStyle={CHART_TOOLTIP_STYLE}
                    formatter={(value) => [
                      `${formatNumber(Number(value))} tons`,
                      "Extraction",
                    ]}
                    labelFormatter={(label) => formatDate(label as string)}
                  />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke={CHART_COLORS.blue}
                    strokeWidth={2}
                    fill="url(#productionGradient)"
                    animationDuration={CHART_ANIMATION.duration}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>

          {/* Coal Type Distribution — Donut chart */}
          <ChartCard
            title="Coal Type Distribution"
            description="Production by coal variety"
            delay={6}
          >
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={analytics.productionByCoalType}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                    animationDuration={CHART_ANIMATION.duration}
                  >
                    {analytics.productionByCoalType.map((_, index) => (
                      <Cell
                        key={`coal-${index}`}
                        fill={CHART_PALETTE[index % CHART_PALETTE.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={CHART_TOOLTIP_STYLE}
                    formatter={(value) => [
                      `${formatNumber(Number(value))} tons`,
                      "Extracted",
                    ]}
                  />
                  <Legend
                    iconType="circle"
                    iconSize={8}
                    wrapperStyle={{ fontSize: "11px", color: "#a1a1aa" }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>
        </div>

        {/* Production by Region — Horizontal bar chart */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
          <ChartCard
            title="Extraction by Region"
            description="Total tons extracted per mining region"
            delay={7}
          >
            <div className="h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={analytics.productionByRegion}
                  layout="vertical"
                  margin={{ top: 0, right: 10, left: 0, bottom: 0 }}
                >
                  <CartesianGrid
                    {...CHART_GRID_STYLE}
                    horizontal={false}
                    vertical={true}
                  />
                  <XAxis type="number" {...CHART_AXIS_STYLE} />
                  <YAxis
                    type="category"
                    dataKey="name"
                    {...CHART_AXIS_STYLE}
                    width={100}
                  />
                  <Tooltip
                    contentStyle={CHART_TOOLTIP_STYLE}
                    formatter={(value) => [
                      `${formatNumber(Number(value))} tons`,
                      "Extracted",
                    ]}
                  />
                  <Bar
                    dataKey="value"
                    fill={CHART_COLORS.blue}
                    radius={[0, 4, 4, 0]}
                    animationDuration={CHART_ANIMATION.duration}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>

          <ChartCard
            title="Production by Site"
            description="Total tons extracted per mine site"
            delay={8}
          >
            <div className="h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={analytics.productionBySite}
                  margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                >
                  <CartesianGrid {...CHART_GRID_STYLE} />
                  <XAxis
                    dataKey="name"
                    {...CHART_AXIS_STYLE}
                    angle={-30}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis {...CHART_AXIS_STYLE} />
                  <Tooltip
                    contentStyle={CHART_TOOLTIP_STYLE}
                    formatter={(value) => [
                      `${formatNumber(Number(value))} tons`,
                      "Extracted",
                    ]}
                  />
                  <Bar
                    dataKey="value"
                    fill={CHART_COLORS.emerald}
                    radius={[4, 4, 0, 0]}
                    animationDuration={CHART_ANIMATION.duration}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>
        </div>
      </section>

      {/* ── Fleet & Operations ────────────────────────────── */}
      <section id="section-fleet" aria-label="Fleet & Operations">
        <SectionTitle
          title="Fleet & Operations"
          description="Equipment performance, fuel efficiency, and logistics"
        />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Fuel Efficiency by Equipment */}
          <ChartCard
            title="Fuel Efficiency by Equipment"
            description="Tons transported per liter of fuel"
            delay={9}
          >
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={analytics.fuelEfficiencyByEquipment}
                  margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                >
                  <CartesianGrid {...CHART_GRID_STYLE} />
                  <XAxis dataKey="name" {...CHART_AXIS_STYLE} />
                  <YAxis {...CHART_AXIS_STYLE} />
                  <Tooltip
                    contentStyle={CHART_TOOLTIP_STYLE}
                    formatter={(value, name) => {
                      if (name === "efficiency")
                        return [`${Number(value).toFixed(2)} T/L`, "Efficiency"];
                      return [formatNumber(Number(value)), String(name)];
                    }}
                  />
                  <Bar
                    dataKey="efficiency"
                    fill={CHART_COLORS.violet}
                    radius={[4, 4, 0, 0]}
                    animationDuration={CHART_ANIMATION.duration}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>

          {/* Destination Yard Breakdown */}
          <ChartCard
            title="Destination Yards"
            description="Tons delivered to each yard"
            delay={10}
          >
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={analytics.destinationBreakdown}
                  layout="vertical"
                  margin={{ top: 0, right: 10, left: 0, bottom: 0 }}
                >
                  <CartesianGrid
                    {...CHART_GRID_STYLE}
                    horizontal={false}
                    vertical={true}
                  />
                  <XAxis type="number" {...CHART_AXIS_STYLE} />
                  <YAxis
                    type="category"
                    dataKey="yard"
                    {...CHART_AXIS_STYLE}
                    width={100}
                  />
                  <Tooltip
                    contentStyle={CHART_TOOLTIP_STYLE}
                    formatter={(value, name) => {
                      if (name === "totalTons")
                        return [`${formatNumber(Number(value))} tons`, "Delivered"];
                      if (name === "tripCount")
                        return [value, "Trips"];
                      return [formatNumber(Number(value)), String(name)];
                    }}
                  />
                  <Bar
                    dataKey="totalTons"
                    fill={CHART_COLORS.amber}
                    radius={[0, 4, 4, 0]}
                    animationDuration={CHART_ANIMATION.duration}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>
        </div>

        {/* Equipment Status */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
          <ChartCard
            title="Equipment Fleet Status"
            description="Operational status distribution"
            delay={11}
          >
            <div className="h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={analytics.equipmentStatus.map((s) => ({
                      name: s.status,
                      value: s.count,
                    }))}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={70}
                    paddingAngle={4}
                    dataKey="value"
                    animationDuration={CHART_ANIMATION.duration}
                  >
                    {analytics.equipmentStatus.map((_, index) => (
                      <Cell
                        key={`status-${index}`}
                        fill={
                          [
                            CHART_COLORS.emerald,
                            CHART_COLORS.amber,
                            CHART_COLORS.rose,
                            CHART_COLORS.cyan,
                          ][index % 4]
                        }
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={CHART_TOOLTIP_STYLE}
                    formatter={(value) => [value, "Units"]}
                  />
                  <Legend
                    iconType="circle"
                    iconSize={8}
                    wrapperStyle={{ fontSize: "11px", color: "#a1a1aa" }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>

          <ChartCard
            title="Equipment Status Breakdown"
            description="Detailed status with utilization rates"
            delay={12}
          >
            <DataTable
              columns={equipmentStatusColumns}
              data={analytics.equipmentStatus}
              emptyMessage="No equipment data"
            />
          </ChartCard>
        </div>
      </section>

      {/* ── Analytics & Insights ──────────────────────────── */}
      <section id="section-analytics" aria-label="Analytics & Insights">
        <SectionTitle
          title="Analytics & Insights"
          description="Performance rankings, trip analysis, and operational intelligence"
        />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Trip Duration Stats */}
          <ChartCard
            title="Trip Duration by Equipment"
            description="Average trip time in minutes per equipment type"
            delay={13}
          >
            <div className="h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={analytics.tripDurationStats}
                  margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                >
                  <CartesianGrid {...CHART_GRID_STYLE} />
                  <XAxis dataKey="equipmentType" {...CHART_AXIS_STYLE} />
                  <YAxis {...CHART_AXIS_STYLE} />
                  <Tooltip
                    contentStyle={CHART_TOOLTIP_STYLE}
                    formatter={(value, name) => {
                      if (name === "avgMinutes")
                        return [formatDuration(Number(value)), "Avg Duration"];
                      if (name === "minMinutes")
                        return [formatDuration(Number(value)), "Min"];
                      if (name === "maxMinutes")
                        return [formatDuration(Number(value)), "Max"];
                      return [value, String(name)];
                    }}
                  />
                  <Bar
                    dataKey="avgMinutes"
                    fill={CHART_COLORS.cyan}
                    radius={[4, 4, 0, 0]}
                    animationDuration={CHART_ANIMATION.duration}
                    name="avgMinutes"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>

          {/* Recent Activity */}
          <ChartCard
            title="Recent Production Activity"
            description="Latest extraction records from the pit"
            delay={14}
          >
            <div className="space-y-2">
              {production.slice(0, 6).map((row, i) => (
                <motion.div
                  key={row.PRODUCTION_ID || i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center justify-between py-2 px-2 rounded-lg hover:bg-muted/30 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/10 flex-shrink-0">
                      <MapPin className="h-3.5 w-3.5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {row.SITE_NAME}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {row.SHIFT_MANAGER} · {row.REGION}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-emerald-400 font-mono tabular-nums">
                      +{formatNumber(row.TONS_EXTRACTED)} T
                    </p>
                    <p className="text-xs text-muted-foreground font-mono tabular-nums">
                      {formatDate(row.EXTRACTION_DATE)}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </ChartCard>
        </div>
      </section>

      {/* ── People ────────────────────────────────────────── */}
      <section id="section-people" aria-label="People & Performance">
        <SectionTitle
          title="People & Performance"
          description="Shift manager rankings and productivity metrics"
        />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <ChartCard
            title="Top Shift Managers"
            description="Ranked by total tons extracted"
            delay={15}
          >
            <DataTable
              columns={managerColumns}
              data={analytics.topManagers.slice(0, 8)}
              emptyMessage="No production data"
            />
          </ChartCard>

          {/* Manager Performance Chart */}
          <ChartCard
            title="Manager Productivity"
            description="Average tons per shift by manager"
            delay={16}
          >
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={analytics.topManagers.slice(0, 8)}
                  layout="vertical"
                  margin={{ top: 0, right: 10, left: 0, bottom: 0 }}
                >
                  <CartesianGrid
                    {...CHART_GRID_STYLE}
                    horizontal={false}
                    vertical={true}
                  />
                  <XAxis type="number" {...CHART_AXIS_STYLE} />
                  <YAxis
                    type="category"
                    dataKey="name"
                    {...CHART_AXIS_STYLE}
                    width={100}
                  />
                  <Tooltip
                    contentStyle={CHART_TOOLTIP_STYLE}
                    formatter={(value) => [
                      `${formatNumber(Number(value), 1)} tons/shift`,
                      "Productivity",
                    ]}
                  />
                  <Bar
                    dataKey="avgTonsPerShift"
                    fill={CHART_COLORS.emerald}
                    radius={[0, 4, 4, 0]}
                    animationDuration={CHART_ANIMATION.duration}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>
        </div>
      </section>

      {/* Footer spacer */}
      <div className="h-8" />
    </div>
  );
}

// ============================================================
// Section Title Component
// ============================================================

function SectionTitle({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div className="mb-4">
      <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
      {description && (
        <p className="text-sm text-muted-foreground mt-0.5">{description}</p>
      )}
    </div>
  );
}

// ============================================================
// Loading Skeleton
// ============================================================

function LoadingSkeleton() {
  return (
    <div className="space-y-8">
      {/* KPI Skeletons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <MetricCardSkeleton key={i} />
        ))}
      </div>

      {/* Chart Skeletons */}
      <div>
        <div className="mb-4 space-y-1">
          <div className="h-5 w-48 bg-muted rounded animate-pulse" />
          <div className="h-4 w-72 bg-muted/50 rounded animate-pulse" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <ChartCardSkeleton height={280} />
          </div>
          <ChartCardSkeleton height={280} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartCardSkeleton height={260} />
        <ChartCardSkeleton height={260} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-xl border border-border bg-card p-5">
          <DataTableSkeleton rows={5} />
        </div>
        <ChartCardSkeleton height={280} />
      </div>
    </div>
  );
}
