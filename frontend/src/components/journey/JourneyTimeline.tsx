'use client';
import React from 'react';
import { Timeline, Spin } from 'antd';
import { UserOutlined, ExperimentOutlined, MedicineBoxOutlined, CalendarOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

interface JourneyEvent {
  id: string;
  type: string;
  title: string;
  date: string;
  status: 'COMPLETED' | 'PLANNED' | 'CANCELLED' | 'NO_SHOW';
  responsiblePerson?: string;
}

interface JourneyTimelineProps {
  events: JourneyEvent[];
  onEventClick?: (event: JourneyEvent) => void;
  loading?: boolean;
}

export const JourneyTimeline: React.FC<JourneyTimelineProps> = ({ events, onEventClick, loading }) => {
  if (loading) return <Spin />;

  const getIcon = (type: string) => {
    switch (type) {
      case 'CONSULTATION': return <UserOutlined />;
      case 'DIAGNOSTIC': return <ExperimentOutlined />;
      case 'TREATMENT': return <MedicineBoxOutlined />;
      case 'FOLLOW_UP': return <CalendarOutlined />;
      default: return <CalendarOutlined />;
    }
  };

  const getColor = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'green';
      case 'PLANNED': return 'blue';
      case 'CANCELLED': return 'gray';
      case 'NO_SHOW': return 'red';
      default: return 'blue';
    }
  };

  return (
    <Timeline
      mode="left"
      items={events.map(event => ({
        color: getColor(event.status),
        dot: getIcon(event.type),
        children: (
          <div style={{ cursor: onEventClick ? 'pointer' : 'default' }} onClick={() => onEventClick && onEventClick(event)}>
            <strong>{event.title}</strong> - {dayjs(event.date).format('MMM D, YYYY')}
            {event.responsiblePerson && <div><small>{event.responsiblePerson}</small></div>}
          </div>
        )
      }))}
    />
  );
};
