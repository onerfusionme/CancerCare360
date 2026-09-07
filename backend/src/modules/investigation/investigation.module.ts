import { Module } from '@nestjs/common';
import { PrismaModule } from '../../common/prisma/prisma.module';
import { InvestigationService } from './investigation.service';
import { InvestigationController } from './investigation.controller';

@Module({
  imports: [PrismaModule],
  controllers: [InvestigationController],
  providers: [InvestigationService],
  exports: [InvestigationService],
})
export class InvestigationModule {}
