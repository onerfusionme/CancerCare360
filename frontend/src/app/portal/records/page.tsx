'use client';

import React from 'react';
import { Typography, List, Card, Button, Tag, Space, Empty } from 'antd';
import { FilePdfOutlined, DownloadOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

export default function PortalRecords() {
  const records: any[] = [];

  return (
    <div>
      <Title level={3} style={{ marginBottom: 24 }}>Medical Records</Title>

      <Card className="glass-card" styles={{ body: { padding: 24 } }}>
        {records.length > 0 ? (
          <List
            itemLayout="horizontal"
            dataSource={records}
            renderItem={item => (
              <List.Item
                actions={[
                  <Button 
                    key="download" 
                    type="primary" 
                    icon={<DownloadOutlined />} 
                    disabled={!item.verified}
                  >
                    Download Secure PDF
                  </Button>
                ]}
              >
                <List.Item.Meta
                  avatar={<FilePdfOutlined style={{ fontSize: 32, color: '#ff4d4f' }} />}
                  title={<Space><Text strong>{item.name}</Text> {item.verified && <Tag color="green">Verified</Tag>}</Space>}
                  description={`${item.type} • ${item.date}`}
                />
              </List.Item>
            )}
          />
        ) : (
          <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No medical records or lab reports uploaded yet" />
        )}
      </Card>
    </div>
  );
}
