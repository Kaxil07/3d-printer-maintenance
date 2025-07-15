import React, { useState, useEffect } from "react";
import axios from "axios";
import { MaintenanceSchedule } from "../types/printer";
import { MaintenanceAlert } from "../types/prediction";

interface MaintenancePanelProps {
  printerId: string;
  alerts: MaintenanceAlert[];
  wearFactor: number;
}

const MaintenancePanel: React.FC<MaintenancePanelProps> = ({
  printerId,
  alerts,
  wearFactor,
}) => {
  const [maintenanceHistory, setMaintenanceHistory] = useState<
    MaintenanceSchedule[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const [formData, setFormData] = useState({
    date: "",
    type: "routine",
    description: "",
    technician: "",
  });

  useEffect(() => {
    loadMaintenanceHistory();
  }, [printerId]);

  const loadMaintenanceHistory = async () => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/printers/${printerId}/maintenance`
      );
      setMaintenanceHistory(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error loading maintenance history:", error);
      setError("Failed to load maintenance history");
      setLoading(false);
    }
  };

  const handleScheduleMaintenance = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post(
        `http://localhost:5000/api/printers/${printerId}/maintenance`,
        formData
      );
      setShowScheduleForm(false);
      loadMaintenanceHistory();
    } catch (error) {
      console.error("Error scheduling maintenance:", error);
      setError("Failed to schedule maintenance");
    }
  };

  const getMaintenanceSchedule = () => {
    if (wearFactor < 0.3) {
      return "Regular maintenance schedule";
    } else if (wearFactor < 0.6) {
      return "Increased monitoring recommended";
    } else {
      return "Immediate maintenance required";
    }
  };

  const getPriorityActions = () => {
    const criticalAlerts = alerts.filter(
      (alert) => alert.priority === "critical"
    );
    const highPriorityAlerts = alerts.filter(
      (alert) => alert.priority === "high"
    );

    return [...criticalAlerts, ...highPriorityAlerts]
      .filter(
        (alert) => alert.maintenance_items && alert.maintenance_items.length > 0
      )
      .flatMap((alert) => alert.maintenance_items || []);
  };

  const priorityActions = getPriorityActions();

  if (loading) return <div>Loading maintenance history...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold">Maintenance</h2>
        <button
          onClick={() => setShowScheduleForm(true)}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
        >
          Schedule Maintenance
        </button>
      </div>

      {showScheduleForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-xl w-96">
            <h3 className="text-lg font-semibold mb-4">Schedule Maintenance</h3>
            <form onSubmit={handleScheduleMaintenance} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Date
                </label>
                <input
                  type="datetime-local"
                  value={formData.date}
                  onChange={(e) =>
                    setFormData({ ...formData, date: e.target.value })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Type
                </label>
                <select
                  value={formData.type}
                  onChange={(e) =>
                    setFormData({ ...formData, type: e.target.value })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="routine">Routine</option>
                  <option value="emergency">Emergency</option>
                  <option value="preventive">Preventive</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  rows={3}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Technician
                </label>
                <input
                  type="text"
                  value={formData.technician}
                  onChange={(e) =>
                    setFormData({ ...formData, technician: e.target.value })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowScheduleForm(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
                >
                  Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {maintenanceHistory.length === 0 ? (
          <p className="text-gray-500">No maintenance history available</p>
        ) : (
          maintenanceHistory.map((maintenance) => (
            <div key={maintenance.id} className="border rounded-lg p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium">{maintenance.type}</h3>
                  <p className="text-sm text-gray-500">
                    {new Date(maintenance.date).toLocaleString()}
                  </p>
                  <p className="mt-2">{maintenance.description}</p>
                </div>
                <span
                  className={`px-2 py-1 text-xs font-medium rounded-full ${
                    maintenance.status === "completed"
                      ? "bg-green-100 text-green-800"
                      : maintenance.status === "scheduled"
                      ? "bg-blue-100 text-blue-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {maintenance.status}
                </span>
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Technician: {maintenance.technician}
              </p>
            </div>
          ))
        )}
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Maintenance Recommendations
        </h2>

        <div className="space-y-6">
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-2">
              Current Status
            </h3>
            <p className="text-lg font-medium text-gray-900">
              {getMaintenanceSchedule()}
            </p>
          </div>

          {priorityActions.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">
                Priority Actions
              </h3>
              <ul className="space-y-2">
                {priorityActions.map((action, index) => (
                  <li key={index} className="flex items-start">
                    <span className="flex-shrink-0 h-5 w-5 text-blue-500">
                      <svg
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </span>
                    <span className="ml-2 text-gray-700">{action}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-2">
              Next Steps
            </h3>
            <div className="rounded-lg bg-blue-50 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-blue-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-blue-700">
                    {wearFactor >= 0.6
                      ? "Schedule maintenance as soon as possible to prevent potential issues."
                      : wearFactor >= 0.3
                      ? "Consider scheduling preventive maintenance in the next few days."
                      : "Continue with regular maintenance schedule."}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MaintenancePanel;
