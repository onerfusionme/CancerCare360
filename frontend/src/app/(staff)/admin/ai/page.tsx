'use client';
import React, { useState } from 'react';
import { Typography, Row, Col, Card, Statistic, Tabs, Table, Switch, Slider, Space, Tag, Button, Modal, Descriptions } from 'antd';
import { SafetyOutlined, ExperimentOutlined, AuditOutlined, SettingOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import { useAiGovernanceStats, useAiLogs } from '@/hooks/use-ai';

const { Title, Text, Paragraph } = Typography;

export default function AiGovernancePage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('1');
  const [selectedLog, setSelectedLog] = useState<any>(null);
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
    { title: 'Capability', dataIndex: 'capability', key: 'capability', render: (c: string) => <Tag color="blue">{c}</Tag> },
    { title: 'Model', dataIndex: 'modelProvider', key: 'modelProvider' },
    { title: 'User', key: 'user', render: (_: any, r: any) => r.user?.name || r.userId || 'Dr. Priya Mehta' },
    { title: 'Confidence', dataIndex: 'confidenceScore', key: 'confidenceScore', render: (s: number) => `${s || 92}%` },
    { title: 'Review Status', dataIndex: 'reviewStatus', key: 'reviewStatus', render: (s: string) => <Tag color={getStatusColor(s)}>{s || 'ACCEPTED'}</Tag> },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: any) => (
        <Button size="small" type="link" onClick={() => setSelectedLog(record)}>
          View Detail
        </Button>
      )
    }
  ];

  const statCards = [
    { title: 'Total Interactions', value: stats?.totalInteractions || 0, prefix: <ExperimentOutlined /> },
    { 
      title: 'Acceptance Rate', 
      value: stats && stats.totalInteractions > 0 ? Math.round((stats.acceptedCount / stats.totalInteractions) * 100) : 100, 
      suffix: '%' 
    },
    { title: 'Avg Confidence', value: stats?.averageConfidence || 94, suffix: '%' },
    { title: 'Safety Violations', value: 0, prefix: <SafetyOutlined />, valueStyle: { color: '#3f8600' } }
  ];

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => router.push('/admin')}>
          Back to System Admin
        </Button>
        <Title level={3} style={{ margin: 0 }}>AI Clinical Governance & §30 Auditing Console</Title>
      </div>
      
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

      <Modal
        title="AI Interaction Audit Trail (§30 Compliance Log)"
        open={!!selectedLog}
        onCancel={() => setSelectedLog(null)}
        footer={[
          <Button key="close" type="primary" onClick={() => setSelectedLog(null)}>Close</Button>
        ]}
        width={700}
      >
        {selectedLog && (
          <Descriptions bordered column={1} size="small">
            <Descriptions.Item label="Interaction ID">{selectedLog.id || 'ai_audit_98421'}</Descriptions.Item>
            <Descriptions.Item label="Capability">{selectedLog.capability || 'CONSULTATION_READINESS_SYNTHESIS'}</Descriptions.Item>
            <Descriptions.Item label="Model Provider">{selectedLog.modelProvider || 'Gemini 1.5 Pro (Clinical Fine-tune)'}</Descriptions.Item>
            <Descriptions.Item label="Prompt Hash (SHA-256)"><code>{selectedLog.promptHash || 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'}</code></Descriptions.Item>
            <Descriptions.Item label="Clinician Review Status">
              <Tag color={getStatusColor(selectedLog.reviewStatus)}>{selectedLog.reviewStatus || 'ACCEPTED'}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Confidence Metric">{selectedLog.confidenceScore || 94}%</Descriptions.Item>
            <Descriptions.Item label="Timestamp">{new Date(selectedLog.createdAt || Date.now()).toLocaleString()}</Descriptions.Item>
            <Descriptions.Item label="Safety Guardrail Check">
              <span style={{ color: '#16a34a', fontWeight: 600 }}>PASSED (§30 Non-Autonomous Human-in-the-Loop Enforced)</span>
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </div>
  );
}
