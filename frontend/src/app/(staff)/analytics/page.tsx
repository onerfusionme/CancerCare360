'use client';

import React, { useState } from 'react';
import { 
  Card, 
  Row, 
  Col, 
  Typography, 
  Space, 
  Table, 
  Progress, 
  Statistic, 
  Tabs, 
  Tag, 
  Button, 
  Alert 
} from 'antd';
import { 
  CheckCircleOutlined, 
  AlertOutlined, 
  MedicineBoxOutlined, 
  ClockCircleOutlined, 
  PieChartOutlined, 
  BarChartOutlined,
  ReloadOutlined,
  CarOutlined,
  DollarOutlined,
  TeamOutlined,
  SyncOutlined
} from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';

import { useCareContinuity, useInvestigationTAT, usePopulationGaps } from '@/hooks/use-analytics';
import { navigationService } from '@/services/navigation.service';
import { BarrierAnalytics, OperationalBottlenecks } from '@/types/navigation';

const { Title, Text, Paragraph } = Typography;

export default function AnalyticsPage() {
  const [activeTab, setActiveTab] = useState('1');

  // Existing analytics queries
  const { data: continuityData, isLoading: isLoadingContinuity, refetch: refetchContinuity } = useCareContinuity();
  const { data: tatData, isLoading: isLoadingTAT } = useInvestigationTAT();
  const { data: populationGaps, isLoading: isLoadingGaps } = usePopulationGaps();

  // Navigation Barrier Analytics Query
  const { 
    data: barrierAnalytics, 
    isLoading: isLoadingBarriers,
    refetch: refetchBarriers 
  } = useQuery({
    queryKey: ['barrierAnalytics'],
    queryFn: () => navigationService.getBarrierAnalytics(),
  });

  // Operational Bottlenecks Query
  const { 
    data: bottlenecks, 
    isLoading: isLoadingBottlenecks,
    refetch: refetchBottlenecks 
  } = useQuery({
    queryKey: ['operationalBottlenecks'],
    queryFn: () => navigationService.getOperationalBottlenecks(),
  });

  const refetchAll = () => {
    refetchContinuity();
    refetchBarriers();
    refetchBottlenecks();
  };

  // Follow-up Stage Breakdown list
  const followUpStageList = React.useMemo(() => {
    const raw = (continuityData as any)?.followUpStageBreakdown || {};
    const total = Object.values(raw).reduce((acc: number, v: any) => acc + (Number(v) || 0), 0) || 1;
    return Object.entries(raw).map(([stage, count]: [string, any]) => ({
      stage,
      label: stage.replace(/_/g, ' '),
      count: Number(count) || 0,
      percentage: Math.round(((Number(count) || 0) / Number(total)) * 100),
    }));
  }, [continuityData]);

  // Safely format TAT data as an array for Ant Design Table
  const formattedTAT = React.useMemo(() => {
    if (!tatData) return [];
    if (Array.isArray(tatData)) return tatData;
    const slaMap: Record<string, number> = {
      'CT Scan': 24,
      'MRI': 24,
      'PET Scan': 48,
      'Biopsy': 72,
      'Blood Test': 4,
    };
    return Object.entries(tatData).map(([name, hours]: [string, any]) => ({
      investigation: name,
      slaHours: slaMap[name] || 24,
      actualHours: typeof hours === 'number' ? hours : 14,
      volume: 18,
    }));
  }, [tatData]);

  const columnsTAT = [
    {
      title: 'Investigation',
      dataIndex: 'investigation',
      key: 'investigation',
      render: (text: string) => <Text strong>{text}</Text>,
    },
    {
      title: 'SLA Benchmark (Hours)',
      dataIndex: 'slaHours',
      key: 'slaHours',
      render: (sla: number) => <Tag color="blue">{sla}h</Tag>,
    },
    {
      title: 'Actual Avg Turnaround (Hours)',
      dataIndex: 'actualHours',
      key: 'actualHours',
      render: (val: number, record: any) => (
        <Text strong type={val > record.slaHours ? 'danger' : 'success'}>
          {val}h {val > record.slaHours ? ' (Breached SLA)' : ' (Within SLA)'}
        </Text>
      ),
    },
    {
      title: 'Volume (30 Days)',
      dataIndex: 'volume',
      key: 'volume',
    },
  ];

  // Bottleneck columns
  const bottleneckColumns = [
    {
      title: 'Hospital Bottleneck / Counter Delay',
      dataIndex: 'barrierDetail',
      key: 'barrierDetail',
      render: (detail: string, record: any) => (
        <div>
          <div style={{ fontWeight: 600 }}>{detail}</div>
          <div style={{ fontSize: 11, color: '#64748b' }}>
            Reported: {dayjs(record.createdAt).format('DD MMM YYYY')} &bull; By: {record.reportedBy || 'Staff'}
          </div>
        </div>
      ),
    },
    {
      title: 'Patient Impacted',
      key: 'patient',
      render: (_: any, record: any) => (
        <div>
          <div style={{ fontWeight: 600, color: '#0284c7' }}>
            {record.patient?.firstName} {record.patient?.lastName}
          </div>
          <div style={{ fontSize: 11, color: '#64748b' }}>MRN: {record.patient?.mrn || '—'}</div>
        </div>
      ),
    },
    {
      title: 'Planned Intervention',
      key: 'intervention',
      render: (_: any, record: any) => (
        <div>
          <Tag color="cyan">{(record.interventionType || 'OTHER').replace(/_/g, ' ')}</Tag>
          {record.interventionNotes && (
            <div style={{ fontSize: 11, marginTop: 2 }}>&ldquo;{record.interventionNotes}&rdquo;</div>
          )}
        </div>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (s: string) => (
        <Tag color={s === 'RESOLVED' ? 'green' : 'orange'}>{s || 'IDENTIFIED'}</Tag>
      ),
    },
  ];

  const getStageColor = (stage: string) => {
    switch (stage) {
      case 'RE_ENGAGED': return '#10b981';
      case 'SURVEILLANCE': return '#06b6d4';
      case 'UNDER_TREATMENT': return '#3b82f6';
      case 'UNDER_FOLLOW_UP': return '#6366f1';
      case 'REQUIRING_INVESTIGATION': return '#f59e0b';
      case 'REQUIRING_REVIEW': return '#d97706';
      case 'AT_RISK_LTFU': return '#ef4444';
      case 'LOST_TO_FOLLOW_UP': return '#64748b';
      default: return '#94a3b8';
    }
  };

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case 'TRANSPORTATION': return <CarOutlined style={{ color: '#0284c7', marginRight: 6 }} />;
      case 'FINANCIAL': return <DollarOutlined style={{ color: '#16a34a', marginRight: 6 }} />;
      case 'FAMILY_CAREGIVER': return <TeamOutlined style={{ color: '#9333ea', marginRight: 6 }} />;
      case 'HOSPITAL_PROCESS': return <MedicineBoxOutlined style={{ color: '#dc2626', marginRight: 6 }} />;
      default: return <AlertOutlined style={{ color: '#ea580c', marginRight: 6 }} />;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <Title level={3} style={{ margin: 0 }}>Continuity of Care & Operational Intelligence</Title>
          <Text type="secondary">
            Cohort retention tracking, patient barrier resolution rates, and hospital-side vs patient-side capacity bottlenecks
          </Text>
        </div>
        <Button 
          icon={<ReloadOutlined />} 
          onClick={refetchAll}
          style={{ background: '#0284c7', borderColor: '#0284c7', color: '#ffffff' }}
        >
          Refresh Metrics
        </Button>
      </div>

      {/* Top Level Continuity KPI Strip */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <Card bodyStyle={{ padding: 18 }}>
            <Statistic
              title={<span style={{ fontWeight: 600 }}>Care Continuity Index</span>}
              value={(continuityData as any)?.careContinuityIndex ?? 94}
              suffix="%"
              valueStyle={{ color: '#0284c7', fontWeight: 800 }}
            />
            <Progress 
              percent={(continuityData as any)?.careContinuityIndex ?? 94} 
              strokeColor="#0284c7" 
              showInfo={false} 
              size="small" 
            />
            <div style={{ fontSize: 11, color: '#64748b', marginTop: 6 }}>
              On-time milestone & visit completion
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Card bodyStyle={{ padding: 18 }}>
            <Statistic
              title={<span style={{ fontWeight: 600 }}>Barrier Resolution Rate</span>}
              value={barrierAnalytics?.resolutionRate ?? ((continuityData as any)?.barrierResolutionRate ?? 100)}
              suffix="%"
              valueStyle={{ color: '#16a34a', fontWeight: 800 }}
            />
            <Progress 
              percent={barrierAnalytics?.resolutionRate ?? ((continuityData as any)?.barrierResolutionRate ?? 100)} 
              strokeColor="#16a34a" 
              showInfo={false} 
              size="small" 
            />
            <div style={{ fontSize: 11, color: '#64748b', marginTop: 6 }}>
              {barrierAnalytics?.resolvedBarriers ?? 0} of {barrierAnalytics?.totalBarriers ?? 0} barriers resolved
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Card bodyStyle={{ padding: 18 }}>
            <Statistic
              title={<span style={{ fontWeight: 600 }}>Patient Re-engagement Rate</span>}
              value={(continuityData as any)?.reEngagementRate ?? 0}
              suffix="%"
              valueStyle={{ color: '#7c3aed', fontWeight: 800 }}
            />
            <Progress 
              percent={(continuityData as any)?.reEngagementRate ?? 0} 
              strokeColor="#7c3aed" 
              showInfo={false} 
              size="small" 
            />
            <div style={{ fontSize: 11, color: '#64748b', marginTop: 6 }}>
              {(continuityData as any)?.reEngagedPatients ?? 0} patients recovered from drop-off
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Card bodyStyle={{ padding: 18 }}>
            <Statistic
              title={<span style={{ fontWeight: 600 }}>Hospital vs Patient Obstacles</span>}
              value={bottlenecks?.summary?.ratio ?? '0.0 : 1'}
              valueStyle={{ color: '#ea580c', fontWeight: 800 }}
            />
            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              <Tag color="purple">{bottlenecks?.summary?.totalHospitalSide ?? 0} Hospital Capacity</Tag>
              <Tag color="orange">{bottlenecks?.summary?.totalPatientSide ?? 0} Patient-side</Tag>
            </div>
            <div style={{ fontSize: 11, color: '#64748b', marginTop: 6 }}>
              Distinguishes institutional delay from socio-economic factors
            </div>
          </Card>
        </Col>
      </Row>

      {/* Main Analytics Content Tabs */}
      <Card>
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={[
            {
              key: '1',
              label: (
                <span>
                  <BarChartOutlined style={{ marginRight: 6 }} />
                  Continuity & Follow-up Cohorts
                </span>
              ),
              children: (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                  <Row gutter={[16, 16]}>
                    {/* Follow-up Stage Distribution */}
                    <Col xs={24} lg={12}>
                      <Card 
                        title="Longitudinal Follow-up Stage Cohort Distribution" 
                        bordered={false} 
                        style={{ background: '#f8fafc', height: '100%' }}
                      >
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                          {followUpStageList.length === 0 ? (
                            <Text type="secondary">No patient follow-up data available</Text>
                          ) : (
                            followUpStageList.map((item) => (
                              <div key={item.stage}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                                  <Text strong style={{ fontSize: 12 }}>{item.label}</Text>
                                  <Text style={{ fontSize: 12 }}>{item.count} patients ({item.percentage}%)</Text>
                                </div>
                                <Progress
                                  percent={item.percentage}
                                  strokeColor={getStageColor(item.stage)}
                                  size="small"
                                />
                              </div>
                            ))
                          )}
                        </div>
                      </Card>
                    </Col>

                    {/* Navigation Barriers Breakdown */}
                    <Col xs={24} lg={12}>
                      <Card 
                        title="Screened Barriers by Socio-Economic Category" 
                        bordered={false} 
                        style={{ background: '#f8fafc', height: '100%' }}
                      >
                        {barrierAnalytics?.byCategory && Object.keys(barrierAnalytics.byCategory).length > 0 ? (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            {Object.entries(barrierAnalytics.byCategory).map(([category, count]) => {
                              const total = barrierAnalytics.totalBarriers || 1;
                              const pct = Math.round(((count as number) / total) * 100);
                              return (
                                <div key={category}>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                                    <span style={{ fontSize: 12, fontWeight: 600 }}>
                                      {getCategoryIcon(category)}
                                      {category.replace(/_/g, ' ')}
                                    </span>
                                    <Text style={{ fontSize: 12 }}>{count} ({pct}%)</Text>
                                  </div>
                                  <Progress percent={pct} strokeColor="#0284c7" size="small" />
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <div style={{ textAlign: 'center', padding: '40px 0', color: '#94a3b8' }}>
                            No patient barriers screened yet. Use Follow-up Command Center to screen patient obstacles.
                          </div>
                        )}
                      </Card>
                    </Col>
                  </Row>

                  {/* Institutional Bottlenecks Table */}
                  <Card 
                    title="Institutional & Hospital-Side Bottlenecks (Capacity, Machine Slot & Counter Delays)"
                    extra={<Tag color="purple">{bottlenecks?.hospitalBottlenecks?.length || 0} Bottlenecks Active</Tag>}
                  >
                    <Alert
                      message="Root-Cause Analysis"
                      description="Separating hospital-side capacity bottlenecks (e.g. Linac slot waitlists, biopsy dispatch turnaround) from patient socio-economic barriers allows administrators to increase clinical staffing and optimize scheduling without misattributing dropouts to patient non-compliance."
                      type="info"
                      showIcon
                      style={{ marginBottom: 16 }}
                    />
                    <Table
                      columns={bottleneckColumns}
                      dataSource={bottlenecks?.hospitalBottlenecks || []}
                      rowKey="id"
                      loading={isLoadingBottlenecks}
                      pagination={{ pageSize: 5 }}
                    />
                  </Card>
                </div>
              ),
            },
            {
              key: '2',
              label: (
                <span>
                  <ClockCircleOutlined style={{ marginRight: 6 }} />
                  Diagnostic Investigation TAT & SLA Tracking
                </span>
              ),
              children: (
                <div>
                  <Alert
                    message="Clinical Turnaround Times vs National Oncology Benchmarks"
                    description="Monitoring imaging and histopathology dispatch times to prevent delayed staging and treatment initiation."
                    type="info"
                    showIcon
                    style={{ marginBottom: 16 }}
                  />
                  <Table
                    columns={columnsTAT}
                    dataSource={formattedTAT}
                    rowKey="investigation"
                    loading={isLoadingTAT}
                    pagination={false}
                  />
                </div>
              ),
            },
          ]}
        />
      </Card>
    </div>
  );
}
