'use client';
import React, { useState } from 'react';
import { Table, Tabs, Select, DatePicker, Button, Typography, Space, Row, Col } from 'antd';
import { useRouter } from 'next/navigation';
import dayjs from 'dayjs';
import { useInvestigations } from '@/hooks/use-investigations';
import { InvestigationType, InvestigationStatus, Investigation } from '@/types/investigation';
import StatusBadge from '@/components/ui/StatusBadge';
import { InvestigationStatusFlow } from '@/components/investigation/InvestigationStatusFlow';

const { Title } = Typography;

export default function InvestigationsPage() {
  const router = useRouter();
  const [filterType, setFilterType] = useState<InvestigationType | undefined>(undefined);
  const [filterStatus, setFilterStatus] = useState<InvestigationStatus | undefined>(undefined);
  
  const { data: investigations, isLoading } = useInvestigations({
    type: filterType,
    status: filterStatus
  });

  const columns = [
    { title: 'Patient', key: 'patient', render: (_: any, r: Investigation) => `${r.patient?.name || 'Unknown'} (${r.patient?.mrn || 'N/A'})` },
    { title: 'Type', dataIndex: 'type', key: 'type' },
    { title: 'Ordered By', dataIndex: 'orderedBy', key: 'orderedBy' },
    { title: 'Ordered Date', dataIndex: 'orderedDate', key: 'orderedDate', render: (d: string) => d ? dayjs(d).format('MMM D, YYYY') : '-' },
    { title: 'Status', dataIndex: 'status', key: 'status', render: (s: InvestigationStatus) => <StatusBadge status={s} /> },
    { title: 'Turnaround Time', dataIndex: 'turnaroundTimeDays', key: 'turnaroundTimeDays', render: (t: number) => t ? `${t} days` : '-' },
    { title: 'Actions', key: 'actions', render: () => <a>View Details</a> }
  ];

  return (
    <div style={{ padding: 24 }}>
      <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
        <Col><Title level={2}>Investigations</Title></Col>
        <Col><Button type="primary" onClick={() => router.push('/investigations/new')}>New Investigation</Button></Col>
      </Row>

      <Tabs items={[
        {
          key: 'all',
          label: 'All Investigations',
          children: (
            <>
              <Space style={{ marginBottom: 16 }}>
                <Select placeholder="Investigation Type" style={{ width: 200 }} allowClear onChange={setFilterType}>
                  {Object.values(InvestigationType).map(t => <Select.Option key={t} value={t}>{t}</Select.Option>)}
                </Select>
                <Select placeholder="Status" style={{ width: 200 }} allowClear onChange={setFilterStatus}>
                  {Object.values(InvestigationStatus).map(s => <Select.Option key={s} value={s}>{s}</Select.Option>)}
                </Select>
                <DatePicker.RangePicker />
              </Space>
              <Table 
                dataSource={investigations} 
                columns={columns} 
                rowKey="id" 
                loading={isLoading}
                expandable={{
                  expandedRowRender: (record) => <InvestigationStatusFlow currentStatus={record.status} />
                }}
              />
            </>
          )
        },
        {
          key: 'pending',
          label: 'Pending Review',
          children: <Table dataSource={investigations?.filter((i: Investigation) => i.status === InvestigationStatus.REPORT_AVAILABLE)} columns={columns} rowKey="id" loading={isLoading} />
        }
      ]} />
    </div>
  );
}
