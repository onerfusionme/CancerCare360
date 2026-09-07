'use client';

import React, { useState } from 'react';
import { Table, Button, Input, Select, Space, Typography, Card } from 'antd';
import { PlusOutlined, SearchOutlined, ExportOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import { usePatients } from '@/hooks/use-patients';
import { PatientStatus, Gender } from '@/types/patient';
import StatusBadge from '@/components/ui/StatusBadge';
import dayjs from 'dayjs';

const { Title } = Typography;
const { Option } = Select;

export default function PatientsPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<PatientStatus | undefined>(undefined);
  const [gender, setGender] = useState<Gender | undefined>(undefined);

  const { data, isLoading } = usePatients({ 
    page, 
    limit: 10,
    search,
    status,
    gender
  });

  const columns = [
    { title: 'MRN', dataIndex: 'mrn', key: 'mrn', width: 120 },
    { 
      title: 'Name', 
      key: 'name',
      render: (_: any, record: any) => <a onClick={() => router.push(`/patients/${record.id}`)}>{record.firstName} {record.lastName}</a>
    },
    { 
      title: 'Age', 
      key: 'age',
      width: 80,
      render: (_: any, record: any) => dayjs().diff(dayjs(record.dateOfBirth), 'year')
    },
    { title: 'Gender', dataIndex: 'gender', key: 'gender', width: 100 },
    { 
      title: 'Care Stage', 
      dataIndex: 'careStage', 
      key: 'careStage',
      render: (stage: string) => <StatusBadge status={stage} />
    },
    { title: 'Primary Doctor', dataIndex: 'primaryDoctorName', key: 'doctor' },
    { 
      title: 'Status', 
      dataIndex: 'status', 
      key: 'status',
      render: (s: string) => <StatusBadge status={s} />
    },
    { 
      title: 'Last Visit', 
      dataIndex: 'lastVisit', 
      key: 'lastVisit',
      render: (date: string) => date ? dayjs(date).format('DD MMM YYYY') : '-'
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Title level={3} style={{ margin: 0 }}>Patients</Title>
        <Space>
          <Button icon={<ExportOutlined />}>Export</Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => router.push('/patients/new')}>
            Register Patient
          </Button>
        </Space>
      </div>

      <Card size="small">
        <Space wrap>
          <Input 
            placeholder="Search name or MRN" 
            prefix={<SearchOutlined />} 
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: 250 }}
            allowClear
          />
          <Select 
            placeholder="Filter Status" 
            style={{ width: 150 }} 
            allowClear
            onChange={(val) => setStatus(val)}
          >
            {Object.values(PatientStatus).map(s => <Option key={s} value={s}>{s}</Option>)}
          </Select>
          <Select 
            placeholder="Filter Gender" 
            style={{ width: 150 }} 
            allowClear
            onChange={(val) => setGender(val)}
          >
            {Object.values(Gender).map(g => <Option key={g} value={g}>{g}</Option>)}
          </Select>
        </Space>
      </Card>

      <Table 
        columns={columns}
        dataSource={data?.data || []}
        rowKey="id"
        loading={isLoading}
        pagination={{
          current: data?.meta.currentPage || 1,
          pageSize: data?.meta.itemsPerPage || 10,
          total: data?.meta.totalItems || 0,
          onChange: (p) => setPage(p),
          showSizeChanger: false
        }}
      />
    </div>
  );
}
