'use client';

import React, { useState } from 'react';
import { 
  Typography, 
  Select, 
  Card, 
  Descriptions, 
  Row, 
  Col, 
  Statistic, 
  Button, 
  Space, 
  Table, 
  Modal, 
  Form, 
  Input, 
  DatePicker, 
  Popconfirm, 
  message, 
  Tag, 
  Timeline,
  Empty
} from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  CheckCircleOutlined, 
  ClockCircleOutlined, 
  MedicineBoxOutlined,
  CalendarOutlined,
  ExclamationCircleOutlined 
} from '@ant-design/icons';
import dayjs from 'dayjs';
import StatusBadge from '@/components/ui/StatusBadge';
import { usePatients, usePatient } from '@/hooks/use-patients';

const { Title, Text } = Typography;
const { Option } = Select;

interface MilestoneItem {
  id: string;
  type: string;
  expectedDate: string;
  actualDate?: string;
  status: string;
  notes?: string;
}

interface JourneyEventItem {
  id: string;
  date: string;
  title: string;
  status: string;
  description: string;
}

export default function JourneyPage() {
  const [patientId, setPatientId] = useState<string | undefined>(undefined);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedMilestone, setSelectedMilestone] = useState<MilestoneItem | null>(null);

  const { data: patientData } = usePatients();
  const patientList = React.useMemo(() => {
    return Array.isArray(patientData?.data) ? patientData.data : (Array.isArray(patientData) ? patientData : []);
  }, [patientData]);

  // Auto-select first patient if none selected
  React.useEffect(() => {
    if (!patientId && patientList.length > 0) {
      setPatientId(patientList[0].id);
    }
  }, [patientList, patientId]);

  const { data: patient } = usePatient(patientId || '');

  const [form] = Form.useForm();
  const [editForm] = Form.useForm();

  const [milestones, setMilestones] = useState<MilestoneItem[]>([]);
  const [events, setEvents] = useState<JourneyEventItem[]>([]);

  // Sync live milestones from patient care journeys
  React.useEffect(() => {
    if (patient?.careJourneys && Array.isArray(patient.careJourneys)) {
      const allM: MilestoneItem[] = [];
      patient.careJourneys.forEach((j: any) => {
        if (j.milestones && Array.isArray(j.milestones)) {
          allM.push(...j.milestones.map((m: any) => ({
            id: m.id,
            type: m.title || m.type || 'Milestone',
            expectedDate: m.targetDate || m.expectedDate || m.createdAt,
            actualDate: m.completedDate || m.actualDate,
            status: m.status || 'PENDING',
            notes: m.notes || m.description || ''
          })));
        }
      });
      setMilestones(allM);
    } else {
      setMilestones([]);
    }
  }, [patient]);

  // CRUD: Create Milestone
  const handleCreateMilestone = (values: any) => {
    const newM: MilestoneItem = {
      id: `m_${Date.now()}`,
      type: values.type,
      expectedDate: values.expectedDate ? values.expectedDate.format('YYYY-MM-DD') : dayjs().format('YYYY-MM-DD'),
      status: values.status || 'PENDING',
      notes: values.notes || 'Clinical protocol milestone',
    };
    setMilestones([...milestones, newM]);
    message.success(`Milestone "${values.type}" created successfully`);
    setCreateModalOpen(false);
    form.resetFields();
  };

  // CRUD: Update Milestone
  const handleUpdateMilestone = (values: any) => {
    if (!selectedMilestone) return;
    setMilestones(milestones.map(m => m.id === selectedMilestone.id ? {
      ...m,
      type: values.type,
      expectedDate: values.expectedDate ? values.expectedDate.format('YYYY-MM-DD') : m.expectedDate,
      actualDate: values.actualDate ? values.actualDate.format('YYYY-MM-DD') : m.actualDate,
      status: values.status,
      notes: values.notes
    } : m));
    message.success(`Milestone "${values.type}" updated successfully`);
    setEditModalOpen(false);
    setSelectedMilestone(null);
  };

  // CRUD: Delete Milestone
  const handleDeleteMilestone = (id: string, type: string) => {
    setMilestones(milestones.filter(m => m.id !== id));
    message.success(`Milestone "${type}" deleted successfully`);
  };

  const openEditModal = (record: MilestoneItem) => {
    setSelectedMilestone(record);
    editForm.setFieldsValue({
      type: record.type,
      expectedDate: record.expectedDate ? dayjs(record.expectedDate) : null,
      actualDate: record.actualDate ? dayjs(record.actualDate) : null,
      status: record.status,
      notes: record.notes
    });
    setEditModalOpen(true);
  };

  const getStatusTag = (status: string) => {
    switch (status) {
      case 'COMPLETED': return <Tag color="green" icon={<CheckCircleOutlined />}>COMPLETED</Tag>;
      case 'DELAYED': return <Tag color="red" icon={<ExclamationCircleOutlined />}>DELAYED / ON HOLD</Tag>;
      case 'IN_PROGRESS': return <Tag color="blue" icon={<ClockCircleOutlined />}>IN PROGRESS</Tag>;
      case 'PENDING': return <Tag color="default">PENDING</Tag>;
      default: return <Tag>{status}</Tag>;
    }
  };

  const columns = [
    { 
      title: 'Milestone / Intervention', 
      dataIndex: 'type', 
      key: 'type',
      render: (t: string) => <span style={{ fontWeight: 600 }}>{t}</span>
    },
    { 
      title: 'Target Date', 
      dataIndex: 'expectedDate', 
      key: 'expectedDate',
      render: (d: string) => dayjs(d).format('DD MMM YYYY')
    },
    { 
      title: 'Actual Date', 
      dataIndex: 'actualDate', 
      key: 'actualDate',
      render: (d?: string) => d ? dayjs(d).format('DD MMM YYYY') : '-'
    },
    { 
      title: 'Status', 
      dataIndex: 'status', 
      key: 'status',
      render: (s: string) => getStatusTag(s)
    },
    { 
      title: 'Clinical Protocol Notes', 
      dataIndex: 'notes', 
      key: 'notes',
      render: (n: string) => <span style={{ fontSize: 13 }}>{n || '-'}</span>
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 140,
      render: (_: any, record: MilestoneItem) => (
        <Space size="small">
          <Button 
            size="small" 
            icon={<EditOutlined />} 
            onClick={() => openEditModal(record)}
          >
            Edit
          </Button>
          <Popconfirm
            title="Delete Milestone"
            description="Are you sure you want to remove this milestone from the journey?"
            onConfirm={() => handleDeleteMilestone(record.id, record.type)}
            okText="Yes, Delete"
            cancelText="No"
            okButtonProps={{ danger: true }}
          >
            <Button size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      )
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <Title level={3} style={{ margin: 0 }}>Oncology Treatment Journey</Title>
          <Text type="secondary">Multidisciplinary longitudinal milestone orchestration & protocol adherence</Text>
        </div>
        <Space>
          <Select 
            value={patientId} 
            onChange={setPatientId} 
            placeholder={patientList.length > 0 ? "Select Patient to View Journey" : "No registered patients"}
            style={{ width: 320 }}
            allowClear
          >
            {patientList.map((p: any) => (
              <Option key={p.id} value={p.id}>
                {p.name || `${p.firstName || ''} ${p.lastName || ''}`.trim() || 'Patient'} ({p.mrn})
              </Option>
            ))}
          </Select>
          <Button 
            type="primary" 
            icon={<PlusOutlined />} 
            onClick={() => setCreateModalOpen(true)}
            style={{ background: '#0284c7', borderColor: '#0284c7' }}
          >
            Add Milestone
          </Button>
        </Space>
      </div>

      {patientId ? (
        <>
          {/* Milestones Table */}
          <Card 
            title={
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Clinical Milestones & Protocol Checkpoints ({milestones.length})</span>
                <Button size="small" type="dashed" icon={<PlusOutlined />} onClick={() => setCreateModalOpen(true)}>
                  New Checkpoint
                </Button>
              </div>
            }
          >
            <Table 
              columns={columns} 
              dataSource={milestones} 
              rowKey="id" 
              pagination={false}
              locale={{ emptyText: <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No care protocol milestones configured for this patient" /> }}
            />
          </Card>

          {/* Longitudinal Journey Timeline */}
          <Card title="Longitudinal Care Stream">
            {milestones.length > 0 ? (
              <Timeline
                mode="left"
                items={milestones.map(m => ({
                  color: m.status === 'COMPLETED' ? 'green' : m.status === 'DELAYED' ? 'red' : 'blue',
                  label: dayjs(m.actualDate || m.expectedDate).format('DD MMM YYYY'),
                  children: (
                    <div>
                      <div style={{ fontWeight: 600 }}>{m.type}</div>
                      <div style={{ fontSize: 12, color: '#64748b' }}>{m.notes}</div>
                      <div style={{ marginTop: 4 }}>{getStatusTag(m.status)}</div>
                    </div>
                  )
                }))}
              />
            ) : (
              <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No journey timeline events on record" />
            )}
          </Card>
        </>
      ) : (
        <Card style={{ textAlign: 'center', padding: '48px 24px' }}>
          <Empty 
            image={Empty.PRESENTED_IMAGE_SIMPLE} 
            description={
              <div>
                <Text strong style={{ fontSize: 16 }}>No Patient Selected</Text>
                <div style={{ color: '#64748b', marginTop: 4 }}>
                  Select a patient from the dropdown above to view, orchestrate, and audit their multidisciplinary oncology care journey.
                </div>
              </div>
            }
          />
        </Card>
      )}

      {/* CRUD: Add Milestone Modal */}
      <Modal
        title="Add Care Protocol Milestone"
        open={createModalOpen}
        onCancel={() => setCreateModalOpen(false)}
        footer={null}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleCreateMilestone} initialValues={{ status: 'PENDING' }}>
          <Form.Item name="type" label="Milestone Title / Protocol Step" rules={[{ required: true, message: 'Please enter title' }]}>
            <Input placeholder="e.g. Paclitaxel Weekly Infusion Cycle 1 / Radiation Simulation" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="expectedDate" label="Target Date" rules={[{ required: true, message: 'Please select date' }]}>
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="status" label="Initial Status">
                <Select>
                  <Option value="PENDING">Pending</Option>
                  <Option value="IN_PROGRESS">In Progress</Option>
                  <Option value="COMPLETED">Completed</Option>
                  <Option value="DELAYED">Delayed / On Hold</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="notes" label="Clinical Notes / Pre-conditions">
            <Input.TextArea rows={3} placeholder="e.g. Requires echocardiogram (EF > 50%) and normal CBC before clearance" />
          </Form.Item>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <Button onClick={() => setCreateModalOpen(false)}>Cancel</Button>
            <Button type="primary" htmlType="submit" style={{ background: '#0284c7', borderColor: '#0284c7' }}>
              Add Milestone
            </Button>
          </div>
        </Form>
      </Modal>

      {/* CRUD: Edit Milestone Modal */}
      <Modal
        title="Edit Milestone"
        open={editModalOpen}
        onCancel={() => { setEditModalOpen(false); setSelectedMilestone(null); }}
        footer={null}
        destroyOnClose
      >
        <Form form={editForm} layout="vertical" onFinish={handleUpdateMilestone}>
          <Form.Item name="type" label="Milestone Title" rules={[{ required: true }]}>
            <Input />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="expectedDate" label="Target Date" rules={[{ required: true }]}>
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="actualDate" label="Actual Completion Date">
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="status" label="Status" rules={[{ required: true }]}>
            <Select>
              <Option value="PENDING">Pending</Option>
              <Option value="IN_PROGRESS">In Progress</Option>
              <Option value="COMPLETED">Completed</Option>
              <Option value="DELAYED">Delayed / On Hold</Option>
            </Select>
          </Form.Item>

          <Form.Item name="notes" label="Clinical Notes">
            <Input.TextArea rows={3} />
          </Form.Item>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <Button onClick={() => { setEditModalOpen(false); setSelectedMilestone(null); }}>Cancel</Button>
            <Button type="primary" htmlType="submit" style={{ background: '#0284c7', borderColor: '#0284c7' }}>
              Save Changes
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
}
