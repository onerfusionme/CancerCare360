'use client';

import React, { useState } from 'react';
import { Table, Button, Switch, Modal, Form, Select, Input, InputNumber, Card, Typography, Space, message, Popconfirm } from 'antd';
import { ArrowLeftOutlined, PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import { useCareGapRules } from '@/hooks/use-care-gaps';
import { careGapService } from '@/services/care-gap.service';

const { Title, Text } = Typography;
const { Option } = Select;

export default function CareGapRulesAdminPage() {
  const router = useRouter();
  const { data: rules, isLoading, refetch } = useCareGapRules();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<any>(null);
  const [form] = Form.useForm();

  const handleToggle = async (id: string, isActive: boolean) => {
    try {
      await careGapService.toggleRule(id, isActive);
      message.success(`Rule ${isActive ? 'activated' : 'deactivated'}`);
      refetch();
    } catch {
      message.error('Failed to update rule status');
    }
  };

  const openCreateModal = () => {
    setEditingRule(null);
    form.resetFields();
    form.setFieldsValue({ isActive: true, priorityWeight: 80, ruleType: 'MISSED_APPOINTMENT', conditions: '{\n  "daysOverdue": 14\n}' });
    setModalOpen(true);
  };

  const openEditModal = (record: any) => {
    setEditingRule(record);
    form.setFieldsValue({
      ruleType: record.ruleType,
      priorityWeight: record.priorityWeight || 50,
      isActive: record.isActive,
      conditions: typeof record.conditions === 'object' ? JSON.stringify(record.conditions, null, 2) : (record.conditions || '{}')
    });
    setModalOpen(true);
  };

  const handleSave = async (values: any) => {
    try {
      let parsedCond = values.conditions;
      if (typeof values.conditions === 'string') {
        try {
          parsedCond = JSON.parse(values.conditions);
        } catch {
          parsedCond = { description: values.conditions };
        }
      }

      if (editingRule) {
        await careGapService.updateRule(editingRule.id, {
          ...values,
          conditions: parsedCond
        });
      } else {
        await careGapService.createRule({
          ...values,
          conditions: parsedCond
        });
      }
      message.success(editingRule ? 'Rule updated successfully' : 'Rule created successfully');
      setModalOpen(false);
      form.resetFields();
      refetch();
    } catch {
      message.error('Failed to save care gap rule');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await careGapService.deleteRule(id);
      message.success('Protocol rule deleted successfully');
      refetch();
    } catch {
      message.error('Failed to delete rule');
    }
  };

  const columns = [
    { title: 'Rule Type', dataIndex: 'ruleType', key: 'ruleType', render: (t: string) => <strong>{t}</strong> },
    { 
      title: 'Conditions', 
      dataIndex: 'conditions', 
      key: 'conditions',
      render: (cond: any) => (
        <pre style={{ fontSize: 11, margin: 0, background: '#f1f5f9', padding: '4px 8px', borderRadius: 4 }}>
          {JSON.stringify(cond, null, 2)}
        </pre>
      )
    },
    { title: 'Priority Weight', dataIndex: 'priorityWeight', key: 'weight' },
    {
      title: 'Active Status',
      dataIndex: 'isActive',
      key: 'active',
      render: (active: boolean, record: any) => (
        <Switch checked={active} onChange={(checked) => handleToggle(record.id, checked)} />
      )
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: any) => (
        <Space size="small">
          <Button type="link" icon={<EditOutlined />} onClick={() => openEditModal(record)}>
            Edit
          </Button>
          <Popconfirm
            title="Delete Care Gap Rule"
            description="Are you sure you want to delete this protocol rule?"
            onConfirm={() => handleDelete(record.id)}
            okText="Yes, Delete"
            cancelText="No"
            okButtonProps={{ danger: true }}
          >
            <Button type="link" danger icon={<DeleteOutlined />}>
              Delete
            </Button>
          </Popconfirm>
        </Space>
      )
    }
  ];

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <Space>
          <Button icon={<ArrowLeftOutlined />} onClick={() => router.push('/gaps')}>
            Back to Care Gaps Desk
          </Button>
          <Title level={3} style={{ margin: 0 }}>Care Gap Rules & Protocol Administration</Title>
        </Space>
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreateModal}>
          Create Protocol Rule
        </Button>
      </div>

      <Card>
        <Table columns={columns} dataSource={rules || []} rowKey="id" loading={isLoading} />
      </Card>

      <Modal
        title={editingRule ? "Edit Care Gap Rule" : "Create Care Gap Rule"}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={() => form.submit()}
        okText="Save Rule"
      >
        <Form form={form} layout="vertical" onFinish={handleSave}>
          <Form.Item name="ruleType" label="Rule Type" rules={[{ required: true }]}>
            <Select>
              <Option value="OVERDUE_MILESTONE">Overdue Milestone</Option>
              <Option value="MISSED_APPOINTMENT">Missed Appointment</Option>
              <Option value="MISSING_LABS">Missing Labs</Option>
              <Option value="HIGH_RISK_DROPOUT">High Risk Dropout</Option>
            </Select>
          </Form.Item>
          <Form.Item name="priorityWeight" label="Priority Weight (1-100)" rules={[{ required: true }]}>
            <InputNumber min={1} max={100} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="isActive" label="Rule Enabled" valuePropName="checked">
            <Switch />
          </Form.Item>
          <Form.Item name="conditions" label="Trigger Conditions (JSON)" rules={[{ required: true, message: 'Please provide valid JSON conditions' }]}>
            <Input.TextArea rows={4} placeholder='{"daysOverdue": 14}' />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
