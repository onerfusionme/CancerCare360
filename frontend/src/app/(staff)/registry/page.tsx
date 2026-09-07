'use client';

import React, { useState } from 'react';
import { Table, Button, Select, Space, Typography, Card, Row, Col, Statistic } from 'antd';
import { FilterOutlined, SettingOutlined } from '@ant-design/icons';
import { usePatients } from '@/hooks/use-patients';
import StatusBadge from '@/components/ui/StatusBadge';
import { PatientStatus } from '@/types/patient';

const { Title } = Typography;
const { Option } = Select;

export default function RegistryPage() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<PatientStatus | undefined>(undefined);
  
  const { data, isLoading } = usePatients({ page, limit: 15, status });

  const columns = [
    { title: 'MRN', dataIndex: 'mrn', key: 'mrn' },
    { title: 'Name', key: 'name', render: (_: any, record: any) => `${record.firstName} ${record.lastName}` },
    { title: 'Diagnosis', dataIndex: 'diagnosis', key: 'diagnosis', render: (d: string) => d || 'Not Specified' },
    { title: 'Care Stage', dataIndex: 'careStage', key: 'stage', render: (s: string) => <StatusBadge status={s} /> },
    { title: 'Status', dataIndex: 'status', key: 'status', render: (s: string) => <StatusBadge status={s} /> },
    { title: 'Doctor', dataIndex: 'primaryDoctorName', key: 'doctor' }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Title level={3} style={{ margin: 0 }}>Patient Registry</Title>
        <Space>
          <Button icon={<SettingOutlined />}>Saved Views</Button>
          <Button type="primary" icon={<FilterOutlined />}>Advanced Filters</Button>
        </Space>
      </div>

      <Row gutter={16}>
        <Col span={6}>
          <Card size="small">
            <Statistic title="Total Patients" value={1423} />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small">
            <Statistic title="Active" value={854} valueStyle={{ color: '#52c41a' }} />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small">
            <Statistic title="Follow-up Due" value={124} valueStyle={{ color: '#faad14' }} />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small">
            <Statistic title="Overdue" value={45} valueStyle={{ color: '#ff4d4f' }} />
          </Card>
        </Col>
      </Row>

      <Card size="small" title="Quick Filters">
        <Space wrap>
          <Select placeholder="Department" style={{ width: 150 }} allowClear>
            <Option value="med_onc">Medical Oncology</Option>
            <Option value="rad_onc">Radiation Oncology</Option>
            <Option value="surg_onc">Surgical Oncology</Option>
          </Select>
          <Select placeholder="Care Stage" style={{ width: 150 }} allowClear>
            <Option value="SCREENING">Screening</Option>
            <Option value="DIAGNOSIS">Diagnosis</Option>
            <Option value="ACTIVE_TREATMENT">Active Treatment</Option>
            <Option value="FOLLOW_UP">Follow-up</Option>
          </Select>
          <Select placeholder="Status" style={{ width: 150 }} allowClear onChange={setStatus}>
            {Object.values(PatientStatus).map(s => <Option key={s} value={s}>{s}</Option>)}
          </Select>
        </Space>
      </Card>

      <Card bodyStyle={{ padding: 0 }}>
        <Table 
          columns={columns}
          dataSource={data?.data || []}
          rowKey="id"
          loading={isLoading}
          pagination={{
            current: data?.meta.currentPage || 1,
            pageSize: data?.meta.itemsPerPage || 15,
            total: data?.meta.totalItems || 0,
            onChange: setPage
          }}
          size="middle"
        />
      </Card>
    </div>
  );
}
