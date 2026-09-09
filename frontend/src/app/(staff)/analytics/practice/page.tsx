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

  const newPatientsThisMonth = React.useMemo(() => {
    if (typeof practiceGrowth?.newPatientsPerMonth === 'number') {
      return practiceGrowth.newPatientsPerMonth;
    }
    if (practiceGrowth?.newPatientsPerMonth && typeof practiceGrowth.newPatientsPerMonth === 'object') {
      const vals = Object.values(practiceGrowth.newPatientsPerMonth) as number[];
      return vals.length > 0 ? Number(vals[vals.length - 1]) || 0 : 0;
    }
    return 0;
  }, [practiceGrowth]);

  const formattedTrend = React.useMemo(() => {
    if (practiceGrowth?.monthlyTrend && Array.isArray(practiceGrowth.monthlyTrend)) {
      return practiceGrowth.monthlyTrend;
    }
    const perMonth = (practiceGrowth as any)?.newPatientsPerMonth;
    if (perMonth && typeof perMonth === 'object' && !Array.isArray(perMonth)) {
      let cumulative = 0;
      return Object.entries(perMonth).map(([month, count]: [string, any]) => {
        const num = Number(count) || 0;
        cumulative += num;
        return { month, newPatients: num, cumulative };
      });
    }
    return [];
  }, [practiceGrowth]);

  const formattedSources = React.useMemo(() => {
    if (!referralAnalytics?.bySource || !Array.isArray(referralAnalytics.bySource)) return [];
    const total = referralAnalytics.totalReferrals || referralAnalytics.bySource.reduce((acc: number, s: any) => acc + (s.count || 0), 0) || 1;
    return referralAnalytics.bySource.map((s: any) => {
      const type = s.type || s.source || 'General Referral';
      const count = Number(s.count) || 0;
      const percentage = s.percentage !== undefined ? Number(s.percentage) : Math.round((count / total) * 100);
      return { type, count, percentage };
    });
  }, [referralAnalytics]);

  const formattedReferrers = React.useMemo(() => {
    if (!referralAnalytics?.topReferrers || !Array.isArray(referralAnalytics.topReferrers)) return [];
    return referralAnalytics.topReferrers.map((r: any) => ({
      name: r.name || 'Referring Provider',
      type: r.type || 'Physician',
      count: Number(r.count) || 0,
      conversionRate: r.conversionRate !== undefined ? Number(r.conversionRate) : Math.round(Number(referralAnalytics?.conversionRate) || 80)
    }));
  }, [referralAnalytics]);

  const formattedRatingDist = React.useMemo(() => {
    if (!npsSummary?.ratingDistribution) return [];
    if (Array.isArray(npsSummary.ratingDistribution)) return npsSummary.ratingDistribution;
    return Object.entries(npsSummary.ratingDistribution).map(([rating, count]: [string, any]) => ({
      rating: Number(rating),
      count: Number(count) || 0
    })).reverse();
  }, [npsSummary]);

  const formattedDocRatings = React.useMemo(() => {
    if (!doctorRatings) return [];
    if (Array.isArray(doctorRatings)) {
      return doctorRatings.map((item: any) => ({
        doctorName: item.doctorName || (item.doctor ? `Dr. ${item.doctor.firstName} ${item.doctor.lastName}` : 'Attending Physician'),
        avgRating: item.avgRating ?? item.averageOverall ?? 0,
        feedbackCount: item.feedbackCount ?? item.totalFeedbacks ?? 0
      }));
    }
    if (typeof doctorRatings === 'object') {
      return Object.entries(doctorRatings).map(([doctorName, avgRating]: [string, any]) => ({
        doctorName,
        avgRating: typeof avgRating === 'number' ? avgRating : 4.8,
        feedbackCount: 1
      }));
    }
    return [];
  }, [doctorRatings]);

  const formattedServices = React.useMemo(() => {
    if (!serviceUtilization || !Array.isArray(serviceUtilization)) return [];
    return serviceUtilization.map((s: any) => {
      const total = s.total ?? s.totalCount ?? 0;
      const completed = s.completed ?? s.completedCount ?? 0;
      const cancelled = s.cancelled ?? s.cancelledCount ?? 0;
      const completionRate = s.completionRate ?? (total > 0 ? Math.round((completed / total) * 100) : 0);
      return {
        id: s.id || s.serviceType,
        serviceType: s.serviceType,
        total,
        completed,
        cancelled,
        completionRate
      };
    });
  }, [serviceUtilization]);

  const totalNpsFeedbacks = npsSummary?.totalFeedbacks || 1;
  const npsScoreVal = Math.round(Number(npsSummary?.npsScore ?? npsSummary?.score) || 0);
  const promotersPercent = npsSummary?.promotersPercent !== undefined
    ? Number(npsSummary.promotersPercent)
    : Math.round(((npsSummary?.npsClassification?.promoters || 0) / totalNpsFeedbacks) * 100);
  const passivesPercent = npsSummary?.passivesPercent !== undefined
    ? Number(npsSummary.passivesPercent)
    : Math.round(((npsSummary?.npsClassification?.passives || 0) / totalNpsFeedbacks) * 100);
  const detractorsPercent = npsSummary?.detractorsPercent !== undefined
    ? Number(npsSummary.detractorsPercent)
    : Math.round(((npsSummary?.npsClassification?.detractors || 0) / totalNpsFeedbacks) * 100);

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
    { title: 'Avg Rating', dataIndex: 'avgRating', key: 'avgRating', render: (val: number) => <><StarFilled style={{ color: '#faad14' }} /> {Number(val)?.toFixed(1)}</> },
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
              <Statistic title="New Patients This Month" value={newPatientsThisMonth} />
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
              <Statistic title="Average Patient Satisfaction" value={npsSummary?.averageOverallRating ?? npsSummary?.averageRating ?? 0} precision={1} prefix={<StarFilled style={{ color: '#faad14' }} />} />
            </Card>
          </Col>
        </Row>

        <Row gutter={[16, 16]}>
          {/* Patient Acquisition Trend */}
          <Col xs={24} lg={12}>
            <Card title="Patient Acquisition Trend (Last 12 Months)" loading={isPracticeLoading} bordered={false} style={{ height: '100%' }}>
              <Table 
                dataSource={formattedTrend} 
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
                {formattedSources.length === 0 && <div style={{ marginTop: 8 }}><Text type="secondary">No referral sources recorded</Text></div>}
                {formattedSources.map((source: any) => (
                  <div key={source.type} style={{ marginTop: 8 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <Text>{source.type}</Text>
                      <Text type="secondary">{source.percentage}% ({source.count})</Text>
                    </div>
                    <Progress percent={source.percentage} status="active" />
                  </div>
                ))}
              </div>
              <Text strong>Top Referrers</Text>
              <Table 
                dataSource={formattedReferrers} 
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
                  color: (npsScoreVal > 50) ? '#52c41a' : (npsScoreVal >= 0 ? '#faad14' : '#ff4d4f') 
                }}>
                  {npsScoreVal}
                </div>
                <div style={{ marginTop: 16 }}>
                  <Progress percent={promotersPercent} success={{ percent: promotersPercent, strokeColor: '#52c41a' }} format={() => 'Promoters'} style={{ width: '100%' }} />
                  <Progress percent={passivesPercent} success={{ percent: passivesPercent, strokeColor: '#faad14' }} format={() => 'Passives'} style={{ width: '100%' }} />
                  <Progress percent={detractorsPercent} success={{ percent: detractorsPercent, strokeColor: '#ff4d4f' }} format={() => 'Detractors'} style={{ width: '100%' }} />
                </div>
              </div>
            </Col>
            <Col xs={24} md={8}>
              <Text strong>Rating Distribution</Text>
              <Table 
                dataSource={formattedRatingDist} 
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
                dataSource={formattedDocRatings} 
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
            dataSource={formattedServices} 
            columns={serviceColumns} 
            rowKey={(record) => record.id || record.serviceType} 
            pagination={false} 
          />
        </Card>

      </Space>
    </div>
  );
}
