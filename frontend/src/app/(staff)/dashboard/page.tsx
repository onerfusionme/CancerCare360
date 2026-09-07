'use client';

import React, { useState } from 'react';
import { 
  Segmented, 
  Card, 
  Row, 
  Col, 
  Table,
  Typography, 
  Space, 
  Button, 
  Tag, 
  Alert, 
  Badge, 
  Progress, 
  Input, 
  Tabs, 
  Timeline, 
  message, 
  Tooltip 
} from 'antd';
import { 
  DashboardOutlined,
  SearchOutlined,
  CalendarOutlined, 
  FileTextOutlined, 
  AlertOutlined, 
  CheckCircleOutlined, 
  ClockCircleOutlined, 
  ThunderboltOutlined, 
  UserOutlined, 
  MedicineBoxOutlined, 
  RightOutlined, 
  PhoneOutlined, 
  CheckOutlined,
  PlayCircleOutlined,
  HeartOutlined,
  HomeOutlined,
  PrinterOutlined,
  ShareAltOutlined,
  ExperimentOutlined,
  WarningOutlined,
  ArrowDownOutlined,
  ArrowUpOutlined,
  MinusOutlined,
  SafetyCertificateOutlined,
  CloseCircleOutlined,
  EditOutlined
} from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import { AppointmentStatus } from '@/types/appointment';
import { AiSummaryCard } from '@/components/ai/AiSummaryCard';

const { Title, Text, Paragraph } = Typography;

interface PatientRecord {
  id: string;
  name: string;
  mrn: string;
  age: number;
  gender: string;
  bloodGroup: string;
  abha: string;
  cancerSite: string;
  diagnosis: string;
  tnm: string;
  ecog: string;
  biomarkers: string;
  regimen: string;
  cycle: string;
  allergies: string;
  doctor: string;
  appointmentTime: string;
  waitingMinutes?: number;
  status: AppointmentStatus;
  room?: string;
  urgentGap?: string;
  gapType?: 'CRITICAL' | 'WARNING';
}

