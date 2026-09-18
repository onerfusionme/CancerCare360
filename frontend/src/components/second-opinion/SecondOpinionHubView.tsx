'use client';

import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Tag,
  Button,
  Typography,
  Space,
  Input,
  Select,
  Radio,
  Table,
  Badge,
  Tooltip,
  Modal,
  Form,
  message,
  Divider,
} from 'antd';
import {
  AuditOutlined,
  SearchOutlined,
  ReloadOutlined,
  PlusOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  WarningOutlined,
  VideoCameraOutlined,
  AppstoreOutlined,
  TableOutlined,
  MedicineBoxOutlined,
  FilePdfOutlined,
  SafetyCertificateOutlined,
  TeamOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { SecondOpinionDetailModal } from './SecondOpinionDetailModal';

const { Title, Text, Paragraph } = Typography;

interface SecondOpinionCase {
  id: string;
  caseNumber: string;
  patientName: string;
  phone: string;
  email?: string;
  age?: number;
  gender?: string;
  city?: string;
  cancerType: string;
  primaryHospital?: string;
  primaryDoctorName?: string;
  primaryDiagnosis?: string;
  primaryTreatmentPlan?: string;
  inquiryReason?: string;
  clinicalUrgency: string;
  status: string;
  assignedDoctorId?: string;
  assignedDoctor?: { id: string; firstName: string; lastName: string };
  concordanceLevel?: 'FULL_CONCORDANCE' | 'PARTIAL_CONCORDANCE' | 'DISCORDANCE' | null;
  discordanceSummary?: string;
  consensusOpinion?: string;
  recommendedRegimen?: string;
  nccnGuidelineCitation?: string;
  clinicalTrialOption?: string;
  isTumorBoardCase?: boolean;
  tumorBoardDate?: string;
  teleConsultDate?: string;
  teleConsultMeetingUrl?: string;
  patientId?: string;
  documents?: any[];
  createdAt: string;
}

interface Metrics {
  total: number;
  pendingTriage: number;
  underReview: number;
  reportsReady: number;
  onboarded: number;
  concordanceMetrics: {
    totalReviewed: number;
    discordant: number;
    partial: number;
    fullConcordant: number;
    discordanceRate: number;
  };
  averageTurnaroundHours: number;
  patientSatisfactionRate: number;
}

export function SecondOpinionHubView() {
  const [cases, setCases] = useState<SecondOpinionCase[]>([]);
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'board' | 'table'>('board');
  const [selectedCase, setSelectedCase] = useState<SecondOpinionCase | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isNewCaseModalOpen, setIsNewCaseModalOpen] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [specialtyFilter, setSpecialtyFilter] = useState('ALL');
  const [urgencyFilter, setUrgencyFilter] = useState('ALL');

  const [newCaseForm] = Form.useForm();
  const [isSubmittingNewCase, setIsSubmittingNewCase] = useState(false);

  const fetchCases = async () => {
    try {
      setIsLoading(true);
      const [casesRes, metricsRes] = await Promise.all([
        fetch('http://localhost:3001/api/v1/second-opinion'),
        fetch('http://localhost:3001/api/v1/second-opinion/metrics'),
      ]);

      if (casesRes.ok) {
        const casesData = await casesRes.json();
        setCases(casesData);
      }
      if (metricsRes.ok) {
        const metricsData = await metricsRes.json();
        setMetrics(metricsData);
      }
    } catch (err: any) {
      console.error('Error fetching second opinion cases:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCases();
  }, []);

  const handleCreateCase = async () => {
    try {
      const values = await newCaseForm.validateFields();
      setIsSubmittingNewCase(true);

      const res = await fetch('http://localhost:3001/api/v1/second-opinion/inquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      if (!res.ok) throw new Error('Failed to create second opinion case.');

      message.success('Second opinion case registered successfully.');
      setIsNewCaseModalOpen(false);
      newCaseForm.resetFields();
      fetchCases();
    } catch (err: any) {
      message.error(err?.message || 'Error submitting case inquiry.');
    } finally {
      setIsSubmittingNewCase(false);
    }
  };

  // Filtered list
  const filteredCases = cases.filter((c) => {
    const matchesSearch =
      !searchQuery ||
      c.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.caseNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.primaryHospital && c.primaryHospital.toLowerCase().includes(searchQuery.toLowerCase())) ||
      c.cancerType.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesSpecialty =
      specialtyFilter === 'ALL' || c.cancerType.toLowerCase().includes(specialtyFilter.toLowerCase());

    const matchesUrgency = urgencyFilter === 'ALL' || c.clinicalUrgency === urgencyFilter;

    return matchesSearch && matchesSpecialty && matchesUrgency;
  });

  const getUrgencyBadge = (urgency: string) => {
    switch (urgency) {
      case 'STAT':
        return <Tag color="error" style={{ fontWeight: 700 }}>STAT (24h)</Tag>;
      case 'PRIORITY':
        return <Tag color="warning" style={{ fontWeight: 700 }}>PRIORITY (48h)</Tag>;
      default:
        return <Tag color="blue" style={{ fontWeight: 600 }}>ROUTINE</Tag>;
    }
  };

  const getConcordanceTag = (level?: string | null) => {
    switch (level) {
      case 'DISCORDANCE':
        return <Tag color="rose" style={{ background: 'rgba(244, 63, 94, 0.15)', color: '#f43f5e', border: '1px solid rgba(244, 63, 94, 0.35)', fontWeight: 700 }}>DISCORDANCE (Plan Changed)</Tag>;
      case 'PARTIAL_CONCORDANCE':
        return <Tag color="gold" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b', border: '1px solid rgba(245, 158, 11, 0.35)', fontWeight: 700 }}>PARTIAL (Organ-Spared)</Tag>;
      case 'FULL_CONCORDANCE':
        return <Tag color="emerald" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.35)', fontWeight: 700 }}>CONCORDANT (Confirmed)</Tag>;
      default:
        return <Tag style={{ opacity: 0.6 }}>Under MDT Review</Tag>;
    }
  };

  // Kanban column definitions
  const columns = [
    {
      id: 'intake',
      title: 'New Inquiries & Triage',
      badgeColor: '#3b82f6',
      statuses: ['INQUIRY_SUBMITTED', 'DOCUMENTS_PENDING', 'UNDER_TRIAGE'],
    },
    {
      id: 'specialist',
      title: 'MDT Specialist Review',
      badgeColor: '#8b5cf6',
      statuses: ['SPECIALIST_ASSIGNED', 'TUMOR_BOARD_SCHEDULED', 'PATHOLOGY_REVIEW'],
    },
    {
      id: 'ready',
      title: 'Consensus Reports Delivered',
      badgeColor: '#10b981',
      statuses: ['REPORT_DRAFTED', 'REPORT_DELIVERED'],
    },
    {
      id: 'onboarded',
      title: 'Onboarded In-Treatment',
      badgeColor: '#059669',
      statuses: ['PATIENT_ONBOARDED'],
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Glassmorphic Hero Banner */}
      <div
        className="glass-hero"
        style={{
          padding: '28px 32px',
          background: 'linear-gradient(135deg, rgba(30, 27, 75, 0.95) 0%, rgba(49, 46, 129, 0.9) 50%, rgba(99, 102, 241, 0.85) 100%)',
        }}
      >
        <Row align="middle" justify="space-between" gutter={[20, 20]}>
          <Col xs={24} md={16}>
            <Space direction="vertical" size={6}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    padding: '4px 12px',
                    borderRadius: 9999,
                    background: 'rgba(255, 255, 255, 0.16)',
                    fontSize: 12,
                    fontWeight: 700,
                    letterSpacing: '0.05em',
                    textTransform: 'uppercase',
                    color: '#ffffff',
                  }}
                >
                  <AuditOutlined style={{ marginRight: 6 }} /> Clinical Governance Phase
                </span>
                <span style={{ fontSize: 12, opacity: 0.9, color: '#e0e7ff' }}>
                  NCCN / ESMO Guideline Auditing & Tumor Board Consensus
                </span>
              </div>
              <Title level={2} style={{ margin: 0, color: '#ffffff', fontWeight: 800 }}>
                Oncology Second Opinion Hub
              </Title>
              <Paragraph style={{ margin: 0, color: 'rgba(241, 245, 249, 0.92)', fontSize: 14, maxWidth: 720 }}>
                Centralized virtual second opinion workspace for reviewing external cancer diagnoses, evaluating sub-specialist treatment discordance, and coordinating organ-sparing consensus recommendations.
              </Paragraph>
            </Space>
          </Col>

          <Col xs={24} md={8} style={{ textAlign: 'right' }}>
            <Space direction="horizontal" size={10} wrap>
              <Button
                icon={<ReloadOutlined />}
                onClick={fetchCases}
                style={{ background: 'rgba(255, 255, 255, 0.12)', color: '#fff', borderColor: 'rgba(255, 255, 255, 0.2)' }}
              >
                Refresh
              </Button>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => setIsNewCaseModalOpen(true)}
                style={{ background: '#ffffff', color: '#312e81', fontWeight: 700, borderColor: '#ffffff' }}
              >
                Intake New Case
              </Button>
            </Space>
          </Col>
        </Row>
      </div>

      {/* 5 KPI Metric Cards */}
      <Row gutter={[16, 16]}>
        <Col xs={12} sm={8} lg={4}>
          <Card className="glass-card" style={{ borderRadius: 14 }} styles={{ body: { padding: '16px' } }}>
            <div style={{ fontSize: 11, fontWeight: 700, opacity: 0.7, textTransform: 'uppercase' }}>
              Total Inquiries
            </div>
            <div style={{ fontSize: 28, fontWeight: 800, marginTop: 4 }}>
              {metrics?.total ?? cases.length}
            </div>
            <div style={{ fontSize: 11, color: '#818cf8', marginTop: 2 }}>All oncology specialties</div>
          </Card>
        </Col>

        <Col xs={12} sm={8} lg={5}>
          <Card className="glass-card" style={{ borderRadius: 14 }} styles={{ body: { padding: '16px' } }}>
            <div style={{ fontSize: 11, fontWeight: 700, opacity: 0.7, textTransform: 'uppercase' }}>
              Pending Triage
            </div>
            <div style={{ fontSize: 28, fontWeight: 800, color: '#f59e0b', marginTop: 4 }}>
              {metrics?.pendingTriage ?? 1}
            </div>
            <div style={{ fontSize: 11, color: '#d97706', marginTop: 2 }}>Records & pathology intake</div>
          </Card>
        </Col>

        <Col xs={12} sm={8} lg={5}>
          <Card className="glass-card" style={{ borderRadius: 14 }} styles={{ body: { padding: '16px' } }}>
            <div style={{ fontSize: 11, fontWeight: 700, opacity: 0.7, textTransform: 'uppercase' }}>
              In Tumor Board Review
            </div>
            <div style={{ fontSize: 28, fontWeight: 800, color: '#6366f1', marginTop: 4 }}>
              {metrics?.underReview ?? 2}
            </div>
            <div style={{ fontSize: 11, color: '#818cf8', marginTop: 2 }}>MDT panel scheduled</div>
          </Card>
        </Col>

        <Col xs={12} sm={8} lg={5}>
          <Card className="glass-card" style={{ borderRadius: 14 }} styles={{ body: { padding: '16px' } }}>
            <div style={{ fontSize: 11, fontWeight: 700, opacity: 0.7, textTransform: 'uppercase' }}>
              Reports Delivered
            </div>
            <div style={{ fontSize: 28, fontWeight: 800, color: '#10b981', marginTop: 4 }}>
              {metrics?.reportsReady ?? 3}
            </div>
            <div style={{ fontSize: 11, color: '#059669', marginTop: 2 }}>Consensus sent to patient</div>
          </Card>
        </Col>

        <Col xs={12} sm={8} lg={5}>
          <Card className="glass-card" style={{ borderRadius: 14 }} styles={{ body: { padding: '16px' } }}>
            <div style={{ fontSize: 11, fontWeight: 700, opacity: 0.7, textTransform: 'uppercase' }}>
              Plan Discordance Rate
            </div>
            <div style={{ fontSize: 28, fontWeight: 800, color: '#f43f5e', marginTop: 4 }}>
              {metrics?.concordanceMetrics.discordanceRate ?? 50}%
            </div>
            <div style={{ fontSize: 11, color: '#e11d48', marginTop: 2 }}>Treatment optimized / changed</div>
          </Card>
        </Col>
      </Row>

      {/* Search & Filter Toolbar */}
      <Card className="glass-card" styles={{ body: { padding: '14px 20px' } }}>
        <Row gutter={[16, 12]} align="middle" justify="space-between">
          <Col xs={24} md={16}>
            <Space wrap size={12}>
              <Input
                placeholder="Search patient, case number, or hospital..."
                prefix={<SearchOutlined style={{ opacity: 0.5 }} />}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ width: 260 }}
                allowClear
              />

              <Select
                value={specialtyFilter}
                onChange={setSpecialtyFilter}
                style={{ width: 170 }}
                options={[
                  { value: 'ALL', label: 'All Specialties' },
                  { value: 'Breast', label: 'Breast Oncology' },
                  { value: 'Lung', label: 'Thoracic / Lung' },
                  { value: 'Rectal', label: 'Colorectal / GI' },
                  { value: 'Prostate', label: 'Uro-Oncology' },
                  { value: 'Leukemia', label: 'Hematology / BMT' },
                  { value: 'Ovarian', label: 'Gynecologic Oncology' },
                ]}
              />

              <Select
                value={urgencyFilter}
                onChange={setUrgencyFilter}
                style={{ width: 140 }}
                options={[
                  { value: 'ALL', label: 'All Urgencies' },
                  { value: 'STAT', label: 'STAT (24h)' },
                  { value: 'PRIORITY', label: 'PRIORITY (48h)' },
                  { value: 'ROUTINE', label: 'ROUTINE (72h)' },
                ]}
              />
            </Space>
          </Col>

          <Col xs={24} md={8} style={{ textAlign: 'right' }}>
            <Radio.Group
              value={viewMode}
              onChange={(e) => setViewMode(e.target.value)}
              buttonStyle="solid"
            >
              <Radio.Button value="board">
                <AppstoreOutlined style={{ marginRight: 4 }} /> Board View
              </Radio.Button>
              <Radio.Button value="table">
                <TableOutlined style={{ marginRight: 4 }} /> Table View
              </Radio.Button>
            </Radio.Group>
          </Col>
        </Row>
      </Card>

      {/* Main Workspace Display */}
      {viewMode === 'board' ? (
        <Row gutter={[16, 16]}>
          {columns.map((col) => {
            const colCases = filteredCases.filter((c) => col.statuses.includes(c.status));

            return (
              <Col xs={24} sm={12} lg={6} key={col.id}>
                <div
                  style={{
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: 16,
                    padding: 16,
                    minHeight: 520,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 12,
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          backgroundColor: col.badgeColor,
                          display: 'inline-block',
                        }}
                      />
                      <span style={{ fontWeight: 700, fontSize: 13 }}>{col.title}</span>
                    </div>
                    <Badge count={colCases.length} style={{ backgroundColor: col.badgeColor }} />
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12, overflowY: 'auto' }}>
                    {colCases.length > 0 ? (
                      colCases.map((c) => (
                        <Card
                          key={c.id}
                          className="glass-card"
                          hoverable
                          size="small"
                          onClick={() => {
                            setSelectedCase(c);
                            setIsDetailModalOpen(true);
                          }}
                          style={{
                            cursor: 'pointer',
                            borderRadius: 12,
                            border: '1px solid rgba(255, 255, 255, 0.08)',
                          }}
                          styles={{ body: { padding: 14 } }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <span style={{ fontSize: 11, opacity: 0.6, fontWeight: 700 }}>
                              {c.caseNumber}
                            </span>
                            {getUrgencyBadge(c.clinicalUrgency)}
                          </div>

                          <div style={{ fontWeight: 700, fontSize: 14, marginTop: 4 }}>
                            {c.patientName}
                          </div>

                          <div style={{ fontSize: 11.5, opacity: 0.8, color: '#818cf8', fontWeight: 600, marginTop: 2 }}>
                            {c.cancerType}
                          </div>

                          <div style={{ fontSize: 11, opacity: 0.7, marginTop: 4 }}>
                            Outside: <b>{c.primaryHospital || 'Local Center'}</b>
                          </div>

                          <div style={{ marginTop: 8 }}>
                            {getConcordanceTag(c.concordanceLevel)}
                          </div>

                          <Divider style={{ margin: '8px 0' }} />

                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 11, opacity: 0.75 }}>
                            <div>
                              <FilePdfOutlined style={{ marginRight: 4 }} />
                              {c.documents?.length || 0} scans
                            </div>
                            <div>
                              {c.assignedDoctor ? `Dr. ${c.assignedDoctor.lastName}` : 'Unassigned'}
                            </div>
                          </div>
                        </Card>
                      ))
                    ) : (
                      <div
                        style={{
                          padding: '36px 16px',
                          textAlign: 'center',
                          opacity: 0.45,
                          fontSize: 12,
                        }}
                      >
                        No cases in this stage.
                      </div>
                    )}
                  </div>
                </div>
              </Col>
            );
          })}
        </Row>
      ) : (
        <Card className="glass-card">
          <Table
            dataSource={filteredCases}
            rowKey="id"
            pagination={{ pageSize: 8 }}
            columns={[
              {
                title: 'Case #',
                dataIndex: 'caseNumber',
                key: 'caseNumber',
                render: (val, record) => (
                  <a
                    style={{ fontWeight: 700 }}
                    onClick={() => {
                      setSelectedCase(record);
                      setIsDetailModalOpen(true);
                    }}
                  >
                    {val}
                  </a>
                ),
              },
              {
                title: 'Patient Name & City',
                dataIndex: 'patientName',
                key: 'patientName',
                render: (val, record) => (
                  <div>
                    <div style={{ fontWeight: 600 }}>{val}</div>
                    <div style={{ fontSize: 11, opacity: 0.65 }}>
                      {record.age}y, {record.gender} • {record.city}
                    </div>
                  </div>
                ),
              },
              {
                title: 'Primary Cancer Site',
                dataIndex: 'cancerType',
                key: 'cancerType',
                render: (val) => <span style={{ fontWeight: 600, color: '#818cf8' }}>{val}</span>,
              },
              {
                title: 'First Hospital',
                dataIndex: 'primaryHospital',
                key: 'primaryHospital',
                ellipsis: true,
              },
              {
                title: 'Urgency',
                dataIndex: 'clinicalUrgency',
                key: 'clinicalUrgency',
                render: (val) => getUrgencyBadge(val),
              },
              {
                title: 'Consensus Outcome',
                dataIndex: 'concordanceLevel',
                key: 'concordanceLevel',
                render: (val) => getConcordanceTag(val),
              },
              {
                title: 'Specialist',
                dataIndex: 'assignedDoctor',
                key: 'assignedDoctor',
                render: (doc) => (doc ? `Dr. ${doc.firstName} ${doc.lastName}` : <Tag>Unassigned</Tag>),
              },
              {
                title: 'Action',
                key: 'action',
                render: (_, record) => (
                  <Button
                    size="small"
                    type="primary"
                    onClick={() => {
                      setSelectedCase(record);
                      setIsDetailModalOpen(true);
                    }}
                  >
                    Review Dossier
                  </Button>
                ),
              },
            ]}
          />
        </Card>
      )}

      {/* Detail Modal */}
      <SecondOpinionDetailModal
        open={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        caseData={selectedCase}
        onRefresh={fetchCases}
      />

      {/* New Case Intake Modal */}
      <Modal
        open={isNewCaseModalOpen}
        onCancel={() => setIsNewCaseModalOpen(false)}
        title={
          <Space>
            <AuditOutlined style={{ color: '#6366f1' }} />
            <span style={{ fontWeight: 700 }}>Register New Second Opinion Case</span>
          </Space>
        }
        onOk={handleCreateCase}
        confirmLoading={isSubmittingNewCase}
        okText="Submit Case for Triage"
        width={680}
      >
        <Form form={newCaseForm} layout="vertical" initialValues={{ clinicalUrgency: 'ROUTINE', gender: 'MALE' }}>
          <Row gutter={[16, 0]}>
            <Col span={14}>
              <Form.Item
                name="patientName"
                label="Full Patient Name"
                rules={[{ required: true, message: 'Please enter patient name' }]}
              >
                <Input placeholder="e.g. Ramesh Kumar" />
              </Form.Item>
            </Col>
            <Col span={10}>
              <Form.Item
                name="phone"
                label="Phone Number"
                rules={[{ required: true, message: 'Please enter phone number' }]}
              >
                <Input placeholder="e.g. +91 98201 45892" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={[16, 0]}>
            <Col span={8}>
              <Form.Item name="age" label="Age">
                <Input type="number" placeholder="54" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="gender" label="Gender">
                <Select
                  options={[
                    { value: 'MALE', label: 'Male' },
                    { value: 'FEMALE', label: 'Female' },
                    { value: 'OTHER', label: 'Other' },
                  ]}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="city" label="Hometown / City">
                <Input placeholder="e.g. Nagpur" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={[16, 0]}>
            <Col span={14}>
              <Form.Item
                name="cancerType"
                label="Primary Cancer Type / Site"
                rules={[{ required: true, message: 'Please specify cancer type' }]}
              >
                <Input placeholder="e.g. Lung Adenocarcinoma, Breast Carcinoma" />
              </Form.Item>
            </Col>
            <Col span={10}>
              <Form.Item name="clinicalUrgency" label="Triage Clinical Urgency">
                <Select
                  options={[
                    { value: 'ROUTINE', label: 'ROUTINE (72h SLA)' },
                    { value: 'PRIORITY', label: 'PRIORITY (48h SLA)' },
                    { value: 'STAT', label: 'STAT (24h Expedited)' },
                  ]}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={[16, 0]}>
            <Col span={12}>
              <Form.Item name="primaryHospital" label="First Hospital Consulted">
                <Input placeholder="e.g. Apollo Clinic Nagpur" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="primaryDoctorName" label="Outside Treating Doctor">
                <Input placeholder="e.g. Dr. S. Sharma" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="primaryDiagnosis" label="Diagnosis Given by First Doctor">
            <Input placeholder="e.g. Stage IIIA NSCLC (cT2a N2 M0)" />
          </Form.Item>

          <Form.Item name="primaryTreatmentPlan" label="Outside Recommended Treatment">
            <Input placeholder="e.g. Upfront Pneumonectomy (Full Lung Removal) + Chemo" />
          </Form.Item>

          <Form.Item name="inquiryReason" label="Reason for Seeking Second Opinion">
            <Input placeholder="e.g. Exploring if targeted oral therapy can avoid lung surgery" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
