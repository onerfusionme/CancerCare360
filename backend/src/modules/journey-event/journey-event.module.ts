import { Module } from '@nestjs/common';
import { PrismaModule } from '../../common/prisma/prisma.module';
import { JourneyEventService } from './journey-event.service';
import { JourneyEventController } from './journey-event.controller';

@Module({
  imports: [PrismaModule],
  controllers: [JourneyEventController],
  providers: [JourneyEventService],
  exports: [JourneyEventService],
})
export class JourneyEventModule {}
