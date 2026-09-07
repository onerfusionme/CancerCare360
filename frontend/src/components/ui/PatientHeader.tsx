import React from 'react';
import { Card, Space, Typography, Divider, Button } from 'antd';
import { UserOutlined, EditOutlined } from '@ant-design/icons';
import { Patient } from '@/types/patient';
import StatusBadge from './StatusBadge';
import dayjs from 'dayjs';

const { Text, Title } = Typography;

interface PatientHeaderProps {
  patient: Patient;
  onEdit?: () => void;
}

export default function PatientHeader({ patient, onEdit }: PatientHeaderProps) {
  const age = dayjs().diff(dayjs(patient.dateOfBirth), 'year');
  
  return (
    <Card size="small" style={{ marginBottom: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Space size="large" split={<Divider type="vertical" />}>
          <Space size="middle">
            <UserOutlined style={{ fontSize: 24, color: '#1677ff' }} />
            <div>
              <Title level={4} style={{ margin: 0 }}>
                {patient.firstName} {patient.lastName}
              </Title>
              <Text type="secondary">MRN: {patient.mrn}</Text>
            </div>
          </Space>
          
          <div>
            <Text type="secondary" style={{ display: 'block', fontSize: 12 }}>Age / Gender</Text>
            <Text>{age} yrs / {patient.gender}</Text>
          </div>
          
          <div>
            <Text type="secondary" style={{ display: 'block', fontSize: 12 }}>Care Stage</Text>
            <StatusBadge status={patient.careStage} />
          </div>

          <div>
            <Text type="secondary" style={{ display: 'block', fontSize: 12 }}>Primary Doctor</Text>
            <Text>{patient.primaryDoctorName || 'Not Assigned'}</Text>
          </div>
        </Space>
        
        {onEdit && (
          <Button icon={<EditOutlined />} onClick={onEdit}>
            Edit Details
          </Button>
        )}
      </div>
    </Card>
  );
}
