'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Row, Col, Typography, Card, Tag, Space, Button, Divider } from 'antd';
import { 
  SafetyCertificateOutlined, 
  TeamOutlined, 
  CompassOutlined, 
  CheckCircleOutlined,
  HeartOutlined,
  CalendarOutlined,
  ArrowRightOutlined
} from '@ant-design/icons';
import { WebsiteHeader } from '@/components/website/WebsiteHeader';
import { WebsiteFooter } from '@/components/website/WebsiteFooter';
import { BookConsultationModal } from '@/components/website/BookConsultationModal';

const { Title, Text, Paragraph } = Typography;

export default function AboutPage() {
  const [bookOpen, setBookOpen] = useState(false);

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
      <WebsiteHeader />

      {/* Header Banner */}
      <section style={{
        background: 'linear-gradient(135deg, #090e1a 0%, #1e1b4b 100%)',
        color: '#ffffff',
        padding: '70px 24px',
      }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <Tag color="cyan" style={{ fontSize: '13px', padding: '4px 12px', borderRadius: '12px', marginBottom: '16px' }}>
            Institutional Mission
          </Tag>
          <Title level={1} style={{ color: '#ffffff', fontSize: 'clamp(28px, 4vw, 46px)', fontWeight: 800, margin: '8px 0 16px' }}>
            Pioneering Precision Oncology & Unbroken Care Continuity
          </Title>
          <Paragraph style={{ color: '#c7d2fe', fontSize: '18px', maxWidth: '780px', lineHeight: 1.6 }}>
            Founded with the conviction that no cancer patient should ever slip through the cracks of a fragmented health system, City Cancer Center brings together academic tumor boards, advanced radiotherapy, and active nurse navigation.
          </Paragraph>
        </div>
      </section>

      {/* Philosophy & MDT Structure */}
      <section style={{ padding: '80px 24px', maxWidth: '1280px', margin: '0 auto' }}>
        <Row gutter={[48, 48]} align="middle">
          <Col xs={24} md={12}>
            <Title level={2} style={{ fontSize: '32px', fontWeight: 800, color: '#0f172a' }}>
              Why Multidisciplinary Oncology Saves Lives
            </Title>
            <Paragraph style={{ color: '#475569', fontSize: '16px', lineHeight: 1.8 }}>
              Cancer is not a single disease. A patient diagnosed with breast or lung carcinoma requires simultaneous insights from surgical oncosurgeons, medical oncologists, radiation oncologists, and genomic pathologists.
            </Paragraph>
            <Paragraph style={{ color: '#475569', fontSize: '16px', lineHeight: 1.8 }}>
              At City Cancer Center, every patient case is presented before our weekly <strong>Multidisciplinary Tumor Board (MDT)</strong>. Rather than consulting individual doctors sequentially across different clinics, you receive a collective consensus protocol tailored to your specific tumor biomarkers and overall health.
            </Paragraph>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '24px' }}>
              {[
                'Collective consensus before major organ-sacrificing surgery',
                'Genomic sequencing matching tumors to targeted immunotherapies',
                'Automated care-gap tracking ensuring timely chemotherapy cycles',
                'Comprehensive psycho-oncology, nutrition, and pain management'
              ].map((point, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '15px', color: '#1e293b', fontWeight: 500 }}>
                  <CheckCircleOutlined style={{ color: '#10b981', fontSize: '18px' }} />
                  {point}
                </div>
              ))}
            </div>
          </Col>

          <Col xs={24} md={12}>
            <div style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '20px',
              padding: '40px',
              boxShadow: '0 8px 24px rgba(15, 23, 42, 0.05)',
            }}>
              <Title level={3} style={{ color: '#0f172a', marginBottom: '20px' }}>
                Key Accreditation Standards
              </Title>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ display: 'flex', gap: '16px' }}>
                  <SafetyCertificateOutlined style={{ fontSize: '28px', color: '#4f46e5' }} />
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '16px', color: '#0f172a' }}>NABH Full Hospital Accreditation</div>
                    <div style={{ fontSize: '13px', color: '#64748b', marginTop: '2px' }}>
                      Certified for rigorous clinical governance, medication safety, infection control, and patient rights charter.
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '16px' }}>
                  <TeamOutlined style={{ fontSize: '28px', color: '#0d9488' }} />
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '16px', color: '#0f172a' }}>Disease-Specific Working Groups</div>
                    <div style={{ fontSize: '13px', color: '#64748b', marginTop: '2px' }}>
                      Dedicated panels for Breast Oncology, Head & Neck, Gastrointestinal, Thoracic, and Gynecological cancers.
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '16px' }}>
                  <CompassOutlined style={{ fontSize: '28px', color: '#e11d48' }} />
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '16px', color: '#0f172a' }}>NCI Navigation Alignment</div>
                    <div style={{ fontSize: '13px', color: '#64748b', marginTop: '2px' }}>
                      Active barrier tracking based on National Cancer Institute and WHO patient navigation frameworks.
                    </div>
                  </div>
                </div>
              </div>

              <Button
                type="primary"
                size="large"
                block
                icon={<CalendarOutlined />}
                onClick={() => setBookOpen(true)}
                style={{ background: '#4f46e5', marginTop: '28px', fontWeight: 600, height: '46px' }}
              >
                Schedule Hospital Consultation
              </Button>
            </div>
          </Col>
        </Row>
      </section>

      {/* Leadership & Faculty */}
      <section style={{ padding: '70px 24px', background: '#ffffff', borderTop: '1px solid #e2e8f0' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <Tag color="purple">Clinical Leadership</Tag>
            <Title level={2} style={{ fontSize: '32px', fontWeight: 800, color: '#0f172a', marginTop: '8px' }}>
              Heads of Department & Clinical Directors
            </Title>
          </div>

          <Row gutter={[24, 24]}>
            {[
              {
                name: 'Dr. Priya Mehta',
                title: 'Director of Medical Oncology',
                desc: 'Senior medical oncologist with 16+ years of clinical leadership in systemic cytotoxic therapy, targeted kinase inhibitors, and immunotherapy clinical trials.',
              },
              {
                name: 'Dr. Rajesh Kumar',
                title: 'Head of Surgical Oncology',
                desc: 'Pioneering surgical oncologist specializing in robotic organ-preserving surgery, microvascular head & neck reconstructive flaps, and complex GI tumor debulking.',
              },
              {
                name: 'Dr. Ananya Desai',
                title: 'Chief of Radiation Oncology',
                desc: 'Radiation oncologist recognized for high-precision stereotactic radiotherapy (SRS/SBRT), adaptive TrueBeam image guidance, and cervical brachytherapy.',
              },
            ].map((leader, idx) => (
              <Col xs={24} md={8} key={idx}>
                <Card style={{ borderRadius: '16px', border: '1px solid #e2e8f0', height: '100%' }} bodyStyle={{ padding: '28px' }}>
                  <div style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a' }}>{leader.name}</div>
                  <div style={{ color: '#4f46e5', fontWeight: 600, fontSize: '13px', marginBottom: '12px' }}>{leader.title}</div>
                  <Paragraph style={{ color: '#64748b', fontSize: '14px', lineHeight: 1.6 }}>{leader.desc}</Paragraph>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      </section>

      <BookConsultationModal open={bookOpen} onClose={() => setBookOpen(false)} />
      <WebsiteFooter />
    </div>
  );
}
