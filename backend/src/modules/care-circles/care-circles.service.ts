import { Injectable, NotFoundException, BadRequestException, ForbiddenException, Logger } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreatePeerProfileDto } from './dto/create-peer-profile.dto';
import { UpdatePeerProfileDto } from './dto/update-peer-profile.dto';
import { SearchPeersDto } from './dto/search-peers.dto';
import { CreateConnectionRequestDto } from './dto/connection-request.dto';
import { SendPeerMessageDto } from './dto/send-message.dto';
import { CreateCaregiverPostDto, CreateCaregiverCommentDto } from './dto/create-post.dto';
import { ConnectionStatus, PostCategory, PeerPrivacyMode, MemberType } from '@prisma/client';

// Known coordinates for Indian/Maharashtra cities for precise distance computation
const CITY_COORDINATES: Record<string, { lat: number; lng: number; district: string }> = {
  karad: { lat: 17.2882, lng: 74.1831, district: 'Satara' },
  satara: { lat: 17.6805, lng: 74.0183, district: 'Satara' },
  wai: { lat: 17.9463, lng: 73.8906, district: 'Satara' },
  kolhapur: { lat: 16.7050, lng: 74.2433, district: 'Kolhapur' },
  sangli: { lat: 16.8524, lng: 74.5815, district: 'Sangli' },
  miraj: { lat: 16.7725, lng: 74.6438, district: 'Sangli' },
  islampur: { lat: 17.0504, lng: 74.2662, district: 'Sangli' },
  pune: { lat: 18.5204, lng: 73.8567, district: 'Pune' },
  baramati: { lat: 18.1517, lng: 74.5775, district: 'Pune' },
  solapur: { lat: 17.6599, lng: 75.9064, district: 'Solapur' },
  mumbai: { lat: 19.0760, lng: 72.8777, district: 'Mumbai' },
  'navi mumbai': { lat: 19.0330, lng: 73.0297, district: 'Thane' },
  thane: { lat: 19.2183, lng: 72.9781, district: 'Thane' },
  nashik: { lat: 19.9975, lng: 73.7898, district: 'Nashik' },
  aurangabad: { lat: 19.8762, lng: 75.3433, district: 'Chhatrapati Sambhajinagar' },
  nagpur: { lat: 21.1458, lng: 79.0882, district: 'Nagpur' },
  delhi: { lat: 28.6139, lng: 77.2090, district: 'Delhi' },
  bengaluru: { lat: 12.9716, lng: 77.5946, district: 'Bengaluru' },
};

