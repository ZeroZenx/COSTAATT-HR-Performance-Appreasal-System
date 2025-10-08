import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { 
  calculateFinalScore, 
  validateSectionScores, 
  AppraisalTemplateType, 
  RatingBand,
  FinalScore,
  SectionBreakdown 
} from '@costaatt/shared';

@Injectable()
export class ScoringService {
  constructor(private prisma: PrismaService) {}

  async calculateAppraisalScore(appraisalId: string): Promise<FinalScore> {
    const appraisal = await this.prisma.appraisal.findUnique({
      where: { id: appraisalId },
      include: {
        template: true,
        sectionScores: true,
        criterionScores: true,
        studentEvaluations: true,
      },
    });

    if (!appraisal) {
      throw new Error('Appraisal not found');
    }

    // Calculate section scores from criterion scores
    const sectionScores: Record<string, number> = {};
    
    // Group criterion scores by section
    const scoresBySection = appraisal.criterionScores.reduce((acc, score) => {
      if (!acc[score.sectionKey]) {
        acc[score.sectionKey] = 0;
      }
      acc[score.sectionKey] += score.score;
      return acc;
    }, {} as Record<string, number>);

    // Add student evaluationuations if present
    if (appraisal.studentEvaluations.length > 0) {
      const totalStudentEval = appraisal.studentEvaluations.reduce((sum, evaluation) => sum + evaluation.avgOutOf5, 0);
      sectionScores.studentEvaluations = totalStudentEval;
    }

    // Add other sections
    Object.assign(sectionScores, scoresBySection);

    // Calculate final score based on template type
    const templateType = appraisal.template.type as AppraisalTemplateType;
    const customConfig = appraisal.template.configJson as any;

    const finalScore = calculateFinalScore(templateType, sectionScores, customConfig);

    // Update section scores in database
    await this.updateSectionScores(appraisalId, finalScore.sectionBreakdowns);

    // Update appraisal with final score
    await this.prisma.appraisal.update({
      where: { id: appraisalId },
      data: {
        finalScore: finalScore.finalScore,
        ratingBand: finalScore.ratingBand,
      },
    });

    return finalScore;
  }

  private async updateSectionScores(appraisalId: string, sectionBreakdowns: SectionBreakdown[]) {
    // Delete existing section scores
    await this.prisma.sectionScore.deleteMany({
      where: { appraisalId },
    });

    // Create new section scores
    await this.prisma.sectionScore.createMany({
      data: sectionBreakdowns.map(breakdown => ({
        appraisalId,
        sectionKey: breakdown.sectionKey,
        rawTotal: breakdown.rawTotal,
        denom: breakdown.denominator,
        weight: breakdown.weight,
        weightedScore: breakdown.weightedScore,
      })),
    });
  }

  async updateCriterionScore(
    appraisalId: string,
    sectionKey: string,
    criterionKey: string,
    score: number,
    maxScore: number,
    note?: string
  ) {
    // Validate score
    if (score < 0 || score > maxScore) {
      throw new Error(`Score must be between 0 and ${maxScore}`);
    }

    // Upsert criterion score
    await this.prisma.criterionScore.upsert({
      where: {
        appraisalId_sectionKey_criterionKey: {
          appraisalId,
          sectionKey,
          criterionKey,
        },
      },
      update: {
        score,
        max: maxScore,
        note,
      },
      create: {
        appraisalId,
        sectionKey,
        criterionKey,
        score,
        max: maxScore,
        note,
      },
    });

    // Recalculate and update final score
    return this.calculateAppraisalScore(appraisalId);
  }

