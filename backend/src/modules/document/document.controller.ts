import { Controller, Post, Get, Patch, Delete, Param, Body, Query, UseGuards, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { DocumentService } from './document.service';
import { UploadDocumentDto } from './dto/upload-document.dto';
import { DocumentFilterDto } from './dto/document-filter.dto';
import { AuthGuard } from '../../common/guards/auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { RbacGuard } from '../../common/guards/rbac.guard';
import { CurrentTenant } from '../../common/decorators/current-tenant.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { VerificationStatus } from '@prisma/client';
import { IsEnum, IsOptional, IsString } from 'class-validator';

export class UpdateVerificationDto {
  @IsEnum(VerificationStatus)
  status: VerificationStatus;

  @IsString()
  @IsOptional()
  notes?: string;
}

@ApiTags('documents')
@ApiBearerAuth()
@UseGuards(AuthGuard, TenantGuard, RbacGuard)
@Controller('documents')
export class DocumentController {
  constructor(private readonly documentService: DocumentService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload a document' })
  upload(
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: UploadDocumentDto,
  ) {
    return this.documentService.upload(tenantId, userId, file, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List documents with filters' })
  findAll(@CurrentTenant() tenantId: string, @Query() filterDto: DocumentFilterDto) {
    return this.documentService.findAll(tenantId, filterDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get document metadata' })
  findById(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    return this.documentService.findById(tenantId, id);
  }

  @Get(':id/download')
  @ApiOperation({ summary: 'Get signed URL for secure download' })
  getSignedUrl(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    return this.documentService.getSignedUrl(tenantId, id);
  }

  @Patch(':id/verify')
  @ApiOperation({ summary: 'Update verification status' })
  updateVerification(
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() dto: UpdateVerificationDto,
  ) {
    return this.documentService.updateVerification(tenantId, id, userId, dto.status, dto.notes);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete document' })
  delete(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    return this.documentService.delete(tenantId, id);
  }
}
