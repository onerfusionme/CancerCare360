'use client';
import React, { useState } from 'react';
import { Modal, Form, Select, Input, Upload, message, Alert, Space, Typography, Button } from 'antd';
import { InboxOutlined, UserAddOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import { useUploadDocument } from '../../hooks/use-documents';
import { usePatients } from '../../hooks/use-patients';
import { DocumentType } from '../../types/document';

const { Dragger } = Upload;
const { Text } = Typography;

interface DocumentUploadModalProps {
  open: boolean;
  onClose: () => void;
  patientId?: string;
  journeyId?: string;
}

export const DocumentUploadModal: React.FC<DocumentUploadModalProps> = ({ open, onClose, patientId, journeyId }) => {
  const router = useRouter();
  const [form] = Form.useForm();
  const { mutateAsync: uploadDocument, isPending } = useUploadDocument();
  const { data: patientsData, isLoading: loadingPatients } = usePatients();
  const [file, setFile] = useState<File | null>(null);

  const patientList = React.useMemo(() => {
    if (!patientsData) return [];
    if (Array.isArray(patientsData)) return patientsData;
    if (Array.isArray((patientsData as any).data)) return (patientsData as any).data;
    return [];
  }, [patientsData]);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      if (!file) {
        message.error('Please select a file to upload');
        return;
      }
      
      const rawPatientId = patientId || values.patientId;
      const cleanPatientId = rawPatientId && rawPatientId !== 'unassigned' ? rawPatientId : undefined;

      await uploadDocument({
        file,
        metadata: {
          patientId: cleanPatientId,
          journeyId: journeyId || values.journeyId || undefined,
          type: values.type,
          source: values.source || undefined,
          notes: values.notes || undefined
        } as any
      });
      
      message.success('Document uploaded successfully');
      form.resetFields();
      setFile(null);
      onClose();
    } catch (error: any) {
      console.error('Document upload error:', error);
      const backendMsg = error?.response?.data?.message;
      const errorMsg = Array.isArray(backendMsg)
        ? backendMsg.join(', ')
        : (backendMsg || error?.message || 'Upload failed');
      message.error(`Upload failed: ${errorMsg}`);
    }
  };

  const handleModalClose = () => {
    form.resetFields();
    setFile(null);
    onClose();
  };

  return (
    <Modal
      title="Upload Clinical Document"
      open={open}
      onOk={handleOk}
      onCancel={handleModalClose}
      confirmLoading={isPending}
      destroyOnClose
      width={560}
    >
      <Form form={form} layout="vertical" initialValues={{ patientId, journeyId, patientSelection: patientId }}>
        {!patientId && (
          <div style={{ marginBottom: 16 }}>
            {patientList.length === 0 && !loadingPatients ? (
              <Alert
                type="info"
                showIcon
                message="No Registered Patients Found"
                description={
                  <Space direction="vertical" style={{ marginTop: 4 }}>
                    <Text type="secondary" style={{ fontSize: 13 }}>
                      You can register a patient in the Patient Directory, or upload this document as a General/Facility record.
                    </Text>
                    <Button 
                      size="small" 
                      type="link" 
                      icon={<UserAddOutlined />} 
                      style={{ paddingLeft: 0 }}
                      onClick={() => {
                        handleModalClose();
                        router.push('/patients');
                      }}
                    >
                      Go to Patient Directory
                    </Button>
                  </Space>
                }
                style={{ marginBottom: 12 }}
              />
            ) : null}

            <Form.Item 
              name="patientId" 
              label="Associated Patient"
              tooltip="Select the patient this document belongs to, or choose General Document if facility-wide."
              initialValue={patientList.length > 0 ? undefined : 'unassigned'}
            >
              <Select
                showSearch
                allowClear
                placeholder="Search patient by name or MRN"
                loading={loadingPatients}
                optionFilterProp="children"
                filterOption={(input, option) =>
                  String(option?.children ?? '').toLowerCase().includes(input.toLowerCase())
                }
              >
                <Select.Option orientation="center" value="unassigned">
                  <em>— General / Facility Document (Unassigned) —</em>
                </Select.Option>
                {patientList.map((p: any) => (
                  <Select.Option key={p.id} value={p.id}>
                    {p.mrn ? `[${p.mrn}] ` : ''}{p.firstName} {p.lastName}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </div>
        )}

        <Form.Item 
          name="type" 
          label="Document Type" 
          rules={[{ required: true, message: 'Please select document type' }]}
        >
          <Select placeholder="Select document classification">
            {Object.values(DocumentType).map(type => (
              <Select.Option key={type} value={type}>{type.replace(/_/g, ' ')}</Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item name="source" label="Source / Issuing Facility">
          <Input placeholder="e.g. Apollo Diagnostics, Tata Memorial Hospital, Dr. Mehta" />
        </Form.Item>

        <Form.Item name="notes" label="Clinical Notes / Description">
          <Input.TextArea rows={2} placeholder="Optional annotations or findings summary" />
        </Form.Item>

        <Form.Item label="Document File" required>
          <Dragger 
            accept=".pdf,.jpeg,.jpg,.png,.tiff"
            beforeUpload={(f) => {
              setFile(f);
              return false;
            }}
            maxCount={1}
            fileList={file ? [file as any] : []}
            onRemove={() => setFile(null)}
          >
            <p className="ant-upload-drag-icon">
              <InboxOutlined />
            </p>
            <p className="ant-upload-text">Click or drag file to this area to upload</p>
            <p className="ant-upload-hint">Supported formats: PDF, JPEG, PNG, TIFF (up to 25MB).</p>
          </Dragger>
        </Form.Item>
      </Form>
    </Modal>
  );
};

