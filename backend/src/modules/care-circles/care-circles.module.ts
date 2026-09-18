import { Module } from '@nestjs/common';
import { CareCirclesController } from './care-circles.controller';
import { CareCirclesService } from './care-circles.service';
import { PrismaModule } from '../../common/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [CareCirclesController],
  providers: [CareCirclesService],
  exports: [CareCirclesService],
})
export class CareCirclesModule {}