const clinicPatients: PatientRecord[] = [
  {
    id: 'p1',
    name: 'Priya Sharma',
    mrn: 'MRN-ONC-2026-001',
    age: 42,
    gender: 'Female',
    bloodGroup: 'B+',
    abha: '91-5544-3322-1100',
    cancerSite: 'Breast (Left Upper Outer)',
    diagnosis: 'Infiltrating Ductal Carcinoma',
    tnm: 'cT2 N1 M0 — Stage IIB',
    ecog: 'ECOG 1',
    biomarkers: 'ER+ (80%) | PR+ (65%) | HER2 Negative',
    regimen: 'AC-T Neoadjuvant Protocol',
    cycle: 'Cycle 4 Paused (ANC 1,100 /uL)',
    allergies: 'Sulfa Drugs (Severe Rash)',
    doctor: 'Dr. Jane Smith',
    appointmentTime: '10:30 AM',
    waitingMinutes: 32,
    status: AppointmentStatus.CHECKED_IN,
    room: 'OPD Room 3',
    urgentGap: 'Chemo Cycle 4 Overdue (7 Days) • ANC 1,100 /uL',
    gapType: 'CRITICAL',
  },
  {
    id: 'p2',
    name: 'Rajesh Patel',
    mrn: 'MRN-ONC-2026-042',
    age: 58,
    gender: 'Male',
    bloodGroup: 'O+',
    abha: '91-8877-6655-4433',
    cancerSite: 'Lung (NSCLC Adenocarcinoma)',
    diagnosis: 'Non-Small Cell Lung Carcinoma',
    tnm: 'cT3 N2 M0 — Stage IIIA',
    ecog: 'ECOG 1',
    biomarkers: 'EGFR & ALK Molecular Mutation Profiling Pending',
    regimen: 'Carboplatin + Pemetrexed Planned',
    cycle: 'Pre-Treatment Workup',
    allergies: 'None Known',
    doctor: 'Dr. Jane Smith',
    appointmentTime: '11:00 AM',
    waitingMinutes: 14,
    status: AppointmentStatus.CHECKED_IN,
    room: 'Waiting Bay B',
    urgentGap: 'Histopathology Biopsy SLA Breached (8 Days)',
    gapType: 'CRITICAL',
  },
  {
    id: 'p3',
    name: 'Sunita Mehra',
    mrn: 'MRN-ONC-2026-055',
    age: 52,
    gender: 'Female',
    bloodGroup: 'AB+',
    abha: '91-6677-8899-0011',
    cancerSite: 'Ovarian (Serous Carcinoma)',
    diagnosis: 'High-Grade Serous Ovarian Carcinoma',
    tnm: 'cT1c N0 M0 — Stage IC',
    ecog: 'ECOG 0',
    biomarkers: 'BRCA1/2 Mutation Negative | CA-125: 42 U/mL',
    regimen: 'Paclitaxel + Carboplatin q3w',
    cycle: 'Cycle 2 Infusion Review',
    allergies: 'Iodinated Radiocontrast (Urticaria)',
    doctor: 'Dr. Jane Smith',
    appointmentTime: '10:00 AM',
    waitingMinutes: 8,
    status: AppointmentStatus.IN_PROGRESS,
    room: 'Consultation Suite 1',
  },
  {
    id: 'p4',
    name: 'Amitabh Joshi',
    mrn: 'MRN-ONC-2026-061',
    age: 61,
    gender: 'Male',
    bloodGroup: 'A+',
    abha: '91-2233-4455-6677',
    cancerSite: 'Head & Neck (Oropharynx)',
    diagnosis: 'Squamous Cell Carcinoma of Oropharynx',
    tnm: 'cT2 N2a M0 — Stage III',
    ecog: 'ECOG 1',
    biomarkers: 'p16 (HPV) Positive',
    regimen: 'Concurrent Chemo-Radiation (70 Gy / 35 fx)',
    cycle: 'Fraction 22 of 35 In Progress',
    allergies: 'None Known',
    doctor: 'Dr. Jane Smith',
    appointmentTime: '11:30 AM',
    status: AppointmentStatus.SCHEDULED,
  },
  {
    id: 'p5',
    name: 'Kavita Rao',
    mrn: 'MRN-ONC-2026-074',
    age: 47,
    gender: 'Female',
    bloodGroup: 'B+',
    abha: '91-9988-7766-5544',
    cancerSite: 'Colorectal (Sigmoid Colon)',
    diagnosis: 'Adenocarcinoma of Sigmoid Colon',
    tnm: 'pT3 N0 M0 — Stage IIA',
    ecog: 'ECOG 0',
    biomarkers: 'MSI-High (dMMR) | BRAF V600E Wild-Type',
    regimen: 'Adjuvant CAPOX (Capecitabine + Oxaliplatin)',
    cycle: 'Post-Op Week 4 Review',
    allergies: 'Latex (Contact Dermatitis)',
    doctor: 'Dr. Jane Smith',
    appointmentTime: '12:00 PM',
    status: AppointmentStatus.SCHEDULED,
  },
  {
    id: 'p6',
    name: 'Vikram Malhotra',
    mrn: 'MRN-ONC-2026-018',
    age: 55,
    gender: 'Male',
    bloodGroup: 'O-',
    abha: '91-1122-3344-5566',
    cancerSite: 'Colon (Hepatic Flexure)',
    diagnosis: 'Invasive Colonic Adenocarcinoma',
    tnm: 'cT3 N1 M0 — Stage III',
    ecog: 'ECOG 1',
    biomarkers: 'KRAS Exon 2 Mutation Detected (Codon 12)',
    regimen: 'FOLFOX-6 (mFOLFOX6)',
    cycle: 'Pre-Chemo Cycle 3 Evaluation',
    allergies: 'Aspirin (Bronchospasm)',
    doctor: 'Dr. Jane Smith',
    appointmentTime: '09:00 AM',
    status: AppointmentStatus.COMPLETED,
    room: 'Infusion Bay 4',
  },
];

