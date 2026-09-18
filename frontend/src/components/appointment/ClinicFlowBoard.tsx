'use client';

import React from 'react';
import { Card, Button, Typography, Space, Tag, Row, Col, Badge, Tooltip, Empty } from 'antd';
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
  const effectiveAppointments = appointments || [];

  const scheduled = effectiveAppointments.filter(a => a.status === AppointmentStatus.SCHEDULED || a.status === AppointmentStatus.CONFIRMED);
  const waiting = effectiveAppointments.filter(a => a.status === AppointmentStatus.CHECKED_IN);
  const inConsultation = effectiveAppointments.filter(a => a.status === AppointmentStatus.IN_PROGRESS);
  const completed = effectiveAppointments.filter(a => a.status === AppointmentStatus.COMPLETED);

  const renderCard = (appointment: any, actions: React.ReactNode, borderTheme?: string) => {
    const isUrgentWait = (appointment.waitingDurationMinutes || 0) >= 25;
    const isWarningWait = (appointment.waitingDurationMinutes || 0) >= 15;

    const patientName = appointment.patient?.name || 
      `${appointment.patient?.firstName || ''} ${appointment.patient?.lastName || ''}`.trim() || 
      appointment.patientName || 
      'Patient';
    const patientMrn = appointment.patient?.mrn || appointment.mrn || 'MRN-ONC-2026';
    const initials = patientName.split(' ').filter(Boolean).map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() || 'PT';

    return (
      <Card 
        size="small" 
        className="glass-card"
        style={{ 
          marginBottom: 12, 
          borderRadius: 12,
          border: isUrgentWait ? '1px solid rgba(244, 63, 94, 0.5)' : undefined,
          boxShadow: isUrgentWait ? '0 4px 14px rgba(225, 29, 72, 0.12)' : undefined,
        }} 
        styles={{ body: { padding: 14 } }}
        key={appointment.id}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{
              width: 30,
              height: 30,
              borderRadius: 8,
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: 11,
              boxShadow: '0 2px 6px rgba(99, 102, 241, 0.3)'
            }}>
              {initials}
            </span>
            <div>
              <span style={{ fontWeight: 700, color: 'var(--color-text-primary, #0f172a)', fontSize: 13, display: 'block', lineHeight: 1.2 }}>
                {patientName}
              </span>
              <span style={{ fontSize: 11, color: 'var(--color-text-secondary, #475569)', fontFamily: 'monospace' }}>
                {patientMrn}
              </span>
            </div>
          </div>
          <span style={{ fontSize: 11, color: 'var(--color-text-secondary, #475569)', fontWeight: 600 }}>
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
            <Tag style={{ fontSize: 10, margin: 0, background: 'var(--glass-pill-bg)', border: '1px solid var(--glass-card-border-subtle)' }}>
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
          background: 'var(--glass-card-bg)', 
          backdropFilter: 'var(--glass-blur)',
          WebkitBackdropFilter: 'var(--glass-blur)',
          border: 'var(--glass-border)', 
          borderRadius: 16, 
          padding: '16px 14px', 
          minHeight: 620,
          boxShadow: 'var(--glass-shadow)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, padding: '0 4px' }}>
            <span style={{ fontWeight: 700, fontSize: 13, color: 'var(--color-text-primary, #0f172a)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Scheduled / Confirmed
            </span>
            <span style={{ 
              background: 'rgba(99, 102, 241, 0.15)', 
              color: '#6366f1', 
              fontWeight: 700, 
              fontSize: 12, 
              padding: '2px 8px', 
              borderRadius: 12 
            }}>
              {scheduled.length}
            </span>
          </div>

          {scheduled.length === 0 ? (
            <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No scheduled patients" style={{ marginTop: 80 }} />
          ) : (
            scheduled.map(a => renderCard(a, (
              <Button 
                size="small" 
                type="primary" 
                block 
                style={{ background: '#4f46e5', height: 32, fontWeight: 600, borderRadius: 8 }}
                onClick={() => onStatusChange(a.id, AppointmentStatus.CHECKED_IN)}
              >
                Check In Patient
              </Button>
            )))
          )}
        </div>
      </Col>

      {/* Column 2: Waiting in Clinic */}
      <Col xs={24} sm={12} lg={6}>
        <div style={{ 
          background: 'rgba(245, 158, 11, 0.06)', 
          backdropFilter: 'var(--glass-blur)',
          WebkitBackdropFilter: 'var(--glass-blur)',
          border: '1px solid rgba(245, 158, 11, 0.22)', 
          borderRadius: 16, 
          padding: '16px 14px', 
          minHeight: 620,
          boxShadow: 'var(--glass-shadow)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, padding: '0 4px' }}>
            <span style={{ fontWeight: 700, fontSize: 13, color: '#d97706', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Waiting Room / OPD
            </span>
            <span style={{ 
              background: 'rgba(245, 158, 11, 0.2)', 
              color: '#b45309', 
              fontWeight: 700, 
              fontSize: 12, 
              padding: '2px 8px', 
              borderRadius: 12 
            }}>
              {waiting.length}
            </span>
          </div>

          {waiting.length === 0 ? (
            <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Waiting room empty" style={{ marginTop: 80 }} />
          ) : (
            waiting.map(a => renderCard(a, (
              <Space direction="vertical" style={{ width: '100%' }} size={6}>
                <Button 
                  size="small" 
                  type="primary" 
                  icon={<PlayCircleOutlined />}
                  block 
                  style={{ background: '#0284c7', height: 32, fontWeight: 600, borderRadius: 8 }}
                  onClick={() => onStatusChange(a.id, AppointmentStatus.IN_PROGRESS)}
                >
                  Call In / Start Consult
                </Button>
              </Space>
            )))
          )}
        </div>
      </Col>

      {/* Column 3: In Consultation */}
      <Col xs={24} sm={12} lg={6}>
        <div style={{ 
          background: 'rgba(13, 148, 136, 0.06)', 
          backdropFilter: 'var(--glass-blur)',
          WebkitBackdropFilter: 'var(--glass-blur)',
          border: '1px solid rgba(13, 148, 136, 0.22)', 
          borderRadius: 16, 
          padding: '16px 14px', 
          minHeight: 620,
          boxShadow: 'var(--glass-shadow)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, padding: '0 4px' }}>
            <span style={{ fontWeight: 700, fontSize: 13, color: '#0d9488', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              In Consultation Suite
            </span>
            <span style={{ 
              background: 'rgba(13, 148, 136, 0.2)', 
              color: '#0f766e', 
              fontWeight: 700, 
              fontSize: 12, 
              padding: '2px 8px', 
              borderRadius: 12 
            }}>
              {inConsultation.length}
            </span>
          </div>

          {inConsultation.length === 0 ? (
            <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No active consults" style={{ marginTop: 80 }} />
          ) : (
            inConsultation.map(a => renderCard(a, (
              <Button 
                size="small" 
                type="primary" 
                icon={<CheckCircleOutlined />}
                block 
                style={{ background: '#059669', height: 32, fontWeight: 600, borderRadius: 8 }}
                onClick={() => onStatusChange(a.id, AppointmentStatus.COMPLETED)}
              >
                Complete & Sign Off
              </Button>
            )))
          )}
        </div>
      </Col>

      {/* Column 4: Completed */}
      <Col xs={24} sm={12} lg={6}>
        <div style={{ 
          background: 'var(--glass-card-bg)', 
          backdropFilter: 'var(--glass-blur)',
          WebkitBackdropFilter: 'var(--glass-blur)',
          border: 'var(--glass-border)', 
          borderRadius: 16, 
          padding: '16px 14px', 
          minHeight: 620,
          boxShadow: 'var(--glass-shadow)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, padding: '0 4px' }}>
            <span style={{ fontWeight: 700, fontSize: 13, color: 'var(--color-text-secondary, #334155)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Completed Today
            </span>
            <span style={{ 
              background: 'rgba(148, 163, 184, 0.2)', 
              color: 'var(--color-text-secondary, #334155)', 
              fontWeight: 700, 
              fontSize: 12, 
              padding: '2px 8px', 
              borderRadius: 12 
            }}>
              {completed.length}
            </span>
          </div>

          {completed.length === 0 ? (
            <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No consults completed yet" style={{ marginTop: 80 }} />
          ) : (
            completed.map(a => renderCard(a, (
              <div style={{ textAlign: 'center', padding: '4px 0' }}>
                <Tag color="green" style={{ fontWeight: 600 }}>
                  Consultation Finalized
                </Tag>
              </div>
            )))
          )}
        </div>
      </Col>
    </Row>
  );
}

