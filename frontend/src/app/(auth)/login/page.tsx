'use client';

import React, { useState } from 'react';
import { Form, Input, Button, Typography, Alert, Divider } from 'antd';
import { UserOutlined, LockOutlined, MedicineBoxOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';

const { Title, Text } = Typography;

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading } = useAuth();
  const [error, setError] = useState<string | null>(null);
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

  const setCredentials = (email: string) => {
    form.setFieldsValue({
      email,
      password: email.startsWith('admin') ? 'Admin@123' : email.startsWith('coord') ? 'Coord@123' : 'Doctor@123'
    });
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      background: '#f8fafc',
      padding: '24px',
      position: 'relative'
    }}>
      <div style={{
        position: 'absolute',
        top: 0, left: 0, right: 0, height: '40vh',
        background: 'linear-gradient(180deg, #1e293b 0%, #0f172a 100%)',
        zIndex: 0
      }} />

      <div style={{ 
        width: '100%', 
        maxWidth: 420, 
        background: '#ffffff',
        borderRadius: 16, 
        boxShadow: '0 20px 40px -15px rgba(0,0,0,0.1)',
        overflow: 'hidden',
        zIndex: 1,
        border: '1px solid #e2e8f0'
      }}>
        <div style={{ padding: '40px 32px 32px', textAlign: 'center', borderBottom: '1px solid #f1f5f9' }}>
          <div style={{
            width: 48,
            height: 48,
            borderRadius: 12,
            background: 'linear-gradient(135deg, #0ea5e9 0%, #3b82f6 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
            boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
          }}>
            <MedicineBoxOutlined style={{ fontSize: 24, color: '#ffffff' }} />
          </div>
          <Title level={3} style={{ margin: '0 0 4px', fontWeight: 700, color: '#0f172a' }}>
            CancerCare<span style={{ color: '#3b82f6' }}>360</span>
          </Title>
          <Text style={{ color: '#64748b', fontSize: 14 }}>Enterprise Oncology OS</Text>
        </div>

        <div style={{ padding: '32px' }}>
          {error && <Alert message={error} type="error" showIcon style={{ marginBottom: 24 }} />}

          <Form
            form={form}
            name="login"
            onFinish={onFinish}
            layout="vertical"
            size="large"
            requiredMark={false}
          >
            <Form.Item
              name="email"
              label={<span style={{ fontWeight: 600, color: '#334155' }}>Email Address</span>}
              rules={[{ required: true, message: 'Please enter your email' }]}
            >
              <Input 
                prefix={<UserOutlined style={{ color: '#94a3b8' }} />} 
                placeholder="dr.smith@cancercare.com" 
                style={{ borderRadius: 8 }}
              />
            </Form.Item>

            <Form.Item
              name="password"
              label={<span style={{ fontWeight: 600, color: '#334155' }}>Password</span>}
              rules={[{ required: true, message: 'Please enter your password' }]}
            >
              <Input.Password 
                prefix={<LockOutlined style={{ color: '#94a3b8' }} />} 
                placeholder="••••••••" 
                style={{ borderRadius: 8 }}
              />
            </Form.Item>

            <Form.Item style={{ marginTop: 32, marginBottom: 0 }}>
              <Button 
                type="primary" 
                htmlType="submit" 
                block 
                loading={isLoading}
                style={{ 
                  height: 44, 
                  borderRadius: 8, 
                  background: '#0f172a', 
                  fontWeight: 600,
                  fontSize: 15
                }}
              >
                Sign In to Workspace
              </Button>
            </Form.Item>
          </Form>

          <Divider style={{ borderColor: '#e2e8f0', color: '#94a3b8', fontSize: 12, margin: '24px 0' }}>
            Demo Accounts
          </Divider>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <Button size="small" type="text" onClick={() => setCredentials('priya.mehta@cancercare.com')} style={{ color: '#64748b', textAlign: 'left' }}>
              • Oncologist (priya.mehta@cancercare.com)
            </Button>
            <Button size="small" type="text" onClick={() => setCredentials('coordinator@cancercare.com')} style={{ color: '#64748b', textAlign: 'left' }}>
              • Coordinator (coordinator@cancercare.com)
            </Button>
            <Button size="small" type="text" onClick={() => setCredentials('admin@cancercare.com')} style={{ color: '#64748b', textAlign: 'left' }}>
              • Admin (admin@cancercare.com)
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
