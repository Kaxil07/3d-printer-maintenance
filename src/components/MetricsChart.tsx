import React from 'react';
import { PrinterMetrics } from '../types/printer';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface MetricsChartProps {
  metrics: PrinterMetrics[];
  title: string;
}

const MetricsChart: React.FC<MetricsChartProps> = ({ metrics, title }) => {
  if (metrics.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">{title}</h3>
        <div className="h-64 flex items-center justify-center text-gray-500">
          No data available
        </div>
      </div>
    );
  }

  const getMetricValue = (metric: PrinterMetrics, type: string) => {
    switch (type) {
      case 'Temperature Trends':
        return metric.extruderTemp;
      case 'Motor Performance':
        return (metric.motorVibrationX + metric.motorVibrationY + metric.motorVibrationZ) / 3;
      case 'Extended Temperature Analysis':
        return metric.bedTemp;
      case 'Power Consumption Patterns':
        return metric.powerConsumption;
      case 'Vibration Analysis':
        return metric.motorVibrationX;
      case 'Filament Flow Stability':
        return metric.filamentFlowRate;
      default:
        return metric.extruderTemp;
    }
  };

  const getUnit = (type: string) => {
    switch (type) {
      case 'Temperature Trends':
      case 'Extended Temperature Analysis':
        return '°C';
      case 'Motor Performance':
      case 'Vibration Analysis':
        return 'mm/s²';
      case 'Power Consumption Patterns':
        return 'W';
      case 'Filament Flow Stability':
        return '%';
      default:
        return '';
    }
  };

  const values = metrics.map(m => getMetricValue(m, title));
  const maxValue = Math.max(...values);
  const minValue = Math.min(...values);
  const avgValue = values.reduce((a, b) => a + b, 0) / values.length;
  
  const trend = values.length > 1 ? values[values.length - 1] - values[0] : 0;
  const TrendIcon = trend > 0 ? TrendingUp : trend < 0 ? TrendingDown : Minus;
  const trendColor = trend > 0 ? 'text-green-600' : trend < 0 ? 'text-red-600' : 'text-gray-600';

  const normalizeValue = (value: number) => {
    if (maxValue === minValue) return 50;
    return ((value - minValue) / (maxValue - minValue)) * 100;
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900">{title}</h3>
        <div className="flex items-center space-x-2">
          <TrendIcon className={`w-4 h-4 ${trendColor}`} />
          <span className={`text-sm font-medium ${trendColor}`}>
            {trend > 0 ? '+' : ''}{trend.toFixed(1)}{getUnit(title)}
          </span>
        </div>
      </div>

      {/* Chart */}
      <div className="h-48 mb-4 relative">
        <svg className="w-full h-full" viewBox="0 0 400 200">
          {/* Grid lines */}
          {[0, 25, 50, 75, 100].map(y => (
            <line
              key={y}
              x1="0"
              y1={y * 2}
              x2="400"
              y2={y * 2}
              stroke="#f3f4f6"
              strokeWidth="1"
            />
          ))}
          
          {/* Data line */}
          <polyline
            fill="none"
            stroke="#3b82f6"
            strokeWidth="2"
            points={values.map((value, index) => {
              const x = (index / (values.length - 1)) * 400;
              const y = 200 - (normalizeValue(value) * 2);
              return `${x},${y}`;
            }).join(' ')}
          />
          
          {/* Data points */}
          {values.map((value, index) => {
            const x = (index / (values.length - 1)) * 400;
            const y = 200 - (normalizeValue(value) * 2);
            return (
              <circle
                key={index}
                cx={x}
                cy={y}
                r="3"
                fill="#3b82f6"
                className="hover:r-4 transition-all"
              />
            );
          })}
        </svg>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-3 gap-4 text-sm">
        <div className="text-center">
          <div className="font-medium text-gray-900">{avgValue.toFixed(1)}{getUnit(title)}</div>
          <div className="text-gray-500">Average</div>
        </div>
        <div className="text-center">
          <div className="font-medium text-gray-900">{maxValue.toFixed(1)}{getUnit(title)}</div>
          <div className="text-gray-500">Maximum</div>
        </div>
        <div className="text-center">
          <div className="font-medium text-gray-900">{minValue.toFixed(1)}{getUnit(title)}</div>
          <div className="text-gray-500">Minimum</div>
        </div>
      </div>
    </div>
  );
};

export default MetricsChart;