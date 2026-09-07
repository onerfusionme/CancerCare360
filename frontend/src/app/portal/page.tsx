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
  HomeOutlined
} from '@ant-design/icons';
import { useRouter } from 'next/navigation';

const { Title, Text, Paragraph } = Typography;

export default function PortalDashboard() {
  const router = useRouter();

  const patient = {
    firstName: 'Priya',
    lastName: 'Sharma',
    mrn: 'MRN-ONC-2026-001',
    abhaId: '91-5544-3322-1100',
    cancerType: 'Breast Cancer (Stage IIB)',
    regimen: 'AC-T Neoadjuvant Protocol',
    stage: 'Cycle 4 Infusion (Paused for ANC Test)',
    doctor: 'Dr. Jane Smith',
    coordinator: 'Pooja Verma (RN)',
  };

  const handleHomeSample = () => {
    message.success('Home sample phlebotomy request booked! A technician will call you within 30 minutes.');
  };

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
                ACTIVE CARE JOURNEY • BREAST ONCOLOGY
              </span>
            </div>
            <h1 style={{ fontSize: 24, fontWeight: 700, margin: '0 0 6px 0', color: '#ffffff' }}>
              Welcome, {patient.firstName} {patient.lastName}
            </h1>
            <p style={{ margin: 0, fontSize: 13, color: '#e6fffa', lineHeight: 1.5, maxWidth: 620 }}>
              You are currently on <strong style={{ color: '#ffffff' }}>Cycle 3 of 6</strong> of your neoadjuvant chemotherapy journey. 
              Your treating oncologist is <strong style={{ color: '#ffffff' }}>{patient.doctor}</strong> and your dedicated care coordinator is <strong style={{ color: '#ffffff' }}>{patient.coordinator}</strong>.
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

      {/* Critical Action Alert: Pending Lab before Cycle 4 */}
      <Card 
        style={{ 
          borderRadius: 12, 
          border: '1px solid #fde68a', 
          background: '#fffbeb',
          boxShadow: '0 2px 8px rgba(217, 119, 6, 0.08)' 
        }}
        bodyStyle={{ padding: 20 }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
          <div style={{ display: 'flex', gap: 14 }}>
            <div style={{
              width: 42,
              height: 42,
              borderRadius: 10,
              background: '#d97706',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 20,
              flexShrink: 0,
            }}>
              <ClockCircleOutlined />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 16, fontWeight: 700, color: '#92400e' }}>
                  Action Needed: Pre-Chemotherapy Blood Count (ANC)
                </span>
                <Tag color="gold" style={{ fontWeight: 700 }}>AWAITING TEST</Tag>
              </div>
              <p style={{ margin: '6px 0 0', fontSize: 13, color: '#78350f', maxWidth: 680, lineHeight: 1.5 }}>
                Your body is recovering from Cycle 3. To make sure your white blood cells are strong and safe for Cycle 4, Dr. Smith has ordered a routine ANC blood test. You can have this done at our hospital daycare or request a complimentary sample pickup at your home.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <Button 
              type="primary" 
              icon={<HomeOutlined />} 
              onClick={handleHomeSample}
              style={{ background: '#d97706', borderColor: '#d97706', fontWeight: 600 }}
            >
              Book Free Home Phlebotomy
            </Button>
            <Button 
              icon={<PhoneOutlined />}
              onClick={() => message.info('Connecting to Care Coordinator Pooja Verma (+91-98765-43210)')}
              style={{ borderColor: '#fde68a', color: '#92400e' }}
            >
              Speak with Nurse Pooja
            </Button>
          </div>
        </div>
      </Card>

      {/* Visual Treatment Progress Roadmap */}
      <Card 
        title={
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <HistoryOutlined style={{ color: '#0d9488' }} />
              <span style={{ fontSize: 16, fontWeight: 700, color: '#0f172a' }}>
                Your Healing Journey & Roadmap
              </span>
            </div>
            <Tag color="cyan" style={{ fontWeight: 600 }}>50% Of Chemo Regimen Completed</Tag>
          </div>
        }
        style={{ borderRadius: 12, border: '1px solid #e2e8f0' }}
        bodyStyle={{ padding: 24 }}
      >
        <Progress 
          percent={50} 
          strokeColor={{ '0%': '#0d9488', '100%': '#059669' }} 
          status="active" 
          style={{ marginBottom: 24 }}
        />

        <Row gutter={[20, 20]}>
          <Col xs={24} sm={12} md={6}>
            <div style={{ padding: 14, background: '#f0fdf4', borderRadius: 10, border: '1px solid #bbf7d0', height: '100%' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#16a34a', fontWeight: 700, fontSize: 12 }}>
                <CheckCircleOutlined /> COMPLETED
              </div>
              <div style={{ fontWeight: 700, color: '#0f172a', fontSize: 14, marginTop: 4 }}>
                Diagnostic Workup & Biopsy
              </div>
              <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>
                Nov 2025 • Confirmed Stage IIB • Port inserted
              </div>
            </div>
          </Col>

          <Col xs={24} sm={12} md={6}>
            <div style={{ padding: 14, background: '#f0fdf4', borderRadius: 10, border: '1px solid #bbf7d0', height: '100%' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#16a34a', fontWeight: 700, fontSize: 12 }}>
                <CheckCircleOutlined /> COMPLETED
              </div>
              <div style={{ fontWeight: 700, color: '#0f172a', fontSize: 14, marginTop: 4 }}>
                Cycles 1, 2 & 3 Chemo
              </div>
              <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>
                Dec 2025 – Jan 2026 • Tumor reduced from 3.4cm to 2.1cm!
              </div>
            </div>
          </Col>

          <Col xs={24} sm={12} md={6}>
            <div style={{ padding: 14, background: '#fffbeb', borderRadius: 10, border: '1px solid #fde68a', height: '100%' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#d97706', fontWeight: 700, fontSize: 12 }}>
                <ClockCircleOutlined /> CURRENT STEP
              </div>
              <div style={{ fontWeight: 700, color: '#0f172a', fontSize: 14, marginTop: 4 }}>
                Cycle 4 Infusion
              </div>
              <div style={{ fontSize: 12, color: '#78350f', marginTop: 4 }}>
                Awaiting ANC blood count to ensure safe infusion
              </div>
            </div>
          </Col>

          <Col xs={24} sm={12} md={6}>
            <div style={{ padding: 14, background: '#f8fafc', borderRadius: 10, border: '1px solid #e2e8f0', height: '100%' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#94a3b8', fontWeight: 700, fontSize: 12 }}>
                UPCOMING
              </div>
              <div style={{ fontWeight: 700, color: '#475569', fontSize: 14, marginTop: 4 }}>
                PET Scan & Surgery Planning
              </div>
              <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>
                Mid-treatment response assessment with Dr. Smith
              </div>
            </div>
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

