'use client';

import React, { useState } from 'react';
import { Form, Input, Button, Select, DatePicker, Card, Row, Col, Divider, Checkbox, Typography, message, Space } from 'antd';
import { useRouter } from 'next/navigation';
import { useCreatePatient } from '@/hooks/use-patients';
import { Gender } from '@/types/patient';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

export default function NewPatientPage() {
  const router = useRouter();
  const { mutateAsync: createPatient, isPending } = useCreatePatient();
  const [form] = Form.useForm();

  const onFinish = async (values: any) => {
    try {
      const data = {
        ...values,
        dateOfBirth: values.dateOfBirth.toISOString(),
      };
      const result = await createPatient(data);
      message.success('Patient registered successfully');
      router.push(`/patients/${result.id}`);
    } catch (error) {
      message.error('Failed to register patient');
    }
  };

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={3} style={{ margin: 0 }}>Register New Patient</Title>
        <Space>
          <Button onClick={() => router.back()}>Cancel</Button>
          <Button type="primary" onClick={() => form.submit()} loading={isPending}>Save Patient</Button>
        </Space>
      </div>

      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Card title="Personal Information" style={{ marginBottom: 24 }}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="firstName" label="First Name" rules={[{ required: true }]}>
                <Input placeholder="Enter first name" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="lastName" label="Last Name" rules={[{ required: true }]}>
                <Input placeholder="Enter last name" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="dateOfBirth" label="Date of Birth" rules={[{ required: true }]}>
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="gender" label="Gender" rules={[{ required: true }]}>
                <Select placeholder="Select gender">
                  {Object.values(Gender).map(g => <Option key={g} value={g}>{g}</Option>)}
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="mrn" label="MRN (Optional)">
                <Input placeholder="Leave blank to auto-generate" />
              </Form.Item>
            </Col>
          </Row>
        </Card>

        <Card title="Contact Information" style={{ marginBottom: 24 }}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="phoneNumber" label="Phone Number" rules={[{ required: true }]}>
                <Input placeholder="Enter phone number" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="email" label="Email Address">
                <Input placeholder="Enter email" type="email" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="address" label="Address">
            <TextArea rows={3} placeholder="Enter full address" />
          </Form.Item>
        </Card>

        <Card title="Emergency Contact" style={{ marginBottom: 24 }}>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="emergencyContactName" label="Name">
                <Input placeholder="Contact name" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="emergencyContactRelation" label="Relationship">
                <Input placeholder="e.g. Spouse" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="emergencyContactPhone" label="Phone">
                <Input placeholder="Contact phone" />
              </Form.Item>
            </Col>
          </Row>
        </Card>

        <Card title="Preferences">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="languagePreference" label="Preferred Language">
                <Select defaultValue="en">
                  <Option value="en">English</Option>
                  <Option value="hi">Hindi</Option>
                  <Option value="mr">Marathi</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Communication Channels">
                <Checkbox.Group options={['SMS', 'Email', 'WhatsApp']} defaultValue={['SMS']} />
              </Form.Item>
            </Col>
          </Row>
        </Card>
      </Form>
    </div>
  );
}
