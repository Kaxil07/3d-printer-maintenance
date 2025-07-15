import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { PredictionPage } from './components/PredictionPage';
import ErrorBoundary from "./components/ErrorBoundary";
import React from "react";
import Dashboard from "./components/Dashboard";
import "./index.css";

const App = () => {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex">
                <div className="flex-shrink-0 flex items-center">
                  <Link to="/" className="text-xl font-bold text-blue-600">
                    3D Printer Maintenance
                  </Link>
                </div>
                <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                  <Link
                    to="/"
                    className="border-transparent text-gray-500 hover:border-blue-500 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/predict"
                    className="border-transparent text-gray-500 hover:border-blue-500 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                  >
                    Predict Maintenance
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </nav>

        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <ErrorBoundary>
            <Routes>
              <Route
                path="/"
                element={
                  <div className="px-4 py-6 sm:px-0">
                    <div className="bg-white p-6 rounded-lg shadow-md">
                      <h1 className="text-2xl font-semibold mb-4">
                        Welcome to 3D Printer Maintenance Prediction
                      </h1>
                      <p className="text-gray-600 mb-4">
                        This tool helps you predict maintenance needs for your
                        3D printer based on your printing parameters.
                      </p>
                      <div className="mt-6">
                        <Link
                          to="/predict"
                          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          Start Prediction
                        </Link>
                      </div>
                    </div>
                  </div>
                }
              />
              <Route
                path="/predict"
                element={<PredictionPage />}
              />
              <Route
                path="/dashboard"
                element={
                  <div className="px-4 py-6 sm:px-0">
                    <Dashboard />
                  </div>
                }
              />
            </Routes>
          </ErrorBoundary>
        </main>
      </div>
    </Router>
  );
};

export default App;
