'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button, Drawer, Space, Tag } from 'antd';
import { 
  PhoneOutlined, 
  MedicineBoxOutlined, 
  CalendarOutlined, 
  UserOutlined, 
  LoginOutlined, 
  MenuOutlined, 
  SafetyCertificateOutlined,
  CompassOutlined,
  HeartOutlined,
  ThunderboltOutlined
} from '@ant-design/icons';
import { BookConsultationModal } from './BookConsultationModal';
import { SymptomCheckerModal } from './SymptomCheckerModal';

export function WebsiteHeader() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [bookModalOpen, setBookModalOpen] = useState(false);
  const [symptomModalOpen, setSymptomModalOpen] = useState(false);

  const navLinks = [
    { label: 'Specialties', href: '/specialties' },
    { label: 'Doctors', href: '/doctors' },
    { label: '360° Care Model', href: '/#journey' },
    { label: 'Second Opinion', href: '/second-opinion' },
    { label: 'Patient Guide', href: '/patient-guide' },
    { label: 'About Us', href: '/about' },
    { label: 'Contact', href: '/contact' },
  ];

  return (
    <>
      {/* Top Emergency & Assistance Bar */}
      <div style={{
        background: '#090d16',
        color: '#94a3b8',
        fontSize: '12px',
        padding: '6px 24px',
        borderBottom: '1px solid #1e293b',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '8px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#f43f5e', fontWeight: 600 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#f43f5e', display: 'inline-block', animation: 'pulse 1.5s infinite' }} />
            24/7 Onco-Emergency: <a href="tel:+912224177000" style={{ color: '#ffffff', textDecoration: 'none' }}>+91 22 2417 7000</a>
          </span>
          <span style={{ color: '#475569' }}>|</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <MedicineBoxOutlined style={{ color: '#38bdf8' }} /> Ambulance Dispatch: <strong>+91 22 2417 7999</strong>
          </span>
          <span style={{ color: '#475569' }}>|</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#10b981' }}>
            <SafetyCertificateOutlined /> NABH Accredited & AB-PMJAY Empanelled
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <button 
            onClick={() => setSymptomModalOpen(true)}
            style={{
              background: 'rgba(244, 63, 94, 0.15)',
              border: '1px solid rgba(244, 63, 94, 0.4)',
              color: '#fda4af',
              padding: '2px 10px',
              borderRadius: '4px',
              fontSize: '11px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontWeight: 500,
            }}
          >
            <ThunderboltOutlined /> Cancer Symptom Checker
          </button>
          <span style={{ color: '#64748b' }}>Main Campus: Parel, Mumbai</span>
        </div>
      </div>

      {/* Main Sticky Navigation Bar */}
      <header style={{
        background: '#ffffff',
        borderBottom: '1px solid #e2e8f0',
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        boxShadow: '0 2px 8px rgba(15, 23, 42, 0.04)',
      }}>
        <div style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '0 24px',
          height: '72px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          {/* Logo & Institute Identity */}
          <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #0284c7 0%, #4f46e5 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              fontSize: '22px',
              fontWeight: 800,
              boxShadow: '0 4px 12px rgba(79, 70, 229, 0.3)',
            }}>
              C
            </div>
            <div>
              <div style={{
                fontSize: '18px',
                fontWeight: 800,
                color: '#0f172a',
                lineHeight: 1.2,
                letterSpacing: '-0.02em',
              }}>
                City Cancer Center
              </div>
              <div style={{
                fontSize: '11px',
                fontWeight: 600,
                color: '#64748b',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}>
                Comprehensive Oncology & Care Continuity
              </div>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav style={{ display: 'none' }} className="desktop-nav">
            <style>{`
              @media (min-width: 992px) {
                .desktop-nav { display: flex !important; align-items: center; gap: 24px; }
                .mobile-menu-btn { display: none !important; }
              }
            `}</style>
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.label}
                  href={link.href}
                  style={{
                    textDecoration: 'none',
                    fontSize: '14px',
                    fontWeight: isActive ? 700 : 500,
                    color: isActive ? '#4f46e5' : '#334155',
                    transition: 'color 0.2s',
                    padding: '8px 0',
                    borderBottom: isActive ? '2px solid #4f46e5' : '2px solid transparent',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = '#4f46e5')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = isActive ? '#4f46e5' : '#334155')}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Action CTAs */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Button
              type="primary"
              icon={<CalendarOutlined />}
              onClick={() => setBookModalOpen(true)}
              style={{
                background: 'linear-gradient(135deg, #4f46e5 0%, #0284c7 100%)',
                border: 'none',
                height: '40px',
                fontWeight: 600,
                boxShadow: '0 2px 8px rgba(79, 70, 229, 0.25)',
              }}
            >
              Book Consult
            </Button>

            <Link href="/portal" style={{ textDecoration: 'none' }}>
              <Button
                icon={<UserOutlined />}
                style={{
                  height: '40px',
                  borderColor: '#cbd5e1',
                  color: '#334155',
                  fontWeight: 600,
                }}
              >
                Patient Portal
              </Button>
            </Link>

            <Link href="/login" style={{ textDecoration: 'none' }}>
              <Button
                type="text"
                icon={<LoginOutlined />}
                style={{
                  height: '40px',
                  color: '#64748b',
                  fontWeight: 500,
                }}
              >
                Staff Login
              </Button>
            </Link>

            {/* Mobile Hamburger Button */}
            <Button
              className="mobile-menu-btn"
              icon={<MenuOutlined />}
              onClick={() => setMobileOpen(true)}
              style={{ border: 'none', background: '#f1f5f9' }}
            />
          </div>
        </div>
      </header>

      {/* Mobile Drawer Navigation */}
      <Drawer
        title="City Cancer Center"
        placement="right"
        onClose={() => setMobileOpen(false)}
        open={mobileOpen}
      >
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <Button 
            type="primary" 
            block 
            icon={<CalendarOutlined />} 
            onClick={() => { setMobileOpen(false); setBookModalOpen(true); }}
            style={{ background: '#4f46e5' }}
          >
            Book Consultation
          </Button>

          <Button 
            block 
            danger 
            icon={<ThunderboltOutlined />} 
            onClick={() => { setMobileOpen(false); setSymptomModalOpen(true); }}
          >
            Cancer Symptoms Checker
          </Button>

          <div style={{ borderBottom: '1px solid #e2e8f0', margin: '8px 0' }} />

          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              style={{
                display: 'block',
                padding: '10px 0',
                fontSize: '16px',
                fontWeight: pathname === link.href ? 700 : 500,
                color: pathname === link.href ? '#4f46e5' : '#1e293b',
                textDecoration: 'none',
              }}
            >
              {link.label}
            </Link>
          ))}

          <div style={{ borderBottom: '1px solid #e2e8f0', margin: '8px 0' }} />

          <Link href="/portal" onClick={() => setMobileOpen(false)} style={{ textDecoration: 'none' }}>
            <Button block icon={<UserOutlined />}>Patient & Caregiver Portal</Button>
          </Link>

          <Link href="/login" onClick={() => setMobileOpen(false)} style={{ textDecoration: 'none' }}>
            <Button block type="dashed" icon={<LoginOutlined />}>Doctor & Clinical Staff Workstation</Button>
          </Link>

          <div style={{
            background: '#fff1f2',
            border: '1px solid #fecdd3',
            borderRadius: '8px',
            padding: '12px',
            marginTop: '16px',
          }}>
            <div style={{ color: '#be123c', fontWeight: 700, fontSize: '12px', marginBottom: '4px' }}>
              24/7 ONCOLOGY EMERGENCY
            </div>
            <a href="tel:+912224177000" style={{ color: '#e11d48', fontSize: '15px', fontWeight: 800, textDecoration: 'none' }}>
              +91 22 2417 7000
            </a>
          </div>
        </Space>
      </Drawer>

      {/* Interactive Consultation Booking Modal */}
      <BookConsultationModal 
        open={bookModalOpen} 
        onClose={() => setBookModalOpen(false)} 
      />

      {/* Interactive Cancer Symptom Triage Wizard */}
      <SymptomCheckerModal
        open={symptomModalOpen}
        onClose={() => setSymptomModalOpen(false)}
        onBook={() => {
          setSymptomModalOpen(false);
          setBookModalOpen(true);
        }}
      />
    </>
  );
}
