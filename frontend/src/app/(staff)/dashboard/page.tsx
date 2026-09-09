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

const { Title, Text, Paragraph } = Typography;

const roles = ['Oncologist', 'Care Coordinator', 'HOD', 'Administrator'];

export default function DashboardPage() {
  const router = useRouter();
  const [activeRole, setActiveRole] = useState(roles[0]);
  const { data, isLoading, isError } = useRoleDashboard(activeRole);
  const { themeMode } = useAppStore();
  const isDark = themeMode === 'dark';

  const textPrimary = isDark ? '#f8fafc' : '#0f172a';
  const textSecondary = isDark ? '#94a3b8' : '#64748b';
  const cardBg = isDark ? '#0f172a' : '#ffffff';
  const cardBorder = isDark ? '#1e293b' : '#e2e8f0';
  const innerCardBg = isDark ? '#131c2e' : '#f8fafc';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Top Bar: Title, Quick Actions, and Role Switcher */}
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

          <Text style={{ fontSize: 12, fontWeight: 600, color: textSecondary }}>PERSPECTIVE:</Text>
          <Segmented 
            options={roles} 
            value={activeRole} 
            onChange={(val) => setActiveRole(val as string)} 
            style={{ 
              background: isDark ? '#1e293b' : '#e2e8f0', 
              padding: 3, 
              borderRadius: 8,
              fontWeight: 500,
            }}
          />
        </div>
      </div>

      {/* Clinical Hero Banner - Modern SaaS Style */}
      <div style={{
        background: '#ffffff',
        borderRadius: 12,
        padding: '24px 28px',
        border: '1px solid #e2e8f0',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)',
        position: 'relative',
        overflow: 'hidden',
        marginBottom: 24,
      }}>
        <Row gutter={[24, 20]} align="middle">
          <Col xs={24} md={16}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 10px', background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: 20, marginBottom: 16 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981' }} />
              <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.04em', color: '#475569' }}>
                ACTIVE CLINIC • {data?.departmentName || 'ONCOLOGY WING'}
              </span>
            </div>
            <h2 style={{ fontSize: 24, fontWeight: 700, margin: '0 0 8px 0', color: '#0f172a', letterSpacing: '-0.01em' }}>
              Welcome back, Dr. {data?.doctorName || 'Oncologist'}
            </h2>
            <p style={{ margin: 0, fontSize: 14, color: '#64748b', lineHeight: 1.5, maxWidth: 640 }}>
              You have <strong style={{ color: '#0f172a' }}>{data?.patientsToday || 0} patients</strong> on your clinic roster today. 
              {data?.criticalGaps > 0 && <span style={{ color: '#e11d48', fontWeight: 500 }}> {data?.criticalGaps} patients have critical care gaps.</span>}
              Average wait time is currently <strong style={{ color: '#0f172a' }}>{data?.avgWaitTime || 0} minutes</strong>.
            </p>
          </Col>

          <Col xs={24} md={8} style={{ display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'flex-start', justifyContent: 'center' }}>
            <Button 
              type="primary" 
              size="large" 
              icon={<FileTextOutlined />}
              onClick={() => router.push('/consultations')}
              style={{ 
                background: '#0f172a', 
                color: '#ffffff', 
                fontWeight: 600,
                width: '100%',
                height: 44,
                borderRadius: 8,
              }}
            >
              Open Consultation Readiness
            </Button>
            <div style={{ display: 'flex', gap: 8, width: '100%' }}>
              <Button 
                size="middle" 
                icon={<CalendarOutlined />}
                onClick={() => router.push('/appointments')}
                style={{ 
                  flex: 1, 
                  background: '#ffffff', 
                  borderColor: '#cbd5e1', 
                  color: '#334155',
                  fontWeight: 600,
                  fontSize: 13,
                  borderRadius: 6
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
                  background: '#ffffff', 
                  borderColor: '#cbd5e1', 
                  color: '#334155',
                  fontWeight: 600,
                  fontSize: 13,
                  borderRadius: 6
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
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} lg={6}>
            <div 
              onClick={() => router.push('/appointments')}
              style={{ cursor: 'pointer', height: '100%' }}
              title="Click to view today's appointments and clinic schedule"
            >
              <Card 
                hoverable
                style={{ 
                  borderRadius: 12, 
                  border: `1px solid ${cardBorder}`, 
                  background: cardBg,
                  boxShadow: isDark ? '0 4px 12px rgba(0,0,0,0.25)' : '0 1px 3px rgba(0,0,0,0.04)',
                  height: '100%',
                  transition: 'all 0.2s ease'
                }}
                bodyStyle={{ padding: 20 }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                  <span style={{ fontSize: 13, color: textSecondary, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Today&apos;s Clinic Roster
                  </span>
                  <span style={{ 
                    background: isDark ? 'rgba(99, 102, 241, 0.2)' : '#e0e7ff', 
                    color: isDark ? '#818cf8' : '#4f46e5', 
                    width: 32, 
                    height: 32, 
                    borderRadius: 8, 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    fontSize: 16 
                  }}>
                    <CalendarOutlined />
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                  <span style={{ fontSize: 30, fontWeight: 700, color: textPrimary, fontFamily: 'monospace' }}>
                    {data?.patientsToday || 0}
                  </span>
                  <span style={{ fontSize: 13, color: '#10b981', fontWeight: 600 }}>
                    <ArrowUpOutlined /> {data?.patientsTodayTrend || '+0'} vs yesterday
                  </span>
                </div>
                <Progress percent={data?.clinicProgressPercent || 0} strokeColor="#6366f1" size="small" style={{ margin: '8px 0 4px' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: textSecondary, marginBottom: 8 }}>
                  <span>{data?.completedAppointments || 0} Completed</span>
                  <span>{data?.inConsultAppointments || 0} In Consult</span>
                  <span>{data?.inQueueAppointments || 0} In Queue</span>
                </div>
                <div style={{ fontSize: 12, color: '#6366f1', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4, marginTop: 6 }}>
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
                hoverable
                style={{ 
                  borderRadius: 12, 
                  border: `1px solid ${cardBorder}`, 
                  background: cardBg,
                  boxShadow: isDark ? '0 4px 12px rgba(0,0,0,0.25)' : '0 1px 3px rgba(0,0,0,0.04)',
                  height: '100%',
                  transition: 'all 0.2s ease'
                }}
                bodyStyle={{ padding: 20 }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                  <span style={{ fontSize: 13, color: textSecondary, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Active Cancer Cohort
                  </span>
                  <span style={{ 
                    background: isDark ? 'rgba(16, 185, 129, 0.2)' : '#f0fdf4', 
                    color: isDark ? '#34d399' : '#16a34a', 
                    width: 32, 
                    height: 32, 
                    borderRadius: 8, 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    fontSize: 16 
                  }}>
                    <MedicineBoxOutlined />
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                  <span style={{ fontSize: 30, fontWeight: 700, color: textPrimary, fontFamily: 'monospace' }}>
                    {data?.activeCohortCount || 0}
                  </span>
                  <span style={{ fontSize: 13, color: '#10b981', fontWeight: 600 }}>
                    <ArrowUpOutlined /> {data?.cohortTrend || '+0'} this month
                  </span>
                </div>
                <div style={{ marginTop: 12, display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
                  <Tag color="purple" style={{ margin: 0, fontSize: 11 }}>Breast (34)</Tag>
                  <Tag color="cyan" style={{ margin: 0, fontSize: 11 }}>Lung (22)</Tag>
                  <Tag color="orange" style={{ margin: 0, fontSize: 11 }}>Colorectal (18)</Tag>
                </div>
                <div style={{ fontSize: 12, color: '#10b981', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4, marginTop: 6 }}>
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
                hoverable
                style={{ 
                  borderRadius: 12, 
                  border: isDark ? '1px solid rgba(244, 63, 94, 0.4)' : '1px solid #fecdd3', 
                  background: isDark ? 'rgba(244, 63, 94, 0.1)' : '#fff1f2',
                  boxShadow: isDark ? '0 4px 12px rgba(244, 63, 94, 0.15)' : '0 1px 3px rgba(0,0,0,0.04)',
                  height: '100%',
                  transition: 'all 0.2s ease'
                }}
                bodyStyle={{ padding: 20 }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                  <span style={{ fontSize: 13, color: isDark ? '#fb7185' : '#be123c', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Urgent Care Gaps
                  </span>
                  <span style={{ 
                    background: isDark ? 'rgba(244, 63, 94, 0.25)' : '#ffe4e6', 
                    color: isDark ? '#fb7185' : '#e11d48', 
                    width: 32, 
                    height: 32, 
                    borderRadius: 8, 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    fontSize: 16 
                  }}>
                    <AlertOutlined />
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                  <span style={{ fontSize: 30, fontWeight: 700, color: isDark ? '#fda4af' : '#9f1239', fontFamily: 'monospace' }}>
                    {data?.criticalGaps || 0}
                  </span>
                  <span style={{ 
                    background: isDark ? 'rgba(244, 63, 94, 0.3)' : '#fda4af', 
                    color: isDark ? '#fecdd3' : '#881337', 
                    padding: '2px 8px', 
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
                <div style={{ fontSize: 12, color: isDark ? '#fb7185' : '#be123c', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4, marginTop: 8 }}>
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
                hoverable
                style={{ 
                  borderRadius: 12, 
                  border: `1px solid ${cardBorder}`, 
                  background: cardBg,
                  boxShadow: isDark ? '0 4px 12px rgba(0,0,0,0.25)' : '0 1px 3px rgba(0,0,0,0.04)',
                  height: '100%',
                  transition: 'all 0.2s ease'
                }}
                bodyStyle={{ padding: 20 }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                  <span style={{ fontSize: 13, color: textSecondary, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Avg Clinic Wait Time
                  </span>
                  <span style={{ 
                    background: isDark ? 'rgba(245, 158, 11, 0.2)' : '#fef3c7', 
                    color: isDark ? '#fbbf24' : '#d97706', 
                    width: 32, 
                    height: 32, 
                    borderRadius: 8, 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    fontSize: 16 
                  }}>
                    <ClockCircleOutlined />
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                  <span style={{ fontSize: 30, fontWeight: 700, color: textPrimary, fontFamily: 'monospace' }}>
                    {data?.avgWaitTime || 0}m
                  </span>
                  <span style={{ fontSize: 13, color: '#10b981', fontWeight: 600 }}>
                    <ArrowDownOutlined /> {data?.waitTimeTrend || '-0 min'}
                  </span>
                </div>
                <Text style={{ fontSize: 12, marginTop: 8, display: 'block', color: textSecondary }}>
                  Within National Oncology OPD SLA of 25 minutes.
                </Text>
                <div style={{ fontSize: 12, color: '#f59e0b', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4, marginTop: 8 }}>
                  <span>Launch Clinic Kanban</span> <RightOutlined style={{ fontSize: 10 }} />
                </div>
              </Card>
            </div>
          </Col>
        </Row>
      )}

      {/* Priority Urgent Escalation Queue */}
      <Card 
        title={
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ 
                width: 10, 
                height: 10, 
                borderRadius: '50%', 
                background: '#e11d48', 
                boxShadow: '0 0 8px #e11d48',
                display: 'inline-block' 
              }} />
              <span style={{ fontSize: 16, fontWeight: 700, color: textPrimary }}>
                High Clinical Urgency Queue (Immediate Attention Required)
              </span>
            </div>
            <Tag color="error" style={{ fontWeight: 600 }}>
              SLA Breach Imminent
            </Tag>
          </div>
        }
        style={{ 
          borderRadius: 12, 
          border: isDark ? '1px solid rgba(244, 63, 94, 0.35)' : '1px solid #fecdd3', 
          background: cardBg,
          boxShadow: isDark ? '0 4px 16px rgba(0,0,0,0.3)' : '0 2px 8px rgba(225, 29, 72, 0.06)' 
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {data?.urgentPatients && data.urgentPatients.length > 0 ? (
            data.urgentPatients.map((patient: any, index: number) => (
              <div key={index} style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '14px 18px',
                background: isDark ? 'rgba(244, 63, 94, 0.08)' : '#fff1f2',
                borderRadius: 10,
                border: isDark ? '1px solid rgba(244, 63, 94, 0.25)' : '1px solid #ffe4e6',
                flexWrap: 'wrap',
                gap: 12,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{
                    width: 44,
                    height: 44,
                    borderRadius: 10,
                    background: '#e11d48',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: 16
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
                      <Tag color="magenta" style={{ fontSize: 11, fontWeight: 600 }}>{patient.diagnosis || 'Diagnosis Pending'}</Tag>
                      <Tag color="red" style={{ fontSize: 11, fontWeight: 600 }}>URGENT GAP</Tag>
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
                  >
                    Review Briefing
                  </Button>
                  <Button 
                    icon={<PhoneOutlined />}
                    style={{ 
                      borderColor: isDark ? 'rgba(244, 63, 94, 0.4)' : '#fca5a5', 
                      color: isDark ? '#fb7185' : '#9f1239',
                      background: isDark ? 'transparent' : '#ffffff'
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

      {/* Two Columns: Recent Clinical Timeline & Quick Workflow Shortcuts */}
      <Row gutter={[20, 20]}>
        <Col xs={24} lg={15}>
          <Card 
            title={
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 15, fontWeight: 700, color: textPrimary }}>
                  Live Oncology Stream & Audit Trail
                </span>
                <span style={{ fontSize: 12, color: textSecondary }}>Updated Real-Time</span>
              </div>
            }
            style={{ 
              borderRadius: 12, 
              border: `1px solid ${cardBorder}`, 
              background: cardBg,
              boxShadow: isDark ? '0 4px 12px rgba(0,0,0,0.25)' : '0 1px 3px rgba(0,0,0,0.04)',
              height: '100%' 
            }}
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
            title={
              <span style={{ fontSize: 15, fontWeight: 700, color: textPrimary }}>
                Oncology Workstation Actions
              </span>
            }
            style={{ 
              borderRadius: 12, 
              border: `1px solid ${cardBorder}`, 
              background: cardBg,
              boxShadow: isDark ? '0 4px 12px rgba(0,0,0,0.25)' : '0 1px 3px rgba(0,0,0,0.04)',
              height: '100%' 
            }}
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
                  borderRadius: 8,
                  borderColor: cardBorder,
                  background: innerCardBg,
                  color: textPrimary,
                  height: 46
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
                  borderRadius: 8,
                  borderColor: cardBorder,
                  background: innerCardBg,
                  color: textPrimary,
                  height: 46
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
                  borderRadius: 8,
                  borderColor: cardBorder,
                  background: innerCardBg,
                  color: textPrimary,
                  height: 46
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
                  borderRadius: 8,
                  borderColor: cardBorder,
                  background: innerCardBg,
                  color: textPrimary,
                  height: 46
                }}
                onClick={() => router.push('/reports')}
              >
                <span style={{ fontWeight: 600, fontSize: 13 }}>Tumor Board & Analytics Reports</span>
                <RightOutlined style={{ fontSize: 12, color: textSecondary }} />
              </Button>
            </Space>

            <div style={{
              marginTop: 20,
              padding: '12px 14px',
              background: innerCardBg,
              borderRadius: 8,
              border: `1px solid ${cardBorder}`,
            }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: textSecondary, textTransform: 'uppercase', marginBottom: 4 }}>
                Clinical Safety Rule (§30)
              </div>
              <div style={{ fontSize: 11, color: textSecondary, lineHeight: 1.4 }}>
                AI care gap predictions and summaries are decision-support aids and require clinical review by a licensed oncologist before execution.
              </div>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
