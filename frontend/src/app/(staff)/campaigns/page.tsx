'use client';

import React, { useState } from 'react';
import { Table, Button, Tag, Space, Modal, Form, Input, Select, DatePicker, Row, Col, Card, Statistic, message, Typography } from 'antd';
import { PlusOutlined, RocketOutlined, MailOutlined, MessageOutlined, MobileOutlined, AppstoreOutlined } from '@ant-design/icons';
import { useCampaigns } from '@/hooks/use-engagement';
import { engagementService } from '@/services/engagement.service';
import { Campaign } from '@/types/engagement';

const { Title } = Typography;

export default function CampaignsPage() {
  const { data: campaigns = [], isLoading, refetch } = useCampaigns();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();

  const handleLaunch = async (id: string) => {
    try {
      await engagementService.executeCampaign(id);
      message.success('Campaign launched successfully');
      refetch();
    } catch (error) {
      message.error('Failed to launch campaign');
    }
  };

  const onFinish = async (values: any) => {
    try {
      await engagementService.createCampaign(values);
      message.success('Campaign created successfully');
      setIsModalVisible(false);
      form.resetFields();
      refetch();
    } catch (error) {
      message.error('Failed to create campaign');
    }
  };

  const channelIcons: Record<string, React.ReactNode> = {
    WhatsApp: <MessageOutlined style={{ color: '#25D366' }} />,
    SMS: <MobileOutlined style={{ color: '#1890ff' }} />,
    Email: <MailOutlined style={{ color: '#faad14' }} />,
    Portal: <AppstoreOutlined style={{ color: '#722ed1' }} />
  };

  const columns = [
    {
      title: 'Campaign Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => <Tag color="blue">{type}</Tag>,
    },
    {
      title: 'Channel',
      dataIndex: 'channel',
      key: 'channel',
      render: (channel: string) => (
        <Space>
          {channelIcons[channel]} {channel}
        </Space>
      ),
    },
    {
      title: 'Audience',
      dataIndex: 'audienceCriteria',
      key: 'audienceCriteria',
      render: (ac: any) => <span>{ac?.summary || 'All Patients'}</span>,
    },
    {
      title: 'Status',
      dataIndex: 'deliveryStatus',
      key: 'deliveryStatus',
      render: (status: string) => {
        const colors: Record<string, string> = {
          DRAFT: 'default',
          SCHEDULED: 'processing',
          IN_PROGRESS: 'warning',
          COMPLETED: 'success',
          FAILED: 'error'
        };
        return <Tag color={colors[status]}>{status}</Tag>;
      },
    },
    {
      title: 'Performance',
      key: 'stats',
      render: (_: any, record: Campaign) => (
        <span style={{ fontSize: '12px' }}>
          {record.stats?.sent || 0} Sent / {record.stats?.delivered || 0} Delivered
        </span>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: Campaign) => (
        <Space size="middle">
          {(record.deliveryStatus === 'DRAFT' || record.deliveryStatus === 'SCHEDULED') && (
            <Button type="primary" size="small" icon={<RocketOutlined />} onClick={() => handleLaunch(record.id)}>
              Launch
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <Title level={4}>Multichannel Campaign Management</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsModalVisible(true)}>
          Create Campaign
        </Button>
      </div>

      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card size="small">
            <Statistic title="Active Campaigns" value={campaigns.filter(c => c.deliveryStatus === 'IN_PROGRESS').length} />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small">
            <Statistic title="Messages Sent (MTD)" value={campaigns.reduce((acc, c) => acc + (c.stats?.sent || 0), 0)} />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small">
            <Statistic title="Avg Delivery Rate" value={98} suffix="%" />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small">
            <Statistic title="Click/Response Rate" value={45} suffix="%" />
          </Card>
        </Col>
      </Row>

      <Table
        dataSource={campaigns}
        columns={columns}
        rowKey="id"
        loading={isLoading}
      />

      <Modal
        title="Create New Campaign"
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={700}
      >
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item name="name" label="Campaign Name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="type" label="Campaign Type" rules={[{ required: true }]}>
            <Select>
              <Select.Option value="SCREENING">Screening</Select.Option>
              <Select.Option value="AWARENESS">Awareness</Select.Option>
              <Select.Option value="VACCINATION">Vaccination</Select.Option>
              <Select.Option value="FOLLOW_UP_REMINDER">Follow-up Reminder</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="channel" label="Channel" rules={[{ required: true }]}>
            <Select>
              <Select.Option value="WhatsApp">WhatsApp</Select.Option>
              <Select.Option value="SMS">SMS</Select.Option>
              <Select.Option value="Email">Email</Select.Option>
              <Select.Option value="Portal">Patient Portal</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name={['audienceCriteria', 'diagnosis']} label="Target Audience (Diagnosis)">
            <Select mode="multiple" placeholder="Select diagnosis categories">
              <Select.Option value="Breast Cancer">Breast Cancer</Select.Option>
              <Select.Option value="Lung Cancer">Lung Cancer</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="scheduledDate" label="Scheduled Date">
            <DatePicker showTime style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">Create</Button>
              <Button onClick={() => setIsModalVisible(false)}>Cancel</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
