export interface PrinterParameters {
  layer_height: number;
  wall_thickness: number;
  infill_density: number;
  infill_pattern: "grid" | "honeycomb";
  nozzle_temperature: number;
  bed_temperature: number;
  print_speed: number;
  material: "abs" | "pla";
  fan_speed: number;
}

export interface MaintenanceAlert {
  type: "critical" | "warning" | "info";
  message: string;
  component: string;
  priority: "critical" | "high" | "medium" | "low";
}

export interface MaintenancePrediction {
  maintenance_needed: boolean;
  confidence: number;
  alerts: MaintenanceAlert[];
  recommendations: string[];
}
