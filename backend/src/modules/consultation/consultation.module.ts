import { Module } from '@nestjs/common';
import { PrismaModule } from '../../common/prisma/prisma.module';
import { ConsultationService } from './consultation.service';
import { ConsultationController } from './consultation.controller';

@Module({
  imports: [PrismaModule],
  controllers: [ConsultationController],
  providers: [ConsultationService],
  exports: [ConsultationService],
})
export class ConsultationModule {}
