import { z } from 'zod';

// Enums
export enum UserRole {
  HR_ADMIN = 'HR_ADMIN',
  SUPERVISOR = 'SUPERVISOR',
  EMPLOYEE = 'EMPLOYEE',
  REVIEWER = 'REVIEWER',
}

export enum AppraisalStatus {
  DRAFT = 'DRAFT',
  IN_REVIEW = 'IN_REVIEW',
  EMP_ACK = 'EMP_ACK',
  APPROVED = 'APPROVED',
  CLOSED = 'CLOSED',
}

export enum AppraisalTemplateType {
  DEAN = 'DEAN',
  FACULTY = 'FACULTY',
  CLINICAL = 'CLINICAL',
  GENERAL = 'GENERAL',
  EXEC = 'EXEC',
}

export enum CompetencyCluster {
  CORE = 'CORE',
  FUNCTIONAL = 'FUNCTIONAL',
}

export enum MidYearStatus {
  NOT_ON_TRACK = 'NOT_ON_TRACK',
  ON_TRACK_SOME = 'ON_TRACK_SOME',
  ON_TRACK_ALL = 'ON_TRACK_ALL',
}

export enum SignatureRole {
  EMPLOYEE = 'EMPLOYEE',
  SUPERVISOR = 'SUPERVISOR',
  REVIEWER = 'REVIEWER',
}

export enum RatingBand {
  OUTSTANDING = 'OUTSTANDING',
  VERY_GOOD = 'VERY_GOOD',
  GOOD = 'GOOD',
  FAIR = 'FAIR',
  UNSATISFACTORY = 'UNSATISFACTORY',
}

