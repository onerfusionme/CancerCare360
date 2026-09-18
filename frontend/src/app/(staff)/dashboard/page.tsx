'use client';

import React, { useState } from 'react';
import { 
  Segmented, 
  Card, 
  Row, 
  Col, 
  Statistic, 
  List, 
  Typography, 
  Space, 
  Button, 
  Skeleton,
  Tag,
  Alert,
  Badge,
  Progress, 
  Divider, 
  Tooltip,
  Dropdown,
  Empty
} from 'antd';
import { 
  ArrowUpOutlined, 
  ArrowDownOutlined, 
  PlusOutlined, 
  CalendarOutlined, 
  FileTextOutlined,
  AlertOutlined,
  CheckCircleOutlined,
  InfoCircleOutlined,
  WarningOutlined,
  ClockCircleOutlined,
  ThunderboltOutlined,
  UserOutlined,
  MedicineBoxOutlined,
  RightOutlined,
  PhoneOutlined,
  CheckOutlined,
  ExperimentOutlined,
  UserAddOutlined
} from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import { useRoleDashboard } from '@/hooks/use-analytics';
import { useAppStore } from '@/stores/app.store';
import { useAuth } from '@/hooks/use-auth';
import { UserRole } from '@/types/auth';

const { Title, Text, Paragraph } = Typography;