@Injectable()
export class CareCirclesService {
  private readonly logger = new Logger(CareCirclesService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Calculates real-world Haversine distance in kilometers
   */
  private calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth radius in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) *
        Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c * 10) / 10;
  }

  /**
   * Lookup city coordinates with fallback
   */
  private resolveCoordinates(city?: string): { lat: number; lng: number } | null {
    if (!city) return null;
    const normalized = city.trim().toLowerCase();
    if (CITY_COORDINATES[normalized]) {
      return {
        lat: CITY_COORDINATES[normalized].lat,
        lng: CITY_COORDINATES[normalized].lng,
      };
    }
    return null;
  }

  /**
   * Format display name according to privacy preferences
   */
  private formatDisplayName(profile: any): string {
    if (profile.privacyMode === PeerPrivacyMode.FULL_NAME) {
      return profile.displayName;
    }
    if (profile.privacyMode === PeerPrivacyMode.FIRST_NAME_ONLY) {
      const parts = profile.displayName.split(' ');
      return parts.length > 1 ? `${parts[0]} ${parts[1][0]}.` : parts[0];
    }
    // ANONYMOUS_ALIAS
    const rel = profile.caregiverRelation ? `${profile.caregiverRelation} of ` : '';
    return `${rel}${profile.cancerType.split(' ')[0]} Caregiver (${profile.city})`;
  }

  // -------------------------------------------------------------
  // Profile Management
  // -------------------------------------------------------------

  async getMyProfile(tenantId: string, userId: string) {
    const profile = await this.prisma.careCircleProfile.findFirst({
      where: { tenantId, userId },
      include: {
        _count: {
          select: {
            sentConnections: true,
            receivedConnections: true,
            posts: true,
          },
        },
      },
    });
    return profile;
  }

  async upsertMyProfile(tenantId: string, userId: string, dto: CreatePeerProfileDto) {
    const existing = await this.prisma.careCircleProfile.findFirst({
      where: { tenantId, userId },
    });

    let { latitude, longitude, city } = dto;
    if ((!latitude || !longitude) && city) {
      const resolved = this.resolveCoordinates(city);
      if (resolved) {
        latitude = resolved.lat;
        longitude = resolved.lng;
      }
    }

    if (existing) {
      return this.prisma.careCircleProfile.update({
        where: { id: existing.id },
        data: {
          ...dto,
          latitude: latitude ?? existing.latitude,
          longitude: longitude ?? existing.longitude,
          updatedAt: new Date(),
        },
      });
    }

    return this.prisma.careCircleProfile.create({
      data: {
        tenantId,
        userId,
        ...dto,
        latitude: latitude ?? 17.2882, // Default to Karad if unknown
        longitude: longitude ?? 74.1831,
      },
    });
  }

  // -------------------------------------------------------------
  // Search & Peer Discovery (Geo + Cancer Matching)
  // -------------------------------------------------------------

  async searchPeers(tenantId: string, currentUserId: string, query: SearchPeersDto) {
    const myProfile = await this.prisma.careCircleProfile.findFirst({
      where: { tenantId, userId: currentUserId },
    });

    // Determine origin coordinates for distance calculations
    let originLat: number | null | undefined = query.userLat;
    let originLng: number | null | undefined = query.userLng;

    if (!originLat && query.city) {
      const resolved = this.resolveCoordinates(query.city);
      if (resolved) {
        originLat = resolved.lat;
        originLng = resolved.lng;
      }
    }

    if (!originLat && myProfile?.latitude) {
      originLat = myProfile.latitude;
      originLng = myProfile.longitude;
    }

    // Default origin to Karad if none specified
    if (!originLat || !originLng) {
      originLat = 17.2882;
      originLng = 74.1831;
    }

    // Build filter conditions
    const where: any = {
      tenantId,
      isOptedIn: true,
    };

    if (myProfile) {
      where.id = { not: myProfile.id };
    }

    if (query.cancerType && query.cancerType.trim() !== '') {
      where.cancerType = {
        contains: query.cancerType.trim(),
        mode: 'insensitive',
      };
    }

    if (query.district && query.district.trim() !== '') {
      where.district = {
        contains: query.district.trim(),
        mode: 'insensitive',
      };
    }

    if (query.treatmentPhase) {
      where.treatmentPhase = query.treatmentPhase;
    }

    if (query.memberType) {
      where.memberType = query.memberType;
    }

    const profiles = await this.prisma.careCircleProfile.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    // Compute distance and check connection status
    const results = await Promise.all(
      profiles.map(async (p) => {
        let distanceKm: number | null = null;
        if (p.latitude && p.longitude && originLat && originLng) {
          distanceKm = this.calculateDistanceKm(originLat, originLng, p.latitude, p.longitude);
        }

        // Connection status check
        let connectionStatus: string = 'NONE';
        let connectionId: string | null = null;

        if (myProfile) {
          const conn = await this.prisma.peerConnection.findFirst({
            where: {
              tenantId,
              OR: [
                { requesterId: myProfile.id, recipientId: p.id },
                { requesterId: p.id, recipientId: myProfile.id },
              ],
            },
          });

          if (conn) {
            connectionId = conn.id;
            if (conn.status === ConnectionStatus.ACCEPTED) {
              connectionStatus = 'CONNECTED';
            } else if (conn.requesterId === myProfile.id) {
              connectionStatus = 'PENDING_SENT';
            } else {
              connectionStatus = 'PENDING_RECEIVED';
            }
          }
        }

        return {
          id: p.id,
          displayName: this.formatDisplayName(p),
          rawDisplayName: p.privacyMode === PeerPrivacyMode.FULL_NAME ? p.displayName : undefined,
          privacyMode: p.privacyMode,
          memberType: p.memberType,
          caregiverRelation: p.caregiverRelation,
          cancerType: p.cancerType,
          cancerSubsite: p.cancerSubsite,
          cancerStage: p.cancerStage,
          treatmentPhase: p.treatmentPhase,
          city: p.city,
          district: p.district,
          state: p.state,
          distanceKm,
          bio: p.bio,
          dietaryAdvice: p.dietaryAdvice,
          treatmentExperience: p.treatmentExperience,
          isOpenToChat: p.isOpenToChat,
          connectionStatus,
          connectionId,
          joinedDate: p.createdAt,
        };
      }),
    );

    // Apply distance filter if requested
    let filtered = results;
    if (query.maxDistanceKm && query.maxDistanceKm > 0) {
      filtered = results.filter((r) => r.distanceKm === null || r.distanceKm <= query.maxDistanceKm!);
    }

    // Sort: nearest distance first
    filtered.sort((a, b) => {
      if (a.distanceKm === null) return 1;
      if (b.distanceKm === null) return -1;
      return a.distanceKm - b.distanceKm;
    });

    return {
      searchCenter: {
        city: query.city || myProfile?.city || 'Karad',
        latitude: originLat,
        longitude: originLng,
      },
      count: filtered.length,
      peers: filtered,
    };
  }

  // -------------------------------------------------------------
  // Peer Connections
  // -------------------------------------------------------------

  async sendConnectionRequest(tenantId: string, currentUserId: string, dto: CreateConnectionRequestDto) {
    const myProfile = await this.prisma.careCircleProfile.findFirst({
      where: { tenantId, userId: currentUserId },
    });

    if (!myProfile) {
      throw new BadRequestException('Please complete your CareCircles profile before sending requests.');
    }

    if (myProfile.id === dto.recipientProfileId) {
      throw new BadRequestException('You cannot connect with your own profile.');
    }

    const recipient = await this.prisma.careCircleProfile.findUnique({
      where: { id: dto.recipientProfileId },
    });

    if (!recipient || recipient.tenantId !== tenantId) {
      throw new NotFoundException('Peer profile not found.');
    }

    const existing = await this.prisma.peerConnection.findFirst({
      where: {
        tenantId,
        OR: [
          { requesterId: myProfile.id, recipientId: recipient.id },
          { requesterId: recipient.id, recipientId: myProfile.id },
        ],
      },
    });

    if (existing) {
      if (existing.status === ConnectionStatus.ACCEPTED) {
        throw new BadRequestException('You are already connected with this family.');
      }
      return existing;
    }

    return this.prisma.peerConnection.create({
      data: {
        tenantId,
        requesterId: myProfile.id,
        recipientId: recipient.id,
        status: ConnectionStatus.PENDING,
        connectionNote: dto.connectionNote || 'Would love to connect and exchange cancer care tips.',
      },
    });
  }

  async getMyConnections(tenantId: string, currentUserId: string) {
    const myProfile = await this.prisma.careCircleProfile.findFirst({
      where: { tenantId, userId: currentUserId },
    });

    if (!myProfile) {
      return { active: [], pendingReceived: [], pendingSent: [] };
    }

    const connections = await this.prisma.peerConnection.findMany({
      where: {
        tenantId,
        OR: [{ requesterId: myProfile.id }, { recipientId: myProfile.id }],
      },
      include: {
        requester: true,
        recipient: true,
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    const active: any[] = [];
    const pendingReceived: any[] = [];
    const pendingSent: any[] = [];

    for (const c of connections) {
      const isRequester = c.requesterId === myProfile.id;
      const peer = isRequester ? c.recipient : c.requester;
      const lastMessage = c.messages[0] || null;

      const connectionData = {
        id: c.id,
        status: c.status,
        note: c.connectionNote,
        createdAt: c.createdAt,
        peer: {
          id: peer.id,
          displayName: this.formatDisplayName(peer),
          memberType: peer.memberType,
          caregiverRelation: peer.caregiverRelation,
          cancerType: peer.cancerType,
          city: peer.city,
          district: peer.district,
          treatmentPhase: peer.treatmentPhase,
          bio: peer.bio,
          dietaryAdvice: peer.dietaryAdvice,
        },
        lastMessage: lastMessage
          ? {
              content: lastMessage.content,
              sentAt: lastMessage.createdAt,
              isFromMe: lastMessage.senderId === myProfile.id,
            }
          : null,
      };

      if (c.status === ConnectionStatus.ACCEPTED) {
        active.push(connectionData);
      } else if (c.status === ConnectionStatus.PENDING) {
        if (isRequester) {
          pendingSent.push(connectionData);
        } else {
          pendingReceived.push(connectionData);
        }
      }
    }

    return { active, pendingReceived, pendingSent };
  }

  async respondConnection(
    tenantId: string,
    currentUserId: string,
    connectionId: string,
    status: ConnectionStatus,
  ) {
    const myProfile = await this.prisma.careCircleProfile.findFirst({
      where: { tenantId, userId: currentUserId },
    });

    if (!myProfile) {
      throw new BadRequestException('Profile not found.');
    }

    const connection = await this.prisma.peerConnection.findUnique({
      where: { id: connectionId },
    });

    if (!connection || connection.tenantId !== tenantId) {
      throw new NotFoundException('Connection request not found.');
    }

    if (connection.recipientId !== myProfile.id) {
      throw new ForbiddenException('Only the recipient can respond to this connection request.');
    }

    return this.prisma.peerConnection.update({
      where: { id: connectionId },
      data: { status, updatedAt: new Date() },
    });
  }

  // -------------------------------------------------------------
  // 1-on-1 In-App Family Chat
  // -------------------------------------------------------------

  async getMessages(tenantId: string, currentUserId: string, connectionId: string) {
    const myProfile = await this.prisma.careCircleProfile.findFirst({
      where: { tenantId, userId: currentUserId },
    });

    if (!myProfile) {
      throw new BadRequestException('Profile not found.');
    }

    const connection = await this.prisma.peerConnection.findUnique({
      where: { id: connectionId },
      include: { requester: true, recipient: true },
    });

    if (!connection || connection.tenantId !== tenantId) {
      throw new NotFoundException('Connection not found.');
    }

    if (connection.requesterId !== myProfile.id && connection.recipientId !== myProfile.id) {
      throw new ForbiddenException('You are not authorized to view messages in this conversation.');
    }

    const messages = await this.prisma.peerMessage.findMany({
      where: { connectionId },
      orderBy: { createdAt: 'asc' },
      include: {
        sender: {
          select: {
            id: true,
            displayName: true,
            privacyMode: true,
            cancerType: true,
            city: true,
            caregiverRelation: true,
          },
        },
      },
    });

    const peer = connection.requesterId === myProfile.id ? connection.recipient : connection.requester;

    return {
      connectionId,
      status: connection.status,
      peer: {
        id: peer.id,
        displayName: this.formatDisplayName(peer),
        cancerType: peer.cancerType,
        city: peer.city,
        district: peer.district,
        relation: peer.caregiverRelation,
      },
      messages: messages.map((m) => ({
        id: m.id,
        content: m.content,
        senderId: m.senderId,
        isFromMe: m.senderId === myProfile.id,
        senderName: this.formatDisplayName(m.sender),
        createdAt: m.createdAt,
      })),
    };
  }

  async sendMessage(tenantId: string, currentUserId: string, connectionId: string, dto: SendPeerMessageDto) {
    const myProfile = await this.prisma.careCircleProfile.findFirst({
      where: { tenantId, userId: currentUserId },
    });

    if (!myProfile) {
      throw new BadRequestException('Please set up your profile first.');
    }

    const connection = await this.prisma.peerConnection.findUnique({
      where: { id: connectionId },
    });

    if (!connection || connection.tenantId !== tenantId) {
      throw new NotFoundException('Connection not found.');
    }

    if (connection.requesterId !== myProfile.id && connection.recipientId !== myProfile.id) {
      throw new ForbiddenException('Unauthorized.');
    }

    if (connection.status !== ConnectionStatus.ACCEPTED) {
      throw new BadRequestException('Can only send messages to accepted family connections.');
    }

    const message = await this.prisma.peerMessage.create({
      data: {
        tenantId,
        connectionId,
        senderId: myProfile.id,
        content: dto.content,
      },
      include: {
        sender: {
          select: {
            id: true,
            displayName: true,
            privacyMode: true,
            cancerType: true,
            city: true,
            caregiverRelation: true,
          },
        },
      },
    });

    // Touch connection timestamp so it surfaces at top of chat list
    await this.prisma.peerConnection.update({
      where: { id: connectionId },
      data: { updatedAt: new Date() },
    });

    return {
      id: message.id,
      content: message.content,
      senderId: message.senderId,
      isFromMe: true,
      senderName: this.formatDisplayName(message.sender),
      createdAt: message.createdAt,
    };
  }

  // -------------------------------------------------------------
  // Caregiver Nutrition & Recovery Exchange Board
  // -------------------------------------------------------------

  async getPosts(tenantId: string, category?: PostCategory, cancerType?: string, district?: string) {
    const where: any = { tenantId };

    if (category) {
      where.category = category;
    }

    if (cancerType && cancerType.trim() !== '') {
      where.cancerType = {
        contains: cancerType.trim(),
        mode: 'insensitive',
      };
    }

    if (district && district.trim() !== '') {
      where.district = {
        contains: district.trim(),
        mode: 'insensitive',
      };
    }

    const posts = await this.prisma.caregiverPost.findMany({
      where,
      include: {
        author: true,
        comments: {
          include: { author: true },
          orderBy: { createdAt: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return posts.map((p) => ({
      id: p.id,
      category: p.category,
      cancerType: p.cancerType,
      title: p.title,
      content: p.content,
      city: p.city,
      district: p.district,
      likesCount: p.likesCount,
      createdAt: p.createdAt,
      author: {
        id: p.author.id,
        displayName: this.formatDisplayName(p.author),
        caregiverRelation: p.author.caregiverRelation,
        cancerType: p.author.cancerType,
        city: p.author.city,
        district: p.author.district,
      },
      commentsCount: p.comments.length,
      comments: p.comments.map((c) => ({
        id: c.id,
        content: c.content,
        createdAt: c.createdAt,
        author: {
          id: c.author.id,
          displayName: this.formatDisplayName(c.author),
          city: c.author.city,
        },
      })),
    }));
  }

  async createPost(tenantId: string, currentUserId: string, dto: CreateCaregiverPostDto) {
    const myProfile = await this.prisma.careCircleProfile.findFirst({
      where: { tenantId, userId: currentUserId },
    });

    if (!myProfile) {
      throw new BadRequestException('Please complete your CareCircles profile before posting.');
    }

    const post = await this.prisma.caregiverPost.create({
      data: {
        tenantId,
        authorId: myProfile.id,
        category: dto.category,
        cancerType: dto.cancerType,
        title: dto.title,
        content: dto.content,
        city: dto.city || myProfile.city,
        district: dto.district || myProfile.district,
      },
      include: { author: true },
    });

    return {
      id: post.id,
      category: post.category,
      cancerType: post.cancerType,
      title: post.title,
      content: post.content,
      city: post.city,
      district: post.district,
      likesCount: post.likesCount,
      createdAt: post.createdAt,
      author: {
        id: post.author.id,
        displayName: this.formatDisplayName(post.author),
        city: post.author.city,
        district: post.author.district,
      },
      comments: [],
    };
  }

  async addComment(tenantId: string, currentUserId: string, postId: string, dto: CreateCaregiverCommentDto) {
    const myProfile = await this.prisma.careCircleProfile.findFirst({
      where: { tenantId, userId: currentUserId },
    });

    if (!myProfile) {
      throw new BadRequestException('Please complete your CareCircles profile before commenting.');
    }

    const post = await this.prisma.caregiverPost.findUnique({
      where: { id: postId },
    });

    if (!post || post.tenantId !== tenantId) {
      throw new NotFoundException('Post not found.');
    }

    const comment = await this.prisma.caregiverPostComment.create({
      data: {
        postId,
        authorId: myProfile.id,
        content: dto.content,
      },
      include: { author: true },
    });

    return {
      id: comment.id,
      content: comment.content,
      createdAt: comment.createdAt,
      author: {
        id: comment.author.id,
        displayName: this.formatDisplayName(comment.author),
        city: comment.author.city,
      },
    };
  }

  async likePost(tenantId: string, postId: string) {
    const post = await this.prisma.caregiverPost.findUnique({
      where: { id: postId },
    });

    if (!post || post.tenantId !== tenantId) {
      throw new NotFoundException('Post not found.');
    }

    return this.prisma.caregiverPost.update({
      where: { id: postId },
      data: { likesCount: { increment: 1 } },
    });
  }
}
