// Enhanced scoring computation engine for performance appraisals

export interface ScoringItem {
  key: string;
  title: string;
  score: number;
  weight: number;
  scale: string;
  maxScore?: number;
}

export interface ScoringSection {
  key: string;
  title: string;
  weight: number;
  items: ScoringItem[];
}

export interface ScoringResult {
  sectionScores: Record<string, number>;
  weightedScores: Record<string, number>;
  finalScore: number;
  ratingBand: string;
  ratingBandColor: string;
  ratingBandDescription: string;
  isComplete: boolean;
  completionPercentage: number;
}

export interface RatingBand {
  min: number;
  max: number;
  label: string;
  color: string;
  description: string;
}

// Default rating bands for different scales
export const RATING_BANDS = {
  '1-5': [
    { min: 4.5, max: 5.0, label: 'Outstanding', color: 'green', description: 'Exceptional performance that exceeds all expectations' },
    { min: 3.5, max: 4.4, label: 'Exceeds Expectations', color: 'blue', description: 'Performance that consistently exceeds expectations' },
    { min: 2.5, max: 3.4, label: 'Meets Expectations', color: 'yellow', description: 'Performance that meets all expectations' },
    { min: 1.5, max: 2.4, label: 'Below Expectations', color: 'orange', description: 'Performance that falls below expectations' },
    { min: 1.0, max: 1.4, label: 'Unsatisfactory', color: 'red', description: 'Performance that does not meet minimum requirements' }
  ],
  '1-10': [
    { min: 9.0, max: 10.0, label: 'Outstanding', color: 'green', description: 'Exceptional performance that exceeds all expectations' },
    { min: 7.0, max: 8.9, label: 'Exceeds Expectations', color: 'blue', description: 'Performance that consistently exceeds expectations' },
    { min: 5.0, max: 6.9, label: 'Meets Expectations', color: 'yellow', description: 'Performance that meets all expectations' },
    { min: 3.0, max: 4.9, label: 'Below Expectations', color: 'orange', description: 'Performance that falls below expectations' },
    { min: 1.0, max: 2.9, label: 'Unsatisfactory', color: 'red', description: 'Performance that does not meet minimum requirements' }
  ],
  '1-100': [
    { min: 90, max: 100, label: 'Outstanding', color: 'green', description: 'Exceptional performance that exceeds all expectations' },
    { min: 70, max: 89, label: 'Exceeds Expectations', color: 'blue', description: 'Performance that consistently exceeds expectations' },
    { min: 50, max: 69, label: 'Meets Expectations', color: 'yellow', description: 'Performance that meets all expectations' },
    { min: 30, max: 49, label: 'Below Expectations', color: 'orange', description: 'Performance that falls below expectations' },
    { min: 1, max: 29, label: 'Unsatisfactory', color: 'red', description: 'Performance that does not meet minimum requirements' }
  ]
};

export class ScoringEngine {
  /**
   * Calculate comprehensive scoring for appraisal sections
   */
  static calculateScores(sections: ScoringSection[]): ScoringResult {
    const sectionScores: Record<string, number> = {};
    const weightedScores: Record<string, number> = {};
    let totalWeightedScore = 0;
    let totalWeight = 0;
    let completedSections = 0;

    // Calculate section scores
    sections.forEach(section => {
      const sectionScore = this.calculateSectionScore(section);
      sectionScores[section.key] = sectionScore;
      
      // Calculate weighted score
      const weightedScore = sectionScore * section.weight;
      weightedScores[section.key] = weightedScore;
      totalWeightedScore += weightedScore;
      totalWeight += section.weight;
      
      // Track completion
      if (sectionScore > 0) {
        completedSections++;
      }
    });

    // Calculate final score
    const finalScore = totalWeight > 0 ? totalWeightedScore / totalWeight : 0;
    
    // Determine rating band
    const ratingBand = this.determineRatingBand(finalScore, sections[0]?.items[0]?.scale || '1-5');
    
    // Calculate completion percentage
    const completionPercentage = sections.length > 0 ? (completedSections / sections.length) * 100 : 0;
    
    return {
      sectionScores,
      weightedScores,
      finalScore: Math.round(finalScore * 100) / 100, // Round to 2 decimal places
      ratingBand: ratingBand.label,
      ratingBandColor: ratingBand.color,
      ratingBandDescription: ratingBand.description,
      isComplete: completionPercentage === 100,
      completionPercentage: Math.round(completionPercentage)
    };
  }

