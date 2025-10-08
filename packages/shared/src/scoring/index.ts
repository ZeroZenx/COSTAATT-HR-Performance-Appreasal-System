import { RatingBand, AppraisalTemplateType, ScoringConfig, SectionBreakdown, FinalScore } from '../types';

/**
 * Rating band thresholds
 */
export const RATING_BANDS = {
  [RatingBand.OUTSTANDING]: { min: 90, max: 100 },
  [RatingBand.VERY_GOOD]: { min: 70, max: 89 },
  [RatingBand.GOOD]: { min: 56, max: 69 },
  [RatingBand.FAIR]: { min: 40, max: 55 },
  [RatingBand.UNSATISFACTORY]: { min: 0, max: 39 },
} as const;

/**
 * Template-specific scoring configurations
 */
export const TEMPLATE_CONFIGS: Record<AppraisalTemplateType, ScoringConfig> = {
  [AppraisalTemplateType.DEAN]: {
    denominators: {
      functional: 117,
      core: 99,
      projects: 12,
    },
    weights: {
      functional: 0.50,
      core: 0.30,
      projects: 0.20,
    },
    maxScores: {
      functional: 117,
      core: 99,
      projects: 12,
    },
  },
  [AppraisalTemplateType.FACULTY]: {
    denominators: {
      functional: 114,
      core: 99,
      studentEvaluations: 50,
      projects: 12,
    },
    weights: {
      functional: 0.50,
      core: 0.30,
      studentEvaluations: 0.20,
      projects: 0.00, // Optional, will be calculated if present
    },
    maxScores: {
      functional: 114,
      core: 99,
      studentEvaluations: 50,
      projects: 12,
    },
  },
  [AppraisalTemplateType.CLINICAL]: {
    denominators: {
      functional: 81,
      core: 72,
      studentEvaluations: 30,
    },
    weights: {
      functional: 0.60,
      core: 0.20,
      studentEvaluations: 0.20,
    },
    maxScores: {
      functional: 81,
      core: 72,
      studentEvaluations: 30,
    },
  },
  [AppraisalTemplateType.GENERAL]: {
    denominators: {},
    weights: {},
    maxScores: {},
  },
  [AppraisalTemplateType.EXEC]: {
    denominators: {},
    weights: {},
    maxScores: {},
  },
};

/**
 * Calculate rating band from final score
 */
export function calculateRatingBand(score: number): RatingBand {
  if (score >= 90) return RatingBand.OUTSTANDING;
  if (score >= 70) return RatingBand.VERY_GOOD;
  if (score >= 56) return RatingBand.GOOD;
  if (score >= 40) return RatingBand.FAIR;
  return RatingBand.UNSATISFACTORY;
}

/**
 * Calculate section weighted score
 */
export function calculateSectionScore(
  rawTotal: number,
  denominator: number,
  weight: number
): number {
  if (denominator === 0) return 0;
  return (rawTotal / denominator) * weight;
}

/**
 * Calculate final score for DEAN template
 */
export function calculateDeanScore(sectionScores: Record<string, number>): FinalScore {
  const config = TEMPLATE_CONFIGS[AppraisalTemplateType.DEAN];
  const sectionBreakdowns: SectionBreakdown[] = [];

  // Calculate functional section
  const functionalRaw = sectionScores.functional || 0;
  const functionalWeighted = calculateSectionScore(
    functionalRaw,
    config.denominators.functional,
    config.weights.functional
  );
  sectionBreakdowns.push({
    sectionKey: 'functional',
    rawTotal: functionalRaw,
    denominator: config.denominators.functional,
    weight: config.weights.functional,
    weightedScore: functionalWeighted,
  });

  // Calculate core section
  const coreRaw = sectionScores.core || 0;
  const coreWeighted = calculateSectionScore(
    coreRaw,
    config.denominators.core,
    config.weights.core
  );
  sectionBreakdowns.push({
    sectionKey: 'core',
    rawTotal: coreRaw,
    denominator: config.denominators.core,
    weight: config.weights.core,
    weightedScore: coreWeighted,
  });

  // Calculate projects section
  const projectsRaw = sectionScores.projects || 0;
  const projectsWeighted = calculateSectionScore(
    projectsRaw,
    config.denominators.projects,
    config.weights.projects
  );
  sectionBreakdowns.push({
    sectionKey: 'projects',
    rawTotal: projectsRaw,
    denominator: config.denominators.projects,
    weight: config.weights.projects,
    weightedScore: projectsWeighted,
  });

  const finalScore = (functionalWeighted + coreWeighted + projectsWeighted) * 100;
  const ratingBand = calculateRatingBand(finalScore);

  return {
    finalScore: Math.round(finalScore * 100) / 100,
    ratingBand,
    sectionBreakdowns,
  };
}

