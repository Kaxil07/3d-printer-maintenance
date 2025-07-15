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

export interface PredictionParams {
  material: "PLA" | "ABS" | "PETG" | "TPU";
  nozzle_temperature: number;
  bed_temperature: number;
  print_speed: number;
  fan_speed: number;
  layer_height: number;
  wall_thickness: number;
  nozzle_diameter: number;
  print_time: number;
  infill_density: number;
  infill_pattern: "grid" | "triangles" | "gyroid" | "honeycomb";
}

export interface MaintenanceAlert {
  type: "warning" | "critical";
  message: string;
  component: string;
  priority: "low" | "medium" | "high" | "critical";
  maintenance_items?: string[];
}

export interface PredictionResult {
  wear_factor: number;
  thermal_stress: number;
  alerts: MaintenanceAlert[];
}

export interface MaintenanceSchedule {
  next_maintenance: Date;
  recommended_actions: string[];
  component_status: {
    nozzle: number;
    extruder: number;
    bed: number;
    belts: number;
  };
}

export interface MaintenancePrediction {
  isLoading: boolean;
  error: string | null;
  result: PredictionResult | null;
}
