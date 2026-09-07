'use client';

import React, { useState } from 'react';
import { Table, Button, Switch, Modal, Form, Select, Input, InputNumber, Card, Typography } from 'antd';
import { useCareGapRules } from '@/hooks/use-care-gaps';
import { careGapService } from '@/services/care-gap.service';

const { Title } = Typography;
const { Option } = Select;

export default function CareGapRulesAdminPage() {
  const { data: rules, isLoading, refetch } = useCareGapRules();
  const [modalOpen, setModalOpen] = useState(false);
  const [form] = Form.useForm();

  const handleToggle = async (id: string, isActive: boolean) => {
    await careGapService.toggleRule(id, isActive);
    refetch();
  };

  const handleCreate = async (values: any) => {
    await careGapService.createRule(values);
    setModalOpen(false);
    form.resetFields();
    refetch();
  };

  const columns = [
    { title: 'Rule Type', dataIndex: 'ruleType', key: 'ruleType' },
    { 
      title: 'Conditions', 
      dataIndex: 'conditions', 
      key: 'conditions',
      render: (cond: any) => <pre style={{ fontSize: 10, margin: 0 }}>{JSON.stringify(cond, null, 2)}</pre>
    },
    { title: 'Priority Weight', dataIndex: 'priorityWeight', key: 'weight' },
    {
      title: 'Active',
      dataIndex: 'isActive',
      key: 'active',
      render: (active: boolean, record: any) => (
        <Switch checked={active} onChange={(checked) => handleToggle(record.id, checked)} />
      )
    },
    {
      title: 'Actions',
      key: 'actions',
      render: () => <Button type="link">Edit</Button>
    }
  ];

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
        <Title level={2}>Care Gap Rules Administration</Title>
        <Button type="primary" onClick={() => setModalOpen(true)}>Create Rule</Button>
      </div>

      <Card>
        <Table columns={columns} dataSource={rules || []} rowKey="id" loading={isLoading} />
      </Card>

      <Modal
        title="Create Care Gap Rule"
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={() => form.submit()}
      >
        <Form form={form} layout="vertical" onFinish={handleCreate}>
          <Form.Item name="ruleType" label="Rule Type" rules={[{ required: true }]}>
            <Select>
              <Option value="OVERDUE_MILESTONE">Overdue Milestone</Option>
              <Option value="MISSED_APPOINTMENT">Missed Appointment</Option>
              <Option value="MISSING_LABS">Missing Labs</Option>
            </Select>
          </Form.Item>
          <Form.Item name="priorityWeight" label="Priority Weight (1-100)" rules={[{ required: true }]}>
            <InputNumber min={1} max={100} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="isActive" label="Active" valuePropName="checked">
            <Switch />
          </Form.Item>
          <Form.Item name="conditions" label="Conditions (JSON)" rules={[{ required: true }]}>
            <Input.TextArea rows={4} placeholder='{"daysOverdue": 30}' />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
