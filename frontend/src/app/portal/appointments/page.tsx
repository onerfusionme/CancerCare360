'use client';

import React, { useState } from 'react';
import { Card, Typography, Button, List, Tag, Space, Modal, Form, DatePicker, Select } from 'antd';
import { CalendarOutlined, ClockCircleOutlined, EnvironmentOutlined } from '@ant-design/icons';
import { usePortalAppointments } from '@/hooks/use-engagement';

const { Title, Text } = Typography;

export default function PortalAppointments() {
  const { data: appointments = [], isLoading } = usePortalAppointments();
  const [isModalVisible, setIsModalVisible] = useState(false);

  // Mock data since API might be empty initially
  const upcomingAppointments = [
    { id: '1', date: '2026-10-15', time: '10:00 AM', doctor: 'Dr. Sharma', location: 'Main Building, Floor 2', type: 'Consultation' },
    { id: '2', date: '2026-10-22', time: '09:00 AM', doctor: 'Infusion Center', location: 'Chemo Ward, Floor 3', type: 'Treatment' },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={3} style={{ margin: 0 }}>My Appointments</Title>
        <Button type="primary" onClick={() => setIsModalVisible(true)}>Book / Request Appointment</Button>
      </div>

      <Card title="Upcoming Appointments" style={{ marginBottom: 24 }}>
        <List
          itemLayout="horizontal"
          dataSource={upcomingAppointments}
          renderItem={item => (
            <List.Item
              actions={[<Button key="reschedule" type="link">Reschedule</Button>]}
            >
              <List.Item.Meta
                avatar={<CalendarOutlined style={{ fontSize: 24, color: '#1890ff', marginTop: 8 }} />}
                title={<Space><Text strong>{item.type}</Text> <Tag color="blue">{item.doctor}</Tag></Space>}
                description={
                  <Space direction="vertical" size={2}>
                    <Text type="secondary"><ClockCircleOutlined /> {item.date} at {item.time}</Text>
                    <Text type="secondary"><EnvironmentOutlined /> {item.location}</Text>
                  </Space>
                }
              />
            </List.Item>
          )}
        />
      </Card>

      <Modal
        title="Request Appointment"
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
      >
        <Form layout="vertical">
          <Form.Item label="Department / Doctor">
            <Select>
              <Select.Option value="oncology">Medical Oncology - Dr. Sharma</Select.Option>
              <Select.Option value="radiation">Radiation Oncology</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item label="Preferred Date">
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Button type="primary" block onClick={() => setIsModalVisible(false)}>Submit Request</Button>
        </Form>
      </Modal>
    </div>
  );
}
