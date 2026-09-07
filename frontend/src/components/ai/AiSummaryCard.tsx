import React, { useState } from 'react';
import { Card, Alert, Typography, Badge, Space, Button, List, Spin, Popconfirm } from 'antd';
import { InfoCircleOutlined, WarningOutlined, CheckCircleOutlined, EditOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { AiConsultationSummary, ReviewStatus } from '../../types/ai';

const { Text, Title, Paragraph } = Typography;

interface AiSummaryCardProps {
  summary: AiConsultationSummary | undefined;
  isLoading: boolean;
  onReview?: (status: ReviewStatus) => void;
}

export const AiSummaryCard: React.FC<AiSummaryCardProps> = ({ summary, isLoading, onReview }) => {
  const [reviewState, setReviewState] = useState<ReviewStatus | null>(null);

  if (isLoading) {
    return (
      <Card>
        <div style={{ textAlign: 'center', padding: '24px 0' }}>
          <Spin tip="Generating AI Summary..." size="large" />
        </div>
      </Card>
    );
  }

  if (!summary) {
    return null;
  }

  const handleReview = (status: ReviewStatus) => {
    setReviewState(status);
    if (onReview) {
      onReview(status);
    }
  };

  const getConfidenceColor = (score: number) => {
    if (score >= 90) return 'green';
    if (score >= 75) return 'orange';
    return 'red';
  };

  return (
    <Card 
      title={<Space><InfoCircleOutlined /> AI Pre-Consultation Summary</Space>}
      extra={
        <Space>
          <Badge 
            count={`${summary.confidenceScore}% Confidence`} 
            style={{ backgroundColor: getConfidenceColor(summary.confidenceScore) }} 
          />
          {reviewState && <Badge count={reviewState} style={{ backgroundColor: reviewState === ReviewStatus.ACCEPTED ? 'green' : 'blue' }} />}
        </Space>
      }
      style={{ marginBottom: 24, border: '1px solid #d9d9d9' }}
    >
      <Alert
        message={summary.clinicalDisclaimer || "CLINICAL DECISION SUPPORT ONLY — Verification required by treating clinician."}
        type="warning"
        showIcon
        style={{ marginBottom: 16 }}
      />

      <Title level={5}>Clinical Trajectory & Current Status</Title>
      <Paragraph>
        <Text strong>Trajectory: </Text>{summary.clinicalTrajectory}<br/>
        <Text strong>Status: </Text>{summary.currentStatus}
      </Paragraph>

      <Title level={5}>Attention Points</Title>
      <List
        size="small"
        dataSource={summary.attentionPoints}
        renderItem={item => (
          <List.Item>
            <Space><WarningOutlined style={{ color: '#faad14' }} /> {item}</Space>
          </List.Item>
        )}
        style={{ marginBottom: 16 }}
      />

      <Title level={5}>Pending Investigations to Review</Title>
      <List
        size="small"
        dataSource={summary.pendingInvestigations}
        renderItem={item => (
          <List.Item>
            <Space><InfoCircleOutlined style={{ color: '#1890ff' }} /> {item}</Space>
          </List.Item>
        )}
        style={{ marginBottom: 16 }}
      />

      <Title level={5}>Recommended Agenda</Title>
      <List
        size="small"
        dataSource={summary.recommendedAgenda}
        renderItem={item => (
          <List.Item>
            <Space>- {item}</Space>
          </List.Item>
        )}
        style={{ marginBottom: 16 }}
      />

      {!reviewState && (
        <div style={{ marginTop: 24, display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <Popconfirm title="Reject this summary?" onConfirm={() => handleReview(ReviewStatus.REJECTED)}>
            <Button danger icon={<CloseCircleOutlined />}>Reject</Button>
          </Popconfirm>
          <Button icon={<EditOutlined />} onClick={() => handleReview(ReviewStatus.MODIFIED)}>Edit / Modify</Button>
          <Button type="primary" style={{ backgroundColor: 'green' }} icon={<CheckCircleOutlined />} onClick={() => handleReview(ReviewStatus.ACCEPTED)}>Accept Summary</Button>
        </div>
      )}
    </Card>
  );
};
