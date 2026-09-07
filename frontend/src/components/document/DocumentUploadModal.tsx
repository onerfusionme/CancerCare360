'use client';
import React, { useState } from 'react';
import { Modal, Form, Select, Input, Upload, message } from 'antd';
import { InboxOutlined } from '@ant-design/icons';
import { useUploadDocument } from '../../hooks/use-documents';
import { DocumentType } from '../../types/document';

const { Dragger } = Upload;

interface DocumentUploadModalProps {
  open: boolean;
  onClose: () => void;
  patientId?: string;
  journeyId?: string;
}

export const DocumentUploadModal: React.FC<DocumentUploadModalProps> = ({ open, onClose, patientId, journeyId }) => {
  const [form] = Form.useForm();
  const { mutateAsync: uploadDocument, isPending } = useUploadDocument();
  const [file, setFile] = useState<File | null>(null);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      if (!file) {
        message.error('Please select a file to upload');
        return;
      }
      
      await uploadDocument({
        file,
        metadata: {
          patientId: patientId || values.patientId,
          journeyId: journeyId || values.journeyId,
          type: values.type,
          source: values.source,
          notes: values.notes
        }
      });
      
      message.success('Document uploaded successfully');
      form.resetFields();
      setFile(null);
      onClose();
    } catch (error) {
      console.error(error);
      message.error('Upload failed');
    }
  };

  return (
    <Modal
      title="Upload Document"
      open={open}
      onOk={handleOk}
      onCancel={onClose}
      confirmLoading={isPending}
    >
      <Form form={form} layout="vertical" initialValues={{ patientId, journeyId }}>
        {!patientId && (
          <Form.Item name="patientId" label="Patient ID" rules={[{ required: true }]}>
            <Input placeholder="Enter patient ID" />
          </Form.Item>
        )}
        <Form.Item name="type" label="Document Type" rules={[{ required: true }]}>
          <Select placeholder="Select type">
            {Object.values(DocumentType).map(type => (
              <Select.Option key={type} value={type}>{type.replace(/_/g, ' ')}</Select.Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item name="source" label="Source">
          <Input placeholder="e.g. Lab Name, Doctor Name" />
        </Form.Item>
        <Form.Item name="notes" label="Notes">
          <Input.TextArea rows={3} />
        </Form.Item>
        <Form.Item label="File" required>
          <Dragger 
            accept=".pdf,.jpeg,.jpg,.png"
            beforeUpload={(f) => {
              setFile(f);
              return false;
            }}
            maxCount={1}
            onRemove={() => setFile(null)}
          >
            <p className="ant-upload-drag-icon">
              <InboxOutlined />
            </p>
            <p className="ant-upload-text">Click or drag file to this area to upload</p>
            <p className="ant-upload-hint">Support for a single PDF, JPEG, or PNG file.</p>
          </Dragger>
        </Form.Item>
      </Form>
    </Modal>
  );
};
