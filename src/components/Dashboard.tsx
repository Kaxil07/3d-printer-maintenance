import React, { useState, useEffect } from "react";
import {
  Activity,
  AlertTriangle,
  Settings,
  TrendingUp,
  Wrench,
  Printer,
} from "lucide-react";
import { PredictionForm } from "./PredictionForm";
import HealthOverview from "./HealthOverview";
import AlertsPanel from "./AlertsPanel";
import MaintenancePanel from "./MaintenancePanel";
import CostBenefitPanel from "./CostBenefitPanel";
import { PredictionResult } from "../types/prediction";
import { printerDataService } from "../services/printerDataService";
import { printerManagementService } from "../services/printerManagementService";

const Dashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedPrinterId, setSelectedPrinterId] =
    useState<string>("printer-001");
  const [timeRange, setTimeRange] = useState<"week" | "month" | "year">("week");
  const [predictionResult, setPredictionResult] =
    useState<PredictionResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Get all available printers
  const printers = printerManagementService.getAllPrinters();

  useEffect(() => {
    const interval = setInterval(() => {
      // Force re-render to update data
      setActiveTab(activeTab);
    }, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, [activeTab]);

  const handlePredictionResult = (result: PredictionResult) => {
    console.log("Received prediction result:", result); // Debug log
    setPredictionResult(result);
    setError(null);
  };

  const handleError = (errorMessage: string) => {
    console.error("Prediction error:", errorMessage); // Debug log
    setError(errorMessage);
    setPredictionResult(null);
  };

  const tabs = [
    { id: "overview", label: "Overview", icon: Activity },
    { id: "alerts", label: "Alerts", icon: AlertTriangle },
    { id: "maintenance", label: "Maintenance", icon: Wrench },
    { id: "predict", label: "Predict", icon: TrendingUp },
    { id: "cost-benefit", label: "Cost-Benefit", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gray-100 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col space-y-6">
          {/* Printer Selection */}
          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="text-lg font-semibold mb-4">Select Printer</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {printers.map((printer) => (
                <button
                  key={printer.id}
                  onClick={() => setSelectedPrinterId(printer.id)}
                  className={`p-4 rounded-lg border transition-colors ${
                    selectedPrinterId === printer.id
                      ? "border-indigo-500 bg-indigo-50"
                      : "border-gray-200 hover:border-indigo-300"
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Printer className="w-5 h-5 text-gray-600" />
                    <div className="text-left">
                      <h3 className="font-medium">{printer.name}</h3>
                      <p className="text-sm text-gray-500">{printer.model}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {tabs.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={`
                    group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm
                    ${
                      activeTab === id
                        ? "border-indigo-500 text-indigo-600"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }
                  `}
                >
                  <Icon
                    className={`-ml-0.5 mr-2 h-5 w-5 ${
                      activeTab === id ? "text-indigo-500" : "text-gray-400"
                    }`}
                  />
                  {label}
                </button>
              ))}
            </nav>
          </div>

          {/* Content */}
          <div className="mt-6">
            {activeTab === "overview" && (
              <HealthOverview
                health={printerDataService.analyzeHealth(selectedPrinterId)}
                printerId={selectedPrinterId}
                onPrinterSelect={setSelectedPrinterId}
              />
            )}

            {activeTab === "alerts" && (
              <AlertsPanel
                alerts={printerManagementService.getMaintenanceAlerts()}
                selectedPrinterId={selectedPrinterId}
                onAcknowledge={(alertId) => {
                  printerManagementService.acknowledgeAlert(alertId);
                  setActiveTab(activeTab); // Force refresh
                }}
              />
            )}

            {activeTab === "maintenance" && (
              <MaintenancePanel
                printerId={selectedPrinterId}
                maintenanceHistory={printerManagementService.getMaintenanceHistory(
                  selectedPrinterId
                )}
                onScheduleMaintenance={(printerId, date, type) => {
                  printerManagementService.scheduleMaintenance(
                    printerId,
                    date,
                    type
                  );
                  setActiveTab(activeTab); // Force refresh
                }}
              />
            )}

            {activeTab === "predict" && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">
                  Print Settings Analysis
                </h2>
                <PredictionForm
                  onPredictionResult={handlePredictionResult}
                  onError={handleError}
                />
              </div>
            )}

            {activeTab === "cost-benefit" && (
              <CostBenefitPanel
                printerId={selectedPrinterId}
                analytics={printerManagementService.getAnalytics(
                  selectedPrinterId,
                  timeRange
                )}
                timeRange={timeRange}
                onTimeRangeChange={setTimeRange}
              />
            )}

            {/* Error and Prediction Results Display */}
            <div className="space-y-8 mt-6">
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg
                        className="h-5 w-5 text-red-400"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-red-800">
                        {error}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {predictionResult && (
                <>
                  <HealthOverview
                    wearFactor={predictionResult.wear_factor}
                    thermalStress={predictionResult.thermal_stress}
                  />

                  <AlertsPanel alerts={predictionResult.alerts} />

                  <MaintenancePanel
                    alerts={predictionResult.alerts}
                    wearFactor={predictionResult.wear_factor}
                  />
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
