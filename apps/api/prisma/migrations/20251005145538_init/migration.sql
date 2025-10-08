-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('HR_ADMIN', 'SUPERVISOR', 'EMPLOYEE', 'REVIEWER');

-- CreateEnum
CREATE TYPE "AppraisalStatus" AS ENUM ('DRAFT', 'IN_REVIEW', 'EMP_ACK', 'APPROVED', 'CLOSED');

-- CreateEnum
CREATE TYPE "AppraisalTemplateType" AS ENUM ('DEAN', 'FACULTY', 'CLINICAL', 'GENERAL', 'EXEC');

-- CreateEnum
CREATE TYPE "CompetencyCluster" AS ENUM ('CORE', 'FUNCTIONAL');

-- CreateEnum
CREATE TYPE "MidYearStatus" AS ENUM ('NOT_ON_TRACK', 'ON_TRACK_SOME', 'ON_TRACK_ALL');

-- CreateEnum
CREATE TYPE "SignatureRole" AS ENUM ('EMPLOYEE', 'SUPERVISOR', 'REVIEWER');

-- CreateEnum
CREATE TYPE "RatingBand" AS ENUM ('OUTSTANDING', 'VERY_GOOD', 'GOOD', 'FAIR', 'UNSATISFACTORY');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "UserRole" NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "dept" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "managerId" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "employees" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "dept" TEXT NOT NULL,
    "division" TEXT NOT NULL,
    "employmentType" TEXT NOT NULL,
    "supervisorId" TEXT,
    "contractTerm" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "employees_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "appraisal_cycles" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "periodStart" TIMESTAMP(3) NOT NULL,
    "periodEnd" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "appraisal_cycles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "appraisal_templates" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "AppraisalTemplateType" NOT NULL,
    "configJson" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "appraisal_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "appraisals" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "supervisorId" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "cycleId" TEXT NOT NULL,
    "status" "AppraisalStatus" NOT NULL,
    "finalScore" DOUBLE PRECISION,
    "ratingBand" "RatingBand",
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "appraisals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "section_scores" (
    "id" TEXT NOT NULL,
    "appraisalId" TEXT NOT NULL,
    "sectionKey" TEXT NOT NULL,
    "rawTotal" DOUBLE PRECISION NOT NULL,
    "denom" DOUBLE PRECISION NOT NULL,
    "weight" DOUBLE PRECISION NOT NULL,
    "weightedScore" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "section_scores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "criterion_scores" (
    "id" TEXT NOT NULL,
    "appraisalId" TEXT NOT NULL,
    "sectionKey" TEXT NOT NULL,
    "criterionKey" TEXT NOT NULL,
    "score" DOUBLE PRECISION NOT NULL,
    "max" DOUBLE PRECISION NOT NULL,
    "note" TEXT,

    CONSTRAINT "criterion_scores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "goals" (
    "id" TEXT NOT NULL,
    "appraisalId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "weight" DOUBLE PRECISION NOT NULL,
    "measures" TEXT NOT NULL,
    "timeline" TEXT NOT NULL,
    "resources" TEXT NOT NULL,
    "relevance" TEXT NOT NULL,
    "roadblocks" TEXT NOT NULL,
    "progressPercent" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "goals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "student_evaluations" (
    "id" TEXT NOT NULL,
    "appraisalId" TEXT NOT NULL,
    "courseCode" TEXT NOT NULL,
    "courseTitle" TEXT NOT NULL,
    "avgOutOf5" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "student_evaluations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "evidence" (
    "id" TEXT NOT NULL,
    "appraisalId" TEXT NOT NULL,
    "sectionKey" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "note" TEXT,
    "uploadedById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "evidence_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "comments" (
    "id" TEXT NOT NULL,
    "appraisalId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "comments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mid_year_reviews" (
    "id" TEXT NOT NULL,
    "appraisalId" TEXT NOT NULL,
    "coreNotesJson" JSONB NOT NULL,
    "functionalNotesJson" JSONB NOT NULL,
    "goal1" TEXT,
    "goal2" TEXT,
    "generalComments" TEXT,
    "overallComments" TEXT,
    "status" "MidYearStatus" NOT NULL,
    "signedSupervisorAt" TIMESTAMP(3),
    "signedEmployeeAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "mid_year_reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "signatures" (
    "id" TEXT NOT NULL,
    "appraisalId" TEXT NOT NULL,
    "role" "SignatureRole" NOT NULL,
    "signerName" TEXT NOT NULL,
    "signerEmail" TEXT NOT NULL,
    "signedAt" TIMESTAMP(3) NOT NULL,
    "signatureHash" TEXT NOT NULL,

    CONSTRAINT "signatures_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "competencies" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "cluster" "CompetencyCluster" NOT NULL,
    "department" TEXT NOT NULL,
    "definition" TEXT NOT NULL,
    "behaviorsBasic" TEXT NOT NULL,
    "behaviorsAbove" TEXT NOT NULL,
    "behaviorsOutstanding" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "competencies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "competency_selections" (
    "id" TEXT NOT NULL,
    "appraisalId" TEXT NOT NULL,
    "competencyId" TEXT NOT NULL,
    "type" "CompetencyCluster" NOT NULL,

    CONSTRAINT "competency_selections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "actorId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "metaJson" JSONB NOT NULL,
    "ip" TEXT,
    "ts" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "employees_userId_key" ON "employees"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "mid_year_reviews_appraisalId_key" ON "mid_year_reviews"("appraisalId");

-- CreateIndex
CREATE UNIQUE INDEX "competencies_code_key" ON "competencies"("code");

-- CreateIndex
CREATE UNIQUE INDEX "competency_selections_appraisalId_competencyId_key" ON "competency_selections"("appraisalId", "competencyId");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_managerId_fkey" FOREIGN KEY ("managerId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employees" ADD CONSTRAINT "employees_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employees" ADD CONSTRAINT "employees_supervisorId_fkey" FOREIGN KEY ("supervisorId") REFERENCES "employees"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appraisals" ADD CONSTRAINT "appraisals_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "employees"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appraisals" ADD CONSTRAINT "appraisals_supervisorId_fkey" FOREIGN KEY ("supervisorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appraisals" ADD CONSTRAINT "appraisals_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "appraisal_templates"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appraisals" ADD CONSTRAINT "appraisals_cycleId_fkey" FOREIGN KEY ("cycleId") REFERENCES "appraisal_cycles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "section_scores" ADD CONSTRAINT "section_scores_appraisalId_fkey" FOREIGN KEY ("appraisalId") REFERENCES "appraisals"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "criterion_scores" ADD CONSTRAINT "criterion_scores_appraisalId_fkey" FOREIGN KEY ("appraisalId") REFERENCES "appraisals"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "goals" ADD CONSTRAINT "goals_appraisalId_fkey" FOREIGN KEY ("appraisalId") REFERENCES "appraisals"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_evaluations" ADD CONSTRAINT "student_evaluations_appraisalId_fkey" FOREIGN KEY ("appraisalId") REFERENCES "appraisals"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evidence" ADD CONSTRAINT "evidence_appraisalId_fkey" FOREIGN KEY ("appraisalId") REFERENCES "appraisals"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evidence" ADD CONSTRAINT "evidence_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "comments_appraisalId_fkey" FOREIGN KEY ("appraisalId") REFERENCES "appraisals"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "comments_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mid_year_reviews" ADD CONSTRAINT "mid_year_reviews_appraisalId_fkey" FOREIGN KEY ("appraisalId") REFERENCES "appraisals"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "signatures" ADD CONSTRAINT "signatures_appraisalId_fkey" FOREIGN KEY ("appraisalId") REFERENCES "appraisals"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "signatures" ADD CONSTRAINT "signatures_signerEmail_fkey" FOREIGN KEY ("signerEmail") REFERENCES "users"("email") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "competency_selections" ADD CONSTRAINT "competency_selections_appraisalId_fkey" FOREIGN KEY ("appraisalId") REFERENCES "appraisals"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "competency_selections" ADD CONSTRAINT "competency_selections_competencyId_fkey" FOREIGN KEY ("competencyId") REFERENCES "competencies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
