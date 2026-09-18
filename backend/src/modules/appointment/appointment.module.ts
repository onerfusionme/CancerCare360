import { Module } from '@nestjs/common';
import { AppointmentService } from './appointment.service';
import { AppointmentController } from './appointment.controller';
import { PublicInquiryController } from './public-inquiry.controller';
import { PrismaModule } from '../../common/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [AppointmentController, PublicInquiryController],
  providers: [AppointmentService],
  exports: [AppointmentService],
})
export class AppointmentModule {}
