import { Module } from '@nestjs/common';
import { PalliativeService } from './palliative.service';
import { PalliativeController } from './palliative.controller';
import { PrismaModule } from '../../common/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [PalliativeController],
  providers: [PalliativeService],
  exports: [PalliativeService],
})
export class PalliativeModule {}
