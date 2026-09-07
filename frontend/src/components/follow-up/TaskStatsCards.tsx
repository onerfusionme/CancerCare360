'use client';

import React from 'react';
import { Row, Col, Card, Statistic } from 'antd';
import { WarningOutlined } from '@ant-design/icons';
import { TaskDashboardStats } from '@/types/follow-up';

interface TaskStatsCardsProps {
  stats: TaskDashboardStats;
}

export default function TaskStatsCards({ stats }: TaskStatsCardsProps) {
  return (
    <Row gutter={16} style={{ marginBottom: 24 }}>
      <Col span={4}>
        <Card>
          <Statistic title="Open" value={stats.open} valueStyle={{ color: '#1890ff' }} />
        </Card>
      </Col>
      <Col span={5}>
        <Card>
          <Statistic title="In Progress" value={stats.inProgress} valueStyle={{ color: '#fa8c16' }} />
        </Card>
      </Col>
      <Col span={5}>
        <Card>
          <Statistic 
            title="Overdue" 
            value={stats.overdue} 
            valueStyle={{ color: '#cf1322' }} 
            prefix={<WarningOutlined />} 
          />
        </Card>
      </Col>
      <Col span={5}>
        <Card>
          <Statistic title="Resolved Today" value={stats.resolvedToday} valueStyle={{ color: '#3f8600' }} />
        </Card>
      </Col>
      <Col span={5}>
        <Card>
          <Statistic title="Total This Week" value={stats.totalThisWeek} />
        </Card>
      </Col>
    </Row>
  );
}
