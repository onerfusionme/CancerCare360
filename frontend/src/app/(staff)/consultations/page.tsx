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
import { ReadinessCard } from '@/components/consultation/ReadinessCard';
import { AiSummaryCard } from '@/components/ai/AiSummaryCard';

const { Title, Text } = Typography;

const patientOptions = [
  { 
    value: 'p1', 
    label: 'Priya Sharma (MRN: MRN-ONC-2026-001) — Breast Stage IIB (Chemo Overdue)',
    mrn: 'MRN-ONC-2026-001',
    name: 'Priya Sharma',
    age: 42,
    gender: 'Female',
    bloodGroup: 'B+',
    abha: '91-5544-3322-1100',
    cancerSite: 'Breast (Left Upper Outer Quadrant)',
    diagnosis: 'Infiltrating Ductal Carcinoma',
    tnm: 'cT2 N1 M0 — Stage IIB',
    ecog: 'ECOG 1',
    biomarkers: 'ER+ (80%) | PR+ (65%) | HER2 Negative',
    regimen: 'AC-T Neoadjuvant Protocol',
    cycle: 'Cycle 4 Paused (ANC 1,100)',
    allergies: 'Sulfa Drugs (Severe Rash)',
    doctor: 'Dr. Jane Smith',
    status: 'ACTIVE_TREATMENT'
  },
  { 
    value: 'p2', 
    label: 'Rajesh Patel (MRN: MRN-ONC-2026-042) — Lung NSCLC Stage IIIA (Pending Biopsy)',
    mrn: 'MRN-ONC-2026-042',
    name: 'Rajesh Patel',
    age: 58,
    gender: 'Male',
    bloodGroup: 'O+',
    abha: '91-8877-6655-4433',
    cancerSite: 'Right Lower Lobe Lung',
    diagnosis: 'Non-Small Cell Lung Carcinoma (Adenocarcinoma)',
    tnm: 'cT3 N2 M0 — Stage IIIA',
    ecog: 'ECOG 1',
    biomarkers: 'EGFR Pending | ALK Pending',
    regimen: 'Carboplatin + Pemetrexed Planned',
    cycle: 'Pre-Treatment Workup',
    allergies: 'None Known',
    doctor: 'Dr. Jane Smith',
    status: 'DIAGNOSTIC_WORKUP'
  },
  { 
    value: 'p3', 
    label: 'Ananya Desai (MRN: MRN-ONC-2026-089) — Cervical Stage II (Concurrent Chemo-RT)',
    mrn: 'MRN-ONC-2026-089',
    name: 'Ananya Desai',
    age: 49,
    gender: 'Female',
    bloodGroup: 'A+',
    abha: '91-3322-1144-5566',
    cancerSite: 'Cervix Uteri',
    diagnosis: 'Squamous Cell Carcinoma of Cervix',
    tnm: 'cT2b N0 M0 — Stage IIB',
    ecog: 'ECOG 0',
    biomarkers: 'High-risk HPV Positive (HPV-16)',
    regimen: 'Weekly Cisplatin + External Beam Radiotherapy',
    cycle: 'Week 3 of 5 In Progress',
    allergies: 'Penicillin (Mild Hives)',
    doctor: 'Dr. Jane Smith',
    status: 'ACTIVE_TREATMENT'
  }
];

