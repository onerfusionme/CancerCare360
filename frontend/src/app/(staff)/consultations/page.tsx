'use client';
import React, { useState } from 'react';
import { Select, Typography, Spin, Empty, Tag, Card, Row, Col, Space, Button, Badge } from 'antd';
import { 
  UserOutlined, 
  MedicineBoxOutlined, 
  CheckCircleOutlined, 
  AlertOutlined, 
  SafetyCertificateOutlined,
  CalendarOutlined,
  SwapOutlined
} from '@ant-design/icons';
import { useConsultationReadiness } from '@/hooks/use-consultation';
import { useAiConsultationSummary } from '@/hooks/use-ai';
import { usePatients } from '@/hooks/use-patients';
import { ReadinessCard } from '@/components/consultation/ReadinessCard';
import { AiSummaryCard } from '@/components/ai/AiSummaryCard';
import { useRouter } from 'next/navigation';

const { Title, Text } = Typography;

export default function ConsultationsPage() {
  const router = useRouter();
  const { data: patientData, isLoading: isPatientsLoading } = usePatients();
  const patientList = Array.isArray(patientData?.data) ? patientData.data : (Array.isArray(patientData) ? patientData : []);
  
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);

  const activePatient = patientList.find((p: any) => p.id === selectedPatientId || p.mrn === selectedPatientId) || patientList[0] || null;

  const { data: readiness, isLoading, refetch } = useConsultationReadiness(activePatient?.id || activePatient?.mrn || '');
  const { data: aiSummary, isLoading: aiLoading } = useAiConsultationSummary(activePatient?.id || activePatient?.mrn || '');

  if (isPatientsLoading) {
    return (
      <div style={{ padding: 40, textAlign: 'center' }}>
        <Spin size="large" tip="Loading clinic patients..." />
      </div>
    );
  }

  if (patientList.length === 0 || !activePatient) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div>
          <Title level={3} style={{ margin: 0, fontWeight: 700 }}>
            Consultation Readiness Briefing
          </Title>
          <Text type="secondary" style={{ fontSize: 13 }}>
            Pre-consultation synthesis: lab deltas, toxicities, treatment progress & actionable care gaps
          </Text>
        </div>
        <Card style={{ textAlign: 'center', padding: '60px 20px', borderRadius: 12 }}>
          <Empty 
            description={
              <div>
                <Title level={4} style={{ marginTop: 16 }}>No Patients Registered</Title>
                <Text type="secondary">
                  There are currently no patients in the clinic register. Please register a patient in the Patients Directory to generate an automated consultation readiness briefing.
                </Text>
              </div>
            }
          >
            <Button type="primary" onClick={() => router.push('/patients/new')} style={{ marginTop: 16, background: '#4f46e5' }}>
              Register Patient
            </Button>
          </Empty>
        </Card>
      </div>
    );
  }

  const patientName = activePatient.name || `${activePatient.firstName || ''} ${activePatient.lastName || ''}`.trim() || 'Patient';
  const patientAge = activePatient.dateOfBirth ? (new Date().getFullYear() - new Date(activePatient.dateOfBirth).getFullYear()) : (activePatient.age || '—');
  const initials = patientName.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() || 'PT';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Top Header & Patient Switcher */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Title level={3} style={{ margin: 0, fontWeight: 700 }}>
              Consultation Readiness Briefing
            </Title>
            <Tag color="indigo" style={{ background: '#e0e7ff', color: '#4338ca', border: '1px solid #c7d2fe', fontWeight: 600 }}>
              CLINICAL BRIEF
            </Tag>
          </div>
          <Text type="secondary" style={{ fontSize: 13 }}>
            Pre-consultation synthesis: lab deltas, toxicities, treatment progress & actionable care gaps
          </Text>
        </div>

        {/* Patient Dropdown & Quick Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Text style={{ fontSize: 12, fontWeight: 600, color: '#64748b' }}>SELECT CLINIC PATIENT:</Text>
          <Select
            value={activePatient.id}
            style={{ width: 380 }}
            onChange={setSelectedPatientId}
            options={patientList.map((p: any) => ({
              value: p.id,
              label: `${p.name || `${p.firstName || ''} ${p.lastName || ''}`.trim() || 'Patient'} (${p.mrn})`
            }))}
            size="large"
          />
        </div>
      </div>

      {/* Patient Medical Ribbon (Hero Banner) */}
      <div style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
        borderRadius: 14,
        padding: '20px 24px',
        color: '#ffffff',
        border: '1px solid #334155',
        boxShadow: '0 4px 12px rgba(15, 23, 42, 0.15)',
      }}>
        {/* Top Demographics Bar */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          flexWrap: 'wrap', 
          gap: 12,
          paddingBottom: 16,
          borderBottom: '1px solid rgba(255,255,255,0.1)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{
              width: 50,
              height: 50,
              borderRadius: 12,
              background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: 18,
              color: '#ffffff',
              boxShadow: '0 4px 12px rgba(79, 70, 229, 0.35)',
            }}>
              {initials}
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 20, fontWeight: 700, color: '#ffffff', letterSpacing: '-0.02em' }}>
                  {patientName}
                </span>
                <span style={{ fontSize: 13, color: '#94a3b8' }}>
                  ({patientAge} Y • {activePatient.gender || 'Unknown'} • Blood Group: {activePatient.bloodGroup || '—'})
                </span>
                <Tag color="success" style={{ background: '#064e3b', color: '#34d399', border: '1px solid #059669', fontWeight: 600 }}>
                  <CheckCircleOutlined /> ABHA: {activePatient.abhaId || activePatient.abhaNumber || 'Verified'}
                </Tag>
              </div>
              <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>
                MRN: <strong style={{ color: '#f8fafc', fontFamily: 'monospace' }}>{activePatient.mrn}</strong> • Facility: City Cancer Center
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <Tag color="magenta" style={{ fontSize: 12, padding: '4px 10px', fontWeight: 700, margin: 0 }}>
              {activePatient.tnmStaging || activePatient.careStage || 'Staged'}
            </Tag>
            <Tag color="purple" style={{ fontSize: 12, padding: '4px 10px', fontWeight: 700, margin: 0 }}>
              {activePatient.ecogScore ? `ECOG ${activePatient.ecogScore}` : 'ECOG Evaluated'}
            </Tag>
          </div>
        </div>

        {/* Clinical Parameters Strip */}
        <Row gutter={[16, 12]} style={{ paddingTop: 16 }}>
          <Col xs={24} sm={12} md={6}>
            <div style={{ fontSize: 11, color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>
              Primary Diagnosis
            </div>
            <div style={{ fontSize: 13, color: '#f8fafc', fontWeight: 600, marginTop: 2 }}>
              {activePatient.primaryDiagnosis || activePatient.cancerSite || 'Oncology Workup'}
            </div>
            <div style={{ fontSize: 11, color: '#cbd5e1' }}>{activePatient.subsite || 'Clinical Diagnosis'}</div>
          </Col>

          <Col xs={24} sm={12} md={6}>
            <div style={{ fontSize: 11, color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>
              Current Care Stage
            </div>
            <div style={{ fontSize: 13, color: '#c7d2fe', fontWeight: 600, marginTop: 2 }}>
              {activePatient.careStage || 'Evaluation'}
            </div>
            <div style={{ fontSize: 11, color: '#cbd5e1' }}>Multidisciplinary Protocol</div>
          </Col>

          <Col xs={24} sm={12} md={6}>
            <div style={{ fontSize: 11, color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>
              Status
            </div>
            <div style={{ fontSize: 13, color: '#fed7aa', fontWeight: 600, marginTop: 2 }}>
              {activePatient.status || 'Active'}
            </div>
            <div style={{ fontSize: 11, color: '#fca5a5', fontWeight: 600 }}>In Care Continuity</div>
          </Col>

          <Col xs={24} sm={12} md={6}>
            <div style={{ fontSize: 11, color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>
              Primary Physician
            </div>
            <div style={{ fontSize: 13, color: '#f8fafc', fontWeight: 700, marginTop: 2 }}>
              {activePatient.primaryDoctorName || 'Consultant Oncologist'}
            </div>
            <div style={{ fontSize: 11, color: '#cbd5e1' }}>Department of Medical Oncology</div>
          </Col>
        </Row>
      </div>

      {/* AI Pre-Consultation Summary Card */}
      <AiSummaryCard 
        summary={aiSummary} 
        isLoading={aiLoading} 
      />

      {/* 3-Tab Consultation Workspace */}
      <ReadinessCard readiness={readiness} loading={isLoading} onRefresh={refetch} />
    </div>
  );
}
