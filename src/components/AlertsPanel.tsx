import React from "react";
import { MaintenanceAlert } from "../types/printer";

interface AlertsPanelProps {
  alerts: MaintenanceAlert[];
}

const AlertsPanel: React.FC<AlertsPanelProps> = ({ alerts }) => {
  const getAlertStyle = (type: "warning" | "critical") => {
    switch (type) {
      case "critical":
        return "bg-red-50 border-red-200 text-red-700";
      case "warning":
        return "bg-yellow-50 border-yellow-200 text-yellow-700";
      default:
        return "bg-gray-50 border-gray-200 text-gray-700";
    }
  };

  const getPriorityBadgeStyle = (priority: string) => {
    switch (priority) {
      case "critical":
        return "bg-red-100 text-red-800";
      case "high":
        return "bg-orange-100 text-orange-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (alerts.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Alerts</h2>
        <p className="text-gray-600">
          No alerts found. Your printer settings look good!
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Alerts</h2>
      <div className="space-y-4">
        {alerts.map((alert, index) => (
          <div
            key={index}
            className={`border rounded-lg p-4 ${getAlertStyle(alert.type)}`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="font-medium">{alert.component}</span>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityBadgeStyle(
                      alert.priority
                    )}`}
                  >
                    {alert.priority.toUpperCase()}
                  </span>
                </div>
                <p className="text-sm">{alert.message}</p>
                {alert.maintenance_items &&
                  alert.maintenance_items.length > 0 && (
                    <div className="mt-3">
                      <h4 className="text-sm font-medium mb-2">
                        Recommended Actions:
                      </h4>
                      <ul className="list-disc list-inside text-sm space-y-1">
                        {alert.maintenance_items.map((item, itemIndex) => (
                          <li key={itemIndex}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AlertsPanel;