export default function ConsultationsPage() {
  const [selectedPatientValue, setSelectedPatientValue] = useState<string>('p1');
  const activePatient = patientOptions.find(p => p.value === selectedPatientValue) || patientOptions[0];

  const { data: readiness, isLoading } = useConsultationReadiness(activePatient.mrn);
  const { data: aiSummary, isLoading: aiLoading } = useAiConsultationSummary(activePatient.mrn);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Top Header & Patient Switcher */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Title level={3} style={{ margin: 0, color: '#0f172a', fontWeight: 700 }}>
              Consultation Readiness Briefing
            </Title>
            <Tag color="indigo" style={{ background: '#e0e7ff', color: '#4338ca', border: '1px solid #c7d2fe', fontWeight: 600 }}>
              AI-SYNTHESIZED CLINICAL BRIEF
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
            value={selectedPatientValue}
            style={{ width: 440 }}
            onChange={setSelectedPatientValue}
            options={patientOptions.map(p => ({
              value: p.value,
              label: p.label
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
              {activePatient.name.split(' ').map(n => n[0]).join('')}
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 20, fontWeight: 700, color: '#ffffff', letterSpacing: '-0.02em' }}>
                  {activePatient.name}
                </span>
                <span style={{ fontSize: 13, color: '#94a3b8' }}>
                  ({activePatient.age} Y • {activePatient.gender} • Blood Group: {activePatient.bloodGroup})
                </span>
                <Tag color="success" style={{ background: '#064e3b', color: '#34d399', border: '1px solid #059669', fontWeight: 600 }}>
                  <CheckCircleOutlined /> ABHA VERIFIED: {activePatient.abha}
                </Tag>
              </div>
              <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>
                MRN: <strong style={{ color: '#f8fafc', fontFamily: 'monospace' }}>{activePatient.mrn}</strong> • Facility: City General Hospital • Dept: Medical Oncology
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <Tag color="magenta" style={{ fontSize: 12, padding: '4px 10px', fontWeight: 700, margin: 0 }}>
              {activePatient.tnm}
            </Tag>
            <Tag color="purple" style={{ fontSize: 12, padding: '4px 10px', fontWeight: 700, margin: 0 }}>
              {activePatient.ecog}
            </Tag>
          </div>
        </div>

        {/* Clinical Parameters Strip */}
        <Row gutter={[16, 12]} style={{ paddingTop: 16 }}>
          <Col xs={24} sm={12} md={6}>
            <div style={{ fontSize: 11, color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>
              Primary Malignancy
            </div>
            <div style={{ fontSize: 13, color: '#f8fafc', fontWeight: 600, marginTop: 2 }}>
              {activePatient.diagnosis}
            </div>
            <div style={{ fontSize: 11, color: '#cbd5e1' }}>{activePatient.cancerSite}</div>
          </Col>

          <Col xs={24} sm={12} md={6}>
            <div style={{ fontSize: 11, color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>
              Receptor Biomarkers
            </div>
            <div style={{ fontSize: 13, color: '#c7d2fe', fontWeight: 600, marginTop: 2 }}>
              {activePatient.biomarkers}
            </div>
            <div style={{ fontSize: 11, color: '#cbd5e1' }}>Immunohistochemistry (IHC)</div>
          </Col>

          <Col xs={24} sm={12} md={6}>
            <div style={{ fontSize: 11, color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>
              Active Chemotherapy Regimen
            </div>
            <div style={{ fontSize: 13, color: '#fed7aa', fontWeight: 600, marginTop: 2 }}>
              {activePatient.regimen}
            </div>
            <div style={{ fontSize: 11, color: '#fca5a5', fontWeight: 600 }}>{activePatient.cycle}</div>
          </Col>

          <Col xs={24} sm={12} md={6}>
            <div style={{ fontSize: 11, color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>
              Known Drug Allergies
            </div>
            <div style={{ fontSize: 13, color: '#fca5a5', fontWeight: 700, marginTop: 2 }}>
              {activePatient.allergies}
            </div>
            <div style={{ fontSize: 11, color: '#cbd5e1' }}>Treating Oncologist: {activePatient.doctor}</div>
          </Col>
        </Row>
      </div>

      {/* AI Pre-Consultation Summary Card */}
      <AiSummaryCard 
        summary={aiSummary || {
          confidenceScore: 94,
          clinicalTrajectory: 'Partial radiological response achieved post-Cycles 1–3 (primary lesion reduced from 3.4cm to 2.1cm). Recent treatment interruption of 7 days due to isolated Grade 2 Neutropenia.',
          currentStatus: 'Clinically stable, afebrile, reporting mild Grade 2 peripheral sensory neuropathy. Chemo Cycle 4 pending ANC recovery.',
          attentionPoints: [
            'ANC dropped to 1,100 /uL (CTCAE Grade 2). Below safe threshold for AC chemotherapy (requires > 1,500 /uL).',
            'Chemotherapy Cycle 4 overdue by 7 days — risk of dose-intensity reduction.',
            'Patient reported mild peripheral neuropathy (tingling in digits); assess prior to taxane phase.',
            'Two phone outreach attempts uncompleted; verify home support and temperature logs.'
          ],
          pendingInvestigations: [
            'Repeat Complete Blood Count with ANC differential (Stat Priority)',
            'Mid-Treatment Restaging PET-CT Scan (Scheduled in 3 weeks)',
            'Echocardiogram LVEF re-evaluation prior to cumulative Doxorubicin dose threshold'
          ],
          recommendedAgenda: [
            'Review ANC trend and determine if G-CSF support (Filgrastim 300 mcg) is indicated.',
            'Assess peripheral neuropathy grade and perform neurological touch sensation exam.',
            'Confirm absence of fever/chills or occult signs of neutropenic sepsis.',
            'Reschedule Daycare Infusion Bay 4 for Cycle 4 once ANC confirms > 1,500 /uL.'
          ],
          clinicalDisclaimer: 'CLINICAL DECISION SUPPORT ONLY (§30 COMPLIANT) — All AI recommendations must be verified by the treating oncologist before clinical enactment.'
        }} 
        isLoading={aiLoading} 
      />

      {/* 3-Tab Consultation Workspace */}
      <ReadinessCard readiness={readiness} loading={isLoading} />
    </div>
  );
}
