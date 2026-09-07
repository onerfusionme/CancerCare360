'use client';
import React from 'react';
import { Card, Descriptions, Alert, Timeline, List, Tabs, Spin, Row, Col } from 'antd';
import { WarningOutlined, FileTextOutlined, ExperimentOutlined, CalendarOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { ConsultationReadiness } from '../../types/consultation';
import StatusBadge from '../ui/StatusBadge';

interface ReadinessCardProps {
  readiness: ConsultationReadiness | null;
  loading?: boolean;
}

export const ReadinessCard: React.FC<ReadinessCardProps> = ({ readiness, loading }) => {
  if (loading || !readiness) return <Spin />;

  const { patient, currentJourney, sinceLastVisit, pendingItems, recentHistory, nextSteps } = readiness;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <Card title="Patient Overview">
        <Descriptions column={{ xxl: 4, xl: 3, lg: 3, md: 3, sm: 2, xs: 1 }}>
          <Descriptions.Item label="Name">{patient?.name}</Descriptions.Item>
          <Descriptions.Item label="MRN">{patient?.mrn}</Descriptions.Item>
          <Descriptions.Item label="Diagnosis">{currentJourney?.diagnosis}</Descriptions.Item>
          <Descriptions.Item label="Care Stage">{currentJourney?.careStage}</Descriptions.Item>
          <Descriptions.Item label="Treating Doctor">{currentJourney?.primaryDoctor}</Descriptions.Item>
        </Descriptions>
      </Card>

      <Card title="Since Last Visit">
        <Alert message={`Last visit was on ${dayjs(sinceLastVisit.lastVisitDate).format('MMM D, YYYY')}`} type="info" showIcon style={{ marginBottom: 16 }} />
        <Timeline mode="left">
          {sinceLastVisit.newInvestigations?.map(inv => (
            <Timeline.Item key={inv.id} color="blue" dot={<ExperimentOutlined />}>
              New Investigation: {inv.type} (Ordered {dayjs(inv.orderedDate).format('MMM D')})
            </Timeline.Item>
          ))}
          {sinceLastVisit.newDocuments?.map(doc => (
            <Timeline.Item key={doc.id} color="green" dot={<FileTextOutlined />}>
              New Document: {doc.type} ({doc.fileName})
            </Timeline.Item>
          ))}
          {sinceLastVisit.missedAppointments?.map(apt => (
            <Timeline.Item key={apt.id} color="red" dot={<CalendarOutlined />}>
              Missed Appointment on {dayjs(apt.date).format('MMM D')}
            </Timeline.Item>
          ))}
        </Timeline>
      </Card>

      <Card title="Pending Items">
        <Row gutter={16}>
          <Col span={8}>
            <List
              header={<div><WarningOutlined style={{ color: 'orange' }}/> Pending Investigations ({pendingItems.investigations?.length || 0})</div>}
              dataSource={pendingItems.investigations || []}
              renderItem={item => <List.Item><StatusBadge status={item.status} /> {item.type}</List.Item>}
            />
          </Col>
          <Col span={8}>
            <List
              header={<div><WarningOutlined style={{ color: 'red' }}/> Pending Milestones ({pendingItems.milestones?.length || 0})</div>}
              dataSource={pendingItems.milestones || []}
              renderItem={item => <List.Item>{item.type} - Due: {dayjs(item.expectedDate).format('MMM D')}</List.Item>}
            />
          </Col>
          <Col span={8}>
            <List
              header={<div><WarningOutlined /> Open Tasks ({pendingItems.followUpTasks?.length || 0})</div>}
              dataSource={pendingItems.followUpTasks || []}
              renderItem={item => <List.Item>{item.description}</List.Item>}
            />
          </Col>
        </Row>
      </Card>

      <Card title="Recent History">
        <Tabs items={[
          { key: '1', label: 'Previous Consultations', children: <div>List of consultations here</div> },
          { key: '2', label: 'Recent Milestones', children: <div>List of recent milestones here</div> },
          { key: '3', label: 'Recent Documents', children: <div>List of recent documents here</div> }
        ]} />
      </Card>

      <Card title="Next Steps">
        <Row gutter={16}>
          <Col span={12}>
            <h4>Upcoming Milestones</h4>
            <Timeline>
              {nextSteps?.upcomingMilestones?.map((m: any) => (
                <Timeline.Item key={m.id} color="blue">{m.type} on {dayjs(m.date).format('MMM D')}</Timeline.Item>
              ))}
            </Timeline>
          </Col>
          <Col span={12}>
            <h4>Upcoming Appointments</h4>
            <List
              dataSource={nextSteps?.upcomingAppointments || []}
              renderItem={(item: any) => <List.Item>{dayjs(item.date).format('MMM D HH:mm')} - {item.doctor} ({item.type})</List.Item>}
            />
          </Col>
        </Row>
      </Card>
    </div>
  );
};
