import React, { useState } from 'react';
import { PredictionForm } from './PredictionForm';
import { PredictionResult } from '../types/prediction';

export const PredictionPage: React.FC = () => {
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handlePredictionResult = (result: PredictionResult) => {
    console.log('Prediction received:', result);
    setResult(result);
    setError(null);
  };

  const handleError = (error: string) => {
    console.error('Prediction error:', error);
    setError(error);
    setResult(null);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">3D Printer Maintenance Prediction</h1>
        
        <PredictionForm
          onPredictionResult={handlePredictionResult}
          onError={handleError}
        />

        {error && (
          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {result && (
          <div className="mt-6 p-6 bg-white shadow rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Prediction Results</h2>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="p-4 bg-gray-50 rounded">
                <h3 className="text-sm font-medium text-gray-500">Wear Factor</h3>
                <p className="mt-1 text-2xl font-semibold text-gray-900">
                  {(result.wear_factor * 100).toFixed(1)}%
                </p>
              </div>
              
              <div className="p-4 bg-gray-50 rounded">
                <h3 className="text-sm font-medium text-gray-500">Thermal Stress</h3>
                <p className="mt-1 text-2xl font-semibold text-gray-900">
                  {(result.thermal_stress * 100).toFixed(1)}%
                </p>
              </div>
            </div>

            {result.alerts && result.alerts.length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-medium mb-3">Alerts</h3>
                <div className="space-y-3">
                  {result.alerts.map((alert, index) => (
                    <div
                      key={index}
                      className={`p-4 rounded-md ${
                        alert.type === 'critical'
                          ? 'bg-red-50 border-red-200'
                          : 'bg-yellow-50 border-yellow-200'
                      }`}
                    >
                      <div className="flex">
                        <div className="flex-shrink-0">
                          {alert.type === 'critical' ? (
                            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                              <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                                clipRule="evenodd"
                              />
                            </svg>
                          ) : (
                            <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                              <path
                                fillRule="evenodd"
                                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                                clipRule="evenodd"
                              />
                            </svg>
                          )}
                        </div>
                        <div className="ml-3">
                          <h3 className={`text-sm font-medium ${
                            alert.type === 'critical' ? 'text-red-800' : 'text-yellow-800'
                          }`}>
                            {alert.component}
                          </h3>
                          <div className={`mt-2 text-sm ${
                            alert.type === 'critical' ? 'text-red-700' : 'text-yellow-700'
                          }`}>
                            <p>{alert.message}</p>
                            {alert.maintenance_items && (
                              <ul className="list-disc list-inside mt-2">
                                {alert.maintenance_items.map((item, idx) => (
                                  <li key={idx}>{item}</li>
                                ))}
                              </ul>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
