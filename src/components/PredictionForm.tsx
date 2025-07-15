import React, { useState } from "react";
import {
  getPrediction,
  validatePredictionParams,
} from "../services/predictionService";
import { PredictionParams, PredictionResult } from "../types/prediction";

interface PredictionFormProps {
  onPredictionResult: (result: PredictionResult) => void;
  onError: (error: string) => void;
}

const MATERIAL_OPTIONS = ["PLA", "ABS", "PETG", "TPU"] as const;
const INFILL_PATTERNS = ["grid", "triangles", "gyroid", "honeycomb"] as const;

const DEFAULT_VALUES = {
  PLA: {
    nozzle_temperature: 200,
    bed_temperature: 60,
    fan_speed: 100,
    print_speed: 60,
    infill_density: 20,
    infill_pattern: "grid" as const,
  },
  ABS: {
    nozzle_temperature: 235,
    bed_temperature: 100,
    fan_speed: 20,
    print_speed: 50,
    infill_density: 30,
    infill_pattern: "triangles" as const,
  },
  PETG: {
    nozzle_temperature: 240,
    bed_temperature: 80,
    fan_speed: 40,
    print_speed: 45,
    infill_density: 25,
    infill_pattern: "grid" as const,
  },
  TPU: {
    nozzle_temperature: 225,
    bed_temperature: 35,
    fan_speed: 60,
    print_speed: 25,
    infill_density: 15,
    infill_pattern: "gyroid" as const,
  },
};

export const PredictionForm: React.FC<PredictionFormProps> = ({
  onPredictionResult,
  onError,
}) => {
  const [formData, setFormData] = useState<PredictionParams>({
    material: "PLA",
    nozzle_temperature: 200,
    bed_temperature: 60,
    print_speed: 60,
    fan_speed: 100,
    layer_height: 0.2,
    wall_thickness: 0.8,
    nozzle_diameter: 0.4,
    print_time: 0,
    infill_density: 20,
    infill_pattern: "grid",
  });

  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleMaterialChange = (
    material: (typeof MATERIAL_OPTIONS)[number]
  ) => {
    const defaultValues = DEFAULT_VALUES[material];
    setFormData((prev) => ({
      ...prev,
      material,
      ...defaultValues,
    }));
    validateForm({ ...formData, material, ...defaultValues });
  };

  const validateForm = (data: PredictionParams) => {
    const errors = validatePredictionParams(data);
    setValidationErrors(errors);
    return errors.length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const newValue =
      name === "print_time" ? parseInt(value) : parseFloat(value);
    const newFormData = { ...formData, [name]: newValue };
    setFormData(newFormData);
    validateForm(newFormData);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    console.log("Form submitted with data:", formData);

    try {
      if (!validateForm(formData)) {
        console.log("Validation failed");
        onError("Please fix validation errors before submitting.");
        setIsSubmitting(false);
        return;
      }

      console.log("Calling getPrediction...");
      const result = await getPrediction(formData);
      console.log("Received prediction result:", result);
      onPredictionResult(result);
    } catch (error) {
      console.error("Error in handleSubmit:", error);
      onError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 p-4 bg-white rounded-lg shadow"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Material
          </label>
          <select
            value={formData.material}
            onChange={(e) =>
              handleMaterialChange(
                e.target.value as (typeof MATERIAL_OPTIONS)[number]
              )
            }
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          >
            {MATERIAL_OPTIONS.map((material) => (
              <option key={material} value={material}>
                {material}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Nozzle Temperature (°C)
          </label>
          <input
            type="number"
            name="nozzle_temperature"
            value={formData.nozzle_temperature}
            onChange={handleInputChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Bed Temperature (°C)
          </label>
          <input
            type="number"
            name="bed_temperature"
            value={formData.bed_temperature}
            onChange={handleInputChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Print Speed (mm/s)
          </label>
          <input
            type="number"
            name="print_speed"
            value={formData.print_speed}
            onChange={handleInputChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Fan Speed (%)
          </label>
          <input
            type="number"
            name="fan_speed"
            value={formData.fan_speed}
            onChange={handleInputChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Layer Height (mm)
          </label>
          <input
            type="number"
            name="layer_height"
            value={formData.layer_height}
            step="0.05"
            onChange={handleInputChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Wall Thickness (mm)
          </label>
          <input
            type="number"
            name="wall_thickness"
            value={formData.wall_thickness}
            step="0.1"
            onChange={handleInputChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Nozzle Diameter (mm)
          </label>
          <input
            type="number"
            name="nozzle_diameter"
            value={formData.nozzle_diameter}
            step="0.1"
            onChange={handleInputChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Print Time (hours)
          </label>
          <input
            type="number"
            name="print_time"
            value={formData.print_time}
            onChange={handleInputChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Infill Density (%)
          </label>
          <input
            type="number"
            name="infill_density"
            value={formData.infill_density}
            onChange={handleInputChange}
            min="0"
            max="100"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Infill Pattern
          </label>
          <select
            name="infill_pattern"
            value={formData.infill_pattern}
            onChange={(e) =>
              setFormData({
                ...formData,
                infill_pattern: e.target
                  .value as (typeof INFILL_PATTERNS)[number],
              })
            }
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          >
            {INFILL_PATTERNS.map((pattern) => (
              <option key={pattern} value={pattern}>
                {pattern.charAt(0).toUpperCase() + pattern.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {validationErrors.length > 0 && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded">
          <h4 className="text-sm font-medium text-red-800">
            Please fix the following errors:
          </h4>
          <ul className="mt-2 list-disc list-inside text-sm text-red-700">
            {validationErrors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-4">
        <button
          type="submit"
          disabled={isSubmitting || validationErrors.length > 0}
          className={`w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
            isSubmitting || validationErrors.length > 0
              ? "bg-indigo-300 cursor-not-allowed"
              : "bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          }`}
        >
          {isSubmitting ? "Analyzing..." : "Analyze Print Settings"}
        </button>
      </div>
    </form>
  );
};
