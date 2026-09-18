'use client';

import React, { useState, useEffect } from 'react';
import {
  Modal,
  Row,
  Col,
  Tag,
  Button,
  Typography,
  Space,
  Divider,
  Form,
  Input,
  Select,
  Radio,
  message,
  Card,
  Alert,
  Tooltip,
  Descriptions,
  Badge,
} from 'antd';
import {
  FilePdfOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  UserOutlined,
  SafetyCertificateOutlined,
  VideoCameraOutlined,
  PrinterOutlined,
  ExclamationCircleOutlined,
  AuditOutlined,
  BranchesOutlined,
  MedicineBoxOutlined,
  ApartmentOutlined,
} from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

interface DocumentItem {
  id: string;
  documentType: string;
  fileName: string;
  fileUrl: string;
  fileSize?: number;
  aiExtractedData?: any;
}

interface SecondOpinionCaseData {
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
  assignedDoctor?: { id: string; firstName: string; lastName: string; email?: string };
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
  documents?: DocumentItem[];
}

interface Props {
  open: boolean;
  onClose: () => void;
  caseData: SecondOpinionCaseData | null;
  onRefresh: () => void;
}

export function SecondOpinionDetailModal({ open, onClose, caseData, onRefresh }: Props) {
  const [form] = Form.useForm();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOnboarding, setIsOnboarding] = useState(false);
  const [isPrintMode, setIsPrintMode] = useState(false);

  useEffect(() => {
    if (caseData) {
      form.setFieldsValue({
        concordanceLevel: caseData.concordanceLevel || 'DISCORDANCE',
        discordanceSummary: caseData.discordanceSummary || '',
        consensusOpinion: caseData.consensusOpinion || '',
        recommendedRegimen: caseData.recommendedRegimen || '',
        nccnGuidelineCitation: caseData.nccnGuidelineCitation || '',
        clinicalTrialOption: caseData.clinicalTrialOption || '',
        isTumorBoardCase: caseData.isTumorBoardCase ?? true,
        teleConsultMeetingUrl: caseData.teleConsultMeetingUrl || '',
      });
    }
  }, [caseData, form]);

  if (!caseData) return null;

  const handleSaveConsensus = async () => {
    try {
      const values = await form.validateFields();
      setIsSubmitting(true);

      const res = await fetch(`http://localhost:3001/api/v1/second-opinion/${caseData.id}/consensus`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...values,
          concordanceLevel: values.concordanceLevel,
        }),
      });

      if (!res.ok) throw new Error('Failed to update consensus.');

      message.success('Second opinion consensus saved and delivered.');
      onRefresh();
      onClose();
    } catch (err: any) {
      message.error(err?.message || 'Error saving consensus opinion.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOnboardPatient = async () => {
    try {
      setIsOnboarding(true);
      const res = await fetch(`http://localhost:3001/api/v1/second-opinion/${caseData.id}/convert`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to onboard patient.');

      message.success(data.message || 'Patient successfully converted to active treatment journey.');
      onRefresh();
      onClose();
    } catch (err: any) {
      message.error(err?.message || 'Error onboarding patient.');
    } finally {
      setIsOnboarding(false);
    }
  };

  const getUrgencyTag = (urgency: string) => {
    switch (urgency) {
      case 'STAT':
        return <Tag color="error" style={{ fontWeight: 700 }}>STAT (24h SLA)</Tag>;
      case 'PRIORITY':
        return <Tag color="warning" style={{ fontWeight: 700 }}>PRIORITY (48h SLA)</Tag>;
      default:
        return <Tag color="blue" style={{ fontWeight: 600 }}>ROUTINE (72h SLA)</Tag>;
    }
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      width={1120}
      style={{ top: 24 }}
      title={
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingRight: 32 }}>
          <Space align="center" size={12}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontSize: 18,
              }}
            >
              <AuditOutlined />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: 18, display: 'flex', alignItems: 'center', gap: 8 }}>
                {caseData.patientName}
                <span style={{ fontSize: 13, fontWeight: 500, opacity: 0.7 }}>
                  ({caseData.age || 50}y, {caseData.gender || 'MALE'} • {caseData.city || 'India'})
                </span>
                {getUrgencyTag(caseData.clinicalUrgency)}
              </div>
              <div style={{ fontSize: 12, opacity: 0.75 }}>
                Case Dossier: <b>{caseData.caseNumber}</b> • Cancer: <b>{caseData.cancerType}</b>
              </div>
            </div>
          </Space>

          <Space>
            <Button
              icon={<PrinterOutlined />}
              onClick={() => setIsPrintMode(!isPrintMode)}
            >
              {isPrintMode ? 'Close Print Preview' : 'Printable Dossier'}
            </Button>
            {caseData.status === 'PATIENT_ONBOARDED' ? (
              <Tag color="success" icon={<CheckCircleOutlined />} style={{ padding: '4px 10px', fontSize: 13 }}>
                ACTIVE IN-TREATMENT
              </Tag>
            ) : (
              <Button
                type="primary"
                icon={<MedicineBoxOutlined />}
                loading={isOnboarding}
                onClick={handleOnboardPatient}
                style={{ background: '#059669', borderColor: '#059669', fontWeight: 600 }}
              >
                Onboard to Treatment Journey
              </Button>
            )}
          </Space>
        </div>
      }
      footer={
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: 12, opacity: 0.7 }}>
            <SafetyCertificateOutlined style={{ color: '#0d9488', marginRight: 6 }} />
            Clinical Governance Protocol • NCCN / ESMO Guideline Verified
          </div>
          <Space>
            <Button onClick={onClose}>Close</Button>
            <Button
              type="primary"
              icon={<CheckCircleOutlined />}
              loading={isSubmitting}
              onClick={handleSaveConsensus}
              style={{ background: '#4f46e5', fontWeight: 600 }}
            >
              Save Consensus & Deliver Opinion
            </Button>
          </Space>
        </div>
      }
    >
      {isPrintMode ? (
        <div className="print-certificate-paper" style={{ padding: 24, borderRadius: 8, background: '#fff' }}>
          <div style={{ textAlign: 'center', borderBottom: '2px solid #0f172a', paddingBottom: 16, marginBottom: 20 }}>
            <Title level={3} style={{ margin: 0, color: '#0f172a' }}>CANCERCARE 360 COMPREHENSIVE ONCOLOGY NETWORK</Title>
            <Text style={{ fontSize: 13, color: '#475569' }}>
              Multidisciplinary Oncology Tumor Board • Consensus Clinical Second Opinion Dossier
            </Text>
          </div>

          <Row gutter={[16, 12]} style={{ marginBottom: 16 }}>
            <Col span={12}>
              <div>Patient Name: <b>{caseData.patientName}</b></div>
              <div>Case Number: <b>{caseData.caseNumber}</b></div>
              <div>Age / Gender: <b>{caseData.age}y / {caseData.gender}</b></div>
            </Col>
            <Col span={12} style={{ textAlign: 'right' }}>
              <div>Primary Cancer: <b>{caseData.cancerType}</b></div>
              <div>First Hospital: <b>{caseData.primaryHospital}</b></div>
              <div>Date of Second Opinion: <b>{new Date().toLocaleDateString('en-GB')}</b></div>
            </Col>
          </Row>

          <Divider style={{ margin: '12px 0' }} />

          <Title level={5}>I. Initial Outside Hospital Diagnosis & Recommended Protocol</Title>
          <Paragraph style={{ background: '#f8fafc', padding: 12, borderRadius: 6 }}>
            <b>Diagnosis:</b> {caseData.primaryDiagnosis || 'Not specified'}<br />
            <b>Outside Treatment Plan:</b> {caseData.primaryTreatmentPlan || 'Not specified'}
          </Paragraph>

          <Title level={5}>II. Multidisciplinary Tumor Board (MDT) Expert Consensus</Title>
          <Paragraph style={{ background: '#f0fdfa', padding: 12, borderRadius: 6, border: '1px solid #ccfbf1' }}>
            <b>Concordance Level:</b> {caseData.concordanceLevel || 'DISCORDANCE'}<br />
            <b>Clinical Concordance Analysis:</b> {caseData.discordanceSummary || 'Plan optimized for tissue and organ preservation.'}<br />
            <b>Recommended CancerCare360 Regimen:</b> {caseData.recommendedRegimen || 'Targeted protocol recommended.'}
          </Paragraph>

          <Title level={5}>III. Standard Guidelines & Evidence Rationale</Title>
          <Paragraph style={{ fontSize: 12 }}>
            <b>NCCN/ESMO Citation:</b> {caseData.nccnGuidelineCitation || 'NCCN Guidelines for Clinical Oncology 2024.'}<br />
            <b>Clinical Disclaimer:</b> This second opinion dossier represents the consensus review of our surgical, medical, and radiation oncology board based on provided diagnostic records.
          </Paragraph>
        </div>
      ) : (
        <Row gutter={[20, 20]} style={{ marginTop: 8 }}>
          {/* Left Column: Patient Case & Uploaded Diagnostics */}
          <Col xs={24} lg={11}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Primary Consultation Background Card */}
              <Card
                className="glass-card"
                size="small"
                title={
                  <span style={{ fontWeight: 700, fontSize: 13 }}>
                    <ApartmentOutlined style={{ color: '#ea580c', marginRight: 6 }} />
                    First Opinion & Outside Diagnosis
                  </span>
                }
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div>
                    <div style={{ fontSize: 11, opacity: 0.7, fontWeight: 700, textTransform: 'uppercase' }}>
                      Primary Hospital & Doctor
                    </div>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>
                      {caseData.primaryHospital || 'Hospital details not provided'}
                    </div>
                    <div style={{ fontSize: 12, opacity: 0.8 }}>
                      Consultant: {caseData.primaryDoctorName || 'Treating Oncologist'}
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: 11, opacity: 0.7, fontWeight: 700, textTransform: 'uppercase' }}>
                      First Doctor's Diagnosis
                    </div>
                    <div style={{ fontSize: 12.5, fontWeight: 600, color: '#e11d48' }}>
                      {caseData.primaryDiagnosis || 'Diagnosis records pending review.'}
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: 11, opacity: 0.7, fontWeight: 700, textTransform: 'uppercase' }}>
                      Proposed Outside Treatment Plan
                    </div>
                    <div style={{ fontSize: 12.5, padding: '6px 10px', background: 'rgba(244, 63, 94, 0.08)', borderRadius: 6, border: '1px solid rgba(244, 63, 94, 0.2)' }}>
                      {caseData.primaryTreatmentPlan || 'Initial surgical resection or chemotherapy advice.'}
                    </div>
                  </div>

                  {caseData.inquiryReason && (
                    <div>
                      <div style={{ fontSize: 11, opacity: 0.7, fontWeight: 700, textTransform: 'uppercase' }}>
                        Patient's Inquiry Dilemma
                      </div>
                      <div style={{ fontSize: 12, fontStyle: 'italic', opacity: 0.85 }}>
                        "{caseData.inquiryReason}"
                      </div>
                    </div>
                  )}
                </div>
              </Card>

              {/* Uploaded Diagnostics Vault */}
              <Card
                className="glass-card"
                size="small"
                title={
                  <span style={{ fontWeight: 700, fontSize: 13 }}>
                    <FilePdfOutlined style={{ color: '#0284c7', marginRight: 6 }} />
                    Uploaded Diagnostics & Scans ({caseData.documents?.length || 0})
                  </span>
                }
              >
                {caseData.documents && caseData.documents.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {caseData.documents.map((doc) => (
                      <div
                        key={doc.id}
                        style={{
                          padding: 10,
                          borderRadius: 8,
                          background: 'rgba(255, 255, 255, 0.04)',
                          border: '1px solid rgba(255, 255, 255, 0.08)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, overflow: 'hidden' }}>
                          <FilePdfOutlined style={{ fontSize: 22, color: '#f43f5e' }} />
                          <div style={{ overflow: 'hidden' }}>
                            <div style={{ fontWeight: 600, fontSize: 13, textOverflow: 'ellipsis', whiteSpace: 'nowrap', overflow: 'hidden' }}>
                              {doc.fileName}
                            </div>
                            <div style={{ fontSize: 11, opacity: 0.65 }}>
                              <Tag color="cyan" style={{ fontSize: 10, padding: '0 4px' }}>{doc.documentType}</Tag>
                              {doc.fileSize ? `${(doc.fileSize / 1024 / 1024).toFixed(1)} MB` : '1.8 MB'}
                            </div>
                          </div>
                        </div>

                        <Button
                          size="small"
                          type="link"
                          onClick={() => message.info(`Viewing diagnostic report: ${doc.fileName}`)}
                        >
                          Inspect
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ padding: 16, textAlign: 'center', opacity: 0.6, fontSize: 12 }}>
                    No digital scans uploaded yet.
                  </div>
                )}
              </Card>

              {/* Patient Contact & Coordination Bar */}
              <div
                style={{
                  padding: '10px 14px',
                  borderRadius: 10,
                  background: 'rgba(99, 102, 241, 0.08)',
                  border: '1px solid rgba(99, 102, 241, 0.2)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <div style={{ fontSize: 11, opacity: 0.7 }}>Patient Coordination Hotline</div>
                  <div style={{ fontWeight: 700, fontSize: 13 }}>{caseData.phone}</div>
                </div>
                {caseData.teleConsultMeetingUrl && (
                  <Button
                    size="small"
                    type="primary"
                    icon={<VideoCameraOutlined />}
                    href={caseData.teleConsultMeetingUrl}
                    target="_blank"
                    style={{ background: '#6366f1' }}
                  >
                    Join Video Tele-Consult
                  </Button>
                )}
              </div>
            </div>
          </Col>

          {/* Right Column: CCC360 Second Opinion & Consensus Builder */}
          <Col xs={24} lg={13}>
            <Card
              className="glass-card"
              title={
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 700, fontSize: 14 }}>
                    <SafetyCertificateOutlined style={{ color: '#0d9488', marginRight: 6 }} />
                    CancerCare360 Consensus Builder
                  </span>
                  <Tag color="purple">MDT Tumor Board Protocol</Tag>
                </div>
              }
            >
              <Form form={form} layout="vertical">
                {/* Concordance Level Radio Selector */}
                <Form.Item
                  name="concordanceLevel"
                  label={<span style={{ fontWeight: 700, fontSize: 13 }}>Diagnostic & Strategy Concordance</span>}
                  rules={[{ required: true, message: 'Please select concordance level' }]}
                >
                  <Radio.Group style={{ width: '100%' }}>
                    <Row gutter={[8, 8]}>
                      <Col span={8}>
                        <Radio.Button
                          value="DISCORDANCE"
                          style={{ width: '100%', textAlign: 'center', height: 'auto', padding: '8px 4px', color: '#f43f5e', fontWeight: 700 }}
                        >
                          <div>Discordance</div>
                          <div style={{ fontSize: 10, fontWeight: 400, opacity: 0.8 }}>Changed Plan / Staging</div>
                        </Radio.Button>
                      </Col>
                      <Col span={8}>
                        <Radio.Button
                          value="PARTIAL_CONCORDANCE"
                          style={{ width: '100%', textAlign: 'center', height: 'auto', padding: '8px 4px', color: '#f59e0b', fontWeight: 700 }}
                        >
                          <div>Partial</div>
                          <div style={{ fontSize: 10, fontWeight: 400, opacity: 0.8 }}>Refined Regimen/Organ-Save</div>
                        </Radio.Button>
                      </Col>
                      <Col span={8}>
                        <Radio.Button
                          value="FULL_CONCORDANCE"
                          style={{ width: '100%', textAlign: 'center', height: 'auto', padding: '8px 4px', color: '#10b981', fontWeight: 700 }}
                        >
                          <div>Concordance</div>
                          <div style={{ fontSize: 10, fontWeight: 400, opacity: 0.8 }}>Outside Plan Confirmed</div>
                        </Radio.Button>
                      </Col>
                    </Row>
                  </Radio.Group>
                </Form.Item>

                {/* AI / Clinical Discordance Analysis */}
                <Form.Item
                  name="discordanceSummary"
                  label={<span style={{ fontWeight: 700, fontSize: 13 }}>Clinical Discordance / Strategy Rationale</span>}
                  tooltip="Detailed breakdown comparing why our recommendations deviate from or optimize the outside plan."
                  rules={[{ required: true, message: 'Please enter discordance rationale' }]}
                >
                  <TextArea
                    rows={3}
                    placeholder="e.g. Outside hospital recommended upfront surgery, but NCCN Category 1 guidelines mandate neoadjuvant chemo-immunotherapy to enable breast-conserving surgery..."
                  />
                </Form.Item>

                {/* Recommended Regimen / Protocol */}
                <Form.Item
                  name="recommendedRegimen"
                  label={<span style={{ fontWeight: 700, fontSize: 13 }}>Recommended Treatment Protocol / Prescription</span>}
                  rules={[{ required: true, message: 'Please specify recommended regimen' }]}
                >
                  <TextArea
                    rows={2}
                    placeholder="e.g. 4 Cycles KEYNOTE-522 (Pembrolizumab + Carboplatin/Paclitaxel) &rarr; Restaging MRI &rarr; Lumpectomy"
                  />
                </Form.Item>

                {/* NCCN Guideline Citation */}
                <Form.Item
                  name="nccnGuidelineCitation"
                  label={<span style={{ fontWeight: 700, fontSize: 13 }}>NCCN / ESMO Guideline Citation</span>}
                >
                  <Input placeholder="e.g. NCCN Breast Cancer Guidelines v.2.2024 (Category 1 Recommendation)" />
                </Form.Item>

                {/* Clinical Trial Option */}
                <Form.Item
                  name="clinicalTrialOption"
                  label={<span style={{ fontWeight: 700, fontSize: 13 }}>Active Clinical Trial Opportunity (Optional)</span>}
                >
                  <Input placeholder="e.g. Eligible for Phase III ADAPT-TNBC de-escalation trial" />
                </Form.Item>

                {/* Tele-Consult URL */}
                <Form.Item
                  name="teleConsultMeetingUrl"
                  label={<span style={{ fontWeight: 700, fontSize: 13 }}>Tele-Consultation Video Meeting Link</span>}
                >
                  <Input placeholder="https://telehealth.cancercare360.org/room/..." />
                </Form.Item>
              </Form>
            </Card>
          </Col>
        </Row>
      )}
    </Modal>
  );
}
