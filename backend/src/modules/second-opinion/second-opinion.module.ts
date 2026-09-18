import { Module } from '@nestjs/common';
import { PrismaModule } from '../../common/prisma/prisma.module';
import { SecondOpinionController } from './second-opinion.controller';
import { SecondOpinionService } from './second-opinion.service';

@Module({
  imports: [PrismaModule],
  controllers: [SecondOpinionController],
  providers: [SecondOpinionService],
  exports: [SecondOpinionService],
})
export class SecondOpinionModule {}
