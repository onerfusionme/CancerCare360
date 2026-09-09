'use client';

import React from 'react';
import { Typography, Timeline, Card, Tag, Empty } from 'antd';
import { CheckCircleOutlined, ClockCircleOutlined, SyncOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

export default function PortalJourney() {
  const journeySteps: any[] = [];

  return (
    <div>
      <Title level={3} style={{ marginBottom: 24 }}>My Care Timeline</Title>
      
      <Card>
        {journeySteps.length > 0 ? (
          <Timeline
            mode="left"
            items={journeySteps.map(step => ({
              color: step.status === 'completed' ? 'green' : step.status === 'in-progress' ? 'blue' : 'gray',
              dot: step.status === 'completed' ? <CheckCircleOutlined /> : step.status === 'in-progress' ? <SyncOutlined spin /> : <ClockCircleOutlined />,
              children: (
                <div style={{ paddingBottom: '16px' }}>
                  <Text strong style={{ fontSize: '16px' }}>{step.title}</Text>
                  <br />
                  <Text type="secondary" style={{ fontSize: '13px' }}>{step.date}</Text>
                  <div style={{ marginTop: '8px' }}>
                    {step.status === 'completed' && <Tag color="success">Completed</Tag>}
                    {step.status === 'in-progress' && <Tag color="processing">Next Step</Tag>}
                    {step.status === 'pending' && <Tag color="default">Upcoming</Tag>}
                  </div>
                  <p style={{ marginTop: '8px', color: '#595959' }}>{step.description}</p>
                </div>
              )
            }))}
          />
        ) : (
          <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No active care timeline steps available yet" />
        )}
      </Card>
    </div>
  );
}
