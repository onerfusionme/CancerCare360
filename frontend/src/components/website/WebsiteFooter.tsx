'use client';

import React from 'react';
import Link from 'next/link';
import { Row, Col, Typography, Space, Divider, Tag } from 'antd';
import { 
  PhoneOutlined, 
  EnvironmentOutlined, 
  MailOutlined, 
  SafetyCertificateOutlined, 
  CheckCircleOutlined,
  HeartOutlined,
  ClockCircleOutlined
} from '@ant-design/icons';

const { Text, Title, Paragraph } = Typography;

export function WebsiteFooter() {
  return (
    <footer style={{
      background: '#0a0f1d',
      color: '#94a3b8',
      borderTop: '1px solid #1e293b',
      paddingTop: '64px',
      paddingBottom: '32px',
      fontSize: '14px',
    }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 24px' }}>
        <Row gutter={[48, 36]}>
          {/* Column 1: Hospital Overview */}
          <Col xs={24} sm={24} md={8} lg={7}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #0284c7 0%, #4f46e5 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                fontSize: '20px',
                fontWeight: 800,
              }}>
                C
              </div>
              <div>
                <div style={{ fontSize: '18px', fontWeight: 800, color: '#ffffff' }}>
                  City Cancer Center
                </div>
                <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>
                  Comprehensive Oncology Institute
                </div>
              </div>
            </div>

            <Paragraph style={{ color: '#94a3b8', lineHeight: 1.6, fontSize: '13px', marginBottom: '16px' }}>
              Dedicated to closing care gaps across the entire cancer continuum — from screening and rapid molecular diagnosis to precision multidisciplinary tumor boards, treatment navigation, and long-term survivorship.
            </Paragraph>

            <Space wrap size={[6, 6]}>
              <Tag color="cyan" icon={<SafetyCertificateOutlined />}>NABH Accredited</Tag>
              <Tag color="green" icon={<CheckCircleOutlined />}>AB-PMJAY Cashless</Tag>
              <Tag color="purple">Genomic Tumor Board</Tag>
            </Space>
          </Col>

          {/* Column 2: Clinical Specialties */}
          <Col xs={12} sm={12} md={5} lg={5}>
            <div style={{ color: '#ffffff', fontWeight: 700, fontSize: '15px', marginBottom: '18px' }}>
              Clinical Specialties
            </div>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[
                { label: 'Medical Oncology & Chemo', href: '/specialties#medical' },
                { label: 'Surgical Oncosurgery', href: '/specialties#surgical' },
                { label: 'Radiation Oncology (IGRT)', href: '/specialties#radiation' },
                { label: 'Hemato-Oncology & BMT', href: '/specialties#hemato' },
                { label: 'Head & Neck Oncology', href: '/specialties#head-neck' },
                { label: 'Breast Oncology Program', href: '/specialties#breast' },
                { label: 'Molecular Pathology & NGS', href: '/specialties#pathology' },
              ].map((item) => (
                <li key={item.label}>
                  <Link href={item.href} style={{ color: '#94a3b8', textDecoration: 'none', transition: 'color 0.2s' }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = '#38bdf8')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = '#94a3b8')}>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </Col>

          {/* Column 3: Patient & Caregiver Services */}
          <Col xs={12} sm={12} md={5} lg={5}>
            <div style={{ color: '#ffffff', fontWeight: 700, fontSize: '15px', marginBottom: '18px' }}>
              Patient Services
            </div>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[
                { label: 'Virtual Second Opinion', href: '/second-opinion' },
                { label: 'Cancer Screening Clinic', href: '/#screening' },
                { label: 'Patient & Family Portal', href: '/portal' },
                { label: 'Chemo Preparation Guide', href: '/patient-guide' },
                { label: 'Ayushman Bharat (PMJAY)', href: '/patient-guide#insurance' },
                { label: 'Find an Oncologist', href: '/doctors' },
                { label: 'Clinical Staff Login', href: '/login' },
              ].map((item) => (
                <li key={item.label}>
                  <Link href={item.href} style={{ color: '#94a3b8', textDecoration: 'none', transition: 'color 0.2s' }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = '#38bdf8')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = '#94a3b8')}>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </Col>

          {/* Column 4: Campuses & 24/7 Helpline */}
          <Col xs={24} sm={24} md={6} lg={7}>
            <div style={{ color: '#ffffff', fontWeight: 700, fontSize: '15px', marginBottom: '18px' }}>
              Campuses & Emergency
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                <EnvironmentOutlined style={{ color: '#38bdf8', fontSize: '16px', marginTop: '3px' }} />
                <div>
                  <strong style={{ color: '#f1f5f9' }}>Main Hospital Campus:</strong>
                  <div style={{ fontSize: '13px', color: '#94a3b8' }}>100 Oncology Blvd, Dr. E. Borges Road, Parel, Mumbai 400012</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                <EnvironmentOutlined style={{ color: '#38bdf8', fontSize: '16px', marginTop: '3px' }} />
                <div>
                  <strong style={{ color: '#f1f5f9' }}>Navi Mumbai Daycare:</strong>
                  <div style={{ fontSize: '13px', color: '#94a3b8' }}>Sector 15, Vashi, Navi Mumbai 400703</div>
                </div>
              </div>

              <div style={{
                background: '#1e1b4b',
                border: '1px solid #3730a3',
                borderRadius: '8px',
                padding: '12px 16px',
                marginTop: '6px',
              }}>
                <div style={{ color: '#a5b4fc', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase' }}>
                  24/7 ONCOLOGY EMERGENCY & ADMISSION
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                  <PhoneOutlined style={{ color: '#38bdf8' }} />
                  <a href="tel:+912224177000" style={{ color: '#ffffff', fontSize: '16px', fontWeight: 800, textDecoration: 'none' }}>
                    +91 22 2417 7000
                  </a>
                </div>
                <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>
                  Email: emergency@cancercare.com
                </div>
              </div>
            </div>
          </Col>
        </Row>

        <Divider style={{ borderColor: '#1e293b', margin: '40px 0 24px' }} />

        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
          fontSize: '12px',
          color: '#64748b',
        }}>
          <div>
            © {new Date().getFullYear()} City Cancer Center & CancerCare360. All rights reserved. Registered under Maharashtra Clinical Establishments Act.
          </div>

          <div style={{ display: 'flex', gap: '20px' }}>
            <Link href="/about#governance" style={{ color: '#64748b', textDecoration: 'none' }}>Clinical Ethics</Link>
            <Link href="/patient-guide#rights" style={{ color: '#64748b', textDecoration: 'none' }}>Patient Rights</Link>
            <Link href="/contact" style={{ color: '#64748b', textDecoration: 'none' }}>Feedback & Grievances</Link>
            <Link href="/login" style={{ color: '#64748b', textDecoration: 'none' }}>Staff Portal</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
