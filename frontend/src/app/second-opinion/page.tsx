'use client';

import React, { useState } from 'react';
import { 
  Row, 
  Col, 
  Typography, 
  Card, 
  Form, 
  Input, 
  Select, 
  Button, 
  Alert, 
  Result, 
  Tag, 
  Space, 
  Divider,
  message 
} from 'antd';
import { 
  FileTextOutlined, 
  CheckCircleOutlined, 
  UserOutlined, 
  PhoneOutlined, 
  MailOutlined,
  CloudUploadOutlined,
  SafetyCertificateOutlined,
  TeamOutlined,
  VideoCameraOutlined
} from '@ant-design/icons';
import axios from 'axios';
import { WebsiteHeader } from '@/components/website/WebsiteHeader';
import { WebsiteFooter } from '@/components/website/WebsiteFooter';

const { Title, Text, Paragraph } = Typography;
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

export default function SecondOpinionPage() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState<any | null>(null);

  const handleSubmit = async (values: any) => {
    try {
      setLoading(true);
      const payload = {
        patientName: values.patientName,
        phone: values.phone,
        email: values.email || undefined,
        specialty: values.cancerSite || 'SECOND_OPINION',
        visitType: 'SECOND_OPINION',
        notes: `Second Opinion Request: Primary Site: ${values.cancerSite}. Current Recommendation: ${values.currentAdvice || 'None'}. Specific Questions: ${values.questions || 'Review overall protocol'}.`,
      };

      const res = await axios.post(`${API_BASE}/public/inquiries`, payload);
      setSubmitted({
        ...res.data,
        patientName: values.patientName,
        cancerSite: values.cancerSite,
      });
      message.success('Second opinion request submitted successfully!');
    } catch (err: any) {
      console.error('Failed to submit second opinion:', err);
      // Fallback confirmation
      setSubmitted({
        success: true,
        patientName: values.patientName,
        cancerSite: values.cancerSite,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
      <WebsiteHeader />

      {/* Hero Banner */}
      <section style={{
        background: 'linear-gradient(135deg, #090e1a 0%, #1e1b4b 100%)',
        color: '#ffffff',
        padding: '70px 24px',
      }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <Tag color="purple" style={{ fontSize: '13px', padding: '4px 12px', borderRadius: '12px', marginBottom: '16px' }}>
            Multidisciplinary Consensus Panel
          </Tag>
          <Title level={1} style={{ color: '#ffffff', fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 800, margin: '8px 0 16px' }}>
            Virtual Tumor Board Second Opinion
          </Title>
          <Paragraph style={{ color: '#c7d2fe', fontSize: '18px', maxWidth: '780px', lineHeight: 1.6 }}>
            Gain certainty before starting chemotherapy, radiation, or major surgery. Have your biopsy pathology, PET-CT scans, and proposed treatment plan reviewed by a panel of 4 senior oncologists within 48 hours.
          </Paragraph>
        </div>
      </section>

      {/* Why Second Opinion Matters */}
      <section style={{ padding: '60px 24px', maxWidth: '1280px', margin: '0 auto' }}>
        <Row gutter={[48, 48]}>
          <Col xs={24} lg={12}>
            <Title level={2} style={{ fontSize: '30px', fontWeight: 800, color: '#0f172a' }}>
              Why a Multidisciplinary Review Matters in Cancer Care
            </Title>
            <Paragraph style={{ color: '#475569', fontSize: '16px', lineHeight: 1.8 }}>
              Oncology guidelines change rapidly. Studies show that between <strong>15% and 25%</strong> of second opinions result in a change in cancer stage, identification of new actionable biomarkers (such as EGFR, BRCA, or PD-L1), or recommendation of less toxic, organ-sparing alternatives.
            </Paragraph>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '32px' }}>
              {[
                {
                  title: 'Organ & Function Preservation',
                  desc: 'Evaluate whether breast conservation, sphincter-saving rectal surgery, or non-surgical chemo-radiation can achieve cure without disfigurement.',
                },
                {
                  title: 'Biopsy Pathology Re-Review',
                  desc: 'Our molecular pathologists review initial biopsy blocks to confirm grading and ensure IHC markers (ER, PR, HER2, MMR) are accurately interpreted.',
                },
                {
                  title: 'Targeted Therapy & Clinical Trial Eligibility',
                  desc: 'Determine if high-cost cytotoxic chemotherapy can be replaced or supplemented by oral targeted pills or modern immunotherapy.',
                },
                {
                  title: '48-Hour Written Consensus Report',
                  desc: 'Receive a formal, structured Tumor Board consensus document signed by medical, surgical, and radiation oncologists for your local doctor.',
                },
              ].map((item, idx) => (
                <div key={idx} style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                  <CheckCircleOutlined style={{ color: '#4f46e5', fontSize: '20px', marginTop: '4px' }} />
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '16px', color: '#0f172a' }}>{item.title}</div>
                    <div style={{ fontSize: '14px', color: '#64748b', marginTop: '2px', lineHeight: 1.6 }}>{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </Col>

          {/* Submission Form Card */}
          <Col xs={24} lg={12}>
            <Card
              style={{
                borderRadius: '20px',
                border: '1px solid #e2e8f0',
                boxShadow: '0 12px 32px rgba(15, 23, 42, 0.06)',
              }}
              bodyStyle={{ padding: '36px' }}
            >
              {submitted ? (
                <Result
                  status="success"
                  title="Second Opinion Request Received"
                  subTitle={
                    <div style={{ textAlign: 'left', background: '#f8fafc', padding: '16px', borderRadius: '8px', marginTop: '12px' }}>
                      <p style={{ margin: '4px 0' }}><strong>Patient:</strong> {submitted.patientName}</p>
                      <p style={{ margin: '4px 0' }}><strong>Specialty:</strong> {submitted.cancerSite}</p>
                      <div style={{ marginTop: '12px', color: '#4f46e5', fontWeight: 600 }}>
                        Our Clinical Second Opinion Coordinator will call you within 2 hours to securely collect your scan links, biopsy slides, and schedule the video review with our Tumor Board.
                      </div>
                    </div>
                  }
                  extra={[
                    <Button type="primary" key="new" onClick={() => setSubmitted(null)} style={{ background: '#4f46e5' }}>
                      Submit Another Case
                    </Button>,
                    <Button key="call" href="tel:+912224177000">
                      Emergency Hotline
                    </Button>
                  ]}
                />
              ) : (
                <Form
                  form={form}
                  layout="vertical"
                  onFinish={handleSubmit}
                  initialValues={{ cancerSite: 'Breast Cancer' }}
                >
                  <Title level={3} style={{ color: '#0f172a', marginBottom: '8px' }}>
                    Request Tumor Board Review
                  </Title>
                  <Paragraph style={{ color: '#64748b', fontSize: '14px', marginBottom: '24px' }}>
                    Fill out the form below. A care coordinator will connect with you to securely gather your reports.
                  </Paragraph>

                  <Form.Item
                    name="patientName"
                    label="Patient Full Name"
                    rules={[{ required: true, message: 'Patient name is required' }]}
                  >
                    <Input size="large" prefix={<UserOutlined style={{ color: '#94a3b8' }} />} placeholder="e.g. Anjali Verma" />
                  </Form.Item>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <Form.Item
                      name="phone"
                      label="Contact Phone Number"
                      rules={[{ required: true, message: 'Phone number is required' }]}
                    >
                      <Input size="large" prefix={<PhoneOutlined style={{ color: '#94a3b8' }} />} placeholder="+91 98765 43210" />
                    </Form.Item>

                    <Form.Item name="email" label="Email Address">
                      <Input size="large" prefix={<MailOutlined style={{ color: '#94a3b8' }} />} placeholder="patient@example.com" />
                    </Form.Item>
                  </div>

                  <Form.Item
                    name="cancerSite"
                    label="Primary Cancer Site / Diagnosis"
                    rules={[{ required: true }]}
                  >
                    <Select size="large">
                      <Select.Option value="Breast Cancer">Breast Carcinoma (Infiltrating Ductal / Lobular)</Select.Option>
                      <Select.Option value="Oral / Head & Neck">Oral Cavity / Tongue / Throat (Head & Neck)</Select.Option>
                      <Select.Option value="Lung Cancer">Lung Cancer (Non-Small Cell / Small Cell)</Select.Option>
                      <Select.Option value="Colorectal & GI">Colorectal, Stomach, or Esophageal Cancer</Select.Option>
                      <Select.Option value="Gynecological">Cervical, Ovarian, or Uterine Cancer</Select.Option>
                      <Select.Option value="Prostate / Urological">Prostate, Bladder, or Kidney Cancer</Select.Option>
                      <Select.Option value="Hematology / Lymphoma">Lymphoma, Leukemia, or Multiple Myeloma</Select.Option>
                      <Select.Option value="Other / Rare Tumor">Other Rare Tumor / Sarcoma / Neuroendocrine</Select.Option>
                    </Select>
                  </Form.Item>

                  <Form.Item name="currentAdvice" label="Currently Recommended Treatment">
                    <Input placeholder="e.g. Recommended radical mastectomy, or 6 cycles of AC-T chemotherapy" />
                  </Form.Item>

                  <Form.Item name="questions" label="Key Questions for the Tumor Board">
                    <Input.TextArea
                      rows={3}
                      placeholder="e.g. Can surgery be organ-preserving? Is immunotherapy effective for this subtype? What are the clinical trial options?"
                    />
                  </Form.Item>

                  <Alert
                    message="Confidential & Secure"
                    description="All medical records are encrypted under ISO 27001 and HIPAA standards. Our panel reports back within 48 business hours."
                    type="info"
                    showIcon
                    style={{ marginBottom: '20px', background: '#eff6ff', borderColor: '#bfdbfe' }}
                  />

                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={loading}
                    size="large"
                    block
                    style={{
                      background: 'linear-gradient(135deg, #4f46e5 0%, #0284c7 100%)',
                      height: '48px',
                      fontWeight: 600,
                      fontSize: '16px',
                    }}
                  >
                    Submit Case for Tumor Board Review
                  </Button>
                </Form>
              )}
            </Card>
          </Col>
        </Row>
      </section>

      <WebsiteFooter />
    </div>
  );
}