  /**
   * Calculate score for a single section
   */
  private static calculateSectionScore(section: ScoringSection): number {
    if (!section.items || section.items.length === 0) {
      return 0;
    }

    let totalWeightedScore = 0;
    let totalWeight = 0;
    let completedItems = 0;

    section.items.forEach(item => {
      if (item.score && item.score > 0) {
        const weightedScore = item.score * item.weight;
        totalWeightedScore += weightedScore;
        totalWeight += item.weight;
        completedItems++;
      }
    });

    // Return average score if items are completed, otherwise 0
    return totalWeight > 0 ? totalWeightedScore / totalWeight : 0;
  }

  /**
   * Determine rating band based on score and scale
   */
  private static determineRatingBand(score: number, scale: string): RatingBand {
    const bands = RATING_BANDS[scale as keyof typeof RATING_BANDS] || RATING_BANDS['1-5'];
    
    for (const band of bands) {
      if (score >= band.min && score <= band.max) {
        return band;
      }
    }
    
    // Fallback to lowest band if score is below minimum
    return bands[bands.length - 1];
  }

  /**
   * Validate scoring data
   */
  static validateScoring(sections: ScoringSection[]): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    sections.forEach(section => {
      // Check if section has items
      if (!section.items || section.items.length === 0) {
        errors.push(`Section "${section.title}" has no items`);
        return;
      }

      // Check section weight
      if (section.weight <= 0 || section.weight > 1) {
        errors.push(`Section "${section.title}" has invalid weight: ${section.weight}. Weight must be between 0 and 1`);
      }

      // Check items
      section.items.forEach(item => {
        // Check item weight
        if (item.weight <= 0 || item.weight > 1) {
          errors.push(`Item "${item.title}" in section "${section.title}" has invalid weight: ${item.weight}`);
        }

        // Check score range
        const scaleRange = this.parseScale(item.scale);
        if (item.score < scaleRange.min || item.score > scaleRange.max) {
          errors.push(`Item "${item.title}" in section "${section.title}" has invalid score: ${item.score}. Must be between ${scaleRange.min} and ${scaleRange.max}`);
        }
      });
    });

    // Check total section weights
    const totalSectionWeight = sections.reduce((sum, section) => sum + section.weight, 0);
    if (Math.abs(totalSectionWeight - 1) > 0.01) {
      errors.push(`Total section weights must equal 1.0, but got ${totalSectionWeight}`);
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Parse scale string to get min/max values
   */
  private static parseScale(scale: string): { min: number; max: number } {
    const match = scale.match(/(\d+)-(\d+)/);
    if (match) {
      return {
        min: parseInt(match[1]),
        max: parseInt(match[2])
      };
    }
    
    // Default to 1-5 scale
    return { min: 1, max: 5 };
  }

  /**
   * Generate scoring summary
   */
  static generateSummary(result: ScoringResult): string {
    const { finalScore, ratingBand, completionPercentage, isComplete } = result;
    
    let summary = `Final Score: ${finalScore}/5.0\n`;
    summary += `Rating: ${ratingBand}\n`;
    summary += `Completion: ${completionPercentage}%\n`;
    
    if (isComplete) {
      summary += `Status: Complete`;
    } else {
      summary += `Status: Incomplete`;
    }
    
    return summary;
  }

  /**
   * Calculate performance trends
   */
  static calculateTrends(currentScores: ScoringResult, previousScores?: ScoringResult): {
    scoreChange: number;
    ratingChange: string;
    trend: 'improving' | 'declining' | 'stable';
  } {
    if (!previousScores) {
      return {
        scoreChange: 0,
        ratingChange: 'N/A',
        trend: 'stable'
      };
    }

    const scoreChange = currentScores.finalScore - previousScores.finalScore;
    const ratingChange = currentScores.ratingBand !== previousScores.ratingBand ? 
      `${previousScores.ratingBand} → ${currentScores.ratingBand}` : 'No change';
    
    let trend: 'improving' | 'declining' | 'stable' = 'stable';
    if (scoreChange > 0.1) {
      trend = 'improving';
    } else if (scoreChange < -0.1) {
      trend = 'declining';
    }

    return {
      scoreChange: Math.round(scoreChange * 100) / 100,
      ratingChange,
      trend
    };
  }
}

