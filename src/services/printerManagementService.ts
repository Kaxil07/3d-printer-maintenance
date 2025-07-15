import {
  Printer,
  MaintenanceHistory,
  MaintenanceAlert,
  Analytics,
} from "../types/printer";

export const printerManagementService = {
  getAllPrinters: (): Printer[] => {
    return [
      {
        id: "printer-001",
        name: "Printer 1",
        model: "Ender 3 Pro",
        lastMaintenance: new Date(
          Date.now() - 7 * 24 * 60 * 60 * 1000
        ).toISOString(),
        totalPrintHours: 256,
        status: "operational",
        currentParameters: {
          material: "PLA",
          temperature: 200,
          printSpeed: 60,
        },
      },
      {
        id: "printer-002",
        name: "Printer 2",
        model: "Prusa i3 MK3S+",
        lastMaintenance: new Date(
          Date.now() - 14 * 24 * 60 * 60 * 1000
        ).toISOString(),
        totalPrintHours: 432,
        status: "operational",
        currentParameters: {
          material: "PETG",
          temperature: 240,
          printSpeed: 45,
        },
      },
      {
        id: "printer-003",
        name: "Printer 3",
        model: "Ultimaker S5",
        lastMaintenance: new Date(
          Date.now() - 3 * 24 * 60 * 60 * 1000
        ).toISOString(),
        totalPrintHours: 128,
        status: "maintenance",
        currentParameters: {
          material: "ABS",
          temperature: 245,
          printSpeed: 50,
        },
      },
    ];
  },

  getMaintenanceAlerts: (): MaintenanceAlert[] => {
    return [
      {
        type: "warning",
        component: "Nozzle",
        message: "Nozzle wear detected",
        priority: "high",
        maintenance_items: ["Clean nozzle", "Check for wear"],
      },
      {
        type: "critical",
        component: "Extruder",
        message: "Extruder skipping detected",
        priority: "critical",
        maintenance_items: ["Check extruder tension", "Clean extruder gear"],
      },
    ];
  },

  getMaintenanceHistory: (printerId: string): MaintenanceHistory[] => {
    return [
      {
        id: "maint-001",
        printerId,
        date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        type: "routine",
        description: "Regular maintenance check",
        technician: "John Doe",
        status: "completed",
      },
      {
        id: "maint-002",
        printerId,
        date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        type: "preventive",
        description: "Scheduled nozzle replacement",
        technician: "Jane Smith",
        status: "scheduled",
      },
    ];
  },

  acknowledgeAlert: (alertId: string): void => {
    console.log("Alert acknowledged:", alertId);
  },

  scheduleMaintenance: (
    printerId: string,
    date: string,
    type: string
  ): void => {
    console.log("Maintenance scheduled:", { printerId, date, type });
  },

  getAnalytics: (
    printerId: string,
    timeRange: "week" | "month" | "year"
  ): Analytics => {
    // Mock data - in a real app this would be calculated based on historical data
    const multiplier =
      timeRange === "week" ? 1 : timeRange === "month" ? 4 : 52;
    return {
      maintenanceCosts: 250 * multiplier,
      downtimeCosts: 150 * multiplier,
      savingsFromPredictive: 400 * multiplier,
      predictedIssues: 5 * multiplier,
      preventedIssues: 3 * multiplier,
      uptime: 0.95,
    };
  },
};