/**
 * Calculate final score for FACULTY template
 */
export function calculateFacultyScore(sectionScores: Record<string, number>): FinalScore {
  const config = TEMPLATE_CONFIGS[AppraisalTemplateType.FACULTY];
  const sectionBreakdowns: SectionBreakdown[] = [];

  // Check if projects are present to adjust weights
  const hasProjects = sectionScores.projects && sectionScores.projects > 0;
  const studentEvalWeight = hasProjects ? 0.15 : 0.20;
  const projectsWeight = hasProjects ? 0.05 : 0.00;

  // Calculate functional section
  const functionalRaw = sectionScores.functional || 0;
  const functionalWeighted = calculateSectionScore(
    functionalRaw,
    config.denominators.functional,
    config.weights.functional
  );
  sectionBreakdowns.push({
    sectionKey: 'functional',
    rawTotal: functionalRaw,
    denominator: config.denominators.functional,
    weight: config.weights.functional,
    weightedScore: functionalWeighted,
  });

  // Calculate core section
  const coreRaw = sectionScores.core || 0;
  const coreWeighted = calculateSectionScore(
    coreRaw,
    config.denominators.core,
    config.weights.core
  );
  sectionBreakdowns.push({
    sectionKey: 'core',
    rawTotal: coreRaw,
    denominator: config.denominators.core,
    weight: config.weights.core,
    weightedScore: coreWeighted,
  });

  // Calculate student evaluations section
  const studentEvalRaw = sectionScores.studentEvaluations || 0;
  const studentEvalWeighted = calculateSectionScore(
    studentEvalRaw,
    config.denominators.studentEvaluations,
    studentEvalWeight
  );
  sectionBreakdowns.push({
    sectionKey: 'studentEvaluations',
    rawTotal: studentEvalRaw,
    denominator: config.denominators.studentEvaluations,
    weight: studentEvalWeight,
    weightedScore: studentEvalWeighted,
  });

  // Calculate projects section if present
  if (hasProjects) {
    const projectsRaw = sectionScores.projects || 0;
    const projectsWeighted = calculateSectionScore(
      projectsRaw,
      config.denominators.projects,
      projectsWeight
    );
    sectionBreakdowns.push({
      sectionKey: 'projects',
      rawTotal: projectsRaw,
      denominator: config.denominators.projects,
      weight: projectsWeight,
      weightedScore: projectsWeighted,
    });
  }

  const finalScore = (functionalWeighted + coreWeighted + studentEvalWeighted + (hasProjects ? sectionBreakdowns[3].weightedScore : 0)) * 100;
  const ratingBand = calculateRatingBand(finalScore);

  return {
    finalScore: Math.round(finalScore * 100) / 100,
    ratingBand,
    sectionBreakdowns,
  };
}

/**
 * Calculate final score for CLINICAL template
 */
