'use client';

import React from 'react';
import { Card, Button, Typography, Space, Tag, Row, Col } from 'antd';
import { Appointment, AppointmentStatus } from '@/types/appointment';

const { Title, Text } = Typography;

interface ClinicFlowBoardProps {
  appointments: Appointment[];
  doctorId: string;
  onStatusChange: (id: string, newStatus: AppointmentStatus) => void;
}

export default function ClinicFlowBoard({ appointments, doctorId, onStatusChange }: ClinicFlowBoardProps) {
  const scheduled = appointments.filter(a => a.status === AppointmentStatus.SCHEDULED || a.status === AppointmentStatus.CONFIRMED);
  const waiting = appointments.filter(a => a.status === AppointmentStatus.CHECKED_IN);
  const inConsultation = appointments.filter(a => a.status === AppointmentStatus.IN_PROGRESS);
  const completed = appointments.filter(a => a.status === AppointmentStatus.COMPLETED);

  const renderCard = (appointment: Appointment, actions: React.ReactNode) => (
    <Card size="small" style={{ marginBottom: 8, borderColor: '#d9d9d9' }} key={appointment.id}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
        <Text strong>{appointment.patient?.name || 'Unknown Patient'}</Text>
        <Text type="secondary">{appointment.scheduledAt ? new Date(appointment.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}</Text>
      </div>
      <div style={{ marginBottom: 8 }}>
        <Text type="secondary" style={{ fontSize: '12px' }}>MRN: {appointment.patient?.mrn || 'N/A'}</Text>
      </div>
      <Tag color="blue">{appointment.appointmentType}</Tag>
      {appointment.waitingDurationMinutes !== undefined && appointment.status === AppointmentStatus.CHECKED_IN && (
        <Tag color="orange" style={{ marginLeft: 4 }}>Wait: {appointment.waitingDurationMinutes}m</Tag>
      )}
      <div style={{ marginTop: 12 }}>
        {actions}
      </div>
    </Card>
  );

  return (
    <Row gutter={16}>
      <Col span={6}>
        <div style={{ background: '#e6f7ff', padding: 12, borderRadius: 8, minHeight: 600 }}>
          <Title level={5}>Scheduled ({scheduled.length})</Title>
          {scheduled.map(a => renderCard(a, (
            <Button size="small" type="primary" block onClick={() => onStatusChange(a.id, AppointmentStatus.CHECKED_IN)}>Check In</Button>
          )))}
        </div>
      </Col>
      <Col span={6}>
        <div style={{ background: '#fff7e6', padding: 12, borderRadius: 8, minHeight: 600 }}>
          <Title level={5}>Checked In / Waiting ({waiting.length})</Title>
          {waiting.map(a => renderCard(a, (
            <Space direction="vertical" style={{ width: '100%' }}>
              <Button size="small" type="primary" block onClick={() => onStatusChange(a.id, AppointmentStatus.IN_PROGRESS)}>Start Consult</Button>
              <Button size="small" danger block onClick={() => onStatusChange(a.id, AppointmentStatus.NO_SHOW)}>No Show</Button>
            </Space>
          )))}
        </div>
      </Col>
      <Col span={6}>
        <div style={{ background: '#f6ffed', padding: 12, borderRadius: 8, minHeight: 600 }}>
          <Title level={5}>In Consultation ({inConsultation.length})</Title>
          {inConsultation.map(a => renderCard(a, (
            <Button size="small" type="primary" block onClick={() => onStatusChange(a.id, AppointmentStatus.COMPLETED)}>Complete</Button>
          )))}
        </div>
      </Col>
      <Col span={6}>
        <div style={{ background: '#f5f5f5', padding: 12, borderRadius: 8, minHeight: 600 }}>
          <Title level={5}>Completed ({completed.length})</Title>
          {completed.map(a => renderCard(a, (
            <Text type="secondary" style={{ fontSize: '12px' }}>Completed</Text>
          )))}
        </div>
      </Col>
    </Row>
  );
}
