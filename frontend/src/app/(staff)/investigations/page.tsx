'use client';

import React, { useState } from 'react';
import { 
  Table, 
  Tabs, 
  Select, 
  DatePicker, 
  Button, 
  Typography, 
  Space, 
  Row, 
  Col, 
  Card, 
  Modal, 
  Form, 
  Input, 
  Popconfirm, 
  message, 
  Tag, 
  Tooltip 
} from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  CheckCircleOutlined, 
  ClockCircleOutlined,
  ExperimentOutlined 
} from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import dayjs from 'dayjs';
import { 
  useInvestigations, 
  useCreateInvestigation, 
  useUpdateInvestigation, 
  useDeleteInvestigation 
} from '@/hooks/use-investigations';
import { InvestigationType, InvestigationStatus, Investigation } from '@/types/investigation';
import StatusBadge from '@/components/ui/StatusBadge';
import { InvestigationStatusFlow } from '@/components/investigation/InvestigationStatusFlow';

const { Title, Text } = Typography;
const { Option } = Select;

export default function InvestigationsPage() {
  const router = useRouter();
  const [filterType, setFilterType] = useState<InvestigationType | undefined>(undefined);
  const [filterStatus, setFilterStatus] = useState<InvestigationStatus | undefined>(undefined);

  // Modals for CRUD
  const [orderModalOpen, setOrderModalOpen] = useState(false);
  const [updateModalOpen, setUpdateModalOpen] = useState(false);
  const [selectedInv, setSelectedInv] = useState<Investigation | null>(null);

  const [orderForm] = Form.useForm();
  const [updateForm] = Form.useForm();

  const { data: investigations, isLoading } = useInvestigations({
    type: filterType,
    status: filterStatus
  });

  const createInvMutation = useCreateInvestigation();
  const updateInvMutation = useUpdateInvestigation();
  const deleteInvMutation = useDeleteInvestigation();

  // CRUD: Create
  const handleOrder = async (values: any) => {
    try {
      await createInvMutation.mutateAsync({
        patientId: values.patientId || 'pat1',
        type: values.type,
        notes: values.notes,
        priority: values.priority || 'ROUTINE',
      } as any);
      message.success('Investigation ordered successfully');
      setOrderModalOpen(false);
      orderForm.resetFields();
    } catch (e) {
      message.error('Failed to order investigation');
    }
  };

  // CRUD: Open Update Modal
  const openUpdateModal = (record: Investigation) => {
    setSelectedInv(record);
    updateForm.setFieldsValue({
      status: record.status,
      notes: record.notes || '',
    });
    setUpdateModalOpen(true);
  };

  // CRUD: Update
  const handleUpdate = async (values: any) => {
    if (!selectedInv) return;
    try {
      await updateInvMutation.mutateAsync({
        id: selectedInv.id,
        dto: {
          status: values.status,
          notes: values.notes,
        }
      });
      message.success('Investigation status and results updated');
      setUpdateModalOpen(false);
      setSelectedInv(null);
    } catch (e) {
      message.error('Failed to update investigation');
    }
  };

  // CRUD: Delete
  const handleDelete = async (id: string, type: string) => {
    try {
      await deleteInvMutation.mutateAsync(id);
      message.success(`${type} order cancelled successfully`);
    } catch (e) {
      message.error('Failed to cancel investigation');
    }
  };

  const columns = [
    { 
      title: 'Patient', 
      key: 'patient', 
      render: (_: any, r: Investigation) => (
        <div>
          <div style={{ fontWeight: 600 }}>{r.patient?.name || 'Priya Sharma'}</div>
          <div style={{ fontSize: '11px', color: '#64748b' }}>MRN: {r.patient?.mrn || 'MRN-ONC-2026-001'}</div>
        </div>
      )
    },
    { 
      title: 'Investigation Type', 
      dataIndex: 'type', 
      key: 'type',
      render: (t: string) => <Tag color="blue" style={{ fontWeight: 600 }}>{t}</Tag>
    },
    { title: 'Ordered By', dataIndex: 'orderedBy', key: 'orderedBy', render: (o: string) => o || 'Dr. Jane Smith' },
    { 
      title: 'Ordered Date', 
      dataIndex: 'orderedDate', 
      key: 'orderedDate', 
      render: (d: string) => d ? dayjs(d).format('MMM D, YYYY') : 'Today' 
    },
    { 
      title: 'Status', 
      dataIndex: 'status', 
      key: 'status', 
      render: (s: InvestigationStatus) => <StatusBadge status={s} /> 
    },
    { 
      title: 'TAT Benchmarking', 
      dataIndex: 'turnaroundTimeDays', 
      key: 'turnaroundTimeDays', 
      render: (t: number) => {
        const days = t || 1;
        return (
          <span style={{ color: days > 5 ? '#e11d48' : '#10b981', fontWeight: 600 }}>
            {days > 5 ? `⚠️ ${days} days (SLA breached)` : `${days} days`}
          </span>
        );
      }
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 140,
      render: (_: any, record: Investigation) => (
        <Space size="small">
          <Tooltip title="Update Lab Status / Result">
            <Button 
              size="small" 
              type="primary" 
              icon={<EditOutlined />} 
              onClick={() => openUpdateModal(record)}
            >
              Update
            </Button>
          </Tooltip>
          <Tooltip title="Cancel Lab Order">
            <Popconfirm
              title="Cancel Investigation"
              description="Are you sure you want to cancel this order?"
              onConfirm={() => handleDelete(record.id, record.type)}
              okText="Yes, Cancel"
              cancelText="No"
              okButtonProps={{ danger: true }}
            >
              <Button size="small" danger icon={<DeleteOutlined />} />
            </Popconfirm>
          </Tooltip>
        </Space>
      )
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <Title level={3} style={{ margin: 0 }}>Diagnostic Investigations & Pathology</Title>
          <Text type="secondary">Turnaround time (TAT) tracking, LIS integration & specimen status</Text>
        </div>
        <Button 
          type="primary" 
          icon={<PlusOutlined />} 
          onClick={() => setOrderModalOpen(true)}
          style={{ background: '#0284c7', borderColor: '#0284c7' }}
        >
          Order Investigation
        </Button>
      </div>

      <Card>
        <Tabs items={[
          {
            key: 'all',
            label: `All Investigations (${investigations?.length || 0})`,
            children: (
              <>
                <Space style={{ marginBottom: 16 }} wrap>
                  <Select placeholder="Investigation Type" style={{ width: 200 }} allowClear onChange={setFilterType}>
                    {Object.values(InvestigationType).map(t => <Option key={t} value={t}>{t}</Option>)}
                  </Select>
                  <Select placeholder="Status" style={{ width: 200 }} allowClear onChange={setFilterStatus}>
                    {Object.values(InvestigationStatus).map(s => <Option key={s} value={s}>{s}</Option>)}
                  </Select>
                  <DatePicker.RangePicker />
                </Space>
                <Table 
                  dataSource={investigations} 
                  columns={columns} 
                  rowKey="id" 
                  loading={isLoading}
                  expandable={{
                    expandedRowRender: (record) => (
                      <div style={{ padding: '12px 16px', background: 'rgba(0,0,0,0.02)', borderRadius: 8 }}>
                        <div style={{ fontWeight: 600, marginBottom: 8 }}>Clinical Notes / Pathological Findings:</div>
                        <Text type="secondary">{record.notes || 'No preliminary notes submitted.'}</Text>
                        <div style={{ marginTop: 12 }}>
                          <InvestigationStatusFlow currentStatus={record.status} />
                        </div>
                      </div>
                    )
                  }}
                />
              </>
            )
          },
          {
            key: 'pending',
            label: 'Pending Specimen / In-Transit',
            children: (
              <Table 
                dataSource={(investigations || []).filter(i => i.status === InvestigationStatus.ORDERED || i.status === InvestigationStatus.SAMPLE_COLLECTED)} 
                columns={columns} 
                rowKey="id" 
                loading={isLoading}
              />
            )
          },
          {
            key: 'completed',
            label: 'Completed Findings & Reports',
            children: (
              <Table 
                dataSource={(investigations || []).filter(i => i.status === InvestigationStatus.REPORT_AVAILABLE || i.status === InvestigationStatus.REVIEWED)} 
                columns={columns} 
                rowKey="id" 
                loading={isLoading}
              />
            )
          }
        ]} />
      </Card>

      {/* CRUD: Order Investigation Modal */}
      <Modal
        title="Order New Investigation"
        open={orderModalOpen}
        onCancel={() => setOrderModalOpen(false)}
        footer={null}
        destroyOnClose
      >
        <Form form={orderForm} layout="vertical" onFinish={handleOrder} initialValues={{ type: InvestigationType.BLOOD_WORK, priority: 'ROUTINE' }}>
          <Form.Item name="patientId" label="Patient" rules={[{ required: true, message: 'Please select patient' }]}>
            <Select placeholder="Select Patient">
              <Option value="pat1">Priya Sharma (MRN-ONC-2026-001)</Option>
              <Option value="pat2">Rajesh Patel (MRN-ONC-2026-002)</Option>
              <Option value="pat3">Anita Desai (MRN-ONC-2026-003)</Option>
            </Select>
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="type" label="Investigation Type" rules={[{ required: true }]}>
                <Select>
                  {Object.values(InvestigationType).map(t => (
                    <Option key={t} value={t}>{t}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="priority" label="Priority">
                <Select>
                  <Option value="ROUTINE">Routine (SLA 48h)</Option>
                  <Option value="URGENT">Urgent (SLA 24h)</Option>
                  <Option value="STAT">STAT / Critical (SLA 4h)</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="notes" label="Clinical Indication / Notes">
            <Input.TextArea rows={3} placeholder="e.g. Check for Grade 3/4 Neutropenia prior to administering Chemo Cycle 4" />
          </Form.Item>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <Button onClick={() => setOrderModalOpen(false)}>Cancel</Button>
            <Button type="primary" htmlType="submit" loading={createInvMutation.isPending} style={{ background: '#0284c7', borderColor: '#0284c7' }}>
              Confirm Lab Order
            </Button>
          </div>
        </Form>
      </Modal>

      {/* CRUD: Update Investigation Modal */}
      <Modal
        title="Update Investigation Status & Findings"
        open={updateModalOpen}
        onCancel={() => { setUpdateModalOpen(false); setSelectedInv(null); }}
        footer={null}
        destroyOnClose
      >
        <Form form={updateForm} layout="vertical" onFinish={handleUpdate}>
          <div style={{ marginBottom: 16, padding: 12, background: '#f8fafc', borderRadius: 8 }}>
            <Text strong>Order Details:</Text>
            <div>Test: <Tag color="blue">{selectedInv?.type}</Tag></div>
            <div>Patient: {selectedInv?.patient?.name || 'Priya Sharma'}</div>
          </div>

          <Form.Item name="status" label="Workflow Status" rules={[{ required: true }]}>
            <Select>
              <Option value={InvestigationStatus.ORDERED}>ORDERED</Option>
              <Option value={InvestigationStatus.SCHEDULED}>SCHEDULED</Option>
              <Option value={InvestigationStatus.SAMPLE_COLLECTED}>SAMPLE COLLECTED</Option>
              <Option value={InvestigationStatus.IN_PROGRESS}>IN PROGRESS</Option>
              <Option value={InvestigationStatus.REPORT_AVAILABLE}>REPORT AVAILABLE</Option>
              <Option value={InvestigationStatus.REVIEWED}>REVIEWED / VERIFIED</Option>
            </Select>
          </Form.Item>

          <Form.Item name="notes" label="Findings & Lab Notes">
            <Input.TextArea rows={4} placeholder="Enter specimen observation, quantitative values, or pathologist report" />
          </Form.Item>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <Button onClick={() => { setUpdateModalOpen(false); setSelectedInv(null); }}>Cancel</Button>
            <Button type="primary" htmlType="submit" loading={updateInvMutation.isPending} style={{ background: '#0284c7', borderColor: '#0284c7' }}>
              Save Updates
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
}
