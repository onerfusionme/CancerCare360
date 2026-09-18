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
  Form,
  Input,
  Select,
  Upload,
  Steps,
  Alert,
  Tabs,
  Badge,
  message,
  Divider,
} from 'antd';
import {
  AuditOutlined,
  UploadOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  VideoCameraOutlined,
  SafetyCertificateOutlined,
  FilePdfOutlined,
  HeartOutlined,
  MedicineBoxOutlined,
  UserOutlined,
  RightOutlined,
  LeftOutlined,
} from '@ant-design/icons';
import { SecondOpinionDetailModal } from '@/components/second-opinion/SecondOpinionDetailModal';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

export default function PatientSecondOpinionPage() {
  const [activeTab, setActiveTab] = useState<'submit' | 'track'>('track');
  const [currentStep, setCurrentStep] = useState(0);
  const [form] = Form.useForm();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [myCases, setMyCases] = useState<any[]>([]);
  const [selectedCase, setSelectedCase] = useState<any | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const fetchCases = async () => {
    try {
      const res = await fetch('http://localhost:3001/api/v1/second-opinion');
      if (res.ok) {
        const data = await res.json();
        setMyCases(data);
      }
    } catch (err) {
      console.error('Error fetching patient cases:', err);
    }
  };

  useEffect(() => {
    fetchCases();
  }, []);

  const handleSubmitInquiry = async () => {
    try {
      const values = await form.validateFields();
      setIsSubmitting(true);

      const payload = {
        ...values,
        clinicalUrgency: 'ROUTINE',
        documents: [
          {
            documentType: 'BIOPSY_IHC',
            fileName: 'Biopsy_Histopathology_Report.pdf',
            fileUrl: '/mock/docs/sample_biopsy.pdf',
            fileSize: 2200000,
          },
          {
            documentType: 'PET_CT',
            fileName: 'PET_CT_Full_Body_Scan.pdf',
            fileUrl: '/mock/docs/sample_petct.pdf',
            fileSize: 4500000,
          },
        ],
      };

      const res = await fetch('http://localhost:3001/api/v1/second-opinion/inquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error('Failed to submit inquiry.');

      message.success('Your second opinion request has been submitted! Our oncology team will review within 48 hours.');
      form.resetFields();
      setCurrentStep(0);
      setActiveTab('track');
      fetchCases();
    } catch (err: any) {
      message.error(err?.message || 'Error submitting second opinion request.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusStepIndex = (status: string) => {
    switch (status) {
      case 'INQUIRY_SUBMITTED':
      case 'DOCUMENTS_PENDING':
        return 0;
      case 'UNDER_TRIAGE':
      case 'PATHOLOGY_REVIEW':
        return 1;
      case 'SPECIALIST_ASSIGNED':
      case 'TUMOR_BOARD_SCHEDULED':
        return 2;
      case 'REPORT_DRAFTED':
      case 'REPORT_DELIVERED':
      case 'PATIENT_ONBOARDED':
        return 3;
      default:
        return 0;
    }
  };

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24, padding: '12px 0 40px' }}>
      {/* Patient Friendly Hero Banner */}
      <div
        className="glass-hero"
        style={{
          padding: '32px 36px',
          background: 'linear-gradient(135deg, rgba(30, 27, 75, 0.96) 0%, rgba(67, 56, 202, 0.9) 60%, rgba(99, 102, 241, 0.85) 100%)',
        }}
      >
        <Row align="middle" justify="space-between" gutter={[24, 20]}>
          <Col xs={24} md={16}>
            <Space direction="vertical" size={8}>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  padding: '4px 12px',
                  borderRadius: 9999,
                  background: 'rgba(255, 255, 255, 0.18)',
                  fontSize: 12,
                  fontWeight: 700,
                  color: '#ffffff',
                }}
              >
                <SafetyCertificateOutlined style={{ marginRight: 6 }} /> Precision Oncology Verification
              </span>
              <Title level={2} style={{ margin: 0, color: '#ffffff', fontWeight: 800 }}>
                Get an Expert Cancer Second Opinion
              </Title>
              <Paragraph style={{ margin: 0, color: 'rgba(241, 245, 249, 0.95)', fontSize: 14, maxWidth: 680 }}>
                Up to 40% of cancer treatment plans can be optimized for better outcomes and organ preservation. Upload your biopsy and PET-CT scan from home to receive a comprehensive review from our Tumor Board within 48 hours.
              </Paragraph>
            </Space>
          </Col>

          <Col xs={24} md={8} style={{ textAlign: 'right' }}>
            <div
              style={{
                background: 'rgba(255, 255, 255, 0.12)',
                padding: '16px 20px',
                borderRadius: 14,
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                textAlign: 'left',
              }}
            >
              <div style={{ color: '#ffffff', fontWeight: 700, fontSize: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
                <ClockCircleOutlined style={{ color: '#34d399' }} /> 48-Hour Review SLA
              </div>
              <div style={{ color: 'rgba(255, 255, 255, 0.85)', fontSize: 12, marginTop: 4 }}>
                Surgical, Medical, and Radiation Oncologist panel consensus with side-by-side comparison report.
              </div>
            </div>
          </Col>
        </Row>
      </div>

      {/* Main Tabs */}
      <Tabs
        activeKey={activeTab}
        onChange={(k) => setActiveTab(k as any)}
        size="large"
        items={[
          {
            key: 'track',
            label: (
              <span style={{ fontWeight: 700, fontSize: 15 }}>
                <ClockCircleOutlined /> My Second Opinion Requests ({myCases.length})
              </span>
            ),
            children: (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                {myCases.length > 0 ? (
                  myCases.map((c) => (
                    <Card
                      key={c.id}
                      className="glass-card"
                      style={{ borderRadius: 16 }}
                      styles={{ body: { padding: 24 } }}
                    >
                      <Row justify="space-between" align="top" gutter={[16, 16]}>
                        <Col xs={24} md={16}>
                          <Space direction="vertical" size={4}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                              <span style={{ fontSize: 12, fontWeight: 700, color: '#818cf8' }}>
                                Case: {c.caseNumber}
                              </span>
                              <Tag color="purple">{c.cancerType}</Tag>
                              {c.concordanceLevel === 'DISCORDANCE' && (
                                <Tag color="error">Plan Changed / Optimized</Tag>
                              )}
                              {c.concordanceLevel === 'PARTIAL_CONCORDANCE' && (
                                <Tag color="warning">Organ-Preserving Option Found</Tag>
                              )}
                              {c.concordanceLevel === 'FULL_CONCORDANCE' && (
                                <Tag color="success">First Plan Confirmed</Tag>
                              )}
                            </div>

                            <Title level={4} style={{ margin: '4px 0 0 0', fontWeight: 800 }}>
                              {c.patientName}
                            </Title>
                            <Text type="secondary" style={{ fontSize: 13 }}>
                              Outside Hospital: <b>{c.primaryHospital || 'Local Oncology Center'}</b>
                            </Text>
                          </Space>
                        </Col>

                        <Col xs={24} md={8} style={{ textAlign: 'right' }}>
                          <Space>
                            {c.teleConsultMeetingUrl && (
                              <Button
                                type="default"
                                icon={<VideoCameraOutlined />}
                                href={c.teleConsultMeetingUrl}
                                target="_blank"
                              >
                                Join Video Call
                              </Button>
                            )}
                            <Button
                              type="primary"
                              icon={<AuditOutlined />}
                              onClick={() => {
                                setSelectedCase(c);
                                setIsDetailModalOpen(true);
                              }}
                              style={{ background: '#4f46e5', fontWeight: 600 }}
                            >
                              View Consensus Report
                            </Button>
                          </Space>
                        </Col>
                      </Row>

                      <Divider style={{ margin: '20px 0' }} />

                      {/* Progress Steps */}
                      <Steps
                        current={getStatusStepIndex(c.status)}
                        size="small"
                        items={[
                          { title: 'Inquiry Submitted', description: 'Records received' },
                          { title: 'Triage & Pathology', description: 'Scans verified' },
                          { title: 'Tumor Board Review', description: 'Specialist panel' },
                          { title: 'Consensus Ready', description: 'Dossier delivered' },
                        ]}
                      />

                      {/* Side by Side Preview Banner */}
                      {c.consensusOpinion && (
                        <div
                          style={{
                            marginTop: 20,
                            padding: 16,
                            borderRadius: 12,
                            background: 'rgba(99, 102, 241, 0.08)',
                            border: '1px solid rgba(99, 102, 241, 0.2)',
                          }}
                        >
                          <Row gutter={[16, 12]}>
                            <Col xs={24} md={12}>
                              <div style={{ fontSize: 11, fontWeight: 700, opacity: 0.7, textTransform: 'uppercase' }}>
                                Outside First Doctor Recommended:
                              </div>
                              <div style={{ fontSize: 13, fontWeight: 600, color: '#f43f5e', marginTop: 2 }}>
                                {c.primaryTreatmentPlan || 'Initial surgical resection or standard chemo'}
                              </div>
                            </Col>

                            <Col xs={24} md={12}>
                              <div style={{ fontSize: 11, fontWeight: 700, color: '#10b981', textTransform: 'uppercase' }}>
                                CancerCare360 Expert Recommendation:
                              </div>
                              <div style={{ fontSize: 13, fontWeight: 700, color: '#10b981', marginTop: 2 }}>
                                {c.recommendedRegimen || c.consensusOpinion}
                              </div>
                            </Col>
                          </Row>
                        </div>
                      )}
                    </Card>
                  ))
                ) : (
                  <Card className="glass-card" style={{ textAlign: 'center', padding: 48 }}>
                    <AuditOutlined style={{ fontSize: 42, color: '#818cf8', marginBottom: 12 }} />
                    <Title level={4}>No Second Opinion Requests Yet</Title>
                    <Paragraph type="secondary">
                      You have not submitted any cases for second opinion review. Click the tab above to submit your diagnosis and diagnostic scans.
                    </Paragraph>
                    <Button type="primary" onClick={() => setActiveTab('submit')}>
                      Submit New Case for Second Opinion
                    </Button>
                  </Card>
                )}
              </div>
            ),
          },
          {
            key: 'submit',
            label: (
              <span style={{ fontWeight: 700, fontSize: 15 }}>
                <AuditOutlined /> Submit New Second Opinion Request
              </span>
            ),
            children: (
              <Card className="glass-card" style={{ borderRadius: 16 }} styles={{ body: { padding: 32 } }}>
                <Steps
                  current={currentStep}
                  style={{ marginBottom: 32 }}
                  items={[
                    { title: 'Patient & Diagnosis', description: 'Outside hospital details' },
                    { title: 'Upload Diagnostics', description: 'Biopsy & scan reports' },
                    { title: 'Review & Submit', description: '48h expert review' },
                  ]}
                />

                <Form form={form} layout="vertical">
                  {/* Step 1: Patient & Diagnosis */}
                  {currentStep === 0 && (
                    <div>
                      <Title level={4} style={{ marginBottom: 16 }}>
                        1. Patient Background & Current Diagnosis
                      </Title>

                      <Row gutter={[16, 0]}>
                        <Col xs={24} md={12}>
                          <Form.Item
                            name="patientName"
                            label="Patient Full Name"
                            rules={[{ required: true, message: 'Please enter patient name' }]}
                          >
                            <Input placeholder="e.g. Ramesh Kumar" />
                          </Form.Item>
                        </Col>

                        <Col xs={24} md={12}>
                          <Form.Item
                            name="phone"
                            label="Phone Number (for WhatsApp/SMS updates)"
                            rules={[{ required: true, message: 'Please enter phone number' }]}
                          >
                            <Input placeholder="e.g. +91 98201 45892" />
                          </Form.Item>
                        </Col>
                      </Row>

                      <Row gutter={[16, 0]}>
                        <Col xs={24} md={8}>
                          <Form.Item name="age" label="Patient Age">
                            <Input type="number" placeholder="54" />
                          </Form.Item>
                        </Col>

                        <Col xs={24} md={8}>
                          <Form.Item name="gender" label="Gender" initialValue="MALE">
                            <Select
                              options={[
                                { value: 'MALE', label: 'Male' },
                                { value: 'FEMALE', label: 'Female' },
                                { value: 'OTHER', label: 'Other' },
                              ]}
                            />
                          </Form.Item>
                        </Col>

                        <Col xs={24} md={8}>
                          <Form.Item name="city" label="City / Hometown">
                            <Input placeholder="e.g. Nagpur, Maharashtra" />
                          </Form.Item>
                        </Col>
                      </Row>

                      <Row gutter={[16, 0]}>
                        <Col xs={24} md={12}>
                          <Form.Item
                            name="cancerType"
                            label="Cancer Site / Suspected Diagnosis"
                            rules={[{ required: true, message: 'Please specify cancer type' }]}
                          >
                            <Input placeholder="e.g. Lung Cancer, Breast Cancer, Colon Cancer" />
                          </Form.Item>
                        </Col>

                        <Col xs={24} md={12}>
                          <Form.Item name="primaryHospital" label="First Hospital Consulted">
                            <Input placeholder="e.g. Apollo Clinic Nagpur, Local Civil Hospital" />
                          </Form.Item>
                        </Col>
                      </Row>

                      <Form.Item name="primaryTreatmentPlan" label="What did your first doctor recommend?">
                        <TextArea
                          rows={2}
                          placeholder="e.g. Doctor advised immediate surgery to remove the lung on Monday costing 6 Lakhs..."
                        />
                      </Form.Item>

                      <Form.Item name="inquiryReason" label="What is your main question or doubt?">
                        <TextArea
                          rows={2}
                          placeholder="e.g. Is surgery the only way? Can chemo or targeted therapy save the organ?"
                        />
                      </Form.Item>

                      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16 }}>
                        <Button
                          type="primary"
                          icon={<RightOutlined />}
                          onClick={async () => {
                            await form.validateFields(['patientName', 'phone', 'cancerType']);
                            setCurrentStep(1);
                          }}
                        >
                          Continue to Upload Reports
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Step 2: Upload Diagnostics */}
                  {currentStep === 1 && (
                    <div>
                      <Title level={4} style={{ marginBottom: 8 }}>
                        2. Upload Diagnostic Reports & Scans
                      </Title>
                      <Paragraph type="secondary" style={{ marginBottom: 20 }}>
                        Upload clear PDF copies or photos of your biopsy report, PET-CT scan, MRI, or previous prescriptions.
                      </Paragraph>

                      <div
                        style={{
                          padding: 32,
                          border: '2px dashed rgba(99, 102, 241, 0.4)',
                          borderRadius: 16,
                          textAlign: 'center',
                          background: 'rgba(99, 102, 241, 0.04)',
                          marginBottom: 20,
                        }}
                      >
                        <FilePdfOutlined style={{ fontSize: 44, color: '#6366f1', marginBottom: 12 }} />
                        <Title level={5} style={{ margin: 0 }}>Drag & Drop Your Cancer Reports Here</Title>
                        <Paragraph type="secondary" style={{ fontSize: 13, marginTop: 4 }}>
                          Supports PDF, JPG, PNG, and DICOM ZIP files up to 50MB.
                        </Paragraph>
                        <Upload fileList={[]}>
                          <Button icon={<UploadOutlined />} style={{ marginTop: 8 }}>
                            Select Files from Device
                          </Button>
                        </Upload>
                      </div>

                      <Alert
                        message="Simulated Document Intake"
                        description="For demonstration, sample biopsy and PET-CT scans will be automatically linked to your case for instant tumor board inspection."
                        type="info"
                        showIcon
                        style={{ marginBottom: 20 }}
                      />

                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Button icon={<LeftOutlined />} onClick={() => setCurrentStep(0)}>
                          Back
                        </Button>
                        <Button type="primary" icon={<RightOutlined />} onClick={() => setCurrentStep(2)}>
                          Proceed to Confirmation
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Step 3: Review & Submit */}
                  {currentStep === 2 && (
                    <div>
                      <Title level={4} style={{ marginBottom: 16 }}>
                        3. Review & Submit for Expert Review
                      </Title>

                      <div
                        style={{
                          padding: 20,
                          borderRadius: 12,
                          background: 'rgba(255, 255, 255, 0.04)',
                          border: '1px solid rgba(255, 255, 255, 0.08)',
                          marginBottom: 20,
                        }}
                      >
                        <Row gutter={[16, 12]}>
                          <Col span={12}>
                            <div>Patient: <b>{form.getFieldValue('patientName')}</b></div>
                            <div>Phone: <b>{form.getFieldValue('phone')}</b></div>
                          </Col>
                          <Col span={12}>
                            <div>Cancer Type: <b>{form.getFieldValue('cancerType')}</b></div>
                            <div>Outside Hospital: <b>{form.getFieldValue('primaryHospital') || 'Not specified'}</b></div>
                          </Col>
                        </Row>
                      </div>

                      <div
                        style={{
                          padding: 16,
                          borderRadius: 10,
                          background: 'rgba(16, 185, 129, 0.1)',
                          border: '1px solid rgba(16, 185, 129, 0.25)',
                          marginBottom: 24,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 12,
                        }}
                      >
                        <CheckCircleOutlined style={{ fontSize: 24, color: '#10b981' }} />
                        <div>
                          <div style={{ fontWeight: 700, color: '#10b981' }}>
                            Guaranteed 48-Hour Oncology Board Turnaround
                          </div>
                          <div style={{ fontSize: 12, opacity: 0.85 }}>
                            Your records will be triaged, evaluated by an organ-specific specialist, and a comprehensive comparison report will be generated.
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Button icon={<LeftOutlined />} onClick={() => setCurrentStep(1)}>
                          Back
                        </Button>
                        <Button
                          type="primary"
                          size="large"
                          icon={<CheckCircleOutlined />}
                          loading={isSubmitting}
                          onClick={handleSubmitInquiry}
                          style={{ background: '#059669', borderColor: '#059669', fontWeight: 700 }}
                        >
                          Submit Case for 48h Second Opinion
                        </Button>
                      </div>
                    </div>
                  )}
                </Form>
              </Card>
            ),
          },
        ]}
      />

      {/* Case Details Modal */}
      <SecondOpinionDetailModal
        open={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        caseData={selectedCase}
        onRefresh={fetchCases}
      />
    </div>
  );
}
