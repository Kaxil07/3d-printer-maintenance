import React, { useEffect, useState } from "react";
import { PrinterHealth } from "../types/printer";
import { fetchPrinterHealth } from "../services/printerDataService";

interface HealthOverviewProps {
  printerId: string;
}

const HealthOverview: React.FC<HealthOverviewProps> = ({ printerId }) => {
  const [health, setHealth] = useState<PrinterHealth | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadHealth = async () => {
      try {
        const healthData = await fetchPrinterHealth(printerId);
        setHealth(healthData);
        setLoading(false);
      } catch (error) {
        console.error("Error loading health data:", error);
        setError(
          error instanceof Error
            ? error.message
            : "Failed to load printer health data"
        );
        setLoading(false);
      }
    };

    loadHealth();
  }, [printerId]);

  if (loading) return <div>Loading health data...</div>;
  if (error) return <div className="text-red-500">{error}</div>;
  if (!health) return <div>No health data available</div>;

  const getHealthColor = (value: number) => {
    if (value >= 80) return "bg-green-500";
    if (value >= 60) return "bg-yellow-500";
    return "bg-red-500";
  };

  const getStatusColor = (value: number) => {
    if (value < 0.3) return "bg-green-100 text-green-800";
    if (value < 0.6) return "bg-yellow-100 text-yellow-800";
    return "bg-red-100 text-red-800";
  };

  const formatPercentage = (value: number) => `${Math.round(value * 100)}%`;

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold mb-4">Printer Health Overview</h2>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="col-span-2">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-700">Overall Health</span>
            <span
              className={`px-3 py-1 rounded-full text-white ${getHealthColor(
                health.overall
              )}`}
            >
              {health.overall}%
            </span>
          </div>
        </div>

        {Object.entries(health.components).map(([component, value]) => (
          <div key={component} className="bg-gray-50 p-4 rounded-md">
            <div className="flex items-center justify-between">
              <span className="text-gray-700 capitalize">{component}</span>
              <span
                className={`px-2 py-1 rounded-full text-white ${getHealthColor(
                  value
                )}`}
              >
                {value}%
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 rounded-lg bg-gray-50">
          <h3 className="text-sm font-medium text-gray-500 mb-2">
            Wear Factor
          </h3>
          <div
            className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
              health.wearFactor
            )}`}
          >
            {formatPercentage(health.wearFactor)}
          </div>
          <p className="mt-2 text-sm text-gray-600">
            {health.wearFactor < 0.3
              ? "Normal wear pattern"
              : health.wearFactor < 0.6
              ? "Moderate wear detected"
              : "High wear level - maintenance needed"}
          </p>
        </div>

        <div className="p-4 rounded-lg bg-gray-50">
          <h3 className="text-sm font-medium text-gray-500 mb-2">
            Thermal Stress
          </h3>
          <div
            className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
              health.thermalStress
            )}`}
          >
            {formatPercentage(health.thermalStress)}
          </div>
          <p className="mt-2 text-sm text-gray-600">
            {health.thermalStress < 0.3
              ? "Temperature within optimal range"
              : health.thermalStress < 0.6
              ? "Moderate thermal stress"
              : "High thermal stress - adjust settings"}
          </p>
        </div>
      </div>
    </div>
  );
};

export default HealthOverview;
