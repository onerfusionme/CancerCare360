import { Module } from '@nestjs/common';
import { CareGapService } from './care-gap.service';
import { CareGapController } from './care-gap.controller';
import { PrismaModule } from '../../common/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [CareGapController],
  providers: [CareGapService],
  exports: [CareGapService],
})
export class CareGapModule {}
