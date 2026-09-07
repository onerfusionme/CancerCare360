'use client';
import React, { useState } from 'react';
import { 
  Card, 
  Descriptions, 
  Alert, 
  Timeline, 
  List, 
  Tabs, 
  Spin, 
  Row, 
  Col, 
  Table, 
  Tag, 
  Button, 
  Progress, 
  Space, 
  Badge, 
  Divider,
  Modal,
  message
} from 'antd';
import { 
  WarningOutlined, 
  FileTextOutlined, 
  ExperimentOutlined, 
  CalendarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ArrowDownOutlined,
  ArrowUpOutlined,
  MinusOutlined,
  ThunderboltOutlined,
  PhoneOutlined,
  PrinterOutlined,
  ShareAltOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { ConsultationReadiness } from '../../types/consultation';
import StatusBadge from '../ui/StatusBadge';

interface ReadinessCardProps {
  readiness?: ConsultationReadiness | null;
  loading?: boolean;
}

export const ReadinessCard: React.FC<ReadinessCardProps> = ({ readiness, loading }) => {
  const [activeTab, setActiveTab] = useState('1');

  if (loading) {
    return (
      <Card style={{ borderRadius: 12, padding: 24, textAlign: 'center' }}>
        <Spin size="large" tip="Synthesizing clinical consultation records..." />
      </Card>
    );
  }

  // Clinical Lab Delta Data
  const labDeltas = [
    {
      key: '1',
      parameter: 'Absolute Neutrophil Count (ANC)',
      current: '1,100 /uL',
      previous: '2,400 /uL',
      delta: '-1,300',
      trend: 'down',
      reference: '1,500 – 8,000 /uL',
      status: 'CRITICAL LOW',
      statusColor: '#e11d48',
      clinicalNote: 'Hold Chemo Cycle 4 until ANC > 1,500 /uL. Consider G-CSF support.'
    },
    {
      key: '2',
      parameter: 'Hemoglobin (Hb)',
      current: '10.8 g/dL',
      previous: '12.1 g/dL',
      delta: '-1.3',
      trend: 'down',
      reference: '12.0 – 15.5 g/dL',
      status: 'MILD ANEMIA',
      statusColor: '#d97706',
      clinicalNote: 'Consistent with chemotherapy bone marrow suppression.'
    },
    {
      key: '3',
      parameter: 'Platelet Count',
      current: '210,000 /uL',
      previous: '225,000 /uL',
      delta: '-15,000',
      trend: 'down',
      reference: '150,000 – 450,000 /uL',
      status: 'NORMAL',
      statusColor: '#059669',
      clinicalNote: 'Adequate for cytotoxic infusion.'
    },
    {
      key: '4',
      parameter: 'Serum Creatinine',
      current: '0.85 mg/dL',
      previous: '0.82 mg/dL',
      delta: '+0.03',
      trend: 'neutral',
      reference: '0.50 – 1.10 mg/dL',
      status: 'NORMAL',
      statusColor: '#059669',
      clinicalNote: 'Normal renal function; no dose reduction required.'
    },
    {
      key: '5',
      parameter: 'SGPT / ALT',
      current: '34 U/L',
      previous: '31 U/L',
      delta: '+3',
      trend: 'up',
      reference: '7 – 56 U/L',
      status: 'NORMAL',
      statusColor: '#059669',
      clinicalNote: 'Hepatic enzymes stable.'
    },
  ];

  const labColumns = [
    {
      title: 'Lab Investigation',
      dataIndex: 'parameter',
      key: 'parameter',
      render: (text: string, record: any) => (
        <div>
          <div style={{ fontWeight: 600, color: '#0f172a' }}>{text}</div>
          <div style={{ fontSize: 11, color: '#64748b' }}>{record.clinicalNote}</div>
        </div>
      ),
    },
    {
      title: 'Current Value',
      dataIndex: 'current',
      key: 'current',
      render: (text: string, record: any) => (
        <span style={{ 
          fontFamily: 'monospace', 
          fontWeight: 700, 
          color: record.statusColor,
          fontSize: 14 
        }}>
          {text}
        </span>
      ),
    },
    {
      title: 'Previous (Last Visit)',
      dataIndex: 'previous',
      key: 'previous',
      render: (text: string) => (
        <span style={{ fontFamily: 'monospace', color: '#64748b' }}>{text}</span>
      ),
    },
    {
      title: 'Delta Shift',
      dataIndex: 'delta',
      key: 'delta',
      render: (text: string, record: any) => (
        <span style={{ 
          color: record.trend === 'down' ? '#e11d48' : record.trend === 'up' ? '#d97706' : '#64748b',
          fontWeight: 600,
          fontFamily: 'monospace',
          display: 'inline-flex',
          alignItems: 'center',
          gap: 4
        }}>
          {record.trend === 'down' && <ArrowDownOutlined />}
          {record.trend === 'up' && <ArrowUpOutlined />}
          {record.trend === 'neutral' && <MinusOutlined />}
          {text}
        </span>
      ),
    },
    {
      title: 'Reference Range',
      dataIndex: 'reference',
      key: 'reference',
      render: (text: string) => <span style={{ fontSize: 12, color: '#64748b' }}>{text}</span>,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string, record: any) => (
        <Tag 
          style={{ 
            color: record.statusColor, 
            borderColor: record.statusColor, 
            background: `${record.statusColor}10`,
            fontWeight: 700,
            fontSize: 11 
          }}
        >
          {status}
        </Tag>
      ),
    },
  ];

  const handleOrderStatLab = () => {
    message.success('Urgent Stat CBC / ANC repeat order dispatched to Central Laboratory (LIS #ORD-9921)');
  };

  const handleSendReminder = () => {
    message.success('Care continuity WhatsApp reminder & tele-consult link sent to patient');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* 3-Tab Workspace */}
      <Card 
        style={{ 
          borderRadius: 12, 
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)' 
        }}
        bodyStyle={{ padding: '8px 24px 24px' }}
      >
        <Tabs 
          activeKey={activeTab} 
          onChange={setActiveTab}
          size="large"
          items={[
            {
              key: '1',
              label: (
                <Space>
                  <ExperimentOutlined style={{ color: '#4f46e5' }} />
                  <span style={{ fontWeight: 600 }}>What Changed Since Last Visit (Delta View)</span>
                  <Badge count="1 Alert" style={{ backgroundColor: '#e11d48', fontSize: 10 }} />
                </Space>
              ),
              children: (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20, paddingTop: 12 }}>
                  {/* Alert banner */}
                  <Alert 
                    message={
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span>
                          <strong>Clinical Alert:</strong> Absolute Neutrophil Count (ANC) dropped to 1,100 /uL (below the chemotherapy threshold of 1,500 /uL). Chemo Cycle 4 paused.
                        </span>
                        <Button 
                          size="small" 
                          type="primary" 
                          danger 
                          onClick={handleOrderStatLab}
                          icon={<ThunderboltOutlined />}
                        >
                          Order Stat ANC Repeat
                        </Button>
                      </div>
                    }
                    type="error"
                    showIcon
                    style={{ borderRadius: 8 }}
                  />

                  {/* Lab Delta Table */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                      <span style={{ fontSize: 15, fontWeight: 700, color: '#0f172a' }}>
                        Biochemical & Hematological Longitudinal Deltas
                      </span>
                      <span style={{ fontSize: 12, color: '#64748b' }}>
                        Last evaluated: 4 days ago vs 25 days ago
                      </span>
                    </div>
                    <Table 
                      dataSource={labDeltas} 
                      columns={labColumns} 
                      pagination={false}
                      size="middle"
                      style={{ border: '1px solid #f1f5f9', borderRadius: 8, overflow: 'hidden' }}
                    />
                  </div>

                  {/* Radiology and Toxicity Section */}
                  <Row gutter={[20, 20]}>
                    <Col xs={24} md={12}>
                      <Card 
                        type="inner" 
                        title={<span style={{ fontWeight: 600, fontSize: 14 }}>New Radiology & Pathology Reports</span>}
                        style={{ borderRadius: 8, height: '100%' }}
                      >
                        <Timeline
                          items={[
                            {
                              color: 'blue',
                              children: (
                                <div>
                                  <div style={{ fontWeight: 600, color: '#0f172a' }}>
                                    Contrast Mammogram & Breast Ultrasound
                                  </div>
                                  <div style={{ fontSize: 12, color: '#64748b' }}>
                                    3 days ago • Dept of Radiology
                                  </div>
                                  <div style={{ fontSize: 12, color: '#334155', marginTop: 4, background: '#f8fafc', padding: 8, borderRadius: 6 }}>
                                    &quot;Primary left upper outer quadrant mass measures 2.1 x 1.8 cm (reduced from 3.4 cm baseline, representing partial response). Axillary lymph node remains enlarged at 1.2 cm.&quot;
                                  </div>
                                </div>
                              ),
                            },
                            {
                              color: 'green',
                              children: (
                                <div>
                                  <div style={{ fontWeight: 600, color: '#0f172a' }}>
                                    Core Needle Biopsy Histopathology
                                  </div>
                                  <div style={{ fontSize: 12, color: '#64748b' }}>
                                    14 days ago • Histopathology Lab
                                  </div>
                                  <div style={{ fontSize: 12, color: '#334155', marginTop: 4, background: '#f8fafc', padding: 8, borderRadius: 6 }}>
                                    &quot;Invasive ductal carcinoma, histological grade 2, Nottingham score 6/9. Ki-67 proliferation index: 28%.&quot;
                                  </div>
                                </div>
                              ),
                            },
                          ]}
                        />
                      </Card>
                    </Col>

                    <Col xs={24} md={12}>
                      <Card 
                        type="inner" 
                        title={<span style={{ fontWeight: 600, fontSize: 14 }}>Reported Toxicities (CTCAE v5.0)</span>}
                        style={{ borderRadius: 8, height: '100%' }}
                      >
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                          <div style={{ padding: 12, background: '#fffbeb', borderRadius: 8, border: '1px solid #fef3c7' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span style={{ fontWeight: 600, color: '#92400e', fontSize: 13 }}>
                                Peripheral Sensory Neuropathy
                              </span>
                              <Tag color="orange" style={{ fontWeight: 700 }}>GRADE 2</Tag>
                            </div>
                            <div style={{ fontSize: 12, color: '#78350f', marginTop: 4 }}>
                              Patient reported bilateral tingling and numbness in fingertips and toes, exacerbated by cold temperatures.
                            </div>
                          </div>

                          <div style={{ padding: 12, background: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span style={{ fontWeight: 600, color: '#334155', fontSize: 13 }}>
                                Nausea / Emesis
                              </span>
                              <Tag color="green" style={{ fontWeight: 700 }}>GRADE 1</Tag>
                            </div>
                            <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>
                              Well controlled with oral Ondansetron 8mg PO BID. Appetite preserved.
                            </div>
                          </div>

                          <div style={{ padding: 12, background: '#fff1f2', borderRadius: 8, border: '1px solid #ffe4e6' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span style={{ fontWeight: 600, color: '#9f1239', fontSize: 13 }}>
                                Neutropenia (Hematologic)
                              </span>
                              <Tag color="red" style={{ fontWeight: 700 }}>GRADE 2</Tag>
                            </div>
                            <div style={{ fontSize: 12, color: '#be123c', marginTop: 4 }}>
                              ANC 1,100 /uL. Patient is afebrile (Temp: 98.4°F). Advised immediate emergency reporting if fever &gt; 100.4°F develops.
                            </div>
                          </div>
                        </div>
                      </Card>
                    </Col>
                  </Row>
                </div>
              ),
            },
            {
              key: '2',
              label: (
                <Space>
                  <CalendarOutlined style={{ color: '#0284c7' }} />
                  <span style={{ fontWeight: 600 }}>Treatment Journey Roadmap</span>
                  <Tag color="blue" style={{ fontSize: 10, margin: 0 }}>50% Completed</Tag>
                </Space>
              ),
              children: (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 24, paddingTop: 12 }}>
                  {/* Chemo Progress Bar */}
                  <div style={{ background: '#f8fafc', padding: 20, borderRadius: 10, border: '1px solid #e2e8f0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                      <div>
                        <span style={{ fontSize: 15, fontWeight: 700, color: '#0f172a' }}>
                          Regimen: AC-T Neoadjuvant Chemotherapy
                        </span>
                        <div style={{ fontSize: 12, color: '#64748b' }}>
                          Doxorubicin 60 mg/m² + Cyclophosphamide 600 mg/m² q3w (Cycles 1–4) &rarr; Paclitaxel 80 mg/m² weekly x 12
                        </div>
                      </div>
                      <Tag color="purple" style={{ fontWeight: 700, fontSize: 12, padding: '4px 10px' }}>
                        CYCLE 3 OF 6 COMPLETED
                      </Tag>
                    </div>
                    <Progress 
                      percent={50} 
                      strokeColor={{ '0%': '#4f46e5', '100%': '#06b6d4' }} 
                      status="active" 
                      style={{ margin: '12px 0 8px' }} 
                    />
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#64748b' }}>
                      <span>Cycle 1 (Day 1) — Complete</span>
                      <span>Cycle 2 (Day 22) — Complete</span>
                      <span>Cycle 3 (Day 43) — Complete</span>
                      <span style={{ color: '#e11d48', fontWeight: 700 }}>Cycle 4 (Day 64) — DELAYED (ANC 1,100)</span>
                      <span>Cycle 5 — Planned</span>
                      <span>Cycle 6 — Planned</span>
                    </div>
                  </div>

                  {/* Milestone Timeline */}
                  <div>
                    <span style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', display: 'block', marginBottom: 16 }}>
                      Multidisciplinary Care Continuum Milestones
                    </span>
                    <Timeline
                      mode="left"
                      items={[
                        {
                          color: 'green',
                          dot: <CheckCircleOutlined style={{ fontSize: 16 }} />,
                          children: (
                            <div>
                              <strong style={{ color: '#0f172a' }}>Tumor Board Diagnostic Consensus</strong>
                              <div style={{ fontSize: 12, color: '#64748b' }}>Nov 14, 2025 • Completed</div>
                              <p style={{ fontSize: 12, color: '#334155', margin: '4px 0 0' }}>
                                Confirmed clinical stage cT2 N1 M0 (Stage IIB). Decided on neoadjuvant AC-T chemotherapy followed by breast conserving surgery.
                              </p>
                            </div>
                          ),
                        },
                        {
                          color: 'green',
                          dot: <CheckCircleOutlined style={{ fontSize: 16 }} />,
                          children: (
                            <div>
                              <strong style={{ color: '#0f172a' }}>Neoadjuvant Chemotherapy Initiation</strong>
                              <div style={{ fontSize: 12, color: '#64748b' }}>Dec 02, 2025 • Completed</div>
                              <p style={{ fontSize: 12, color: '#334155', margin: '4px 0 0' }}>
                                Chemoport inserted. Cycles 1–3 tolerated with antiemetic support.
                              </p>
                            </div>
                          ),
                        },
                        {
                          color: 'red',
                          dot: <ClockCircleOutlined style={{ fontSize: 16, color: '#e11d48' }} />,
                          children: (
                            <div>
                              <strong style={{ color: '#e11d48' }}>Cycle 4 Chemotherapy & Pre-Chemo Labs (OVERDUE)</strong>
                              <div style={{ fontSize: 12, color: '#e11d48', fontWeight: 600 }}>Due: 7 days ago • Overdue</div>
                              <p style={{ fontSize: 12, color: '#be123c', margin: '4px 0 0' }}>
                                Missed scheduled appointment. ANC was 1,100 /uL on remote lab draw. Requires repeat ANC before administration.
                              </p>
                            </div>
                          ),
                        },
                        {
                          color: 'blue',
                          dot: <ClockCircleOutlined style={{ fontSize: 16 }} />,
                          children: (
                            <div>
                              <strong style={{ color: '#0f172a' }}>Mid-Treatment Restaging PET-CT Scan</strong>
                              <div style={{ fontSize: 12, color: '#64748b' }}>Scheduled in 3 weeks</div>
                              <p style={{ fontSize: 12, color: '#334155', margin: '4px 0 0' }}>
                                Evaluation of metabolic tumor response prior to surgical consultation.
                              </p>
                            </div>
                          ),
                        },
                        {
                          color: 'gray',
                          children: (
                            <div>
                              <strong style={{ color: '#64748b' }}>Surgical Consultation (Breast Conserving Surgery + SLNB)</strong>
                              <div style={{ fontSize: 12, color: '#94a3b8' }}>Planned for Q2 2026</div>
                            </div>
                          ),
                        },
                        {
                          color: 'gray',
                          children: (
                            <div>
                              <strong style={{ color: '#64748b' }}>Adjuvant Radiation & Long-Term Hormone Therapy</strong>
                              <div style={{ fontSize: 12, color: '#94a3b8' }}>Planned post-op</div>
                            </div>
                          ),
                        },
                      ]}
                    />
                  </div>
                </div>
              ),
            },
            {
              key: '3',
              label: (
                <Space>
                  <WarningOutlined style={{ color: '#d97706' }} />
                  <span style={{ fontWeight: 600 }}>Care Gaps & Action Items</span>
                  <Badge count="2 Open" style={{ backgroundColor: '#f59e0b', fontSize: 10 }} />
                </Space>
              ),
              children: (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16, paddingTop: 12 }}>
                  <div style={{ padding: 18, background: '#fff1f2', borderRadius: 10, border: '1px solid #fecdd3' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <Tag color="red" style={{ fontWeight: 700 }}>HIGH PRIORITY GAP</Tag>
                          <span style={{ fontWeight: 700, fontSize: 15, color: '#9f1239' }}>
                            Overdue Chemotherapy Cycle 4 (Delayed 7 Days)
                          </span>
                        </div>
                        <p style={{ margin: '8px 0 0', fontSize: 13, color: '#be123c', maxWidth: 700 }}>
                          Patient did not attend scheduled infusion appointment on Day 64. Lab draw revealed ANC 1,100 /uL. 
                          Protocol requires repeat CBC/ANC with G-CSF decision support.
                        </p>
                      </div>

                      <Space>
                        <Button 
                          type="primary" 
                          danger 
                          icon={<ThunderboltOutlined />}
                          onClick={handleOrderStatLab}
                        >
                          Order Stat ANC Repeat
                        </Button>
                        <Button 
                          icon={<PhoneOutlined />}
                          onClick={handleSendReminder}
                        >
                          Send WhatsApp Reminder
                        </Button>
                      </Space>
                    </div>
                  </div>

                  <div style={{ padding: 18, background: '#fffbeb', borderRadius: 10, border: '1px solid #fef3c7' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <Tag color="gold" style={{ fontWeight: 700 }}>FOLLOW-UP TASK</Tag>
                          <span style={{ fontWeight: 700, fontSize: 15, color: '#92400e' }}>
                            Patient Outreach & Toxicity Monitoring Call
                          </span>
                        </div>
                        <p style={{ margin: '8px 0 0', fontSize: 13, color: '#b45309', maxWidth: 700 }}>
                          Coordinator attempted phone outreach 2 days ago; phone rang without answer. Assigned to Care Coordinator Pooja Verma for second outreach attempt.
                        </p>
                      </div>

                      <Button 
                        type="default" 
                        style={{ borderColor: '#d97706', color: '#92400e' }}
                        onClick={() => message.success('Outreach attempt logged in Care Coordination register')}
                      >
                        Log Outreach Note
                      </Button>
                    </div>
                  </div>

                  {/* Clinical Actions Bar */}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                    gap: 12,
                    paddingTop: 12,
                    borderTop: '1px solid #f1f5f9'
                  }}>
                    <Button icon={<PrinterOutlined />}>Print Consultation Sheet</Button>
                    <Button icon={<ShareAltOutlined />}>Export ABDM FHIR Bundle</Button>
                    <Button type="primary" style={{ background: '#4f46e5' }}>
                      Finalize Consultation Notes
                    </Button>
                  </div>
                </div>
              ),
            },
          ]}
        />
      </Card>
    </div>
  );
};

