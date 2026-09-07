import { Module } from '@nestjs/common';
import { PrismaModule } from '../../common/prisma/prisma.module';
import { DataConflictService } from './data-conflict.service';
import { DataConflictController } from './data-conflict.controller';

@Module({
  imports: [PrismaModule],
  controllers: [DataConflictController],
  providers: [DataConflictService],
  exports: [DataConflictService],
})
export class DataConflictModule {}
