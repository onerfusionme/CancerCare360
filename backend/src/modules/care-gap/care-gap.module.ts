import { Module } from '@nestjs/common';
import { CareGapService } from './care-gap.service';
import { CareGapController } from './care-gap.controller';
import { CareGapProcessor } from './care-gap.processor';
import { PrismaModule } from '../../common/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [CareGapController],
  providers: [CareGapService, CareGapProcessor],
  exports: [CareGapService, CareGapProcessor],
})
export class CareGapModule {}
