'use client';
import React, { useState } from 'react';
import { Typography, Select, Card, Descriptions, Row, Col, Statistic, Empty, Spin } from 'antd';
import { usePatientTimeline } from '@/hooks/use-journeys';
import { MilestoneTracker } from '@/components/journey/MilestoneTracker';
import { JourneyTimeline } from '@/components/journey/JourneyTimeline';

const { Title } = Typography;

export default function JourneyPage() {
  const [patientId, setPatientId] = useState<string | null>(null);
  const { data: timelineData, isLoading } = usePatientTimeline(patientId || '');

  return (
    <div style={{ padding: 24 }}>
      <Title level={2}>Treatment Journey</Title>
      <div style={{ marginBottom: 24 }}>
        <Select
          showSearch
          placeholder="Select a patient"
          style={{ width: 300 }}
          onChange={setPatientId}
          options={[{ value: 'p1', label: 'John Doe (MRN: 12345)' }]}
        />
      </div>

      {!patientId ? (
        <Empty description="Select a patient to view treatment journey" />
      ) : isLoading ? (
        <Spin size="large" />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Card title="Journey Summary">
            <Descriptions>
              <Descriptions.Item label="Diagnosis">{timelineData?.summary?.diagnosis}</Descriptions.Item>
              <Descriptions.Item label="Care Stage">{timelineData?.summary?.careStage}</Descriptions.Item>
              <Descriptions.Item label="Started Date">{timelineData?.summary?.startedDate}</Descriptions.Item>
              <Descriptions.Item label="Primary Doctor">{timelineData?.summary?.primaryDoctor}</Descriptions.Item>
              <Descriptions.Item label="Care Team">{timelineData?.summary?.careTeam}</Descriptions.Item>
            </Descriptions>
          </Card>

          <Card title="Milestone Tracker">
            <MilestoneTracker milestones={timelineData?.milestones || []} />
          </Card>

          <Card title="Treatment Timeline">
            <JourneyTimeline events={timelineData?.events || []} />
          </Card>

          <Card title="Treatment Stats">
            <Row gutter={16}>
              <Col span={6}><Statistic title="Total Planned" value={timelineData?.stats?.planned || 0} /></Col>
              <Col span={6}><Statistic title="Completed" value={timelineData?.stats?.completed || 0} valueStyle={{ color: '#3f8600' }} /></Col>
              <Col span={6}><Statistic title="In Progress" value={timelineData?.stats?.inProgress || 0} valueStyle={{ color: '#1890ff' }} /></Col>
              <Col span={6}><Statistic title="Delayed" value={timelineData?.stats?.delayed || 0} valueStyle={{ color: '#cf1322' }} /></Col>
            </Row>
          </Card>
        </div>
      )}
    </div>
  );
}
