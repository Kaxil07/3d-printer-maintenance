import { useState, useEffect } from "react";
import { Printer } from "../types/printer";
import { AddPrinterForm } from "./AddPrinterForm";
import axios from "axios";

interface PrinterManagementProps {
  onPrinterSelect: (printer: Printer) => void;
  selectedPrinterId?: string;
}

const PrinterManagement = ({
  onPrinterSelect,
  selectedPrinterId,
}: PrinterManagementProps) => {
  const [printers, setPrinters] = useState<Printer[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadPrinters = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/printers");
      setPrinters(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error loading printers:", error);
      setError("Failed to load printers");
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPrinters();
  }, []);

  const handleAddPrinter = () => {
    setShowAddForm(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "printing":
        return "bg-blue-500";
      case "idle":
        return "bg-green-500";
      case "maintenance":
        return "bg-yellow-500";
      case "error":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  if (loading) return <div>Loading printers...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Select Printer</h2>
        <button
          onClick={handleAddPrinter}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
        >
          Add Printer
        </button>
      </div>

      <div className="space-y-2">
        {printers.map((printer) => (
          <div
            key={printer.id}
            onClick={() => onPrinterSelect(printer)}
            className={`p-4 rounded-lg border cursor-pointer transition-colors ${
              selectedPrinterId === printer.id
                ? "border-blue-500 bg-blue-50"
                : "border-gray-200 hover:border-blue-300"
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">{printer.name}</h3>
                <p className="text-sm text-gray-500">{printer.model}</p>
              </div>
              <div className="flex items-center space-x-2">
                <span
                  className={`px-2 py-1 text-xs font-medium text-white rounded-full ${getStatusColor(
                    printer.status
                  )}`}
                >
                  {printer.status}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showAddForm && (
        <AddPrinterForm
          onPrinterAdded={loadPrinters}
          onClose={() => setShowAddForm(false)}
        />
      )}
    </div>
  );
};

export default PrinterManagement;
