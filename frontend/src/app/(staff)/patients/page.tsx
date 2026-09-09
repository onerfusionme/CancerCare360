'use client';

import React, { useState } from 'react';
import { 
  Table, 
  Card, 
  Button, 
  Input, 
  Space, 
  Typography, 
  Tag, 
  Row, 
  Col, 
  Modal, 
  Form, 
  Select, 
  DatePicker, 
  Popconfirm, 
  message, 
  Tooltip 
} from 'antd';
import { 
  PlusOutlined, 
  SearchOutlined, 
  UserOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  EyeOutlined, 
  FilterOutlined 
} from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import dayjs from 'dayjs';
import { 
  usePatients, 
  useCreatePatient, 
  useUpdatePatient, 
  useDeletePatient 
} from '@/hooks/use-patients';
import { Patient, PatientStatus, Gender } from '@/types/patient';
import StatusBadge from '@/components/ui/StatusBadge';

const { Title, Text } = Typography;
const { Option } = Select;

export default function PatientsPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [stageFilter, setStageFilter] = useState<string | undefined>(undefined);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);

  const [createForm] = Form.useForm();
  const [editForm] = Form.useForm();

  const { data: patients, isLoading } = usePatients({
    search: searchTerm,
    careStage: stageFilter,
  });

  const createPatientMutation = useCreatePatient();
  const updatePatientMutation = useUpdatePatient();
  const deletePatientMutation = useDeletePatient();

  // CRUD: Create
  const handleCreate = async (values: any) => {
    try {
      await createPatientMutation.mutateAsync({
        firstName: values.firstName,
        lastName: values.lastName,
        dateOfBirth: values.dateOfBirth ? values.dateOfBirth.toISOString() : new Date().toISOString(),
        gender: values.gender,
        phoneNumber: values.phoneNumber,
        email: values.email,
        address: values.address,
        mrn: values.mrn,
      });
      message.success(`Patient ${values.firstName} ${values.lastName} registered successfully`);
      setCreateModalOpen(false);
      createForm.resetFields();
    } catch (error) {
      message.error('Failed to register patient');
    }
  };

  // CRUD: Open Edit Modal
  const openEditModal = (record: Patient) => {
    setEditingPatient(record);
    editForm.setFieldsValue({
      firstName: record.firstName,
      lastName: record.lastName,
      gender: record.gender,
      careStage: record.careStage,
      status: record.status,
      primaryDoctorName: record.primaryDoctorName,
      phoneNumber: record.phoneNumber || '9876543210',
    });
    setEditModalOpen(true);
  };

  // CRUD: Update
  const handleUpdate = async (values: any) => {
    if (!editingPatient) return;
    try {
      await updatePatientMutation.mutateAsync({
        id: editingPatient.id,
        data: {
          firstName: values.firstName,
          lastName: values.lastName,
          gender: values.gender,
          careStage: values.careStage,
          status: values.status,
          primaryDoctorName: values.primaryDoctorName,
          phoneNumber: values.phoneNumber,
        }
      });
      message.success('Patient record updated successfully');
      setEditModalOpen(false);
      setEditingPatient(null);
    } catch (error) {
      message.error('Failed to update patient record');
    }
  };

  // CRUD: Delete
  const handleDelete = async (id: string, name: string) => {
    try {
      await deletePatientMutation.mutateAsync(id);
      message.success(`Patient ${name} record removed successfully`);
    } catch (error) {
      message.error('Failed to remove patient');
    }
  };

  const columns = [
    { 
      title: 'MRN', 
      dataIndex: 'mrn', 
      key: 'mrn', 
      width: 140,
      render: (mrn: string) => <Text strong style={{ fontFamily: 'monospace' }}>{mrn}</Text>
    },
    { 
      title: 'Patient Name', 
      key: 'name',
      render: (_: any, record: Patient) => (
        <a 
          style={{ fontWeight: 600, color: '#0284c7' }} 
          onClick={() => router.push(`/patients/${record.id}`)}
        >
          {record.firstName} {record.lastName}
        </a>
      )
    },
    { 
      title: 'Age', 
      key: 'age', 
      width: 80,
      render: (_: any, record: Patient) => dayjs().diff(dayjs(record.dateOfBirth), 'year') || 45
    },
    { title: 'Gender', dataIndex: 'gender', key: 'gender', width: 100 },
    { 
      title: 'Care Stage', 
      dataIndex: 'careStage', 
      key: 'careStage',
      render: (stage: string) => <StatusBadge status={stage || 'ACTIVE_TREATMENT'} />
    },
    { 
      title: 'Primary Oncologist', 
      dataIndex: 'primaryDoctorName', 
      key: 'doctor',
      render: (doc: string) => doc || 'Dr. Jane Smith'
    },
    { 
      title: 'Status', 
      dataIndex: 'status', 
      key: 'status', 
      width: 110,
      render: (s: PatientStatus) => <StatusBadge status={s || PatientStatus.ACTIVE} />
    },
    { 
      title: 'Last Visit', 
      dataIndex: 'lastVisit', 
      key: 'lastVisit', 
      width: 120,
      render: (date: string) => date ? dayjs(date).format('DD MMM YYYY') : 'Recent'
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 150,
      render: (_: any, record: Patient) => (
        <Space size="small">
          <Tooltip title="View Patient Journey & Dossier">
            <Button 
              size="small" 
              icon={<EyeOutlined />} 
              onClick={() => router.push(`/patients/${record.id}`)} 
            />
          </Tooltip>
          <Tooltip title="Edit Patient Details">
            <Button 
              size="small" 
              type="primary" 
              icon={<EditOutlined />} 
              onClick={() => openEditModal(record)} 
            />
          </Tooltip>
          <Tooltip title="Delete Patient Record">
            <Popconfirm
              title="Delete Patient Record"
              description={`Are you sure you want to delete ${record.firstName} ${record.lastName}?`}
              onConfirm={() => handleDelete(record.id, `${record.firstName} ${record.lastName}`)}
              okText="Yes, Delete"
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
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <Title level={3} style={{ margin: 0 }}>Patient Directory</Title>
          <Text type="secondary">Centralized oncology cohort registry with complete longitudinal records</Text>
        </div>
        <Space>
          <Button 
            icon={<UserOutlined />} 
            onClick={() => router.push('/patients/new')}
          >
            Full Registration Form
          </Button>
          <Button 
            type="primary" 
            icon={<PlusOutlined />} 
            onClick={() => setCreateModalOpen(true)}
            style={{ background: '#0284c7', borderColor: '#0284c7' }}
          >
            Quick Register
          </Button>
        </Space>
      </div>

      {/* Cohort Search & Filter Toolbar */}
      <Card bodyStyle={{ padding: '16px 24px' }}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={12} md={8}>
            <Input 
              placeholder="Search by Name, MRN or Phone..." 
              prefix={<SearchOutlined style={{ color: '#94a3b8' }} />} 
              allowClear
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Select 
              placeholder="Filter by Care Stage" 
              style={{ width: '100%' }} 
              allowClear
              value={stageFilter}
              onChange={setStageFilter}
            >
              <Option value="SCREENING">Screening & Diagnosis</Option>
              <Option value="STAGING">Staging & Workup</Option>
              <Option value="ACTIVE_TREATMENT">Active Treatment</Option>
              <Option value="POST_TREATMENT">Post-Treatment Care</Option>
              <Option value="SURVEILLANCE">Surveillance</Option>
              <Option value="PALLIATIVE">Palliative Care</Option>
            </Select>
          </Col>
          <Col xs={24} sm={24} md={10} style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <Tag color="blue" style={{ fontSize: 13, padding: '4px 10px' }}>
              Total Patients: {patients?.meta?.totalItems || patients?.data?.length || 0}
            </Tag>
          </Col>
        </Row>
      </Card>

      {/* Patient Table */}
      <Card>
        <Table 
          columns={columns} 
          dataSource={patients?.data || []} 
          rowKey="id" 
          loading={isLoading}
          pagination={{ pageSize: 10 }}
        />
      </Card>

      {/* CRUD: Register Patient Modal */}
      <Modal
        title="Register New Oncology Patient"
        open={createModalOpen}
        onCancel={() => setCreateModalOpen(false)}
        footer={null}
        destroyOnClose
        width={650}
      >
        <Form form={createForm} layout="vertical" onFinish={handleCreate} initialValues={{ gender: Gender.FEMALE }}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="firstName" label="First Name" rules={[{ required: true, message: 'First name is required' }]}>
                <Input placeholder="e.g. Priya" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="lastName" label="Last Name" rules={[{ required: true, message: 'Last name is required' }]}>
                <Input placeholder="e.g. Sharma" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="gender" label="Gender" rules={[{ required: true }]}>
                <Select>
                  <Option value={Gender.FEMALE}>Female</Option>
                  <Option value={Gender.MALE}>Male</Option>
                  <Option value={Gender.OTHER}>Other</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="dateOfBirth" label="Date of Birth" rules={[{ required: true, message: 'DOB required' }]}>
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="mrn" label="MRN (Medical Record #)" rules={[{ required: true, message: 'MRN required' }]}>
                <Input placeholder="MRN-ONC-2026-..." />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="phoneNumber" label="Phone Number" rules={[{ required: true, message: 'Phone required' }]}>
                <Input placeholder="+91 98765 43210" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="email" label="Email Address">
                <Input placeholder="patient@example.com" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="address" label="Residential Address">
            <Input.TextArea rows={2} placeholder="City, District, State" />
          </Form.Item>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 16 }}>
            <Button onClick={() => setCreateModalOpen(false)}>Cancel</Button>
            <Button type="primary" htmlType="submit" loading={createPatientMutation.isPending} style={{ background: '#0284c7', borderColor: '#0284c7' }}>
              Register Patient
            </Button>
          </div>
        </Form>
      </Modal>

      {/* CRUD: Edit Patient Modal */}
      <Modal
        title="Edit Patient Details"
        open={editModalOpen}
        onCancel={() => { setEditModalOpen(false); setEditingPatient(null); }}
        footer={null}
        destroyOnClose
        width={600}
      >
        <Form form={editForm} layout="vertical" onFinish={handleUpdate}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="firstName" label="First Name" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="lastName" label="Last Name" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="careStage" label="Care Stage" rules={[{ required: true }]}>
                <Select>
                  <Option value="SCREENING">Screening & Diagnosis</Option>
                  <Option value="STAGING">Staging & Workup</Option>
                  <Option value="ACTIVE_TREATMENT">Active Treatment</Option>
                  <Option value="POST_TREATMENT">Post-Treatment Care</Option>
                  <Option value="SURVEILLANCE">Surveillance</Option>
                  <Option value="PALLIATIVE">Palliative Care</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="status" label="Patient Status" rules={[{ required: true }]}>
                <Select>
                  <Option value={PatientStatus.ACTIVE}>Active</Option>
                  <Option value={PatientStatus.INACTIVE}>Inactive</Option>
                  <Option value={PatientStatus.DISCHARGED}>Discharged</Option>
                  <Option value={PatientStatus.DECEASED}>Deceased</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="primaryDoctorName" label="Assigned Oncologist">
                <Input placeholder="Dr. Jane Smith" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="phoneNumber" label="Phone Number">
                <Input />
              </Form.Item>
            </Col>
          </Row>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <Button onClick={() => { setEditModalOpen(false); setEditingPatient(null); }}>Cancel</Button>
            <Button type="primary" htmlType="submit" loading={updatePatientMutation.isPending} style={{ background: '#0284c7', borderColor: '#0284c7' }}>
              Save Changes
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
}
