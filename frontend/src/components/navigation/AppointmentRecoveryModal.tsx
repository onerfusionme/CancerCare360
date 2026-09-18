'use client';

import React, { useState } from 'react';
import { Modal, Form, DatePicker, Select, Input, Checkbox, message, Alert, Space, Typography, Tag, Divider } from 'antd';
import { CalendarOutlined, CheckCircleOutlined, UserOutlined, ClockCircleOutlined, MedicineBoxOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { navigationService } from '@/services/navigation.service';
import { PatientBarrier, RecoverAppointmentInput } from '@/types/navigation';

const { Option } = Select;
const { TextArea } = Input;
const { Text } = Typography;

interface AppointmentRecoveryModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  taskId: string;
  patientName?: string;
  patientMrn?: string;
  careGapType?: string;
  barriers?: PatientBarrier[];
}

export default function AppointmentRecoveryModal({
  open,
  onClose,
  onSuccess,
  taskId,
  patientName,
  patientMrn,
  careGapType,
  barriers = [],
}: AppointmentRecoveryModalProps) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const activeBarriers = barriers.filter(b => b.status !== 'RESOLVED');

  const handleSubmit = async (values: any) => {
    try {
      setLoading(true);
      const payload: RecoverAppointmentInput = {
        newAppointmentDate: values.newAppointmentDate ? values.newAppointmentDate.toISOString() : new Date().toISOString(),
        departmentId: values.department,
        doctorId: values.doctor,
        notes: values.notes,
        barrierIdToResolve: values.barrierIdToResolve,
      };

      await navigationService.recoverAppointment(taskId, payload);
      message.success('Appointment successfully booked! Care gap closed, patient marked RE-ENGAGED.');
      form.resetFields();
      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      message.error(err?.response?.data?.message || 'Failed to recover appointment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={
        <Space>
          <CalendarOutlined style={{ color: '#16a34a' }} />
          <span>Closed-Loop Appointment Recovery & Re-engagement</span>
        </Space>
      }
      open={open}
      onCancel={onClose}
      onOk={() => form.submit()}
      confirmLoading={loading}
      okText="Confirm Booking & Re-engage Patient"
      width={600}
      destroyOnClose
    >
      <Alert
        message="Closed-Loop Care Gap Resolution"
        description="Booking a verified recovery slot transitions the patient status from dropped/at-risk back to RE-ENGAGED and marks the follow-up task as successfully resolved."
        type="success"
        showIcon
        style={{ marginBottom: 16 }}
      />

      <div style={{ marginBottom: 16, padding: '10px 14px', background: '#f8fafc', borderRadius: 6, border: '1px solid #e2e8f0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <Text strong>{patientName || 'Patient'}</Text>
            {patientMrn && <Text type="secondary" style={{ marginLeft: 8 }}>(MRN: {patientMrn})</Text>}
          </div>
          {careGapType && <Tag color="orange">{careGapType.replace(/_/g, ' ')}</Tag>}
        </div>
      </div>

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          department: 'Medical Oncology',
          barrierIdToResolve: activeBarriers.length > 0 ? activeBarriers[0].id : undefined,
        }}
      >
        <Form.Item
          name="newAppointmentDate"
          label="New Confirmed Appointment Slot (Date & Time)"
          rules={[{ required: true, message: 'Please select new appointment date and time' }]}
        >
          <DatePicker
            showTime={{ format: 'HH:mm' }}
            format="YYYY-MM-DD HH:mm"
            style={{ width: '100%' }}
            disabledDate={(current) => current && current < dayjs().startOf('day')}
            placeholder="Select date & time"
          />
        </Form.Item>

        <Form.Item
          name="department"
          label="Clinical Department / Specialty"
          rules={[{ required: true, message: 'Please select department' }]}
        >
          <Select placeholder="Select department">
            <Option value="Medical Oncology">Medical Oncology (Chemo / Targeted Therapy)</Option>
            <Option value="Surgical Oncology">Surgical Oncology (Post-Op Review / Wound Care)</Option>
            <Option value="Radiation Oncology">Radiation Oncology (RT Planning / Linac Review)</Option>
            <Option value="Daycare Chemotherapy">Daycare Chemotherapy Infusion Unit</Option>
            <Option value="Diagnostic Imaging & PET-CT">Diagnostic Imaging & PET-CT Center</Option>
            <Option value="Histopathology & Molecular Lab">Histopathology & Molecular Lab</Option>
            <Option value="Palliative & Supportive Care">Palliative & Supportive Care Clinic</Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="doctor"
          label="Attending Oncologist / Consultant (Optional)"
        >
          <Input prefix={<MedicineBoxOutlined />} placeholder="e.g. Dr. Rajesh Kumar / Dr. Sneha Sharma" />
        </Form.Item>

        {activeBarriers.length > 0 && (
          <Form.Item
            name="barrierIdToResolve"
            label="Linked Barrier to Mark Resolved Upon Booking"
          >
            <Select allowClear placeholder="Select barrier resolved by this appointment">
              {activeBarriers.map((b) => (
                <Option key={b.id} value={b.id}>
                  [{b.category}] {b.barrierDetail.slice(0, 50)}...
                </Option>
              ))}
            </Select>
          </Form.Item>
        )}

        <Form.Item
          name="notes"
          label="Re-engagement & Confirmation Notes"
        >
          <TextArea
            rows={3}
            placeholder="e.g. Patient agreed to attend following bus voucher issuance. Accompanied by son."
          />
        </Form.Item>
      </Form>
    </Modal>
  );
}
