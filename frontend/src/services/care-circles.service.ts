import apiClient from './api-client';

export enum MemberType {
  PATIENT = 'PATIENT',
  FAMILY_CAREGIVER = 'FAMILY_CAREGIVER',
}

export enum PeerPrivacyMode {
  ANONYMOUS_ALIAS = 'ANONYMOUS_ALIAS',
  FIRST_NAME_ONLY = 'FIRST_NAME_ONLY',
  FULL_NAME = 'FULL_NAME',
}

export enum CareTreatmentPhase {
  NEWLY_DIAGNOSED = 'NEWLY_DIAGNOSED',
  ACTIVE_CHEMO_RT = 'ACTIVE_CHEMO_RT',
  SURGERY_PREPARATION = 'SURGERY_PREPARATION',
  POST_SURGERY_RECOVERY = 'POST_SURGERY_RECOVERY',
  SURVIVORSHIP_SURVEILLANCE = 'SURVIVORSHIP_SURVEILLANCE',
  PALLIATIVE_CARE = 'PALLIATIVE_CARE',
}

export enum ConnectionStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  DECLINED = 'DECLINED',
}

export enum PostCategory {
  DIET_AND_DYSPHAGIA = 'DIET_AND_DYSPHAGIA',
  CHEMO_SIDE_EFFECTS = 'CHEMO_SIDE_EFFECTS',
  LOCAL_LOGISTICS_AND_TRAVEL = 'LOCAL_LOGISTICS_AND_TRAVEL',
  EMOTIONAL_AND_FAMILY_SUPPORT = 'EMOTIONAL_AND_FAMILY_SUPPORT',
  TREATMENT_MILESTONES = 'TREATMENT_MILESTONES',
}

export interface CareCircleProfile {
  id: string;
  tenantId: string;
  userId?: string;
  memberType: MemberType;
  caregiverRelation?: string;
  displayName: string;
  rawDisplayName?: string;
  privacyMode: PeerPrivacyMode;
  cancerType: string;
  cancerSubsite?: string;
  cancerStage?: string;
  treatmentPhase: CareTreatmentPhase;
  city: string;
  district: string;
  state: string;
  postalCode?: string;
  latitude?: number;
  longitude?: number;
  distanceKm?: number | null;
  bio: string;
  dietaryAdvice?: string;
  treatmentExperience?: string;
  isOptedIn: boolean;
  isOpenToChat: boolean;
  connectionStatus?: 'NONE' | 'PENDING_SENT' | 'PENDING_RECEIVED' | 'CONNECTED';
  connectionId?: string | null;
  createdAt: string;
}

export interface SearchPeersParams {
  cancerType?: string;
  city?: string;
  district?: string;
  userLat?: number;
  userLng?: number;
  maxDistanceKm?: number;
  treatmentPhase?: CareTreatmentPhase;
  memberType?: MemberType;
  caregiverRelation?: string;
}

export interface PeerMessage {
  id: string;
  content: string;
  senderId: string;
  isFromMe: boolean;
  senderName: string;
  createdAt: string;
}

export interface PeerConnectionItem {
  id: string;
  status: ConnectionStatus;
  note?: string;
  createdAt: string;
  peer: {
    id: string;
    displayName: string;
    memberType: MemberType;
    caregiverRelation?: string;
    cancerType: string;
    city: string;
    district: string;
    treatmentPhase: CareTreatmentPhase;
    bio: string;
    dietaryAdvice?: string;
  };
  lastMessage?: {
    content: string;
    sentAt: string;
    isFromMe: boolean;
  } | null;
}

export interface CaregiverPost {
  id: string;
  category: PostCategory;
  cancerType: string;
  title: string;
  content: string;
  city?: string;
  district?: string;
  likesCount: number;
  createdAt: string;
  author: {
    id: string;
    displayName: string;
    caregiverRelation?: string;
    cancerType: string;
    city?: string;
    district?: string;
  };
  commentsCount: number;
  comments: Array<{
    id: string;
    content: string;
    createdAt: string;
    author: {
      id: string;
      displayName: string;
      city?: string;
    };
  }>;
}

export const careCirclesService = {
  getMyProfile: async (): Promise<CareCircleProfile | null> => {
    const res = await apiClient.get('/api/v1/care-circles/profile/me');
    return res.data?.data || res.data;
  },

  upsertProfile: async (dto: Partial<CareCircleProfile>): Promise<CareCircleProfile> => {
    const res = await apiClient.post('/api/v1/care-circles/profile', dto);
    return res.data?.data || res.data;
  },

  searchPeers: async (params: SearchPeersParams): Promise<{ count: number; searchCenter: any; peers: CareCircleProfile[] }> => {
    const res = await apiClient.get('/api/v1/care-circles/search', { params });
    return res.data?.data || res.data;
  },

  sendConnectionRequest: async (recipientProfileId: string, connectionNote?: string) => {
    const res = await apiClient.post('/api/v1/care-circles/connections/request', {
      recipientProfileId,
      connectionNote,
    });
    return res.data?.data || res.data;
  },

  getMyConnections: async (): Promise<{ active: PeerConnectionItem[]; pendingReceived: PeerConnectionItem[]; pendingSent: PeerConnectionItem[] }> => {
    const res = await apiClient.get('/api/v1/care-circles/connections');
    return res.data?.data || res.data;
  },

  respondConnection: async (connectionId: string, status: ConnectionStatus) => {
    const res = await apiClient.patch(`/api/v1/care-circles/connections/${connectionId}/respond`, { status });
    return res.data?.data || res.data;
  },

  getMessages: async (connectionId: string): Promise<{ connectionId: string; status: string; peer: any; messages: PeerMessage[] }> => {
    const res = await apiClient.get(`/api/v1/care-circles/connections/${connectionId}/messages`);
    return res.data?.data || res.data;
  },

  sendMessage: async (connectionId: string, content: string): Promise<PeerMessage> => {
    const res = await apiClient.post(`/api/v1/care-circles/connections/${connectionId}/messages`, { content });
    return res.data?.data || res.data;
  },

  getPosts: async (category?: PostCategory, cancerType?: string, district?: string): Promise<CaregiverPost[]> => {
    const res = await apiClient.get('/api/v1/care-circles/posts', {
      params: { category, cancerType, district },
    });
    return res.data?.data || res.data;
  },

  createPost: async (dto: { category: PostCategory; cancerType: string; title: string; content: string; city?: string; district?: string }): Promise<CaregiverPost> => {
    const res = await apiClient.post('/api/v1/care-circles/posts', dto);
    return res.data?.data || res.data;
  },

  addComment: async (postId: string, content: string) => {
    const res = await apiClient.post(`/api/v1/care-circles/posts/${postId}/comments`, { content });
    return res.data?.data || res.data;
  },

  likePost: async (postId: string) => {
    const res = await apiClient.post(`/api/v1/care-circles/posts/${postId}/like`);
    return res.data?.data || res.data;
  },
};
