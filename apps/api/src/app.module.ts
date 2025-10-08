import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { EmployeesModule } from './employees/employees.module';
import { AppraisalCyclesModule } from './appraisal-cycles/appraisal-cycles.module';
import { AppraisalTemplatesModule } from './appraisal-templates/appraisal-templates.module';
import { AppraisalsModule } from './appraisals/appraisals.module';
import { CompetenciesModule } from './competencies/competencies.module';
// import { ReportsModule } from './reports/reports.module';
// import { StorageModule } from './storage/storage.module';
// import { PdfModule } from './pdf/pdf.module';
// import { AuditModule } from './audit/audit.module';
// import { SupervisorModule } from './supervisor/supervisor.module';
// import { SelfAppraisalModule } from './self-appraisal/self-appraisal.module';
// import { FinalReviewModule } from './final-review/final-review.module';
// import { SettingsModule } from './settings/settings.module';
// import { ImportModule } from './import/import.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 1 minute
        limit: 100, // 100 requests per minute
      },
    ]),
    PrismaModule,
    AuthModule,
    UsersModule,
    EmployeesModule,
    AppraisalCyclesModule,
    AppraisalTemplatesModule,
    AppraisalsModule,
    CompetenciesModule,
    // ReportsModule,
    // StorageModule,
    // PdfModule,
    // AuditModule,
    // SupervisorModule,
    // SelfAppraisalModule,
    // FinalReviewModule,
    // SettingsModule,
    // ImportModule,
  ],
})
export class AppModule {}

