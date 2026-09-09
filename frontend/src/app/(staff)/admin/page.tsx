'use client';

import React from 'react';
import { Tabs, Typography, Space, Card, Table, Tag, Badge, Descriptions, Button, Row, Col } from 'antd';
import { SafetyCertificateOutlined, SettingOutlined, ArrowRightOutlined, RobotOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';

const { Title, Text } = Typography;
const { TabPane } = Tabs;

export default function AdminPage() {
  const router = useRouter();
  
  const depts = [
    { id: 1, name: 'Medical Oncology', clinics: 1, doctors: 1, status: 'Active' },
    { id: 2, name: 'Surgical Oncology', clinics: 1, doctors: 0, status: 'Active' },
    { id: 3, name: 'Radiation Oncology', clinics: 1, doctors: 0, status: 'Active' },
  ];

  const users = [
    { id: 'U001', name: 'Dr. Jane Oncologist', role: 'Oncologist', department: 'Medical Oncology', status: 'Active' },
    { id: 'U002', name: 'Clinical Nurse', role: 'Nurse', department: 'Medical Oncology', status: 'Active' },
    { id: 'U003', name: 'Hospital Registrar', role: 'Registrar', department: 'Patient Services', status: 'Active' },
    { id: 'U004', name: 'System Administrator', role: 'Admin', department: 'Administration', status: 'Active' },
  ];

  const templates: any[] = [];

  const renderRoleTag = (role: string) => {
    const colors: Record<string, string> = {
      'Oncologist': 'blue',
      'Nurse': 'cyan',
      'Coordinator': 'purple',
      'HOD': 'magenta',
      'Admin': 'volcano'
    };
    return <Tag color={colors[role] || 'default'}>{role}</Tag>;
  };

  return (
    <div style={{ padding: '24px' }}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <Title level={2} style={{ margin: 0 }}>System Administration</Title>
            <Text type="secondary">Manage hospital infrastructure, users, clinical protocols, and AI safety guardrails</Text>
          </div>
          <Space>
            <Button 
              type="primary" 
              icon={<SafetyCertificateOutlined />} 
              onClick={() => router.push('/admin/ai')}
              style={{ background: '#4f46e5', borderColor: '#4f46e5' }}
            >
              AI Governance & Audit Logs
            </Button>
            <Button 
              icon={<SettingOutlined />} 
              onClick={() => router.push('/gaps/rules')}
            >
              Protocol Rules
            </Button>
          </Space>
        </div>

        {/* Quick Access Highlights */}
        <Row gutter={[16, 16]}>
          <Col xs={24} md={12}>
            <Card 
              hoverable 
              onClick={() => router.push('/admin/ai')}
              style={{ borderLeft: '4px solid #4f46e5' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <RobotOutlined style={{ color: '#4f46e5', fontSize: 18 }} />
                    <span style={{ fontWeight: 700, fontSize: 15, color: '#0f172a' }}>AI Clinical Governance Console</span>
                  </div>
                  <Text type="secondary" style={{ display: 'block', marginTop: 4 }}>
                    Audit §30 non-autonomous decision support, confidence thresholds, and acceptance logs.
                  </Text>
                </div>
                <ArrowRightOutlined style={{ color: '#4f46e5' }} />
              </div>
            </Card>
          </Col>

          <Col xs={24} md={12}>
            <Card 
              hoverable 
              onClick={() => router.push('/gaps/rules')}
              style={{ borderLeft: '4px solid #0284c7' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <SettingOutlined style={{ color: '#0284c7', fontSize: 18 }} />
                    <span style={{ fontWeight: 700, fontSize: 15, color: '#0f172a' }}>Care Gap Rules Manager</span>
                  </div>
                  <Text type="secondary" style={{ display: 'block', marginTop: 4 }}>
                    Configure triggers, days overdue thresholds, and escalation weights for missed milestones.
                  </Text>
                </div>
                <ArrowRightOutlined style={{ color: '#0284c7' }} />
              </div>
            </Card>
          </Col>
        </Row>

        <Card bordered={false}>
          <Tabs defaultActiveKey="1" size="large">
            
            <TabPane tab="Departments & Clinics" key="1">
              <Table 
                dataSource={depts} 
                rowKey="id"
                pagination={false}
                columns={[
                  { title: 'Department', dataIndex: 'name', key: 'name' },
                  { title: 'Clinic Rooms', dataIndex: 'clinics', key: 'clinics' },
                  { title: 'Active Doctors', dataIndex: 'doctors', key: 'doctors' },
                  { title: 'Status', dataIndex: 'status', key: 'status', render: (val) => <Badge status="processing" text={val} /> }
                ]}
              />
            </TabPane>

            <TabPane tab="User & Role Management" key="2">
              <Table 
                dataSource={users} 
                rowKey="id"
                columns={[
                  { title: 'User ID', dataIndex: 'id', key: 'id' },
                  { title: 'Name', dataIndex: 'name', key: 'name' },
                  { title: 'Role', dataIndex: 'role', key: 'role', render: renderRoleTag },
                  { title: 'Department', dataIndex: 'department', key: 'department' },
                  { title: 'Status', dataIndex: 'status', key: 'status', render: (val) => <Badge status={val === 'Active' ? 'success' : 'default'} text={val} /> }
                ]}
              />
            </TabPane>

            <TabPane tab="Milestone Templates" key="3">
              <Table 
                dataSource={templates} 
                rowKey="id"
                columns={[
                  { title: 'Template ID', dataIndex: 'id', key: 'id' },
                  { title: 'Protocol Name', dataIndex: 'name', key: 'name' },
                  { title: 'Milestone Steps', dataIndex: 'steps', key: 'steps' },
                  { title: 'Last Updated', dataIndex: 'lastUpdated', key: 'lastUpdated' },
                ]}
              />
            </TabPane>

            <TabPane tab="System Health & Audit Logs" key="4">
              <Descriptions bordered column={1} size="middle">
                <Descriptions.Item label="PostgreSQL Database">
                  <Badge status="success" text="Operational (Latency: 12ms)" />
                </Descriptions.Item>
                <Descriptions.Item label="Redis Cache">
                  <Badge status="success" text="Operational (Hit Rate: 94%)" />
                </Descriptions.Item>
                <Descriptions.Item label="Elasticsearch">
                  <Badge status="success" text="Operational (Indexing OK)" />
                </Descriptions.Item>
                <Descriptions.Item label="MinIO Document Store">
                  <Badge status="success" text="Operational (Storage: 45% used)" />
                </Descriptions.Item>
                <Descriptions.Item label="ClamAV Scanner">
                  <Badge status="success" text="Operational (Definitions Up-to-date)" />
                </Descriptions.Item>
                <Descriptions.Item label="AI Prediction Services">
                  <Badge status="warning" text="Degraded (High Latency: 850ms)" />
                </Descriptions.Item>
              </Descriptions>
            </TabPane>
            
          </Tabs>
        </Card>
      </Space>
    </div>
  );
}