// Zod Schemas
export const UserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  passwordHash: z.string(),
  role: z.nativeEnum(UserRole),
  firstName: z.string(),
  lastName: z.string(),
  dept: z.string(),
  title: z.string(),
  managerId: z.string().nullable(),
  active: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const EmployeeSchema = z.object({
  id: z.string(),
  userId: z.string(),
  dept: z.string(),
  division: z.string(),
  employmentType: z.string(),
  supervisorId: z.string().nullable(),
  contractTerm: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const AppraisalCycleSchema = z.object({
  id: z.string(),
  name: z.string(),
  periodStart: z.date(),
  periodEnd: z.date(),
  status: z.enum(['PLANNED', 'ACTIVE', 'CLOSED']),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const AppraisalTemplateSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.nativeEnum(AppraisalTemplateType),
  configJson: z.record(z.any()),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const AppraisalSchema = z.object({
  id: z.string(),
  employeeId: z.string(),
  supervisorId: z.string(),
  templateId: z.string(),
  cycleId: z.string(),
  status: z.nativeEnum(AppraisalStatus),
  finalScore: z.number().nullable(),
  ratingBand: z.nativeEnum(RatingBand).nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const SectionScoreSchema = z.object({
  id: z.string(),
  appraisalId: z.string(),
  sectionKey: z.string(),
  rawTotal: z.number(),
  denom: z.number(),
  weight: z.number(),
  weightedScore: z.number(),
});

export const CriterionScoreSchema = z.object({
  id: z.string(),
  appraisalId: z.string(),
  sectionKey: z.string(),
  criterionKey: z.string(),
  score: z.number(),
  max: z.number(),
  note: z.string().nullable(),
});

export const GoalSchema = z.object({
  id: z.string(),
  appraisalId: z.string(),
  title: z.string(),
  description: z.string(),
  weight: z.number(),
  measures: z.string(),
  timeline: z.string(),
  resources: z.string(),
  relevance: z.string(),
  roadblocks: z.string(),
  progressPercent: z.number().min(0).max(100),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const StudentEvaluationSchema = z.object({
  id: z.string(),
  appraisalId: z.string(),
  courseCode: z.string(),
  courseTitle: z.string(),
  avgOutOf5: z.number().min(0).max(5),
});

export const EvidenceSchema = z.object({
  id: z.string(),
  appraisalId: z.string(),
  sectionKey: z.string(),
  label: z.string(),
  url: z.string(),
  note: z.string().nullable(),
  uploadedById: z.string(),
  createdAt: z.date(),
});

export const CommentSchema = z.object({
  id: z.string(),
  appraisalId: z.string(),
  authorId: z.string(),
  body: z.string(),
  createdAt: z.date(),
});

export const MidYearReviewSchema = z.object({
  id: z.string(),
  appraisalId: z.string(),
  coreNotesJson: z.record(z.any()),
  functionalNotesJson: z.record(z.any()),
  goal1: z.string().nullable(),
  goal2: z.string().nullable(),
  generalComments: z.string().nullable(),
  overallComments: z.string().nullable(),
  status: z.nativeEnum(MidYearStatus),
  signedSupervisorAt: z.date().nullable(),
  signedEmployeeAt: z.date().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const SignatureSchema = z.object({
  id: z.string(),
  appraisalId: z.string(),
  role: z.nativeEnum(SignatureRole),
  signerName: z.string(),
  signerEmail: z.string(),
  signedAt: z.date(),
  signatureHash: z.string(),
});

export const CompetencySchema = z.object({
  id: z.string(),
  code: z.string(),
  title: z.string(),
  cluster: z.nativeEnum(CompetencyCluster),
  department: z.string(),
  definition: z.string(),
  behaviorsBasic: z.string(),
  behaviorsAbove: z.string(),
  behaviorsOutstanding: z.string(),
  active: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const CompetencySelectionSchema = z.object({
  id: z.string(),
  appraisalId: z.string(),
  competencyId: z.string(),
  type: z.nativeEnum(CompetencyCluster),
});

export const AuditLogSchema = z.object({
  id: z.string(),
  actorId: z.string(),
  action: z.string(),
  entity: z.string(),
  entityId: z.string(),
  metaJson: z.record(z.any()),
  ip: z.string().nullable(),
  ts: z.date(),
});

// Type exports
export type User = z.infer<typeof UserSchema>;
export type Employee = z.infer<typeof EmployeeSchema>;
export type AppraisalCycle = z.infer<typeof AppraisalCycleSchema>;
export type AppraisalTemplate = z.infer<typeof AppraisalTemplateSchema>;
export type Appraisal = z.infer<typeof AppraisalSchema>;
export type SectionScore = z.infer<typeof SectionScoreSchema>;
export type CriterionScore = z.infer<typeof CriterionScoreSchema>;
export type Goal = z.infer<typeof GoalSchema>;
export type StudentEvaluation = z.infer<typeof StudentEvaluationSchema>;
export type Evidence = z.infer<typeof EvidenceSchema>;
export type Comment = z.infer<typeof CommentSchema>;
export type MidYearReview = z.infer<typeof MidYearReviewSchema>;
export type Signature = z.infer<typeof SignatureSchema>;
export type Competency = z.infer<typeof CompetencySchema>;
export type CompetencySelection = z.infer<typeof CompetencySelectionSchema>;
export type AuditLog = z.infer<typeof AuditLogSchema>;

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Scoring types
export interface ScoringConfig {
  denominators: Record<string, number>;
  weights: Record<string, number>;
  maxScores: Record<string, number>;
}

export interface SectionBreakdown {
  sectionKey: string;
  rawTotal: number;
  denominator: number;
  weight: number;
  weightedScore: number;
}

export interface FinalScore {
  finalScore: number;
  ratingBand: RatingBand;
  sectionBreakdowns: SectionBreakdown[];
}

// Form types
export interface LoginForm {
  email: string;
  password: string;
}

export interface RegisterForm {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  dept: string;
  title: string;
}

export interface CreateAppraisalForm {
  employeeId: string;
  templateId: string;
  cycleId: string;
  competencyIds: string[];
}

export interface UpdateCriterionScoreForm {
  sectionKey: string;
  criterionKey: string;
  score: number;
  note?: string;
}

export interface CreateGoalForm {
  title: string;
  description: string;
  weight: number;
  measures: string;
  timeline: string;
  resources: string;
  relevance: string;
  roadblocks: string;
}

export interface CreateEvidenceForm {
  sectionKey: string;
  label: string;
  note?: string;
  file: any; // File type for browser compatibility
}

export interface CreateCommentForm {
  body: string;
}

export interface MidYearReviewForm {
  coreNotes: Record<string, string>;
  functionalNotes: Record<string, string>;
  goal1?: string;
  goal2?: string;
  generalComments?: string;
  overallComments?: string;
  status: MidYearStatus;
}

// Dashboard types
export interface DashboardStats {
  teamInReview: number;
  awaitingSignature: number;
  overdueMidYears: number;
  scoreDistribution: Record<RatingBand, number>;
}

// Report types
export interface ScoreDistributionReport {
  department: string;
  totalEmployees: number;
  distribution: Record<RatingBand, number>;
  averageScore: number;
}

export interface SectionAverageReport {
  department: string;
  sectionAverages: Record<string, number>;
}

export interface MidYearStatusReport {
  department: string;
  statusDistribution: Record<MidYearStatus, number>;
}

export interface GoalCompletionReport {
  department: string;
  totalGoals: number;
  completedGoals: number;
  completionRate: number;
}

