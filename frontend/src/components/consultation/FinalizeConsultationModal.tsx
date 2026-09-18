'use client';
import React, { useState } from 'react';
import { 
  Modal, 
  Form, 
  Input, 
  Select, 
  Radio, 
  DatePicker, 
  Button, 
  message, 
  Row, 
  Col, 
  Tag, 
  Divider, 
  Alert 
} from 'antd';
import { 
  CheckCircleOutlined, 
  FileTextOutlined, 
  MedicineBoxOutlined, 
  SafetyCertificateOutlined 
} from '@ant-design/icons';
import { consultationService } from '@/services/consultation.service';
import dayjs from 'dayjs';

const { TextArea } = Input;

interface FinalizeConsultationModalProps {
  visible: boolean;
  patientId: string;
  patientName: string;
  currentStage?: string;
  onClose: () => void;
  onSuccess: () => void;
}

const RECIST_RESPONSES = [
  { value: 'COMPLETE_RESPONSE', label: 'Complete Response (CR) — Target lesions disappeared' },
  { value: 'PARTIAL_RESPONSE', label: 'Partial Response (PR) — ≥30% decrease in target lesion diameter' },
  { value: 'STABLE_DISEASE', label: 'Stable Disease (SD) — Insufficient shrinkage/growth' },
  { value: 'PROGRESSIVE_DISEASE', label: 'Progressive Disease (PD) — ≥20% increase or new lesions' },
  { value: 'NOT_EVALUATED', label: 'Not Evaluated (NE) / Baseline Consultation' },
];

const ECOG_OPTIONS = [
  { value: 0, label: 'ECOG 0 — Fully active, unrestricted' },
  { value: 1, label: 'ECOG 1 — Restricted in strenuous activity, ambulatory' },
  { value: 2, label: 'ECOG 2 — Ambulatory, capable of self-care, unable to work' },
  { value: 3, label: 'ECOG 3 — Capable of only limited self-care, confined to bed >50%' },
  { value: 4, label: 'ECOG 4 — Completely disabled, totally bedridden' },
];

const MILESTONE_TYPES = [
  { value: 'CHEMOTHERAPY_CYCLE_REVIEW', label: 'Chemotherapy Next Cycle Review (e.g. 21 days)' },
  { value: 'SURGICAL_ONCOLOGY_CONSULT', label: 'Surgical Oncology Assessment / Pre-Op' },
  { value: 'RADIATION_SIMULATION_REVIEW', label: 'Radiation Planning / Mid-Treatment Check' },
  { value: 'SURVEILLANCE_IMAGING_PET_CT', label: 'Post-Treatment Surveillance PET-CT / MRI' },
  { value: 'SURVIVORSHIP_FOLLOW_UP', label: 'Longitudinal Survivorship Follow-up (3–6 Months)' },
];

export const FinalizeConsultationModal: React.FC<FinalizeConsultationModalProps> = ({
  visible,
  patientId,
  patientName,
  currentStage,
  onClose,
  onSuccess,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      await consultationService.finalizeConsultation(patientId, {
        clinicalAssessment: values.clinicalAssessment,
        diseaseResponse: values.diseaseResponse,
        treatmentPlan: values.treatmentPlan,
        ecogScore: values.ecogScore,
        nextFollowUpDate: values.nextFollowUpDate ? values.nextFollowUpDate.toISOString() : undefined,
        nextMilestoneType: values.nextMilestoneType,
      });

      message.success('Consultation briefing finalized & logged to patient longitudinal journey');
      form.resetFields();
      onSuccess();
      onClose();
    } catch (err: any) {
      if (err.errorFields) return;
      message.error(err.response?.data?.message || 'Failed to finalize consultation note');
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
            background: '#e0e7ff',
            color: '#4f46e5',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 18
          }}>
            <MedicineBoxOutlined />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 16, color: '#0f172a' }}>
              Finalize Consultation Note & Clinical Treatment Plan
            </div>
            <div style={{ fontSize: 12, color: '#64748b', fontWeight: 400 }}>
              Treating Oncologist Sign-Off for <strong>{patientName}</strong>
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
          icon={<CheckCircleOutlined />}
          loading={loading}
          onClick={handleSubmit}
          style={{ background: '#4f46e5' }}
        >
          Sign & Finalize Consultation
        </Button>,
      ]}
      destroyOnClose
      width={720}
    >
      <div style={{ marginTop: 12 }}>
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            diseaseResponse: 'STABLE_DISEASE',
            ecogScore: 1,
            nextFollowUpDate: dayjs().add(21, 'day'),
            nextMilestoneType: 'CHEMOTHERAPY_CYCLE_REVIEW',
          }}
        >
          <Row gutter={16}>
            <Col span={14}>
              <Form.Item
                name="diseaseResponse"
                label={<span style={{ fontWeight: 600 }}>Oncological Response (RECIST 1.1)</span>}
                rules={[{ required: true }]}
              >
                <Select options={RECIST_RESPONSES} size="large" />
              </Form.Item>
            </Col>

            <Col span={10}>
              <Form.Item
                name="ecogScore"
                label={<span style={{ fontWeight: 600 }}>Performance Status (ECOG)</span>}
                rules={[{ required: true }]}
              >
                <Select options={ECOG_OPTIONS} size="large" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="clinicalAssessment"
            label={<span style={{ fontWeight: 600 }}>Clinical Assessment & Examination Findings</span>}
            rules={[{ required: true, message: 'Please enter clinical assessment findings' }]}
          >
            <TextArea
              rows={3}
              placeholder="e.g. Patient presents post-Cycle 3 adjuvant chemotherapy. Primary surgical bed well-healed without seroma. Normal cardiovascular & respiratory exam. Mild grade 1 peripheral sensory neuropathy noted."
            />
          </Form.Item>

          <Form.Item
            name="treatmentPlan"
            label={<span style={{ fontWeight: 600 }}>Treatment Decision & Prescriptions / Orders</span>}
            rules={[{ required: true, message: 'Please enter treatment decision and orders' }]}
          >
            <TextArea
              rows={3}
              placeholder="e.g. Proceed with Adjuvant Cycle 4 Paclitaxel + Carboplatin at 100% full dose. Prescribe Ondansetron 8mg TID PRN and Gabapentin 100mg QHS. Pre-chemo stat CBC & renal panel 24h prior."
            />
          </Form.Item>

          <Divider style={{ margin: '16px 0' }} />

          <div style={{ fontSize: 13, fontWeight: 700, color: '#1e293b', marginBottom: 12 }}>
            Closed-Loop Continuity: Next Milestone & Expected Follow-Up
          </div>

          <Row gutter={16}>
            <Col span={14}>
              <Form.Item
                name="nextMilestoneType"
                label={<span style={{ fontWeight: 600 }}>Next Clinical Milestone</span>}
                rules={[{ required: true }]}
              >
                <Select options={MILESTONE_TYPES} size="large" />
              </Form.Item>
            </Col>

            <Col span={10}>
              <Form.Item
                name="nextFollowUpDate"
                label={<span style={{ fontWeight: 600 }}>Expected Date / Interval</span>}
                rules={[{ required: true }]}
              >
                <DatePicker style={{ width: '100%' }} size="large" format="YYYY-MM-DD" />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </div>
    </Modal>
  );
};
