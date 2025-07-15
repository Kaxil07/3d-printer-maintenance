import { CostBenefit, MaintenanceRecommendation, PrinterHealth } from '../types/printer';

class CostBenefitService {
  calculateCostBenefit(
    recommendations: MaintenanceRecommendation[],
    currentHealth: PrinterHealth,
    historicalData: any
  ): CostBenefit {
    // Calculate maintenance cost savings
    const preventiveCost = recommendations.reduce((sum, rec) => sum + rec.estimatedCost, 0);
    const reactiveMaintenanceCost = this.estimateReactiveMaintenanceCost(currentHealth);
    const maintenanceCostSavings = Math.max(0, reactiveMaintenanceCost - preventiveCost);

    // Calculate uptime improvement
    const currentUptime = this.calculateCurrentUptime(currentHealth);
    const projectedUptime = this.calculateProjectedUptime(currentHealth, recommendations);
    const uptimeImprovement = projectedUptime - currentUptime;

    // Calculate quality improvement
    const qualityImprovement = this.calculateQualityImprovement(currentHealth, recommendations);

    // Calculate lifespan extension
    const lifespanExtension = this.calculateLifespanExtension(recommendations);

    // Calculate total savings
    const uptimeSavings = uptimeImprovement * 50; // $50 per hour of uptime
    const qualitySavings = qualityImprovement * 100; // $100 per quality point
    const lifespanSavings = lifespanExtension * 1000; // $1000 per year extended

    const totalSavings = maintenanceCostSavings + uptimeSavings + qualitySavings + lifespanSavings;
    const roi = preventiveCost > 0 ? (totalSavings / preventiveCost) * 100 : 0;

    return {
      maintenanceCostSavings,
      uptimeImprovement,
      qualityImprovement,
      lifespanExtension,
      totalSavings,
      roi
    };
  }

  private estimateReactiveMaintenanceCost(health: PrinterHealth): number {
    const healthScore = health.overallScore;
    if (healthScore > 80) return 50;
    if (healthScore > 60) return 150;
    if (healthScore > 40) return 300;
    return 500;
  }

  private calculateCurrentUptime(health: PrinterHealth): number {
    // Estimate current uptime percentage based on health
    return Math.max(50, health.overallScore);
  }

  private calculateProjectedUptime(health: PrinterHealth, recommendations: MaintenanceRecommendation[]): number {
    const improvementFactor = recommendations.length * 5; // 5% improvement per recommendation
    return Math.min(98, this.calculateCurrentUptime(health) + improvementFactor);
  }

  private calculateQualityImprovement(health: PrinterHealth, recommendations: MaintenanceRecommendation[]): number {
    // Quality improvement based on recommendations
    return recommendations.reduce((improvement, rec) => {
      switch (rec.component) {
        case 'Extruder': return improvement + 15;
        case 'Motors': return improvement + 10;
        case 'Filament System': return improvement + 8;
        default: return improvement + 5;
      }
    }, 0);
  }

  private calculateLifespanExtension(recommendations: MaintenanceRecommendation[]): number {
    // Estimate lifespan extension in years
    return recommendations.length * 0.5; // 6 months per recommendation
  }

  generateReport(costBenefit: CostBenefit, timeframe: string): string {
    return `
Cost-Benefit Analysis Report (${timeframe})

Financial Impact:
• Maintenance Cost Savings: $${costBenefit.maintenanceCostSavings.toFixed(2)}
• Uptime Improvement: ${costBenefit.uptimeImprovement.toFixed(1)}%
• Quality Improvement: ${costBenefit.qualityImprovement.toFixed(1)} points
• Equipment Lifespan Extension: ${costBenefit.lifespanExtension.toFixed(1)} years

Total Projected Savings: $${costBenefit.totalSavings.toFixed(2)}
Return on Investment: ${costBenefit.roi.toFixed(1)}%

Recommendations:
${costBenefit.roi > 200 ? '✅ Highly recommended - Excellent ROI' : 
  costBenefit.roi > 100 ? '✅ Recommended - Good ROI' : 
  costBenefit.roi > 50 ? '⚠️ Consider - Moderate ROI' : 
  '❌ Review - Low ROI'}
    `;
  }
}

export const costBenefitService = new CostBenefitService();