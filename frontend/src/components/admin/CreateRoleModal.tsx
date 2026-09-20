'use client';

import React, { useState, useEffect } from 'react';
import {
  Modal,
  Form,
  Input,
  Checkbox,
  Button,
  Typography,
  Space,
  Row,
  Col,
  Divider,
  Tag,
  Card,
  message,
  Tooltip,
} from 'antd';
import {
  SafetyCertificateOutlined,
  CheckCircleOutlined,
  AppstoreOutlined,
  ThunderboltOutlined,
  ClearOutlined,
  EyeOutlined,
  EditOutlined,
  ControlOutlined,
} from '@ant-design/icons';
import { adminRbacService, RoleData } from '@/services/admin-rbac.service';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

interface ModuleDef {
  resource: string;
  name: string;
  description: string;
  category: 'clinical' | 'patient_support' | 'operational' | 'admin';
}

const MODULES: ModuleDef[] = [
  { resource: 'DASHBOARD', name: 'Dashboard & Metrics', description: 'Executive oncology KPIs, daily census, alerts', category: 'clinical' },
  { resource: 'PATIENT', name: 'Patients Directory', description: 'Patient demographics, longitudinal records, timeline', category: 'clinical' },
  { resource: 'SECOND_OPINION', name: 'Second Opinion Hub', description: 'Multidisciplinary concordance, case reviews, reports', category: 'clinical' },
  { resource: 'CONSULTATION', name: 'Consultations & Briefings', description: 'Readiness cards, biomarker review, stat requests', category: 'clinical' },
  { resource: 'INVESTIGATION', name: 'Investigations & Diagnostics', description: 'Pathology slides, PET-CT, biomarker panels', category: 'clinical' },
  { resource: 'JOURNEY', name: 'Treatment Journeys', description: 'Chemo protocols, radiation plans, surgical milestones', category: 'clinical' },
  { resource: 'DOCUMENT', name: 'Clinical Documents', description: 'Outside hospital records, consent forms, biopsy PDFs', category: 'clinical' },
  { resource: 'APPOINTMENT', name: 'Appointments & Flow', description: 'Clinic scheduling, room queue, waitlist manager', category: 'operational' },
  { resource: 'CARE_GAPS', name: 'Care Gaps & Follow-Up', description: 'Protocol non-adherence alerts, missed milestone tasks', category: 'operational' },
  { resource: 'CARE_CIRCLES', name: 'CareCircles (Family Connect)', description: 'Caregiver support network, peer messaging, forum', category: 'patient_support' },
  { resource: 'CARE_RELIEF', name: 'CareRelief (Aid & Grants)', description: 'Financial assistance, donor pledges, procedure estimates', category: 'patient_support' },
  { resource: 'CAMPAIGN', name: 'Outreach & Campaigns', description: 'Screening camps, follow-up notifications, broadcasts', category: 'operational' },
  { resource: 'EDUCATION', name: 'Patient Education', description: 'Chemo toxicity guides, cancer literacy library', category: 'patient_support' },
  { resource: 'ANALYTICS', name: 'Analytics & Growth', description: 'Care continuity index, barrier resolution, volume', category: 'operational' },
  { resource: 'ADMIN_SETTINGS', name: 'Super Admin Settings', description: 'Role definitions, RBAC permissions, staff provisioning', category: 'admin' },
];

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editingRole?: RoleData | null;
}