export default function DashboardPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { themeMode } = useAppStore();
  const isDark = themeMode === 'dark';

  // Automatically determine view based on the authenticated user's actual role
  const userRoles = (user?.roles || []) as any[];
  const isAdmin = userRoles.includes(UserRole.ADMIN) || userRoles.includes('ADMIN');
  const isCoordinator = userRoles.includes(UserRole.CARE_COORDINATOR) || userRoles.includes('CARE_COORDINATOR');
  const activeRole = isAdmin ? 'Administrator' : isCoordinator ? 'Care Coordinator' : 'Oncologist';

  const { data, isLoading, isError } = useRoleDashboard(activeRole);

  const textPrimary = isDark ? '#f8fafc' : '#0f172a';
  const textSecondary = isDark ? '#94a3b8' : '#64748b';
  const cardBg = isDark ? '#0f172a' : '#ffffff';
  const cardBorder = isDark ? '#1e293b' : '#e2e8f0';
  const innerCardBg = isDark ? '#131c2e' : '#f8fafc';

  const roleLabel = isAdmin 
    ? 'System Administrator' 
    : isCoordinator 
      ? 'Care Coordinator' 
      : 'Consultant Oncologist';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Top Bar: Title, Quick Actions, and Role Badge */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Title level={3} style={{ margin: 0, color: textPrimary, fontWeight: 700 }}>
              Clinical Dashboard
            </Title>
            <Tag color="indigo" style={{ 
              background: isDark ? 'rgba(99, 102, 241, 0.2)' : '#e0e7ff', 
              color: isDark ? '#a5b4fc' : '#4338ca', 
              border: isDark ? '1px solid rgba(99, 102, 241, 0.4)' : '1px solid #c7d2fe', 
              fontWeight: 600 
            }}>
              DASHBOARD OVERVIEW
            </Tag>
          </div>
          <Text style={{ fontSize: 13, color: textSecondary }}>
            Continuous care tracking, automated gap detection & clinic flow orchestration
          </Text>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Tag color={isAdmin ? 'purple' : isCoordinator ? 'cyan' : 'blue'} style={{ 
            borderRadius: 6, 
            padding: '4px 10px', 
            fontSize: 12, 
            fontWeight: 700,
            border: 'none',
            letterSpacing: '0.04em',
            textTransform: 'uppercase'
          }}>
            {isAdmin ? '🛡️ Administrator Workspace' : isCoordinator ? '📋 Care Coordinator Desk' : '🩺 Clinical Oncology View'}
          </Tag>

          <Dropdown
            menu={{
              items: [
                { key: '1', label: 'Register New Patient', icon: <UserAddOutlined />, onClick: () => router.push('/patients') },
                { key: '2', label: 'Book Appointment', icon: <CalendarOutlined />, onClick: () => router.push('/appointments') },
                { key: '3', label: 'Order Investigation', icon: <ExperimentOutlined />, onClick: () => router.push('/investigations') },
                { key: '4', label: 'Care Gap Task Desk', icon: <AlertOutlined />, onClick: () => router.push('/gaps') },
              ]
            }}
          >
            <Button type="primary" icon={<PlusOutlined />} style={{ fontWeight: 600 }}>
              + Quick Action
            </Button>
          </Dropdown>
        </div>
      </div>

      {/* Clinical Hero Banner - Executive Glassmorphic Style */}
      <div 
        className="glass-hero"
        style={{
          borderRadius: 18,
          padding: '24px 28px',
          marginBottom: 8,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Row gutter={[24, 20]} align="middle">
          <Col xs={24} md={16}>
            <div 
              className="glass-pill"
              style={{ 
                display: 'inline-flex', 
                alignItems: 'center', 
                gap: 8, 
                padding: '6px 14px', 
                borderRadius: 20, 
                marginBottom: 14 
              }}
            >
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981', boxShadow: '0 0 8px #10b981' }} />
              <span style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: '0.05em', color: isDark ? '#a7f3d0' : '#047857' }}>
                ACTIVE CLINIC • {data?.departmentName || 'CITY CANCER CENTER'}
              </span>
            </div>
            <h2 style={{ fontSize: 26, fontWeight: 800, margin: '0 0 8px 0', color: textPrimary, letterSpacing: '-0.02em' }}>
              Welcome back, {user?.firstName ? `${user.firstName} ${user.lastName}` : roleLabel}
            </h2>
            <p style={{ margin: 0, fontSize: 14, color: textSecondary, lineHeight: 1.6, maxWidth: 660 }}>
              {isAdmin 
                ? 'Institutional overview of oncology departments, patient census, turnaround SLAs, and system audit logs.'
                : isCoordinator
                  ? `Care continuity task queue: monitoring active patient follow-up appointments and overdue milestones.`
                  : `You have ${data?.patientsToday || 0} patients on your clinic roster today. ${(data?.criticalGaps || 0) > 0 ? `${data?.criticalGaps} patients have critical care gaps.` : ''} Average wait time is currently ${data?.avgWaitTime || 0} minutes.`}
            </p>
          </Col>

          <Col xs={24} md={8} style={{ display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'flex-start', justifyContent: 'center' }}>
            <Button 
              type="primary" 
              size="large" 
              icon={<FileTextOutlined />}
              onClick={() => router.push('/consultations')}
              style={{ 
                background: 'linear-gradient(135deg, #0d9488 0%, #0f766e 100%)', 
                borderColor: 'transparent',
                color: '#ffffff', 
                fontWeight: 700,
                width: '100%',
                height: 44,
                borderRadius: 12,
                boxShadow: '0 4px 14px rgba(13, 148, 136, 0.3)',
              }}
            >
              Open Consultation Readiness
            </Button>
            <div style={{ display: 'flex', gap: 10, width: '100%' }}>
              <Button 
                size="middle" 
                icon={<CalendarOutlined />}
                onClick={() => router.push('/appointments')}
                style={{ 
                  flex: 1, 
                  background: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(255, 255, 255, 0.75)', 
                  backdropFilter: 'blur(8px)',
                  borderColor: isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(226, 232, 240, 0.8)', 
                  color: textPrimary,
                  fontWeight: 600,
                  fontSize: 13,
                  borderRadius: 10,
                  height: 38
                }}
              >
                Clinic Flow
              </Button>
              <Button 
                size="middle" 
                icon={<AlertOutlined />}
                onClick={() => router.push('/gaps')}
                style={{ 
                  flex: 1, 
                  background: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(255, 255, 255, 0.75)', 
                  backdropFilter: 'blur(8px)',
                  borderColor: isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(226, 232, 240, 0.8)', 
                  color: textPrimary,
                  fontWeight: 600,
                  fontSize: 13,
                  borderRadius: 10,
                  height: 38
                }}
              >
                Care Gaps
              </Button>
            </div>
          </Col>
        </Row>
      </div>

      {/* Metric Cards Row */}
      {isLoading ? (
        <Row gutter={[16, 16]}>
          {[1, 2, 3, 4].map(i => (
            <Col xs={24} sm={12} lg={6} key={i}>
              <Card style={{ borderRadius: 12 }}><Skeleton active paragraph={{ rows: 2 }} /></Card>
            </Col>
          ))}
        </Row>
      ) : isError ? (
        <Alert message="Error loading clinical dashboard metrics" type="error" showIcon />
      ) : (
        <Row gutter={[18, 18]}>
          <Col xs={24} sm={12} lg={6}>
            <div 
              onClick={() => router.push('/appointments')}
              style={{ cursor: 'pointer', height: '100%' }}
              title="Click to view today's appointments and clinic schedule"
            >
              <Card 
                className="glass-card"
                hoverable
                style={{ 
                  borderRadius: 16, 
                  height: '100%',
                  transition: 'all 0.25s ease'
                }}
                styles={{ body: { padding: 22 } }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                  <span style={{ fontSize: 12.5, color: textSecondary, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Today&apos;s Clinic Roster
                  </span>
                  <span style={{ 
                    background: isDark ? 'rgba(99, 102, 241, 0.22)' : 'rgba(224, 231, 255, 0.7)', 
                    color: isDark ? '#a5b4fc' : '#4f46e5', 
                    width: 36, 
                    height: 36, 
                    borderRadius: 10, 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    fontSize: 17,
                    backdropFilter: 'blur(6px)',
                    border: '1px solid rgba(165, 180, 252, 0.3)'
                  }}>
                    <CalendarOutlined />
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                  <span style={{ fontSize: 32, fontWeight: 800, color: textPrimary, fontFamily: 'monospace' }}>
                    {data?.patientsToday || 0}
                  </span>
                  <span style={{ fontSize: 13, color: '#10b981', fontWeight: 700 }}>
                    <ArrowUpOutlined /> {data?.patientsTodayTrend || '+0'} vs yesterday
                  </span>
                </div>
                <Progress percent={data?.clinicProgressPercent || 0} strokeColor="#6366f1" size="small" style={{ margin: '10px 0 6px' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11.5, color: textSecondary, marginBottom: 10 }}>
                  <span>{data?.completedAppointments || 0} Completed</span>
                  <span>{data?.inConsultAppointments || 0} In Consult</span>
                  <span>{data?.inQueueAppointments || 0} In Queue</span>
                </div>
                <div style={{ fontSize: 12.5, color: '#6366f1', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span>Open Appointments Schedule</span> <RightOutlined style={{ fontSize: 10 }} />
                </div>
              </Card>
            </div>
          </Col>

          <Col xs={24} sm={12} lg={6}>
            <div 
              onClick={() => router.push('/patients')}
              style={{ cursor: 'pointer', height: '100%' }}
              title="Click to view active cancer patients registry"
            >
              <Card 
                className="glass-card"
                hoverable
                style={{ 
                  borderRadius: 16, 
                  height: '100%',
                  transition: 'all 0.25s ease'
                }}
                styles={{ body: { padding: 22 } }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                  <span style={{ fontSize: 12.5, color: textSecondary, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Active Cancer Cohort
                  </span>
                  <span style={{ 
                    background: isDark ? 'rgba(16, 185, 129, 0.22)' : 'rgba(209, 250, 229, 0.7)', 
                    color: isDark ? '#6ee7b7' : '#059669', 
                    width: 36, 
                    height: 36, 
                    borderRadius: 10, 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    fontSize: 17,
                    backdropFilter: 'blur(6px)',
                    border: '1px solid rgba(110, 231, 183, 0.3)'
                  }}>
                    <MedicineBoxOutlined />
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                  <span style={{ fontSize: 32, fontWeight: 800, color: textPrimary, fontFamily: 'monospace' }}>
                    {data?.activeCohortCount || 0}
                  </span>
                  <span style={{ fontSize: 13, color: '#10b981', fontWeight: 700 }}>
                    <ArrowUpOutlined /> {data?.cohortTrend || '+0'} this month
                  </span>
                </div>
                <div style={{ marginTop: 12, display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
                  <Tag color="purple" style={{ margin: 0, fontSize: 11, borderRadius: 6 }}>Breast (34)</Tag>
                  <Tag color="cyan" style={{ margin: 0, fontSize: 11, borderRadius: 6 }}>Lung (22)</Tag>
                  <Tag color="orange" style={{ margin: 0, fontSize: 11, borderRadius: 6 }}>Colorectal (18)</Tag>
                </div>
                <div style={{ fontSize: 12.5, color: '#0d9488', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span>Browse Patient Cohort</span> <RightOutlined style={{ fontSize: 10 }} />
                </div>
              </Card>
            </div>
          </Col>

          <Col xs={24} sm={12} lg={6}>
            <div 
              onClick={() => router.push('/gaps')}
              style={{ cursor: 'pointer', height: '100%' }}
              title="Click to resolve urgent care gaps and outreach tasks"
            >
              <Card 
                className="glass-card"
                hoverable
                style={{ 
                  borderRadius: 16, 
                  border: isDark ? '1px solid rgba(244, 63, 94, 0.45)' : '1px solid rgba(254, 205, 211, 0.85)', 
                  background: isDark ? 'rgba(244, 63, 94, 0.12)' : 'rgba(255, 241, 242, 0.7)',
                  boxShadow: isDark ? '0 6px 20px rgba(244, 63, 94, 0.2)' : '0 4px 16px rgba(225, 29, 72, 0.08)',
                  height: '100%',
                  transition: 'all 0.25s ease'
                }}
                styles={{ body: { padding: 22 } }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                  <span style={{ fontSize: 12.5, color: isDark ? '#fb7185' : '#be123c', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Urgent Care Gaps
                  </span>
                  <span style={{ 
                    background: isDark ? 'rgba(244, 63, 94, 0.3)' : 'rgba(255, 228, 230, 0.85)', 
                    color: isDark ? '#fb7185' : '#e11d48', 
                    width: 36, 
                    height: 36, 
                    borderRadius: 10, 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    fontSize: 17,
                    backdropFilter: 'blur(6px)',
                    border: '1px solid rgba(251, 113, 133, 0.3)'
                  }}>
                    <AlertOutlined />
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                  <span style={{ fontSize: 32, fontWeight: 800, color: isDark ? '#fda4af' : '#9f1239', fontFamily: 'monospace' }}>
                    {data?.criticalGaps || 0}
                  </span>
                  <span style={{ 
                    background: isDark ? 'rgba(244, 63, 94, 0.35)' : '#fda4af', 
                    color: isDark ? '#fecdd3' : '#881337', 
                    padding: '3px 10px', 
                    borderRadius: 12, 
                    fontSize: 11, 
                    fontWeight: 700 
                  }}>
                    HIGH URGENCY
                  </span>
                </div>
                <Text style={{ fontSize: 12, color: isDark ? '#fb7185' : '#be123c', marginTop: 8, display: 'block', fontWeight: 500 }}>
                  {data?.criticalGapsDescription || 'Review open care gaps'}
                </Text>
                <div style={{ fontSize: 12.5, color: isDark ? '#fb7185' : '#be123c', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4, marginTop: 10 }}>
                  <span>Review Care Gaps Queue</span> <RightOutlined style={{ fontSize: 10 }} />
                </div>
              </Card>
            </div>
          </Col>

          <Col xs={24} sm={12} lg={6}>
            <div 
              onClick={() => router.push('/appointments')}
              style={{ cursor: 'pointer', height: '100%' }}
              title="Click to view clinic wait time and live flow board"
            >
              <Card 
                className="glass-card"
                hoverable
                style={{ 
                  borderRadius: 16, 
                  height: '100%',
                  transition: 'all 0.25s ease'
                }}
                styles={{ body: { padding: 22 } }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                  <span style={{ fontSize: 12.5, color: textSecondary, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Avg Clinic Wait Time
                  </span>
                  <span style={{ 
                    background: isDark ? 'rgba(245, 158, 11, 0.22)' : 'rgba(254, 243, 199, 0.7)', 
                    color: isDark ? '#fbbf24' : '#d97706', 
                    width: 36, 
                    height: 36, 
                    borderRadius: 10, 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    fontSize: 17,
                    backdropFilter: 'blur(6px)',
                    border: '1px solid rgba(251, 191, 36, 0.3)'
                  }}>
                    <ClockCircleOutlined />
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                  <span style={{ fontSize: 32, fontWeight: 800, color: textPrimary, fontFamily: 'monospace' }}>
                    {data?.avgWaitTime || 0}m
                  </span>
                  <span style={{ fontSize: 13, color: '#10b981', fontWeight: 700 }}>
                    <ArrowDownOutlined /> {data?.waitTimeTrend || '-0 min'}
                  </span>
                </div>
                <Text style={{ fontSize: 12, marginTop: 8, display: 'block', color: textSecondary }}>
                  Within National Oncology OPD SLA of 25 minutes.
                </Text>
                <div style={{ fontSize: 12.5, color: '#f59e0b', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4, marginTop: 10 }}>
                  <span>Launch Clinic Kanban</span> <RightOutlined style={{ fontSize: 10 }} />
                </div>
              </Card>
            </div>
          </Col>
        </Row>
      )}

      {/* Priority Urgent Escalation Queue (Glassified) */}
      <Card 
        className="glass-card"
        title={
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ 
                width: 10, 
                height: 10, 
                borderRadius: '50%', 
                background: '#e11d48', 
                boxShadow: '0 0 10px #e11d48',
                display: 'inline-block' 
              }} />
              <span style={{ fontSize: 16, fontWeight: 700, color: textPrimary }}>
                High Clinical Urgency Queue (Immediate Attention Required)
              </span>
            </div>
            <Tag color="error" style={{ fontWeight: 700, borderRadius: 8, padding: '3px 10px' }}>
              SLA Breach Imminent
            </Tag>
          </div>
        }
        style={{ 
          borderRadius: 18, 
          border: isDark ? '1px solid rgba(244, 63, 94, 0.35)' : '1px solid rgba(254, 205, 211, 0.8)', 
          boxShadow: isDark ? '0 8px 24px rgba(0,0,0,0.3)' : '0 4px 20px rgba(225, 29, 72, 0.06)' 
        }}
        styles={{ body: { padding: 22 } }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {data?.urgentPatients && data.urgentPatients.length > 0 ? (
            data.urgentPatients.map((patient: any, index: number) => (
              <div key={index} style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '16px 20px',
                background: isDark ? 'rgba(244, 63, 94, 0.08)' : 'rgba(255, 241, 242, 0.65)',
                borderRadius: 14,
                border: isDark ? '1px solid rgba(244, 63, 94, 0.25)' : '1px solid rgba(254, 205, 211, 0.85)',
                backdropFilter: 'blur(8px)',
                flexWrap: 'wrap',
                gap: 12,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{
                    width: 44,
                    height: 44,
                    borderRadius: 12,
                    background: 'linear-gradient(135deg, #e11d48 0%, #be123c 100%)',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: 16,
                    boxShadow: '0 4px 10px rgba(225, 29, 72, 0.3)'
                  }}>
                    {patient.firstName?.charAt(0)}{patient.lastName?.charAt(0)}
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span 
                        style={{ fontSize: 15, fontWeight: 700, color: textPrimary, cursor: 'pointer', textDecoration: 'underline' }}
                        onClick={() => router.push('/patients')}
                      >
                        {patient.firstName} {patient.lastName}
                      </span>
                      <Tag color="magenta" style={{ fontSize: 11, fontWeight: 600, borderRadius: 6 }}>{patient.diagnosis || 'Diagnosis Pending'}</Tag>
                      <Tag color="red" style={{ fontSize: 11, fontWeight: 600, borderRadius: 6 }}>URGENT GAP</Tag>
                    </div>
                    <div style={{ fontSize: 12, color: textSecondary, marginTop: 3 }}>
                      MRN: <strong style={{ color: textPrimary }}>{patient.mrn}</strong>
                    </div>
                    <div style={{ fontSize: 12, color: isDark ? '#fda4af' : '#be123c', fontWeight: 600, marginTop: 2 }}>
                      Care Gap: {patient.gapDescription || 'Requires immediate attention.'}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 10 }}>
                  <Button 
                    type="primary" 
                    danger 
                    icon={<ThunderboltOutlined />}
                    onClick={() => router.push('/consultations')}
                    style={{ borderRadius: 8, fontWeight: 600 }}
                  >
                    Review Briefing
                  </Button>
                  <Button 
                    icon={<PhoneOutlined />}
                    style={{ 
                      borderColor: isDark ? 'rgba(244, 63, 94, 0.4)' : 'rgba(252, 165, 165, 0.8)', 
                      color: isDark ? '#fb7185' : '#9f1239',
                      background: isDark ? 'transparent' : 'rgba(255, 255, 255, 0.8)',
                      backdropFilter: 'blur(6px)',
                      borderRadius: 8,
                      fontWeight: 600
                    }}
                    onClick={() => router.push('/gaps')}
                  >
                    Initiate Outreach
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <div style={{ padding: '24px', textAlign: 'center', color: textSecondary }}>
              <CheckCircleOutlined style={{ fontSize: 32, color: '#10b981', marginBottom: 12 }} />
              <div style={{ fontSize: 16, fontWeight: 600, color: textPrimary }}>No Urgent Care Gaps</div>
              <div>All patients are currently on track with their care pathways.</div>
            </div>
          )}
        </div>
      </Card>

      {/* Two Columns: Recent Clinical Timeline & Quick Workflow Shortcuts (Glassified) */}
      <Row gutter={[20, 20]}>
        <Col xs={24} lg={15}>
          <Card 
            className="glass-card"
            title={
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 15, fontWeight: 700, color: textPrimary }}>
                  Live Oncology Stream & Audit Trail
                </span>
                <span style={{ fontSize: 12, color: textSecondary }}>Updated Real-Time</span>
              </div>
            }
            style={{ 
              borderRadius: 18, 
              height: '100%' 
            }}
            styles={{ body: { padding: 22 } }}
          >
            <Empty 
              image={Empty.PRESENTED_IMAGE_SIMPLE} 
              description="No recent clinical stream events" 
              style={{ margin: '60px 0' }} 
            />
          </Card>
        </Col>

        <Col xs={24} lg={9}>
          <Card 
            className="glass-card"
            title={
              <span style={{ fontSize: 15, fontWeight: 700, color: textPrimary }}>
                Oncology Workstation Actions
              </span>
            }
            style={{ 
              borderRadius: 18, 
              height: '100%' 
            }}
            styles={{ body: { padding: 22 } }}
          >
            <Space direction="vertical" style={{ width: '100%' }} size="middle">
              <Button 
                icon={<PlusOutlined style={{ color: '#4f46e5' }} />} 
                block 
                size="large"
                style={{ 
                  textAlign: 'left', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  borderRadius: 12,
                  borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.75)',
                  background: isDark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(255, 255, 255, 0.65)',
                  backdropFilter: 'blur(8px)',
                  color: textPrimary,
                  height: 48,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
                }}
                onClick={() => router.push('/patients')}
              >
                <span style={{ fontWeight: 600, fontSize: 13 }}>Register New Cancer Patient</span>
                <RightOutlined style={{ fontSize: 12, color: textSecondary }} />
              </Button>

              <Button 
                icon={<CalendarOutlined style={{ color: '#0284c7' }} />} 
                block 
                size="large"
                style={{ 
                  textAlign: 'left', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  borderRadius: 12,
                  borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.75)',
                  background: isDark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(255, 255, 255, 0.65)',
                  backdropFilter: 'blur(8px)',
                  color: textPrimary,
                  height: 48,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
                }}
                onClick={() => router.push('/appointments')}
              >
                <span style={{ fontWeight: 600, fontSize: 13 }}>Launch Clinic Flow Board</span>
                <RightOutlined style={{ fontSize: 12, color: textSecondary }} />
              </Button>

              <Button 
                icon={<MedicineBoxOutlined style={{ color: '#059669' }} />} 
                block 
                size="large"
                style={{ 
                  textAlign: 'left', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  borderRadius: 12,
                  borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.75)',
                  background: isDark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(255, 255, 255, 0.65)',
                  backdropFilter: 'blur(8px)',
                  color: textPrimary,
                  height: 48,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
                }}
                onClick={() => router.push('/journey')}
              >
                <span style={{ fontWeight: 600, fontSize: 13 }}>Treatment Pathway Tracker</span>
                <RightOutlined style={{ fontSize: 12, color: textSecondary }} />
              </Button>

              <Button 
                icon={<FileTextOutlined style={{ color: '#7c3aed' }} />} 
                block 
                size="large"
                style={{ 
                  textAlign: 'left', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  borderRadius: 12,
                  borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.75)',
                  background: isDark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(255, 255, 255, 0.65)',
                  backdropFilter: 'blur(8px)',
                  color: textPrimary,
                  height: 48,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
                }}
                onClick={() => router.push('/reports')}
              >
                <span style={{ fontWeight: 600, fontSize: 13 }}>Tumor Board & Analytics Reports</span>
                <RightOutlined style={{ fontSize: 12, color: textSecondary }} />
              </Button>
            </Space>

            <div style={{
              marginTop: 20,
              padding: '14px 16px',
              background: isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(255, 255, 255, 0.5)',
              backdropFilter: 'blur(8px)',
              borderRadius: 12,
              border: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(226, 232, 240, 0.8)',
            }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: textSecondary, textTransform: 'uppercase', marginBottom: 4 }}>
                Clinical Safety Rule (§30)
              </div>
              <div style={{ fontSize: 11.5, color: textSecondary, lineHeight: 1.5 }}>
                AI care gap predictions and summaries are decision-support aids and require clinical review by a licensed oncologist before execution.
              </div>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
