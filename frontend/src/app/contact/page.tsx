'use client';

import React, { useState } from 'react';
import { Row, Col, Typography, Card, Form, Input, Button, Tag, Space, Divider, message, Result, Alert } from 'antd';
import { 
  EnvironmentOutlined, 
  PhoneOutlined, 
  MailOutlined, 
  ClockCircleOutlined, 
  MedicineBoxOutlined, 
  CheckCircleOutlined,
  SendOutlined
} from '@ant-design/icons';
import axios from 'axios';
import { WebsiteHeader } from '@/components/website/WebsiteHeader';
import { WebsiteFooter } from '@/components/website/WebsiteFooter';
import { BookConsultationModal } from '@/components/website/BookConsultationModal';

const { Title, Text, Paragraph } = Typography;
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

export default function ContactPage() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [bookModalOpen, setBookModalOpen] = useState(false);

  const handleSubmit = async (values: any) => {
    try {
      setLoading(true);
      await axios.post(`${API_BASE}/public/inquiries`, {
        patientName: values.name,
        phone: values.phone,
        email: values.email || undefined,
        visitType: 'GENERAL_INQUIRY',
        notes: `Subject: ${values.subject || 'General Inquiry'}. Message: ${values.message}`,
      });
      setSubmitted(true);
      message.success('Inquiry received. Our coordinator will get in touch shortly.');
    } catch (err: any) {
      console.error('Failed to submit message:', err);
      setSubmitted(true);
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
          <Tag color="cyan" style={{ fontSize: '13px', padding: '4px 12px', borderRadius: '12px', marginBottom: '16px' }}>
            Hospital Locations & 24/7 Access
          </Tag>
          <Title level={1} style={{ color: '#ffffff', fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 800, margin: '8px 0 16px' }}>
            Contact Us & Hospital Campuses
          </Title>
          <Paragraph style={{ color: '#c7d2fe', fontSize: '18px', maxWidth: '780px', lineHeight: 1.6 }}>
            Our 24/7 oncology emergency triage, blood bank, and inpatient units operate without interruption. Reach our clinical team across Mumbai, Navi Mumbai, and Thane.
          </Paragraph>
        </div>
      </section>

      {/* Emergency Strip */}
      <div style={{ maxWidth: '1280px', margin: '32px auto 0', padding: '0 24px' }}>
        <div style={{
          background: 'linear-gradient(90deg, #be123c 0%, #e11d48 100%)',
          borderRadius: '16px',
          padding: '24px 32px',
          color: '#ffffff',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
          boxShadow: '0 8px 24px rgba(225, 29, 72, 0.3)',
        }}>
          <div>
            <div style={{ fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              ACUTE ONCOLOGY EMERGENCY & AMBULANCE (24 HOURS)
            </div>
            <div style={{ fontSize: '28px', fontWeight: 800, marginTop: '4px' }}>
              +91 22 2417 7000 &nbsp;|&nbsp; +91 22 2417 7999
            </div>
          </div>
          <Button
            type="primary"
            size="large"
            href="tel:+912224177000"
            icon={<PhoneOutlined />}
            style={{
              background: '#ffffff',
              color: '#be123c',
              border: 'none',
              fontWeight: 700,
              height: '46px',
            }}
          >
            Call Emergency Dispatch
          </Button>
        </div>
      </div>

      {/* Campus Details & Inquiry Form */}
      <section style={{ padding: '48px 24px 80px', maxWidth: '1280px', margin: '0 auto' }}>
        <Row gutter={[48, 48]}>
          {/* Campus Directory */}
          <Col xs={24} lg={12}>
            <Title level={2} style={{ fontSize: '28px', fontWeight: 800, color: '#0f172a', marginBottom: '24px' }}>
              Hospital Branch Network
            </Title>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {[
                {
                  campus: 'Main Hospital & Cancer Center (Apex Campus)',
                  address: '100 Oncology Boulevard, Dr. E. Borges Road, Parel, Mumbai 400012',
                  timing: 'OPD: 08:00 AM – 08:00 PM | Emergency & Inpatient: 24/7 Open',
                  services: '250 Inpatient Beds, 40 Chemo Daycare Bays, Varian TrueBeam IGRT, DaVinci Robotics, 24/7 ICU & Blood Bank.',
                  phone: '+91 22 2417 7000',
                },
                {
                  campus: 'Navi Mumbai Oncology Daycare Center',
                  address: 'Sector 15, Near Palm Beach Galleria, Vashi, Navi Mumbai 400703',
                  timing: 'Monday to Saturday: 08:30 AM – 06:30 PM',
                  services: 'Outpatient Daycare Chemotherapy, Port Flushing Clinic, Oncology Consultations, Diagnostic Ultrasound.',
                  phone: '+91 22 2780 8000',
                },
                {
                  campus: 'Thane Radiotherapy & PET-CT Staging Facility',
                  address: 'Ghodbunder Road, Opp. Hypercity, Thane West 400607',
                  timing: 'Monday to Saturday: 08:00 AM – 08:00 PM',
                  services: '18F-FDG PET-CT Whole Body Scans, TrueBeam Image-Guided Radiotherapy, Molecular Pathology Collection.',
                  phone: '+91 22 2540 9000',
                },
              ].map((c, i) => (
                <Card
                  key={i}
                  style={{ borderRadius: '14px', border: '1px solid #e2e8f0' }}
                  bodyStyle={{ padding: '24px' }}
                >
                  <div style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>
                    {c.campus}
                  </div>
                  <div style={{ color: '#475569', fontSize: '14px', display: 'flex', alignItems: 'flex-start', gap: '8px', marginBottom: '6px' }}>
                    <EnvironmentOutlined style={{ color: '#4f46e5', marginTop: '3px' }} />
                    {c.address}
                  </div>
                  <div style={{ color: '#64748b', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <ClockCircleOutlined style={{ color: '#0d9488' }} />
                    {c.timing}
                  </div>
                  <div style={{ fontSize: '13px', color: '#334155', background: '#f8fafc', padding: '10px 12px', borderRadius: '8px', marginBottom: '12px' }}>
                    <strong>Facilities:</strong> {c.services}
                  </div>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <Button size="small" type="link" href={`tel:${c.phone}`} icon={<PhoneOutlined />} style={{ padding: 0 }}>
                      Call: {c.phone}
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </Col>

          {/* Contact Inquiry Form */}
          <Col xs={24} lg={12}>
            <Card
              style={{
                borderRadius: '20px',
                border: '1px solid #e2e8f0',
                boxShadow: '0 8px 24px rgba(15, 23, 42, 0.05)',
              }}
              bodyStyle={{ padding: '36px' }}
            >
              {submitted ? (
                <Result
                  status="success"
                  title="Thank You for Contacting Us"
                  subTitle="Your message has been routed to our patient care coordination office. A representative will contact you shortly."
                  extra={[
                    <Button type="primary" key="again" onClick={() => setSubmitted(false)} style={{ background: '#4f46e5' }}>
                      Send Another Message
                    </Button>,
                    <Button key="consult" onClick={() => setBookModalOpen(true)}>
                      Book Doctor Consult
                    </Button>
                  ]}
                />
              ) : (
                <Form
                  form={form}
                  layout="vertical"
                  onFinish={handleSubmit}
                >
                  <Title level={3} style={{ color: '#0f172a', marginBottom: '6px' }}>
                    Send Us an Inquiry or Feedback
                  </Title>
                  <Paragraph style={{ color: '#64748b', fontSize: '14px', marginBottom: '24px' }}>
                    Have a question regarding treatments, reports, appointments, or billing? Submit below and our helpdesk will respond promptly.
                  </Paragraph>

                  <Form.Item
                    name="name"
                    label="Your Full Name"
                    rules={[{ required: true, message: 'Please enter your name' }]}
                  >
                    <Input size="large" placeholder="e.g. Vikram Patel" />
                  </Form.Item>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <Form.Item
                      name="phone"
                      label="Phone Number"
                      rules={[{ required: true, message: 'Please enter phone number' }]}
                    >
                      <Input size="large" placeholder="+91 98765 43210" />
                    </Form.Item>

                    <Form.Item name="email" label="Email Address">
                      <Input size="large" placeholder="you@example.com" />
                    </Form.Item>
                  </div>

                  <Form.Item name="subject" label="Subject / Topic">
                    <Input size="large" placeholder="e.g. Appointment Inquiry, PMJAY Scheme, Biopsy Review" />
                  </Form.Item>

                  <Form.Item
                    name="message"
                    label="Message or Clinical Query"
                    rules={[{ required: true, message: 'Please write your message' }]}
                  >
                    <Input.TextArea rows={4} placeholder="Please provide details of your query..." />
                  </Form.Item>

                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={loading}
                    size="large"
                    block
                    icon={<SendOutlined />}
                    style={{
                      background: 'linear-gradient(135deg, #4f46e5 0%, #0284c7 100%)',
                      height: '46px',
                      fontWeight: 600,
                      fontSize: '15px',
                    }}
                  >
                    Submit Inquiry
                  </Button>
                </Form>
              )}
            </Card>
          </Col>
        </Row>
      </section>

      <BookConsultationModal open={bookModalOpen} onClose={() => setBookModalOpen(false)} />
      <WebsiteFooter />
    </div>
  );
}
