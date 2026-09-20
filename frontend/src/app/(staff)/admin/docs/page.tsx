'use client';

import React, { useState } from 'react';
import { Card, Typography, Space, Button, Alert, Spin } from 'antd';
import { ReloadOutlined, ExportOutlined, FileTextOutlined, ApiOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

export default function ApiDocsPage() {
  const [key, setKey] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <Title level={3} style={{ margin: 0 }}>API & Platform Documentation</Title>
          <Text type="secondary">
            Interactive OpenAPI 3.0 / Swagger reference for CancerCare360 Oncology Command Center Endpoints
          </Text>
        </div>
        <Space>
          <Button 
            icon={<ReloadOutlined />} 
            onClick={() => {
              setIsLoading(true);
              setKey(prev => prev + 1);
            }}
          >
            Reload Specs
          </Button>
          <Button 
            icon={<FileTextOutlined />} 
            href="/api/docs-json" 
            target="_blank"
          >
            OpenAPI Spec (JSON)
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
        description="All CancerCare360 backend micro-modules (RBAC, Second Opinion Hub, Care Gaps, CareRelief Aid, CareCircles, Appointments, and AI Governance) are unified under the OpenAPI 3.0 specification."
        type="info"
        showIcon
      />

      <Card 
        styles={{ body: { padding: 0, height: 'calc(100vh - 240px)', position: 'relative', overflow: 'hidden' } }}
        className="glass-card"
      >
        {isLoading && (
          <div 
            style={{ 
              position: 'absolute', 
              inset: 0, 
              display: 'flex', 
              flexDirection: 'column',
              alignItems: 'center', 
              justifyContent: 'center', 
              background: 'rgba(255, 255, 255, 0.7)',
              zIndex: 10,
              gap: 12,
            }}
          >
            <Spin size="large" />
            <Text type="secondary">Loading CancerCare360 Swagger Console...</Text>
          </div>
        )}
        <iframe
          key={key}
          src="/api/docs"
          onLoad={() => setIsLoading(false)}
          style={{ width: '100%', height: '100%', border: 'none', background: '#fafafa' }}
          title="CancerCare 360 Swagger Documentation"
        />
      </Card>
    </div>
  );
}
