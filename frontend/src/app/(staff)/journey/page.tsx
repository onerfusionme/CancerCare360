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
  Timeline 
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
  const [patientId, setPatientId] = useState<string>('p1');
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedMilestone, setSelectedMilestone] = useState<MilestoneItem | null>(null);

  const [form] = Form.useForm();
  const [editForm] = Form.useForm();

  // In-memory clinical milestones with CRUD capability
  const [milestones, setMilestones] = useState<MilestoneItem[]>([
    { id: 'm1', type: 'Baseline Staging PET-CT', expectedDate: '2026-06-10', actualDate: '2026-06-10', status: 'COMPLETED', notes: 'cT2 N1 M0 confirmed' },
    { id: 'm2', type: 'AC Neoadjuvant Cycle 1', expectedDate: '2026-06-25', actualDate: '2026-06-25', status: 'COMPLETED', notes: 'Doxorubicin + Cyclophosphamide tolerated' },
    { id: 'm3', type: 'AC Neoadjuvant Cycle 2', expectedDate: '2026-07-16', actualDate: '2026-07-17', status: 'COMPLETED', notes: 'Mild nausea Grade 1' },
    { id: 'm4', type: 'AC Neoadjuvant Cycle 3', expectedDate: '2026-08-06', actualDate: '2026-08-06', status: 'COMPLETED', notes: 'Partial clinical response noted' },
    { id: 'm5', type: 'AC Neoadjuvant Cycle 4', expectedDate: '2026-08-27', status: 'DELAYED', notes: 'Paused due to ANC 1,100 /uL (CTCAE Gr 2 Nadir)' },
    { id: 'm6', type: 'Post-Chemo Mid-Assessment MRI', expectedDate: '2026-09-15', status: 'PENDING', notes: 'Tumor bed marker localization' },
    { id: 'm7', type: 'Breast Conserving Surgery (BCS)', expectedDate: '2026-10-05', status: 'PENDING', notes: 'Dr. Sarah Jenkins team' },
  ]);

  const [events, setEvents] = useState<JourneyEventItem[]>([
    { id: 'e1', date: '2026-06-05', title: 'Multidisciplinary Tumor Board', status: 'COMPLETED', description: 'Recommended Neoadjuvant AC-T followed by BCS.' },
    { id: 'e2', date: '2026-06-25', title: 'Cycle 1 Infusion Administered', status: 'COMPLETED', description: 'Administered in Infusion Bay 3 without hypersensitivity.' },
    { id: 'e3', date: '2026-08-06', title: 'Cycle 3 Infusion & Biomarker Audit', status: 'COMPLETED', description: 'Significant reduction in primary breast mass palpable diameter.' },
    { id: 'e4', date: '2026-08-27', title: 'Cycle 4 Chemo Hold Alert', status: 'ALERT', description: 'Nadir ANC dropped below 1,500 /uL cutoff. Repeat lab ordered.' },
  ]);

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
      render: (n: string) => <span style={{ fontSize: 13, color: '#475569' }}>{n || '-'}</span>
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
          <Select value={patientId} onChange={setPatientId} style={{ width: 300 }}>
            <Option value="p1">Priya Sharma (MRN-ONC-2026-001) - Breast Ca</Option>
            <Option value="p2">Rajesh Patel (MRN-ONC-2026-002) - Colon Ca</Option>
            <Option value="p3">Anita Desai (MRN-ONC-2026-003) - Cervical Ca</Option>
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

      {/* Patient Protocol Header */}
      <Card>
        <Row gutter={24} align="middle">
          <Col xs={24} md={16}>
            <Descriptions title="Priya Sharma, 44F — Invasive Ductal Carcinoma" column={{ xs: 1, sm: 2, md: 3 }}>
              <Descriptions.Item label="Staging">Stage IIB (cT2 N1 M0)</Descriptions.Item>
              <Descriptions.Item label="Biomarkers">ER+ (80%), PR+ (60%), HER2-</Descriptions.Item>
              <Descriptions.Item label="Intent">Curative Neoadjuvant</Descriptions.Item>
              <Descriptions.Item label="Regimen">AC-T (Dose-Dense)</Descriptions.Item>
              <Descriptions.Item label="Lead Oncologist">Dr. Jane Smith</Descriptions.Item>
              <Descriptions.Item label="ECOG Status">1 (Symptomatic, Ambulatory)</Descriptions.Item>
            </Descriptions>
          </Col>
          <Col xs={24} md={8} style={{ borderLeft: '1px solid #f1f5f9', paddingLeft: 24 }}>
            <Row gutter={16}>
              <Col span={12}>
                <Statistic title="Chemo Completed" value={3} suffix="/ 4 AC" valueStyle={{ color: '#0284c7' }} />
              </Col>
              <Col span={12}>
                <Statistic title="Adherence Score" value={82} suffix="%" valueStyle={{ color: '#e11d48' }} />
              </Col>
            </Row>
          </Col>
        </Row>
      </Card>

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
        />
      </Card>

      {/* Longitudinal Journey Timeline */}
      <Card title="Longitudinal Care Stream">
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
      </Card>

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
