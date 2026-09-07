'use client';

import React from 'react';
import { Card, Row, Col, Typography, Space, Table, Progress, Statistic } from 'antd';
import { usePracticeGrowth, useServiceUtilization } from '@/hooks/use-analytics';
import { useQuery } from '@tanstack/react-query';
import { getReferralAnalytics } from '@/services/referral.service';
import { getNpsSummary, getDoctorRatings } from '@/services/feedback.service';
import { StarFilled } from '@ant-design/icons';

const { Title, Text } = Typography;

export default function PracticeGrowthPage() {
  const { data: practiceGrowth, isLoading: isPracticeLoading } = usePracticeGrowth();
  const { data: serviceUtilization, isLoading: isServiceLoading } = useServiceUtilization();

  const { data: referralAnalytics, isLoading: isReferralLoading } = useQuery({
    queryKey: ['referrals', 'analytics'],
    queryFn: getReferralAnalytics
  });

  const { data: npsSummary, isLoading: isNpsLoading } = useQuery({
    queryKey: ['feedback', 'nps-summary'],
    queryFn: getNpsSummary
  });

  const { data: doctorRatings, isLoading: isDocRatingsLoading } = useQuery({
    queryKey: ['feedback', 'doctor-ratings'],
    queryFn: getDoctorRatings
  });

  const trendColumns = [
    { title: 'Month', dataIndex: 'month', key: 'month' },
    { title: 'New Patients', dataIndex: 'newPatients', key: 'newPatients' },
    { title: 'Cumulative', dataIndex: 'cumulative', key: 'cumulative' }
  ];

  const referrersColumns = [
    { title: 'Name', dataIndex: 'name', key: 'name' },
    { title: 'Type', dataIndex: 'type', key: 'type' },
    { title: 'Count', dataIndex: 'count', key: 'count' },
    { title: 'Conversion Rate', dataIndex: 'conversionRate', key: 'conversionRate', render: (val: number) => `${val}%` }
  ];

  const ratingDistColumns = [
    { title: 'Rating', dataIndex: 'rating', key: 'rating', render: (val: number) => <><StarFilled style={{ color: '#faad14' }} /> {val}</> },
    { title: 'Count', dataIndex: 'count', key: 'count' }
  ];

  const docRatingsColumns = [
    { title: 'Doctor Name', dataIndex: 'doctorName', key: 'doctorName' },
    { title: 'Avg Rating', dataIndex: 'avgRating', key: 'avgRating', render: (val: number) => <><StarFilled style={{ color: '#faad14' }} /> {val?.toFixed(1)}</> },
    { title: 'Feedback Count', dataIndex: 'feedbackCount', key: 'feedbackCount' }
  ];

  const serviceColumns = [
    { title: 'Service Type', dataIndex: 'serviceType', key: 'serviceType' },
    { title: 'Total', dataIndex: 'total', key: 'total' },
    { title: 'Completed', dataIndex: 'completed', key: 'completed' },
    { title: 'Cancelled', dataIndex: 'cancelled', key: 'cancelled' },
    { title: 'Completion Rate', dataIndex: 'completionRate', key: 'completionRate', render: (val: number) => <Progress percent={val} size="small" /> }
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <div>
          <Title level={2} style={{ margin: 0 }}>Practice Growth & Experience Dashboard</Title>
          <Text type="secondary">Monitor patient acquisition, referrals, and satisfaction</Text>
        </div>

        {/* Top KPI Cards Row */}
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} lg={6}>
            <Card loading={isPracticeLoading} bordered={false}>
              <Statistic title="New Patients This Month" value={practiceGrowth?.newPatientsPerMonth || 0} />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card loading={isPracticeLoading} bordered={false}>
              <Statistic title="Retention Rate %" value={practiceGrowth?.retentionRate || 0} precision={1} suffix="%" valueStyle={{ color: '#3f8600' }}/>
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card loading={isReferralLoading} bordered={false}>
              <Statistic title="Referral Conversion Rate %" value={referralAnalytics?.conversionRate || 0} precision={1} suffix="%" />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card loading={isNpsLoading} bordered={false}>
              <Statistic title="Average Patient Satisfaction" value={npsSummary?.averageRating || 0} precision={1} prefix={<StarFilled style={{ color: '#faad14' }} />} />
            </Card>
          </Col>
        </Row>

        <Row gutter={[16, 16]}>
          {/* Patient Acquisition Trend */}
          <Col xs={24} lg={12}>
            <Card title="Patient Acquisition Trend (Last 12 Months)" loading={isPracticeLoading} bordered={false} style={{ height: '100%' }}>
              <Table 
                dataSource={practiceGrowth?.monthlyTrend || []} 
                columns={trendColumns} 
                rowKey="month" 
                pagination={false} 
                size="small"
              />
            </Card>
          </Col>

          {/* Referral Analytics */}
          <Col xs={24} lg={12}>
            <Card title="Referral Analytics" loading={isReferralLoading} bordered={false} style={{ height: '100%' }}>
              <div style={{ marginBottom: 16 }}>
                <Text strong>Referral Sources Breakdown</Text>
                {referralAnalytics?.bySource?.map((source: any) => (
                  <div key={source.type} style={{ marginTop: 8 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <Text>{source.type}</Text>
                      <Text type="secondary">{source.percentage}%</Text>
                    </div>
                    <Progress percent={source.percentage} status="active" />
                  </div>
                ))}
              </div>
              <Text strong>Top 5 Referrers</Text>
              <Table 
                dataSource={referralAnalytics?.topReferrers || []} 
                columns={referrersColumns} 
                rowKey="name" 
                pagination={false} 
                size="small"
                style={{ marginTop: 8 }}
              />
            </Card>
          </Col>
        </Row>

        {/* Patient Satisfaction */}
        <Card title="Patient Satisfaction & NPS" loading={isNpsLoading} bordered={false}>
          <Row gutter={[24, 24]}>
            <Col xs={24} md={8}>
              <div style={{ textAlign: 'center', padding: 24 }}>
                <Text type="secondary" style={{ fontSize: 16 }}>Net Promoter Score</Text>
                <div style={{ 
                  fontSize: 48, 
                  fontWeight: 'bold', 
                  color: (npsSummary?.score > 50) ? '#52c41a' : (npsSummary?.score >= 0 ? '#faad14' : '#ff4d4f') 
                }}>
                  {npsSummary?.score || 0}
                </div>
                <div style={{ marginTop: 16 }}>
                  <Progress percent={npsSummary?.promotersPercent || 0} success={{ percent: npsSummary?.promotersPercent || 0, strokeColor: '#52c41a' }} format={() => 'Promoters'} style={{ width: '100%' }} />
                  <Progress percent={npsSummary?.passivesPercent || 0} success={{ percent: npsSummary?.passivesPercent || 0, strokeColor: '#faad14' }} format={() => 'Passives'} style={{ width: '100%' }} />
                  <Progress percent={npsSummary?.detractorsPercent || 0} success={{ percent: npsSummary?.detractorsPercent || 0, strokeColor: '#ff4d4f' }} format={() => 'Detractors'} style={{ width: '100%' }} />
                </div>
              </div>
            </Col>
            <Col xs={24} md={8}>
              <Text strong>Rating Distribution</Text>
              <Table 
                dataSource={npsSummary?.ratingDistribution || []} 
                columns={ratingDistColumns} 
                rowKey="rating" 
                pagination={false} 
                size="small"
                style={{ marginTop: 8 }}
              />
            </Col>
            <Col xs={24} md={8}>
              <Text strong>Doctor Ratings</Text>
              <Table 
                dataSource={doctorRatings || []} 
                columns={docRatingsColumns} 
                rowKey="doctorName" 
                pagination={false} 
                size="small"
                loading={isDocRatingsLoading}
                style={{ marginTop: 8 }}
              />
            </Col>
          </Row>
        </Card>

        {/* Service Utilization */}
        <Card title="Service Utilization" loading={isServiceLoading} bordered={false}>
          <Table 
            dataSource={serviceUtilization || []} 
            columns={serviceColumns} 
            rowKey="serviceType" 
            pagination={false} 
          />
        </Card>

      </Space>
    </div>
  );
}