export default function UnifiedCockpitPage() {
  const router = useRouter();
  const [selectedPatientId, setSelectedPatientId] = useState<string>('p1');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [patients, setPatients] = useState<PatientRecord[]>(clinicPatients);
  const [activeTab, setActiveTab] = useState<string>('1');

  // Selected Patient
  const selectedPatient = patients.find(p => p.id === selectedPatientId) || patients[0];

  // Filtering
  const filteredPatients = patients.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.mrn.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.cancerSite.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (!matchesSearch) return false;

    if (filterStatus === 'WAITING') return p.status === AppointmentStatus.CHECKED_IN;
    if (filterStatus === 'IN_CONSULT') return p.status === AppointmentStatus.IN_PROGRESS;
    if (filterStatus === 'URGENT') return !!p.urgentGap;
    if (filterStatus === 'SCHEDULED') return p.status === AppointmentStatus.SCHEDULED;
    if (filterStatus === 'COMPLETED') return p.status === AppointmentStatus.COMPLETED;
    return true;
  });

  const handleStatusTransition = (patientId: string, newStatus: AppointmentStatus) => {
    setPatients(prev => prev.map(p => {
      if (p.id === patientId) {
        return {
          ...p,
          status: newStatus,
          waitingMinutes: newStatus === AppointmentStatus.CHECKED_IN ? 5 : p.waitingMinutes
        };
      }
      return p;
    }));
    message.success(`Patient status transitioned to ${newStatus}`);
  };

  const handleOrderStatLab = () => {
    message.success(`Urgent Stat ANC repeat order dispatched to Central Laboratory for ${selectedPatient.name} (LIS #ORD-9921)`);
  };

  const handleSendReminder = () => {
    message.success(`Care continuity WhatsApp reminder & tele-consult link sent to ${selectedPatient.name}`);
  };

  // Lab Delta Data
  const labDeltas = [
    {
      key: '1',
      parameter: 'Absolute Neutrophil Count (ANC)',
      current: '1,100 /uL',
      previous: '2,400 /uL',
      delta: '-1,300',
      trend: 'down',
      reference: '1,500 – 8,000 /uL',
      status: 'CRITICAL LOW',
      statusColor: '#e11d48',
      clinicalNote: 'Hold Chemo Cycle 4 until ANC > 1,500 /uL. Consider G-CSF support.'
    },
    {
      key: '2',
      parameter: 'Hemoglobin (Hb)',
      current: '10.8 g/dL',
      previous: '12.1 g/dL',
      delta: '-1.3',
      trend: 'down',
      reference: '12.0 – 15.5 g/dL',
      status: 'MILD ANEMIA',
      statusColor: '#d97706',
      clinicalNote: 'Consistent with chemotherapy bone marrow suppression.'
    },
    {
      key: '3',
      parameter: 'Platelet Count',
      current: '210,000 /uL',
      previous: '225,000 /uL',
      delta: '-15,000',
      trend: 'down',
      reference: '150,000 – 450,000 /uL',
      status: 'NORMAL',
      statusColor: '#059669',
      clinicalNote: 'Adequate for cytotoxic infusion.'
    },
    {
      key: '4',
      parameter: 'Serum Creatinine',
      current: '0.85 mg/dL',
      previous: '0.82 mg/dL',
      delta: '+0.03',
      trend: 'neutral',
      reference: '0.50 – 1.10 mg/dL',
      status: 'NORMAL',
      statusColor: '#059669',
      clinicalNote: 'Normal renal function; no dose reduction required.'
    },
    {
      key: '5',
      parameter: 'SGPT / ALT',
      current: '34 U/L',
      previous: '31 U/L',
      delta: '+3',
      trend: 'up',
      reference: '7 – 56 U/L',
      status: 'NORMAL',
      statusColor: '#059669',
      clinicalNote: 'Hepatic enzymes stable.'
    },
  ];

  const labColumns = [
    {
      title: 'Lab Investigation',
      dataIndex: 'parameter',
      key: 'parameter',
      render: (text: string, record: any) => (
        <div>
          <div style={{ fontWeight: 600, color: '#0f172a' }}>{text}</div>
          <div style={{ fontSize: 11, color: '#64748b' }}>{record.clinicalNote}</div>
        </div>
      ),
    },
    {
      title: 'Current Value',
      dataIndex: 'current',
      key: 'current',
      render: (text: string, record: any) => (
        <span style={{ fontFamily: 'monospace', fontWeight: 700, color: record.statusColor, fontSize: 14 }}>
          {text}
        </span>
      ),
    },
    {
      title: 'Previous (Last Visit)',
      dataIndex: 'previous',
      key: 'previous',
      render: (text: string) => <span style={{ fontFamily: 'monospace', color: '#64748b' }}>{text}</span>,
    },
    {
      title: 'Delta Shift',
      dataIndex: 'delta',
      key: 'delta',
      render: (text: string, record: any) => (
        <span style={{ 
          color: record.trend === 'down' ? '#e11d48' : record.trend === 'up' ? '#d97706' : '#64748b',
          fontWeight: 600,
          fontFamily: 'monospace',
          display: 'inline-flex',
          alignItems: 'center',
          gap: 4
        }}>
          {record.trend === 'down' && <ArrowDownOutlined />}
          {record.trend === 'up' && <ArrowUpOutlined />}
          {record.trend === 'neutral' && <MinusOutlined />}
          {text}
        </span>
      ),
    },
    {
      title: 'Reference Range',
      dataIndex: 'reference',
      key: 'reference',
      render: (text: string) => <span style={{ fontSize: 12, color: '#64748b' }}>{text}</span>,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string, record: any) => (
        <Tag style={{ 
          color: record.statusColor, 
          borderColor: record.statusColor, 
          background: `${record.statusColor}10`,
          fontWeight: 700,
          fontSize: 11 
        }}>
          {status}
        </Tag>
      ),
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, margin: '-8px -8px 0 -8px' }}>
      
      {/* Top Cockpit Command Bar */}
      <div style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 60%, #312e81 100%)',
        borderRadius: 12,
        padding: '16px 24px',
        color: '#ffffff',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 16,
        boxShadow: '0 4px 12px rgba(15, 23, 42, 0.15)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{
            width: 40,
            height: 40,
            borderRadius: 10,
            background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 20,
            color: '#ffffff',
            boxShadow: '0 2px 8px rgba(79, 70, 229, 0.4)',
          }}>
            <DashboardOutlined />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 17, fontWeight: 700, color: '#ffffff', letterSpacing: '-0.01em' }}>
                Oncology Clinical Cockpit
              </span>
              <Tag color="indigo" style={{ background: '#312e81', color: '#c7d2fe', border: '1px solid #4338ca', fontSize: 11, fontWeight: 600 }}>
                UNIFIED WORKSTATION
              </Tag>
            </div>
            <div style={{ fontSize: 12, color: '#cbd5e1' }}>
              Dr. Jane Smith • Medical Oncology Wing • <strong>14 Patients Roster Today</strong>
            </div>
          </div>
        </div>

        {/* Live Clinic Stats Strip */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: '6px 14px',
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: 20,
            border: '1px solid rgba(255, 255, 255, 0.15)',
            fontSize: 12,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#34d399', boxShadow: '0 0 6px #34d399' }} />
              <span style={{ color: '#e2e8f0', fontWeight: 600 }}>Waiting in OPD:</span>
              <span style={{ fontWeight: 700, color: '#fef08a' }}>2</span>
            </div>
            <span style={{ color: 'rgba(255,255,255,0.3)' }}>|</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ color: '#a5b4fc', fontWeight: 600 }}>1 In Consult</span>
            </div>
            <span style={{ color: 'rgba(255,255,255,0.3)' }}>|</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ background: '#e11d48', color: '#ffffff', padding: '1px 6px', borderRadius: 10, fontWeight: 700, fontSize: 11 }}>
                2 Urgent Gaps
              </span>
            </div>
            <span style={{ color: 'rgba(255,255,255,0.3)' }}>|</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ color: '#94a3b8' }}>Avg Wait: <strong>14m</strong></span>
            </div>
          </div>

          <Button 
            type="primary" 
            icon={<ThunderboltOutlined />}
            onClick={() => message.success('Automated AI Care Gap Audit completed. 2 actionable items verified.')}
            style={{ background: '#4f46e5', borderColor: '#6366f1', fontWeight: 600, height: 34 }}
          >
            Audit Care Gaps
          </Button>
        </div>
      </div>

      {/* Main Split-Screen Cockpit */}
      <div style={{ display: 'flex', gap: 18, alignItems: 'flex-start', minHeight: 'calc(100vh - 170px)' }}>
        
        {/* Left Master Column: Live Patient Queue */}
        <div style={{ 
          width: 380, 
          flexShrink: 0, 
          display: 'flex', 
          flexDirection: 'column', 
          gap: 12,
          background: '#ffffff',
          borderRadius: 12,
          border: '1px solid #e2e8f0',
          padding: 16,
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
        }}>
          {/* Header & Search */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: 700, fontSize: 14, color: '#0f172a' }}>
              Clinic Queue ({filteredPatients.length})
            </span>
            <Tag color="blue" style={{ fontWeight: 600, margin: 0 }}>LIVE FLOW</Tag>
          </div>

          <Input 
            placeholder="Search by Name, MRN, or Diagnosis..." 
            prefix={<SearchOutlined style={{ color: '#94a3b8' }} />}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            allowClear
            style={{ borderRadius: 8 }}
          />

          {/* Filter Pills */}
          <Segmented
            options={[
              { label: 'All', value: 'ALL' },
              { label: 'Waiting', value: 'WAITING' },
              { label: 'In Consult', value: 'IN_CONSULT' },
              { label: 'Urgent', value: 'URGENT' },
              { label: 'Booked', value: 'SCHEDULED' },
            ]}
            value={filterStatus}
            onChange={(val) => setFilterStatus(val as string)}
            size="small"
            style={{ background: '#f1f5f9', padding: 2, borderRadius: 6, fontSize: 11 }}
          />

          {/* Patient Cards List */}
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: 10, 
            maxHeight: 'calc(100vh - 320px)', 
            overflowY: 'auto',
            paddingRight: 2 
          }}>
            {filteredPatients.map((p) => {
              const isSelected = p.id === selectedPatientId;
              const isUrgentWait = (p.waitingMinutes || 0) >= 25;
              const isWarningWait = (p.waitingMinutes || 0) >= 15;

              return (
                <div
                  key={p.id}
                  onClick={() => setSelectedPatientId(p.id)}
                  style={{
                    padding: 12,
                    borderRadius: 10,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease-in-out',
                    background: isSelected ? '#f8fafc' : '#ffffff',
                    border: isSelected 
                      ? '2px solid #4f46e5' 
                      : p.urgentGap 
                      ? '1px solid #fecdd3' 
                      : '1px solid #e2e8f0',
                    boxShadow: isSelected 
                      ? '0 0 0 1px #4f46e5, 0 4px 12px rgba(79, 70, 229, 0.12)' 
                      : '0 1px 2px rgba(0,0,0,0.03)',
                  }}
                >
                  {/* Card Top Row */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{
                        width: 32,
                        height: 32,
                        borderRadius: 8,
                        background: isSelected ? '#4f46e5' : '#e0e7ff',
                        color: isSelected ? '#ffffff' : '#4338ca',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 700,
                        fontSize: 12
                      }}>
                        {p.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 13, color: '#0f172a', lineHeight: 1.2 }}>
                          {p.name}
                        </div>
                        <div style={{ fontSize: 11, color: '#64748b', fontFamily: 'monospace' }}>
                          {p.mrn}
                        </div>
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 11, fontWeight: 600, color: '#475569' }}>
                        {p.appointmentTime}
                      </div>
                      {p.room && (
                        <div style={{ fontSize: 10, color: '#64748b' }}>{p.room}</div>
                      )}
                    </div>
                  </div>

                  {/* Cancer Site Tag */}
                  <div style={{ margin: '6px 0 6px' }}>
                    <Tag color="purple" style={{ fontSize: 10, margin: 0, fontWeight: 600 }}>
                      {p.cancerSite}
                    </Tag>
                  </div>

                  {/* Wait Time Indicator */}
                  {p.waitingMinutes !== undefined && p.status === AppointmentStatus.CHECKED_IN && (
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '3px 8px',
                      borderRadius: 6,
                      background: isUrgentWait ? '#fee2e2' : isWarningWait ? '#fef3c7' : '#ecfdf5',
                      marginBottom: 6,
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
                          Wait: {p.waitingMinutes}m
                        </span>
                      </div>
                      {isUrgentWait && (
                        <span style={{ fontSize: 9, fontWeight: 800, color: '#dc2626' }}>
                          SLA BREACH (&gt;25m)
                        </span>
                      )}
                    </div>
                  )}

                  {/* Urgent Gap Notice */}
                  {p.urgentGap && (
                    <div style={{
                      fontSize: 11,
                      color: '#be123c',
                      background: '#fff1f2',
                      padding: '4px 6px',
                      borderRadius: 4,
                      fontWeight: 600,
                      marginBottom: 6,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4
                    }}>
                      <AlertOutlined /> {p.urgentGap}
                    </div>
                  )}

                  {/* Quick Action Buttons on Card */}
                  <div style={{ display: 'flex', gap: 6, marginTop: 6 }} onClick={(e) => e.stopPropagation()}>
                    {p.status === AppointmentStatus.SCHEDULED && (
                      <Button 
                        size="small" 
                        type="primary" 
                        block 
                        style={{ background: '#4f46e5', height: 26, fontSize: 11 }}
                        onClick={() => handleStatusTransition(p.id, AppointmentStatus.CHECKED_IN)}
                      >
                        Check In
                      </Button>
                    )}
                    {p.status === AppointmentStatus.CHECKED_IN && (
                      <Button 
                        size="small" 
                        type="primary" 
                        icon={<PlayCircleOutlined />} 
                        block 
                        style={{ background: '#0284c7', height: 26, fontSize: 11 }}
                        onClick={() => handleStatusTransition(p.id, AppointmentStatus.IN_PROGRESS)}
                      >
                        Start Consult
                      </Button>
                    )}
                    {p.status === AppointmentStatus.IN_PROGRESS && (
                      <Button 
                        size="small" 
                        type="primary" 
                        icon={<CheckCircleOutlined />} 
                        block 
                        style={{ background: '#059669', height: 26, fontSize: 11 }}
                        onClick={() => handleStatusTransition(p.id, AppointmentStatus.COMPLETED)}
                      >
                        Complete Visit
                      </Button>
                    )}
                    {p.status === AppointmentStatus.COMPLETED && (
                      <Tag color="green" style={{ width: '100%', textAlign: 'center', margin: 0, fontSize: 10 }}>
                        Completed Today
                      </Tag>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Detail Column: Master Patient Clinical Dossier */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 16, minWidth: 0 }}>
          
          {/* Patient Medical Ribbon (Hero Banner) */}
          <div style={{
            background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
            borderRadius: 12,
            padding: '18px 22px',
            color: '#ffffff',
            border: '1px solid #334155',
            boxShadow: '0 4px 12px rgba(15, 23, 42, 0.1)',
          }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              flexWrap: 'wrap', 
              gap: 12,
              paddingBottom: 14,
              borderBottom: '1px solid rgba(255,255,255,0.1)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 46,
                  height: 46,
                  borderRadius: 10,
                  background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  fontSize: 16,
                  color: '#ffffff',
                  boxShadow: '0 2px 8px rgba(79, 70, 229, 0.35)',
                }}>
                  {selectedPatient.name.split(' ').map(n => n[0]).join('')}
                </div>

                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 18, fontWeight: 700, color: '#ffffff' }}>
                      {selectedPatient.name}
                    </span>
                    <span style={{ fontSize: 12, color: '#94a3b8' }}>
                      ({selectedPatient.age} Y • {selectedPatient.gender} • Blood Group: {selectedPatient.bloodGroup})
                    </span>
                    <Tag color="success" style={{ background: '#064e3b', color: '#34d399', border: '1px solid #059669', fontWeight: 600, fontSize: 11 }}>
                      <CheckCircleOutlined /> ABHA: {selectedPatient.abha}
                    </Tag>
                  </div>
                  <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>
                    MRN: <strong style={{ color: '#f8fafc', fontFamily: 'monospace' }}>{selectedPatient.mrn}</strong> • Primary Doctor: {selectedPatient.doctor}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <Tag color="magenta" style={{ fontSize: 11, padding: '3px 8px', fontWeight: 700, margin: 0 }}>
                  {selectedPatient.tnm}
                </Tag>
                <Tag color="purple" style={{ fontSize: 11, padding: '3px 8px', fontWeight: 700, margin: 0 }}>
                  {selectedPatient.ecog}
                </Tag>
              </div>
            </div>

            {/* Clinical Parameters Strip */}
            <Row gutter={[12, 8]} style={{ paddingTop: 12 }}>
              <Col xs={24} sm={12} md={6}>
                <div style={{ fontSize: 10, color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>Diagnosis</div>
                <div style={{ fontSize: 12, color: '#f8fafc', fontWeight: 600 }}>{selectedPatient.diagnosis}</div>
                <div style={{ fontSize: 11, color: '#cbd5e1' }}>{selectedPatient.cancerSite}</div>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <div style={{ fontSize: 10, color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>Biomarkers</div>
                <div style={{ fontSize: 12, color: '#c7d2fe', fontWeight: 600 }}>{selectedPatient.biomarkers}</div>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <div style={{ fontSize: 10, color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>Regimen Status</div>
                <div style={{ fontSize: 12, color: '#fed7aa', fontWeight: 600 }}>{selectedPatient.regimen}</div>
                <div style={{ fontSize: 11, color: '#fca5a5', fontWeight: 600 }}>{selectedPatient.cycle}</div>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <div style={{ fontSize: 10, color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>Known Allergies</div>
                <div style={{ fontSize: 12, color: '#fca5a5', fontWeight: 700 }}>{selectedPatient.allergies}</div>
              </Col>
            </Row>
          </div>

          {/* Unified Clinical Workspace Tabs */}
          <Card 
            style={{ 
              borderRadius: 12, 
              border: '1px solid #e2e8f0',
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
            }}
            bodyStyle={{ padding: '8px 20px 20px' }}
          >
            <Tabs 
              activeKey={activeTab} 
              onChange={setActiveTab}
              size="middle"
              items={[
                {
                  key: '1',
                  label: (
                    <Space>
                      <ExperimentOutlined style={{ color: '#4f46e5' }} />
                      <span style={{ fontWeight: 600 }}>Consultation Readiness & Lab Deltas</span>
                      {selectedPatient.urgentGap && <Badge count="1 Alert" style={{ backgroundColor: '#e11d48', fontSize: 10 }} />}
                    </Space>
                  ),
                  children: (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, paddingTop: 8 }}>
                      {/* AI Pre-Consultation Summary Card */}
                      <AiSummaryCard 
                        summary={{
                          confidenceScore: 94,
                          clinicalTrajectory: `Partial response achieved post-Cycles 1–3 for ${selectedPatient.name}. Treatment currently interrupted due to ANC count of 1,100 /uL.`,
                          currentStatus: 'Afebrile, ambulatory ECOG 1, reporting mild Grade 2 peripheral sensory neuropathy in digits.',
                          attentionPoints: [
                            'ANC dropped to 1,100 /uL (below safe threshold of 1,500 /uL for AC chemotherapy).',
                            'Cycle 4 overdue by 7 days — risk of dose-intensity attenuation.',
                            'Two prior telephone outreach attempts uncompleted; verify home temperature log.',
                            'Assess bilateral hand/foot sensory touch prior to taxane initiation.'
                          ],
                          pendingInvestigations: [
                            'Repeat Complete Blood Count with ANC differential (Stat Priority)',
                            'Restaging PET-CT Scan (Scheduled in 3 weeks)',
                            'Echocardiogram LVEF evaluation prior to cumulative Doxorubicin cap'
                          ],
                          recommendedAgenda: [
                            'Evaluate ANC repeat and determine if G-CSF (Filgrastim 300mcg) is indicated.',
                            'Verify afebrile status and absence of neutropenic infection symptoms.',
                            'Reschedule Chemotherapy Daycare Bay 4 once ANC recovers > 1,500 /uL.'
                          ],
                          clinicalDisclaimer: 'CLINICAL DECISION SUPPORT ONLY (§30 COMPLIANT) — Verification required by treating oncologist.'
                        }}
                        isLoading={false}
                      />

                      {/* Lab Deltas Table */}
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                          <span style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>
                            Longitudinal Lab Comparison Table (Previous vs Current)
                          </span>
                          <span style={{ fontSize: 11, color: '#64748b' }}>Last evaluated: 4 days ago</span>
                        </div>
                        <Table 
                          dataSource={labDeltas} 
                          columns={labColumns} 
                          pagination={false}
                          size="small"
                          style={{ border: '1px solid #f1f5f9', borderRadius: 8, overflow: 'hidden' }}
                        />
                      </div>

                      {/* Radiology & Toxicities */}
                      <Row gutter={[16, 16]}>
                        <Col xs={24} md={12}>
                          <div style={{ padding: 12, background: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0', height: '100%' }}>
                            <div style={{ fontWeight: 700, fontSize: 13, color: '#0f172a', marginBottom: 6 }}>
                              Recent Radiology & Histopathology
                            </div>
                            <div style={{ fontSize: 12, color: '#334155', lineHeight: 1.4 }}>
                              <strong>Contrast Mammogram:</strong> Left upper quadrant primary lesion measures 2.1 x 1.8 cm (down from 3.4 cm baseline, confirming partial metabolic response).
                            </div>
                          </div>
                        </Col>

                        <Col xs={24} md={12}>
                          <div style={{ padding: 12, background: '#fffbeb', borderRadius: 8, border: '1px solid #fef3c7', height: '100%' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                              <span style={{ fontWeight: 700, fontSize: 13, color: '#92400e' }}>
                                CTCAE v5.0 Toxicities
                              </span>
                              <Tag color="orange" style={{ fontWeight: 700, fontSize: 10 }}>GRADE 2</Tag>
                            </div>
                            <div style={{ fontSize: 12, color: '#78350f', lineHeight: 1.4 }}>
                              Grade 2 Peripheral Neuropathy reported in digits. Grade 1 Nausea well controlled with Ondansetron.
                            </div>
                          </div>
                        </Col>
                      </Row>
                    </div>
                  ),
                },
                {
                  key: '2',
                  label: (
                    <Space>
                      <MedicineBoxOutlined style={{ color: '#059669' }} />
                      <span style={{ fontWeight: 600 }}>Chemo Journey Roadmap</span>
                      <Tag color="blue" style={{ fontSize: 10, margin: 0 }}>50% Complete</Tag>
                    </Space>
                  ),
                  children: (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 18, paddingTop: 8 }}>
                      <div style={{ background: '#f8fafc', padding: 16, borderRadius: 10, border: '1px solid #e2e8f0' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                          <div>
                            <span style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>
                              Regimen: AC-T Neoadjuvant Protocol
                            </span>
                            <div style={{ fontSize: 11, color: '#64748b' }}>
                              Doxorubicin + Cyclophosphamide (Cycles 1–4) &rarr; Paclitaxel weekly x 12
                            </div>
                          </div>
                          <Tag color="purple" style={{ fontWeight: 700, fontSize: 11 }}>
                            CYCLE 3 OF 6 COMPLETED
                          </Tag>
                        </div>
                        <Progress percent={50} strokeColor={{ '0%': '#4f46e5', '100%': '#06b6d4' }} status="active" />
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#64748b', marginTop: 4 }}>
                          <span>C1: Complete</span>
                          <span>C2: Complete</span>
                          <span>C3: Complete</span>
                          <span style={{ color: '#e11d48', fontWeight: 700 }}>C4: Paused (ANC 1,100)</span>
                          <span>C5: Planned</span>
                          <span>C6: Planned</span>
                        </div>
                      </div>

                      <Timeline
                        mode="left"
                        items={[
                          {
                            color: 'green',
                            dot: <CheckCircleOutlined />,
                            children: <div><strong>Diagnostic Consensus:</strong> Confirmed Stage IIB • Port inserted</div>
                          },
                          {
                            color: 'green',
                            dot: <CheckCircleOutlined />,
                            children: <div><strong>Cycles 1–3 Chemotherapy:</strong> Good tolerability, partial radiological shrinkage</div>
                          },
                          {
                            color: 'red',
                            dot: <ClockCircleOutlined style={{ color: '#e11d48' }} />,
                            children: <div style={{ color: '#be123c' }}><strong>Cycle 4 Delayed (7 Days):</strong> Pending ANC blood count recovery</div>
                          },
                          {
                            color: 'blue',
                            children: <div><strong>Mid-Treatment Restaging PET-CT:</strong> Scheduled in 3 weeks</div>
                          },
                          {
                            color: 'gray',
                            children: <div style={{ color: '#64748b' }}><strong>Breast Conserving Surgery & SLNB:</strong> Planned Q2 2026</div>
                          }
                        ]}
                      />
                    </div>
                  ),
                },
                {
                  key: '3',
                  label: (
                    <Space>
                      <AlertOutlined style={{ color: '#e11d48' }} />
                      <span style={{ fontWeight: 600 }}>Care Gaps & Action Desk</span>
                      <Badge count="2 Open" style={{ backgroundColor: '#f59e0b', fontSize: 10 }} />
                    </Space>
                  ),
                  children: (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 14, paddingTop: 8 }}>
                      <div style={{ padding: 16, background: '#fff1f2', borderRadius: 10, border: '1px solid #fecdd3' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <Tag color="red" style={{ fontWeight: 700 }}>HIGH PRIORITY GAP</Tag>
                              <span style={{ fontWeight: 700, fontSize: 14, color: '#9f1239' }}>
                                Overdue Chemotherapy Cycle 4 (Delayed 7 Days)
                              </span>
                            </div>
                            <p style={{ margin: '6px 0 0', fontSize: 12, color: '#be123c', maxWidth: 640 }}>
                              Patient did not attend scheduled infusion. ANC was 1,100 /uL on remote lab draw. Protocol requires repeat CBC/ANC.
                            </p>
                          </div>

                          <Space>
                            <Button type="primary" danger icon={<ThunderboltOutlined />} onClick={handleOrderStatLab}>
                              Order Stat ANC Repeat
                            </Button>
                            <Button icon={<PhoneOutlined />} onClick={handleSendReminder}>
                              WhatsApp Reminder
                            </Button>
                          </Space>
                        </div>
                      </div>

                      <div style={{ padding: 16, background: '#fffbeb', borderRadius: 10, border: '1px solid #fef3c7' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <Tag color="gold" style={{ fontWeight: 700 }}>FOLLOW-UP TASK</Tag>
                              <span style={{ fontWeight: 700, fontSize: 14, color: '#92400e' }}>
                                Patient Phone Outreach & Toxicity Check
                              </span>
                            </div>
                            <p style={{ margin: '6px 0 0', fontSize: 12, color: '#b45309', maxWidth: 640 }}>
                              Assigned to Care Coordinator Pooja Verma. Verify temperature logs and absence of fever/chills.
                            </p>
                          </div>

                          <Button 
                            type="default" 
                            style={{ borderColor: '#d97706', color: '#92400e' }}
                            onClick={() => message.success('Outreach call note recorded')}
                          >
                            Log Outreach Call
                          </Button>
                        </div>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, paddingTop: 10, borderTop: '1px solid #f1f5f9' }}>
                        <Button icon={<PrinterOutlined />}>Print Summary</Button>
                        <Button icon={<ShareAltOutlined />}>Export ABDM FHIR</Button>
                      </div>
                    </div>
                  ),
                },
                {
                  key: '4',
                  label: (
                    <Space>
                      <HeartOutlined style={{ color: '#0d9488' }} />
                      <span style={{ fontWeight: 600 }}>Patient Companion View (Mobile Mirror)</span>
                    </Space>
                  ),
                  children: (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, paddingTop: 8 }}>
                      <Alert 
                        message="Patient Portal Mirror: This is the live compassionate view displayed on Priya's smartphone."
                        type="info"
                        showIcon
                      />

                      <div style={{
                        background: 'linear-gradient(135deg, #0f766e 0%, #0d9488 100%)',
                        borderRadius: 12,
                        padding: '16px 20px',
                        color: '#ffffff',
                      }}>
                        <div style={{ fontSize: 11, textTransform: 'uppercase', color: '#ccfbf1', fontWeight: 600 }}>
                          Namaste, Priya Sharma
                        </div>
                        <div style={{ fontSize: 16, fontWeight: 700, marginTop: 2 }}>
                          Cycle 3 of 6 Completed • Blood Test Needed Before Cycle 4
                        </div>
                        <div style={{ fontSize: 12, color: '#e6fffa', marginTop: 4 }}>
                          Your oncologist Dr. Jane Smith has ordered a routine ANC check. You can book a free home sample pickup below.
                        </div>
                      </div>

                      <div style={{ padding: 14, background: '#fffbeb', borderRadius: 8, border: '1px solid #fde68a', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <strong style={{ color: '#92400e', fontSize: 13 }}>Action Needed: Pre-Chemo Blood Count</strong>
                          <div style={{ fontSize: 12, color: '#78350f' }}>Free home phlebotomist arrives at your residence.</div>
                        </div>
                        <Button 
                          type="primary" 
                          icon={<HomeOutlined />} 
                          style={{ background: '#d97706', borderColor: '#d97706' }}
                          onClick={() => message.success('Home sample phlebotomy booked for Priya Sharma')}
                        >
                          Book Free Home Sample
                        </Button>
                      </div>

                      <div style={{ padding: 12, background: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0' }}>
                        <div style={{ fontSize: 12, color: '#64748b' }}>
                          24/7 Nurse Triage Helpline: <strong>+91-1800-419-CARE</strong> • Care Coordinator: Pooja Verma (RN)
                        </div>
                      </div>
                    </div>
                  ),
                },
              ]}
            />
          </Card>

          {/* Quick 1-Click Action Bar */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: '#ffffff',
            padding: '12px 18px',
            borderRadius: 10,
            border: '1px solid #e2e8f0',
            boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 12, color: '#64748b' }}>Current Patient:</span>
              <strong style={{ color: '#0f172a', fontSize: 13 }}>{selectedPatient.name} ({selectedPatient.mrn})</strong>
              <Tag color={selectedPatient.status === AppointmentStatus.CHECKED_IN ? 'orange' : selectedPatient.status === AppointmentStatus.IN_PROGRESS ? 'purple' : 'green'}>
                {selectedPatient.status}
              </Tag>
            </div>

            <Space>
              <Button 
                type="default" 
                icon={<ThunderboltOutlined />} 
                onClick={handleOrderStatLab}
              >
                Order Stat ANC
              </Button>
              <Button 
                type="primary" 
                style={{ background: '#4f46e5' }}
                onClick={() => {
                  handleStatusTransition(selectedPatient.id, AppointmentStatus.COMPLETED);
                  message.success(`Consultation notes saved and visit signed off for ${selectedPatient.name}`);
                }}
              >
                Sign Off & Complete Visit
              </Button>
            </Space>
          </div>

        </div>

      </div>
    </div>
  );
}

