'use client';

import React, { useState } from 'react';
import { 
  Tabs, 
  Table, 
  Tag, 
  Button, 
  Select, 
  Space, 
  Card, 
  Typography, 
  Modal, 
  Form, 
  Input, 
  DatePicker, 
  Popconfirm, 
  message, 
  Row, 
  Col, 
  Tooltip,
  Radio,
  Badge,
  Statistic
} from 'antd';
import { 
  PlusOutlined, 
  CheckCircleOutlined, 
  DeleteOutlined, 
  PhoneOutlined, 
  AlertOutlined,
  ReloadOutlined,
  RobotOutlined,
  SettingOutlined,
  SwapOutlined,
  CalendarOutlined,
  AppstoreOutlined,
  UnorderedListOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  UserOutlined
} from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';

import { navigationService } from '@/services/navigation.service';
import { followUpService } from '@/services/follow-up.service';
import { usePatients } from '@/hooks/use-patients';
import { CommandCenterTask, CommandCenterMetrics, PatientBarrier } from '@/types/navigation';
import BarrierAssessmentModal from '@/components/navigation/BarrierAssessmentModal';
import AppointmentRecoveryModal from '@/components/navigation/AppointmentRecoveryModal';
import TaskHandoffModal from '@/components/navigation/TaskHandoffModal';
import PatientStatusBoard from '@/components/navigation/PatientStatusBoard';
import OutreachModal from '@/components/follow-up/OutreachModal';
import GapDetectionResults from '@/components/care-gap/GapDetectionResults';
import { GapExplanationModal } from '@/components/ai/GapExplanationModal';

const { Option } = Select;
const { Title, Text, Paragraph } = Typography;

