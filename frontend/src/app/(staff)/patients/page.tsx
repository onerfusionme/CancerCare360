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
  Tooltip,
  Badge
} from 'antd';
import { 
  PlusOutlined, 
  SearchOutlined, 
  UserOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  EyeOutlined, 
  FilterOutlined,
  AlertOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import dayjs from 'dayjs';
import { 
  usePatients, 
  useCreatePatient, 
  useUpdatePatient, 
  useDeletePatient 
} from '@/hooks/use-patients';
import { Patient, PatientStatus, Gender, PatientFollowUpStage } from '@/types/patient';
import StatusBadge from '@/components/ui/StatusBadge';

const { Title, Text } = Typography;
const { Option } = Select;

export default function PatientsPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [stageFilter, setStageFilter] = useState<string | undefined>(undefined);
  const [followUpFilter, setFollowUpFilter] = useState<string | undefined>(undefined);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);

  const [createForm] = Form.useForm();
  const [editForm] = Form.useForm();

  const { data: patientsData, isLoading } = usePatients({
    search: searchTerm,
    careStage: stageFilter,
  });

  const patientList: Patient[] = React.useMemo(() => {
    let list: Patient[] = [];
    if (Array.isArray(patientsData)) list = patientsData;
    else if (patientsData && Array.isArray((patientsData as any).data)) list = (patientsData as any).data;

    if (followUpFilter) {
      list = list.filter(p => p.followUpStage === followUpFilter);
    }
    return list;
  }, [patientsData, followUpFilter]);

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
        followUpStage: values.followUpStage || 'UNDER_TREATMENT',
      } as any);
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
      followUpStage: record.followUpStage || 'UNDER_TREATMENT',
      status: record.status,
      primaryDoctorName: record.primaryDoctorName,
      phoneNumber: record.phoneNumber || '',
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
          followUpStage: values.followUpStage,
          status: values.status,
          primaryDoctorName: values.primaryDoctorName,
          phoneNumber: values.phoneNumber,
        } as any
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

  const renderFollowUpStage = (stage?: string) => {
    switch (stage) {
      case 'AT_RISK_LTFU':
        return <Tag color="error" icon={<AlertOutlined />}>AT RISK LTFU</Tag>;
      case 'RE_ENGAGED':
        return <Tag color="success" icon={<CheckCircleOutlined />}>RE-ENGAGED</Tag>;
      case 'SURVEILLANCE':
        return <Tag color="cyan">SURVEILLANCE</Tag>;
      case 'REQUIRING_INVESTIGATION':
        return <Tag color="warning">REQ. INVESTIGATION</Tag>;
      case 'REQUIRING_REVIEW':
        return <Tag color="gold">REQ. REVIEW</Tag>;
      case 'UNDER_FOLLOW_UP':
        return <Tag color="blue">UNDER FOLLOW-UP</Tag>;
      case 'UNDER_TREATMENT':
        return <Tag color="processing">UNDER TREATMENT</Tag>;
      case 'LOST_TO_FOLLOW_UP':
        return <Tag color="default">LOST TO FOLLOW-UP</Tag>;
      default:
        return <Tag color="default">{stage || 'ACTIVE'}</Tag>;
    }
  };

  const columns = [
    { 
      title: 'MRN', 
      dataIndex: 'mrn', 
      key: 'mrn', 
      width: 130,
      render: (mrn: string) => <Text strong style={{ fontFamily: 'monospace' }}>{mrn}</Text>
    },
    { 
      title: 'Patient Name', 
      key: 'name',
      render: (_: any, record: Patient) => (
        <div>
          <a 
            style={{ fontWeight: 600, color: '#0284c7' }} 
            onClick={() => router.push(`/patients/${record.id}`)}
          >
            {record.firstName} {record.lastName}
          </a>
          <div style={{ fontSize: 11, color: '#64748b' }}>
            {record.gender || '—'} &bull; {record.dateOfBirth ? `${dayjs().diff(dayjs(record.dateOfBirth), 'year')} yrs` : '—'}
          </div>
        </div>
      )
    },
    { 
      title: 'Follow-Up Stage', 
      key: 'followUpStage',
      width: 180,
      render: (_: any, record: Patient) => renderFollowUpStage(record.followUpStage)
    },
    { 
      title: 'Care Stage', 
      dataIndex: 'careStage', 
      key: 'careStage',
      width: 140,
      render: (stage: string) => <StatusBadge status={stage || 'ACTIVE_TREATMENT'} />
    },
    { 
      title: 'Care Coordinator', 
      key: 'coordinator',
      width: 160,
      render: (_: any, record: any) => (
        <span style={{ fontSize: 12 }}>
          {record.careCoordinator 
            ? `${record.careCoordinator.firstName} ${record.careCoordinator.lastName}`
            : <span style={{ color: '#94a3b8' }}>Unassigned</span>}
        </span>
      )
    },
    { 
      title: 'Primary Oncologist', 
      dataIndex: 'primaryDoctorName', 
      key: 'doctor',
      width: 160,
      render: (doc: string) => doc || <span style={{ color: '#94a3b8' }}>Oncologist</span>
    },
    { 
      title: 'Status', 
      dataIndex: 'status', 
      key: 'status', 
      width: 100,
      render: (s: PatientStatus) => <StatusBadge status={s || PatientStatus.ACTIVE} />
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 140,
      render: (_: any, record: Patient) => (
        <Space size="small">
          <Tooltip title="View Patient Dossier & Navigation">
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
          <Text type="secondary">Centralized oncology cohort registry with longitudinal follow-up stages & care coordinators</Text>
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
            Quick Register Patient
          </Button>
        </Space>
      </div>

      {/* Filters Bar */}
      <Card className="glass-card" styles={{ body: { padding: '16px 20px' } }}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} md={8}>
            <Input 
              placeholder="Search by Patient Name or MRN..." 
              prefix={<SearchOutlined />} 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              allowClear
            />
          </Col>
          <Col xs={12} md={6}>
            <Select 
              placeholder="Filter by Care Stage" 
              style={{ width: '100%' }}
              allowClear
              value={stageFilter}
              onChange={(val) => setStageFilter(val)}
            >
              <Option value="SCREENING">Screening & Diagnosis</Option>
              <Option value="STAGING">Staging & Workup</Option>
              <Option value="ACTIVE_TREATMENT">Active Treatment</Option>
              <Option value="POST_TREATMENT">Post-Treatment Care</Option>
              <Option value="SURVEILLANCE">Surveillance</Option>
              <Option value="PALLIATIVE">Palliative Care</Option>
            </Select>
          </Col>
          <Col xs={12} md={6}>
            <Select 
              placeholder="Filter by Follow-Up Stage" 
              style={{ width: '100%' }}
              allowClear
              value={followUpFilter}
              onChange={(val) => setFollowUpFilter(val)}
            >
              <Option value="UNDER_TREATMENT">Under Treatment</Option>
              <Option value="SURVEILLANCE">Surveillance</Option>
              <Option value="UNDER_FOLLOW_UP">Under Follow-Up</Option>
              <Option value="AT_RISK_LTFU">At Risk LTFU</Option>
              <Option value="RE_ENGAGED">Re-Engaged</Option>
              <Option value="REQUIRING_INVESTIGATION">Requiring Investigation</Option>
              <Option value="REQUIRING_REVIEW">Requiring Review</Option>
              <Option value="LOST_TO_FOLLOW_UP">Lost to Follow-Up</Option>
            </Select>
          </Col>
          <Col xs={24} md={4} style={{ textAlign: 'right' }}>
            <Text style={{ fontWeight: 600 }}>{patientList.length} patient(s) found</Text>
          </Col>
        </Row>
      </Card>

      {/* Patients Table */}
      <Card className="glass-card" styles={{ body: { padding: 0 } }}>
        <Table 
          columns={columns} 
          dataSource={patientList} 
          rowKey="id" 
          loading={isLoading}
          pagination={{ pageSize: 10, showSizeChanger: true }}
        />
      </Card>

      {/* Create Patient Modal */}
      <Modal
        title="Quick Register Oncology Patient"
        open={createModalOpen}
        onCancel={() => setCreateModalOpen(false)}
        footer={null}
        destroyOnClose
        width={650}
      >
        <Form form={createForm} layout="vertical" onFinish={handleCreate} initialValues={{ gender: Gender.FEMALE, followUpStage: 'UNDER_TREATMENT' }}>
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
              <Form.Item name="followUpStage" label="Initial Follow-Up Stage" rules={[{ required: true }]}>
                <Select>
                  <Option value="UNDER_TREATMENT">Under Treatment</Option>
                  <Option value="SURVEILLANCE">Surveillance</Option>
                  <Option value="UNDER_FOLLOW_UP">Under Follow-Up</Option>
                  <Option value="AT_RISK_LTFU">At Risk LTFU</Option>
                </Select>
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

      {/* Edit Patient Modal */}
      <Modal
        title="Edit Patient Details & Follow-up Stage"
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
              <Form.Item name="followUpStage" label="Follow-Up Continuity Stage" rules={[{ required: true }]}>
                <Select>
                  <Option value="UNDER_TREATMENT">Under Treatment</Option>
                  <Option value="SURVEILLANCE">Surveillance</Option>
                  <Option value="UNDER_FOLLOW_UP">Under Follow-Up</Option>
                  <Option value="AT_RISK_LTFU">At Risk LTFU</Option>
                  <Option value="RE_ENGAGED">Re-Engaged</Option>
                  <Option value="REQUIRING_INVESTIGATION">Requiring Investigation</Option>
                  <Option value="REQUIRING_REVIEW">Requiring Review</Option>
                  <Option value="LOST_TO_FOLLOW_UP">Lost to Follow-Up</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="primaryDoctorName" label="Assigned Oncologist">
                <Input placeholder="e.g. Dr. Oncologist Name" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="phoneNumber" label="Phone Number">
                <Input />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="status" label="Patient Status" rules={[{ required: true }]}>
            <Select>
              <Option value={PatientStatus.ACTIVE}>Active</Option>
              <Option value={PatientStatus.INACTIVE}>Inactive</Option>
              <Option value={PatientStatus.DISCHARGED}>Discharged</Option>
              <Option value={PatientStatus.DECEASED}>Deceased</Option>
            </Select>
          </Form.Item>

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
