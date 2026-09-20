import { PartialType } from '@nestjs/swagger';
import { CreatePalliativeClinicDto } from './create-clinic.dto';

export class UpdatePalliativeClinicDto extends PartialType(CreatePalliativeClinicDto) {}
