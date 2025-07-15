import { PrinterParameters, MaintenancePrediction } from "../types/maintenance";

class MaintenanceService {
  private readonly API_URL = "http://localhost:5000";

  async predictMaintenance(
    params: PrinterParameters
  ): Promise<MaintenancePrediction> {
    try {
      const response = await fetch(`${this.API_URL}/predict`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(params),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Failed to predict maintenance:", error);
      throw error;
    }
  }

  async checkHealth(): Promise<boolean> {
    try {
      const response = await fetch(`${this.API_URL}/health`);
      return response.ok;
    } catch (error) {
      console.error("Health check failed:", error);
      return false;
    }
  }
}

export const maintenanceService = new MaintenanceService();
