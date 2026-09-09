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

  const treatmentMilestones = [
    { id: 'tm1', step: 'Cycle 1 AC Chemotherapy', protocol: 'Doxorubicin + Cyclophosphamide', date: '2026-06-25', status: 'COMPLETED', adherence: '100%' },
    { id: 'tm2', step: 'Cycle 2 AC Chemotherapy', protocol: 'Doxorubicin + Cyclophosphamide', date: '2026-07-16', status: 'COMPLETED', adherence: '100%' },
    { id: 'tm3', step: 'Cycle 3 AC Chemotherapy', protocol: 'Doxorubicin + Cyclophosphamide', date: '2026-08-06', status: 'COMPLETED', adherence: '95%' },
    { id: 'tm4', step: 'Cycle 4 AC Chemotherapy', protocol: 'Doxorubicin + Cyclophosphamide', date: '2026-08-27', status: 'DELAYED', adherence: 'Neutropenia Hold' },
    { id: 'tm5', step: 'Restaging PET-CT Scan', protocol: 'Response Evaluation RECIST 1.1', date: '2026-09-18', status: 'PENDING', adherence: 'Scheduled' },
    { id: 'tm6', step: 'Breast Conserving Surgery (BCS)', protocol: 'Surgical Oncology Wing', date: '2026-10-10', status: 'PENDING', adherence: 'Upcoming' },
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

  const activityAuditLogs = [
    { time: 'Today, 11:20 AM', title: 'Care Coordinator Contact', desc: 'Nurse Pooja called patient regarding ANC repeat test schedule.', user: 'Pooja Verma (RN)' },
    { time: 'Yesterday, 04:45 PM', title: 'Lab Result Uploaded', desc: 'Complete Blood Count (CBC) uploaded via hospital LIS sync.', user: 'LIS Interface Engine' },
    { time: '02 Sep 2026, 10:15 AM', title: 'Consultation Completed', desc: 'Dr. Jane Smith held neoadjuvant mid-treatment assessment.', user: 'Dr. Jane Smith' },
    { time: '27 Aug 2026, 09:00 AM', title: 'Chemotherapy Hold Flagged', desc: 'Cycle 4 paused due to CTCAE Grade 2 neutropenia (ANC 1,100 /uL).', user: 'Care Gap Engine' }
  ];

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
          children: <Table dataSource={investigations || []} columns={invColumns} rowKey="id" loading={isInvLoading} />
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
              <div style={{ marginBottom: 16 }}>
                <Text type="secondary">Protocol: AC-T Dose-Dense Neoadjuvant Regimen (4 Cycles AC + 4 Cycles Paclitaxel)</Text>
              </div>
              <Table dataSource={treatmentMilestones} columns={milestoneColumns} rowKey="id" pagination={false} />
            </Card>
          )
        },
        {
          key: 'activity',
          label: 'Clinical Activity & Audit Trail',
          children: (
            <Card title="DPDP & ABDM Compliant Activity Audit Trail">
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
            </Card>
          )
        }
      ]} />
    </div>
  );
}
