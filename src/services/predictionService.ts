import axios from "axios";
import { PredictionParams, PredictionResult } from "../types/prediction";

export interface PredictionResponse extends PredictionResult {}

const API_URL = "http://localhost:5001";

const MATERIAL_CONSTRAINTS = {
  PLA: {
    tempRange: [180, 220],
    bedTempRange: [50, 70],
    maxSpeed: 120,
    fanSpeedRange: [70, 100],
    layerHeightRange: [0.1, 0.3],
    wallThicknessRange: [0.4, 1.2],
  },
  ABS: {
    tempRange: [220, 250],
    bedTempRange: [95, 110],
    maxSpeed: 100,
    fanSpeedRange: [0, 30],
    layerHeightRange: [0.1, 0.3],
    wallThicknessRange: [0.4, 1.6],
  },
  PETG: {
    tempRange: [230, 250],
    bedTempRange: [75, 90],
    maxSpeed: 90,
    fanSpeedRange: [30, 50],
    layerHeightRange: [0.1, 0.3],
    wallThicknessRange: [0.4, 1.4],
  },
  TPU: {
    tempRange: [220, 235],
    bedTempRange: [30, 45],
    maxSpeed: 40,
    fanSpeedRange: [50, 70],
    layerHeightRange: [0.1, 0.25],
    wallThicknessRange: [0.8, 2.0],
  },
};

export const validatePredictionParams = (
  params: PredictionParams
): string[] => {
  const errors: string[] = [];

  // Material validation
  if (!["PLA", "ABS", "PETG", "TPU"].includes(params.material)) {
    errors.push(`Invalid material type: ${params.material}`);
  }

  // Temperature validations
  if (params.nozzle_temperature < 160 || params.nozzle_temperature > 300) {
    errors.push("Nozzle temperature must be between 160°C and 300°C");
  }

  if (params.bed_temperature < 0 || params.bed_temperature > 120) {
    errors.push("Bed temperature must be between 0°C and 120°C");
  }

  // Speed and fan validations
  if (params.print_speed < 10 || params.print_speed > 150) {
    errors.push("Print speed must be between 10mm/s and 150mm/s");
  }

  if (params.fan_speed < 0 || params.fan_speed > 100) {
    errors.push("Fan speed must be between 0% and 100%");
  }

  // Dimensions validations
  if (params.layer_height < 0.05 || params.layer_height > 0.4) {
    errors.push("Layer height must be between 0.05mm and 0.4mm");
  }

  if (params.wall_thickness < 0.4 || params.wall_thickness > 2) {
    errors.push("Wall thickness must be between 0.4mm and 2mm");
  }

  if (params.nozzle_diameter < 0.2 || params.nozzle_diameter > 1) {
    errors.push("Nozzle diameter must be between 0.2mm and 1mm");
  }

  // Infill validations
  if (params.infill_density < 0 || params.infill_density > 100) {
    errors.push("Infill density must be between 0% and 100%");
  }

  if (
    !["grid", "triangles", "gyroid", "honeycomb"].includes(
      params.infill_pattern
    )
  ) {
    errors.push("Invalid infill pattern");
  }

  return errors;
};

export const getPrediction = async (
  params: PredictionParams
): Promise<PredictionResult> => {
  try {
    console.log("Starting prediction request...");
    const validationErrors = validatePredictionParams(params);
    if (validationErrors.length > 0) {
      console.error("Validation errors:", validationErrors);
      throw new Error(validationErrors.join("\n"));
    }

    console.log("Sending prediction request to:", `${API_URL}/predict`);
    console.log("Request params:", params);
    const response = await axios.post(`${API_URL}/predict`, params);
    console.log("Raw response:", response);
    console.log("Response data:", response.data);

    if (!response.data) {
      throw new Error("No response data from prediction service");
    }

    // Handle potential error message from backend
    if (response.data.error) {
      console.warn("Backend warning:", response.data.error);
      if (response.data.details) {
        console.warn("Details:", response.data.details);
      }
    }

    return {
      wear_factor: response.data.wear_factor || 0,
      thermal_stress: response.data.thermal_stress || 0,
      alerts: response.data.alerts || [],
    };
  } catch (error) {
    console.error("Prediction error:", error);
    if (axios.isAxiosError(error)) {
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      } else {
        throw new Error(
          "Failed to connect to the prediction service. Please make sure the server is running."
        );
      }
    }
    throw error;
  }
};

export const getMaintenanceSchedule = async (params: PredictionParams) => {
  try {
    const response = await axios.post(
      `${API_URL}/maintenance-schedule`,
      params
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.data?.error) {
      throw new Error(error.response.data.error);
    }
    throw new Error("Failed to get maintenance schedule. Please try again.");
  }
};
