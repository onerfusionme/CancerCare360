'use client';

import React, { useState } from 'react';
import { 
  Tabs, 
  Table, 
  Tag, 
  Button, 
  Switch, 
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
  Tooltip 
} from 'antd';
import { 
  PlusOutlined, 
  CheckCircleOutlined, 
  DeleteOutlined, 
  PhoneOutlined, 
  AlertOutlined,
  ReloadOutlined,
  RobotOutlined,
  SettingOutlined
} from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import { useTasks, useTaskStats, useCreateTask, useUpdateTask, useDeleteTask } from '@/hooks/use-follow-up';
import { useDetectGaps, useGenerateTasks } from '@/hooks/use-care-gaps';
import { outreachService } from '@/services/outreach.service';
import { useQuery } from '@tanstack/react-query';
import TaskStatsCards from '@/components/follow-up/TaskStatsCards';
import GapDetectionResults from '@/components/care-gap/GapDetectionResults';
import OutreachModal from '@/components/follow-up/OutreachModal';
import { GapExplanationModal } from '@/components/ai/GapExplanationModal';
import { CareGap } from '@/types/care-gap';
import { TaskStatus, TaskPriority } from '@/types/follow-up';

const { Option } = Select;
const { Title, Text } = Typography;

export default function CareGapsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('1');
  const [outreachModalOpen, setOutreachModalOpen] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string | undefined>();
  const [createGapModalOpen, setCreateGapModalOpen] = useState(false);
  
  const [explainGapModalOpen, setExplainGapModalOpen] = useState(false);
  const [selectedGap, setSelectedGap] = useState<CareGap | null>(null);

  const [createForm] = Form.useForm();

  // Queries & stats
  const { data: stats } = useTaskStats();
  const { data: tasks, isLoading: tasksLoading } = useTasks();
  const { data: gaps, refetch: detectGaps, isFetching: detectingGaps } = useDetectGaps();

  // Mutations
  const generateTasksMutation = useGenerateTasks();
  const createTaskMutation = useCreateTask();
  const updateTaskMutation = useUpdateTask();
  const deleteTaskMutation = useDeleteTask();

  const { data: outreachLogs, isLoading: outreachLoading } = useQuery({
    queryKey: ['outreachLogs', 'all'],
    queryFn: () => outreachService.getTaskOutreach('all'),
    enabled: activeTab === '3'
  });

  // CRUD: Create Gap
  const handleCreateGap = async (values: any) => {
    try {
      await createTaskMutation.mutateAsync({
        patientId: values.patientId,
        taskType: values.taskType,
        description: values.description,
        priority: values.priority,
        dueDate: values.dueDate ? values.dueDate.toISOString() : new Date().toISOString(),
      });
      message.success('Care gap alert created successfully');
      setCreateGapModalOpen(false);
      createForm.resetFields();
    } catch (e) {
      message.error('Failed to create care gap task');
    }
  };

  // CRUD: Update (Resolve)
  const handleResolve = async (id: string) => {
    try {
      await updateTaskMutation.mutateAsync({
        id,
        dto: { status: TaskStatus.RESOLVED }
      });
      message.success('Care gap marked as resolved');
    } catch (e) {
      message.error('Failed to resolve task');
    }
  };

  // CRUD: Delete (Dismiss)
  const handleDismiss = async (id: string) => {
    try {
      await deleteTaskMutation.mutateAsync(id);
      message.success('Care gap dismissed');
    } catch (e) {
      message.error('Failed to dismiss care gap');
    }
  };

  const handleGenerateTasks = async () => {
    await generateTasksMutation.mutateAsync();
  };

  const getPriorityColor = (p: string) => {
    switch(p) {
      case 'URGENT': return 'red';
      case 'HIGH': return 'orange';
      case 'NORMAL': return 'blue';
      case 'LOW': return 'default';
      default: return 'default';
    }
  };

  const taskColumns = [
    {
      title: 'Patient',
      key: 'patient',
      render: (_: any, record: any) => (
        <div>
          <div style={{ fontWeight: 600 }}>{record.patient?.name || 'Priya Sharma'}</div>
          <div style={{ fontSize: '11px', color: '#64748b' }}>MRN: {record.patient?.mrn || 'MRN-ONC-2026-001'}</div>
        </div>
      )
    },
    { 
      title: 'Task Type', 
      dataIndex: 'taskType', 
      key: 'taskType', 
      render: (t: string) => <Tag color="geekblue" style={{ fontWeight: 600 }}>{(t || 'CARE_GAP').replace('_', ' ')}</Tag> 
    },
    { 
      title: 'Description', 
      dataIndex: 'description', 
      key: 'desc',
      render: (d: string) => <span style={{ fontSize: 13 }}>{d}</span> 
    },
    { 
      title: 'Priority', 
      dataIndex: 'priority', 
      key: 'priority', 
      render: (p: string) => <Tag color={getPriorityColor(p)} style={{ fontWeight: 700 }}>{p}</Tag> 
    },
    { 
      title: 'Due Date', 
      dataIndex: 'dueDate', 
      key: 'dueDate', 
      render: (d: string) => d ? new Date(d).toLocaleDateString() : 'Overdue' 
    },
    { 
      title: 'Status', 
      dataIndex: 'status', 
      key: 'status',
      render: (s: string) => (
        <Tag color={s === 'RESOLVED' ? 'green' : s === 'IN_PROGRESS' ? 'orange' : 'red'}>
          {s || 'OPEN'}
        </Tag>
      )
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 220,
      render: (_: any, record: any) => (
        <Space size="small">
          <Button 
            size="small" 
            icon={<PhoneOutlined />}
            onClick={() => { setSelectedTaskId(record.id); setOutreachModalOpen(true); }}
          >
            Log Contact
          </Button>
          {record.status !== 'RESOLVED' && (
            <Button 
              size="small" 
              type="primary" 
              icon={<CheckCircleOutlined />}
              onClick={() => handleResolve(record.id)}
            >
              Resolve
            </Button>
          )}
          <Popconfirm
            title="Dismiss Care Gap"
            description="Are you sure you want to dismiss this care gap task?"
            onConfirm={() => handleDismiss(record.id)}
            okText="Yes, Dismiss"
            cancelText="No"
            okButtonProps={{ danger: true }}
          >
            <Button size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      )
    }
  ];

  const outreachColumns = [
    { title: 'Patient', key: 'patient', render: (_: any, record: any) => record.patient?.name || 'Priya Sharma' },
    { title: 'Channel', dataIndex: 'channel', key: 'channel', render: (c: string) => <Tag color="blue">{c || 'WhatsApp'}</Tag> },
    { title: 'Outcome', dataIndex: 'outcome', key: 'outcome', render: (o: string) => o || 'Patient Confirmed Visit' },
    { title: 'Date', dataIndex: 'contactedAt', key: 'date', render: (d: string) => d ? new Date(d).toLocaleString() : 'Today' },
    { title: 'Notes', dataIndex: 'notes', key: 'notes', render: (n: string) => n || 'Follow-up lab repeat confirmed with family caregiver.' },
    { title: 'Next Action', dataIndex: 'nextAction', key: 'nextAction', render: (na: string) => na || 'Schedule ANC CBC Test' }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <Title level={3} style={{ margin: 0 }}>Care Gaps & Follow-up Desk</Title>
          <Text type="secondary">Automated detection, SLA escalation & multi-channel patient outreach</Text>
        </div>
        <Space>
          <Button 
            icon={<SettingOutlined />} 
            onClick={() => router.push('/gaps/rules')}
          >
            Configure Protocol Rules
          </Button>
          <Button 
            type="primary" 
            icon={<PlusOutlined />} 
            onClick={() => setCreateGapModalOpen(true)}
            style={{ background: '#0284c7', borderColor: '#0284c7' }}
          >
            Create Gap Alert
          </Button>
        </Space>
      </div>
      
      {stats && <TaskStatsCards stats={stats} />}

      <Card>
        <Tabs activeKey={activeTab} onChange={setActiveTab} items={[
          {
            key: '1',
            label: `Open Care Gap Tasks (${tasks?.length || 0})`,
            children: (
              <div>
                <Table 
                  columns={taskColumns} 
                  dataSource={tasks || []} 
                  rowKey="id" 
                  loading={tasksLoading}
                  pagination={{ pageSize: 8 }}
                />
              </div>
            )
          },
          {
            key: '2',
            label: `AI Gap Detection Engine (${gaps?.length || 0})`,
            children: (
              <div>
                <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text type="secondary">Real-time scan across appointments, lab TAT, and treatment protocols</Text>
                  <Space>
                    <Button 
                      icon={<ReloadOutlined />} 
                      onClick={() => detectGaps()} 
                      loading={detectingGaps}
                    >
                      Rescan Registry
                    </Button>
                    <Button 
                      type="primary" 
                      onClick={handleGenerateTasks}
                      loading={generateTasksMutation.isPending}
                    >
                      Generate Follow-Up Tasks ({gaps?.length || 0})
                    </Button>
                  </Space>
                </div>
                <GapDetectionResults 
                  gaps={gaps || []} 
                  loading={detectingGaps} 
                  onGenerateTasks={handleGenerateTasks}
                  onExplainGap={(gap) => {
                    setSelectedGap(gap);
                    setExplainGapModalOpen(true);
                  }}
                />
              </div>
            )
          },
          {
            key: '3',
            label: `Patient Outreach Log (${outreachLogs?.length || 0})`,
            children: (
              <Table 
                columns={outreachColumns} 
                dataSource={outreachLogs || []} 
                rowKey="id" 
                loading={outreachLoading}
                pagination={{ pageSize: 8 }}
              />
            )
          }
        ]} />
      </Card>

      {/* CRUD: Create Care Gap Modal */}
      <Modal
        title="Create New Care Gap Task"
        open={createGapModalOpen}
        onCancel={() => setCreateGapModalOpen(false)}
        footer={null}
        destroyOnClose
      >
        <Form form={createForm} layout="vertical" onFinish={handleCreateGap} initialValues={{ priority: 'HIGH', taskType: 'MISSED_APPOINTMENT' }}>
          <Form.Item name="patientId" label="Patient" rules={[{ required: true, message: 'Please select patient' }]}>
            <Select placeholder="Select Patient">
              <Option value="pat1">Priya Sharma (MRN-ONC-2026-001)</Option>
              <Option value="pat2">Rajesh Patel (MRN-ONC-2026-002)</Option>
              <Option value="pat3">Anita Desai (MRN-ONC-2026-003)</Option>
            </Select>
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="taskType" label="Gap Category" rules={[{ required: true }]}>
                <Select>
                  <Option value="MISSED_APPOINTMENT">Missed Appointment</Option>
                  <Option value="DELAYED_INVESTIGATION">Delayed Lab / Pathology</Option>
                  <Option value="TREATMENT_LAPSE">Chemo Cycle Lapsed</Option>
                  <Option value="POST_OP_SURVEILLANCE">Post-Op Follow-up</Option>
                  <Option value="HIGH_RISK_DROPOUT">High Drop-off Risk (AI)</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="priority" label="Priority" rules={[{ required: true }]}>
                <Select>
                  <Option value="URGENT">Urgent (SLA 24h)</Option>
                  <Option value="HIGH">High (SLA 48h)</Option>
                  <Option value="NORMAL">Normal</Option>
                  <Option value="LOW">Low</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="dueDate" label="Target Due Date" rules={[{ required: true, message: 'Please select due date' }]}>
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item name="description" label="Action Description & Rationale" rules={[{ required: true, message: 'Please provide description' }]}>
            <Input.TextArea rows={3} placeholder="e.g. Call patient to reschedule Cycle 4 AC chemo following resolution of neutropenia" />
          </Form.Item>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <Button onClick={() => setCreateGapModalOpen(false)}>Cancel</Button>
            <Button type="primary" htmlType="submit" loading={createTaskMutation.isPending} style={{ background: '#0284c7', borderColor: '#0284c7' }}>
              Create Care Gap Task
            </Button>
          </div>
        </Form>
      </Modal>

      {/* Outreach Action Modal */}
      {selectedTaskId && (
        <OutreachModal
          taskId={selectedTaskId}
          open={outreachModalOpen}
          onClose={() => setOutreachModalOpen(false)}
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
