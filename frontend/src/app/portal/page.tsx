'use client';

import React from 'react';
import { Card, Row, Col, Typography, Button, Badge, Alert, Space } from 'antd';
import { CalendarOutlined, HistoryOutlined, FileTextOutlined, BookOutlined, SafetyCertificateOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';

const { Title, Text } = Typography;

export default function PortalDashboard() {
  const router = useRouter();

  const nextAppointment = {
    date: 'Oct 15, 2026',
    time: '10:00 AM',
    doctor: 'Dr. Sharma',
    department: 'Medical Oncology'
  };

  const patient = {
    firstName: 'Ramesh',
    stage: 'Active Treatment - Cycle 3 of 6'
  };

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Title level={2}>Hello, {patient.firstName}</Title>
        <Badge status="processing" text={<Text strong style={{ color: '#1890ff' }}>{patient.stage}</Text>} />
      </div>

      <Alert 
        message="Daily Wellness Tip" 
        description="Staying hydrated is especially important during your chemotherapy cycles. Aim for at least 8-10 glasses of water today." 
        type="info" 
        showIcon 
        style={{ marginBottom: 24 }}
      />

      <Row gutter={[16, 16]}>
        <Col xs={24} md={12}>
          <Card title="Next Appointment" style={{ height: '100%' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <Text strong style={{ fontSize: '18px' }}>{nextAppointment.date} at {nextAppointment.time}</Text>
              <Text>{nextAppointment.doctor} - {nextAppointment.department}</Text>
              <Button type="default" style={{ marginTop: '16px', width: 'fit-content' }}>Request Reschedule</Button>
            </div>
          </Card>
        </Col>

        <Col xs={24} md={12}>
          <Card title="Quick Actions" style={{ height: '100%' }}>
            <Row gutter={[8, 8]}>
              <Col span={12}>
                <Button block icon={<CalendarOutlined />} onClick={() => router.push('/portal/appointments')} style={{ height: 'auto', padding: '16px 0' }}>
                  <div style={{ marginTop: 8 }}>My Appointments</div>
                </Button>
              </Col>
              <Col span={12}>
                <Button block icon={<HistoryOutlined />} onClick={() => router.push('/portal/journey')} style={{ height: 'auto', padding: '16px 0' }}>
                  <div style={{ marginTop: 8 }}>My Care Timeline</div>
                </Button>
              </Col>
              <Col span={12}>
                <Button block icon={<FileTextOutlined />} onClick={() => router.push('/portal/records')} style={{ height: 'auto', padding: '16px 0' }}>
                  <div style={{ marginTop: 8 }}>Medical Records</div>
                </Button>
              </Col>
              <Col span={12}>
                <Button block icon={<BookOutlined />} onClick={() => router.push('/portal/education')} style={{ height: 'auto', padding: '16px 0' }}>
                  <div style={{ marginTop: 8 }}>Learn About My Care</div>
                </Button>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