export default function FollowUpCommandCenterPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  // Active view & modals state
  const [viewMode, setViewMode] = useState<'table' | 'board'>('table');
  const [activeTab, setActiveTab] = useState('1');

  const [barrierModalOpen, setBarrierModalOpen] = useState(false);
  const [recoveryModalOpen, setRecoveryModalOpen] = useState(false);
  const [handoffModalOpen, setHandoffModalOpen] = useState(false);
  const [outreachModalOpen, setOutreachModalOpen] = useState(false);
  const [createGapModalOpen, setCreateGapModalOpen] = useState(false);
  const [explainGapModalOpen, setExplainGapModalOpen] = useState(false);

  const [selectedTask, setSelectedTask] = useState<CommandCenterTask | null>(null);
  const [selectedGap, setSelectedGap] = useState<any | null>(null);

  const [createForm] = Form.useForm();

  // 1. Fetch Command Center Data (Metrics + Tasks)
  const { 
    data: commandCenterData, 
    isLoading: isCommandCenterLoading, 
    refetch: refetchCommandCenter 
  } = useQuery({
    queryKey: ['followUpCommandCenter'],
    queryFn: () => navigationService.getCommandCenter(),
    refetchInterval: 30000,
  });

  const metrics: CommandCenterMetrics = commandCenterData?.metrics || {
    totalRequiringAttention: 0,
    criticalCount: 0,
    overdueCount: 0,
    dueTodayCount: 0,
    missedApptsCount: 0,
    noFutureApptCount: 0,
    stalledOutreachCount: 0,
    escalatedCount: 0,
    recoveredCount: 0,
  };

  const tasks: CommandCenterTask[] = commandCenterData?.tasks || [];

  // 2. Fetch Detected Gaps via 9-scenario detection engine
  const { 
    data: detectedGaps, 
    isFetching: isDetectingGaps, 
    refetch: refetchDetectedGaps 
  } = useQuery({
    queryKey: ['detectedCareGaps'],
    queryFn: () => navigationService.detectGaps(),
    enabled: activeTab === '2',
  });

  const gapList = Array.isArray(detectedGaps) ? detectedGaps : [];

  // Patients for dropdowns
  const { data: patientData } = usePatients();
  const patientList = Array.isArray(patientData?.data) ? patientData.data : (Array.isArray(patientData) ? patientData : []);

  // Mutations
  const generateTasksMutation = useMutation({
    mutationFn: () => navigationService.generateTasksFromGaps(),
    onSuccess: (data) => {
      message.success(`Generated follow-up tasks successfully!`);
      queryClient.invalidateQueries({ queryKey: ['followUpCommandCenter'] });
      queryClient.invalidateQueries({ queryKey: ['detectedCareGaps'] });
      setActiveTab('1');
    },
    onError: () => {
      message.error('Failed to generate tasks from care gaps');
    },
  });

  const resolveTaskMutation = useMutation({
    mutationFn: (id: string) => followUpService.updateTask(id, { status: 'RESOLVED' as any }),
    onSuccess: () => {
      message.success('Task marked as resolved');
      queryClient.invalidateQueries({ queryKey: ['followUpCommandCenter'] });
    },
  });

  const dismissTaskMutation = useMutation({
    mutationFn: (id: string) => followUpService.deleteTask(id),
    onSuccess: () => {
      message.success('Task dismissed');
      queryClient.invalidateQueries({ queryKey: ['followUpCommandCenter'] });
    },
  });

  // Action helpers
  const handleOpenBarrier = (task: CommandCenterTask) => {
    setSelectedTask(task);
    setBarrierModalOpen(true);
  };

  const handleOpenRecovery = (task: CommandCenterTask) => {
    setSelectedTask(task);
    setRecoveryModalOpen(true);
  };

  const handleOpenHandoff = (task: CommandCenterTask) => {
    setSelectedTask(task);
    setHandoffModalOpen(true);
  };

  const handleOpenOutreach = (task: CommandCenterTask) => {
    setSelectedTask(task);
    setOutreachModalOpen(true);
  };

  const getPriorityBadgeColor = (score: number) => {
    if (score >= 80) return '#ef4444';
    if (score >= 60) return '#f97316';
    if (score >= 40) return '#eab308';
    return '#3b82f6';
  };

  const getFollowUpStageTag = (stage?: string) => {
    switch (stage) {
      case 'AT_RISK_LTFU':
        return <Tag color="error">AT RISK LTFU</Tag>;
      case 'RE_ENGAGED':
        return <Tag color="success">RE-ENGAGED</Tag>;
      case 'SURVEILLANCE':
        return <Tag color="cyan">SURVEILLANCE</Tag>;
      case 'REQUIRING_INVESTIGATION':
        return <Tag color="warning">REQ. INVESTIGATION</Tag>;
      case 'REQUIRING_REVIEW':
        return <Tag color="gold">REQ. REVIEW</Tag>;
      case 'UNDER_TREATMENT':
        return <Tag color="processing">UNDER TREATMENT</Tag>;
      case 'LOST_TO_FOLLOW_UP':
        return <Tag color="default">LOST TO FOLLOW-UP</Tag>;
      default:
        return <Tag color="blue">{stage || 'ACTIVE'}</Tag>;
    }
  };

  const taskColumns = [
    {
      title: 'Priority & Score',
      key: 'priorityScore',
      width: 130,
      sorter: (a: CommandCenterTask, b: CommandCenterTask) => b.priorityScore - a.priorityScore,
      render: (_: any, record: CommandCenterTask) => (
        <Tooltip title={record.priorityReason || 'Multi-factor priority score (0-100)'}>
          <div style={{ cursor: 'help' }}>
            <Tag 
              color={getPriorityBadgeColor(record.priorityScore)} 
              style={{ fontWeight: 800, fontSize: 12, padding: '2px 8px' }}
            >
              {record.priorityScore}/100
            </Tag>
            <div style={{ fontSize: 10, color: '#64748b', marginTop: 2, textTransform: 'uppercase', fontWeight: 600 }}>
              {record.priority}
            </div>
          </div>
        </Tooltip>
      ),
    },
    {
      title: 'Patient (Who?)',
      key: 'patient',
      width: 220,
      render: (_: any, record: CommandCenterTask) => (
        <div>
          <a
            onClick={() => router.push(`/patients/${record.patient?.id}`)}
            style={{ fontWeight: 700, color: '#0284c7', fontSize: 14 }}
          >
            {record.patient?.firstName} {record.patient?.lastName}
          </a>
          <div style={{ fontSize: 11, color: '#64748b' }}>
            MRN: <Text code style={{ fontSize: 11 }}>{record.patient?.mrn || '—'}</Text>
          </div>
          <div style={{ display: 'flex', gap: 4, marginTop: 4, flexWrap: 'wrap' }}>
            {getFollowUpStageTag(record.patient?.followUpStage)}
            {record.patient?.cancerType && (
              <Tag color="geekblue" style={{ fontSize: 10 }}>
                {record.patient.cancerType}
              </Tag>
            )}
          </div>
        </div>
      ),
    },
    {
      title: 'Care Gap & Reason (Why?)',
      key: 'gapReason',
      render: (_: any, record: CommandCenterTask) => (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Tag color="volcano" style={{ fontWeight: 600 }}>
              {(record.careGapType || record.taskType || 'CARE_GAP').replace(/_/g, ' ')}
            </Tag>
            {record.escalationLevel > 0 && (
              <Tag color="magenta">Escalation L{record.escalationLevel}</Tag>
            )}
          </div>
          <div style={{ fontSize: 12, color: '#334155', marginTop: 4 }}>
            {record.issueDescription}
          </div>
          {record.priorityReason && (
            <div style={{ fontSize: 11, color: '#64748b', marginTop: 2, fontStyle: 'italic' }}>
              &bull; {record.priorityReason}
            </div>
          )}
        </div>
      ),
    },
    {
      title: 'Overdue / Due',
      key: 'due',
      width: 130,
      sorter: (a: CommandCenterTask, b: CommandCenterTask) => 
        new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime(),
      render: (_: any, record: CommandCenterTask) => {
        const days = dayjs().diff(dayjs(record.dueDate), 'day');
        return (
          <div>
            <div style={{ fontSize: 12, fontWeight: 600 }}>
              {dayjs(record.dueDate).format('DD MMM YYYY')}
            </div>
            {days > 0 ? (
              <Tag color="red" style={{ fontSize: 10, marginTop: 2 }}>
                <ClockCircleOutlined style={{ marginRight: 3 }} />
                {days}d Overdue
              </Tag>
            ) : days === 0 ? (
              <Tag color="gold" style={{ fontSize: 10, marginTop: 2 }}>Due Today</Tag>
            ) : (
              <Tag color="blue" style={{ fontSize: 10, marginTop: 2 }}>In {Math.abs(days)}d</Tag>
            )}
          </div>
        );
      },
    },
    {
      title: 'Active Barriers',
      key: 'barriers',
      width: 170,
      render: (_: any, record: CommandCenterTask) => {
        const activeBarriers = record.barriers?.filter((b) => b.status !== 'RESOLVED') || [];
        if (activeBarriers.length === 0) {
          return <span style={{ color: '#94a3b8', fontSize: 11 }}>No active barrier</span>;
        }
        return (
          <Space direction="vertical" size={2}>
            {activeBarriers.map((b) => (
              <Tooltip key={b.id} title={b.barrierDetail}>
                <Tag 
                  color={b.isHospitalSide ? 'purple' : 'orange'} 
                  style={{ fontSize: 11, cursor: 'help' }}
                >
                  <AlertOutlined style={{ marginRight: 4 }} />
                  {b.category}
                </Tag>
              </Tooltip>
            ))}
          </Space>
        );
      },
    },
    {
      title: 'Owner & Next Action',
      key: 'ownership',
      width: 200,
      render: (_: any, record: CommandCenterTask) => (
        <div>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#1e293b' }}>
            <UserOutlined style={{ marginRight: 4 }} />
            {record.assignedTo 
              ? `${record.assignedTo.firstName} ${record.assignedTo.lastName}` 
              : 'Care Coordinator'}
          </div>
          {record.handoffs && record.handoffs.length > 0 && (
            <Tag color="purple" style={{ fontSize: 10, marginTop: 2 }}>
              <SwapOutlined style={{ marginRight: 3 }} />
              {record.handoffs.length} Handoff(s)
            </Tag>
          )}
          {record.nextAction && (
            <div style={{ fontSize: 11, color: '#4338ca', marginTop: 4, background: '#e0e7ff', padding: '2px 6px', borderRadius: 4 }}>
              &rarr; {record.nextAction}
            </div>
          )}
        </div>
      ),
    },
    {
      title: 'Closed-Loop Actions',
      key: 'actions',
      width: 240,
      render: (_: any, record: CommandCenterTask) => (
        <Space size={4} wrap>
          <Tooltip title="Log Patient Outreach (Phone / WhatsApp / Home Visit)">
            <Button
              size="small"
              icon={<PhoneOutlined />}
              onClick={() => handleOpenOutreach(record)}
            />
          </Tooltip>

          <Tooltip title="Screen / Log Patient or Hospital Barrier">
            <Button
              size="small"
              icon={<AlertOutlined />}
              style={{ color: '#d97706', borderColor: '#fde68a' }}
              onClick={() => handleOpenBarrier(record)}
            >
              Barrier
            </Button>
          </Tooltip>

          <Tooltip title="Transfer / Inter-role Clinical Handoff">
            <Button
              size="small"
              icon={<SwapOutlined />}
              onClick={() => handleOpenHandoff(record)}
            />
          </Tooltip>

          <Tooltip title="Book Confirmed Recovery Appointment & Re-engage">
            <Button
              size="small"
              type="primary"
              icon={<CalendarOutlined />}
              style={{ background: '#16a34a', borderColor: '#16a34a' }}
              onClick={() => handleOpenRecovery(record)}
            >
              Recover Slot
            </Button>
          </Tooltip>

          <Popconfirm
            title="Dismiss Care Gap Task"
            description="Are you sure you want to dismiss this care gap?"
            onConfirm={() => dismissTaskMutation.mutate(record.id)}
            okText="Dismiss"
            cancelText="Cancel"
            okButtonProps={{ danger: true }}
          >
            <Button size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <Title level={3} style={{ margin: 0 }}>Follow-Up Command Center</Title>
          <Text type="secondary">
            Patients Requiring Attention &bull; Transparent Multi-Factor Prioritization &bull; Closed-Loop Recovery
          </Text>
        </div>
        <Space wrap>
          <Radio.Group 
            value={viewMode} 
            onChange={(e) => setViewMode(e.target.value)} 
            buttonStyle="solid"
          >
            <Radio.Button value="table">
              <UnorderedListOutlined style={{ marginRight: 4 }} />
              Priority Work Queue
            </Radio.Button>
            <Radio.Button value="board">
              <AppstoreOutlined style={{ marginRight: 4 }} />
              Continuity Kanban
            </Radio.Button>
          </Radio.Group>

          <Button 
            icon={<AlertOutlined />}
            onClick={() => {
              setSelectedTask(null);
              setBarrierModalOpen(true);
            }}
          >
            + Screen Barrier
          </Button>

          <Button 
            icon={<SettingOutlined />} 
            onClick={() => router.push('/gaps/rules')}
          >
            Protocol Rules
          </Button>

          <Button 
            type="primary" 
            icon={<ReloadOutlined />} 
            onClick={() => refetchCommandCenter()}
            loading={isCommandCenterLoading}
            style={{ background: '#0284c7', borderColor: '#0284c7' }}
          >
            Refresh Queue
          </Button>
        </Space>
      </div>

      {/* 8 KPI Cards Strip */}
      <Row gutter={[12, 12]}>
        <Col xs={12} sm={6} md={3}>
          <Card size="small" style={{ borderColor: '#ef4444', background: '#fef2f2' }}>
            <Statistic 
              title={<span style={{ fontSize: 11, color: '#991b1b', fontWeight: 600 }}>ATTENTION REQ.</span>}
              value={metrics.totalRequiringAttention}
              valueStyle={{ color: '#ef4444', fontWeight: 800 }}
            />
          </Card>
        </Col>

        <Col xs={12} sm={6} md={3}>
          <Card size="small" style={{ borderColor: '#f97316', background: '#fff7ed' }}>
            <Statistic 
              title={<span style={{ fontSize: 11, color: '#9a3412', fontWeight: 600 }}>CRITICAL / URGENT</span>}
              value={metrics.criticalCount}
              valueStyle={{ color: '#ea580c', fontWeight: 800 }}
            />
          </Card>
        </Col>

        <Col xs={12} sm={6} md={3}>
          <Card size="small" style={{ borderColor: '#eab308', background: '#fefce8' }}>
            <Statistic 
              title={<span style={{ fontSize: 11, color: '#854d0e', fontWeight: 600 }}>OVERDUE DAYS</span>}
              value={metrics.overdueCount}
              valueStyle={{ color: '#ca8a04', fontWeight: 800 }}
            />
          </Card>
        </Col>

        <Col xs={12} sm={6} md={3}>
          <Card size="small" style={{ borderColor: '#3b82f6', background: '#eff6ff' }}>
            <Statistic 
              title={<span style={{ fontSize: 11, color: '#1e40af', fontWeight: 600 }}>DUE TODAY</span>}
              value={metrics.dueTodayCount}
              valueStyle={{ color: '#2563eb', fontWeight: 800 }}
            />
          </Card>
        </Col>

        <Col xs={12} sm={6} md={3}>
          <Card size="small">
            <Statistic 
              title={<span style={{ fontSize: 11, color: '#475569', fontWeight: 600 }}>MISSED APPT</span>}
              value={metrics.missedApptsCount}
              valueStyle={{ color: '#334155', fontWeight: 700 }}
            />
          </Card>
        </Col>

        <Col xs={12} sm={6} md={3}>
          <Card size="small">
            <Statistic 
              title={<span style={{ fontSize: 11, color: '#475569', fontWeight: 600 }}>NO FUTURE APPT</span>}
              value={metrics.noFutureApptCount}
              valueStyle={{ color: '#475569', fontWeight: 700 }}
            />
          </Card>
        </Col>

        <Col xs={12} sm={6} md={3}>
          <Card size="small">
            <Statistic 
              title={<span style={{ fontSize: 11, color: '#6b21a8', fontWeight: 600 }}>ESCALATED / HANDOFF</span>}
              value={metrics.escalatedCount}
              valueStyle={{ color: '#7e22ce', fontWeight: 700 }}
            />
          </Card>
        </Col>

        <Col xs={12} sm={6} md={3}>
          <Card size="small" style={{ borderColor: '#22c55e', background: '#f0fdf4' }}>
            <Statistic 
              title={<span style={{ fontSize: 11, color: '#166534', fontWeight: 600 }}>RECOVERED & ACTIVE</span>}
              value={metrics.recoveredCount}
              valueStyle={{ color: '#16a34a', fontWeight: 800 }}
            />
          </Card>
        </Col>
      </Row>

      {/* Main Tabs */}
      <Card>
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={[
            {
              key: '1',
              label: (
                <span>
                  Patients Requiring Attention
                  <Badge count={tasks.length} style={{ marginLeft: 8, backgroundColor: '#0284c7' }} />
                </span>
              ),
              children: (
                <div>
                  {viewMode === 'table' ? (
                    <Table
                      columns={taskColumns}
                      dataSource={tasks}
                      rowKey="id"
                      loading={isCommandCenterLoading}
                      pagination={{ pageSize: 8 }}
                      scroll={{ x: 1200 }}
                    />
                  ) : (
                    <PatientStatusBoard
                      tasks={tasks}
                      onScreenBarrier={handleOpenBarrier}
                      onRecover={handleOpenRecovery}
                      onHandoff={handleOpenHandoff}
                      onOutreach={handleOpenOutreach}
                    />
                  )}
                </div>
              ),
            },
            {
              key: '2',
              label: (
                <span>
                  <RobotOutlined style={{ marginRight: 6 }} />
                  AI Care Gap Detection Engine ({gapList.length})
                </span>
              ),
              children: (
                <div>
                  <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                    <Text type="secondary">
                      Continuous 9-scenario scan across missed appointments, treatment intervals, delayed pathology TAT, and post-op surgical milestones
                    </Text>
                    <Space>
                      <Button
                        icon={<ReloadOutlined />}
                        onClick={() => refetchDetectedGaps()}
                        loading={isDetectingGaps}
                      >
                        Rescan Registry
                      </Button>
                      <Button
                        type="primary"
                        onClick={() => generateTasksMutation.mutate()}
                        loading={generateTasksMutation.isPending}
                        style={{ background: '#0284c7', borderColor: '#0284c7' }}
                      >
                        Auto-Generate Follow-Up Tasks ({gapList.length})
                      </Button>
                    </Space>
                  </div>

                  <GapDetectionResults
                    gaps={gapList}
                    loading={isDetectingGaps}
                    onGenerateTasks={() => generateTasksMutation.mutate()}
                    onExplainGap={(gap) => {
                      setSelectedGap(gap);
                      setExplainGapModalOpen(true);
                    }}
                  />
                </div>
              ),
            },
          ]}
        />
      </Card>

      {/* Barrier Screening Modal */}
      <BarrierAssessmentModal
        open={barrierModalOpen}
        onClose={() => {
          setBarrierModalOpen(false);
          setSelectedTask(null);
        }}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ['followUpCommandCenter'] });
        }}
        patientId={selectedTask?.patientId}
        patientName={selectedTask?.patient ? `${selectedTask.patient.firstName} ${selectedTask.patient.lastName}` : undefined}
        taskId={selectedTask?.id}
        patientList={patientList}
      />

      {/* Appointment Recovery Modal */}
      {selectedTask && (
        <AppointmentRecoveryModal
          open={recoveryModalOpen}
          onClose={() => {
            setRecoveryModalOpen(false);
            setSelectedTask(null);
          }}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ['followUpCommandCenter'] });
          }}
          taskId={selectedTask.id}
          patientName={`${selectedTask.patient?.firstName || ''} ${selectedTask.patient?.lastName || ''}`.trim()}
          patientMrn={selectedTask.patient?.mrn}
          careGapType={selectedTask.careGapType || selectedTask.taskType}
          barriers={selectedTask.barriers}
        />
      )}

      {/* Task Handoff Modal */}
      {selectedTask && (
        <TaskHandoffModal
          open={handoffModalOpen}
          onClose={() => {
            setHandoffModalOpen(false);
            setSelectedTask(null);
          }}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ['followUpCommandCenter'] });
          }}
          taskId={selectedTask.id}
          patientName={`${selectedTask.patient?.firstName || ''} ${selectedTask.patient?.lastName || ''}`.trim()}
          currentRole={selectedTask.assignedTo?.userRoles?.[0]?.role?.name || 'CARE_COORDINATOR'}
          handoffs={selectedTask.handoffs}
        />
      )}

      {/* Outreach Action Modal */}
      {selectedTask && (
        <OutreachModal
          taskId={selectedTask.id}
          patientId={selectedTask.patientId}
          open={outreachModalOpen}
          onClose={() => {
            setOutreachModalOpen(false);
            setSelectedTask(null);
          }}
        />
      )}

      {/* AI Gap Explanation Modal */}
      {selectedGap && (
        <GapExplanationModal
          open={explainGapModalOpen}
          gapType={selectedGap.gapType}
          gapData={selectedGap}
          onClose={() => {
            setExplainGapModalOpen(false);
            setSelectedGap(null);
          }}
        />
      )}
    </div>
  );
}
