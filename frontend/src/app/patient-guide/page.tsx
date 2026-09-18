'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Row, Col, Typography, Card, Collapse, Tag, Alert, Button, Space, Divider } from 'antd';
import { 
  MedicineBoxOutlined, 
  SafetyCertificateOutlined, 
  AlertOutlined, 
  CheckCircleOutlined,
  HeartOutlined,
  FileTextOutlined,
  PhoneOutlined,
  UserOutlined
} from '@ant-design/icons';
import { WebsiteHeader } from '@/components/website/WebsiteHeader';
import { WebsiteFooter } from '@/components/website/WebsiteFooter';
import { BookConsultationModal } from '@/components/website/BookConsultationModal';

const { Title, Text, Paragraph } = Typography;

export default function PatientGuidePage() {
  const [bookOpen, setBookOpen] = useState(false);

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
            Empowering Patients & Families
          </Tag>
          <Title level={1} style={{ color: '#ffffff', fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 800, margin: '8px 0 16px' }}>
            Cancer Patient & Caregiver Guide
          </Title>
          <Paragraph style={{ color: '#c7d2fe', fontSize: '18px', maxWidth: '780px', lineHeight: 1.6 }}>
            Practical, physician-reviewed guidelines on preparing for chemotherapy, managing radiation side effects, availing Ayushman Bharat (AB-PMJAY) cashless benefits, and connecting your digital ABHA records.
          </Paragraph>
        </div>
      </section>

      {/* Critical Emergency Red Flag Alert */}
      <div style={{ maxWidth: '1280px', margin: '32px auto 0', padding: '0 24px' }}>
        <Alert
          message="EMERGENCY ONCOLOGY RED FLAG: NEUTROPENIC FEVER"
          description={
            <div>
              If you are currently receiving chemotherapy and develop an oral temperature of <strong>100.4°F (38.0°C) or higher</strong>, or experience uncontrollable chills or shortness of breath, <strong>DO NOT WAIT</strong>. Visit our 24/7 Emergency Department immediately or call <a href="tel:+912224177000" style={{ fontWeight: 700, color: '#be123c' }}>+91 22 2417 7000</a>. Neutropenia can progress to sepsis without immediate IV antibiotics.
            </div>
          }
          type="error"
          showIcon
          icon={<AlertOutlined />}
          style={{ borderRadius: '12px', border: '1.5px solid #fecdd3', background: '#fff1f2' }}
        />
      </div>

      {/* Practical Guides Accordion / Cards */}
      <section style={{ padding: '48px 24px 80px', maxWidth: '1280px', margin: '0 auto' }}>
        <Row gutter={[32, 32]}>
          {/* Guide 1: Chemotherapy Daycare Preparation */}
          <Col xs={24} lg={12}>
            <Card
              style={{ borderRadius: '16px', border: '1px solid #e2e8f0', height: '100%' }}
              bodyStyle={{ padding: '32px' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                <MedicineBoxOutlined style={{ fontSize: '26px', color: '#4f46e5' }} />
                <Title level={3} style={{ color: '#0f172a', margin: 0 }}>
                  Preparing for Chemotherapy Daycare
                </Title>
              </div>

              <Paragraph style={{ color: '#64748b', fontSize: '14px', lineHeight: 1.6 }}>
                What to do before, during, and after your systemic infusion session:
              </Paragraph>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' }}>
                {[
                  { title: 'STAT Pre-Chemo Blood Counts', text: 'CBC and Creatinine must be tested on the morning of chemo. Our STAT lab delivers verified results within 1 hour so your doctor can approve infusion.' },
                  { title: 'Hydration Guidelines', text: 'Drink 2.5 to 3 liters of water the day before and day of chemotherapy to flush cytotoxic metabolites through your kidneys.' },
                  { title: 'Apparel & Comfort', text: 'Wear comfortable, loose front-button clothing allowing easy access to your Chemo Port or forearm veins. Bring a book or headphones.' },
                  { title: 'Antiemetic Regimen', text: 'Take prescribed anti-nausea medication 30 minutes prior to meals as directed. Do not skip premedication.' },
                ].map((item, idx) => (
                  <div key={idx} style={{ background: '#f8fafc', padding: '14px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                    <Text strong style={{ color: '#0f172a', fontSize: '14px' }}>{item.title}: </Text>
                    <span style={{ color: '#475569', fontSize: '13px' }}>{item.text}</span>
                  </div>
                ))}
              </div>
            </Card>
          </Col>

          {/* Guide 2: Radiation Skin Care */}
          <Col xs={24} lg={12}>
            <Card
              style={{ borderRadius: '16px', border: '1px solid #e2e8f0', height: '100%' }}
              bodyStyle={{ padding: '32px' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                <SafetyCertificateOutlined style={{ fontSize: '26px', color: '#0d9488' }} />
                <Title level={3} style={{ color: '#0f172a', margin: 0 }}>
                  Radiation Skin Care & Precautions
                </Title>
              </div>

              <Paragraph style={{ color: '#64748b', fontSize: '14px', lineHeight: 1.6 }}>
                Protecting skin within the radiation treatment field during your 5–6 week protocol:
              </Paragraph>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' }}>
                {[
                  { title: 'Wash with Lukewarm Water', text: 'Use mild, unperfumed soap. Pat dry gently with a soft cotton towel. Never rub or scrub the treated skin.' },
                  { title: 'No Perfumes, Deodorants, or Alcohols', text: 'Avoid chemical deodorants or powders in the armpit or neck if these areas are in the radiation field.' },
                  { title: 'Doctor-Prescribed Barrier Creams', text: 'Apply recommended topical barrier creams (e.g. calendula or hydrogel) only AFTER your daily radiation session, never right before.' },
                  { title: 'Sun & Heat Protection', text: 'Protect treated skin from direct sunlight. Do not apply hot water bottles, ice packs, or heating pads to the radiation area.' },
                ].map((item, idx) => (
                  <div key={idx} style={{ background: '#f8fafc', padding: '14px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                    <Text strong style={{ color: '#0f172a', fontSize: '14px' }}>{item.title}: </Text>
                    <span style={{ color: '#475569', fontSize: '13px' }}>{item.text}</span>
                  </div>
                ))}
              </div>
            </Card>
          </Col>
        </Row>

        {/* Section: Ayushman Bharat & ABHA ID Guide */}
        <div style={{ marginTop: '48px' }} id="insurance">
          <Card
            style={{
              borderRadius: '20px',
              border: '1px solid #e2e8f0',
              background: '#ffffff',
              boxShadow: '0 8px 24px rgba(15, 23, 42, 0.04)',
            }}
            bodyStyle={{ padding: '40px' }}
          >
            <Row gutter={[48, 32]} align="middle">
              <Col xs={24} lg={14}>
                <Tag color="green" style={{ fontSize: '12px', fontWeight: 700, marginBottom: '8px' }}>
                  Government Healthcare Schemes
                </Tag>
                <Title level={3} style={{ color: '#0f172a', margin: '6px 0 16px' }}>
                  How to Avail Ayushman Bharat (AB-PMJAY) Cashless Care
                </Title>
                <Paragraph style={{ color: '#475569', fontSize: '15px', lineHeight: 1.7 }}>
                  Eligible cancer patients under <strong>PMJAY</strong> can receive up to <strong>₹5,00,000 per family per year</strong> of cashless hospitalization, chemotherapy, major tumor surgery, and radiotherapy.
                </Paragraph>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '16px' }}>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', fontSize: '14px', color: '#1e293b' }}>
                    <CheckCircleOutlined style={{ color: '#10b981' }} />
                    <strong>Step 1:</strong> Visit our PMJAY Kiosk on the Ground Floor with your Ayushman Card and Aadhaar.
                  </div>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', fontSize: '14px', color: '#1e293b' }}>
                    <CheckCircleOutlined style={{ color: '#10b981' }} />
                    <strong>Step 2:</strong> Our Medical Social Worker verifies scheme eligibility and registers your biometric authentication.
                  </div>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', fontSize: '14px', color: '#10b981' }}>
                    <CheckCircleOutlined style={{ color: '#10b981' }} />
                    <strong>Step 3:</strong> Pre-authorization is submitted online with biopsy and staging reports within 2 hours.
                  </div>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', fontSize: '14px', color: '#1e293b' }}>
                    <CheckCircleOutlined style={{ color: '#10b981' }} />
                    <strong>Step 4:</strong> Cashless treatment begins immediately without out-of-pocket medical deposits.
                  </div>
                </div>
              </Col>

              <Col xs={24} lg={10}>
                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '24px' }}>
                  <div style={{ fontWeight: 700, fontSize: '16px', color: '#0f172a', marginBottom: '8px' }}>
                    Documents Checklist for Cashless Desk
                  </div>
                  <ul style={{ paddingLeft: '20px', color: '#475569', fontSize: '13px', lineHeight: 1.7 }}>
                    <li>Ayushman Bharat PMJAY Card (Golden Card)</li>
                    <li>Patient Aadhaar Card / Voter ID</li>
                    <li>Ration Card (Orange / Yellow)</li>
                    <li>Original Histopathology / Biopsy Confirmation Report</li>
                    <li>CT / MRI / PET-CT Scan Films and Reports</li>
                  </ul>

                  <Button
                    type="primary"
                    block
                    icon={<PhoneOutlined />}
                    href="tel:+912224177000"
                    style={{ background: '#10b981', borderColor: '#10b981', marginTop: '16px', height: '40px', fontWeight: 600 }}
                  >
                    Contact PMJAY Helpdesk
                  </Button>
                </div>
              </Col>
            </Row>
          </Card>
        </div>

        {/* Section: Patient Portal & ABHA Sync */}
        <div style={{ marginTop: '32px' }}>
          <div style={{
            background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)',
            borderRadius: '20px',
            padding: '36px',
            color: '#ffffff',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '24px',
          }}>
            <div>
              <Tag color="cyan">Digital Health Ecosystem</Tag>
              <div style={{ fontSize: '24px', fontWeight: 800, margin: '8px 0' }}>
                Access Your Records on the Patient Portal
              </div>
              <div style={{ color: '#c7d2fe', fontSize: '14px', maxWidth: '600px', lineHeight: 1.6 }}>
                View your upcoming chemotherapy appointments, doctor consultation summaries, blood test kinetics, and link your 14-digit Ayushman Bharat Health Account (ABHA).
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <Link href="/portal">
                <Button size="large" type="primary" icon={<UserOutlined />} style={{ background: '#ffffff', color: '#312e81', fontWeight: 700, border: 'none' }}>
                  Open Patient Portal
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <BookConsultationModal open={bookOpen} onClose={() => setBookOpen(false)} />
      <WebsiteFooter />
    </div>
  );
}
