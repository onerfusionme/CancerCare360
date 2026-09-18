'use client';

import React, { useState, useEffect } from 'react';
import {
  Card,
  Tabs,
  Row,
  Col,
  Typography,
  Tag,
  Button,
  Input,
  Select,
  Slider,
  Modal,
  Form,
  Radio,
  Switch,
  Alert,
  Avatar,
  Space,
  Badge,
  Divider,
  message,
  Tooltip,
  Empty,
  Spin,
} from 'antd';
import {
  TeamOutlined,
  HeartOutlined,
  MessageOutlined,
  EnvironmentOutlined,
  BookOutlined,
  UserOutlined,
  SafetyCertificateOutlined,
  CheckCircleOutlined,
  SendOutlined,
  PlusOutlined,
  LikeOutlined,
  CommentOutlined,
  InfoCircleOutlined,
  MedicineBoxOutlined,
  CompassOutlined,
  ShareAltOutlined,
} from '@ant-design/icons';
import {
  careCirclesService,
  CareCircleProfile,
  MemberType,
  PeerPrivacyMode,
  CareTreatmentPhase,
  ConnectionStatus,
  PostCategory,
  PeerConnectionItem,
  PeerMessage,
  CaregiverPost,
} from '@/services/care-circles.service';
import { useAuthStore } from '@/stores/auth.store';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { TextArea } = Input;

