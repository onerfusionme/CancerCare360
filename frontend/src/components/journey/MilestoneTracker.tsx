'use client';
import React from 'react';
import { Table, Spin } from 'antd';
import dayjs from 'dayjs';
import { CareMilestone } from '../../types/milestone';
import StatusBadge from '../ui/StatusBadge';

interface MilestoneTrackerProps {
  milestones: CareMilestone[];
  loading?: boolean;
}

export const MilestoneTracker: React.FC<MilestoneTrackerProps> = ({ milestones, loading }) => {
  if (loading) return <Spin />;

  const columns = [
    {
      title: 'Milestone Type',
      dataIndex: 'type',
      key: 'type',
    },
    {
      title: 'Expected Date',
      dataIndex: 'expectedDate',
      key: 'expectedDate',
      render: (text: string) => text ? dayjs(text).format('MMM D, YYYY') : '-'
    },
    {
      title: 'Actual Date',
      dataIndex: 'actualDate',
      key: 'actualDate',
      render: (text: string) => text ? dayjs(text).format('MMM D, YYYY') : '-'
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => <StatusBadge status={status} />
    },
    {
      title: 'Variance (Days)',
      key: 'variance',
      render: (_: any, record: CareMilestone) => {
        if (record.daysOverdue !== undefined) {
          return record.daysOverdue > 0 ? <span style={{ color: 'red' }}>+{record.daysOverdue}</span> : <span style={{ color: 'green' }}>On Time</span>;
        }
        if (record.actualDate && record.expectedDate) {
          const diff = dayjs(record.actualDate).diff(dayjs(record.expectedDate), 'day');
          if (diff > 0) return <span style={{ color: 'red' }}>+{diff}</span>;
          return <span style={{ color: 'green' }}>{diff}</span>;
        }
        return '-';
      }
    }
  ];

  const getRowClassName = (record: CareMilestone) => {
    if (record.status === 'PENDING' && dayjs().isAfter(dayjs(record.expectedDate))) {
      return 'overdue-row';
    }
    return '';
  };

  return (
    <>
      <style>{`
        .overdue-row { background-color: #fff1f0; }
      `}</style>
      <Table 
        dataSource={milestones} 
        columns={columns} 
        rowKey="id" 
        pagination={false}
        rowClassName={getRowClassName}
      />
    </>
  );
};
