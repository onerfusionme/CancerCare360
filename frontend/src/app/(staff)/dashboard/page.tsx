'use client';

import React, { useState } from 'react';
import { 
  Segmented, 
  Card, 
  Row, 
  Col, 
  Statistic, 
  List, 
  Typography, 
  Space, 
  Button, 
  Skeleton,
  Tag,
  Alert
} from 'antd';
import { 
  ArrowUpOutlined, 
  ArrowDownOutlined, 
  PlusOutlined, 
  CalendarOutlined, 
  FileTextOutlined,
  AlertOutlined,
  CheckCircleOutlined,
  InfoCircleOutlined,
  WarningOutlined
} from '@ant-design/icons';
import { useRoleDashboard } from '@/hooks/use-analytics';

const { Title, Text } = Typography;

const roles = ['Oncologist', 'Care Coordinator', 'HOD', 'Administrator'];

export default function DashboardPage() {
  const [activeRole, setActiveRole] = useState(roles[0]);
  const { data, isLoading, isError } = useRoleDashboard(activeRole);

  const renderIcon = (iconName: string) => {
    switch(iconName) {
      case 'PlusOutlined': return <PlusOutlined />;
      case 'CalendarOutlined': return <CalendarOutlined />;
      case 'FileTextOutlined': return <FileTextOutlined />;
      default: return <InfoCircleOutlined />;
    }
  };

  const getAlertIcon = (type: string) => {
    switch(type) {
      case 'alert': return <AlertOutlined style={{ color: '#cf1322' }}/>;
      case 'success': return <CheckCircleOutlined style={{ color: '#389e0d' }}/>;
      case 'warning': return <WarningOutlined style={{ color: '#d48806' }}/>;
      default: return <InfoCircleOutlined style={{ color: '#096dd9' }}/>;
    }
  };

  return (
    <div style={{ padding: '24px' }}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <Title level={2} style={{ margin: 0 }}>Dashboard</Title>
            <Text type="secondary">Who needs my attention today?</Text>
          </div>
          <Segmented 
            options={roles} 
            value={activeRole} 
            onChange={(val) => setActiveRole(val as string)} 
            size="large"
          />
        </div>

        {isLoading ? (
          <Row gutter={[16, 16]}>
            {[1, 2, 3, 4].map(i => (
              <Col xs={24} sm={12} lg={6} key={i}>
                <Card><Skeleton active paragraph={{ rows: 1 }} /></Card>
              </Col>
            ))}
          </Row>
        ) : isError ? (
          <Alert message="Error loading dashboard data" type="error" />
        ) : (
          <>
            <Row gutter={[16, 16]}>
              {data?.stats.map((stat, idx) => (
                <Col xs={24} sm={12} lg={6} key={idx}>
                  <Card bordered={false} hoverable>
                    <Statistic
                      title={stat.label}
                      value={stat.value}
                      precision={typeof stat.value === 'number' && !Number.isInteger(stat.value) ? 1 : 0}
                      valueStyle={{ color: (stat.trend && stat.trend < 0 && stat.label.includes('Wait')) ? '#cf1322' : (stat.trend && stat.trend > 0 ? '#3f8600' : '#cf1322') }}
                      prefix={stat.trend ? (stat.trend > 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />) : null}
                      suffix={typeof stat.value === 'string' && stat.value.includes('%') ? '' : ''}
                    />
                    {stat.description && (
                      <Text type="secondary" style={{ fontSize: '12px', marginTop: '8px', display: 'block' }}>
                        {stat.description}
                      </Text>
                    )}
                  </Card>
                </Col>
              ))}
            </Row>

            <Row gutter={[16, 16]}>
              <Col xs={24} lg={16}>
                <Card title="Recent Activity" bordered={false} style={{ height: '100%' }}>
                  <List
                    itemLayout="horizontal"
                    dataSource={data?.recentActivity || []}
                    renderItem={(item) => (
                      <List.Item>
                        <List.Item.Meta
                          avatar={getAlertIcon(item.type)}
                          title={<Text>{item.description}</Text>}
                          description={item.time}
                        />
                        <Tag color={
                          item.type === 'alert' ? 'red' : 
                          item.type === 'success' ? 'green' : 
                          item.type === 'warning' ? 'orange' : 'blue'
                        }>
                          {item.type.toUpperCase()}
                        </Tag>
                      </List.Item>
                    )}
                  />
                </Card>
              </Col>
              <Col xs={24} lg={8}>
                <Card title="Quick Actions" bordered={false} style={{ height: '100%' }}>
                  <Space direction="vertical" style={{ width: '100%' }} size="middle">
                    {data?.shortcuts.map((shortcut, idx) => (
                      <Button 
                        key={idx} 
                        icon={renderIcon(shortcut.icon)} 
                        block 
                        size="large"
                        style={{ textAlign: 'left' }}
                      >
                        {shortcut.label}
                      </Button>
                    ))}
                  </Space>
                </Card>
              </Col>
            </Row>
          </>
        )}
      </Space>
    </div>
  );
}
