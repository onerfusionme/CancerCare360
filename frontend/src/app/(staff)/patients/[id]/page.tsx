'use client';

import React, { useState } from 'react';
import { 
  Tabs, 
  Typography, 
  Card, 
  Descriptions, 
  Row, 
  Col, 
  Table, 
  Button, 
  Tag, 
  Timeline, 
  Space, 
  Progress, 
  message, 
  Modal, 
  Form, 
  Input, 
  Tooltip,
  Badge
} from 'antd';
import { 
  ArrowLeftOutlined, 
  CheckCircleOutlined, 
  ClockCircleOutlined, 
  SyncOutlined, 
  FileTextOutlined, 
  MedicineBoxOutlined,
  AlertOutlined,
  UserOutlined,
  CalendarOutlined,
  CarOutlined,
  DollarOutlined,
  SolutionOutlined
} from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';

import { usePatient } from '@/hooks/use-patients';
import { usePatientTimeline } from '@/hooks/use-journeys';
import { useInvestigations } from '@/hooks/use-investigations';
import { useDocuments } from '@/hooks/use-documents';
import { useConsultationReadiness } from '@/hooks/use-consultation';
import { navigationService } from '@/services/navigation.service';
import { JourneyTimeline } from '@/components/journey/JourneyTimeline';
import StatusBadge from '@/components/ui/StatusBadge';
import { ReadinessCard } from '@/components/consultation/ReadinessCard';
import BarrierAssessmentModal from '@/components/navigation/BarrierAssessmentModal';
import { PatientBarrier, BarrierStatus } from '@/types/navigation';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