export function CreateRoleModal({ open, onClose, onSuccess, editingRole }: Props) {
  const [form] = Form.useForm();
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Keyed by resource: { read: boolean, edit: boolean, manage: boolean }
  const [selectedPermissions, setSelectedPermissions] = useState<Record<string, { read: boolean; edit: boolean; manage: boolean }>>({});

  const initPermissionsFromRole = (role?: RoleData | null) => {
    const map: Record<string, { read: boolean; edit: boolean; manage: boolean }> = {};
    MODULES.forEach((m) => {
      map[m.resource] = { read: false, edit: false, manage: false };
    });

    if (role && role.permissions) {
      role.permissions.forEach((permStr) => {
        const [res, act] = permStr.split(':');
        if (map[res]) {
          if (act === 'READ') map[res].read = true;
          if (act === 'CREATE' || act === 'UPDATE') map[res].edit = true;
          if (act === 'DELETE' || act === 'ALL') {
            map[res].manage = true;
            map[res].read = true;
            map[res].edit = true;
          }
        }
      });
    }

    setSelectedPermissions(map);
  };

  useEffect(() => {
    if (open) {
      form.resetFields();
      if (editingRole) {
        form.setFieldsValue({
          name: editingRole.name.replace(/_/g, ' '),
          description: editingRole.description,
        });
        initPermissionsFromRole(editingRole);
      } else {
        initPermissionsFromRole(null);
      }
    }
  }, [open, editingRole]);

  const handleToggle = (resource: string, type: 'read' | 'edit' | 'manage', val: boolean) => {
    setSelectedPermissions((prev) => {
      const current = { ...prev[resource] };
      current[type] = val;
      // If user gives edit or manage, auto-check read
      if (type === 'edit' && val) current.read = true;
      if (type === 'manage' && val) {
        current.read = true;
        current.edit = true;
      }
      // If read is unchecked, uncheck edit and manage
      if (type === 'read' && !val) {
        current.edit = false;
        current.manage = false;
      }
      return { ...prev, [resource]: current };
    });
  };

  const applyPreset = (presetName: string) => {
    const map: Record<string, { read: boolean; edit: boolean; manage: boolean }> = {};
    MODULES.forEach((m) => {
      map[m.resource] = { read: false, edit: false, manage: false };
    });

    if (presetName === 'clinical') {
      ['DASHBOARD', 'PATIENT', 'SECOND_OPINION', 'CONSULTATION', 'INVESTIGATION', 'JOURNEY', 'DOCUMENT', 'APPOINTMENT'].forEach((res) => {
        map[res] = { read: true, edit: true, manage: true };
      });
      ['CARE_GAPS', 'EDUCATION', 'CARE_CIRCLES'].forEach((res) => {
        map[res] = { read: true, edit: true, manage: false };
      });
    } else if (presetName === 'navigation') {
      ['DASHBOARD', 'PATIENT', 'CARE_GAPS', 'APPOINTMENT', 'CARE_CIRCLES', 'EDUCATION', 'CAMPAIGN', 'DOCUMENT'].forEach((res) => {
        map[res] = { read: true, edit: true, manage: false };
      });
      ['CONSULTATION', 'JOURNEY', 'INVESTIGATION'].forEach((res) => {
        map[res] = { read: true, edit: false, manage: false };
      });
    } else if (presetName === 'relief') {
      ['DASHBOARD', 'PATIENT', 'CARE_RELIEF', 'CARE_CIRCLES'].forEach((res) => {
        map[res] = { read: true, edit: true, manage: true };
      });
      ['DOCUMENT'].forEach((res) => {
        map[res] = { read: true, edit: false, manage: false };
      });
    } else if (presetName === 'auditor') {
      MODULES.forEach((m) => {
        if (m.resource !== 'ADMIN_SETTINGS') {
          map[m.resource] = { read: true, edit: false, manage: false };
        }
      });
    } else if (presetName === 'all') {
      MODULES.forEach((m) => {
        map[m.resource] = { read: true, edit: true, manage: true };
      });
    }

    setSelectedPermissions(map);
    message.success(`Preset "${presetName}" applied to permission matrix`);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setIsSubmitting(true);

      // Convert selected permissions back into permission array
      const permissions: string[] = [];
      Object.entries(selectedPermissions).forEach(([resource, acts]) => {
        if (acts.read) permissions.push(`${resource}:READ`);
        if (acts.edit) {
          permissions.push(`${resource}:CREATE`);
          permissions.push(`${resource}:UPDATE`);
        }
        if (acts.manage) {
          permissions.push(`${resource}:DELETE`);
          permissions.push(`${resource}:ALL`);
        }
      });

      if (permissions.length === 0) {
        message.warning('Please grant at least one module permission to this role.');
        setIsSubmitting(false);
        return;
      }

      if (editingRole) {
        await adminRbacService.updateRole(editingRole.id, {
          name: values.name.trim(),
          description: values.description?.trim(),
          permissions,
        });
        message.success(`Role "${values.name}" updated successfully`);
      } else {
        await adminRbacService.createRole({
          name: values.name.trim(),
          description: values.description?.trim(),
          permissions,
        });
        message.success(`Role "${values.name}" created successfully`);
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      message.error(err?.response?.data?.message || err?.message || 'Error saving role');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
            }}
          >
            <SafetyCertificateOutlined style={{ fontSize: 18 }} />
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 16 }}>
              {editingRole ? `Configure Role: ${editingRole.name}` : 'Create Custom Role & Access Permissions'}
            </div>
            <div style={{ fontSize: 12, fontWeight: 400, opacity: 0.65 }}>
              Specify granular module access: determine what access to grant to whom
            </div>
          </div>
        </div>
      }
      open={open}
      onCancel={onClose}
      width={780}
      footer={[
        <Button key="cancel" onClick={onClose} disabled={isSubmitting}>
          Cancel
        </Button>,
        <Button
          key="submit"
          type="primary"
          icon={<CheckCircleOutlined />}
          loading={isSubmitting}
          onClick={handleSubmit}
          style={{ background: '#059669', borderColor: '#059669', fontWeight: 700 }}
        >
          {editingRole ? 'Update Role Permissions' : 'Create Role & Save Permissions'}
        </Button>,
      ]}
    >
      <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
        <Row gutter={16}>
          <Col xs={24} sm={12}>
            <Form.Item
              name="name"
              label="Role Name"
              rules={[{ required: true, message: 'Please enter role name' }]}
            >
              <Input placeholder="e.g. Chemotherapy Nurse Specialist" disabled={editingRole?.isSystem} />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item name="description" label="Role Description">
              <Input placeholder="Clinical or administrative purpose..." />
            </Form.Item>
          </Col>
        </Row>

        <Divider style={{ margin: '12px 0 16px' }} />

        {/* Presets Toolbar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
          <div>
            <span style={{ fontWeight: 700, fontSize: 13 }}>Quick Permission Presets:</span>
          </div>
          <Space wrap size={6}>
            <Button size="small" onClick={() => applyPreset('clinical')}>
              Oncologist / Physician
            </Button>
            <Button size="small" onClick={() => applyPreset('navigation')}>
              Nurse & Coordinator
            </Button>
            <Button size="small" onClick={() => applyPreset('relief')}>
              Financial Navigator
            </Button>
            <Button size="small" onClick={() => applyPreset('auditor')}>
              Read-Only Auditor
            </Button>
            <Button size="small" icon={<ClearOutlined />} onClick={() => applyPreset('none')}>
              Clear All
            </Button>
          </Space>
        </div>

        {/* Visual Permission Matrix */}
        <div
          style={{
            maxHeight: 420,
            overflowY: 'auto',
            borderRadius: 12,
            border: '1px solid rgba(255, 255, 255, 0.08)',
            padding: 8,
            background: 'rgba(255, 255, 255, 0.02)',
          }}
        >
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)', textAlign: 'left' }}>
                <th style={{ padding: '8px 12px', fontWeight: 700 }}>Software Module</th>
                <th style={{ padding: '8px 12px', textAlign: 'center', width: 90 }}>
                  <EyeOutlined style={{ marginRight: 4 }} /> View
                </th>
                <th style={{ padding: '8px 12px', textAlign: 'center', width: 110 }}>
                  <EditOutlined style={{ marginRight: 4 }} /> Create/Edit
                </th>
                <th style={{ padding: '8px 12px', textAlign: 'center', width: 100 }}>
                  <ControlOutlined style={{ marginRight: 4 }} /> Manage All
                </th>
              </tr>
            </thead>
            <tbody>
              {MODULES.map((m) => {
                const perms = selectedPermissions[m.resource] || { read: false, edit: false, manage: false };
                const isFull = perms.read && perms.edit && perms.manage;

                return (
                  <tr
                    key={m.resource}
                    style={{
                      borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                      background: isFull ? 'rgba(16, 185, 129, 0.04)' : undefined,
                    }}
                  >
                    <td style={{ padding: '10px 12px' }}>
                      <div style={{ fontWeight: 600 }}>{m.name}</div>
                      <div style={{ fontSize: 11, opacity: 0.65 }}>{m.description}</div>
                    </td>
                    <td style={{ textAlign: 'center', padding: '10px 12px' }}>
                      <Checkbox
                        checked={perms.read}
                        onChange={(e) => handleToggle(m.resource, 'read', e.target.checked)}
                      />
                    </td>
                    <td style={{ textAlign: 'center', padding: '10px 12px' }}>
                      <Checkbox
                        checked={perms.edit}
                        onChange={(e) => handleToggle(m.resource, 'edit', e.target.checked)}
                      />
                    </td>
                    <td style={{ textAlign: 'center', padding: '10px 12px' }}>
                      <Checkbox
                        checked={perms.manage}
                        onChange={(e) => handleToggle(m.resource, 'manage', e.target.checked)}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Form>
    </Modal>
  );
}
