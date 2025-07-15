import { PrinterHealth, Alert } from "../types/printer";
import axios from "axios";

const API_URL = "http://localhost:5000/api";

interface MetricData {
  timestamp: number;
  value: number;
  type: string;
}

class PrinterDataService {
  private metrics: Map<string, MetricData[]> = new Map();

  async fetchPrinterHealth(printerId: string): Promise<PrinterHealth> {
    try {
      const response = await axios.get(
        `${API_URL}/printers/${printerId}/health`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching printer health:", error);
      throw new Error("Failed to fetch printer health data");
    }
  }

  async fetchAlerts(printerId: string): Promise<Alert[]> {
    try {
      const response = await axios.get(
        `${API_URL}/printers/${printerId}/alerts`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching alerts:", error);
      throw new Error("Failed to fetch printer alerts");
    }
  }

  analyzeHealth(printerId: string): Alert[] {
    const alerts: Alert[] = [];
    const printerMetrics = this.metrics.get(printerId) || [];

    // Example health analysis logic
    const recentTemperatures = printerMetrics.filter(
      (m) => m.type === "temperature" && Date.now() - m.timestamp < 3600000
    );

    if (recentTemperatures.length > 0) {
      const avgTemp =
        recentTemperatures.reduce((sum, m) => sum + m.value, 0) /
        recentTemperatures.length;

      if (avgTemp > 230) {
        alerts.push({
          id: `temp-high-${Date.now()}`,
          printerId,
          message: "High temperature detected",
          severity: "high",
          timestamp: new Date().toISOString(),
        });
      }

      if (avgTemp < 180) {
        alerts.push({
          id: `temp-low-${Date.now()}`,
          printerId,
          message: "Low temperature detected",
          severity: "medium",
          timestamp: new Date().toISOString(),
        });
      }
    }

    // Add vibration analysis
    const recentVibrations = printerMetrics.filter(
      (m) => m.type === "vibration" && Date.now() - m.timestamp < 1800000
    );

    if (recentVibrations.length > 0) {
      const avgVibration =
        recentVibrations.reduce((sum, m) => sum + m.value, 0) /
        recentVibrations.length;

      if (avgVibration > 2.5) {
        alerts.push({
          id: `vibration-${Date.now()}`,
          printerId,
          message: "High vibration levels detected",
          severity: "high",
          timestamp: new Date().toISOString(),
        });
      }
    }

    return alerts;
  }
}

export const printerDataService = new PrinterDataService();
export const { fetchPrinterHealth, fetchAlerts } = printerDataService;