export default function PatientDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const patientId = params.id;

  const [barrierModalOpen, setBarrierModalOpen] = useState(false);
  const [resolveModalOpen, setResolveModalOpen] = useState(false);
  const [selectedBarrier, setSelectedBarrier] = useState<PatientBarrier | null>(null);
  const [resolveForm] = Form.useForm();

  // Queries
  const { data: patient, isLoading: isPatientLoading } = usePatient(patientId);
  const { data: timeline, isLoading: isTimelineLoading } = usePatientTimeline(patientId);
  const { data: investigations, isLoading: isInvLoading } = useInvestigations({ patientId });
  const { data: documents, isLoading: isDocLoading } = useDocuments({ patientId });
  const { data: readiness, isLoading: isReadinessLoading } = useConsultationReadiness(patientId);

  // Navigation Barriers Query
  const { 
    data: barriers, 
    isLoading: isBarriersLoading, 
    refetch: refetchBarriers 
  } = useQuery({
    queryKey: ['patientBarriers', patientId],
    queryFn: () => navigationService.getPatientBarriers(patientId),
    enabled: !!patientId,
  });

  const barrierList = Array.isArray(barriers) ? barriers : [];

  // Resolve Barrier Mutation
  const resolveBarrierMutation = useMutation({
    mutationFn: ({ barrierId, notes }: { barrierId: string; notes?: string }) => 
      navigationService.resolveBarrier(barrierId, { resolutionNotes: notes }),
    onSuccess: () => {
      message.success('Barrier marked as resolved');
      queryClient.invalidateQueries({ queryKey: ['patientBarriers', patientId] });
      setResolveModalOpen(false);
      setSelectedBarrier(null);
      resolveForm.resetFields();
    },
    onError: () => {
      message.error('Failed to resolve barrier');
    },
  });

  const handleResolveSubmit = (values: any) => {
    if (!selectedBarrier) return;
    resolveBarrierMutation.mutate({
      barrierId: selectedBarrier.id,
      notes: values.notes,
    });
  };

  const getFollowUpStageTag = (stage?: string) => {
    switch (stage) {
      case 'AT_RISK_LTFU':
        return <Tag color="error" style={{ fontSize: 12, padding: '2px 8px' }} icon={<AlertOutlined />}>AT RISK LTFU</Tag>;
      case 'RE_ENGAGED':
        return <Tag color="success" style={{ fontSize: 12, padding: '2px 8px' }} icon={<CheckCircleOutlined />}>RE-ENGAGED</Tag>;
      case 'SURVEILLANCE':
        return <Tag color="cyan" style={{ fontSize: 12, padding: '2px 8px' }}>SURVEILLANCE</Tag>;
      case 'REQUIRING_INVESTIGATION':
        return <Tag color="warning" style={{ fontSize: 12, padding: '2px 8px' }}>REQ. INVESTIGATION</Tag>;
      case 'REQUIRING_REVIEW':
        return <Tag color="gold" style={{ fontSize: 12, padding: '2px 8px' }}>REQ. REVIEW</Tag>;
      case 'UNDER_TREATMENT':
        return <Tag color="processing" style={{ fontSize: 12, padding: '2px 8px' }}>UNDER TREATMENT</Tag>;
      case 'UNDER_FOLLOW_UP':
        return <Tag color="blue" style={{ fontSize: 12, padding: '2px 8px' }}>UNDER FOLLOW-UP</Tag>;
      case 'LOST_TO_FOLLOW_UP':
        return <Tag color="default" style={{ fontSize: 12, padding: '2px 8px' }}>LOST TO FOLLOW-UP</Tag>;
      default:
        return <Tag color="blue">{stage || 'ACTIVE'}</Tag>;
    }
  };

  const invColumns = [
    { title: 'Investigation Type', dataIndex: 'type', key: 'type', render: (t: string) => <Text strong>{t}</Text> },
    { title: 'Ordered Date', dataIndex: 'orderedDate', key: 'orderedDate', render: (d: string) => d ? dayjs(d).format('DD MMM YYYY') : '-' },
    { title: 'Status', dataIndex: 'status', key: 'status', render: (s: string) => <StatusBadge status={s} /> }
  ];

  const docColumns = [
    { title: 'Document Type', dataIndex: 'type', key: 'type' },
    { title: 'File Name', dataIndex: 'fileName', key: 'fileName', render: (n: string) => <Text code>{n}</Text> },
    { title: 'Uploaded At', dataIndex: 'uploadedAt', key: 'uploadedAt', render: (d: string) => d ? dayjs(d).format('DD MMM YYYY') : '-' },
    { title: 'Verification', dataIndex: 'verificationStatus', key: 'verificationStatus', render: (s: string) => <StatusBadge status={s} /> }
  ];

  // Milestone columns
  const milestoneColumns = [
    { title: 'Milestone / Event', dataIndex: 'title', key: 'title', render: (t: string) => <Text strong>{t}</Text> },
    { title: 'Protocol Regimen', dataIndex: 'category', key: 'category' },
    { title: 'Expected Date', dataIndex: 'expectedDate', key: 'expectedDate', render: (d: string) => d ? dayjs(d).format('DD MMM YYYY') : '—' },
    { 
      title: 'Status', 
      dataIndex: 'status', 
      key: 'status',
      render: (s: string) => (
        <Tag color={s === 'COMPLETED' ? 'green' : s === 'OVERDUE' ? 'red' : 'blue'}>
          {s || 'PENDING'}
        </Tag>
      )
    },
    { title: 'Notes / TAT', dataIndex: 'notes', key: 'notes', render: (n: string) => n || '—' },
  ];

  // Barriers columns
  const barrierColumns = [
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      width: 160,
      render: (cat: string, record: PatientBarrier) => (
        <div>
          <Tag color={record.isHospitalSide ? 'purple' : 'orange'} style={{ fontWeight: 600 }}>
            {cat}
          </Tag>
          <div style={{ fontSize: 10, color: '#64748b', marginTop: 2 }}>
            {record.isHospitalSide ? 'Hospital-Side Bottleneck' : 'Patient-Side Barrier'}
          </div>
        </div>
      ),
    },
    {
      title: 'Obstacle Description / Patient Voice',
      dataIndex: 'barrierDetail',
      key: 'barrierDetail',
      render: (d: string, record: PatientBarrier) => (
        <div>
          <div style={{ fontSize: 13 }}>{d}</div>
          <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>
            Reported by: <Text strong>{record.reportedBy || 'Patient'}</Text> &bull; {dayjs(record.createdAt).format('DD MMM YYYY')}
          </div>
        </div>
      ),
    },
    {
      title: 'Planned Intervention',
      key: 'intervention',
      render: (_: any, record: PatientBarrier) => (
        <div>
          <Tag color="cyan">{(record.interventionType || 'OTHER').replace(/_/g, ' ')}</Tag>
          {record.interventionNotes && (
            <div style={{ fontSize: 11, marginTop: 2 }}>
              &ldquo;{record.interventionNotes}&rdquo;
            </div>
          )}
        </div>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 130,
      render: (status: BarrierStatus, record: PatientBarrier) => (
        <div>
          <Tag color={status === BarrierStatus.RESOLVED ? 'green' : 'gold'}>
            {status}
          </Tag>
          {record.resolvedAt && (
            <div style={{ fontSize: 10, color: '#64748b', marginTop: 2 }}>
              Resolved: {dayjs(record.resolvedAt).format('DD MMM')}
            </div>
          )}
        </div>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 120,
      render: (_: any, record: PatientBarrier) => (
        <div>
          {record.status !== BarrierStatus.RESOLVED ? (
            <Button
              size="small"
              type="primary"
              icon={<CheckCircleOutlined />}
              style={{ background: '#16a34a', borderColor: '#16a34a' }}
              onClick={() => {
                setSelectedBarrier(record);
                setResolveModalOpen(true);
              }}
            >
              Resolve
            </Button>
          ) : (
            <Tag color="success">Resolved</Tag>
          )}
        </div>
      ),
    },
  ];

  // Derive milestones from patient journeys if available
  const milestonesList = React.useMemo(() => {
    if (patient?.careJourneys && Array.isArray(patient.careJourneys)) {
      const items: any[] = [];
      patient.careJourneys.forEach((j: any) => {
        if (j.milestones && Array.isArray(j.milestones)) {
          items.push(...j.milestones);
        }
      });
      return items;
    }
    return [];
  }, [patient]);

  return (
    <div style={{ padding: 24 }}>
      {/* Back Button & Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <Space>
          <Button icon={<ArrowLeftOutlined />} onClick={() => router.push('/patients')}>
            Patient Directory
          </Button>
          <Title level={3} style={{ margin: 0 }}>Comprehensive Oncology Dossier</Title>
        </Space>
        <Space>
          <Button 
            icon={<AlertOutlined />} 
            onClick={() => setBarrierModalOpen(true)}
            style={{ borderColor: '#ea580c', color: '#ea580c' }}
          >
            + Screen / Log Barrier
          </Button>
        </Space>
      </div>

      {/* Patient Demographic & Continuity Banner */}
      <Card className="glass-card" style={{ marginBottom: 20 }} styles={{ body: { padding: '20px 24px' } }}>
        <Row gutter={[20, 16]} align="middle">
          <Col xs={24} md={6}>
            <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--color-text-primary, #0f172a)' }}>
              {patient?.firstName} {patient?.lastName}
            </div>
            <div style={{ fontSize: 12.5, color: 'var(--color-text-secondary, #334155)', marginTop: 4 }}>
              MRN: <Text code strong>{patient?.mrn || '—'}</Text> &bull; {patient?.gender || '—'} &bull; {patient?.dateOfBirth ? `${dayjs().diff(dayjs(patient.dateOfBirth), 'year')} yrs` : '—'}
            </div>
          </Col>

          <Col xs={12} md={5}>
            <div style={{ fontSize: 11, color: 'var(--color-text-secondary, #475569)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.04em' }}>Follow-Up Continuity Stage</div>
            <div style={{ marginTop: 6 }}>
              {getFollowUpStageTag(patient?.followUpStage)}
            </div>
          </Col>

          <Col xs={12} md={4}>
            <div style={{ fontSize: 11, color: 'var(--color-text-secondary, #475569)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.04em' }}>Care Coordinator</div>
            <div style={{ marginTop: 6, fontWeight: 600, fontSize: 13, color: 'var(--color-text-primary, #0f172a)' }}>
              {patient?.careCoordinator 
                ? `${patient.careCoordinator.firstName} ${patient.careCoordinator.lastName}` 
                : <span style={{ color: '#94a3b8' }}>Unassigned</span>}
            </div>
          </Col>

          <Col xs={12} md={4}>
            <div style={{ fontSize: 11, color: 'var(--color-text-secondary, #475569)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.04em' }}>Primary Oncologist</div>
            <div style={{ marginTop: 6, fontWeight: 600, fontSize: 13, color: 'var(--color-text-primary, #0f172a)' }}>
              {patient?.primaryDoctorName || 'Treating Oncologist'}
            </div>
          </Col>

          <Col xs={12} md={5}>
            <div style={{ fontSize: 11, color: 'var(--color-text-secondary, #475569)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.04em' }}>Contact Number</div>
            <div style={{ marginTop: 6, fontSize: 13, fontWeight: 600, color: 'var(--color-text-primary, #0f172a)' }}>
              {patient?.phoneNumber || '+91 98765 43210'}
            </div>
          </Col>
        </Row>
      </Card>

      {/* Tabs */}
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
          key: 'navigation',
          label: (
            <span>
              <AlertOutlined style={{ marginRight: 6 }} />
              Patient Navigation & Barriers ({barrierList.length})
            </span>
          ),
          children: (
            <Card 
              className="glass-card"
              title="Continuity Barriers & Social Work Interventions"
              extra={
                <Button 
                  type="primary" 
                  icon={<AlertOutlined />} 
                  onClick={() => setBarrierModalOpen(true)}
                  style={{ background: '#0284c7', borderColor: '#0284c7' }}
                >
                  Screen New Barrier
                </Button>
              }
            >
              <Table
                dataSource={barrierList}
                columns={barrierColumns}
                rowKey="id"
                loading={isBarriersLoading}
                pagination={{ pageSize: 5 }}
              />
            </Card>
          )
        },
        {
          key: 'milestones',
          label: (
            <span>
              <CalendarOutlined style={{ marginRight: 6 }} />
              Expected Follow-Up Plan & Milestones
            </span>
          ),
          children: (
            <Card className="glass-card" title="Chemotherapy, Surgery & Surveillance Milestones">
              <Table 
                dataSource={milestonesList} 
                columns={milestoneColumns} 
                rowKey="id" 
                pagination={false} 
              />
            </Card>
          )
        },
        {
          key: 'journey',
          label: 'Longitudinal Journey',
          children: (
            <Card className="glass-card" title="Longitudinal Patient Journey & Milestones">
              <JourneyTimeline events={Array.isArray(timeline) ? timeline : ((timeline as any)?.events || [])} loading={isTimelineLoading} />
            </Card>
          )
        },
        {
          key: 'investigations',
          label: 'Diagnostic Investigations',
          children: (
            <Table 
              dataSource={Array.isArray(investigations) ? investigations : ((investigations as any)?.data || [])} 
              columns={invColumns} 
              rowKey="id" 
              loading={isInvLoading} 
            />
          )
        },
        {
          key: 'documents',
          label: 'Clinical Documents',
          children: (
            <Table 
              dataSource={documents || []} 
              columns={docColumns} 
              rowKey="id" 
              loading={isDocLoading} 
            />
          )
        }
      ]} />

      {/* Screen Barrier Modal */}
      <BarrierAssessmentModal
        open={barrierModalOpen}
        onClose={() => setBarrierModalOpen(false)}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ['patientBarriers', patientId] });
        }}
        patientId={patientId}
        patientName={patient ? `${patient.firstName} ${patient.lastName}` : undefined}
      />

      {/* Resolve Barrier Modal */}
      <Modal
        title="Resolve Navigation Barrier"
        open={resolveModalOpen}
        onCancel={() => {
          setResolveModalOpen(false);
          setSelectedBarrier(null);
        }}
        onOk={() => resolveForm.submit()}
        confirmLoading={resolveBarrierMutation.isPending}
        okText="Mark as Resolved"
      >
        <div style={{ marginBottom: 16 }}>
          <Text strong>Barrier: </Text>
          <Text>{selectedBarrier?.category} - {selectedBarrier?.barrierDetail}</Text>
        </div>
        <Form form={resolveForm} layout="vertical" onFinish={handleResolveSubmit}>
          <Form.Item name="notes" label="Resolution Notes / Outcome" rules={[{ required: true, message: 'Please provide resolution notes' }]}>
            <TextArea rows={3} placeholder="e.g. Patient received transit concession voucher and confirmed arrival for Monday chemo." />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