  async updateStudentEvaluations(appraisalId: string, evaluationuations: Array<{
    courseCode: string;
    courseTitle: string;
    avgOutOf5: number;
  }>) {
    // Validate evaluationuations
    for (const evaluation of evaluationuations) {
      if (evaluation.avgOutOf5 < 0 || evaluation.avgOutOf5 > 5) {
        throw new Error('Student evaluationuation scores must be between 0 and 5');
      }
    }

    // Delete existing evaluationuations
    await this.prisma.studentEvaluation.deleteMany({
      where: { appraisalId },
    });

    // Create new evaluationuations
    await this.prisma.studentEvaluation.createMany({
      data: evaluationuations.map(evaluation => ({
        appraisalId,
        courseCode: evaluation.courseCode,
        courseTitle: evaluation.courseTitle,
        avgOutOf5: evaluation.avgOutOf5,
      })),
    });

    // Recalculate and update final score
    return this.calculateAppraisalScore(appraisalId);
  }

  async validateAppraisalScores(appraisalId: string): Promise<{ valid: boolean; errors: string[] }> {
    const appraisal = await this.prisma.appraisal.findUnique({
      where: { id: appraisalId },
      include: {
        template: true,
        criterionScores: true,
        studentEvaluations: true,
      },
    });

    if (!appraisal) {
      return { valid: false, errors: ['Appraisal not found'] };
    }

    const errors: string[] = [];

    // Calculate section scores
    const sectionScores: Record<string, number> = {};
    
    const scoresBySection = appraisal.criterionScores.reduce((acc, score) => {
      if (!acc[score.sectionKey]) {
        acc[score.sectionKey] = 0;
      }
      acc[score.sectionKey] += score.score;
      return acc;
    }, {} as Record<string, number>);

    Object.assign(sectionScores, scoresBySection);

    // Add student evaluationuations if present
    if (appraisal.studentEvaluations.length > 0) {
      const totalStudentEval = appraisal.studentEvaluations.reduce((sum, evaluation) => sum + evaluation.avgOutOf5, 0);
      sectionScores.studentEvaluations = totalStudentEval;
    }

    // Validate section scores
    const templateType = appraisal.template.type as AppraisalTemplateType;
    const customConfig = appraisal.template.configJson as any;
    const validation = validateSectionScores(templateType, sectionScores, customConfig);
    
    if (!validation.valid) {
      errors.push(...validation.errors);
    }

    // Check for missing required scores
    const requiredSections = this.getRequiredSections(templateType, customConfig);
    for (const section of requiredSections) {
      if (!sectionScores[section] || sectionScores[section] === 0) {
        errors.push(`Section ${section} is required but has no scores`);
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  private getRequiredSections(templateType: AppraisalTemplateType, customConfig?: any): string[] {
    switch (templateType) {
      case AppraisalTemplateType.DEAN:
        return ['functional', 'core', 'projects'];
      case AppraisalTemplateType.FACULTY:
        return ['functional', 'core', 'studentEvaluations'];
      case AppraisalTemplateType.CLINICAL:
        return ['functional', 'core', 'studentEvaluations'];
      case AppraisalTemplateType.GENERAL:
      case AppraisalTemplateType.EXEC:
        return customConfig ? Object.keys(customConfig.denominators || {}) : [];
      default:
        return [];
    }
  }

  async getAppraisalScoreBreakdown(appraisalId: string): Promise<{
    finalScore: number;
    ratingBand: RatingBand;
    sectionBreakdowns: SectionBreakdown[];
    criterionScores: any[];
    studentEvaluations: any[];
  }> {
    const appraisal = await this.prisma.appraisal.findUnique({
      where: { id: appraisalId },
      include: {
        sectionScores: true,
        criterionScores: true,
        studentEvaluations: true,
      },
    });

    if (!appraisal) {
      throw new Error('Appraisal not found');
    }

    const sectionBreakdowns: SectionBreakdown[] = appraisal.sectionScores.map(score => ({
      sectionKey: score.sectionKey,
      rawTotal: score.rawTotal,
      denominator: score.denom,
      weight: score.weight,
      weightedScore: score.weightedScore,
    }));

    return {
      finalScore: appraisal.finalScore || 0,
      ratingBand: (appraisal.ratingBand as any) || RatingBand.UNSATISFACTORY,
      sectionBreakdowns,
      criterionScores: appraisal.criterionScores,
      studentEvaluations: appraisal.studentEvaluations,
    };
  }
}

