'use client';

import React from 'react';
import { Typography, Card, Form, Switch, Select, Button, Divider, Alert, Space } from 'antd';
import { WarningOutlined, SafetyCertificateOutlined } from '@ant-design/icons';
import { useUpdatePreferences } from '@/hooks/use-engagement';

const { Title, Text } = Typography;

export default function PortalSettings() {
  const { mutate: updatePreferences, isPending } = useUpdatePreferences();

  const handleSave = (values: any) => {
    updatePreferences({
      preferredLanguage: values.language,
      communicationPreferences: {
        whatsapp: values.whatsapp,
        sms: values.sms,
        email: values.email
      }
    });
  };

  return (
    <div>
      <Title level={3} style={{ marginBottom: 24 }}>Settings & Privacy</Title>

      <Card title={<span><SafetyCertificateOutlined /> DPDP Compliance & Consent</span>} style={{ marginBottom: 24 }}>
        <Alert
          message="Your Data is Secure"
          description="We comply with the Digital Personal Data Protection (DPDP) Act. You control how we communicate with you and use your data."
          type="success"
          showIcon
          style={{ marginBottom: 24 }}
        />

        <Form layout="vertical" onFinish={handleSave} initialValues={{ language: 'en', whatsapp: true, sms: true, email: false }}>
          <Title level={5}>Communication Preferences</Title>
          <Form.Item name="whatsapp" valuePropName="checked">
            <Switch /> <Text>WhatsApp Updates (Appointments, Reminders)</Text>
          </Form.Item>
          <Form.Item name="sms" valuePropName="checked">
            <Switch /> <Text>SMS Notifications</Text>
          </Form.Item>
          <Form.Item name="email" valuePropName="checked">
            <Switch /> <Text>Email Digests & Reports</Text>
          </Form.Item>

          <Divider />

          <Title level={5}>Language Preferences</Title>
          <Form.Item name="language" label="Preferred Language for Communications">
            <Select style={{ width: 200 }}>
              <Select.Option value="en">English</Select.Option>
              <Select.Option value="hi">हिंदी (Hindi)</Select.Option>
              <Select.Option value="mr">मराठी (Marathi)</Select.Option>
            </Select>
          </Form.Item>

          <Divider />

          <Title level={5}>ABDM Integration</Title>
          <div style={{ marginBottom: 24 }}>
            <Text>ABHA ID: </Text><Text strong>Linked (XX-XXXX-XXXX-XX)</Text>
            <Button type="link">Unlink</Button>
          </div>

          <Space>
            <Button type="primary" htmlType="submit" loading={isPending}>Save Preferences</Button>
          </Space>
        </Form>
      </Card>

      <Card title="Danger Zone" bordered={false} style={{ border: '1px solid #ff4d4f' }}>
        <Space direction="vertical" style={{ width: '100%' }}>
          <Text>Revoking consent will stop all digital communications and unlink your health records.</Text>
          <Button danger icon={<WarningOutlined />}>Revoke All Digital Consent</Button>
        </Space>
      </Card>
    </div>
  );
}
