import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { LoggerModule } from 'nestjs-pino';
import configuration from './config/configuration';

import { PrismaModule } from './common/prisma/prisma.module';
import { CacheModule } from './common/cache/cache.module';
import { ScheduleModule as NestScheduleModule } from '@nestjs/schedule';
import { AuthModule } from './modules/auth/auth.module';
import { TenantModule } from './modules/tenant/tenant.module';
import { UserModule } from './modules/user/user.module';
import { PatientModule } from './modules/patient/patient.module';
import { AuditModule } from './modules/audit/audit.module';
import { SearchModule } from './modules/search/search.module';
import { HealthModule } from './modules/health/health.module';

import { JourneyModule } from './modules/journey/journey.module';
import { JourneyEventModule } from './modules/journey-event/journey-event.module';
import { MilestoneModule } from './modules/milestone/milestone.module';
import { InvestigationModule } from './modules/investigation/investigation.module';
import { TreatmentModule } from './modules/treatment/treatment.module';
import { ConsultationModule } from './modules/consultation/consultation.module';
import { DocumentModule } from './modules/document/document.module';
import { DataConflictModule } from './modules/data-conflict/data-conflict.module';

import { AppointmentModule } from './modules/appointment/appointment.module';
import { ScheduleModule } from './modules/schedule/schedule.module';
import { WaitlistModule } from './modules/waitlist/waitlist.module';
import { CareGapModule } from './modules/care-gap/care-gap.module';
import { FollowUpModule } from './modules/follow-up/follow-up.module';
import { OutreachModule } from './modules/outreach/outreach.module';
import { NotificationModule } from './modules/notification/notification.module';
import { AiModule } from './modules/ai/ai.module';
import { EducationModule } from './modules/education/education.module';
import { CampaignModule } from './modules/campaign/campaign.module';
import { PatientPortalModule } from './modules/patient-portal/patient-portal.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { ReportsModule } from './modules/reports/reports.module';
import { IntegrationModule } from './modules/integration/integration.module';
import { ReferralModule } from './modules/referral/referral.module';
import { FeedbackModule } from './modules/feedback/feedback.module';
import { NavigationModule } from './modules/navigation/navigation.module';
import { CareCirclesModule } from './modules/care-circles/care-circles.module';
import { FinancialAidModule } from './modules/financial-aid/financial-aid.module';
import { SecondOpinionModule } from './modules/second-opinion/second-opinion.module';
import { RoleModule } from './modules/role/role.module';
import { MailerModule } from './common/mailer/mailer.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    LoggerModule.forRoot({
      pinoHttp: {
        level: process.env.NODE_ENV !== 'production' ? 'debug' : 'info',
        transport:
          process.env.NODE_ENV === 'development'
            ? { target: 'pino-pretty', options: { colorize: true } }
            : undefined,
      },
    }),
    PrismaModule,
    CacheModule,
    NestScheduleModule.forRoot(),
    AuditModule, // Global module
    AuthModule,
    TenantModule,
    UserModule,
    PatientModule,
    SearchModule,
    HealthModule,
    JourneyModule,
    JourneyEventModule,
    MilestoneModule,
    InvestigationModule,
    TreatmentModule,
    ConsultationModule,
    DocumentModule,
    DataConflictModule,
    AppointmentModule,
    ScheduleModule,
    WaitlistModule,
    CareGapModule,
    FollowUpModule,
    OutreachModule,
    NotificationModule,
    AiModule,
    EducationModule,
    CampaignModule,
    PatientPortalModule,
    AnalyticsModule,
    ReportsModule,
    IntegrationModule,
    ReferralModule,
    FeedbackModule,
    NavigationModule,
    CareCirclesModule,
    FinancialAidModule,
    SecondOpinionModule,
    RoleModule,
    MailerModule,
  ],
})
export class AppModule {}
