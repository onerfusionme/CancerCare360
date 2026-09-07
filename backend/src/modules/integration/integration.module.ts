import { Module } from '@nestjs/common';
import { IntegrationService } from './integration.service';
import { IntegrationController } from './integration.controller';
import { FhirMapperService } from './fhir-mapper.service';
import { PrismaService } from '../../common/prisma/prisma.service';

@Module({
  controllers: [IntegrationController],
  providers: [IntegrationService, FhirMapperService, PrismaService],
})
export class IntegrationModule {}
