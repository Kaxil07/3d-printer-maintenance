import React, { useState, useEffect } from "react";
import axios from "axios";
import { PrinterAnalytics } from "../types/printer";

interface CostBenefitPanelProps {
  printerId: string;
}

const CostBenefitPanel: React.FC<CostBenefitPanelProps> = ({ printerId }) => {
  const [analytics, setAnalytics] = useState<PrinterAnalytics | null>(null);
  const [timeRange, setTimeRange] = useState<"day" | "week" | "month" | "year">(
    "month"
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadAnalytics();
  }, [printerId, timeRange]);

  const loadAnalytics = async () => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/printers/${printerId}/analytics?timeRange=${timeRange}`
      );
      setAnalytics(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error loading analytics:", error);
      setError("Failed to load analytics data");
      setLoading(false);
    }
  };

  if (loading) return <div>Loading analytics...</div>;
  if (error) return <div className="text-red-500">{error}</div>;
  if (!analytics) return <div>No analytics data available</div>;

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Cost-Benefit Analysis</h2>
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value as typeof timeRange)}
          className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        >
          <option value="day">Last 24 Hours</option>
          <option value="week">Last Week</option>
          <option value="month">Last Month</option>
          <option value="year">Last Year</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-medium mb-4">Costs</h3>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-500">Maintenance Costs</p>
              <p className="text-2xl font-semibold">
                ${analytics.maintenanceCosts.toFixed(2)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Downtime Costs</p>
              <p className="text-2xl font-semibold">
                ${analytics.downtimeCosts.toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-medium mb-4">Benefits</h3>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-500">
                Savings from Predictive Maintenance
              </p>
              <p className="text-2xl font-semibold text-green-600">
                ${analytics.savingsFromPredictive.toFixed(2)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Uptime Percentage</p>
              <p className="text-2xl font-semibold text-blue-600">
                {analytics.uptime.toFixed(1)}%
              </p>
            </div>
          </div>
        </div>

        <div className="col-span-1 md:col-span-2 bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-medium mb-4">Prevention Stats</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Predicted Issues</p>
              <p className="text-2xl font-semibold">
                {analytics.predictedIssues}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Prevented Issues</p>
              <p className="text-2xl font-semibold text-green-600">
                {analytics.preventedIssues}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CostBenefitPanel;
