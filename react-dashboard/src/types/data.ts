// ============================================================
// Data Types — Coal Operations Dashboard
// ============================================================

/** Raw production record from FCT_DAILY_PRODUCTION */
export interface ProductionRecord {
  PRODUCTION_ID: string;
  EXTRACTION_DATE: string;
  TONS_EXTRACTED: number;
  SHIFT_MANAGER: string;
  SITE_NAME: string;
  REGION: string;
  PRIMARY_COAL_TYPE: string;
}

/** Raw haulage record from FCT_HAULAGE_ANALYTICS */
export interface HaulageRecord {
  TRIP_ID: string;
  TRIP_START: string;
  TRIP_END: string;
  TONS_TRANSPORTED: number;
  FUEL_CONSUMED_LITERS: number;
  DESTINATION_YARD: string;
  EQUIPMENT_TYPE: string;
  MODEL: string;
  OPERATIONAL_STATUS: string;
  SITE_NAME: string;
  REGION: string;
  PRIMARY_COAL_TYPE: string;
}

/** API response shape from /api/data */
export interface DashboardApiResponse {
  production: ProductionRecord[];
  haulage: HaulageRecord[];
  meta: {
    fetchedAt: string;
    productionCount: number;
    haulageCount: number;
    queryTimeMs: number;
  };
}

/** API error response */
export interface ApiErrorResponse {
  error: string;
}

// ============================================================
// Computed Metric Types
// ============================================================

export interface KPIMetrics {
  totalExtraction: number;
  totalFuelConsumed: number;
  totalTrips: number;
  totalTonsTransported: number;
  avgFuelEfficiency: number; // tons per liter
  avgTripDurationMinutes: number;
  uniqueSites: number;
  uniqueEquipmentTypes: number;
  activeEquipmentCount: number;
  totalEquipmentCount: number;
}

export interface ChartDataPoint {
  name: string;
  value: number;
  label?: string;
}

export interface TimeSeriesPoint {
  date: string;
  value: number;
  label?: string;
}

export interface EfficiencyDataPoint {
  name: string;
  efficiency: number;
  totalTons: number;
  totalFuel: number;
  tripCount: number;
}

export interface ManagerPerformance {
  name: string;
  totalTons: number;
  shiftCount: number;
  avgTonsPerShift: number;
  topRegion: string;
}

export interface EquipmentStatusGroup {
  status: string;
  count: number;
  percentage: number;
}

export interface TripDurationStat {
  equipmentType: string;
  avgMinutes: number;
  minMinutes: number;
  maxMinutes: number;
  tripCount: number;
}

export interface DestinationBreakdown {
  yard: string;
  totalTons: number;
  tripCount: number;
  avgLoad: number;
}

/** Full computed analytics for the dashboard */
export interface DashboardAnalytics {
  kpis: KPIMetrics;
  productionByRegion: ChartDataPoint[];
  productionByCoalType: ChartDataPoint[];
  productionTimeSeries: TimeSeriesPoint[];
  fuelEfficiencyByEquipment: EfficiencyDataPoint[];
  equipmentStatus: EquipmentStatusGroup[];
  tripDurationStats: TripDurationStat[];
  topManagers: ManagerPerformance[];
  destinationBreakdown: DestinationBreakdown[];
  productionBySite: ChartDataPoint[];
}
