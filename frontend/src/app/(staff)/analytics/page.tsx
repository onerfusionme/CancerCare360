'use client';

import React from 'react';
import { Card, Row, Col, Typography, Space, Table, Progress, Statistic } from 'antd';
import { useCareContinuity, useInvestigationTAT, usePopulationGaps } from '@/hooks/use-analytics';

const { Title, Text } = Typography;

export default function AnalyticsPage() {
  const { data: continuityData, isLoading: isLoadingContinuity } = useCareContinuity();
  const { data: tatData, isLoading: isLoadingTAT } = useInvestigationTAT();
  const { data: populationGaps, isLoading: isLoadingGaps } = usePopulationGaps();

  const columnsTAT = [
    {
      title: 'Investigation',
      dataIndex: 'investigation',
      key: 'investigation',
    },
    {
      title: 'SLA (Hours)',
      dataIndex: 'slaHours',
      key: 'slaHours',
    },
    {
      title: 'Actual Avg (Hours)',
      dataIndex: 'actualHours',
      key: 'actualHours',
      render: (val: number, record: any) => (
        <Text type={val > record.slaHours ? 'danger' : 'success'}>
          {val} {val > record.slaHours ? ' (Breached)' : ''}
        </Text>
      )
    },
    {
      title: 'Volume',
      dataIndex: 'volume',
      key: 'volume',
    }
  ];

  const columnsFunnel = [
    { title: 'Step', dataIndex: 'step', key: 'step' },
    { title: 'Retained', dataIndex: 'retained', key: 'retained' },
    { title: 'Dropped', dataIndex: 'dropped', key: 'dropped', render: (val: number) => <Text type="danger">{val}</Text> }
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <div>
          <Title level={2} style={{ margin: 0 }}>Population & Operational Analytics</Title>
          <Text type="secondary">Monitor hospital-wide clinical performance and efficiency</Text>
        </div>

        {/* Top Metrics */}
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} lg={6}>
            <Card loading={isLoadingContinuity} bordered={false}>
              <Statistic title="Total Active Journeys" value={continuityData?.totalActiveJourneys} />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card loading={isLoadingContinuity} bordered={false}>
              <Statistic title="Care Continuity Index (%)" value={continuityData?.careContinuityIndex} precision={1} suffix="%" valueStyle={{ color: '#3f8600' }}/>
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card loading={isLoadingContinuity} bordered={false}>
              <Statistic title="Lost-to-Follow-up Rate (%)" value={continuityData?.lostToFollowUpRate} precision={1} suffix="%" valueStyle={{ color: '#cf1322' }}/>
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card loading={isLoadingContinuity} bordered={false}>
              <Statistic title="Avg Lab Turnaround (hours)" value={continuityData?.averageLabTurnaroundHours} precision={1} />
            </Card>
          </Col>
        </Row>

        <Row gutter={[16, 16]}>
          {/* Stage Distribution */}
          <Col xs={24} lg={12}>
            <Card title="Cancer Stage Distribution" loading={isLoadingContinuity} bordered={false} style={{ height: '100%' }}>
              <Space direction="vertical" style={{ width: '100%' }} size="middle">
                {continuityData?.stageDistribution.map(stage => (
                  <div key={stage.stage}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <Text>{stage.stage}</Text>
                      <Text type="secondary">{stage.count} patients</Text>
                    </div>
                    <Progress percent={stage.percentage} status="active" />
                  </div>
                ))}
              </Space>
            </Card>
          </Col>

          {/* Retention Funnel */}
          <Col xs={24} lg={12}>
            <Card title="Care Continuity Retention Funnel" loading={isLoadingContinuity} bordered={false} style={{ height: '100%' }}>
               <Table 
                dataSource={continuityData?.retentionFunnel} 
                columns={columnsFunnel} 
                rowKey="step" 
                pagination={false} 
                size="small"
              />
            </Card>
          </Col>
        </Row>

        {/* Care Gap Distribution */}
        <Card title="Care Gap Distribution" loading={isLoadingGaps} bordered={false}>
          <Space direction="vertical" style={{ width: '100%' }} size="middle">
            {populationGaps?.byType?.map((gap: any) => (
              <div key={gap.type}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <Text>{gap.type}</Text>
                  <Text type="secondary">{gap.count} patients</Text>
                </div>
                {/* Assuming total is some relative number or we just show a relative bar */}
                <div style={{ width: '100%', backgroundColor: '#f0f0f0', borderRadius: 4, height: 16 }}>
                  <div style={{ width: `${Math.min((gap.count / 100) * 100, 100)}%`, backgroundColor: '#ff4d4f', height: '100%', borderRadius: 4 }}></div>
                </div>
              </div>
            ))}
            {(!populationGaps?.byType || populationGaps.byType.length === 0) && <Text type="secondary">No gap data available</Text>}
          </Space>
        </Card>

        {/* Investigation TAT */}
        <Card title="Investigation Turnaround Times vs SLA" bordered={false}>
          <Table 
            loading={isLoadingTAT}
            dataSource={tatData}
            columns={columnsTAT}
            rowKey="investigation"
            pagination={false}
          />
        </Card>

      </Space>
    </div>
  );
}
