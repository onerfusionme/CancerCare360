'use client';
import React, { useState } from 'react';
import { Tabs, Typography, Card, Descriptions, Row, Col, Table, Button, Tag, Timeline, Space, Progress, message } from 'antd';
import { ArrowLeftOutlined, CheckCircleOutlined, ClockCircleOutlined, SyncOutlined, FileTextOutlined, MedicineBoxOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import { usePatientTimeline } from '@/hooks/use-journeys';
import { useInvestigations } from '@/hooks/use-investigations';
import { useDocuments } from '@/hooks/use-documents';
import { JourneyTimeline } from '@/components/journey/JourneyTimeline';
import StatusBadge from '@/components/ui/StatusBadge';
import { ReadinessCard } from '@/components/consultation/ReadinessCard';
import { useConsultationReadiness } from '@/hooks/use-consultation';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

export default function PatientDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const patientId = params.id;
  const { data: timeline, isLoading: isTimelineLoading } = usePatientTimeline(patientId);
  const { data: investigations, isLoading: isInvLoading } = useInvestigations({ patientId });
  const { data: documents, isLoading: isDocLoading } = useDocuments({ patientId });
  const { data: readiness, isLoading: isReadinessLoading } = useConsultationReadiness(patientId);

  const invColumns = [
    { title: 'Type', dataIndex: 'type', key: 'type' },
    { title: 'Ordered', dataIndex: 'orderedDate', key: 'orderedDate', render: (d: string) => d ? dayjs(d).format('MMM D, YYYY') : '-' },
    { title: 'Status', dataIndex: 'status', key: 'status', render: (s: string) => <StatusBadge status={s} /> }
  ];

  const docColumns = [
    { title: 'Type', dataIndex: 'type', key: 'type' },
    { title: 'Name', dataIndex: 'fileName', key: 'fileName' },
    { title: 'Date', dataIndex: 'uploadedAt', key: 'uploadedAt', render: (d: string) => d ? dayjs(d).format('MMM D, YYYY') : '-' },
    { title: 'Status', dataIndex: 'verificationStatus', key: 'verificationStatus', render: (s: string) => <StatusBadge status={s} /> }
  ];

  const milestoneColumns = [
    { title: 'Treatment Step', dataIndex: 'step', key: 'step', render: (t: string) => <Text strong>{t}</Text> },
    { title: 'Regimen / Protocol', dataIndex: 'protocol', key: 'protocol' },
    { title: 'Target Date', dataIndex: 'date', key: 'date', render: (d: string) => dayjs(d).format('DD MMM YYYY') },
    { 
      title: 'Status', 
      dataIndex: 'status', 
      key: 'status',
      render: (s: string) => (
        <Tag color={s === 'COMPLETED' ? 'green' : s === 'DELAYED' ? 'red' : 'blue'}>{s}</Tag>
      )
    },
    { title: 'Adherence / Note', dataIndex: 'adherence', key: 'adherence' }
  ];

  const treatmentMilestones: any[] = [];
  const activityAuditLogs: any[] = [];

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => router.push('/patients')}>
          Back to Patient Directory
        </Button>
        <Title level={3} style={{ margin: 0 }}>Comprehensive Oncology Dossier</Title>
      </div>

      <Tabs items={[
        {
          key: 'overview',
          label: 'Consultation Briefing',
          children: (
            <Row gutter={16}>
              <Col span={24}>
                <ReadinessCard readiness={readiness} loading={isReadinessLoading} />
              </Col>
            </Row>
          )
        },
        {
          key: 'journey',
          label: 'Longitudinal Journey',
          children: (
            <Card title="Longitudinal Patient Journey & Milestones">
              <JourneyTimeline events={timeline?.events || []} loading={isTimelineLoading} />
            </Card>
          )
        },
        {
          key: 'investigations',
          label: 'Diagnostic Investigations',
          children: <Table dataSource={Array.isArray(investigations) ? investigations : ((investigations as any)?.data || [])} columns={invColumns} rowKey="id" loading={isInvLoading} />
        },
        {
          key: 'documents',
          label: 'Clinical Documents',
          children: <Table dataSource={documents || []} columns={docColumns} rowKey="id" loading={isDocLoading} />
        },
        {
          key: 'treatment',
          label: 'Treatment Milestones & Adherence',
          children: (
            <Card title="Chemotherapy & Surgical Protocol Adherence">
              <Table 
                dataSource={treatmentMilestones} 
                columns={milestoneColumns} 
                rowKey="id" 
                pagination={false} 
              />
            </Card>
          )
        },
        {
          key: 'activity',
          label: 'Clinical Activity & Audit Trail',
          children: (
            <Card title="DPDP & ABDM Compliant Activity Audit Trail">
              {activityAuditLogs.length > 0 ? (
                <Timeline
                  items={activityAuditLogs.map(log => ({
                    color: 'blue',
                    children: (
                      <div style={{ paddingBottom: 12 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Text strong>{log.title}</Text>
                          <Text type="secondary" style={{ fontSize: 12 }}>{log.time}</Text>
                        </div>
                        <div style={{ color: '#475569', fontSize: 13, marginTop: 2 }}>{log.desc}</div>
                        <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>Logged by: {log.user}</div>
                      </div>
                    )
                  }))}
                />
              ) : (
                <div style={{ padding: '24px 0', textAlign: 'center', color: '#64748b' }}>
                  No recent audit logs on record for this patient.
                </div>
              )}
            </Card>
          )
        }
      ]} />
    </div>
  );
}
