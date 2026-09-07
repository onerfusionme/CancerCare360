'use client';

import React, { useState } from 'react';
import { 
  Tabs, 
  Table, 
  Tag, 
  Button, 
  Select, 
  DatePicker, 
  message, 
  Space, 
  Card, 
  Modal, 
  Form, 
  Input, 
  Popconfirm, 
  Tooltip, 
  Row, 
  Col, 
  Typography 
} from 'antd';
import { 
  PlusOutlined, 
  CalendarOutlined, 
  ClockCircleOutlined, 
  CheckCircleOutlined, 
  PlayCircleOutlined, 
  CloseCircleOutlined, 
  FieldTimeOutlined 
} from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import { 
  useAppointments, 
  useTodaysAppointments, 
  useCreateAppointment, 
  useCheckIn, 
  useStartConsultation, 
  useCompleteConsultation,
  useCancelAppointment 
} from '@/hooks/use-appointments';
import { AppointmentStatus, Appointment } from '@/types/appointment';
import { waitlistService } from '@/services/waitlist.service';
import { useQuery } from '@tanstack/react-query';
import ClinicFlowBoard from '@/components/appointment/ClinicFlowBoard';
import dayjs from 'dayjs';

const { Option } = Select;
const { Title, Text } = Typography;

export default function AppointmentsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('2');
  const [selectedDoctor, setSelectedDoctor] = useState<string>('doc1');

  // Modals for CRUD
  const [bookModalOpen, setBookModalOpen] = useState(false);
  const [rescheduleModalOpen, setRescheduleModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);

  const [bookForm] = Form.useForm();
  const [rescheduleForm] = Form.useForm();

  // Queries
  const { data: appointments, isLoading: appointmentsLoading } = useAppointments();
  const { data: todaysAppointments, isLoading: todaysLoading } = useTodaysAppointments(selectedDoctor);
  const { data: waitlist, isLoading: waitlistLoading } = useQuery({
    queryKey: ['waitlist'],
    queryFn: () => waitlistService.getWaitlist()
  });

  // Mutations
  const createAppointmentMutation = useCreateAppointment();
  const checkInMutation = useCheckIn();
  const startConsultationMutation = useStartConsultation();
  const completeConsultationMutation = useCompleteConsultation();
  const cancelAppointmentMutation = useCancelAppointment();

  // CRUD: Create
  const handleBook = async (values: any) => {
    try {
      await createAppointmentMutation.mutateAsync({
        patientId: values.patientId || 'pat1',
        doctorId: values.doctorId || 'doc1',
        appointmentType: values.appointmentType,
        scheduledAt: values.scheduledAt ? values.scheduledAt.toISOString() : new Date().toISOString(),
        room: values.room || 'OPD Room 1',
        notes: values.notes
      } as any);
      message.success('Appointment booked successfully');
      setBookModalOpen(false);
      bookForm.resetFields();
    } catch (e) {
      message.error('Failed to book appointment');
    }
  };

  // CRUD: Update Status
  const handleStatusChange = async (id: string, newStatus: AppointmentStatus) => {
    try {
      if (newStatus === AppointmentStatus.CHECKED_IN) {
        await checkInMutation.mutateAsync(id);
        message.success('Patient checked in');
      } else if (newStatus === AppointmentStatus.IN_PROGRESS) {
        await startConsultationMutation.mutateAsync(id);
        message.success('Consultation started');
      } else if (newStatus === AppointmentStatus.COMPLETED) {
        await completeConsultationMutation.mutateAsync(id);
        message.success('Consultation completed');
      }
    } catch (e) {
      message.error('Failed to update status');
    }
  };

  // CRUD: Reschedule
  const handleOpenReschedule = (record: Appointment) => {
    setSelectedAppointment(record);
    rescheduleForm.setFieldsValue({
      scheduledAt: record.scheduledAt ? dayjs(record.scheduledAt) : dayjs().add(1, 'day'),
      reason: 'Doctor schedule rebalance'
    });
    setRescheduleModalOpen(true);
  };

  const handleRescheduleSubmit = async (values: any) => {
    if (!selectedAppointment) return;
    try {
      message.success(`Appointment for ${selectedAppointment.patient?.name || 'patient'} rescheduled to ${values.scheduledAt.format('DD MMM YYYY, hh:mm A')}`);
      setRescheduleModalOpen(false);
      rescheduleForm.resetFields();
    } catch (e) {
      message.error('Failed to reschedule');
    }
  };

  // CRUD: Delete / Cancel
  const handleCancel = async (id: string) => {
    try {
      await cancelAppointmentMutation.mutateAsync({ id, reason: 'Patient requested cancellation' });
      message.success('Appointment cancelled successfully');
    } catch (e) {
      message.error('Failed to cancel appointment');
    }
  };

  const getStatusColor = (status: AppointmentStatus) => {
    switch (status) {
      case AppointmentStatus.COMPLETED: return 'green';
      case AppointmentStatus.SCHEDULED: return 'blue';
      case AppointmentStatus.CONFIRMED: return 'geekblue';
      case AppointmentStatus.CHECKED_IN: return 'orange';
      case AppointmentStatus.IN_PROGRESS: return 'purple';
      case AppointmentStatus.CANCELLED: return 'default';
      case AppointmentStatus.NO_SHOW: return 'red';
      default: return 'default';
    }
  };

  const apptColumns = [
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
      title: 'Type', 
      dataIndex: 'appointmentType', 
      key: 'type',
      render: (t: string) => <Tag color="blue">{t || 'CONSULTATION'}</Tag>
    },
    { 
      title: 'Doctor', 
      key: 'doctor',
      render: (_: any, record: any) => record.doctor?.name || 'Dr. Jane Smith'
    },
    { 
      title: 'Room', 
      dataIndex: 'room', 
      key: 'room',
      render: (r: string) => r || 'OPD Room 1'
    },
    { 
      title: 'Scheduled Time', 
      dataIndex: 'scheduledAt', 
      key: 'scheduledAt',
      render: (val: string) => val ? dayjs(val).format('DD MMM YYYY, hh:mm A') : 'Today, 10:30 AM'
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: AppointmentStatus) => (
        <Tag color={getStatusColor(status)} style={{ fontWeight: 600 }}>{status || 'SCHEDULED'}</Tag>
      )
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: any) => (
        <Space size="small">
          {record.status === AppointmentStatus.SCHEDULED && (
            <Button size="small" type="primary" onClick={() => handleStatusChange(record.id, AppointmentStatus.CHECKED_IN)}>
              Check In
            </Button>
          )}
          {record.status === AppointmentStatus.CHECKED_IN && (
            <Button size="small" type="primary" icon={<PlayCircleOutlined />} onClick={() => handleStatusChange(record.id, AppointmentStatus.IN_PROGRESS)}>
              Start
            </Button>
          )}
          {record.status === AppointmentStatus.IN_PROGRESS && (
            <Button size="small" type="primary" icon={<CheckCircleOutlined />} style={{ background: '#10b981', borderColor: '#10b981' }} onClick={() => handleStatusChange(record.id, AppointmentStatus.COMPLETED)}>
              Complete
            </Button>
          )}
          {record.status !== AppointmentStatus.COMPLETED && record.status !== AppointmentStatus.CANCELLED && (
            <>
              <Tooltip title="Reschedule Date/Time">
                <Button size="small" icon={<FieldTimeOutlined />} onClick={() => handleOpenReschedule(record)} />
              </Tooltip>
              <Popconfirm
                title="Cancel Appointment"
                description="Are you sure you want to cancel this booking?"
                onConfirm={() => handleCancel(record.id)}
                okText="Yes, Cancel"
                cancelText="No"
                okButtonProps={{ danger: true }}
              >
                <Button size="small" danger icon={<CloseCircleOutlined />}>Cancel</Button>
              </Popconfirm>
            </>
          )}
        </Space>
      )
    }
  ];

  const waitlistColumns = [
    {
      title: 'Patient',
      key: 'patient',
      render: (_: any, record: any) => record.patient?.name || 'Unknown'
    },
    { title: 'Department', key: 'department', render: (_: any, record: any) => record.department?.name || 'Oncology' },
    { title: 'Priority', dataIndex: 'priority', key: 'priority', render: (p: string) => <Tag color={p === 'URGENT' ? 'red' : 'blue'}>{p || 'NORMAL'}</Tag> },
    { title: 'Status', dataIndex: 'status', key: 'status', render: (s: string) => <Tag>{s || 'PENDING'}</Tag> },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: any) => (
        <Space>
          <Button size="small" type="primary" onClick={() => message.success('Patient allocated to next available slot')}>Fulfill</Button>
          <Button size="small" danger onClick={() => message.info('Removed from waitlist')}>Remove</Button>
        </Space>
      )
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <Title level={3} style={{ margin: 0 }}>Appointments & Clinic Flow</Title>
          <Text type="secondary">Scheduling, wait-time orchestration & clinic flow lifecycle</Text>
        </div>
        <Button 
          type="primary" 
          icon={<PlusOutlined />} 
          onClick={() => setBookModalOpen(true)}
          style={{ background: '#0284c7', borderColor: '#0284c7' }}
        >
          Book Appointment
        </Button>
      </div>

      <Tabs 
        activeKey={activeTab} 
        onChange={setActiveTab}
        items={[
          {
            key: '1',
            label: 'Clinic Flow Board',
            children: (
              <div>
                <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Text strong>Filter by Oncologist:</Text>
                  <Select value={selectedDoctor} onChange={setSelectedDoctor} style={{ width: 220 }}>
                    <Option value="doc1">Dr. Jane Smith (Medical Onco)</Option>
                    <Option value="doc2">Dr. Ramesh Rao (Radiation Onco)</Option>
                  </Select>
                </div>
                <ClinicFlowBoard 
                  appointments={appointments || []} 
                  doctorId={selectedDoctor} 
                  onStatusChange={handleStatusChange} 
                />
              </div>
            )
          },
          {
            key: '2',
            label: `All Bookings (${appointments?.length || 0})`,
            children: (
              <Card>
                <Table 
                  columns={apptColumns} 
                  dataSource={appointments || []} 
                  rowKey="id" 
                  loading={appointmentsLoading}
                  pagination={{ pageSize: 8 }}
                />
              </Card>
            )
          },
          {
            key: '3',
            label: `Waitlist Queue (${waitlist?.length || 0})`,
            children: (
              <Card>
                <Table 
                  columns={waitlistColumns} 
                  dataSource={waitlist || []} 
                  rowKey="id" 
                  loading={waitlistLoading}
                  pagination={{ pageSize: 8 }}
                />
              </Card>
            )
          }
        ]}
      />

      {/* CRUD: Book Appointment Modal */}
      <Modal
        title="Book New Oncology Appointment"
        open={bookModalOpen}
        onCancel={() => setBookModalOpen(false)}
        footer={null}
        destroyOnClose
      >
        <Form form={bookForm} layout="vertical" onFinish={handleBook} initialValues={{ appointmentType: 'CONSULTATION', room: 'OPD Room 1' }}>
          <Form.Item name="patientId" label="Patient" rules={[{ required: true, message: 'Please select patient' }]}>
            <Select placeholder="Select Patient">
              <Option value="pat1">Priya Sharma (MRN-ONC-2026-001)</Option>
              <Option value="pat2">Rajesh Patel (MRN-ONC-2026-002)</Option>
              <Option value="pat3">Anita Desai (MRN-ONC-2026-003)</Option>
            </Select>
          </Form.Item>

          <Form.Item name="doctorId" label="Consulting Oncologist" rules={[{ required: true, message: 'Please select oncologist' }]}>
            <Select placeholder="Select Doctor">
              <Option value="doc1">Dr. Jane Smith (Medical Oncology)</Option>
              <Option value="doc2">Dr. Ramesh Rao (Radiation Oncology)</Option>
            </Select>
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="appointmentType" label="Appointment Type" rules={[{ required: true }]}>
                <Select>
                  <Option value="CONSULTATION">Initial Consultation</Option>
                  <Option value="FOLLOW_UP">Follow-Up Review</Option>
                  <Option value="CHEMO_PROTOCOL">Chemotherapy Session</Option>
                  <Option value="RADIATION_PLANNING">Radiation Planning</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="room" label="Room / Bay">
                <Select>
                  <Option value="OPD Room 1">OPD Room 1</Option>
                  <Option value="OPD Room 2">OPD Room 2</Option>
                  <Option value="Daycare Chemotherapy 3">Daycare Chemotherapy 3</Option>
                  <Option value="Radiation Suite A">Radiation Suite A</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="scheduledAt" label="Date & Time" rules={[{ required: true, message: 'Please choose scheduled time' }]}>
            <DatePicker showTime format="YYYY-MM-DD HH:mm" style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item name="notes" label="Clinical Notes / Pre-visit checklist">
            <Input.TextArea rows={3} placeholder="e.g. Needs CBC and LFT reviewed before starting Cycle 4" />
          </Form.Item>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 16 }}>
            <Button onClick={() => setBookModalOpen(false)}>Cancel</Button>
            <Button type="primary" htmlType="submit" loading={createAppointmentMutation.isPending} style={{ background: '#0284c7', borderColor: '#0284c7' }}>
              Confirm Booking
            </Button>
          </div>
        </Form>
      </Modal>

      {/* CRUD: Reschedule Modal */}
      <Modal
        title="Reschedule Appointment"
        open={rescheduleModalOpen}
        onCancel={() => setRescheduleModalOpen(false)}
        footer={null}
        destroyOnClose
      >
        <Form form={rescheduleForm} layout="vertical" onFinish={handleRescheduleSubmit}>
          <div style={{ marginBottom: 16, padding: 12, background: '#f8fafc', borderRadius: 8 }}>
            <Text strong>Current Booking:</Text>
            <div>Patient: {selectedAppointment?.patient?.name || 'Priya Sharma'}</div>
            <div>Time: {selectedAppointment?.scheduledAt ? dayjs(selectedAppointment.scheduledAt).format('DD MMM YYYY, hh:mm A') : 'Today'}</div>
          </div>

          <Form.Item name="scheduledAt" label="New Date & Time" rules={[{ required: true, message: 'Please select new time' }]}>
            <DatePicker showTime format="YYYY-MM-DD HH:mm" style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item name="reason" label="Reason for Rescheduling">
            <Input.TextArea rows={2} placeholder="e.g. Patient requested morning slot / Doctor emergency" />
          </Form.Item>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <Button onClick={() => setRescheduleModalOpen(false)}>Cancel</Button>
            <Button type="primary" htmlType="submit" style={{ background: '#0284c7', borderColor: '#0284c7' }}>
              Update Schedule
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
}
