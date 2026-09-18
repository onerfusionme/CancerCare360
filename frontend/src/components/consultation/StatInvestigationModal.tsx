'use client';
import React, { useState } from 'react';
import { Modal, Form, Select, Input, Switch, Alert, Button, message, Space, Tag } from 'antd';
import { ThunderboltOutlined, ExperimentOutlined } from '@ant-design/icons';
import { consultationService } from '@/services/consultation.service';

const { TextArea } = Input;

interface StatInvestigationModalProps {
  visible: boolean;
  patientId: string;
  patientName: string;
  onClose: () => void;
  onSuccess: () => void;
}

const COMMON_PRE_CONSULT_LABS = [
  { value: 'COMPLETE_BLOOD_COUNT_STAT', label: 'CBC with Absolute Neutrophil Count (STAT / Pre-Chemo)' },
  { value: 'SERUM_CREATININE_ELECTROLYTES', label: 'Serum Creatinine, BUN & Electrolytes (Renal Clearance)' },
  { value: 'LIVER_FUNCTION_TESTS', label: 'Liver Function Panel (AST/ALT, Total Bilirubin, Albumin)' },
  { value: 'TUMOR_MARKER_CEA_CA125', label: 'Serum Tumor Biomarkers (CEA, CA-125, CA 19-9)' },
  { value: 'CARDIAC_ENZYMES_ECG', label: '12-Lead ECG & Cardiac Markers (Pre-Anthracycline)' },
  { value: 'URGENT_CHEST_XRAY', label: 'Stat Digital Chest Radiograph (Pulmonary Evaluation)' },
  { value: 'HISTOPATH_IHC_MOLECULAR_EXPEDITE', label: 'Expedite Pathology / Biopsy IHC Sign-Off (ER/PR/HER2/Ki-67)' },
];

export const StatInvestigationModal: React.FC<StatInvestigationModalProps> = ({
  visible,
  patientId,
  patientName,
  onClose,
  onSuccess,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      await consultationService.orderStatInvestigation(patientId, {
        investigationType: values.investigationType,
        notes: values.notes,
        isUrgent: true,
      });

      message.success(`Stat test ${values.investigationType.replace(/_/g, ' ')} successfully ordered & prioritized`);
      form.resetFields();
      onSuccess();
      onClose();
    } catch (err: any) {
      if (err.errorFields) return; // Validation error
      message.error(err.response?.data?.message || 'Failed to dispatch stat investigation');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 36,
            height: 36,
            borderRadius: 8,
            background: '#fee2e2',
            color: '#dc2626',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 18
          }}>
            <ThunderboltOutlined />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 16, color: '#0f172a' }}>
              Order Stat Pre-Consultation Diagnostic
            </div>
            <div style={{ fontSize: 12, color: '#64748b', fontWeight: 400 }}>
              Urgent lab or diagnostic order for <strong>{patientName}</strong>
            </div>
          </div>
        </div>
      }
      open={visible}
      onCancel={onClose}
      footer={[
        <Button key="cancel" onClick={onClose} disabled={loading}>
          Cancel
        </Button>,
        <Button
          key="submit"
          type="primary"
          danger
          icon={<ThunderboltOutlined />}
          loading={loading}
          onClick={handleSubmit}
        >
          Dispatch Stat Order
        </Button>,
      ]}
      destroyOnClose
      width={560}
    >
      <div style={{ marginTop: 12 }}>
        <Alert
          type="warning"
          showIcon
          message="High-Priority Clinic Dispatch"
          description="Stat pre-consult orders are immediately flagged in the Laboratory Information System (LIS) with a 45-minute turnaround SLA to ensure readiness before patient examination."
          style={{ marginBottom: 20 }}
        />

        <Form form={form} layout="vertical" initialValues={{ investigationType: 'COMPLETE_BLOOD_COUNT_STAT' }}>
          <Form.Item
            name="investigationType"
            label={<span style={{ fontWeight: 600 }}>Diagnostic Investigation / Panel</span>}
            rules={[{ required: true, message: 'Please select an investigation type' }]}
          >
            <Select
              size="large"
              options={COMMON_PRE_CONSULT_LABS}
              placeholder="Select diagnostic investigation..."
            />
          </Form.Item>

          <Form.Item
            name="notes"
            label={<span style={{ fontWeight: 600 }}>Clinical Indications / Reason for Stat Priority</span>}
          >
            <TextArea
              rows={3}
              placeholder="e.g., Mandatory pre-chemotherapy ANC count; check platelet threshold before cycle 4 delivery."
            />
          </Form.Item>
        </Form>
      </div>
    </Modal>
  );
};
