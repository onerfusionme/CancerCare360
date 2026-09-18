'use client';

import React, { useState } from 'react';
import { Card, Typography, Button, List, Tag, Space, Modal, Form, DatePicker, Select, Empty } from 'antd';
import { CalendarOutlined, ClockCircleOutlined, EnvironmentOutlined } from '@ant-design/icons';
import { usePortalAppointments } from '@/hooks/use-engagement';

const { Title, Text } = Typography;

export default function PortalAppointments() {
  const { data: appointments = [], isLoading } = usePortalAppointments();
  const [isModalVisible, setIsModalVisible] = useState(false);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={3} style={{ margin: 0 }}>My Appointments</Title>
        <Button type="primary" onClick={() => setIsModalVisible(true)}>Book / Request Appointment</Button>
      </div>

      <Card className="glass-card" title="Upcoming Appointments" style={{ marginBottom: 24 }} styles={{ body: { padding: 24 } }}>
        {appointments.length > 0 ? (
          <List
            itemLayout="horizontal"
            dataSource={appointments}
            renderItem={(item: any) => (
              <List.Item
                actions={[<Button key="reschedule" type="link">Reschedule</Button>]}
              >
                <List.Item.Meta
                  avatar={<CalendarOutlined style={{ fontSize: 24, color: '#1890ff', marginTop: 8 }} />}
                  title={<Space><Text strong>{item.appointmentType || 'Consultation'}</Text> <Tag color="blue">{item.doctor?.name || 'Oncologist'}</Tag></Space>}
                  description={
                    <Space direction="vertical" size={2}>
                      <Text type="secondary"><ClockCircleOutlined /> {item.scheduledAt ? new Date(item.scheduledAt).toLocaleString() : 'Scheduled'}</Text>
                      <Text type="secondary"><EnvironmentOutlined /> {item.room || 'Consultation Suite'}</Text>
                    </Space>
                  }
                />
              </List.Item>
            )}
          />
        ) : (
          <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="You have no upcoming appointments scheduled" />
        )}
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
