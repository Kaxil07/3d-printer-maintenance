export interface PrinterMetrics {
  id: string;
  timestamp: number;
  extruderTemp: number;
  extruderTargetTemp: number;
  bedTemp: number;
  bedTargetTemp: number;
  motorVibrationX: number;
  motorVibrationY: number;
  motorVibrationZ: number;
  motorSpeedX: number;
  motorSpeedY: number;
  motorSpeedZ: number;
  filamentFlowRate: number;
  printHeadAccuracyX: number;
  printHeadAccuracyY: number;
  powerConsumption: number;
  ambientTemp: number;
  humidity: number;
  printProgress: number;
  isActive: boolean;
}

export interface PrinterParameters {
  layer_height: number;
  wall_thickness: number;
  infill_density: number;
  infill_pattern: string;
  nozzle_temperature: number;
  bed_temperature: number;
  print_speed: number;
  material: string;
  fan_speed: number;
}

export interface Printer {
  id: string;
  name: string;
  model: string;
  lastMaintenance: string;
  totalPrintHours: number;
  status: "operational" | "maintenance" | "error";
  currentParameters?: {
    material: string;
    temperature: number;
    printSpeed: number;
  };
}

export interface PrinterStats {
  totalPrints: number;
  successfulPrints: number;
  failedPrints: number;
  maintenanceCount: number;
  uptime: number;
  lastMaintenanceDate: string;
}

export interface MaintenanceAlert {
  type: "warning" | "critical";
  component: string;
  message: string;
  priority: "low" | "medium" | "high" | "critical";
  maintenance_items?: string[];
}

export interface PrinterHealth {
  status: "operational" | "maintenance" | "error";
  lastMaintenance: string;
  nextMaintenance: string;
  healthScore: number;
  issues: string[];
}

export interface MaintenanceSchedule {
  id: string;
  printerId: string;
  date: string;
  type: string;
  description: string;
  technician: string;
  status: "scheduled" | "completed" | "pending";
}

export interface Alert {
  id: string;
  printerId: string;
  message: string;
  severity: "low" | "medium" | "high";
  timestamp: string;
  acknowledged?: boolean;
}

export interface PrinterAnalytics {
  maintenanceCosts: number;
  downtimeCosts: number;
  savingsFromPredictive: number;
  predictedIssues: number;
  preventedIssues: number;
  uptime: number;
}

export interface MaintenanceRecommendation {
  id: string;
  printerId: string;
  component: string;
  action: string;
  priority: "low" | "medium" | "high" | "critical";
  estimatedCost: number;
  estimatedTime: number;
  dueDate: number;
  description: string;
  benefits: string[];
}

export interface ComponentLifespan {
  component: string;
  currentUsage: number;
  estimatedLifespan: number;
  remainingLife: number;
  confidenceLevel: number;
  lastReplaced?: number;
}

export interface CostBenefit {
  maintenanceCostSavings: number;
  uptimeImprovement: number;
  qualityImprovement: number;
  lifespanExtension: number;
  totalSavings: number;
  roi: number;
}
