import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '../../common/guards/auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { CareCirclesService } from './care-circles.service';
import { CreatePeerProfileDto } from './dto/create-peer-profile.dto';
import { SearchPeersDto } from './dto/search-peers.dto';
import { CreateConnectionRequestDto, RespondConnectionDto } from './dto/connection-request.dto';
import { SendPeerMessageDto } from './dto/send-message.dto';
import { CreateCaregiverPostDto, CreateCaregiverCommentDto } from './dto/create-post.dto';
import { PostCategory } from '@prisma/client';

@ApiTags('CareCircles')
@ApiBearerAuth()
@UseGuards(AuthGuard, TenantGuard)
@Controller('care-circles')
export class CareCirclesController {
  constructor(private readonly careCirclesService: CareCirclesService) {}

  @Get('profile/me')
  @ApiOperation({ summary: 'Get current user CareCircles peer profile' })
  getMyProfile(@Request() req: any) {
    const tenantId = req.tenantId || req.user.tenantId;
    const userId = req.user.sub || req.user.id;
    return this.careCirclesService.getMyProfile(tenantId, userId);
  }

  @Post('profile')
  @ApiOperation({ summary: 'Create or update current user CareCircles peer profile' })
  upsertMyProfile(@Request() req: any, @Body() dto: CreatePeerProfileDto) {
    const tenantId = req.tenantId || req.user.tenantId;
    const userId = req.user.sub || req.user.id;
    return this.careCirclesService.upsertMyProfile(tenantId, userId, dto);
  }

  @Get('search')
  @ApiOperation({ summary: 'Search and discover nearby cancer-matched peers with distance radius' })
  searchPeers(@Request() req: any, @Query() query: SearchPeersDto) {
    const tenantId = req.tenantId || req.user.tenantId;
    const userId = req.user.sub || req.user.id;
    return this.careCirclesService.searchPeers(tenantId, userId, query);
  }

  @Post('connections/request')
  @ApiOperation({ summary: 'Send a connection request to a peer family' })
  sendConnectionRequest(@Request() req: any, @Body() dto: CreateConnectionRequestDto) {
    const tenantId = req.tenantId || req.user.tenantId;
    const userId = req.user.sub || req.user.id;
    return this.careCirclesService.sendConnectionRequest(tenantId, userId, dto);
  }

  @Get('connections')
  @ApiOperation({ summary: 'List incoming, outgoing, and active family connections' })
  getMyConnections(@Request() req: any) {
    const tenantId = req.tenantId || req.user.tenantId;
    const userId = req.user.sub || req.user.id;
    return this.careCirclesService.getMyConnections(tenantId, userId);
  }

  @Patch('connections/:id/respond')
  @ApiOperation({ summary: 'Accept or decline a connection request' })
  respondConnection(
    @Request() req: any,
    @Param('id') connectionId: string,
    @Body() dto: RespondConnectionDto,
  ) {
    const tenantId = req.tenantId || req.user.tenantId;
    const userId = req.user.sub || req.user.id;
    return this.careCirclesService.respondConnection(tenantId, userId, connectionId, dto.status);
  }

  @Get('connections/:id/messages')
  @ApiOperation({ summary: 'Get in-app conversation messages for an active family connection' })
  getMessages(@Request() req: any, @Param('id') connectionId: string) {
    const tenantId = req.tenantId || req.user.tenantId;
    const userId = req.user.sub || req.user.id;
    return this.careCirclesService.getMessages(tenantId, userId, connectionId);
  }

  @Post('connections/:id/messages')
  @ApiOperation({ summary: 'Send an in-app message to a connected family' })
  sendMessage(
    @Request() req: any,
    @Param('id') connectionId: string,
    @Body() dto: SendPeerMessageDto,
  ) {
    const tenantId = req.tenantId || req.user.tenantId;
    const userId = req.user.sub || req.user.id;
    return this.careCirclesService.sendMessage(tenantId, userId, connectionId, dto);
  }

  @Get('posts')
  @ApiOperation({ summary: 'List caregiver discussion posts for diet, recovery and local advice' })
  getPosts(
    @Request() req: any,
    @Query('category') category?: PostCategory,
    @Query('cancerType') cancerType?: string,
    @Query('district') district?: string,
  ) {
    const tenantId = req.tenantId || req.user.tenantId;
    return this.careCirclesService.getPosts(tenantId, category, cancerType, district);
  }

  @Post('posts')
  @ApiOperation({ summary: 'Create a new discussion post' })
  createPost(@Request() req: any, @Body() dto: CreateCaregiverPostDto) {
    const tenantId = req.tenantId || req.user.tenantId;
    const userId = req.user.sub || req.user.id;
    return this.careCirclesService.createPost(tenantId, userId, dto);
  }

  @Post('posts/:id/comments')
  @ApiOperation({ summary: 'Add a comment or reply to a discussion post' })
  addComment(
    @Request() req: any,
    @Param('id') postId: string,
    @Body() dto: CreateCaregiverCommentDto,
  ) {
    const tenantId = req.tenantId || req.user.tenantId;
    const userId = req.user.sub || req.user.id;
    return this.careCirclesService.addComment(tenantId, userId, postId, dto);
  }

  @Post('posts/:id/like')
  @ApiOperation({ summary: 'Upvote/like a discussion post' })
  likePost(@Request() req: any, @Param('id') postId: string) {
    const tenantId = req.tenantId || req.user.tenantId;
    return this.careCirclesService.likePost(tenantId, postId);
  }
}
