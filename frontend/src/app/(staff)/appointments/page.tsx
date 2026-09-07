'use client';

import React, { useState } from 'react';
import { Tabs, Table, Tag, Button, Select, DatePicker, message, Space, Card } from 'antd';
import { useRouter } from 'next/navigation';
import { useAppointments, useTodaysAppointments, useCheckIn, useStartConsultation, useCompleteConsultation } from '@/hooks/use-appointments';
import { AppointmentStatus } from '@/types/appointment';
import { waitlistService } from '@/services/waitlist.service';
import { useQuery } from '@tanstack/react-query';
import ClinicFlowBoard from '@/components/appointment/ClinicFlowBoard';

const { Option } = Select;

export default function AppointmentsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('1');
  const [selectedDoctor, setSelectedDoctor] = useState<string>('doc1'); // mock doctor id

  // Tab 1: All Appointments
  const { data: appointments, isLoading: appointmentsLoading } = useAppointments();
  
  // Tab 2: Today's Clinic Flow
  const { data: todaysAppointments, isLoading: todaysLoading } = useTodaysAppointments(selectedDoctor);
  
  // Tab 3: Waitlist
  const { data: waitlist, isLoading: waitlistLoading } = useQuery({
    queryKey: ['waitlist'],
    queryFn: () => waitlistService.getWaitlist()
  });

  const checkInMutation = useCheckIn();
  const startConsultationMutation = useStartConsultation();
  const completeConsultationMutation = useCompleteConsultation();

  const handleStatusChange = async (id: string, newStatus: AppointmentStatus) => {
    try {
      if (newStatus === AppointmentStatus.CHECKED_IN) {
        await checkInMutation.mutateAsync(id);
      } else if (newStatus === AppointmentStatus.IN_PROGRESS) {
        await startConsultationMutation.mutateAsync(id);
      } else if (newStatus === AppointmentStatus.COMPLETED) {
        await completeConsultationMutation.mutateAsync(id);
      } else {
        // Handle cancel/no-show etc.
      }
      message.success('Status updated');
    } catch (e) {
      message.error('Failed to update status');
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
          <div>{record.patient?.name || 'Unknown'}</div>
          <div style={{ fontSize: '12px', color: '#888' }}>MRN: {record.patient?.mrn}</div>
        </div>
      )
    },
    { title: 'Type', dataIndex: 'appointmentType', key: 'type' },
    { 
      title: 'Scheduled Time', 
      dataIndex: 'scheduledAt', 
      key: 'scheduledAt',
      render: (val: string) => val ? new Date(val).toLocaleString() : ''
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: AppointmentStatus) => (
        <Tag color={getStatusColor(status)}>{status}</Tag>
      )
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: any) => (
        <Space>
          {record.status === AppointmentStatus.SCHEDULED && (
            <Button size="small" onClick={() => handleStatusChange(record.id, AppointmentStatus.CHECKED_IN)}>Check In</Button>
          )}
          {record.status === AppointmentStatus.CHECKED_IN && (
            <Button size="small" type="primary" onClick={() => handleStatusChange(record.id, AppointmentStatus.IN_PROGRESS)}>Start</Button>
          )}
          {record.status === AppointmentStatus.IN_PROGRESS && (
            <Button size="small" type="primary" onClick={() => handleStatusChange(record.id, AppointmentStatus.COMPLETED)}>Complete</Button>
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
    { title: 'Department', key: 'department', render: (_: any, record: any) => record.department?.name || 'Any' },
    { title: 'Priority', dataIndex: 'priority', key: 'priority', render: (p: string) => <Tag color={p === 'URGENT' ? 'red' : 'blue'}>{p}</Tag> },
    { title: 'Status', dataIndex: 'status', key: 'status' },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: any) => (
        <Space>
          <Button size="small" type="primary">Fulfill</Button>
          <Button size="small" danger>Cancel</Button>
        </Space>
      )
    }
  ];

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
        <h2>Appointments & Clinic Flow</h2>
        <Button type="primary" onClick={() => router.push('/appointments/book')}>Book Appointment</Button>
      </div>

      <Card>
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <Tabs.TabPane tab="Appointments" key="1">
            <div style={{ marginBottom: 16 }}>
              <Space>
                <Select placeholder="Filter Status" style={{ width: 150 }} allowClear>
                  {Object.values(AppointmentStatus).map(s => <Option key={s} value={s}>{s}</Option>)}
                </Select>
                <DatePicker />
              </Space>
            </div>
            <Table 
              columns={apptColumns} 
              dataSource={appointments || []} 
              rowKey="id" 
              loading={appointmentsLoading}
            />
          </Tabs.TabPane>
          <Tabs.TabPane tab="Today's Clinic Flow" key="2">
            <div style={{ marginBottom: 16 }}>
              <Select value={selectedDoctor} onChange={setSelectedDoctor} style={{ width: 200 }}>
                <Option value="doc1">Dr. Smith (Oncology)</Option>
                <Option value="doc2">Dr. Jones (Surgery)</Option>
              </Select>
            </div>
            <ClinicFlowBoard 
              appointments={todaysAppointments || []} 
              doctorId={selectedDoctor} 
              onStatusChange={handleStatusChange} 
            />
          </Tabs.TabPane>
          <Tabs.TabPane tab="Waitlist" key="3">
            <Table 
              columns={waitlistColumns} 
              dataSource={waitlist || []} 
              rowKey="id" 
              loading={waitlistLoading}
            />
          </Tabs.TabPane>
        </Tabs>
      </Card>
    </div>
  );
}
