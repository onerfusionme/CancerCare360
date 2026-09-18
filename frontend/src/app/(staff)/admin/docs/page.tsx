'use client';

import React from 'react';
import { Card, Typography, Space, Button, Alert, Tag } from 'antd';
import { ApiOutlined, ReloadOutlined, ExportOutlined, CheckCircleOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

export default function ApiDocsPage() {
  const [key, setKey] = React.useState(0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <Title level={3} style={{ margin: 0 }}>API & Platform Documentation</Title>
          <Text type="secondary">
            Interactive OpenAPI / Swagger reference for Care Gaps, Patient Navigation, and Continuity Endpoints
          </Text>
        </div>
        <Space>
          <Button 
            icon={<ReloadOutlined />} 
            onClick={() => setKey(prev => prev + 1)}
          >
            Reload Specs
          </Button>
          <Button 
            type="primary" 
            icon={<ExportOutlined />} 
            href="/api/docs" 
            target="_blank"
            style={{ background: '#0284c7', borderColor: '#0284c7' }}
          >
            Open in New Window
          </Button>
        </Space>
      </div>

      <Alert
        message="Unified SaaS API Architecture"
        description="All backend endpoints (Care Gaps, Barrier Assessment, Inter-role Handoff, Appointment Recovery, and Analytics) are seamlessly proxied through this single web application. You do not need to switch servers."
        type="info"
        showIcon
      />

      <Card bodyStyle={{ padding: 0, height: 'calc(100vh - 240px)', overflow: 'hidden' }}>
        <iframe
          key={key}
          src="http://localhost:3001/api/docs"
          style={{ width: '100%', height: '100%', border: 'none' }}
          title="CancerCare 360 Swagger Documentation"
        />
      </Card>
    </div>
  );
}
