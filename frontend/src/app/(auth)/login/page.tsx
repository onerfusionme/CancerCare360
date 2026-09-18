'use client';

import React, { useState } from 'react';
import { Form, Input, Button, Typography, Alert, Tag, Tooltip } from 'antd';
import { 
  UserOutlined, 
  LockOutlined, 
  MedicineBoxOutlined, 
  CheckCircleOutlined, 
  SafetyCertificateOutlined,
  ThunderboltOutlined,
  TeamOutlined,
  AuditOutlined,
  CompassOutlined,
  ArrowRightOutlined
} from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';

const { Title, Text, Paragraph } = Typography;

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<string>('admin');
  const [form] = Form.useForm();

  const onFinish = async (values: any) => {
    try {
      setError(null);
      await login({ email: values.email, password: values.password });
      router.push('/dashboard');
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Authentication failed. Please check your credentials.');
    }
  };

  const handleRoleSelect = (roleKey: string, email: string, pass: string) => {
    setSelectedRole(roleKey);
    setError(null);
    form.setFieldsValue({
      email,
      password: pass,
    });
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'radial-gradient(ellipse at top left, #F0F7F4 0%, #FCF9F5 45%, #F5EFEB 100%)',
      padding: '24px 16px',
      position: 'relative',
      overflow: 'hidden',
      fontFamily: 'var(--font-geist-sans, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif)',
    }}>
      {/* Subtle Honeycomb SVG Background Pattern */}
      <div style={{
        position: 'absolute',
        inset: 0,
        opacity: 0.35,
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='56' height='96' viewBox='0 0 56 96'%3E%3Cpath d='M28 0l28 16v32L28 64 0 48V16L28 0zm0 96l28-16V48L28 32 0 48v32l28 16z' fill='none' stroke='%232A9D8F' stroke-width='1' stroke-opacity='0.18'/%3E%3C/svg%3E")`,
        backgroundSize: '56px 96px',
        pointerEvents: 'none',
      }} />

      {/* Decorative Pastel Ambient Orbs */}
      <div style={{
        position: 'absolute',
        top: '-10%',
        right: '-5%',
        width: '450px',
        height: '450px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(42, 157, 143, 0.12) 0%, rgba(42, 157, 143, 0) 70%)',
        filter: 'blur(40px)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute',
        bottom: '-10%',
        left: '-5%',
        width: '450px',
        height: '450px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(69, 123, 157, 0.12) 0%, rgba(69, 123, 157, 0) 70%)',
        filter: 'blur(40px)',
        pointerEvents: 'none',
      }} />

      {/* Central Double-Panel Container */}
      <div style={{
        width: '100%',
        maxWidth: 1040,
        background: 'rgba(255, 255, 255, 0.94)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderRadius: 24,
        boxShadow: '0 25px 60px -15px rgba(44, 62, 80, 0.12), 0 0 1px 1px rgba(226, 232, 240, 0.8)',
        border: '1px solid rgba(255, 255, 255, 0.8)',
        overflow: 'hidden',
        zIndex: 1,
        display: 'flex',
        flexWrap: 'wrap',
      }}>
        
        {/* Left Showcase Brand Panel */}
        <div style={{
          flex: '1 1 440px',
          background: 'linear-gradient(150deg, #F9FBFB 0%, #F0F6F5 50%, #E8F2F0 100%)',
          padding: '48px 40px',
          borderRight: '1px solid #E2EBF0',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}>
          <div>
            {/* Top Product Identifier */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
              <div style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                background: 'linear-gradient(135deg, #2A9D8F 0%, #1D7066 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 6px 16px rgba(42, 157, 143, 0.35)',
              }}>
                <MedicineBoxOutlined style={{ fontSize: 22, color: '#FFFFFF' }} />
              </div>
              <div>
                <Title level={4} style={{ margin: 0, fontWeight: 800, letterSpacing: '-0.02em' }}>
                  CancerCare<span style={{ color: '#2A9D8F' }}>360</span>
                </Title>
                <Text style={{ color: '#64748B', fontSize: 12, fontWeight: 500 }}>
                  Patient Follow-up & Continuity of Care OS
                </Text>
              </div>
            </div>

            {/* Core Mission */}
            <Title level={3} style={{ 
              fontWeight: 700, 
              fontSize: 24, 
              lineHeight: 1.35, 
              marginBottom: 12,
              letterSpacing: '-0.01em',
            }}>
              Keep patients connected across months of longitudinal care.
            </Title>
            <Paragraph style={{ fontSize: 14, lineHeight: 1.6, marginBottom: 32 }}>
              Closing the loop before patients fall off treatment protocols through automated care gap detection, multidisciplinary task queues, and proactive barrier navigation.
            </Paragraph>

            {/* Platform Feature Pills */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'flex-start', 
                gap: 12,
                padding: '12px 14px',
                borderRadius: 12,
                background: 'rgba(255, 255, 255, 0.75)',
                border: '1px solid rgba(42, 157, 143, 0.15)',
              }}>
                <div style={{ 
                  width: 30, height: 30, borderRadius: 8, 
                  background: '#E6F4F1', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#2A9D8F', flexShrink: 0
                }}>
                  <ThunderboltOutlined style={{ fontSize: 16 }} />
                </div>
                <div>
                  <Text strong style={{ fontSize: 13, display: 'block' }}>
                    9-Scenario Care Gap Detection Engine
                  </Text>
                  <Text style={{ color: '#64748B', fontSize: 12 }}>
                    Real-time monitoring across chemo milestones, pending SLAs, and missed visits.
                  </Text>
                </div>
              </div>

              <div style={{ 
                display: 'flex', 
                alignItems: 'flex-start', 
                gap: 12,
                padding: '12px 14px',
                borderRadius: 12,
                background: 'rgba(255, 255, 255, 0.75)',
                border: '1px solid rgba(69, 123, 157, 0.15)',
              }}>
                <div style={{ 
                  width: 30, height: 30, borderRadius: 8, 
                  background: '#EAF1F5', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#457B9D', flexShrink: 0
                }}>
                  <CompassOutlined style={{ fontSize: 16 }} />
                </div>
                <div>
                  <Text strong style={{ fontSize: 13, display: 'block' }}>
                    360° Longitudinal Oncology Dossier
                  </Text>
                  <Text style={{ color: '#64748B', fontSize: 12 }}>
                    Unified view uniting EMR notes, path/imaging turnaround times, and toxicity reports.
                  </Text>
                </div>
              </div>

              <div style={{ 
                display: 'flex', 
                alignItems: 'flex-start', 
                gap: 12,
                padding: '12px 14px',
                borderRadius: 12,
                background: 'rgba(255, 255, 255, 0.75)',
                border: '1px solid rgba(231, 111, 81, 0.15)',
              }}>
                <div style={{ 
                  width: 30, height: 30, borderRadius: 8, 
                  background: '#FDF0EC', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#E76F51', flexShrink: 0
                }}>
                  <SafetyCertificateOutlined style={{ fontSize: 16 }} />
                </div>
                <div>
                  <Text strong style={{ fontSize: 13, display: 'block' }}>
                    Closed-Loop Social Navigation
                  </Text>
                  <Text style={{ color: '#64748B', fontSize: 12 }}>
                    Screens transport, financial, and family barriers with 1-click slot recovery.
                  </Text>
                </div>
              </div>
            </div>
          </div>

          {/* Compliance & Standards Footnote */}
          <div style={{ marginTop: 36, paddingTop: 20, borderTop: '1px solid #DFE7EC' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
              <Tag color="cyan" style={{ borderRadius: 6, fontWeight: 500, border: 'none', background: '#E6F7F5', color: '#1D7066' }}>
                <CheckCircleOutlined style={{ marginRight: 4 }} /> ABDM & ABHA Ready
              </Tag>
              <Tag color="blue" style={{ borderRadius: 6, fontWeight: 500, border: 'none', background: '#EDF4FB', color: '#2B5B84' }}>
                <AuditOutlined style={{ marginRight: 4 }} /> HL7 FHIR R4
              </Tag>
              <Tag color="purple" style={{ borderRadius: 6, fontWeight: 500, border: 'none', background: '#F5EFFB', color: '#684589' }}>
                <SafetyCertificateOutlined style={{ marginRight: 4 }} /> DPDP Act 2023 Guardrails
              </Tag>
            </div>
          </div>
        </div>

        {/* Right Sign-In Panel */}
        <div style={{
          flex: '1 1 420px',
          padding: '48px 40px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
        }}>
          <div>
            <div style={{ marginBottom: 28 }}>
              <Title level={3} style={{ margin: '0 0 6px', fontWeight: 700, fontSize: 24 }}>
                Clinical Workspace Login
              </Title>
              <Text style={{ color: '#64748B', fontSize: 14 }}>
                Select a demo role or enter your institutional credentials.
              </Text>
            </div>

            {error && (
              <Alert 
                message={error} 
                type="error" 
                showIcon 
                closable
                onClose={() => setError(null)}
                style={{ marginBottom: 24, borderRadius: 8 }} 
              />
            )}

            {/* Quick Demo Role Switcher Cards */}
            <div style={{ marginBottom: 24 }}>
              <Text style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#94A3B8', display: 'block', marginBottom: 10 }}>
                Quick Fill Demo Role
              </Text>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                {/* Admin Card */}
                <div 
                  onClick={() => handleRoleSelect('admin', 'admin@cancercare.com', 'Admin@123')}
                  style={{
                    padding: '10px 8px',
                    borderRadius: 10,
                    border: selectedRole === 'admin' ? '2px solid #2A9D8F' : '1px solid #E2E8F0',
                    background: selectedRole === 'admin' ? '#F0F9F8' : 'var(--glass-card-bg)',
                    cursor: 'pointer',
                    textAlign: 'center',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <SafetyCertificateOutlined style={{ fontSize: 18, color: selectedRole === 'admin' ? '#2A9D8F' : '#64748B', marginBottom: 4 }} />
                  <div style={{ fontSize: 12, fontWeight: 700, color: selectedRole === 'admin' ? '#1D7066' : 'inherit' }}>
                    Admin
                  </div>
                  <div style={{ fontSize: 10, color: '#94A3B8' }}>All Systems</div>
                </div>

                {/* Coordinator Card */}
                <div 
                  onClick={() => handleRoleSelect('coord', 'coordinator@cancercare.com', 'Coord@123')}
                  style={{
                    padding: '10px 8px',
                    borderRadius: 10,
                    border: selectedRole === 'coord' ? '2px solid #2A9D8F' : '1px solid #E2E8F0',
                    background: selectedRole === 'coord' ? '#F0F9F8' : 'var(--glass-card-bg)',
                    cursor: 'pointer',
                    textAlign: 'center',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <TeamOutlined style={{ fontSize: 18, color: selectedRole === 'coord' ? '#2A9D8F' : '#64748B', marginBottom: 4 }} />
                  <div style={{ fontSize: 12, fontWeight: 700, color: selectedRole === 'coord' ? '#1D7066' : 'inherit' }}>
                    Coordinator
                  </div>
                  <div style={{ fontSize: 10, color: '#94A3B8' }}>Outreach & Gaps</div>
                </div>

                {/* Oncologist Card */}
                <div 
                  onClick={() => handleRoleSelect('doc', 'priya.mehta@cancercare.com', 'Doctor@123')}
                  style={{
                    padding: '10px 8px',
                    borderRadius: 10,
                    border: selectedRole === 'doc' ? '2px solid #2A9D8F' : '1px solid #E2E8F0',
                    background: selectedRole === 'doc' ? '#F0F9F8' : 'var(--glass-card-bg)',
                    cursor: 'pointer',
                    textAlign: 'center',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <UserOutlined style={{ fontSize: 18, color: selectedRole === 'doc' ? '#2A9D8F' : '#64748B', marginBottom: 4 }} />
                  <div style={{ fontSize: 12, fontWeight: 700, color: selectedRole === 'doc' ? '#1D7066' : 'inherit' }}>
                    Oncologist
                  </div>
                  <div style={{ fontSize: 10, color: '#94A3B8' }}>Consults & OPD</div>
                </div>
              </div>
            </div>

            {/* Login Form */}
            <Form
              form={form}
              name="login"
              onFinish={onFinish}
              layout="vertical"
              size="large"
              requiredMark={false}
              initialValues={{
                email: 'admin@cancercare.com',
                password: 'Admin@123',
              }}
            >
              <Form.Item
                name="email"
                label={<span style={{ fontWeight: 600, fontSize: 13 }}>Institutional Email</span>}
                rules={[
                  { required: true, message: 'Please enter your work email' },
                  { type: 'email', message: 'Please enter a valid email address' }
                ]}
                style={{ marginBottom: 18 }}
              >
                <Input 
                  prefix={<UserOutlined style={{ color: '#94A3B8', marginRight: 4 }} />} 
                  placeholder="name@cancercare.com" 
                  style={{ 
                    borderRadius: 10, 
                    borderColor: '#CBD5E1', 
                    height: 46,
                    fontSize: 14,
                  }}
                />
              </Form.Item>

              <Form.Item
                name="password"
                label={<span style={{ fontWeight: 600, fontSize: 13 }}>Password</span>}
                rules={[{ required: true, message: 'Please enter your password' }]}
                style={{ marginBottom: 28 }}
              >
                <Input.Password 
                  prefix={<LockOutlined style={{ color: '#94A3B8', marginRight: 4 }} />} 
                  placeholder="••••••••" 
                  style={{ 
                    borderRadius: 10, 
                    borderColor: '#CBD5E1', 
                    height: 46,
                    fontSize: 14,
                  }}
                />
              </Form.Item>

              <Form.Item style={{ marginBottom: 0 }}>
                <Button 
                  type="primary" 
                  htmlType="submit" 
                  block 
                  loading={isLoading}
                  icon={<ArrowRightOutlined />}
                  style={{ 
                    height: 48, 
                    borderRadius: 10, 
                    background: 'linear-gradient(135deg, #2A9D8F 0%, #1D7066 100%)', 
                    borderColor: '#2A9D8F',
                    fontWeight: 700,
                    fontSize: 15,
                    boxShadow: '0 6px 20px rgba(42, 157, 143, 0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexDirection: 'row-reverse',
                    gap: 8,
                  }}
                >
                  Sign In to Workspace
                </Button>
              </Form.Item>
            </Form>

            {/* Footer Signature */}
            <div style={{ textAlign: 'center', marginTop: 32 }}>
              <Text style={{ color: '#94A3B8', fontSize: 12 }}>
                CancerCare 360 Platform • Team Krishna
              </Text>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
