'use client';
import React, { useState } from 'react';
import { Tabs, Typography, Card, Descriptions, Row, Col, Table } from 'antd';
import { usePatientTimeline } from '@/hooks/use-journeys';
import { useInvestigations } from '@/hooks/use-investigations';
import { useDocuments } from '@/hooks/use-documents';
import { JourneyTimeline } from '@/components/journey/JourneyTimeline';
import StatusBadge from '@/components/ui/StatusBadge';
import { ReadinessCard } from '@/components/consultation/ReadinessCard';
import { useConsultationReadiness } from '@/hooks/use-consultation';
import dayjs from 'dayjs';

const { Title } = Typography;

export default function PatientDetailPage({ params }: { params: { id: string } }) {
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

  return (
    <div style={{ padding: 24 }}>
      <Title level={2}>Patient Detail</Title>
      <Tabs items={[
        {
          key: 'overview',
          label: 'Overview',
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
          label: 'Journey',
          children: (
            <Card title="Patient Journey">
              <JourneyTimeline events={timeline?.events || []} loading={isTimelineLoading} />
            </Card>
          )
        },
        {
          key: 'investigations',
          label: 'Investigations',
          children: <Table dataSource={investigations} columns={invColumns} rowKey="id" loading={isInvLoading} />
        },
        {
          key: 'documents',
          label: 'Documents',
          children: <Table dataSource={documents} columns={docColumns} rowKey="id" loading={isDocLoading} />
        },
        {
          key: 'treatment',
          label: 'Treatment',
          children: <div>Treatment Milestones View Here</div>
        },
        {
          key: 'activity',
          label: 'Activity',
          children: <div>Audit Log Placeholder</div>
        }
      ]} />
    </div>
  );
}