export default function CareCirclesView() {
  const user = useAuthStore((state) => state.user);
  const [activeTab, setActiveTab] = useState<string>('discover');

  // Profile State
  const [myProfile, setMyProfile] = useState<CareCircleProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState<boolean>(true);
  const [profileForm] = Form.useForm();
  const [savingProfile, setSavingProfile] = useState<boolean>(false);

  // Discovery / Search State
  const [peers, setPeers] = useState<CareCircleProfile[]>([]);
  const [searchingPeers, setSearchingPeers] = useState<boolean>(false);
  const [cancerFilter, setCancerFilter] = useState<string>('Esophageal Cancer');
  const [cityFilter, setCityFilter] = useState<string>('Karad');
  const [districtFilter, setDistrictFilter] = useState<string>('Satara');
  const [distanceKm, setDistanceKm] = useState<number>(50);
  const [selectedPeerModal, setSelectedPeerModal] = useState<CareCircleProfile | null>(null);

  // Connection Request Modal
  const [connectModalOpen, setConnectModalOpen] = useState<boolean>(false);
  const [targetPeerForConnect, setTargetPeerForConnect] = useState<CareCircleProfile | null>(null);
  const [connectNote, setConnectNote] = useState<string>('');
  const [sendingConnect, setSendingConnect] = useState<boolean>(false);

  // Connections & Chat State
  const [connections, setConnections] = useState<{
    active: PeerConnectionItem[];
    pendingReceived: PeerConnectionItem[];
    pendingSent: PeerConnectionItem[];
  }>({ active: [], pendingReceived: [], pendingSent: [] });
  const [activeChatConnId, setActiveChatConnId] = useState<string | null>(null);
  const [chatData, setChatData] = useState<{ peer: any; messages: PeerMessage[] } | null>(null);
  const [chatMessageText, setChatMessageText] = useState<string>('');
  const [sendingMessage, setSendingMessage] = useState<boolean>(false);
  const [loadingChat, setLoadingChat] = useState<boolean>(false);

  // Discussion Board State
  const [posts, setPosts] = useState<CaregiverPost[]>([]);
  const [loadingPosts, setLoadingPosts] = useState<boolean>(false);
  const [selectedPostCategory, setSelectedPostCategory] = useState<string>('ALL');
  const [postModalOpen, setPostModalOpen] = useState<boolean>(false);
  const [postForm] = Form.useForm();
  const [submittingPost, setSubmittingPost] = useState<boolean>(false);
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});

  // 1. Load initial data
  useEffect(() => {
    loadMyProfile();
    loadConnections();
    loadPosts();
  }, []);

  // When profile or filters change, search peers
  useEffect(() => {
    searchPeers();
  }, [cancerFilter, cityFilter, districtFilter, distanceKm]);

  // Poll or reload messages when activeChatConnId changes
  useEffect(() => {
    if (activeChatConnId) {
      loadMessages(activeChatConnId);
    }
  }, [activeChatConnId]);

  const loadMyProfile = async () => {
    setProfileLoading(true);
    try {
      const data = await careCirclesService.getMyProfile();
      if (data) {
        setMyProfile(data);
        profileForm.setFieldsValue({
          memberType: data.memberType,
          caregiverRelation: data.caregiverRelation,
          displayName: data.displayName,
          privacyMode: data.privacyMode,
          cancerType: data.cancerType,
          cancerSubsite: data.cancerSubsite,
          cancerStage: data.cancerStage,
          treatmentPhase: data.treatmentPhase,
          city: data.city,
          district: data.district,
          state: data.state || 'Maharashtra',
          postalCode: data.postalCode,
          bio: data.bio,
          dietaryAdvice: data.dietaryAdvice,
          treatmentExperience: data.treatmentExperience,
          isOptedIn: data.isOptedIn,
          isOpenToChat: data.isOpenToChat,
        });
        if (data.cancerType) setCancerFilter(data.cancerType);
        if (data.city) setCityFilter(data.city);
        if (data.district) setDistrictFilter(data.district);
      } else {
        // Defaults for first-time onboarding
        profileForm.setFieldsValue({
          memberType: MemberType.FAMILY_CAREGIVER,
          caregiverRelation: 'Son',
          displayName: 'Son of Esophageal Cancer Patient (Karad)',
          privacyMode: PeerPrivacyMode.ANONYMOUS_ALIAS,
          cancerType: 'Esophageal Cancer',
          cancerSubsite: 'Mid-Thoracic Esophagus',
          cancerStage: 'Stage III (Locally Advanced)',
          treatmentPhase: CareTreatmentPhase.ACTIVE_CHEMO_RT,
          city: 'Karad',
          district: 'Satara',
          state: 'Maharashtra',
          postalCode: '415110',
          bio: 'Caring for my mother diagnosed with mid-esophagus cancer. Looking to share swallowing/dysphagia diet tips, hydration methods, and mutual strength with nearby families.',
          dietaryAdvice: 'Moong dal soup with pureed spinach and ghee, cooled tender coconut water, diluted ragi malt. Avoid acidic fruit juices and spices.',
          treatmentExperience: 'Elevate bed head 30 degrees to prevent acid reflux. Use soft silicone spoon for eating slowly.',
          isOptedIn: true,
          isOpenToChat: true,
        });
      }
    } catch (e) {
      // Ignored if user hasn't created profile yet
    } finally {
      setProfileLoading(false);
    }
  };

  const handleSaveProfile = async (values: any) => {
    setSavingProfile(true);
    try {
      const saved = await careCirclesService.upsertProfile(values);
      setMyProfile(saved);
      message.success('Your CareCircles profile and privacy preferences have been updated.');
      searchPeers();
    } catch (err: any) {
      message.error(err?.response?.data?.message || 'Failed to update profile');
    } finally {
      setSavingProfile(false);
    }
  };

  const searchPeers = async () => {
    setSearchingPeers(true);
    try {
      const res = await careCirclesService.searchPeers({
        cancerType: cancerFilter,
        city: cityFilter,
        district: districtFilter,
        maxDistanceKm: distanceKm,
      });
      setPeers(res.peers || []);
    } catch (e) {
      // Search error handled gracefully
    } finally {
      setSearchingPeers(false);
    }
  };

  const loadConnections = async () => {
    try {
      const res = await careCirclesService.getMyConnections();
      setConnections(res);
      if (!activeChatConnId && res.active.length > 0) {
        setActiveChatConnId(res.active[0].id);
      }
    } catch (e) {}
  };

  const loadMessages = async (connectionId: string) => {
    setLoadingChat(true);
    try {
      const res = await careCirclesService.getMessages(connectionId);
      setChatData({ peer: res.peer, messages: res.messages });
    } catch (e) {
      message.error('Failed to load conversation');
    } finally {
      setLoadingChat(false);
    }
  };

  const handleSendMessage = async () => {
    if (!activeChatConnId || !chatMessageText.trim()) return;
    setSendingMessage(true);
    try {
      const sent = await careCirclesService.sendMessage(activeChatConnId, chatMessageText.trim());
      setChatMessageText('');
      setChatData((prev) => (prev ? { ...prev, messages: [...prev.messages, sent] } : null));
      loadConnections();
    } catch (e: any) {
      message.error(e?.response?.data?.message || 'Failed to send message');
    } finally {
      setSendingMessage(false);
    }
  };

  const handleOpenConnect = (peer: CareCircleProfile) => {
    if (!myProfile) {
      message.info('Please review and save your family profile first in "My Profile" tab.');
      setActiveTab('profile');
      return;
    }
    setTargetPeerForConnect(peer);
    setConnectNote(
      `Hi! My family is also caring for a loved one with ${peer.cancerType} in ${cityFilter || 'our area'}. Would be grateful to connect, exchange diet tips, and support each other.`,
    );
    setConnectModalOpen(true);
  };

  const handleSendConnectRequest = async () => {
    if (!targetPeerForConnect) return;
    setSendingConnect(true);
    try {
      await careCirclesService.sendConnectionRequest(targetPeerForConnect.id, connectNote);
      message.success(`Connection request sent to ${targetPeerForConnect.displayName}`);
      setConnectModalOpen(false);
      searchPeers();
      loadConnections();
    } catch (e: any) {
      message.error(e?.response?.data?.message || 'Could not send request');
    } finally {
      setSendingConnect(false);
    }
  };

  const handleRespondConnection = async (connectionId: string, status: ConnectionStatus) => {
    try {
      await careCirclesService.respondConnection(connectionId, status);
      message.success(status === ConnectionStatus.ACCEPTED ? 'Connection accepted! You can now chat.' : 'Connection request declined.');
      loadConnections();
      searchPeers();
    } catch (e: any) {
      message.error('Failed to update connection');
    }
  };

  const loadPosts = async (cat?: string) => {
    setLoadingPosts(true);
    try {
      const categoryParam = cat && cat !== 'ALL' ? (cat as PostCategory) : undefined;
      const res = await careCirclesService.getPosts(categoryParam, cancerFilter, districtFilter);
      setPosts(res || []);
    } catch (e) {
    } finally {
      setLoadingPosts(false);
    }
  };

  const handleCreatePost = async (values: any) => {
    setSubmittingPost(true);
    try {
      await careCirclesService.createPost({
        ...values,
        cancerType: values.cancerType || cancerFilter || 'Esophageal Cancer',
        city: values.city || myProfile?.city || 'Karad',
        district: values.district || myProfile?.district || 'Satara',
      });
      message.success('Your experience/tip has been published to CareCircles community!');
      setPostModalOpen(false);
      postForm.resetFields();
      loadPosts(selectedPostCategory);
    } catch (e: any) {
      message.error(e?.response?.data?.message || 'Failed to publish post');
    } finally {
      setSubmittingPost(false);
    }
  };

  const handleLikePost = async (postId: string) => {
    try {
      await careCirclesService.likePost(postId);
      setPosts((prev) =>
        prev.map((p) => (p.id === postId ? { ...p, likesCount: p.likesCount + 1 } : p)),
      );
    } catch (e) {}
  };

  const handleAddComment = async (postId: string) => {
    const text = commentInputs[postId];
    if (!text || !text.trim()) return;
    try {
      const comment = await careCirclesService.addComment(postId, text.trim());
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId
            ? { ...p, commentsCount: p.commentsCount + 1, comments: [...p.comments, comment] }
            : p,
        ),
      );
      setCommentInputs((prev) => ({ ...prev, [postId]: '' }));
      message.success('Comment posted');
    } catch (e: any) {
      message.error(e?.response?.data?.message || 'Could not post comment');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Hero Welcome Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, #0d9488 0%, #0f766e 50%, #115e59 100%)',
          borderRadius: 14,
          padding: '24px 28px',
          color: '#ffffff',
          boxShadow: '0 8px 24px -6px rgba(13, 148, 136, 0.3)',
        }}
      >
        <Row gutter={[20, 20]} align="middle">
          <Col xs={24} md={17}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '4px 12px',
                background: 'rgba(255, 255, 255, 0.16)',
                borderRadius: 20,
                marginBottom: 10,
              }}
            >
              <TeamOutlined style={{ color: '#a7f3d0' }} />
              <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.04em', color: '#f0fdf4' }}>
                CARECIRCLES • GEOGRAPHIC & CANCER-MATCHED PEER NETWORK
              </span>
            </div>
            <h1 style={{ fontSize: 24, fontWeight: 700, margin: '0 0 8px 0', color: '#ffffff' }}>
              Family Caregiver Peer Support Network
            </h1>
            <p style={{ margin: 0, fontSize: 13, color: '#ccfbf1', lineHeight: 1.6, maxWidth: 720 }}>
              Cancer should not be fought in isolation. Connect with families in <b>Karad, Satara, and nearby districts</b> whose mothers, fathers, or spouses are fighting similar cancers. Exchange practical dysphagia diet recipes, treatment recovery precautions, and mutual courage with dignity and privacy protection.
            </p>
          </Col>

          <Col xs={24} md={7} style={{ textAlign: 'right' }}>
            <div
              style={{
                background: 'rgba(255, 255, 255, 0.12)',
                borderRadius: 12,
                padding: '16px',
                backdropFilter: 'blur(6px)',
                textAlign: 'left',
              }}
            >
              <div style={{ fontSize: 11, color: '#a7f3d0', fontWeight: 600, textTransform: 'uppercase' }}>
                Your Privacy Shield
              </div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#ffffff', marginTop: 4 }}>
                100% Opt-In & Anonymous Mode
              </div>
              <div style={{ fontSize: 11, color: '#ccfbf1', marginTop: 4, lineHeight: 1.4 }}>
                Personal phone numbers and full names are never revealed without your explicit consent.
              </div>
            </div>
          </Col>
        </Row>
      </div>

      {/* Medical Safety Disclaimer Alert */}
      <Alert
        message="Caregiver Peer Information & Clinical Advisory"
        description="CareCircles connects patients and families for practical diet suggestions, lifestyle precautions, and moral support based on real-world family journeys. Peer advice does not constitute medical diagnosis or prescription. Always consult your oncology care team before introducing supplements or altering clinical feeding plans."
        type="info"
        showIcon
        icon={<SafetyCertificateOutlined style={{ color: '#0d9488' }} />}
        style={{ borderRadius: 10, border: '1px solid #ccfbf1', background: '#f0fdfa' }}
      />

      {/* Main Tabs Workspace */}
      <Card
        className="glass-card"
        style={{ borderRadius: 16 }}
        styles={{ body: { padding: '20px 24px' } }}
      >
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={[
            {
              key: 'discover',
              label: (
                <span style={{ fontWeight: 600, fontSize: 14 }}>
                  <CompassOutlined /> Discover Nearby Families ({peers.length})
                </span>
              ),
              children: (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                  {/* Search & Geo-Filter Controls */}
                  <div
                    className="glass-card"
                    style={{
                      padding: '18px 20px',
                      borderRadius: 14,
                    }}
                  >
                    <Row gutter={[16, 16]} align="middle">
                      <Col xs={24} sm={12} md={6}>
                        <label style={{ fontSize: 12, fontWeight: 700, display: 'block', marginBottom: 4 }}>
                          Cancer Site / Type
                        </label>
                        <Select
                          value={cancerFilter}
                          onChange={setCancerFilter}
                          style={{ width: '100%' }}
                          placeholder="Select Cancer Type"
                        >
                          <Option value="Esophageal Cancer">Esophageal Cancer (ग्रास नलीचा कर्करोग)</Option>
                          <Option value="Breast Cancer">Breast Cancer (स्तनाचा कर्करोग)</Option>
                          <Option value="Head & Neck Cancer">Head & Neck / Oral Cancer ( तोंडाचा कर्करोग)</Option>
                          <Option value="Lung Cancer">Lung Cancer (फुफ्फुसाचा कर्करोग)</Option>
                          <Option value="Gastric / Stomach Cancer">Gastric / Stomach Cancer</Option>
                          <Option value="Colorectal Cancer">Colorectal Cancer</Option>
                          <Option value="Cervical Cancer">Cervical Cancer</Option>
                        </Select>
                      </Col>

                      <Col xs={24} sm={12} md={6}>
                        <label style={{ fontSize: 12, fontWeight: 700, display: 'block', marginBottom: 4 }}>
                          City / Town
                        </label>
                        <Select
                          value={cityFilter}
                          onChange={setCityFilter}
                          style={{ width: '100%' }}
                          placeholder="Search City"
                        >
                          <Option value="Karad">Karad (कराड)</Option>
                          <Option value="Satara">Satara (सातारा)</Option>
                          <Option value="Kolhapur">Kolhapur (कोल्हापूर)</Option>
                          <Option value="Sangli">Sangli (सांगली)</Option>
                          <Option value="Miraj">Miraj (मिरज)</Option>
                          <Option value="Wai">Wai (वाई)</Option>
                          <Option value="Pune">Pune (पुणे)</Option>
                          <Option value="Mumbai">Mumbai (मुंबई)</Option>
                        </Select>
                      </Col>

                      <Col xs={24} sm={12} md={8}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                          <label style={{ fontSize: 12, fontWeight: 700 }}>
                            Distance Radius: {distanceKm} km
                          </label>
                          <span style={{ fontSize: 11, color: '#0d9488', fontWeight: 600 }}>
                            {distanceKm <= 30 ? 'Immediate Vicinity' : distanceKm <= 75 ? 'District Radius' : 'Western Maharashtra'}
                          </span>
                        </div>
                        <Slider
                          min={10}
                          max={150}
                          step={10}
                          value={distanceKm}
                          onChange={setDistanceKm}
                          marks={{ 10: '10km', 50: '50km (Satara)', 100: '100km', 150: '150km' }}
                        />
                      </Col>

                      <Col xs={24} sm={12} md={4} style={{ display: 'flex', alignItems: 'flex-end' }}>
                        <Button
                          type="primary"
                          block
                          icon={<CompassOutlined />}
                          onClick={searchPeers}
                          loading={searchingPeers}
                          style={{ background: '#0d9488', borderColor: '#0d9488', height: 38, fontWeight: 600 }}
                        >
                          Refresh Scan
                        </Button>
                      </Col>
                    </Row>
                  </div>

                  {/* Peer Cards Grid */}
                  {searchingPeers ? (
                    <div style={{ textAlign: 'center', padding: '60px 0' }}>
                      <Spin size="large" />
                      <div style={{ marginTop: 12, color: '#64748b' }}>Scanning cancer families near {cityFilter}...</div>
                    </div>
                  ) : peers.length === 0 ? (
                    <Empty
                      image={Empty.PRESENTED_IMAGE_SIMPLE}
                      description={
                        <div style={{ color: '#64748b', fontSize: 14 }}>
                          No registered families found in {cityFilter} matching {cancerFilter} within {distanceKm} km yet.
                          <div style={{ marginTop: 6, fontSize: 12 }}>
                            Try increasing your distance radius to 75 km or 100 km, or be the first to share your family journey!
                          </div>
                        </div>
                      }
                      style={{ padding: '60px 0' }}
                    >
                      <Button type="primary" onClick={() => setDistanceKm(100)} style={{ background: '#0d9488' }}>
                        Expand Radius to 100 km
                      </Button>
                    </Empty>
                  ) : (
                    <Row gutter={[20, 20]}>
                      {peers.map((peer) => (
                        <Col xs={24} md={12} key={peer.id}>
                          <Card
                            hoverable
                            className="glass-card"
                            style={{
                              borderRadius: 14,
                              height: '100%',
                              display: 'flex',
                              flexDirection: 'column',
                            }}
                            styles={{ body: { padding: 20, flex: 1, display: 'flex', flexDirection: 'column' } }}
                          >
                            {/* Card Header: Avatar, Name, Proximity */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                <Avatar
                                  size={44}
                                  style={{
                                    background: 'linear-gradient(135deg, #0d9488, #059669)',
                                    fontWeight: 700,
                                    fontSize: 16,
                                  }}
                                >
                                  {peer.displayName.slice(0, 2).toUpperCase()}
                                </Avatar>
                                <div>
                                  <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--color-text-primary, #0f172a)' }}>
                                    {peer.displayName}
                                  </div>
                                  <div style={{ fontSize: 12, color: '#64748b' }}>
                                    {peer.memberType === MemberType.FAMILY_CAREGIVER
                                      ? `${peer.caregiverRelation || 'Family'} Caregiver`
                                      : 'Cancer Patient'}
                                  </div>
                                </div>
                              </div>

                              <Tag
                                color="cyan"
                                style={{
                                  borderRadius: 12,
                                  fontWeight: 600,
                                  fontSize: 11,
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 4,
                                }}
                              >
                                <EnvironmentOutlined />
                                {peer.distanceKm !== null ? `${peer.distanceKm} km away` : peer.city}
                              </Tag>
                            </div>

                            {/* Tags: Diagnosis, Subsite, Phase */}
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
                              <Tag color="purple" style={{ fontWeight: 600 }}>
                                {peer.cancerType}
                              </Tag>
                              {peer.cancerSubsite && <Tag color="blue">{peer.cancerSubsite}</Tag>}
                              {peer.cancerStage && <Tag color="orange">{peer.cancerStage}</Tag>}
                              <Tag style={{ background: 'var(--glass-pill-bg)', border: '1px solid var(--glass-card-border-subtle)' }}>
                                {peer.treatmentPhase?.replace(/_/g, ' ')}
                              </Tag>
                            </div>

                            {/* Bio / Family Journey Story */}
                            <Paragraph
                              ellipsis={{ rows: 2 }}
                              style={{ fontSize: 13, lineHeight: 1.5, marginBottom: 12 }}
                            >
                              {peer.bio}
                            </Paragraph>

                            {/* Tested Dietary Tip Snippet (if available) */}
                            {peer.dietaryAdvice && (
                              <div
                                style={{
                                  background: '#f0fdf4',
                                  border: '1px solid #bbf7d0',
                                  borderRadius: 8,
                                  padding: '10px 12px',
                                  marginBottom: 16,
                                  fontSize: 12,
                                  color: '#166534',
                                }}
                              >
                                <div style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                                  <HeartOutlined style={{ color: '#16a34a' }} /> Tried & Tested Diet Solution:
                                </div>
                                <div style={{ lineHeight: 1.4 }}>
                                  {peer.dietaryAdvice.length > 130
                                    ? `${peer.dietaryAdvice.slice(0, 130)}...`
                                    : peer.dietaryAdvice}
                                </div>
                              </div>
                            )}

                            {/* Footer Actions */}
                            <div style={{ marginTop: 'auto', display: 'flex', gap: 10, paddingTop: 10 }}>
                              <Button
                                block
                                onClick={() => setSelectedPeerModal(peer)}
                                style={{ fontWeight: 600, borderColor: '#cbd5e1' }}
                              >
                                View Diet & Journey
                              </Button>

                              {peer.connectionStatus === 'CONNECTED' ? (
                                <Button
                                  type="primary"
                                  block
                                  icon={<MessageOutlined />}
                                  style={{ background: '#059669', borderColor: '#059669', fontWeight: 600 }}
                                  onClick={() => {
                                    if (peer.connectionId) setActiveChatConnId(peer.connectionId);
                                    setActiveTab('chat');
                                  }}
                                >
                                  Open Chat
                                </Button>
                              ) : peer.connectionStatus === 'PENDING_SENT' ? (
                                <Button block disabled style={{ fontWeight: 600 }}>
                                  Request Sent
                                </Button>
                              ) : peer.connectionStatus === 'PENDING_RECEIVED' ? (
                                <Button
                                  type="primary"
                                  block
                                  style={{ background: '#d97706', borderColor: '#d97706', fontWeight: 600 }}
                                  onClick={() => setActiveTab('chat')}
                                >
                                  Accept Request
                                </Button>
                              ) : (
                                <Button
                                  type="primary"
                                  block
                                  icon={<PlusOutlined />}
                                  style={{ background: '#0d9488', borderColor: '#0d9488', fontWeight: 600 }}
                                  onClick={() => handleOpenConnect(peer)}
                                >
                                  Connect Family
                                </Button>
                              )}
                            </div>
                          </Card>
                        </Col>
                      ))}
                    </Row>
                  )}
                </div>
              ),
            },
            {
              key: 'chat',
              label: (
                <span style={{ fontWeight: 600, fontSize: 14 }}>
                  <MessageOutlined /> 1-on-1 Family Chat ({connections.active.length})
                </span>
              ),
              children: (
                <Row gutter={[20, 20]} style={{ minHeight: 520 }}>
                  {/* Left Column: Connections List & Pending Requests */}
                  <Col xs={24} md={8}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                      {/* Incoming Requests */}
                      {connections.pendingReceived.length > 0 && (
                        <div
                          style={{
                            background: '#fffbeb',
                            border: '1px solid #fef3c7',
                            borderRadius: 10,
                            padding: '12px 14px',
                          }}
                        >
                          <div style={{ fontWeight: 700, fontSize: 12, color: '#b45309', marginBottom: 8 }}>
                            INCOMING CONNECTION REQUESTS ({connections.pendingReceived.length})
                          </div>
                          {connections.pendingReceived.map((req) => (
                            <div
                              key={req.id}
                              style={{
                                background: '#ffffff',
                                border: '1px solid #fde68a',
                                borderRadius: 8,
                                padding: 10,
                                marginBottom: 8,
                              }}
                            >
                              <div style={{ fontWeight: 700, fontSize: 13 }}>
                                {req.peer.displayName}
                              </div>
                              <div style={{ fontSize: 11, color: '#64748b' }}>
                                {req.peer.cancerType} • {req.peer.city}
                              </div>
                              {req.note && (
                                <div style={{ fontSize: 12, fontStyle: 'italic', margin: '6px 0' }}>
                                  &ldquo;{req.note}&rdquo;
                                </div>
                              )}
                              <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                                <Button
                                  size="small"
                                  type="primary"
                                  style={{ background: '#059669', fontSize: 11 }}
                                  onClick={() => handleRespondConnection(req.id, ConnectionStatus.ACCEPTED)}
                                >
                                  Accept & Chat
                                </Button>
                                <Button
                                  size="small"
                                  danger
                                  style={{ fontSize: 11 }}
                                  onClick={() => handleRespondConnection(req.id, ConnectionStatus.DECLINED)}
                                >
                                  Decline
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Active Connected Families */}
                      <div
                        style={{
                          background: '#f8fafc',
                          border: '1px solid #e2e8f0',
                          borderRadius: 10,
                          padding: 12,
                        }}
                      >
                        <div style={{ fontWeight: 700, fontSize: 12, marginBottom: 10 }}>
                          CONNECTED FAMILIES ({connections.active.length})
                        </div>

                        {connections.active.length === 0 ? (
                          <div style={{ textAlign: 'center', padding: '30px 10px', color: '#94a3b8', fontSize: 12 }}>
                            No active connections yet. Browse &ldquo;Discover Nearby Families&rdquo; to connect with families in Karad/Satara.
                          </div>
                        ) : (
                          connections.active.map((conn) => {
                            const isSelected = activeChatConnId === conn.id;
                            return (
                              <div
                                key={conn.id}
                                onClick={() => setActiveChatConnId(conn.id)}
                                style={{
                                  padding: '10px 12px',
                                  borderRadius: 8,
                                  background: isSelected ? '#ccfbf1' : '#ffffff',
                                  border: isSelected ? '1px solid #0d9488' : '1px solid #e2e8f0',
                                  cursor: 'pointer',
                                  marginBottom: 8,
                                  transition: 'all 0.2s ease',
                                }}
                              >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                  <span style={{ fontWeight: 700, fontSize: 13 }}>
                                    {conn.peer.displayName}
                                  </span>
                                  <Tag color="cyan" style={{ fontSize: 10, margin: 0 }}>
                                    {conn.peer.city}
                                  </Tag>
                                </div>
                                <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>
                                  {conn.peer.cancerType}
                                </div>
                                {conn.lastMessage && (
                                  <div
                                    style={{
                                      fontSize: 11,
                                      marginTop: 4,
                                      whiteSpace: 'nowrap',
                                      overflow: 'hidden',
                                      textOverflow: 'ellipsis',
                                    }}
                                  >
                                    {conn.lastMessage.isFromMe ? 'You: ' : ''}
                                    {conn.lastMessage.content}
                                  </div>
                                )}
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>
                  </Col>

                  {/* Right Column: Chat Conversation Window */}
                  <Col xs={24} md={16}>
                    <div
                      style={{
                        border: '1px solid #e2e8f0',
                        borderRadius: 12,
                        height: 520,
                        display: 'flex',
                        flexDirection: 'column',
                        background: '#ffffff',
                      }}
                    >
                      {chatData ? (
                        <>
                          {/* Chat Header */}
                          <div
                            style={{
                              padding: '14px 20px',
                              borderBottom: '1px solid #e2e8f0',
                              background: '#f8fafc',
                              borderTopLeftRadius: 12,
                              borderTopRightRadius: 12,
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                              <Avatar style={{ background: '#0d9488', fontWeight: 700 }}>
                                {chatData.peer.displayName.slice(0, 2).toUpperCase()}
                              </Avatar>
                              <div>
                                <div style={{ fontWeight: 700, fontSize: 14 }}>
                                  {chatData.peer.displayName}
                                </div>
                                <div style={{ fontSize: 11, color: '#64748b' }}>
                                  {chatData.peer.cancerType} • {chatData.peer.city}, {chatData.peer.district}
                                </div>
                              </div>
                            </div>
                            <Tag color="green">Secure In-App Chat</Tag>
                          </div>

                          {/* Chat Messages Body */}
                          <div
                            style={{
                              flex: 1,
                              padding: 20,
                              overflowY: 'auto',
                              background: '#fafafa',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: 12,
                            }}
                          >
                            {chatData.messages.length === 0 ? (
                              <div style={{ textAlign: 'center', margin: 'auto', color: '#94a3b8', fontSize: 13 }}>
                                <HeartOutlined style={{ fontSize: 28, color: '#0d9488', marginBottom: 8 }} />
                                <div>Connected! You can now freely exchange diet recipes and care experiences.</div>
                                <div style={{ fontSize: 11, marginTop: 4 }}>
                                  Suggested: Ask about how they handle liquid feeds, radiation throat inflammation, or nausea remedies.
                                </div>
                              </div>
                            ) : (
                              chatData.messages.map((m) => (
                                <div
                                  key={m.id}
                                  style={{
                                    alignSelf: m.isFromMe ? 'flex-end' : 'flex-start',
                                    maxWidth: '75%',
                                  }}
                                >
                                  <div
                                    style={{
                                      background: m.isFromMe ? '#0d9488' : '#ffffff',
                                      color: m.isFromMe ? '#ffffff' : '#1e293b',
                                      padding: '10px 14px',
                                      borderRadius: 14,
                                      border: m.isFromMe ? 'none' : '1px solid #e2e8f0',
                                      boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                                      fontSize: 13,
                                      lineHeight: 1.45,
                                    }}
                                  >
                                    {m.content}
                                  </div>
                                  <div
                                    style={{
                                      fontSize: 10,
                                      color: '#94a3b8',
                                      marginTop: 3,
                                      textAlign: m.isFromMe ? 'right' : 'left',
                                    }}
                                  >
                                    {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                  </div>
                                </div>
                              ))
                            )}
                          </div>

                          {/* Quick Message Suggestions */}
                          <div
                            style={{
                              padding: '8px 16px',
                              background: '#f8fafc',
                              borderTop: '1px solid #f1f5f9',
                              display: 'flex',
                              gap: 6,
                              overflowX: 'auto',
                            }}
                          >
                            <Button
                              size="small"
                              style={{ fontSize: 11, borderRadius: 12 }}
                              onClick={() => setChatMessageText('What liquid recipes have worked best for swallowing without throat pain?')}
                            >
                              🍲 Best liquid recipes?
                            </Button>
                            <Button
                              size="small"
                              style={{ fontSize: 11, borderRadius: 12 }}
                              onClick={() => setChatMessageText('How did your family tackle radiation fatigue and nausea during cycles?')}
                            >
                              ⚡ Managing radiation fatigue
                            </Button>
                            <Button
                              size="small"
                              style={{ fontSize: 11, borderRadius: 12 }}
                              onClick={() => setChatMessageText('Did you find any specialized high-protein oncological powder in Karad pharmacies?')}
                            >
                              💊 Karad pharmacies
                            </Button>
                          </div>

                          {/* Input Bar */}
                          <div style={{ padding: '12px 16px', borderTop: '1px solid #e2e8f0', display: 'flex', gap: 10 }}>
                            <Input
                              placeholder="Type a supportive message or diet question..."
                              value={chatMessageText}
                              onChange={(e) => setChatMessageText(e.target.value)}
                              onPressEnter={handleSendMessage}
                              disabled={sendingMessage}
                              style={{ borderRadius: 8 }}
                            />
                            <Button
                              type="primary"
                              icon={<SendOutlined />}
                              onClick={handleSendMessage}
                              loading={sendingMessage}
                              style={{ background: '#0d9488', borderColor: '#0d9488', borderRadius: 8 }}
                            >
                              Send
                            </Button>
                          </div>
                        </>
                      ) : (
                        <div style={{ margin: 'auto', textAlign: 'center', color: '#94a3b8' }}>
                          <MessageOutlined style={{ fontSize: 36, color: '#cbd5e1', marginBottom: 8 }} />
                          <div>Select an active connection on the left to view or start chatting.</div>
                        </div>
                      )}
                    </div>
                  </Col>
                </Row>
              ),
            },
            {
              key: 'nutrition-board',
              label: (
                <span style={{ fontWeight: 600, fontSize: 14 }}>
                  <BookOutlined /> Caregiver Nutrition & Recovery Exchange ({posts.length})
                </span>
              ),
              children: (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                  {/* Category Filter & Action Bar */}
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: 12,
                      background: '#f8fafc',
                      padding: '14px 18px',
                      borderRadius: 12,
                      border: '1px solid #e2e8f0',
                    }}
                  >
                    <Radio.Group
                      value={selectedPostCategory}
                      onChange={(e) => {
                        setSelectedPostCategory(e.target.value);
                        loadPosts(e.target.value);
                      }}
                      buttonStyle="solid"
                    >
                      <Radio.Button value="ALL">All Topics</Radio.Button>
                      <Radio.Button value={PostCategory.DIET_AND_DYSPHAGIA}>🥣 Dysphagia & Diets</Radio.Button>
                      <Radio.Button value={PostCategory.CHEMO_SIDE_EFFECTS}>🩺 Chemo & Radiation Tips</Radio.Button>
                      <Radio.Button value={PostCategory.LOCAL_LOGISTICS_AND_TRAVEL}>🚗 Karad / Travel Logistics</Radio.Button>
                      <Radio.Button value={PostCategory.EMOTIONAL_AND_FAMILY_SUPPORT}>💛 Caregiver Courage</Radio.Button>
                    </Radio.Group>

                    <Button
                      type="primary"
                      icon={<PlusOutlined />}
                      onClick={() => setPostModalOpen(true)}
                      style={{ background: '#0d9488', borderColor: '#0d9488', fontWeight: 600 }}
                    >
                      Share Diet Tip or Experience
                    </Button>
                  </div>

                  {/* Discussion Posts Stream */}
                  {loadingPosts ? (
                    <div style={{ textAlign: 'center', padding: '60px 0' }}>
                      <Spin size="large" />
                    </div>
                  ) : posts.length === 0 ? (
                    <Empty
                      image={Empty.PRESENTED_IMAGE_SIMPLE}
                      description="No posts yet in this category. Be the first to share a tested diet recipe or caregiver advice!"
                      style={{ padding: '40px 0' }}
                    >
                      <Button type="primary" onClick={() => setPostModalOpen(true)} style={{ background: '#0d9488' }}>
                        Create First Post
                      </Button>
                    </Empty>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                      {posts.map((post) => (
                        <Card
                          key={post.id}
                          style={{
                            borderRadius: 12,
                            border: '1px solid #e2e8f0',
                            boxShadow: '0 1px 4px rgba(0,0,0,0.03)',
                          }}
                          bodyStyle={{ padding: 20 }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                            <div>
                              <Tag color="cyan" style={{ fontWeight: 700, fontSize: 11, marginBottom: 6 }}>
                                {post.category.replace(/_/g, ' ')}
                              </Tag>
                              <Title level={5} style={{ margin: '0 0 4px 0' }}>
                                {post.title}
                              </Title>
                              <div style={{ fontSize: 12, color: '#64748b' }}>
                                Shared by <b>{post.author.displayName}</b> • {post.city}, {post.district} • {new Date(post.createdAt).toLocaleDateString()}
                              </div>
                            </div>
                            <Tag color="purple">{post.cancerType}</Tag>
                          </div>

                          <Paragraph style={{ fontSize: 13, lineHeight: 1.6, whiteSpace: 'pre-line', margin: '12px 0' }}>
                            {post.content}
                          </Paragraph>

                          <Divider style={{ margin: '12px 0' }} />

                          {/* Social Actions: Like & Comment */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                            <Button
                              type="text"
                              icon={<LikeOutlined style={{ color: '#0d9488' }} />}
                              onClick={() => handleLikePost(post.id)}
                              style={{ fontWeight: 600, color: '#0d9488' }}
                            >
                              Helpful ({post.likesCount})
                            </Button>
                            <span style={{ fontSize: 13, color: '#64748b' }}>
                              <CommentOutlined /> {post.commentsCount} Comments
                            </span>
                          </div>

                          {/* Comments List */}
                          {post.comments && post.comments.length > 0 && (
                            <div style={{ marginTop: 12, background: '#f8fafc', padding: 12, borderRadius: 8, display: 'flex', flexDirection: 'column', gap: 8 }}>
                              {post.comments.map((c) => (
                                <div key={c.id} style={{ fontSize: 12, borderBottom: '1px solid #f1f5f9', paddingBottom: 6 }}>
                                  <span style={{ fontWeight: 700 }}>{c.author.displayName}: </span>
                                  <span>{c.content}</span>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Add Comment Bar */}
                          <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                            <Input
                              size="small"
                              placeholder="Write a supportive reply or follow-up question..."
                              value={commentInputs[post.id] || ''}
                              onChange={(e) => setCommentInputs({ ...commentInputs, [post.id]: e.target.value })}
                              onPressEnter={() => handleAddComment(post.id)}
                              style={{ borderRadius: 6 }}
                            />
                            <Button size="small" type="primary" onClick={() => handleAddComment(post.id)} style={{ background: '#0d9488' }}>
                              Reply
                            </Button>
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              ),
            },
            {
              key: 'profile',
              label: (
                <span style={{ fontWeight: 600, fontSize: 14 }}>
                  <UserOutlined /> My Family Profile & Privacy
                </span>
              ),
              children: (
                <div style={{ maxWidth: 800, margin: '0 auto' }}>
                  <Card
                    style={{ borderRadius: 12, border: '1px solid #e2e8f0' }}
                    title={
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <SafetyCertificateOutlined style={{ color: '#0d9488' }} />
                        <span>Manage Your Peer Profile & Privacy Preferences</span>
                      </div>
                    }
                  >
                    {profileLoading ? (
                      <div style={{ textAlign: 'center', padding: '40px 0' }}>
                        <Spin />
                      </div>
                    ) : (
                      <Form form={profileForm} layout="vertical" onFinish={handleSaveProfile}>
                        <Row gutter={16}>
                          <Col xs={24} sm={12}>
                            <Form.Item
                              name="memberType"
                              label="I am participating as"
                              rules={[{ required: true }]}
                            >
                              <Select>
                                <Option value={MemberType.FAMILY_CAREGIVER}>Family Caregiver (Son/Daughter/Spouse)</Option>
                                <Option value={MemberType.PATIENT}>Cancer Patient</Option>
                              </Select>
                            </Form.Item>
                          </Col>

                          <Col xs={24} sm={12}>
                            <Form.Item
                              name="caregiverRelation"
                              label="Family Relationship"
                              rules={[{ required: true }]}
                            >
                              <Select>
                                <Option value="Son">Son (मुलगा)</Option>
                                <Option value="Daughter">Daughter (मुलगी)</Option>
                                <Option value="Spouse">Spouse / Partner</Option>
                                <Option value="Parent">Parent</Option>
                                <Option value="Sibling">Sibling</Option>
                                <Option value="Patient">Self (Patient)</Option>
                              </Select>
                            </Form.Item>
                          </Col>
                        </Row>

                        {/* Privacy Mode */}
                        <Form.Item
                          name="privacyMode"
                          label="Privacy & Stigma Protection Mode"
                          rules={[{ required: true }]}
                          extra="Choose how other families see your name in the peer directory."
                        >
                          <Radio.Group>
                            <Radio value={PeerPrivacyMode.ANONYMOUS_ALIAS}>
                              <b>Anonymous Alias</b> (e.g. <i>&ldquo;Son of Esophageal Caregiver - Karad&rdquo;</i>) — Maximum Privacy
                            </Radio>
                            <Radio value={PeerPrivacyMode.FIRST_NAME_ONLY}>
                              <b>First Name Only</b> (e.g. <i>&ldquo;Snehal K.&rdquo;</i>)
                            </Radio>
                            <Radio value={PeerPrivacyMode.FULL_NAME}>
                              <b>Full Name</b> (e.g. <i>&ldquo;Snehal Kulkarni&rdquo;</i>)
                            </Radio>
                          </Radio.Group>
                        </Form.Item>

                        <Form.Item
                          name="displayName"
                          label="Custom Display Handle / Alias"
                          rules={[{ required: true }]}
                        >
                          <Input placeholder="e.g. Son of Esophageal Patient - Karad" />
                        </Form.Item>

                        <Row gutter={16}>
                          <Col xs={24} sm={12}>
                            <Form.Item
                              name="cancerType"
                              label="Cancer Type"
                              rules={[{ required: true }]}
                            >
                              <Select>
                                <Option value="Esophageal Cancer">Esophageal Cancer (ग्रास नलीचा कर्करोग)</Option>
                                <Option value="Breast Cancer">Breast Cancer</Option>
                                <Option value="Head & Neck Cancer">Head & Neck / Oral Cancer</Option>
                                <Option value="Lung Cancer">Lung Cancer</Option>
                                <Option value="Gastric / Stomach Cancer">Gastric / Stomach Cancer</Option>
                                <Option value="Colorectal Cancer">Colorectal Cancer</Option>
                              </Select>
                            </Form.Item>
                          </Col>

                          <Col xs={24} sm={12}>
                            <Form.Item name="cancerSubsite" label="Tumor Subsite / Stage">
                              <Input placeholder="e.g. Mid-Thoracic Esophagus • Stage III" />
                            </Form.Item>
                          </Col>
                        </Row>

                        <Form.Item
                          name="treatmentPhase"
                          label="Current Treatment Phase"
                          rules={[{ required: true }]}
                        >
                          <Select>
                            <Option value={CareTreatmentPhase.ACTIVE_CHEMO_RT}>Concurrent Chemo-Radiotherapy</Option>
                            <Option value={CareTreatmentPhase.NEWLY_DIAGNOSED}>Newly Diagnosed / Staging Workup</Option>
                            <Option value={CareTreatmentPhase.SURGERY_PREPARATION}>Pre-Operative Preparation</Option>
                            <Option value={CareTreatmentPhase.POST_SURGERY_RECOVERY}>Post-Surgical Recovery & Rehabilitation</Option>
                            <Option value={CareTreatmentPhase.SURVIVORSHIP_SURVEILLANCE}>Survivorship & Follow-up Surveillance</Option>
                            <Option value={CareTreatmentPhase.PALLIATIVE_CARE}>Palliative Comfort & Symptom Management</Option>
                          </Select>
                        </Form.Item>

                        <Row gutter={16}>
                          <Col xs={24} sm={8}>
                            <Form.Item name="city" label="City / Town" rules={[{ required: true }]}>
                              <Input placeholder="e.g. Karad" />
                            </Form.Item>
                          </Col>
                          <Col xs={24} sm={8}>
                            <Form.Item name="district" label="District" rules={[{ required: true }]}>
                              <Input placeholder="e.g. Satara" />
                            </Form.Item>
                          </Col>
                          <Col xs={24} sm={8}>
                            <Form.Item name="postalCode" label="PIN Code">
                              <Input placeholder="e.g. 415110" />
                            </Form.Item>
                          </Col>
                        </Row>

                        <Form.Item
                          name="bio"
                          label="Family Journey Bio"
                          rules={[{ required: true }]}
                          extra="Share what you are going through and what kind of support or exchange you are open to."
                        >
                          <TextArea
                            rows={3}
                            placeholder="Caring for my mother, 58, diagnosed with mid-esophageal cancer. Looking to connect with nearby families in Satara/Karad to share diet recipes and moral courage."
                          />
                        </Form.Item>

                        <Form.Item
                          name="dietaryAdvice"
                          label="Tested Diet Recipes & Dysphagia Solutions to Share"
                          extra="Practical pureed diets, throat-soothing recipes, or high-protein drinks that helped your loved one swallow easily."
                        >
                          <TextArea
                            rows={3}
                            placeholder="e.g. Cool ragi porridge with milk, blended moong dal with ghee, tender coconut water. Avoid lemon and black pepper."
                          />
                        </Form.Item>

                        <Form.Item
                          name="treatmentExperience"
                          label="Precautions & Lifestyle Tips"
                          extra="What precautions helped tackle fatigue, mouth sores, or radiation inflammation?"
                        >
                          <TextArea
                            rows={2}
                            placeholder="e.g. Baking soda mouth rinse after meals, head elevation 30 degrees while resting."
                          />
                        </Form.Item>

                        <Row gutter={16}>
                          <Col xs={24} sm={12}>
                            <Form.Item
                              name="isOptedIn"
                              valuePropName="checked"
                              label="Community Visibility"
                            >
                              <Switch /> <span style={{ marginLeft: 8 }}>Visible in CareCircles directory for nearby families</span>
                            </Form.Item>
                          </Col>

                          <Col xs={24} sm={12}>
                            <Form.Item
                              name="isOpenToChat"
                              valuePropName="checked"
                              label="1-on-1 Messages"
                            >
                              <Switch /> <span style={{ marginLeft: 8 }}>Allow nearby families to send connection requests</span>
                            </Form.Item>
                          </Col>
                        </Row>

                        <Button
                          type="primary"
                          htmlType="submit"
                          loading={savingProfile}
                          style={{ background: '#0d9488', borderColor: '#0d9488', height: 40, fontWeight: 700, width: '100%', marginTop: 10 }}
                        >
                          Save Profile & Preferences
                        </Button>
                      </Form>
                    )}
                  </Card>
                </div>
              ),
            },
          ]}
        />
      </Card>

      {/* Modal: View Full Family Story & Diet Advice */}
      <Modal
        title={
          selectedPeerModal && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Avatar style={{ background: '#0d9488', fontWeight: 700 }}>
                {selectedPeerModal.displayName.slice(0, 2).toUpperCase()}
              </Avatar>
              <div>
                <div style={{ fontSize: 16, fontWeight: 700 }}>{selectedPeerModal.displayName}</div>
                <div style={{ fontSize: 12, color: '#64748b' }}>
                  {selectedPeerModal.cancerType} • {selectedPeerModal.city}, {selectedPeerModal.district}
                </div>
              </div>
            </div>
          )
        }
        open={!!selectedPeerModal}
        onCancel={() => setSelectedPeerModal(null)}
        footer={[
          <Button key="close" onClick={() => setSelectedPeerModal(null)}>
            Close
          </Button>,
          selectedPeerModal && selectedPeerModal.connectionStatus === 'CONNECTED' ? (
            <Button
              key="chat"
              type="primary"
              style={{ background: '#059669' }}
              onClick={() => {
                if (selectedPeerModal.connectionId) setActiveChatConnId(selectedPeerModal.connectionId);
                setSelectedPeerModal(null);
                setActiveTab('chat');
              }}
            >
              Open Chat
            </Button>
          ) : selectedPeerModal && selectedPeerModal.connectionStatus === 'NONE' ? (
            <Button
              key="connect"
              type="primary"
              style={{ background: '#0d9488' }}
              onClick={() => {
                const peer = selectedPeerModal;
                setSelectedPeerModal(null);
                handleOpenConnect(peer);
              }}
            >
              Connect with Family
            </Button>
          ) : null,
        ]}
      >
        {selectedPeerModal && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, paddingTop: 10 }}>
            <div>
              <Text strong style={{ fontSize: 12, textTransform: 'uppercase' }}>
                Diagnosis & Stage
              </Text>
              <div style={{ fontSize: 14, fontWeight: 600, marginTop: 2 }}>
                {selectedPeerModal.cancerType} {selectedPeerModal.cancerSubsite ? `(${selectedPeerModal.cancerSubsite})` : ''} • {selectedPeerModal.cancerStage || 'Stage Under Treatment'}
              </div>
              <div style={{ fontSize: 12, color: '#0d9488', fontWeight: 600, marginTop: 2 }}>
                Phase: {selectedPeerModal.treatmentPhase?.replace(/_/g, ' ')}
              </div>
            </div>

            <Divider style={{ margin: '4px 0' }} />

            <div>
              <Text strong style={{ fontSize: 12, textTransform: 'uppercase' }}>
                Family Caregiver Journey
              </Text>
              <div style={{ fontSize: 13, lineHeight: 1.5, marginTop: 4 }}>
                {selectedPeerModal.bio}
              </div>
            </div>

            {selectedPeerModal.dietaryAdvice && (
              <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8, padding: 12 }}>
                <div style={{ fontWeight: 700, color: '#166534', fontSize: 13, marginBottom: 4 }}>
                  🥣 Tried & Tested Diet Solution:
                </div>
                <div style={{ fontSize: 13, color: '#14532d', lineHeight: 1.5 }}>
                  {selectedPeerModal.dietaryAdvice}
                </div>
              </div>
            )}

            {selectedPeerModal.treatmentExperience && (
              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, padding: 12 }}>
                <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 4 }}>
                  🩺 Recovery Precautions & Daily Tips:
                </div>
                <div style={{ fontSize: 13, lineHeight: 1.5 }}>
                  {selectedPeerModal.treatmentExperience}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Modal: Send Connection Request */}
      <Modal
        title={`Connect with ${targetPeerForConnect?.displayName}`}
        open={connectModalOpen}
        onCancel={() => setConnectModalOpen(false)}
        onOk={handleSendConnectRequest}
        confirmLoading={sendingConnect}
        okText="Send Request"
        okButtonProps={{ style: { background: '#0d9488' } }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, paddingTop: 10 }}>
          <Text style={{ fontSize: 13, color: '#64748b' }}>
            Sending a connection request enables safe 1-on-1 messaging with this family without sharing private phone numbers.
          </Text>

          <TextArea
            rows={4}
            value={connectNote}
            onChange={(e) => setConnectNote(e.target.value)}
            placeholder="Personalize your greeting note..."
          />
        </div>
      </Modal>

      {/* Modal: Publish Discussion Post */}
      <Modal
        title="Share Diet Tip or Caregiver Experience with CareCircles"
        open={postModalOpen}
        onCancel={() => setPostModalOpen(false)}
        footer={null}
      >
        <Form form={postForm} layout="vertical" onFinish={handleCreatePost} initialValues={{ category: PostCategory.DIET_AND_DYSPHAGIA }}>
          <Form.Item name="category" label="Category" rules={[{ required: true }]}>
            <Select>
              <Option value={PostCategory.DIET_AND_DYSPHAGIA}>🥣 Dysphagia & Liquid Diets</Option>
              <Option value={PostCategory.CHEMO_SIDE_EFFECTS}>🩺 Chemo & Radiation Side Effects</Option>
              <Option value={PostCategory.LOCAL_LOGISTICS_AND_TRAVEL}>🚗 Karad / Western Maharashtra Travel & Care</Option>
              <Option value={PostCategory.EMOTIONAL_AND_FAMILY_SUPPORT}>💛 Caregiver Courage & Moral Support</Option>
            </Select>
          </Form.Item>

          <Form.Item name="cancerType" label="Cancer Type" initialValue="Esophageal Cancer" rules={[{ required: true }]}>
            <Input placeholder="e.g. Esophageal Cancer" />
          </Form.Item>

          <Form.Item name="title" label="Post Title" rules={[{ required: true }]}>
            <Input placeholder="e.g. High-protein smooth dal and cooled ragi soup recipe for swallowing difficulties" />
          </Form.Item>

          <Form.Item name="content" label="Experience / Recipe / Precaution Details" rules={[{ required: true }]}>
            <TextArea
              rows={5}
              placeholder="Describe the preparation steps, temperature of food, precautions with spices, and what your loved one experienced..."
            />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="city" label="City" initialValue="Karad">
                <Input placeholder="e.g. Karad" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="district" label="District" initialValue="Satara">
                <Input placeholder="e.g. Satara" />
              </Form.Item>
            </Col>
          </Row>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 16 }}>
            <Button onClick={() => setPostModalOpen(false)}>Cancel</Button>
            <Button type="primary" htmlType="submit" loading={submittingPost} style={{ background: '#0d9488', borderColor: '#0d9488' }}>
              Publish Experience
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
}
