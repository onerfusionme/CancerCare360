'use client';
import React from 'react';
import { Form, Select, DatePicker, Input, Button, Typography, message, Card } from 'antd';
import { useRouter } from 'next/navigation';
import { useCreateInvestigation } from '@/hooks/use-investigations';
import { InvestigationType } from '@/types/investigation';

const { Title } = Typography;

export default function NewInvestigationPage() {
  const router = useRouter();
  const [form] = Form.useForm();
  const { mutateAsync: createInvestigation, isPending } = useCreateInvestigation();

  const onFinish = async (values: any) => {
    try {
      await createInvestigation({
        patientId: values.patientId,
        journeyId: values.journeyId,
        type: values.type,
        scheduledDate: values.scheduledDate?.toISOString(),
        notes: values.notes
      });
      message.success('Investigation ordered successfully');
      router.push('/investigations');
    } catch (error) {
      message.error('Failed to order investigation');
    }
  };

  return (
    <div style={{ padding: 24 }}>
      <Title level={2}>New Investigation</Title>
      <Card style={{ maxWidth: 600 }}>
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item name="patientId" label="Patient" rules={[{ required: true }]}>
            <Select placeholder="Search Patient" options={[{ value: 'p1', label: 'John Doe' }]} />
          </Form.Item>
          <Form.Item name="journeyId" label="Journey" rules={[{ required: true }]}>
            <Select placeholder="Select Journey" options={[{ value: 'j1', label: 'Breast Cancer Treatment' }]} />
          </Form.Item>
          <Form.Item name="type" label="Investigation Type" rules={[{ required: true }]}>
            <Select placeholder="Select Type">
              {Object.values(InvestigationType).map(t => <Select.Option key={t} value={t}>{t.replace(/_/g, ' ')}</Select.Option>)}
            </Select>
          </Form.Item>
          <Form.Item name="scheduledDate" label="Scheduled Date">
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="notes" label="Notes">
            <Input.TextArea rows={4} />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={isPending}>Order Investigation</Button>
            <Button style={{ marginLeft: 8 }} onClick={() => router.back()}>Cancel</Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}
