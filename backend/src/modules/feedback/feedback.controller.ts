import { Controller, Get, Post, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { FeedbackService } from './feedback.service';
import { CreateFeedbackDto, FeedbackFilterDto } from './dto/feedback.dto';
import { AuthGuard } from '../../common/guards/auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';

@ApiTags('feedback')
@ApiBearerAuth()
@UseGuards(AuthGuard, TenantGuard)
@Controller({ path: 'feedback', version: '1' })
export class FeedbackController {
  constructor(private readonly feedbackService: FeedbackService) {}

  @Post()
  create(@Request() req: any, @Body() createFeedbackDto: CreateFeedbackDto) {
    return this.feedbackService.create(req.tenantId, createFeedbackDto);
  }

  @Get()
  findAll(@Request() req: any, @Query() filter: FeedbackFilterDto) {
    return this.feedbackService.findAll(req.tenantId, filter);
  }

  @Get('nps-summary')
  getNpsSummary(@Request() req: any) {
    return this.feedbackService.getNpsSummary(req.tenantId);
  }

  @Get('doctor-ratings')
  getDoctorRatings(@Request() req: any) {
    return this.feedbackService.getDoctorRatings(req.tenantId);
  }

  @Get(':id')
  findOne(@Request() req: any, @Param('id') id: string) {
    return this.feedbackService.findOne(req.tenantId, id);
  }
}
