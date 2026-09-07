'use client';

import React from 'react';
import { Typography, List, Card, Button, Tag, Space } from 'antd';
import { FilePdfOutlined, DownloadOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

export default function PortalRecords() {
  const records = [
    { id: '1', name: 'Complete Blood Count (CBC)', date: 'Oct 01, 2026', type: 'Lab Report', verified: true },
    { id: '2', name: 'Liver Function Test', date: 'Oct 01, 2026', type: 'Lab Report', verified: true },
    { id: '3', name: 'PET CT Scan Report', date: 'Aug 12, 2026', type: 'Imaging', verified: true },
    { id: '4', name: 'Biopsy Report', date: 'Aug 05, 2026', type: 'Pathology', verified: true },
  ];

  return (
    <div>
      <Title level={3} style={{ marginBottom: 24 }}>Medical Records</Title>

      <Card>
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
      </Card>
    </div>
  );
}
