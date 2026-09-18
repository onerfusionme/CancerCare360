'use client';

import React, { useState } from 'react';
import { Modal, Form, Select, Input, Switch, Button, message, Alert, Space, Typography, Divider } from 'antd';
import { 
  AlertOutlined, 
  CarOutlined, 
  DollarOutlined, 
  TeamOutlined, 
  ScheduleOutlined, 
  ReadOutlined, 
  MedicineBoxOutlined, 
  CustomerServiceOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';
import { navigationService } from '@/services/navigation.service';
import { BarrierCategory, InterventionType, CreateBarrierInput } from '@/types/navigation';

const { Option } = Select;
const { TextArea } = Input;
const { Text } = Typography;

interface BarrierAssessmentModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  patientId?: string;
  patientName?: string;
  taskId?: string;
  patientList?: Array<{ id: string; firstName?: string; lastName?: string; name?: string; mrn?: string }>;
}

export default function BarrierAssessmentModal({
  open,
  onClose,
  onSuccess,
  patientId,
  patientName,
  taskId,
  patientList = [],
}: BarrierAssessmentModalProps) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [isHospitalSide, setIsHospitalSide] = useState(false);

  const handleSubmit = async (values: any) => {
    try {
      setLoading(true);
      const payload: CreateBarrierInput = {
        patientId: patientId || values.patientId,
        taskId: taskId || values.taskId || undefined,
        category: values.category,
        barrierDetail: values.barrierDetail,
        isHospitalSide: values.isHospitalSide ?? false,
        reportedBy: values.reportedBy || 'Patient',
        interventionType: values.interventionType || InterventionType.OTHER,
        interventionNotes: values.interventionNotes || undefined,
      };

      await navigationService.createBarrier(payload);
      message.success('Barrier assessment and intervention recorded successfully');
      form.resetFields();
      setIsHospitalSide(false);
      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      message.error(err?.response?.data?.message || 'Failed to record barrier assessment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={
        <Space>
          <AlertOutlined style={{ color: '#ea580c' }} />
          <span>Patient Barrier Screening & Intervention Assessment</span>
        </Space>
      }
      open={open}
      onCancel={onClose}
      onOk={() => form.submit()}
      confirmLoading={loading}
      okText="Record Barrier & Plan Intervention"
      width={650}
      destroyOnClose
    >
      <Alert
        message="Structured Cancer Navigation Assessment"
        description="Identify social, financial, transport, or hospital-side obstacles preventing treatment adherence and assign targeted interventions."
        type="info"
        showIcon
        style={{ marginBottom: 16 }}
      />

      {patientName && (
        <div style={{ marginBottom: 12, padding: '8px 12px', background: '#f8fafc', borderRadius: 6 }}>
          <Text strong>Patient: </Text>
          <Text>{patientName}</Text>
          {taskId && <Text type="secondary" style={{ marginLeft: 12 }}>(Linked Task: {taskId.slice(0, 8)}...)</Text>}
        </div>
      )}

      <Form 
        form={form} 
        layout="vertical" 
        onFinish={handleSubmit}
        initialValues={{
          category: BarrierCategory.TRANSPORTATION,
          interventionType: InterventionType.APPOINTMENT_RESCHEDULED,
          reportedBy: 'Patient',
          isHospitalSide: false,
        }}
      >
        {!patientId && (
          <Form.Item 
            name="patientId" 
            label="Target Patient" 
            rules={[{ required: true, message: 'Please select a patient' }]}
          >
            <Select placeholder="Select Patient" showSearch optionFilterProp="children">
              {patientList.map((p) => (
                <Option key={p.id} value={p.id}>
                  {p.name || `${p.firstName || ''} ${p.lastName || ''}`.trim()} ({p.mrn || 'No MRN'})
                </Option>
              ))}
            </Select>
          </Form.Item>
        )}

        <Form.Item 
          name="category" 
          label="Barrier Category" 
          rules={[{ required: true, message: 'Please select barrier category' }]}
        >
          <Select placeholder="Select barrier category">
            <Option value={BarrierCategory.TRANSPORTATION}>
              <CarOutlined style={{ marginRight: 6, color: '#0284c7' }} />
              Transportation (Distance, rural commute, travel costs)
            </Option>
            <Option value={BarrierCategory.FINANCIAL}>
              <DollarOutlined style={{ marginRight: 6, color: '#16a34a' }} />
              Financial (Out-of-pocket costs, lack of insurance/Ayushman card)
            </Option>
            <Option value={BarrierCategory.WORK_SCHEDULE}>
              <ScheduleOutlined style={{ marginRight: 6, color: '#d97706' }} />
              Work & Livelihood (Wage loss, inability to take leave)
            </Option>
            <Option value={BarrierCategory.FAMILY_CAREGIVER}>
              <TeamOutlined style={{ marginRight: 6, color: '#9333ea' }} />
              Family / Caregiver (Lack of escort, child/eldercare duties)
            </Option>
            <Option value={BarrierCategory.UNDERSTANDING_HEALTH_LITERACY}>
              <ReadOutlined style={{ marginRight: 6, color: '#2563eb' }} />
              Health Literacy & Fear (Treatment fear, side-effect distress, language)
            </Option>
            <Option value={BarrierCategory.HOSPITAL_PROCESS}>
              <MedicineBoxOutlined style={{ marginRight: 6, color: '#dc2626' }} />
              Hospital-Side Process (Slot shortage, delayed report, multi-counter maze)
            </Option>
            <Option value={BarrierCategory.COMMUNICATION}>
              <CustomerServiceOutlined style={{ marginRight: 6, color: '#0d9488' }} />
              Communication (Phone off, incorrect number, language mismatch)
            </Option>
            <Option value={BarrierCategory.OTHER}>
              Other Miscellaneous Barrier
            </Option>
          </Select>
        </Form.Item>

        <Form.Item 
          name="barrierDetail" 
          label="Specific Barrier Description / Patient Narrative" 
          rules={[{ required: true, message: 'Please describe the specific obstacle' }]}
        >
          <TextArea 
            rows={3} 
            placeholder="e.g., Patient lives in remote village 120km away with no bus service after 4 PM; unable to afford private taxi for 3rd chemo cycle."
          />
        </Form.Item>

        <Form.Item 
          name="isHospitalSide" 
          valuePropName="checked"
          label={
            <Space>
              <span>Is this an Institutional / Hospital-Side Bottleneck?</span>
              <Text type="secondary">(e.g., Radiation slot capacity, delayed biopsy dispatch)</Text>
            </Space>
          }
        >
          <Switch 
            checkedChildren="Hospital Capacity Issue" 
            unCheckedChildren="Patient-Side Barrier"
            onChange={(checked) => setIsHospitalSide(checked)}
          />
        </Form.Item>

        <Form.Item 
          name="reportedBy" 
          label="Reported By" 
          rules={[{ required: true, message: 'Please specify who reported this barrier' }]}
        >
          <Select>
            <Option value="Patient">Patient directly</Option>
            <Option value="Primary Caregiver / Attendant">Primary Caregiver / Family Attendant</Option>
            <Option value="Care Coordinator">Care Coordinator during outreach</Option>
            <Option value="Oncology Nurse">Oncology Day-care Nurse</Option>
            <Option value="Treating Oncologist">Treating Medical / Surgical Oncologist</Option>
            <Option value="Social Worker">Hospital Social Work Department</Option>
          </Select>
        </Form.Item>

        <Divider style={{ margin: '12px 0' }}>Targeted Navigation Intervention</Divider>

        <Form.Item 
          name="interventionType" 
          label="Planned Resolution Intervention" 
          rules={[{ required: true, message: 'Please select an intervention' }]}
        >
          <Select placeholder="Select planned intervention">
            <Option value={InterventionType.APPOINTMENT_RESCHEDULED}>
              Appointment Rescheduled (Adjust slot to patient availability)
            </Option>
            <Option value={InterventionType.TRANSPORT_ASSISTANCE}>
              Transport Assistance (Hospital shuttle, travel voucher, local bus coordination)
            </Option>
            <Option value={InterventionType.FINANCIAL_AID_REFERRAL}>
              Financial Aid & Scheme Referral (Ayushman Bharat, NGO grant, waiver)
            </Option>
            <Option value={InterventionType.SOCIAL_WORK_REFERRAL}>
              Medical Social Work Referral (Psycho-social counseling & lodging)
            </Option>
            <Option value={InterventionType.DOCTOR_TELECONSULT_CALLBACK}>
              Doctor Teleconsult / Callback (Consultant answers toxicity questions)
            </Option>
            <Option value={InterventionType.PATIENT_EDUCATION}>
              Patient & Caregiver Education (Side-effect management, reassurance)
            </Option>
            <Option value={InterventionType.HOSPITAL_ESCORT}>
              Hospital Escort & Fast-track Desk (Guide through multi-counter diagnostics)
            </Option>
            <Option value={InterventionType.LANGUAGE_INTERPRETER}>
              Language Interpreter Support
            </Option>
            <Option value={InterventionType.OTHER}>Other Targeted Intervention</Option>
          </Select>
        </Form.Item>

        <Form.Item 
          name="interventionNotes" 
          label="Intervention Execution Plan / Notes"
        >
          <TextArea 
            rows={2} 
            placeholder="e.g., Referred to Medical Social Work for hospital transit hostel accommodation; scheduled Cycle 3 for morning slot."
          />
        </Form.Item>
      </Form>
    </Modal>
  );
}
