'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Row, 
  Col, 
  Button, 
  Typography, 
  Card, 
  Tag, 
  Space, 
  Divider, 
  Statistic,
  Badge,
  Tooltip
} from 'antd';
import { 
  CalendarOutlined, 
  MedicineBoxOutlined, 
  SafetyCertificateOutlined, 
  ThunderboltOutlined,
  CheckCircleOutlined, 
  PhoneOutlined, 
  TeamOutlined, 
  HeartOutlined, 
  ArrowRightOutlined,
  CompassOutlined,
  FileTextOutlined,
  ExperimentOutlined,
  VideoCameraOutlined,
  UserOutlined,
  FieldTimeOutlined,
  ClockCircleOutlined
} from '@ant-design/icons';
import { WebsiteHeader } from '@/components/website/WebsiteHeader';
import { WebsiteFooter } from '@/components/website/WebsiteFooter';
import { BookConsultationModal } from '@/components/website/BookConsultationModal';
import { SymptomCheckerModal } from '@/components/website/SymptomCheckerModal';

const { Title, Text, Paragraph } = Typography;

export default function HomePage() {
  const [bookModalOpen, setBookModalOpen] = useState(false);
  const [symptomModalOpen, setSymptomModalOpen] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<string | undefined>(undefined);
  const [selectedSpecialty, setSelectedSpecialty] = useState<string | undefined>(undefined);

  const handleBookDoctor = (doctorId: string, specialty: string) => {
    setSelectedDoctor(doctorId);
    setSelectedSpecialty(specialty);
    setBookModalOpen(true);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
      <WebsiteHeader />

      {/* 1. HERO SECTION */}
      <section style={{
        background: 'linear-gradient(135deg, #090e1a 0%, #0f172a 50%, #1e1b4b 100%)',
        color: '#ffffff',
        padding: '80px 24px 100px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Background glow effects */}
        <div style={{
          position: 'absolute',
          top: '-10%',
          right: '5%',
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(79, 70, 229, 0.25) 0%, rgba(0,0,0,0) 70%)',
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute',
          bottom: '-10%',
          left: '10%',
          width: '400px',
          height: '400px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(2, 132, 199, 0.2) 0%, rgba(0,0,0,0) 70%)',
          pointerEvents: 'none',
        }} />

        <div style={{ maxWidth: '1280px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <Row gutter={[48, 48]} align="middle">
            <Col xs={24} lg={14}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(79, 70, 229, 0.25)', border: '1px solid rgba(99, 102, 241, 0.4)', borderRadius: '20px', padding: '6px 16px', marginBottom: '24px' }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#38bdf8', display: 'inline-block' }} />
                <span style={{ color: '#c7d2fe', fontSize: '13px', fontWeight: 600, letterSpacing: '0.03em' }}>
                  India&apos;s Comprehensive Cancer Care & Continuity Network
                </span>
              </div>

              <h1 style={{
                fontSize: 'clamp(32px, 5vw, 54px)',
                fontWeight: 800,
                color: '#ffffff',
                lineHeight: 1.15,
                letterSpacing: '-0.03em',
                marginBottom: '20px',
              }}>
                Advanced Precision Oncology. <br />
                <span style={{
                  background: 'linear-gradient(90deg, #38bdf8 0%, #818cf8 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}>
                  Zero Care-Gaps at Every Step.
                </span>
              </h1>

              <Paragraph style={{
                fontSize: '18px',
                color: '#cbd5e1',
                lineHeight: 1.6,
                maxWidth: '640px',
                marginBottom: '32px',
              }}>
                From rapid molecular biopsy diagnosis and multidisciplinary tumor boards to targeted chemotherapy, robotic surgery, and dedicated patient navigation — City Cancer Center ensures your clinical journey is seamless, continuous, and never interrupted.
              </Paragraph>

              <Space size="middle" wrap style={{ marginBottom: '40px' }}>
                <Button
                  type="primary"
                  size="large"
                  icon={<CalendarOutlined />}
                  onClick={() => setBookModalOpen(true)}
                  style={{
                    background: 'linear-gradient(135deg, #4f46e5 0%, #0284c7 100%)',
                    height: '50px',
                    padding: '0 28px',
                    fontSize: '16px',
                    fontWeight: 600,
                    border: 'none',
                    boxShadow: '0 4px 16px rgba(79, 70, 229, 0.4)',
                  }}
                >
                  Book In-Person / Video Consult
                </Button>

                <Button
                  size="large"
                  icon={<ThunderboltOutlined />}
                  onClick={() => setSymptomModalOpen(true)}
                  style={{
                    height: '50px',
                    padding: '0 24px',
                    fontSize: '16px',
                    fontWeight: 600,
                    background: 'rgba(255, 255, 255, 0.08)',
                    borderColor: 'rgba(255, 255, 255, 0.2)',
                    color: '#ffffff',
                  }}
                >
                  Early Symptom Checker
                </Button>

                <Link href="/second-opinion">
                  <Button
                    size="large"
                    type="dashed"
                    icon={<FileTextOutlined />}
                    style={{
                      height: '50px',
                      padding: '0 20px',
                      fontSize: '15px',
                      fontWeight: 600,
                      borderColor: '#818cf8',
                      color: '#c7d2fe',
                    }}
                  >
                    Second Opinion Tumor Board
                  </Button>
                </Link>
              </Space>

              {/* Trust Badges Bar */}
              <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '24px' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#94a3b8', fontSize: '13px' }}>
                  <SafetyCertificateOutlined style={{ color: '#10b981', fontSize: '18px' }} />
                  NABH Full Accreditation
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#94a3b8', fontSize: '13px' }}>
                  <CheckCircleOutlined style={{ color: '#38bdf8', fontSize: '18px' }} />
                  Ayushman Bharat (AB-PMJAY) Cashless
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#94a3b8', fontSize: '13px' }}>
                  <TeamOutlined style={{ color: '#a855f7', fontSize: '18px' }} />
                  Multidisciplinary Tumor Board (MDT)
                </span>
              </div>
            </Col>

            {/* Quick Action Matrix Card */}
            <Col xs={24} lg={10}>
              <div style={{
                background: 'rgba(15, 23, 42, 0.75)',
                backdropFilter: 'blur(16px)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                borderRadius: '20px',
                padding: '32px',
                boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <Title level={4} style={{ color: '#ffffff', margin: 0 }}>
                    Patient Quick Care Desk
                  </Title>
                  <Tag color="cyan">Fast Track Access</Tag>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {[
                    {
                      title: 'New Cancer Diagnosis / Biopsy Positive',
                      desc: 'Urgent consult with specialist oncologist within 24 hours.',
                      icon: <MedicineBoxOutlined style={{ fontSize: '22px', color: '#38bdf8' }} />,
                      action: () => setBookModalOpen(true),
                    },
                    {
                      title: 'Virtual Second Opinion Tumor Board',
                      desc: 'Multi-specialist consensus report on surgery & chemo plan.',
                      icon: <FileTextOutlined style={{ fontSize: '22px', color: '#818cf8' }} />,
                      href: '/second-opinion',
                    },
                    {
                      title: 'Patient & Family Portal (Reports & ABHA)',
                      desc: 'Access your cancer journey milestones, prescriptions & lab results.',
                      icon: <UserOutlined style={{ fontSize: '22px', color: '#34d399' }} />,
                      href: '/portal',
                    },
                    {
                      title: 'Chemotherapy Daycare & Port Care',
                      desc: 'Daycare infusion bed booking with 24/7 toxicity hotline.',
                      icon: <FieldTimeOutlined style={{ fontSize: '22px', color: '#f472b6' }} />,
                      action: () => setBookModalOpen(true),
                    },
                  ].map((item, idx) => {
                    const content = (
                      <div
                        key={idx}
                        onClick={item.action}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '16px',
                          background: 'rgba(30, 41, 59, 0.6)',
                          border: '1px solid rgba(255, 255, 255, 0.08)',
                          borderRadius: '12px',
                          padding: '16px',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = 'rgba(79, 70, 229, 0.2)';
                          e.currentTarget.style.borderColor = '#6366f1';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'rgba(30, 41, 59, 0.6)';
                          e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                        }}
                      >
                        <div style={{
                          width: '44px',
                          height: '44px',
                          borderRadius: '10px',
                          background: 'rgba(255,255,255,0.05)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}>
                          {item.icon}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ color: '#ffffff', fontWeight: 600, fontSize: '15px' }}>{item.title}</div>
                          <div style={{ color: '#94a3b8', fontSize: '12px', marginTop: '2px' }}>{item.desc}</div>
                        </div>
                        <ArrowRightOutlined style={{ color: '#64748b' }} />
                      </div>
                    );

                    return item.href ? (
                      <Link key={idx} href={item.href} style={{ textDecoration: 'none' }}>
                        {content}
                      </Link>
                    ) : (
                      <div key={idx}>{content}</div>
                    );
                  })}
                </div>

                <div style={{
                  marginTop: '20px',
                  background: 'rgba(225, 29, 72, 0.15)',
                  border: '1px solid rgba(225, 29, 72, 0.3)',
                  borderRadius: '10px',
                  padding: '12px 16px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}>
                  <div>
                    <div style={{ color: '#fda4af', fontSize: '11px', fontWeight: 700 }}>24/7 ONCOLOGY HELPLINE</div>
                    <div style={{ color: '#ffffff', fontSize: '15px', fontWeight: 800 }}>+91 22 2417 7000</div>
                  </div>
                  <Button 
                    type="primary" 
                    danger 
                    size="small"
                    href="tel:+912224177000"
                    icon={<PhoneOutlined />}
                  >
                    Call Now
                  </Button>
                </div>
              </div>
            </Col>
          </Row>
        </div>
      </section>

      {/* 2. CLINICAL OUTCOMES & TRUST METRICS */}
      <section style={{
        background: '#ffffff',
        borderBottom: '1px solid #e2e8f0',
        padding: '36px 24px',
        boxShadow: '0 4px 12px rgba(15, 23, 42, 0.03)',
      }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <Row gutter={[32, 24]} align="middle">
            <Col xs={12} sm={6}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '32px', fontWeight: 800, color: '#4f46e5', lineHeight: 1 }}>15,000+</div>
                <div style={{ fontSize: '13px', color: '#64748b', fontWeight: 600, marginTop: '6px' }}>
                  Cancer Patients Supported
                </div>
              </div>
            </Col>
            <Col xs={12} sm={6}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '32px', fontWeight: 800, color: '#0d9488', lineHeight: 1 }}>98.4%</div>
                <div style={{ fontSize: '13px', color: '#64748b', fontWeight: 600, marginTop: '6px' }}>
                  On-Time Chemo Delivery (Zero Gaps)
                </div>
              </div>
            </Col>
            <Col xs={12} sm={6}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '32px', fontWeight: 800, color: '#0284c7', lineHeight: 1 }}>48 Hours</div>
                <div style={{ fontSize: '13px', color: '#64748b', fontWeight: 600, marginTop: '6px' }}>
                  Rapid Molecular Biomarker TAT
                </div>
              </div>
            </Col>
            <Col xs={12} sm={6}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '32px', fontWeight: 800, color: '#e11d48', lineHeight: 1 }}>100%</div>
                <div style={{ fontSize: '13px', color: '#64748b', fontWeight: 600, marginTop: '6px' }}>
                  Cashless PMJAY & TPA Empanelled
                </div>
              </div>
            </Col>
          </Row>
        </div>
      </section>

      {/* 3. CLINICAL CENTERS OF EXCELLENCE (SPECIALTIES) */}
      <section style={{ padding: '80px 24px', background: '#f8fafc' }} id="specialties">
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '56px' }}>
            <Tag color="blue" style={{ fontSize: '13px', padding: '4px 12px', borderRadius: '12px' }}>
              Centers of Clinical Excellence
            </Tag>
            <Title level={2} style={{ fontSize: '36px', fontWeight: 800, color: '#0f172a', marginTop: '12px', marginBottom: '16px' }}>
              Comprehensive Oncology Specialities Under One Roof
            </Title>
            <Paragraph style={{ fontSize: '16px', color: '#64748b', maxWidth: '720px', margin: '0 auto' }}>
              Our clinical faculty represents top-tier oncologists collaborating across medical, surgical, radiation, and genomic oncology disciplines to deliver personalized treatment protocols.
            </Paragraph>
          </div>

          <Row gutter={[24, 24]}>
            {[
              {
                title: 'Medical Oncology & Chemo Daycare',
                category: 'Targeted Therapy & Immunotherapy',
                desc: 'Precision systemic therapy, checkpoint inhibitors, neoadjuvant & adjuvant regimens, and dedicated port-catheter daycare lounge.',
                icon: '💊',
                tags: ['Immunotherapy', 'Targeted Inhibitors', 'Daycare Infusions'],
                href: '/specialties#medical',
              },
              {
                title: 'Surgical Oncology & Robotic Surgery',
                category: 'Organ-Preserving Resections',
                desc: 'Specialized oncosurgery for breast, head & neck, gastrointestinal, and gynecological cancers, with microvascular flap reconstruction.',
                icon: '🔬',
                tags: ['Robotic DaVinci', 'Limb-Sparing', 'Microvascular Flaps'],
                href: '/specialties#surgical',
              },
              {
                title: 'Radiation Oncology (IGRT / SRS)',
                category: 'Sub-Millimeter Beam Targeting',
                desc: 'Varian TrueBeam image-guided radiotherapy (IGRT), stereotactic radiosurgery (SRS/SBRT), and high-dose rate (HDR) brachytherapy.',
                icon: '⚡',
                tags: ['TrueBeam IGRT', 'SBRT Staging', 'HDR Brachytherapy'],
                href: '/specialties#radiation',
              },
              {
                title: 'Hemato-Oncology & BMT',
                category: 'Blood Cancers & Stem Cell Transplants',
                desc: 'Dedicated HEPA-filtered cleanroom units for Leukemia, Lymphoma, Multiple Myeloma, and Autologous/Allogeneic BMT transplants.',
                icon: '🩸',
                tags: ['Leukemia & Lymphoma', 'BMT Transplants', 'CAR-T Cell Prep'],
                href: '/specialties#hemato',
              },
              {
                title: 'Breast Cancer Comprehensive Center',
                category: 'Oncoplastic Surgery & Biomarkers',
                desc: 'Integrated mammography, core biopsy, ER/PR/HER2 molecular phenotyping, breast conservation surgery, and survivorship clinics.',
                icon: '🎗️',
                tags: ['Breast Conservation', 'HER2 Targeted', 'Genetic Screening'],
                href: '/specialties#breast',
              },
              {
                title: 'Molecular Pathology & Genomic Tumor Board',
                category: 'Next-Generation Sequencing (NGS)',
                desc: 'In-house molecular diagnostics analyzing 500+ gene panels (EGFR, ALK, BRCA1/2, KRAS) and liquid biopsy circulating tumor DNA.',
                icon: '🧬',
                tags: ['NGS Panels', 'Liquid Biopsy', 'Tumor Board Review'],
                href: '/specialties#pathology',
              },
            ].map((spec, idx) => (
              <Col xs={24} sm={12} lg={8} key={idx}>
                <Card
                  hoverable
                  style={{
                    height: '100%',
                    borderRadius: '16px',
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 4px 12px rgba(15, 23, 42, 0.04)',
                    transition: 'all 0.3s ease',
                  }}
                  bodyStyle={{ padding: '28px' }}
                >
                  <div style={{ fontSize: '36px', marginBottom: '16px' }}>{spec.icon}</div>
                  <div style={{ color: '#4f46e5', fontWeight: 600, fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {spec.category}
                  </div>
                  <Title level={4} style={{ color: '#0f172a', margin: '6px 0 12px', fontSize: '18px' }}>
                    {spec.title}
                  </Title>
                  <Paragraph style={{ color: '#64748b', fontSize: '14px', lineHeight: 1.6, minHeight: '66px' }}>
                    {spec.desc}
                  </Paragraph>

                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '20px' }}>
                    {spec.tags.map((t) => (
                      <Tag key={t} style={{ borderRadius: '6px', fontSize: '12px' }}>{t}</Tag>
                    ))}
                  </div>

                  <Link href={spec.href} style={{ textDecoration: 'none', color: '#4f46e5', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                    Explore Program Details <ArrowRightOutlined style={{ fontSize: '12px' }} />
                  </Link>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      </section>

      {/* 4. THE 12-STEP 360° CONTINUITY-OF-CARE MODEL (CORE DIFFERENTIATOR) */}
      <section style={{
        padding: '90px 24px',
        background: 'linear-gradient(180deg, #090e1a 0%, #0f172a 100%)',
        color: '#ffffff',
      }} id="journey">
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <div style={{ display: 'inline-block', background: 'rgba(56, 189, 248, 0.15)', border: '1px solid rgba(56, 189, 248, 0.3)', borderRadius: '20px', padding: '4px 16px', color: '#38bdf8', fontSize: '13px', fontWeight: 700, marginBottom: '12px' }}>
              The CancerCare360° Model
            </div>
            <Title level={2} style={{ color: '#ffffff', fontSize: '36px', fontWeight: 800, margin: '8px 0 16px' }}>
              The 12-Step Unbroken Continuum of Cancer Care
            </Title>
            <Paragraph style={{ color: '#94a3b8', fontSize: '16px', maxWidth: '780px', margin: '0 auto', lineHeight: 1.6 }}>
              In fragmented healthcare systems, up to 35% of cancer patients experience treatment delays or miss follow-ups. Our automated care-gap detection and active nurse navigation ensure complete continuity from intake through lifelong survivorship.
            </Paragraph>
          </div>

          {/* 12-Step Grid */}
          <Row gutter={[20, 20]}>
            {[
              { num: '01', title: 'Rapid Intake & Registry', desc: 'Patient onboarding, demographic capture, ABHA ID linkage, and digital dossier creation.' },
              { num: '02', title: 'Longitudinal Journey Mapping', desc: 'Protocol trajectory initialized with cancer stage, TNM classification, and clinical intent.' },
              { num: '03', title: 'Multidisciplinary Staging', desc: 'Tumor Board evaluation matching pathology, radiology, and genomic profiling.' },
              { num: '04', title: 'Automated Care-Gap Detection', desc: 'AI engine monitors delayed lab orders, breached SLAs, and missing appointments 24/7.' },
              { num: '05', title: 'Priority Task Escalation', desc: 'Critical alerts triaged directly to oncologist and nurse navigation dashboard.' },
              { num: '06', title: 'Nurse Navigator Outreach', desc: 'Proactive patient phone calls, WhatsApp reminders, and multi-lingual counseling.' },
              { num: '07', title: 'Barrier Identification', desc: 'Systematic assessment of travel distance, financial hardship, or caregiver challenges.' },
              { num: '08', title: 'Financial Aid & PMJAY Relief', desc: 'Ayushman Bharat pre-authorizations, state subsidies, and social worker assistance.' },
              { num: '09', title: 'Dynamic Slot Recovery', desc: 'Rescheduling cancelled chemo or radiation sessions to avoid protocol delays.' },
              { num: '10', title: 'Acute Deterioration Escalation', desc: 'Emergency protocols for neutropenic fever, bleeding, or chemotherapy toxicity.' },
              { num: '11', title: 'Closed-Loop Re-engagement', desc: 'Confirming patient attendance at hospital daycare, labs, or tele-consult.' },
              { num: '12', title: 'Survivorship & Surveillance', desc: '5-year monitoring schedules, recurrence screening, and quality-of-life tracking.' },
            ].map((step, idx) => (
              <Col xs={24} sm={12} md={8} lg={6} key={idx}>
                <div style={{
                  background: 'rgba(30, 41, 59, 0.5)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '14px',
                  padding: '24px',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#4f46e5';
                  e.currentTarget.style.background = 'rgba(79, 70, 229, 0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                  e.currentTarget.style.background = 'rgba(30, 41, 59, 0.5)';
                }}
                >
                  <div style={{
                    fontSize: '20px',
                    fontWeight: 800,
                    color: '#38bdf8',
                    fontFamily: 'monospace',
                    marginBottom: '8px',
                  }}>
                    {step.num}
                  </div>
                  <div style={{ color: '#ffffff', fontWeight: 700, fontSize: '16px', marginBottom: '8px' }}>
                    {step.title}
                  </div>
                  <div style={{ color: '#94a3b8', fontSize: '13px', lineHeight: 1.5, flex: 1 }}>
                    {step.desc}
                  </div>
                </div>
              </Col>
            ))}
          </Row>

          <div style={{ textAlign: 'center', marginTop: '48px' }}>
            <Button
              type="primary"
              size="large"
              icon={<CalendarOutlined />}
              onClick={() => setBookModalOpen(true)}
              style={{
                background: 'linear-gradient(135deg, #4f46e5 0%, #0284c7 100%)',
                height: '48px',
                padding: '0 32px',
                fontWeight: 600,
                fontSize: '15px',
                border: 'none',
              }}
            >
              Start Your Guided Care Journey
            </Button>
          </div>
        </div>
      </section>

      {/* 5. MULTIDISCIPLINARY ONCOLOGY FACULTY */}
      <section style={{ padding: '80px 24px', background: '#ffffff' }} id="doctors">
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '16px', marginBottom: '48px' }}>
            <div>
              <Tag color="purple" style={{ fontSize: '13px', padding: '4px 12px', borderRadius: '12px' }}>
                Multi-Disciplinary Team (MDT)
              </Tag>
              <Title level={2} style={{ fontSize: '36px', fontWeight: 800, color: '#0f172a', marginTop: '12px', marginBottom: '8px' }}>
                Meet Our Senior Oncologists
              </Title>
              <Paragraph style={{ color: '#64748b', fontSize: '16px', margin: 0 }}>
                Internationally fellowship-trained cancer specialists leading disease-specific tumor boards.
              </Paragraph>
            </div>
            <Link href="/doctors">
              <Button size="large" style={{ fontWeight: 600 }}>
                View All Oncologists <ArrowRightOutlined />
              </Button>
            </Link>
          </div>

          <Row gutter={[24, 24]}>
            {[
              {
                id: '156cfc61-1ff8-4ba5-92ab-97bcf967be1d',
                name: 'Dr. Priya Mehta',
                role: 'Senior Medical Oncologist',
                dept: 'Medical Oncology',
                specialty: 'MEDICAL_ONCOLOGY',
                qualifications: 'MBBS, MD (Medicine), DM (Medical Oncology), ESMO Certified',
                experience: '16+ Years Experience',
                focus: 'Breast Carcinoma, Lung Adenocarcinoma, Immunotherapy & Targeted Therapeutics',
                opd: 'Mon, Wed, Fri: 10:00 AM – 04:00 PM',
              },
              {
                id: '606a1e99-8786-4e3a-9cc5-9bad80fee0f3',
                name: 'Dr. Rajesh Kumar',
                role: 'Head of Surgical Oncology',
                dept: 'Surgical Oncology',
                specialty: 'SURGICAL_ONCOLOGY',
                qualifications: 'MBBS, MS (Surgery), MCh (Surgical Oncology), FACS',
                experience: '20+ Years Experience',
                focus: 'Head & Neck Resections, Microvascular Flaps, Colorectal & GI Oncosurgery',
                opd: 'Tue, Thu, Sat: 09:30 AM – 03:30 PM',
              },
              {
                id: 'edd89cfa-c3e4-4335-a751-26a01990fb74',
                name: 'Dr. Ananya Desai',
                role: 'Chief of Radiation Oncology',
                dept: 'Radiation Oncology',
                specialty: 'RADIATION_ONCOLOGY',
                qualifications: 'MBBS, MD (Radiation Oncology), DNB, ASTRO Fellow',
                experience: '15+ Years Experience',
                focus: 'Varian TrueBeam IGRT, SRS/SBRT, Cervical & Prostate Brachytherapy',
                opd: 'Mon to Fri: 10:30 AM – 05:00 PM',
              },
            ].map((doc) => (
              <Col xs={24} md={8} key={doc.id}>
                <Card
                  hoverable
                  style={{
                    borderRadius: '16px',
                    border: '1px solid #e2e8f0',
                    height: '100%',
                    boxShadow: '0 4px 12px rgba(15, 23, 42, 0.04)',
                  }}
                  bodyStyle={{ padding: '28px', display: 'flex', flexDirection: 'column', height: '100%' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
                    <div style={{
                      width: '64px',
                      height: '64px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #4f46e5 0%, #0284c7 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#ffffff',
                      fontSize: '24px',
                      fontWeight: 800,
                    }}>
                      {doc.name.split(' ')[1][0]}
                    </div>
                    <div>
                      <div style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a' }}>{doc.name}</div>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: '#4f46e5' }}>{doc.role}</div>
                      <div style={{ fontSize: '12px', color: '#64748b' }}>{doc.experience}</div>
                    </div>
                  </div>

                  <div style={{ fontSize: '13px', color: '#475569', marginBottom: '12px' }}>
                    <strong>Credentials:</strong> {doc.qualifications}
                  </div>

                  <div style={{ fontSize: '13px', color: '#475569', marginBottom: '16px', flex: 1 }}>
                    <strong>Clinical Focus:</strong> {doc.focus}
                  </div>

                  <div style={{
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    padding: '10px 14px',
                    fontSize: '12px',
                    color: '#334155',
                    marginBottom: '20px',
                  }}>
                    <ClockCircleOutlined style={{ color: '#4f46e5', marginRight: '6px' }} />
                    <strong>OPD Clinic:</strong> {doc.opd}
                  </div>

                  <Button
                    type="primary"
                    block
                    icon={<CalendarOutlined />}
                    onClick={() => handleBookDoctor(doc.id, doc.specialty)}
                    style={{ background: '#4f46e5', height: '40px', fontWeight: 600 }}
                  >
                    Book Consultation
                  </Button>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      </section>

      {/* 6. VIRTUAL TUMOR BOARD SECOND OPINION CALLOUT */}
      <section style={{
        padding: '70px 24px',
        background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)',
        color: '#ffffff',
      }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <Row gutter={[48, 32]} align="middle">
            <Col xs={24} lg={16}>
              <Tag color="cyan" style={{ fontSize: '12px', fontWeight: 700, marginBottom: '12px' }}>
                Remote Virtual Consensus
              </Tag>
              <Title level={2} style={{ color: '#ffffff', fontSize: '32px', fontWeight: 800, margin: '8px 0 16px' }}>
                Seeking a Second Opinion Before Surgery, Chemotherapy, or Radiation?
              </Title>
              <Paragraph style={{ color: '#c7d2fe', fontSize: '16px', lineHeight: 1.6, maxWidth: '720px' }}>
                Our virtual Multidisciplinary Tumor Board (Medical, Surgical, Radiation Oncologists, and Molecular Pathologists) reviews your biopsy slides, PET-CT scans, and clinical history to deliver an unbiased consensus recommendation in 48 hours.
              </Paragraph>
              <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', color: '#e0e7ff', fontSize: '14px' }}>
                <span>✓ 100% Digital Document Upload</span>
                <span>✓ Re-evaluation of Biopsy Pathology</span>
                <span>✓ Video Consultation with Lead Oncologist</span>
              </div>
            </Col>
            <Col xs={24} lg={8} style={{ textAlign: 'center' }}>
              <Link href="/second-opinion">
                <Button
                  type="primary"
                  size="large"
                  icon={<FileTextOutlined />}
                  style={{
                    background: '#ffffff',
                    color: '#312e81',
                    height: '52px',
                    padding: '0 32px',
                    fontSize: '16px',
                    fontWeight: 700,
                    border: 'none',
                    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)',
                  }}
                >
                  Request Tumor Board Opinion
                </Button>
              </Link>
            </Col>
          </Row>
        </div>
      </section>

      {/* 7. PATIENT SURVIVORSHIP VOICES */}
      <section style={{ padding: '80px 24px', background: '#f8fafc' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <Tag color="green" style={{ fontSize: '13px', padding: '4px 12px', borderRadius: '12px' }}>
              Voices of Resilience
            </Tag>
            <Title level={2} style={{ fontSize: '36px', fontWeight: 800, color: '#0f172a', marginTop: '12px' }}>
              Real Journeys. Unbroken Care.
            </Title>
          </div>

          <Row gutter={[24, 24]}>
            {[
              {
                quote: 'When my biopsy diagnosed Stage IIB breast cancer, the tumor board outlined an exact 6-month roadmap. The coordinator called before every chemo cycle to check my blood counts. I never felt lost.',
                author: 'Meera Iyer',
                diagnosis: 'Breast Carcinoma (Surviving 4 Years)',
                doctor: 'Under care of Dr. Priya Mehta',
              },
              {
                quote: 'Traveling 120 km from Raigad for daily radiation seemed impossible until the hospital navigator arranged transit lodge accommodation and Ayushman Bharat approvals. The team saved my life.',
                author: 'Vikram Patel',
                diagnosis: 'Oral Squamous Cell Carcinoma (Cancer Free)',
                doctor: 'Under care of Dr. Rajesh Kumar & Dr. Ananya Desai',
              },
              {
                quote: 'The genomic panel identified an EGFR mutation that allowed me to switch from toxic chemo to a once-daily targeted tablet. My lung scans are clear today.',
                author: 'Suresh Nair',
                diagnosis: 'Non-Small Cell Lung Cancer (Stage IIIB)',
                doctor: 'Under care of Dr. Priya Mehta',
              },
            ].map((story, idx) => (
              <Col xs={24} md={8} key={idx}>
                <Card
                  style={{
                    borderRadius: '16px',
                    border: '1px solid #e2e8f0',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                  }}
                  bodyStyle={{ padding: '32px' }}
                >
                  <div style={{ fontSize: '36px', color: '#818cf8', lineHeight: 1, marginBottom: '16px' }}>“</div>
                  <Paragraph style={{ color: '#334155', fontSize: '15px', lineHeight: 1.7, fontStyle: 'italic' }}>
                    {story.quote}
                  </Paragraph>

                  <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '16px', marginTop: '16px' }}>
                    <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '16px' }}>{story.author}</div>
                    <div style={{ color: '#059669', fontSize: '13px', fontWeight: 600 }}>{story.diagnosis}</div>
                    <div style={{ color: '#64748b', fontSize: '12px' }}>{story.doctor}</div>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      </section>

      {/* 8. AYUSHMAN BHARAT & CASHLESS INSURANCE DESK */}
      <section style={{ padding: '70px 24px', background: '#ffffff', borderTop: '1px solid #e2e8f0' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <Row gutter={[48, 32]} align="middle">
            <Col xs={24} md={12}>
              <Tag color="orange" style={{ fontSize: '12px', fontWeight: 700, marginBottom: '12px' }}>
                Financial Counseling & Cashless Schemes
              </Tag>
              <Title level={2} style={{ fontSize: '32px', fontWeight: 800, color: '#0f172a', margin: '8px 0 16px' }}>
                Cancer Care Should Never Be Denied Due to Financial Hardship
              </Title>
              <Paragraph style={{ color: '#64748b', fontSize: '15px', lineHeight: 1.7 }}>
                City Cancer Center is an empanelled apex oncology provider under the <strong>Pradhan Mantri Jan Arogya Yojana (Ayushman Bharat - AB-PMJAY)</strong> and Maharashtra State Health Schemes (MJPJAY). Our dedicated Medical Social Work team handles pre-authorizations, scheme documentation, and corporate cashless claims.
              </Paragraph>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#1e293b', fontWeight: 600 }}>
                  <CheckCircleOutlined style={{ color: '#10b981' }} />
                  Cashless chemotherapy, surgery, and radiation under AB-PMJAY Golden Card
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#1e293b', fontWeight: 600 }}>
                  <CheckCircleOutlined style={{ color: '#10b981' }} />
                  TPA Desk empanelled with all major private and public health insurers
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#1e293b', fontWeight: 600 }}>
                  <CheckCircleOutlined style={{ color: '#10b981' }} />
                  Patient welfare trust funds & subsidized generic targeted drugs
                </div>
              </div>
            </Col>

            <Col xs={24} md={12}>
              <div style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '16px',
                padding: '32px',
              }}>
                <Title level={4} style={{ color: '#0f172a', marginBottom: '16px' }}>
                  Have Questions About Scheme Eligibility?
                </Title>
                <Paragraph style={{ color: '#64748b', fontSize: '14px', lineHeight: 1.6 }}>
                  Speak directly with our Hospital Social Worker & PMJAY Desk coordinator. We verify your Ayushman card or corporate policy within 1 hour.
                </Paragraph>

                <Space direction="vertical" style={{ width: '100%', marginTop: '16px' }}>
                  <Button 
                    type="primary" 
                    size="large" 
                    block 
                    onClick={() => setBookModalOpen(true)}
                    style={{ background: '#4f46e5', fontWeight: 600 }}
                  >
                    Request Financial Aid Guidance
                  </Button>
                  <Button 
                    size="large" 
                    block 
                    href="tel:+912224177000"
                    icon={<PhoneOutlined />}
                  >
                    Call Scheme Desk: +91 22 2417 7000
                  </Button>
                </Space>
              </div>
            </Col>
          </Row>
        </div>
      </section>

      {/* Modals */}
      <BookConsultationModal
        open={bookModalOpen}
        onClose={() => setBookModalOpen(false)}
        defaultDoctorId={selectedDoctor}
        defaultSpecialty={selectedSpecialty}
      />

      <SymptomCheckerModal
        open={symptomModalOpen}
        onClose={() => setSymptomModalOpen(false)}
        onBook={() => {
          setSymptomModalOpen(false);
          setBookModalOpen(true);
        }}
      />

      <WebsiteFooter />
    </div>
  );
}
