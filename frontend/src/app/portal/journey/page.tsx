'use client';

import React from 'react';
import { Typography, Timeline, Card, Tag } from 'antd';
import { CheckCircleOutlined, ClockCircleOutlined, SyncOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

export default function PortalJourney() {
  const journeySteps = [
    {
      title: 'Initial Diagnosis & Staging',
      date: 'Aug 10, 2026',
      status: 'completed',
      description: 'Biopsy and PET scan completed. Treatment plan formulated.'
    },
    {
      title: 'Chemotherapy Cycle 1',
      date: 'Aug 25, 2026',
      status: 'completed',
      description: 'First cycle completed without major complications.'
    },
    {
      title: 'Chemotherapy Cycle 2',
      date: 'Sep 15, 2026',
      status: 'completed',
      description: 'Second cycle completed.'
    },
    {
      title: 'Chemotherapy Cycle 3',
      date: 'Oct 05, 2026',
      status: 'in-progress',
      description: 'Scheduled. Please complete pre-chemo blood work.'
    },
    {
      title: 'Mid-Treatment Review Scan',
      date: 'Expected late Oct 2026',
      status: 'pending',
      description: 'CT Scan to evaluate response to treatment.'
    }
  ];

  return (
    <div>
      <Title level={3} style={{ marginBottom: 24 }}>My Care Timeline</Title>
      
      <Card>
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
      </Card>
    </div>
  );
}
