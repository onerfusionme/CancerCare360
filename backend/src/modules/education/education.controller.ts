import { Controller, Get, Post, Put, Delete, Body, Patch, Param, Query, UseGuards, Request } from '@nestjs/common';
import { EducationService } from './education.service';
import { CreateEducationDto } from './dto/create-education.dto';
import { UpdateEducationDto } from './dto/update-education.dto';
import { EducationFilterDto } from './dto/education-filter.dto';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '../../common/guards/auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';

@ApiTags('education')
@ApiBearerAuth()
@UseGuards(AuthGuard, TenantGuard)
@Controller('education')
export class EducationController {
  constructor(private readonly educationService: EducationService) {}

  @Post()
  @ApiOperation({ summary: 'Create new education content' })
  create(@Request() req: any, @Body() createEducationDto: CreateEducationDto) {
    return this.educationService.create(req.user.tenantId, createEducationDto, req.user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Get all education contents' })
  findAll(@Request() req: any, @Query() filter: EducationFilterDto) {
    return this.educationService.findAll(req.user.tenantId, filter);
  }

  @Get('published')
  @ApiOperation({ summary: 'Get published education content' })
  findPublished(
    @Request() req: any,
    @Query('category') category?: string,
    @Query('language') language?: string,
  ) {
    return this.educationService.findPublished(req.user.tenantId, category, language);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get education content by id' })
  findOne(@Request() req: any, @Param('id') id: string) {
    return this.educationService.findOne(req.user.tenantId, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update education content' })
  update(@Request() req: any, @Param('id') id: string, @Body() updateEducationDto: UpdateEducationDto) {
    return this.educationService.update(req.user.tenantId, id, updateEducationDto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update education content (PUT alias)' })
  updatePut(@Request() req: any, @Param('id') id: string, @Body() updateEducationDto: UpdateEducationDto) {
    return this.educationService.update(req.user.tenantId, id, updateEducationDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete education content' })
  delete(@Request() req: any, @Param('id') id: string) {
    return this.educationService.delete(req.user.tenantId, id);
  }

  @Post(':id/submit-review')
  @ApiOperation({ summary: 'Submit education content for review' })
  submitForReview(@Request() req: any, @Param('id') id: string) {
    return this.educationService.submitForReview(req.user.tenantId, id, req.user.id);
  }

  @Post(':id/approve')
  @ApiOperation({ summary: 'Approve education content' })
  approve(@Request() req: any, @Param('id') id: string) {
    return this.educationService.approve(req.user.tenantId, id, req.user.id);
  }

  @Post(':id/publish')
  @ApiOperation({ summary: 'Publish education content' })
  publish(@Request() req: any, @Param('id') id: string) {
    return this.educationService.publish(req.user.tenantId, id, req.user.id);
  }

  @Post(':id/archive')
  @ApiOperation({ summary: 'Archive education content' })
  archive(@Request() req: any, @Param('id') id: string) {
    return this.educationService.archive(req.user.tenantId, id);
  }
}
