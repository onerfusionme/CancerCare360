'use client';

import React from 'react';
import { Card, Button, Typography, Space, Tag, Row, Col, Badge, Tooltip } from 'antd';
import { 
  ClockCircleOutlined, 
  UserOutlined, 
  RightOutlined, 
  CheckOutlined, 
  AlertOutlined,
  ThunderboltOutlined,
  PlayCircleOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';
import { Appointment, AppointmentStatus } from '@/types/appointment';

const { Title, Text } = Typography;

interface ClinicFlowBoardProps {
  appointments: Appointment[];
  doctorId: string;
  onStatusChange: (id: string, newStatus: AppointmentStatus) => void;
}

export default function ClinicFlowBoard({ appointments, doctorId, onStatusChange }: ClinicFlowBoardProps) {
  // If appointments from backend is empty, provide a rich clinical cohort
  const defaultAppointments: any[] = [
    {
      id: 'apt-1',
      patient: { name: 'Priya Sharma', mrn: 'MRN-ONC-2026-001' },
      cancerSite: 'Breast (Stage IIB)',
      appointmentType: 'Chemotherapy Cycle 4 Review',
      scheduledAt: new Date(Date.now() - 35 * 60 * 1000).toISOString(),
      waitingDurationMinutes: 32,
      status: AppointmentStatus.CHECKED_IN,
      room: 'OPD Room 3',
      alert: 'ANC 1,100 /uL Critical',
    },
    {
      id: 'apt-2',
      patient: { name: 'Rajesh Patel', mrn: 'MRN-ONC-2026-042' },
      cancerSite: 'Lung NSCLC (Stage IIIA)',
      appointmentType: 'Biopsy Pathology Review',
      scheduledAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
      waitingDurationMinutes: 14,
      status: AppointmentStatus.CHECKED_IN,
      room: 'Waiting Bay B',
    },
    {
      id: 'apt-3',
      patient: { name: 'Sunita Mehra', mrn: 'MRN-ONC-2026-055' },
      cancerSite: 'Ovarian (Stage IC)',
      appointmentType: 'Cycle 2 Carboplatin Review',
      scheduledAt: new Date(Date.now() - 40 * 60 * 1000).toISOString(),
      waitingDurationMinutes: 8,
      status: AppointmentStatus.IN_PROGRESS,
      room: 'Consultation Suite 1',
      doctor: 'Dr. Jane Smith',
    },
    {
      id: 'apt-4',
      patient: { name: 'Amitabh Joshi', mrn: 'MRN-ONC-2026-061' },
      cancerSite: 'Head & Neck (SCC)',
      appointmentType: 'Radiation Restaging Follow-up',
      scheduledAt: new Date(Date.now() + 20 * 60 * 1000).toISOString(),
      status: AppointmentStatus.SCHEDULED,
      doctor: 'Dr. Jane Smith',
    },
    {
      id: 'apt-5',
      patient: { name: 'Kavita Rao', mrn: 'MRN-ONC-2026-074' },
      cancerSite: 'Colorectal (Stage II)',
      appointmentType: 'Post-Op Follow-up & CEA Lab',
      scheduledAt: new Date(Date.now() + 50 * 60 * 1000).toISOString(),
      status: AppointmentStatus.SCHEDULED,
      doctor: 'Dr. Jane Smith',
    },
    {
      id: 'apt-6',
      patient: { name: 'Vikram Malhotra', mrn: 'MRN-ONC-2026-018' },
      cancerSite: 'Colon (Stage III)',
      appointmentType: 'Pre-Chemo Evaluation',
      scheduledAt: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
      status: AppointmentStatus.COMPLETED,
      room: 'Infusion Bay 4',
      doctor: 'Dr. Jane Smith',
    },
  ];

  const effectiveAppointments = appointments && appointments.length > 0 ? appointments : defaultAppointments;

  const scheduled = effectiveAppointments.filter(a => a.status === AppointmentStatus.SCHEDULED || a.status === AppointmentStatus.CONFIRMED);
  const waiting = effectiveAppointments.filter(a => a.status === AppointmentStatus.CHECKED_IN);
  const inConsultation = effectiveAppointments.filter(a => a.status === AppointmentStatus.IN_PROGRESS);
  const completed = effectiveAppointments.filter(a => a.status === AppointmentStatus.COMPLETED);

  const renderCard = (appointment: any, actions: React.ReactNode, borderTheme?: string) => {
    const isUrgentWait = (appointment.waitingDurationMinutes || 0) >= 25;
    const isWarningWait = (appointment.waitingDurationMinutes || 0) >= 15;

    return (
      <Card 
        size="small" 
        style={{ 
          marginBottom: 12, 
          borderRadius: 10,
          border: isUrgentWait ? '1px solid #fca5a5' : '1px solid #e2e8f0',
          background: '#ffffff',
          boxShadow: isUrgentWait ? '0 2px 8px rgba(225, 29, 72, 0.08)' : '0 1px 3px rgba(0,0,0,0.04)',
        }} 
        bodyStyle={{ padding: 14 }}
        key={appointment.id}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{
              width: 28,
              height: 28,
              borderRadius: 6,
              background: '#e0e7ff',
              color: '#4f46e5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: 11
            }}>
              {(appointment.patient?.name || 'PT').split(' ').map((n: string) => n[0]).join('')}
            </span>
            <div>
              <span style={{ fontWeight: 700, color: '#0f172a', fontSize: 13, display: 'block', lineHeight: 1.2 }}>
                {appointment.patient?.name || 'Unknown Patient'}
              </span>
              <span style={{ fontSize: 11, color: '#64748b', fontFamily: 'monospace' }}>
                {appointment.patient?.mrn || 'MRN-ONC-2026-XXX'}
              </span>
            </div>
          </div>
          <span style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>
            {appointment.scheduledAt ? new Date(appointment.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
          </span>
        </div>

        {appointment.cancerSite && (
          <div style={{ marginBottom: 6 }}>
            <Tag color="purple" style={{ fontSize: 10, fontWeight: 600, margin: 0 }}>
              {appointment.cancerSite}
            </Tag>
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8, flexWrap: 'wrap' }}>
          <Tag color="blue" style={{ fontSize: 11, margin: 0 }}>
            {appointment.appointmentType}
          </Tag>
          {appointment.room && (
            <Tag style={{ fontSize: 10, margin: 0, background: '#f1f5f9', color: '#475569' }}>
              {appointment.room}
            </Tag>
          )}
        </div>

        {/* Wait Time Indicator with SLA Pulse */}
        {appointment.waitingDurationMinutes !== undefined && appointment.status === AppointmentStatus.CHECKED_IN && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '4px 8px',
            borderRadius: 6,
            background: isUrgentWait ? '#fee2e2' : isWarningWait ? '#fef3c7' : '#ecfdf5',
            marginBottom: 8,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                background: isUrgentWait ? '#dc2626' : isWarningWait ? '#d97706' : '#10b981',
                animation: isUrgentWait ? 'sla-pulse 1.5s infinite' : 'none'
              }} />
              <span style={{
                fontSize: 11,
                fontWeight: 700,
                color: isUrgentWait ? '#991b1b' : isWarningWait ? '#92400e' : '#065f46'
              }}>
                Wait Time: {appointment.waitingDurationMinutes}m
              </span>
            </div>
            {isUrgentWait && (
              <span style={{ fontSize: 10, fontWeight: 800, color: '#dc2626' }}>
                SLA BREACH (&gt;25m)
              </span>
            )}
          </div>
        )}

        {appointment.alert && (
          <div style={{
            fontSize: 11,
            color: '#be123c',
            background: '#fff1f2',
            padding: '3px 6px',
            borderRadius: 4,
            fontWeight: 600,
            marginBottom: 8,
            display: 'flex',
            alignItems: 'center',
            gap: 4
          }}>
            <AlertOutlined /> {appointment.alert}
          </div>
        )}

        <div style={{ marginTop: 8 }}>
          {actions}
        </div>
      </Card>
    );
  };

  return (
    <Row gutter={[16, 16]}>
      {/* Column 1: Scheduled */}
      <Col xs={24} sm={12} lg={6}>
        <div style={{ 
          background: '#f8fafc', 
          border: '1px solid #e2e8f0', 
          borderRadius: 12, 
          padding: '14px 12px', 
          minHeight: 620 
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, padding: '0 4px' }}>
            <span style={{ fontWeight: 700, fontSize: 13, color: '#1e293b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Scheduled / Confirmed
            </span>
            <span style={{ 
              background: '#e0e7ff', 
              color: '#4338ca', 
              fontWeight: 700, 
              fontSize: 12, 
              padding: '2px 8px', 
              borderRadius: 12 
            }}>
              {scheduled.length}
            </span>
          </div>

          {scheduled.map(a => renderCard(a, (
            <Button 
              size="small" 
              type="primary" 
              block 
              style={{ background: '#4f46e5', height: 32, fontWeight: 600 }}
              onClick={() => onStatusChange(a.id, AppointmentStatus.CHECKED_IN)}
            >
              Check In Patient
            </Button>
          )))}
        </div>
      </Col>

      {/* Column 2: Waiting in Clinic */}
      <Col xs={24} sm={12} lg={6}>
        <div style={{ 
          background: '#fffbeb', 
          border: '1px solid #fef3c7', 
          borderRadius: 12, 
          padding: '14px 12px', 
          minHeight: 620 
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, padding: '0 4px' }}>
            <span style={{ fontWeight: 700, fontSize: 13, color: '#92400e', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Waiting Room / OPD
            </span>
            <span style={{ 
              background: '#fde68a', 
              color: '#78350f', 
              fontWeight: 700, 
              fontSize: 12, 
              padding: '2px 8px', 
              borderRadius: 12 
            }}>
              {waiting.length}
            </span>
          </div>

          {waiting.map(a => renderCard(a, (
            <Space direction="vertical" style={{ width: '100%' }} size={6}>
              <Button 
                size="small" 
                type="primary" 
                icon={<PlayCircleOutlined />}
                block 
                style={{ background: '#0284c7', height: 32, fontWeight: 600 }}
                onClick={() => onStatusChange(a.id, AppointmentStatus.IN_PROGRESS)}
              >
                Call In / Start Consult
              </Button>
            </Space>
          )))}
        </div>
      </Col>

      {/* Column 3: In Consultation */}
      <Col xs={24} sm={12} lg={6}>
        <div style={{ 
          background: '#f5f3ff', 
          border: '1px solid #ede9fe', 
          borderRadius: 12, 
          padding: '14px 12px', 
          minHeight: 620 
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, padding: '0 4px' }}>
            <span style={{ fontWeight: 700, fontSize: 13, color: '#5b21b6', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              In Consultation Suite
            </span>
            <span style={{ 
              background: '#ddd6fe', 
              color: '#4c1d95', 
              fontWeight: 700, 
              fontSize: 12, 
              padding: '2px 8px', 
              borderRadius: 12 
            }}>
              {inConsultation.length}
            </span>
          </div>

          {inConsultation.map(a => renderCard(a, (
            <Button 
              size="small" 
              type="primary" 
              icon={<CheckCircleOutlined />}
              block 
              style={{ background: '#059669', height: 32, fontWeight: 600 }}
              onClick={() => onStatusChange(a.id, AppointmentStatus.COMPLETED)}
            >
              Complete & Sign Off
            </Button>
          )))}
        </div>
      </Col>

      {/* Column 4: Completed */}
      <Col xs={24} sm={12} lg={6}>
        <div style={{ 
          background: '#f8fafc', 
          border: '1px solid #e2e8f0', 
          borderRadius: 12, 
          padding: '14px 12px', 
          minHeight: 620 
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, padding: '0 4px' }}>
            <span style={{ fontWeight: 700, fontSize: 13, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Completed Today
            </span>
            <span style={{ 
              background: '#e2e8f0', 
              color: '#334155', 
              fontWeight: 700, 
              fontSize: 12, 
              padding: '2px 8px', 
              borderRadius: 12 
            }}>
              {completed.length}
            </span>
          </div>

          {completed.map(a => renderCard(a, (
            <div style={{ textAlign: 'center', padding: '4px 0' }}>
              <Tag color="green" style={{ fontWeight: 600 }}>
                Consultation Finalized
              </Tag>
            </div>
          )))}
        </div>
      </Col>
    </Row>
  );
}

