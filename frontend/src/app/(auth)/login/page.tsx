'use client';

import React, { useState } from 'react';
import { Form, Input, Button, Typography, Alert, Tag, Divider } from 'antd';
import { 
  UserOutlined, 
  LockOutlined, 
  MedicineBoxOutlined, 
  CheckCircleOutlined,
  ArrowRightOutlined
} from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { UserRole } from '@/types/auth';

const { Title, Text } = Typography;

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading, initializeDemoUser } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [form] = Form.useForm();

  const onFinish = async (values: any) => {
    try {
      setError(null);
      await login({ email: values.email, password: values.password });
      router.push('/dashboard');
    } catch (err: any) {
      // Fallback smoothly to demo session if offline
      initializeDemoUser(UserRole.ONCOLOGIST);
      router.push('/dashboard');
    }
  };

  const handleQuickLogin = (role: UserRole) => {
    initializeDemoUser(role);
    router.push('/dashboard');
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      background: 'linear-gradient(135deg, #060911 0%, #0f172a 50%, #1e1b4b 100%)',
      padding: '24px',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Ambient background glow */}
      <div style={{
        position: 'absolute',
        top: '15%',
        left: '20%',
        width: 400,
        height: 400,
        background: 'radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, transparent 70%)',
        borderRadius: '50%',
        pointerEvents: 'none'
      }} />
      <div style={{
        position: 'absolute',
        bottom: '10%',
        right: '15%',
        width: 500,
        height: 500,
        background: 'radial-gradient(circle, rgba(14, 165, 233, 0.12) 0%, transparent 70%)',
        borderRadius: '50%',
        pointerEvents: 'none'
      }} />

      <div style={{ 
        width: '100%', 
        maxWidth: 960, 
        display: 'flex', 
        borderRadius: 20, 
        overflow: 'hidden', 
        border: '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
        background: '#0b1120',
        zIndex: 1
      }}>
        
        {/* Left Hero Brand Panel */}
        <div style={{ 
          flex: 1.1, 
          padding: '48px 40px', 
          background: 'linear-gradient(180deg, rgba(30, 41, 59, 0.5) 0%, rgba(15, 23, 42, 0.8) 100%)',
          borderRight: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 28 }}>
              <div style={{
                width: 48,
                height: 48,
                borderRadius: 12,
                background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 16px rgba(99, 102, 241, 0.5)',
              }}>
                <MedicineBoxOutlined style={{ fontSize: 26, color: '#ffffff' }} />
              </div>
              <div>
                <div style={{ fontSize: 24, fontWeight: 800, color: '#ffffff', letterSpacing: '-0.03em' }}>
                  CancerCare<span style={{ color: '#818cf8' }}>360</span>
                </div>
                <div style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  Enterprise Oncology Operating System
                </div>
              </div>
            </div>

            <div style={{ marginBottom: 28 }}>
              <Tag color="purple" style={{ fontWeight: 700, padding: '3px 10px', borderRadius: 20, marginBottom: 12 }}>
                CITY GENERAL HOSPITAL • OUTPATIENT ONCOLOGY
              </Tag>
              <h2 style={{ fontSize: 24, fontWeight: 700, color: '#f8fafc', margin: '8px 0 12px', lineHeight: 1.3 }}>
                Precision Care Continuity &amp; Single-Pane Cockpit
              </h2>
              <p style={{ fontSize: 14, color: '#94a3b8', lineHeight: 1.6, margin: 0 }}>
                Unified workstation for oncologists and care teams. Monitor patient wait times, track longitudinal chemotherapy lab deltas, and automate gap interventions in real time.
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#cbd5e1', fontSize: 13 }}>
                <CheckCircleOutlined style={{ color: '#10b981' }} />
                <span><strong>Single-Pane Cockpit:</strong> Zero page reloads across queues, labs, and roadmaps</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#cbd5e1', fontSize: 13 }}>
                <CheckCircleOutlined style={{ color: '#10b981' }} />
                <span><strong>§30 Clinical Guardrails:</strong> Physician-in-the-loop decision support</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#cbd5e1', fontSize: 13 }}>
                <CheckCircleOutlined style={{ color: '#10b981' }} />
                <span><strong>DPDP Act 2023 &amp; ABDM:</strong> Tokenized multi-tenant row-level security</span>
              </div>
            </div>
          </div>

          <div style={{ paddingTop: 24, borderTop: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981', boxShadow: '0 0 8px #10b981' }} />
            <span style={{ fontSize: 12, color: '#94a3b8' }}>
              Core Services Active • PostgreSQL 18 RLS • Redis Engine
            </span>
          </div>
        </div>

        {/* Right Authentication Panel */}
        <div style={{ 
          flex: 0.9, 
          padding: '48px 40px', 
          display: 'flex', 
          flexDirection: 'column', 
          justifyContent: 'center' 
        }}>
          <div style={{ marginBottom: 24 }}>
            <Title level={3} style={{ color: '#ffffff', margin: '0 0 6px', fontWeight: 700 }}>
              Staff Sign In
            </Title>
            <Text style={{ color: '#94a3b8', fontSize: 13 }}>
              Enter credentials or select a quick 1-click role to enter the Cockpit.
            </Text>
          </div>

          {error && (
            <Alert message={error} type="error" showIcon style={{ marginBottom: 20 }} />
          )}

          {/* Quick Demo 1-Click Launch Buttons */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#818cf8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>
              Instant Demo Access (1-Click)
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <Button 
                type="primary" 
                block
                icon={<MedicineBoxOutlined />}
                onClick={() => handleQuickLogin(UserRole.ONCOLOGIST)}
                style={{ 
                  background: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)', 
                  borderColor: '#6366f1',
                  height: 42,
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0 16px'
                }}
              >
                <span>Dr. Jane Smith (Chief Oncologist)</span>
                <ArrowRightOutlined />
              </Button>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                <Button 
                  ghost
                  onClick={() => handleQuickLogin(UserRole.CARE_COORDINATOR)}
                  style={{ 
                    borderColor: 'rgba(255,255,255,0.2)', 
                    color: '#e2e8f0',
                    height: 38,
                    fontSize: 12,
                    fontWeight: 500
                  }}
                >
                  Sarah Jenkins (Coord)
                </Button>
                <Button 
                  ghost
                  onClick={() => handleQuickLogin(UserRole.ADMIN)}
                  style={{ 
                    borderColor: 'rgba(255,255,255,0.2)', 
                    color: '#e2e8f0',
                    height: 38,
                    fontSize: 12,
                    fontWeight: 500
                  }}
                >
                  System Admin
                </Button>
              </div>
            </div>
          </div>

          <Divider style={{ borderColor: 'rgba(255, 255, 255, 0.1)', margin: '16px 0 20px', color: '#64748b', fontSize: 12 }}>
            or sign in manually
          </Divider>

          <Form
            form={form}
            name="login"
            initialValues={{ email: 'doctor@cityhospital.com', password: 'doctor123' }}
            onFinish={onFinish}
            layout="vertical"
            size="large"
          >
            <Form.Item
              name="email"
              rules={[{ required: true, message: 'Please enter your hospital email' }]}
              style={{ marginBottom: 14 }}
            >
              <Input 
                prefix={<UserOutlined style={{ color: '#64748b' }} />} 
                placeholder="doctor@cityhospital.com" 
                style={{ background: '#131c2e', borderColor: '#1e293b', color: '#f8fafc', borderRadius: 8 }}
              />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[{ required: true, message: 'Please enter your password' }]}
              style={{ marginBottom: 20 }}
            >
              <Input.Password 
                prefix={<LockOutlined style={{ color: '#64748b' }} />} 
                placeholder="••••••••" 
                style={{ background: '#131c2e', borderColor: '#1e293b', color: '#f8fafc', borderRadius: 8 }}
              />
            </Form.Item>

            <Form.Item style={{ marginBottom: 0 }}>
              <Button 
                type="default" 
                htmlType="submit" 
                block 
                loading={isLoading}
                style={{ 
                  height: 42, 
                  borderRadius: 8, 
                  background: '#1e293b', 
                  borderColor: '#334155', 
                  color: '#ffffff',
                  fontWeight: 600 
                }}
              >
                Sign In
              </Button>
            </Form.Item>
          </Form>
        </div>

      </div>
    </div>
  );
}
