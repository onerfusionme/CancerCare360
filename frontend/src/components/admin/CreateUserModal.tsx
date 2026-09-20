'use client';

import React, { useState, useEffect } from 'react';
import {
  Modal,
  Form,
  Input,
  Select,
  Switch,
  Radio,
  Button,
  Typography,
  Space,
  Row,
  Col,
  Divider,
  Alert,
  message,
  Card,
  Tooltip,
} from 'antd';
import {
  UserAddOutlined,
  MailOutlined,
  LockOutlined,
  KeyOutlined,
  ReloadOutlined,
  CopyOutlined,
  CheckCircleOutlined,
  SafetyCertificateOutlined,
  EyeOutlined,
  EyeInvisibleOutlined,
  LinkOutlined,
  SendOutlined,
} from '@ant-design/icons';
import { adminRbacService, RoleData } from '@/services/admin-rbac.service';

const { Title, Text, Paragraph } = Typography;

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  roles: RoleData[];
}

export function CreateUserModal({ open, onClose, onSuccess, roles }: Props) {
  const [form] = Form.useForm();
  const [passwordMode, setPasswordMode] = useState<'auto' | 'custom'>('auto');
  const [generatedPassword, setGeneratedPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [sendEmail, setSendEmail] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Success summary modal state
  const [createdSummary, setCreatedSummary] = useState<{
    name: string;
    email: string;
    role: string;
    password?: string;
    emailDispatched: boolean;
  } | null>(null);

  const generateSecurePassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let rand = '';
    for (let i = 0; i < 6; i++) {
      rand += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    const pwd = `Care@${rand}!`;
    setGeneratedPassword(pwd);
    return pwd;
  };

  useEffect(() => {
    if (open) {
      generateSecurePassword();
      form.resetFields();
      setSendEmail(true);
      setPasswordMode('auto');
    }
  }, [open]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setIsSubmitting(true);

      const finalPassword = passwordMode === 'auto' ? generatedPassword : values.customPassword;

      const payload = {
        firstName: values.firstName.trim(),
        lastName: values.lastName.trim(),
        email: values.email.trim().toLowerCase(),
        phone: values.phone?.trim(),
        departmentId: values.departmentId,
        roleIds: [values.roleId],
        password: finalPassword,
        sendEmail,
      };

      const res = await adminRbacService.createUser(payload);

      const assignedRole = roles.find((r) => r.id === values.roleId)?.name?.replace(/_/g, ' ') || 'Staff Member';

      setCreatedSummary({
        name: `${payload.firstName} ${payload.lastName}`,
        email: payload.email,
        role: assignedRole,
        password: finalPassword,
        emailDispatched: sendEmail,
      });

      message.success(`Staff user created. Login ID & Password generated.`);
      onSuccess();
    } catch (err: any) {
      message.error(err?.response?.data?.message || err?.message || 'Error creating user');
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyInvitationText = () => {
    if (!createdSummary) return;
    const text = `CancerCare360 Staff Access Credentials:
Name: ${createdSummary.name}
Role: ${createdSummary.role}
Login ID / Email: ${createdSummary.email}
Password: ${createdSummary.password}
Access URL: ${window.location.origin}/login

Please log in and update your password upon initial access.`;

    navigator.clipboard.writeText(text);
    message.success('Staff invitation copied to clipboard!');
  };

  return (
    <>
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
              }}
            >
              <UserAddOutlined style={{ fontSize: 18 }} />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: 16 }}>Provision Staff Member Account</div>
              <div style={{ fontSize: 12, fontWeight: 400, opacity: 0.65 }}>
                Assign role-based access, generate ID/password, and dispatch email invitation
              </div>
            </div>
          </div>
        }
        open={open}
        onCancel={onClose}
        width={680}
        footer={[
          <Button key="cancel" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>,
          <Button
            key="submit"
            type="primary"
            icon={<SendOutlined />}
            loading={isSubmitting}
            onClick={handleSubmit}
            style={{ background: '#4f46e5', borderColor: '#4f46e5', fontWeight: 700 }}
          >
            Create User & Dispatch Credentials
          </Button>,
        ]}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="firstName"
                label="First Name"
                rules={[{ required: true, message: 'Please enter first name' }]}
              >
                <Input placeholder="e.g. Priya" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="lastName"
                label="Last Name"
                rules={[{ required: true, message: 'Please enter last name' }]}
              >
                <Input placeholder="e.g. Mehta" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} sm={14}>
              <Form.Item
                name="email"
                label="Staff Email (Login ID)"
                rules={[
                  { required: true, message: 'Email is required' },
                  { type: 'email', message: 'Enter a valid email' },
                ]}
                extra="This email serves as the user's permanent Login ID for CancerCare360."
              >
                <Input prefix={<MailOutlined style={{ opacity: 0.5 }} />} placeholder="doctor.name@hospital.com" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={10}>
              <Form.Item name="phone" label="Mobile Phone">
                <Input placeholder="+91 98765 43210" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="roleId"
                label="Assigned Role (RBAC)"
                rules={[{ required: true, message: 'Please select an access role' }]}
                extra="Determines which modules and permissions this staff member can access."
              >
                <Select placeholder="Select role...">
                  {roles.map((r) => (
                    <Select.Option key={r.id} value={r.id}>
                      <span style={{ fontWeight: 600 }}>{r.name.replace(/_/g, ' ')}</span>{' '}
                      {r.isSystem ? (
                        <span style={{ fontSize: 11, opacity: 0.6 }}>(System)</span>
                      ) : (
                        <span style={{ fontSize: 11, color: '#6366f1' }}>(Custom)</span>
                      )}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>

            <Col xs={24} sm={12}>
              <Form.Item name="departmentId" label="Clinical Department">
                <Select placeholder="Optional department...">
                  <Select.Option value="11111111-1111-1111-1111-111111111111">Medical Oncology</Select.Option>
                  <Select.Option value="22222222-2222-2222-2222-222222222222">Surgical Oncology</Select.Option>
                  <Select.Option value="33333333-3333-3333-3333-333333333333">Radiation Oncology</Select.Option>
                  <Select.Option value="44444444-4444-4444-4444-444444444444">Pathology & Molecular Labs</Select.Option>
                  <Select.Option value="55555555-5555-5555-5555-555555555555">Nursing & Care Coordination</Select.Option>
                  <Select.Option value="66666666-6666-6666-6666-666666666666">Hospital Administration</Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Divider style={{ margin: '14px 0' }} />

          {/* Password Section */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <div style={{ fontWeight: 700, fontSize: 13.5 }}>
                <KeyOutlined style={{ marginRight: 6, color: '#6366f1' }} /> Password Setup
              </div>
              <Radio.Group
                size="small"
                value={passwordMode}
                onChange={(e) => setPasswordMode(e.target.value)}
              >
                <Radio.Button value="auto">Auto-Generate</Radio.Button>
                <Radio.Button value="custom">Set Custom</Radio.Button>
              </Radio.Group>
            </div>

            {passwordMode === 'auto' ? (
              <div
                style={{
                  padding: '12px 16px',
                  borderRadius: 10,
                  background: 'rgba(99, 102, 241, 0.08)',
                  border: '1px solid rgba(99, 102, 241, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, opacity: 0.7, textTransform: 'uppercase' }}>
                    Generated Temporary Password
                  </div>
                  <div style={{ fontFamily: 'monospace', fontSize: 18, fontWeight: 800, color: '#4338ca', letterSpacing: 1, marginTop: 2 }}>
                    {showPassword ? generatedPassword : '••••••••••••'}
                  </div>
                </div>
                <Space>
                  <Button
                    size="small"
                    icon={showPassword ? <EyeInvisibleOutlined /> : <EyeOutlined />}
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? 'Hide' : 'Reveal'}
                  </Button>
                  <Button
                    size="small"
                    icon={<ReloadOutlined />}
                    onClick={() => generateSecurePassword()}
                    title="Generate new password"
                  >
                    Regenerate
                  </Button>
                  <Button
                    size="small"
                    icon={<CopyOutlined />}
                    onClick={() => {
                      navigator.clipboard.writeText(generatedPassword);
                      message.success('Password copied to clipboard');
                    }}
                  >
                    Copy
                  </Button>
                </Space>
              </div>
            ) : (
              <Form.Item
                name="customPassword"
                label="Custom Initial Password"
                rules={[
                  { required: true, message: 'Please enter custom password' },
                  { min: 6, message: 'Password must be at least 6 characters' },
                ]}
              >
                <Input.Password prefix={<LockOutlined style={{ opacity: 0.5 }} />} placeholder="Enter strong password..." />
              </Form.Item>
            )}
          </div>

          {/* Email Invitation Option */}
          <div
            style={{
              padding: '12px 16px',
              borderRadius: 10,
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div style={{ fontWeight: 700, fontSize: 13.5 }}>
                <MailOutlined style={{ marginRight: 6, color: '#10b981' }} /> Send Login Credentials via Email
              </div>
              <div style={{ fontSize: 12, opacity: 0.7, marginTop: 2 }}>
                Dispatches an invitation email with Login ID, Password, and a direct link to the software.
              </div>
            </div>
            <Switch checked={sendEmail} onChange={setSendEmail} />
          </div>
        </Form>
      </Modal>

      {/* Confirmation & Credentials Issued Summary Modal */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <CheckCircleOutlined style={{ fontSize: 24, color: '#10b981' }} />
            <div>
              <div style={{ fontWeight: 800, fontSize: 16 }}>Staff Account Provisioned Successfully</div>
              <div style={{ fontSize: 12, fontWeight: 400, opacity: 0.7 }}>
                Credentials and access links are active
              </div>
            </div>
          </div>
        }
        open={!!createdSummary}
        onCancel={() => {
          setCreatedSummary(null);
          onClose();
        }}
        footer={[
          <Button key="copy" icon={<CopyOutlined />} onClick={copyInvitationText}>
            Copy Invitation Text
          </Button>,
          <Button
            key="done"
            type="primary"
            onClick={() => {
              setCreatedSummary(null);
              onClose();
            }}
            style={{ background: '#10b981', borderColor: '#10b981', fontWeight: 700 }}
          >
            Done
          </Button>,
        ]}
      >
        {createdSummary && (
          <div style={{ padding: '8px 0' }}>
            {createdSummary.emailDispatched ? (
              <Alert
                message="Invitation Email Dispatched"
                description={`An onboarding email containing the login credentials and direct software link was dispatched to ${createdSummary.email}.`}
                type="success"
                showIcon
                style={{ marginBottom: 16 }}
              />
            ) : (
              <Alert
                message="Account Created Without Email Dispatch"
                description="Email dispatch was toggled off. Please copy and manually share the credentials below with the staff member."
                type="info"
                showIcon
                style={{ marginBottom: 16 }}
              />
            )}

            <Card className="glass-card" style={{ borderRadius: 12 }} styles={{ body: { padding: '16px' } }}>
              <Row gutter={[16, 12]}>
                <Col span={12}>
                  <div style={{ fontSize: 11, fontWeight: 700, opacity: 0.6, textTransform: 'uppercase' }}>Staff Name</div>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>{createdSummary.name}</div>
                </Col>
                <Col span={12}>
                  <div style={{ fontSize: 11, fontWeight: 700, opacity: 0.6, textTransform: 'uppercase' }}>Assigned Role</div>
                  <div style={{ fontWeight: 700, fontSize: 14, color: '#6366f1' }}>{createdSummary.role}</div>
                </Col>
                <Col span={24}>
                  <Divider style={{ margin: '8px 0' }} />
                </Col>
                <Col span={12}>
                  <div style={{ fontSize: 11, fontWeight: 700, opacity: 0.6, textTransform: 'uppercase' }}>Login ID (Email)</div>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>{createdSummary.email}</div>
                </Col>
                <Col span={12}>
                  <div style={{ fontSize: 11, fontWeight: 700, opacity: 0.6, textTransform: 'uppercase' }}>Password</div>
                  <div style={{ fontFamily: 'monospace', fontWeight: 800, fontSize: 15, color: '#0284c7' }}>
                    {createdSummary.password}
                  </div>
                </Col>
                <Col span={24}>
                  <div style={{ fontSize: 11, fontWeight: 700, opacity: 0.6, textTransform: 'uppercase', marginTop: 4 }}>Software Login Link</div>
                  <div style={{ fontSize: 13, color: '#4f46e5', fontWeight: 600 }}>
                    <LinkOutlined style={{ marginRight: 4 }} /> {typeof window !== 'undefined' ? window.location.origin : ''}/login
                  </div>
                </Col>
              </Row>
            </Card>
          </div>
        )}
      </Modal>
    </>
  );
}
