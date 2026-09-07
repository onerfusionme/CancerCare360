import { Module } from '@nestjs/common';
import { PatientPortalService } from './patient-portal.service';
import { PatientPortalController } from './patient-portal.controller';
import { PrismaModule } from '../../common/prisma/prisma.module';
import { EducationModule } from '../education/education.module';

@Module({
  imports: [PrismaModule, EducationModule],
  controllers: [PatientPortalController],
  providers: [PatientPortalService],
})
export class PatientPortalModule {}
