'use client';

import React from 'react';
import { Modal, Form, Select, Input, DatePicker, message } from 'antd';
import { CommunicationChannel, OutreachOutcome, CreateOutreachDto } from '@/types/outreach';
import { outreachService } from '@/services/outreach.service';

const { Option } = Select;
const { TextArea } = Input;

interface OutreachModalProps {
  open: boolean;
  onClose: () => void;
  taskId?: string;
  patientId?: string;
}

export default function OutreachModal({ open, onClose, taskId, patientId }: OutreachModalProps) {
  const [form] = Form.useForm();
  const [loading, setLoading] = React.useState(false);

  const handleSubmit = async (values: any) => {
    try {
      setLoading(true);
      const dto: CreateOutreachDto = {
        patientId: patientId || values.patientId, // In real app, patient select if not provided
        taskId: taskId || values.taskId,
        channel: values.channel,
        outcome: values.outcome,
        notes: values.notes,
        nextAction: values.nextAction,
        nextFollowUpDate: values.nextFollowUpDate ? values.nextFollowUpDate.toISOString() : undefined,
      };
      await outreachService.logOutreach(dto);
      message.success('Outreach logged successfully');
      form.resetFields();
      onClose();
    } catch (error) {
      message.error('Failed to log outreach');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="Log Contact Attempt"
      open={open}
      onCancel={onClose}
      onOk={() => form.submit()}
      confirmLoading={loading}
    >
      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        {!taskId && (
          <Form.Item name="taskId" label="Task ID" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
        )}
        {!patientId && (
          <Form.Item name="patientId" label="Patient ID" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
        )}
        <Form.Item name="channel" label="Channel" rules={[{ required: true }]}>
          <Select placeholder="Select channel">
            {Object.values(CommunicationChannel).map(v => (
              <Option key={v} value={v}>{v.replace('_', ' ')}</Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item name="outcome" label="Outcome" rules={[{ required: true }]}>
          <Select placeholder="Select outcome">
            {Object.values(OutreachOutcome).map(v => (
              <Option key={v} value={v}>{v.replace('_', ' ')}</Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item name="notes" label="Notes">
          <TextArea rows={4} />
        </Form.Item>
        <Form.Item name="nextAction" label="Next Action">
          <Input />
        </Form.Item>
        <Form.Item name="nextFollowUpDate" label="Next Follow-up Date">
          <DatePicker style={{ width: '100%' }} showTime />
        </Form.Item>
      </Form>
    </Modal>
  );
}
