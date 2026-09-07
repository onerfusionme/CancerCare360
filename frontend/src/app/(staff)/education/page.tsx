'use client';

import React, { useState } from 'react';
import { Table, Button, Tag, Space, Modal, Form, Input, Select, message, Typography } from 'antd';
import { PlusOutlined, EyeOutlined, CheckCircleOutlined, DeleteOutlined } from '@ant-design/icons';
import { useEducationArticles } from '@/hooks/use-engagement';
import { engagementService } from '@/services/engagement.service';
import { EducationContent } from '@/types/engagement';

const { Title } = Typography;
const { TextArea } = Input;

export default function EducationPage() {
  const { data: articles = [], isLoading, refetch } = useEducationArticles();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();

  const handlePublish = async (id: string) => {
    try {
      await engagementService.publishArticle(id);
      message.success('Article published successfully');
      refetch();
    } catch (error) {
      message.error('Failed to publish article');
    }
  };

  const handleArchive = async (id: string) => {
    try {
      await engagementService.archiveArticle(id);
      message.success('Article archived successfully');
      refetch();
    } catch (error) {
      message.error('Failed to archive article');
    }
  };

  const onFinish = async (values: any) => {
    try {
      await engagementService.createArticle(values);
      message.success('Article created successfully');
      setIsModalVisible(false);
      form.resetFields();
      refetch();
    } catch (error) {
      message.error('Failed to create article');
    }
  };

  const columns = [
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      filters: [
        { text: 'Nutrition', value: 'Nutrition' },
        { text: 'Side Effects', value: 'Side Effects' },
        { text: 'Staging', value: 'Staging' },
        { text: 'Emotional Wellness', value: 'Emotional Wellness' },
        { text: 'Financial Guidance', value: 'Financial Guidance' },
      ],
      onFilter: (value: any, record: EducationContent) => record.category === value,
    },
    {
      title: 'Language',
      dataIndex: 'language',
      key: 'language',
      render: (lang: string) => {
        const colors: Record<string, string> = { en: 'blue', hi: 'green', mr: 'orange' };
        const labels: Record<string, string> = { en: 'English', hi: 'हिंदी', mr: 'मराठी' };
        return <Tag color={colors[lang] || 'default'}>{labels[lang] || lang}</Tag>;
      },
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const colors: Record<string, string> = {
          DRAFT: 'default',
          IN_REVIEW: 'processing',
          APPROVED: 'cyan',
          PUBLISHED: 'success',
          ARCHIVED: 'error'
        };
        return <Tag color={colors[status]}>{status.replace('_', ' ')}</Tag>;
      },
    },
    {
      title: 'Published Date',
      dataIndex: 'publishedDate',
      key: 'publishedDate',
      render: (date: string) => date ? new Date(date).toLocaleDateString() : '-',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: EducationContent) => (
        <Space size="middle">
          <Button type="text" icon={<EyeOutlined />} title="Preview" />
          {record.status !== 'PUBLISHED' && (
            <Button type="text" icon={<CheckCircleOutlined />} onClick={() => handlePublish(record.id)} title="Publish" />
          )}
          {record.status !== 'ARCHIVED' && (
            <Button type="text" danger icon={<DeleteOutlined />} onClick={() => handleArchive(record.id)} title="Archive" />
          )}
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <Title level={4}>Education Content CMS</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsModalVisible(true)}>
          New Article
        </Button>
      </div>

      <Table
        dataSource={articles}
        columns={columns}
        rowKey="id"
        loading={isLoading}
      />

      <Modal
        title="Create New Article"
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={800}
      >
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item name="title" label="Title" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="category" label="Category" rules={[{ required: true }]}>
            <Select>
              <Select.Option value="Nutrition">Nutrition</Select.Option>
              <Select.Option value="Side Effects">Side Effects</Select.Option>
              <Select.Option value="Staging">Staging</Select.Option>
              <Select.Option value="Emotional Wellness">Emotional Wellness</Select.Option>
              <Select.Option value="Financial Guidance">Financial Guidance</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="language" label="Language" rules={[{ required: true }]}>
            <Select>
              <Select.Option value="en">English</Select.Option>
              <Select.Option value="hi">हिंदी (Hindi)</Select.Option>
              <Select.Option value="mr">मराठी (Marathi)</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="body" label="Content Body (Markdown)" rules={[{ required: true }]}>
            <TextArea rows={10} />
          </Form.Item>
          <Form.Item name="status" label="Initial Status" initialValue="DRAFT">
            <Select>
              <Select.Option value="DRAFT">Draft</Select.Option>
              <Select.Option value="IN_REVIEW">In Review</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">Save</Button>
              <Button onClick={() => setIsModalVisible(false)}>Cancel</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
