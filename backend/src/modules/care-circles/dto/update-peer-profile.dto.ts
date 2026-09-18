import { PartialType } from '@nestjs/swagger';
import { CreatePeerProfileDto } from './create-peer-profile.dto';

export class UpdatePeerProfileDto extends PartialType(CreatePeerProfileDto) {}
