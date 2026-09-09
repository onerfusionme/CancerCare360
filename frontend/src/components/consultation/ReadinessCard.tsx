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
  message,
  Empty
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

  const rawLabs = readiness?.sinceLastVisit?.newInvestigations || readiness?.pendingItems?.investigations || [];
  const labDeltas = rawLabs.map((inv: any, idx: number) => ({
    key: inv.id || String(idx),
    parameter: inv.type ? inv.type.replace(/_/g, ' ') : 'Lab Investigation',
    current: inv.notes || 'Awaiting Result',
    previous: '—',
    delta: '—',
    trend: 'neutral',
    reference: 'Standard Range',
    status: inv.status || 'ORDERED',
    statusColor: inv.status === 'REPORT_AVAILABLE' || inv.status === 'REVIEWED' ? '#059669' : '#d97706',
    clinicalNote: inv.notes || 'Order placed'
  }));

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
                  <Badge count={labDeltas.length} style={{ backgroundColor: labDeltas.length ? '#e11d48' : '#94a3b8', fontSize: 10 }} />
                </Space>
              ),
              children: (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20, paddingTop: 12 }}>
                  {labDeltas.length > 0 ? (
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                        <span style={{ fontSize: 15, fontWeight: 700, color: '#0f172a' }}>
                          Biochemical & Hematological Longitudinal Deltas
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
                  ) : (
                    <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No new lab or diagnostic deltas since last visit" />
                  )}
                </div>
              ),
            },
            {
              key: '2',
              label: (
                <Space>
                  <CalendarOutlined style={{ color: '#0284c7' }} />
                  <span style={{ fontWeight: 600 }}>Treatment Journey Roadmap</span>
                </Space>
              ),
              children: (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 24, paddingTop: 12 }}>
                  {readiness?.currentJourney?.milestones?.length ? (
                    <Timeline
                      mode="left"
                      items={readiness.currentJourney.milestones.map((m: any) => ({
                        color: m.status === 'COMPLETED' ? 'green' : 'blue',
                        dot: m.status === 'COMPLETED' ? <CheckCircleOutlined style={{ fontSize: 16 }} /> : <ClockCircleOutlined style={{ fontSize: 16 }} />,
                        children: (
                          <div>
                            <strong style={{ color: '#0f172a' }}>{m.type || m.name}</strong>
                            <div style={{ fontSize: 12, color: '#64748b' }}>{m.expectedDate ? dayjs(m.expectedDate).format('MMM D, YYYY') : 'Pending'}</div>
                            {m.notes && <p style={{ fontSize: 12, color: '#334155', margin: '4px 0 0' }}>{m.notes}</p>}
                          </div>
                        )
                      }))}
                    />
                  ) : (
                    <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No care milestones recorded for this active journey" />
                  )}
                </div>
              ),
            },
            {
              key: '3',
              label: (
                <Space>
                  <WarningOutlined style={{ color: '#d97706' }} />
                  <span style={{ fontWeight: 600 }}>Care Gaps & Action Items</span>
                  <Badge count={readiness?.pendingItems?.followUpTasks?.length || 0} style={{ backgroundColor: '#f59e0b', fontSize: 10 }} />
                </Space>
              ),
              children: (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16, paddingTop: 12 }}>
                  {readiness?.pendingItems?.followUpTasks?.length ? (
                    readiness.pendingItems.followUpTasks.map((task: any) => (
                      <div key={task.id} style={{ padding: 18, background: '#fffbeb', borderRadius: 10, border: '1px solid #fef3c7' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <Tag color="gold" style={{ fontWeight: 700 }}>{task.taskType || 'FOLLOW-UP'}</Tag>
                              <span style={{ fontWeight: 700, fontSize: 15, color: '#92400e' }}>
                                {task.description}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No open care gaps or follow-up tasks detected" />
                  )}

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

