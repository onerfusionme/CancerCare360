'use client';

import React from 'react';
import { Table, Tag, Progress, Button, Space, Typography } from 'antd';
import { CareGap } from '@/types/care-gap';

const { Title } = Typography;

interface GapDetectionResultsProps {
  gaps: CareGap[];
  onGenerateTasks: () => void;
  loading?: boolean;
  onExplainGap?: (gap: CareGap) => void;
}

export default function GapDetectionResults({ gaps, onGenerateTasks, loading, onExplainGap }: GapDetectionResultsProps) {
  const getGapColor = (type: string) => {
    switch (type) {
      case 'OVERDUE_MILESTONE': return 'red';
      case 'MISSED_APPOINTMENT': return 'orange';
      case 'PENDING_INVESTIGATION': return 'blue';
      case 'MISSING_FOLLOW_UP': return 'purple';
      case 'TREATMENT_DELAY': return 'volcano';
      default: return 'default';
    }
  };

  const columns = [
    {
      title: 'Patient',
      key: 'patient',
      render: (_: any, record: CareGap) => (
        <div>
          <div><strong>{record.patientName}</strong></div>
          <div style={{ fontSize: '12px', color: '#888' }}>MRN: {record.mrn}</div>
        </div>
      ),
    },
    {
      title: 'Gap Type',
      dataIndex: 'gapType',
      key: 'gapType',
      render: (type: string) => (
        <Tag color={getGapColor(type)}>{type.replace('_', ' ')}</Tag>
      ),
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: 'Priority Score',
      dataIndex: 'priorityScore',
      key: 'priorityScore',
      render: (score: number) => (
        <Progress 
          percent={score} 
          size="small" 
          status={score > 80 ? 'exception' : score > 50 ? 'normal' : 'success'} 
        />
      ),
    },
    {
      title: 'Detected At',
      dataIndex: 'detectedAt',
      key: 'detectedAt',
      render: (date: string) => new Date(date).toLocaleString(),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: CareGap) => (
        <Space>
          {onExplainGap && (
            <Button size="small" onClick={() => onExplainGap(record)}>AI Explain</Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <Title level={5}>Detected Care Gaps ({gaps.length})</Title>
        <Button type="primary" onClick={onGenerateTasks} loading={loading} disabled={gaps.length === 0}>
          Generate Tasks
        </Button>
      </div>
      <Table 
        columns={columns} 
        dataSource={gaps} 
        rowKey="id" 
        loading={loading}
        pagination={{ pageSize: 10 }}
      />
    </div>
  );
}
