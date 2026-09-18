'use client';

import React, { useState } from 'react';
import { Card, Row, Col, Typography, Button, Badge, Alert, Space, Progress, Tag, Timeline, message } from 'antd';
import { 
  CalendarOutlined, 
  HistoryOutlined, 
  FileTextOutlined, 
  BookOutlined, 
  SafetyCertificateOutlined,
  PhoneOutlined,
  HeartOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  MedicineBoxOutlined,
  RightOutlined,
  HomeOutlined,
  TeamOutlined
} from '@ant-design/icons';
import { useRouter } from 'next/navigation';

import { useAuthStore } from '@/stores/auth.store';

const { Title, Text, Paragraph } = Typography;

export default function PortalDashboard() {
  const router = useRouter();
  const user = useAuthStore(state => state.user);

  const patientName = user?.firstName 
    ? `${user.firstName} ${user.lastName || ''}`.trim() 
    : (user?.email ? user.email.split('@')[0] : 'Patient');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Patient Welcome Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #0f766e 0%, #0d9488 50%, #047857 100%)',
        borderRadius: 14,
        padding: '24px 28px',
        color: '#ffffff',
        boxShadow: '0 8px 20px -4px rgba(13, 148, 136, 0.25)',
      }}>
        <Row gutter={[20, 20]} align="middle">
          <Col xs={24} md={16}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 10px', background: 'rgba(255, 255, 255, 0.15)', borderRadius: 20, marginBottom: 8 }}>
              <HeartOutlined style={{ color: '#a7f3d0' }} />
              <span style={{ fontSize: 11, fontWeight: 600, color: '#f0fdf4' }}>
                ONCOLOGY CARE CONTINUUM • PATIENT PORTAL
              </span>
            </div>
            <h1 style={{ fontSize: 24, fontWeight: 700, margin: '0 0 6px 0', color: '#ffffff' }}>
              Welcome, {patientName}
            </h1>
            <p style={{ margin: 0, fontSize: 13, color: '#e6fffa', lineHeight: 1.5, maxWidth: 620 }}>
              Access your appointments, clinical investigations, treatment plans, and verified educational resources.
            </p>
          </Col>

          <Col xs={24} md={8} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{
              background: 'rgba(255, 255, 255, 0.12)',
              borderRadius: 10,
              padding: '12px 16px',
              backdropFilter: 'blur(4px)',
            }}>
              <div style={{ fontSize: 11, color: '#ccfbf1', textTransform: 'uppercase', fontWeight: 600 }}>
                24/7 Nurse Triage Line
              </div>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#ffffff', marginTop: 2 }}>
                +91-1800-419-CARE
              </div>
              <div style={{ fontSize: 11, color: '#e6fffa', marginTop: 2 }}>
                Call anytime for fever, nausea, or urgent questions
              </div>
            </div>
          </Col>
        </Row>
      </div>

      {/* Treatment Roadmap Card */}
      <Card 
        title={
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <HistoryOutlined style={{ color: '#0d9488' }} />
              <span style={{ fontSize: 16, fontWeight: 700, color: '#0f172a' }}>
                Your Healing Journey & Roadmap
              </span>
            </div>
          </div>
        }
        style={{ borderRadius: 12, border: '1px solid #e2e8f0' }}
        bodyStyle={{ padding: 24 }}
      >
        <div style={{ textAlign: 'center', padding: '24px 0', color: '#64748b' }}>
          No active chemotherapy or radiation treatment protocol assigned yet. Your oncologist will initialize your roadmap upon consultation.
        </div>
      </Card>

      {/* CareCircles Peer & Family Network Banner */}
      <Card
        style={{
          borderRadius: 14,
          border: '1px solid #ccfbf1',
          background: 'linear-gradient(135deg, #f0fdfa 0%, #ffffff 100%)',
          boxShadow: '0 2px 8px rgba(13, 148, 136, 0.08)',
        }}
        bodyStyle={{ padding: 22 }}
      >
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} md={17}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <Tag color="cyan" style={{ fontWeight: 700, borderRadius: 12 }}>
                <TeamOutlined /> CARECIRCLES NETWORK
              </Tag>
              <span style={{ fontSize: 12, color: '#0d9488', fontWeight: 600 }}>
                Karad & Satara District Families
              </span>
            </div>
            <Title level={4} style={{ margin: '0 0 6px 0', color: '#0f172a' }}>
              Connect with Families Fighting Similar Cancer in Your City
            </Title>
            <Paragraph style={{ margin: 0, fontSize: 13, color: '#475569', lineHeight: 1.5 }}>
              Exchange dysphagia & soft diet recipes, manage radiation/chemo side effects, and chat privately 1-on-1 with families nearby who understand the journey.
            </Paragraph>
          </Col>
          <Col xs={24} md={7} style={{ textAlign: 'right' }}>
            <Button
              type="primary"
              size="large"
              icon={<TeamOutlined />}
              onClick={() => router.push('/portal/community')}
              style={{ background: '#0d9488', borderColor: '#0d9488', fontWeight: 700, borderRadius: 8 }}
            >
              Enter CareCircles
            </Button>
          </Col>
        </Row>
      </Card>

      {/* Quick Access Tiles */}
      <Row gutter={[20, 20]}>
        <Col xs={24} sm={12} md={6}>
          <Card 
            hoverable
            onClick={() => router.push('/portal/appointments')}
            style={{ borderRadius: 12, border: '1px solid #e2e8f0', textAlign: 'center' }}
            bodyStyle={{ padding: 24 }}
          >
            <div style={{
              width: 48,
              height: 48,
              borderRadius: 12,
              background: '#e0e7ff',
              color: '#4f46e5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 22,
              margin: '0 auto 12px'
            }}>
              <CalendarOutlined />
            </div>
            <div style={{ fontWeight: 700, fontSize: 14, color: '#0f172a' }}>My Appointments</div>
            <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>View upcoming clinic & daycare visits</div>
          </Card>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Card 
            hoverable
            onClick={() => router.push('/portal/records')}
            style={{ borderRadius: 12, border: '1px solid #e2e8f0', textAlign: 'center' }}
            bodyStyle={{ padding: 24 }}
          >
            <div style={{
              width: 48,
              height: 48,
              borderRadius: 12,
              background: '#ecfdf5',
              color: '#059669',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 22,
              margin: '0 auto 12px'
            }}>
              <FileTextOutlined />
            </div>
            <div style={{ fontWeight: 700, fontSize: 14, color: '#0f172a' }}>Lab & Imaging Reports</div>
            <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>Blood work, mammograms & ABHA sync</div>
          </Card>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Card 
            hoverable
            onClick={() => router.push('/portal/education')}
            style={{ borderRadius: 12, border: '1px solid #e2e8f0', textAlign: 'center' }}
            bodyStyle={{ padding: 24 }}
          >
            <div style={{
              width: 48,
              height: 48,
              borderRadius: 12,
              background: '#fef3c7',
              color: '#d97706',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 22,
              margin: '0 auto 12px'
            }}>
              <BookOutlined />
            </div>
            <div style={{ fontWeight: 700, fontSize: 14, color: '#0f172a' }}>Chemotherapy Guides</div>
            <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>Managing fatigue, diet & neuropathy</div>
          </Card>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Card 
            hoverable
            onClick={() => router.push('/portal/journey')}
            style={{ borderRadius: 12, border: '1px solid #e2e8f0', textAlign: 'center' }}
            bodyStyle={{ padding: 24 }}
          >
            <div style={{
              width: 48,
              height: 48,
              borderRadius: 12,
              background: '#f3e8ff',
              color: '#7c3aed',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 22,
              margin: '0 auto 12px'
            }}>
              <MedicineBoxOutlined />
            </div>
            <div style={{ fontWeight: 700, fontSize: 14, color: '#0f172a' }}>Treatment Timeline</div>
            <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>Detailed clinical milestones</div>
          </Card>
        </Col>
      </Row>
    </div>
  );
}

