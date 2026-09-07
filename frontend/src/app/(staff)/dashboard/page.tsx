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
  Tooltip
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
  CheckOutlined
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
      {/* Top Bar: Title and Role Switcher */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Title level={3} style={{ margin: 0, color: textPrimary, fontWeight: 700 }}>
              Oncology Command Center
            </Title>
            <Tag color="indigo" style={{ 
              background: isDark ? 'rgba(99, 102, 241, 0.2)' : '#e0e7ff', 
              color: isDark ? '#a5b4fc' : '#4338ca', 
              border: isDark ? '1px solid rgba(99, 102, 241, 0.4)' : '1px solid #c7d2fe', 
              fontWeight: 600 
            }}>
              LIVE CLINIC V2.4
            </Tag>
          </div>
          <Text style={{ fontSize: 13, color: textSecondary }}>
            Continuous care tracking, automated gap detection & clinic flow orchestration
          </Text>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Text style={{ fontSize: 12, fontWeight: 600, color: textSecondary }}>VIEW PERSPECTIVE:</Text>
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

      {/* Clinical Hero Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #312e81 100%)',
        borderRadius: 14,
        padding: '24px 28px',
        color: '#ffffff',
        boxShadow: '0 10px 25px -5px rgba(30, 27, 75, 0.25), 0 8px 10px -6px rgba(30, 27, 75, 0.2)',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Subtle background glow circle */}
        <div style={{
          position: 'absolute',
          top: -60,
          right: -40,
          width: 240,
          height: 240,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(99, 102, 241, 0.25) 0%, rgba(99, 102, 241, 0) 70%)',
          pointerEvents: 'none',
        }} />

        <Row gutter={[24, 20]} align="middle">
          <Col xs={24} md={16}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 10px', background: 'rgba(255, 255, 255, 0.12)', borderRadius: 20, marginBottom: 10 }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#34d399', boxShadow: '0 0 8px #34d399' }} />
              <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.04em', color: '#cbd5e1' }}>
                SHIFT ACTIVE • OPD & CHEMO DAYCARE WING A
              </span>
            </div>
            <h2 style={{ fontSize: 22, fontWeight: 700, margin: '0 0 6px 0', color: '#ffffff', letterSpacing: '-0.01em' }}>
              Welcome back, Dr. Jane Smith
            </h2>
            <p style={{ margin: 0, fontSize: 13, color: '#cbd5e1', lineHeight: 1.5, maxWidth: 640 }}>
              You have <strong style={{ color: '#ffffff' }}>14 patients</strong> on your clinic roster today. 
              <span style={{ color: '#fca5a5', fontWeight: 600 }}> 2 patients have critical care gaps</span> (overdue chemotherapy ANC and pending biopsy pathology). 
              Average wait time is optimal at <strong style={{ color: '#ffffff' }}>14 minutes</strong>.
            </p>
          </Col>

          <Col xs={24} md={8} style={{ display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'flex-start', justifyContent: 'center' }}>
            <Button 
              type="primary" 
              size="large" 
              icon={<FileTextOutlined />}
              onClick={() => router.push('/consultations')}
              style={{ 
                background: '#ffffff', 
                color: '#1e1b4b', 
                borderColor: '#ffffff', 
                fontWeight: 600,
                width: '100%',
                height: 42,
                boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
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
                  background: 'rgba(255,255,255,0.12)', 
                  borderColor: 'rgba(255,255,255,0.2)', 
                  color: '#ffffff',
                  fontWeight: 500,
                  fontSize: 12
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
                  background: 'rgba(255,255,255,0.12)', 
                  borderColor: 'rgba(255,255,255,0.2)', 
                  color: '#ffffff',
                  fontWeight: 500,
                  fontSize: 12
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
            <Card 
              style={{ 
                borderRadius: 12, 
                border: `1px solid ${cardBorder}`, 
                background: cardBg,
                boxShadow: isDark ? '0 4px 12px rgba(0,0,0,0.25)' : '0 1px 3px rgba(0,0,0,0.04)',
                height: '100%'
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
                  14
                </span>
                <span style={{ fontSize: 13, color: '#10b981', fontWeight: 600 }}>
                  <ArrowUpOutlined /> +2 vs yesterday
                </span>
              </div>
              <Progress percent={65} strokeColor="#6366f1" size="small" style={{ margin: '8px 0 4px' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: textSecondary }}>
                <span>9 Completed</span>
                <span>3 In Consult</span>
                <span>2 In Queue</span>
              </div>
            </Card>
          </Col>

          <Col xs={24} sm={12} lg={6}>
            <Card 
              style={{ 
                borderRadius: 12, 
                border: `1px solid ${cardBorder}`, 
                background: cardBg,
                boxShadow: isDark ? '0 4px 12px rgba(0,0,0,0.25)' : '0 1px 3px rgba(0,0,0,0.04)',
                height: '100%'
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
                  84
                </span>
                <span style={{ fontSize: 13, color: '#10b981', fontWeight: 600 }}>
                  <ArrowUpOutlined /> +5 this month
                </span>
              </div>
              <div style={{ marginTop: 12, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                <Tag color="purple" style={{ margin: 0, fontSize: 11 }}>Breast (34)</Tag>
                <Tag color="cyan" style={{ margin: 0, fontSize: 11 }}>Lung (22)</Tag>
                <Tag color="orange" style={{ margin: 0, fontSize: 11 }}>Colorectal (18)</Tag>
              </div>
            </Card>
          </Col>

          <Col xs={24} sm={12} lg={6}>
            <Card 
              style={{ 
                borderRadius: 12, 
                border: isDark ? '1px solid rgba(244, 63, 94, 0.4)' : '1px solid #fecdd3', 
                background: isDark ? 'rgba(244, 63, 94, 0.1)' : '#fff1f2',
                boxShadow: isDark ? '0 4px 12px rgba(244, 63, 94, 0.15)' : '0 1px 3px rgba(0,0,0,0.04)',
                height: '100%'
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
                  7
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
              <Text style={{ fontSize: 12, color: isDark ? '#fb7185' : '#be123c', marginTop: 10, display: 'block', fontWeight: 500 }}>
                2 overdue chemotherapy, 3 pending pathology biopsy, 2 missed appointments.
              </Text>
            </Card>
          </Col>

          <Col xs={24} sm={12} lg={6}>
            <Card 
              style={{ 
                borderRadius: 12, 
                border: `1px solid ${cardBorder}`, 
                background: cardBg,
                boxShadow: isDark ? '0 4px 12px rgba(0,0,0,0.25)' : '0 1px 3px rgba(0,0,0,0.04)',
                height: '100%'
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
                  14m
                </span>
                <span style={{ fontSize: 13, color: '#10b981', fontWeight: 600 }}>
                  <ArrowDownOutlined /> -2 min
                </span>
              </div>
              <Text style={{ fontSize: 12, marginTop: 10, display: 'block', color: textSecondary }}>
                Within National Oncology OPD SLA of 25 minutes.
              </Text>
            </Card>
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
          {/* Patient 1: Priya Sharma */}
          <div style={{
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
                PS
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 15, fontWeight: 700, color: textPrimary }}>Priya Sharma</span>
                  <Tag color="magenta" style={{ fontSize: 11, fontWeight: 600 }}>Breast • Stage IIB</Tag>
                  <Tag color="red" style={{ fontSize: 11, fontWeight: 600 }}>OVERDUE 7 DAYS</Tag>
                </div>
                <div style={{ fontSize: 12, color: textSecondary, marginTop: 3 }}>
                  MRN: <strong style={{ color: textPrimary }}>MRN-ONC-2026-001</strong> • ABHA: 91-5544-3322-1100 • Regimen: AC-T (Chemo Cycle 4 Overdue)
                </div>
                <div style={{ fontSize: 12, color: isDark ? '#fda4af' : '#be123c', fontWeight: 600, marginTop: 2 }}>
                  Care Gap: Missed pre-chemotherapy ANC/CBC blood count investigation. Lost to contact 5 days.
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

          {/* Patient 2: Rajesh Patel */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '14px 18px',
            background: isDark ? 'rgba(245, 158, 11, 0.08)' : '#fffbeb',
            borderRadius: 10,
            border: isDark ? '1px solid rgba(245, 158, 11, 0.25)' : '1px solid #fef3c7',
            flexWrap: 'wrap',
            gap: 12,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{
                width: 44,
                height: 44,
                borderRadius: 10,
                background: '#d97706',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: 16
              }}>
                RP
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 15, fontWeight: 700, color: textPrimary }}>Rajesh Patel</span>
                  <Tag color="orange" style={{ fontSize: 11, fontWeight: 600 }}>Lung (NSCLC) • Stage IIIA</Tag>
                  <Tag color="gold" style={{ fontSize: 11, fontWeight: 600 }}>PENDING BIOPSY</Tag>
                </div>
                <div style={{ fontSize: 12, color: textSecondary, marginTop: 3 }}>
                  MRN: <strong style={{ color: textPrimary }}>MRN-ONC-2026-042</strong> • Histopathology TAT: 8 days (Breached 5-day TAT SLA)
                </div>
                <div style={{ fontSize: 12, color: isDark ? '#fcd34d' : '#92400e', fontWeight: 600, marginTop: 2 }}>
                  Care Gap: EGFR & ALK molecular mutation profiling pending from central pathology.
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <Button 
                type="default" 
                style={{ 
                  borderColor: isDark ? 'rgba(245, 158, 11, 0.5)' : '#f59e0b', 
                  color: isDark ? '#fbbf24' : '#b45309',
                  background: isDark ? 'transparent' : '#ffffff'
                }}
                onClick={() => router.push('/investigations')}
              >
                Expedite Pathology
              </Button>
            </div>
          </div>
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
            <List
              itemLayout="horizontal"
              dataSource={[
                { id: '1', time: '5 mins ago', description: 'Patient Priya Sharma checked in at OPD Room 3 for consultation prep', type: 'info' },
                { id: '2', time: '18 mins ago', description: 'Automated Care Gap Engine identified overdue cycle for 2 cohort patients', type: 'alert' },
                { id: '3', time: '42 mins ago', description: 'Biopsy Pathology Report uploaded via LIS integration for MRN-ONC-2026-042', type: 'success' },
                { id: '4', time: '1 hour ago', description: 'ABDM Consent Artefact renewed for digital health records exchange', type: 'success' },
                { id: '5', time: '2 hours ago', description: 'Multidisciplinary Tumor Board note finalized by Dr. Jane Smith', type: 'info' },
              ]}
              renderItem={(item) => (
                <List.Item style={{ padding: '12px 0', borderBottom: `1px solid ${isDark ? '#1e293b' : '#f1f5f9'}` }}>
                  <List.Item.Meta
                    avatar={
                      item.type === 'alert' ? <AlertOutlined style={{ color: '#e11d48', fontSize: 18 }} /> :
                      item.type === 'success' ? <CheckCircleOutlined style={{ color: '#059669', fontSize: 18 }} /> :
                      <InfoCircleOutlined style={{ color: '#4f46e5', fontSize: 18 }} />
                    }
                    title={<span style={{ fontSize: 13, fontWeight: 500, color: textPrimary }}>{item.description}</span>}
                    description={<span style={{ fontSize: 11, color: textSecondary }}>{item.time}</span>}
                  />
                  <Tag color={
                    item.type === 'alert' ? 'red' : 
                    item.type === 'success' ? 'green' : 'blue'
                  } style={{ borderRadius: 4, fontWeight: 600, fontSize: 11 }}>
                    {item.type.toUpperCase()}
                  </Tag>
                </List.Item>
              )}
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