export function calculateClinicalScore(sectionScores: Record<string, number>): FinalScore {
  const config = TEMPLATE_CONFIGS[AppraisalTemplateType.CLINICAL];
  const sectionBreakdowns: SectionBreakdown[] = [];

  // Calculate functional section
  const functionalRaw = sectionScores.functional || 0;
  const functionalWeighted = calculateSectionScore(
    functionalRaw,
    config.denominators.functional,
    config.weights.functional
  );
  sectionBreakdowns.push({
    sectionKey: 'functional',
    rawTotal: functionalRaw,
    denominator: config.denominators.functional,
    weight: config.weights.functional,
    weightedScore: functionalWeighted,
  });

  // Calculate core section
  const coreRaw = sectionScores.core || 0;
  const coreWeighted = calculateSectionScore(
    coreRaw,
    config.denominators.core,
    config.weights.core
  );
  sectionBreakdowns.push({
    sectionKey: 'core',
    rawTotal: coreRaw,
    denominator: config.denominators.core,
    weight: config.weights.core,
    weightedScore: coreWeighted,
  });

  // Calculate student evaluations section
  const studentEvalRaw = sectionScores.studentEvaluations || 0;
  const studentEvalWeighted = calculateSectionScore(
    studentEvalRaw,
    config.denominators.studentEvaluations,
    config.weights.studentEvaluations
  );
  sectionBreakdowns.push({
    sectionKey: 'studentEvaluations',
    rawTotal: studentEvalRaw,
    denominator: config.denominators.studentEvaluations,
    weight: config.weights.studentEvaluations,
    weightedScore: studentEvalWeighted,
  });

  const finalScore = (functionalWeighted + coreWeighted + studentEvalWeighted) * 100;
  const ratingBand = calculateRatingBand(finalScore);

  return {
    finalScore: Math.round(finalScore * 100) / 100,
    ratingBand,
    sectionBreakdowns,
  };
}

/**
 * Calculate final score for GENERAL/EXEC templates using configJson
 */
export function calculateCustomScore(
  sectionScores: Record<string, number>,
  config: ScoringConfig
): FinalScore {
  const sectionBreakdowns: SectionBreakdown[] = [];
  let totalWeightedScore = 0;

  for (const [sectionKey, rawTotal] of Object.entries(sectionScores)) {
    const denominator = config.denominators[sectionKey] || 1;
    const weight = config.weights[sectionKey] || 0;
    
    const weightedScore = calculateSectionScore(rawTotal, denominator, weight);
    
    sectionBreakdowns.push({
      sectionKey,
      rawTotal,
      denominator,
      weight,
      weightedScore,
    });

    totalWeightedScore += weightedScore;
  }

  const finalScore = totalWeightedScore * 100;
  const ratingBand = calculateRatingBand(finalScore);

  return {
    finalScore: Math.round(finalScore * 100) / 100,
    ratingBand,
    sectionBreakdowns,
  };
}

/**
 * Main scoring function that routes to appropriate template calculator
 */
export function calculateFinalScore(
  templateType: AppraisalTemplateType,
  sectionScores: Record<string, number>,
  customConfig?: ScoringConfig
): FinalScore {
  switch (templateType) {
    case AppraisalTemplateType.DEAN:
      return calculateDeanScore(sectionScores);
    case AppraisalTemplateType.FACULTY:
      return calculateFacultyScore(sectionScores);
    case AppraisalTemplateType.CLINICAL:
      return calculateClinicalScore(sectionScores);
    case AppraisalTemplateType.GENERAL:
    case AppraisalTemplateType.EXEC:
      if (!customConfig) {
        throw new Error(`Custom config required for ${templateType} template`);
      }
      return calculateCustomScore(sectionScores, customConfig);
    default:
      throw new Error(`Unknown template type: ${templateType}`);
  }
}

/**
 * Validate section scores against template limits
 */
export function validateSectionScores(
  templateType: AppraisalTemplateType,
  sectionScores: Record<string, number>,
  customConfig?: ScoringConfig
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  const config = customConfig || TEMPLATE_CONFIGS[templateType];

  for (const [sectionKey, score] of Object.entries(sectionScores)) {
    const maxScore = config.maxScores[sectionKey];
    if (maxScore && score > maxScore) {
      errors.push(`Section ${sectionKey} score (${score}) exceeds maximum (${maxScore})`);
    }
    if (score < 0) {
      errors.push(`Section ${sectionKey} score (${score}) cannot be negative`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Calculate competency selection limits
 */
export function validateCompetencySelection(
  coreCompetencies: string[],
  functionalCompetencies: string[]
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (coreCompetencies.length > 4) {
    errors.push('Maximum 4 core competencies allowed');
  }

  if (functionalCompetencies.length > 6) {
    errors.push('Maximum 6 functional competencies allowed');
  }

  const totalCompetencies = coreCompetencies.length + functionalCompetencies.length;
  if (totalCompetencies > 12) {
    errors.push('Maximum 12 total competencies allowed');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

