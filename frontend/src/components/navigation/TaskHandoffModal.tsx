'use client';

import React, { useState } from 'react';
import { Modal, Form, Select, Input, message, Alert, Space, Typography, Timeline, Tag, Divider } from 'antd';
import { SwapOutlined, UserOutlined, ClockCircleOutlined, AuditOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { navigationService } from '@/services/navigation.service';
import { TaskHandoff, TaskHandoffInput } from '@/types/navigation';

const { Option } = Select;
const { TextArea } = Input;
const { Text } = Typography;

interface TaskHandoffModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  taskId: string;
  patientName?: string;
  currentRole?: string;
  handoffs?: TaskHandoff[];
}

export default function TaskHandoffModal({
  open,
  onClose,
  onSuccess,
  taskId,
  patientName,
  currentRole = 'CARE_COORDINATOR',
  handoffs = [],
}: TaskHandoffModalProps) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values: any) => {
    try {
      setLoading(true);
      const payload: TaskHandoffInput = {
        toRole: values.toRole,
        toUserId: values.toUserId || undefined,
        reason: values.reason,
        notes: values.notes,
      };

      await navigationService.handoffTask(taskId, payload);
      message.success(`Task successfully transferred to ${values.toRole.replace(/_/g, ' ')}`);
      form.resetFields();
      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      message.error(err?.response?.data?.message || 'Failed to handoff task');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={
        <Space>
          <SwapOutlined style={{ color: '#6366f1' }} />
          <span>Inter-Role Task Handoff & Escalation</span>
        </Space>
      }
      open={open}
      onCancel={onClose}
      onOk={() => form.submit()}
      confirmLoading={loading}
      okText="Transfer Task"
      width={600}
      destroyOnClose
    >
      <Alert
        message="Closed-Loop Clinical Delegation"
        description="Transfer this patient follow-up case between Care Coordinators, Oncology Nurses, Treating Oncologists, or Medical Social Work with mandatory audit rationale."
        type="info"
        showIcon
        style={{ marginBottom: 16 }}
      />

      <div style={{ marginBottom: 16, padding: '10px 14px', background: '#f8fafc', borderRadius: 6, border: '1px solid #e2e8f0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <Text strong>{patientName || 'Patient'}</Text>
            <Text type="secondary" style={{ marginLeft: 8 }}>(Task: {taskId.slice(0, 8)}...)</Text>
          </div>
          <Tag color="purple">From: {currentRole.replace(/_/g, ' ')}</Tag>
        </div>
      </div>

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          toRole: 'DOCTOR',
          reason: 'Severe clinical symptom / toxicity reported by patient requiring physician evaluation',
        }}
      >
        <Form.Item
          name="toRole"
          label="Target Role / Department"
          rules={[{ required: true, message: 'Please select target role' }]}
        >
          <Select placeholder="Select role">
            <Option value="DOCTOR">Treating Medical / Surgical Oncologist</Option>
            <Option value="CHIEF_ONCOLOGIST">Chief Oncologist / HOD (Clinical Escalation)</Option>
            <Option value="NURSE">Oncology Day-care Nurse / Triage</Option>
            <Option value="CARE_COORDINATOR">Senior Care Coordinator / Navigator</Option>
            <Option value="SOCIAL_WORKER">Medical Social Worker (Financial / Welfare Aid)</Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="reason"
          label="Mandatory Clinical Reason for Handoff"
          rules={[{ required: true, message: 'Please provide a clinical or operational reason' }]}
        >
          <Select placeholder="Select or type reason" showSearch>
            <Option value="Severe clinical symptom / toxicity reported by patient requiring physician evaluation">
              Severe clinical symptom / toxicity reported by patient (Physician evaluation)
            </Option>
            <Option value="Complex multi-modality scheduling conflict (Chemo + RT concurrent timing)">
              Complex multi-modality scheduling conflict (Chemo + RT concurrent)
            </Option>
            <Option value="Severe financial distress requiring Medical Social Work subsidy clearance">
              Severe financial distress requiring MSW welfare clearance
            </Option>
            <Option value="Repeated outreach non-response (3 attempts failed) requiring Senior Coordinator review">
              Repeated outreach non-response (3 attempts failed)
            </Option>
            <Option value="Patient requesting treatment postponement due to severe caregiver fatigue">
              Patient requesting postponement due to caregiver fatigue
            </Option>
            <Option value="High-risk drop-off flagged by protocol requiring senior consultant intervention">
              High-risk drop-off flagged by protocol (Senior consultant review)
            </Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="notes"
          label="Directives & Clinical Context"
          rules={[{ required: true, message: 'Please provide specific handover instructions' }]}
        >
          <TextArea
            rows={3}
            placeholder="e.g. Patient called reporting grade 3 oral mucositis and fever 101F post-doxorubicin. Needs dose reduction or symptomatic review before Cycle 3."
          />
        </Form.Item>
      </Form>

      {handoffs.length > 0 && (
        <>
          <Divider style={{ margin: '16px 0 12px' }}>
            <Space>
              <AuditOutlined />
              <span>Prior Handoff Audit Trail ({handoffs.length})</span>
            </Space>
          </Divider>
          <Timeline
            style={{ maxHeight: 150, overflowY: 'auto', paddingTop: 8 }}
            items={handoffs.map((h) => ({
              color: 'blue',
              children: (
                <div style={{ fontSize: 12 }}>
                  <div style={{ fontWeight: 600 }}>
                    {h.fromRole.replace(/_/g, ' ')} &rarr; {h.toRole.replace(/_/g, ' ')}
                    <span style={{ color: '#94a3b8', fontWeight: 'normal', marginLeft: 8 }}>
                      {dayjs(h.handoffDate).format('DD MMM YYYY, HH:mm')}
                    </span>
                  </div>
                  <div style={{ marginTop: 2 }}>{h.reason}</div>
                  {h.notes && <div style={{ color: '#64748b', fontStyle: 'italic' }}>&ldquo;{h.notes}&rdquo;</div>}
                </div>
              ),
            }))}
          />
        </>
      )}
    </Modal>
  );
}
