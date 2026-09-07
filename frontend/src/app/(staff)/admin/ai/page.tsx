'use client';
import React, { useState } from 'react';
import { Typography, Row, Col, Card, Statistic, Tabs, Table, Switch, Slider, Space, Tag, Button } from 'antd';
import { SafetyOutlined, ExperimentOutlined, AuditOutlined, SettingOutlined } from '@ant-design/icons';
import { useAiGovernanceStats, useAiLogs } from '@/hooks/use-ai';

const { Title, Text, Paragraph } = Typography;

export default function AiGovernancePage() {
  const [activeTab, setActiveTab] = useState('1');
  const { data: stats, isLoading: statsLoading } = useAiGovernanceStats();
  const { data: logs, isLoading: logsLoading } = useAiLogs();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACCEPTED': return 'green';
      case 'REJECTED': return 'red';
      case 'MODIFIED': return 'orange';
      default: return 'default';
    }
  };

  const logColumns = [
    { title: 'Timestamp', dataIndex: 'createdAt', key: 'createdAt', render: (d: string) => new Date(d).toLocaleString() },
    { title: 'Capability', dataIndex: 'capability', key: 'capability', render: (c: string) => <Tag>{c}</Tag> },
    { title: 'Model', dataIndex: 'modelProvider', key: 'modelProvider' },
    { title: 'User', key: 'user', render: (_: any, r: any) => r.user?.name || r.userId },
    { title: 'Confidence', dataIndex: 'confidenceScore', key: 'confidenceScore', render: (s: number) => `${s}%` },
    { title: 'Review Status', dataIndex: 'reviewStatus', key: 'reviewStatus', render: (s: string) => <Tag color={getStatusColor(s)}>{s || 'PENDING'}</Tag> },
    {
      title: 'Actions',
      key: 'actions',
      render: () => <Button size="small">View Detail</Button>
    }
  ];

  const statCards = [
    { title: 'Total Interactions', value: stats?.totalInteractions || 0, prefix: <ExperimentOutlined /> },
    { title: 'Acceptance Rate', value: stats ? Math.round((stats.acceptedCount / stats.totalInteractions) * 100) : 0, suffix: '%' },
    { title: 'Avg Confidence', value: stats?.averageConfidence || 0, suffix: '%' },
    { title: 'Safety Violations', value: 0, prefix: <SafetyOutlined />, valueStyle: { color: '#3f8600' } }
  ];

  return (
    <div style={{ padding: 24 }}>
      <Title level={2}>AI Governance & Auditing</Title>
      
      <Row gutter={16} style={{ marginBottom: 24 }}>
        {statCards.map((s, i) => (
          <Col span={6} key={i}>
            <Card>
              <Statistic 
                title={s.title} 
                value={s.value} 
                prefix={s.prefix} 
                suffix={s.suffix} 
                valueStyle={s.valueStyle}
                loading={statsLoading} 
              />
            </Card>
          </Col>
        ))}
      </Row>

      <Card>
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <Tabs.TabPane tab={<span><AuditOutlined /> AI Interaction Audit Logs</span>} key="1">
            <div style={{ marginBottom: 16 }}>
              <Space>
                <Button>Filter by Capability</Button>
                <Button>Filter by Status</Button>
              </Space>
            </div>
            <Table 
              dataSource={logs || []} 
              columns={logColumns} 
              rowKey="id" 
              loading={logsLoading} 
            />
          </Tabs.TabPane>
          <Tabs.TabPane tab={<span><SettingOutlined /> Capability Governance</span>} key="2">
            <Row gutter={24}>
              <Col span={12}>
                <Card title="Active Capabilities" size="small" style={{ marginBottom: 16 }}>
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Text>Document Extraction</Text>
                      <Switch defaultChecked />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Text>Pre-consultation Summaries</Text>
                      <Switch defaultChecked />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Text>Care-gap Explanations</Text>
                      <Switch defaultChecked />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Text>Multilingual Drafting</Text>
                      <Switch defaultChecked />
                    </div>
                  </Space>
                </Card>
                <Card title="Confidence Thresholds" size="small">
                  <Text>Minimum confidence for auto-suggestions (%)</Text>
                  <Slider defaultValue={75} min={50} max={99} />
                </Card>
              </Col>
              <Col span={12}>
                <Card title="Clinical Safety Policy (Non-Autonomous)" size="small" type="inner">
                  <Paragraph>
                    This platform adheres to strict clinical safety boundaries for AI deployment:
                  </Paragraph>
                  <ul>
                    <li><Text strong>No Autonomous Diagnosis:</Text> AI may extract and summarize, but a licensed clinician must verify all diagnostic data.</li>
                    <li><Text strong>No Autonomous Staging:</Text> TNM staging computations require explicit clinician sign-off.</li>
                    <li><Text strong>No Unverified Prescribing:</Text> Treatment recommendations act as decision support only.</li>
                  </ul>
                  <Paragraph style={{ color: '#888', marginTop: 16, fontSize: 12 }}>
                    Last updated: System initialization
                  </Paragraph>
                </Card>
              </Col>
            </Row>
          </Tabs.TabPane>
        </Tabs>
      </Card>
    </div>
  );
}
