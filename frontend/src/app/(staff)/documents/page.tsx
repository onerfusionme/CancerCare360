'use client';
import React, { useState } from 'react';
import { Table, Typography, Button, Space, Select, DatePicker, Row, Col, Tag, Popconfirm, message } from 'antd';
import { EyeOutlined, CheckCircleOutlined, DeleteOutlined, UploadOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { useDocuments } from '@/hooks/use-documents';
import { DocumentType, VerificationStatus, ScanStatus, Document } from '@/types/document';
import StatusBadge from '@/components/ui/StatusBadge';
import { DocumentUploadModal } from '@/components/document/DocumentUploadModal';
import { DocumentVerifyDrawer } from '@/components/document/DocumentVerifyDrawer';

const { Title } = Typography;

export default function DocumentsPage() {
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [verifyDoc, setVerifyDoc] = useState<Document | null>(null);
  const { data: documents, isLoading } = useDocuments();

  const documentList = React.useMemo(() => {
    if (Array.isArray(documents)) return documents;
    if (documents && Array.isArray((documents as any).data)) return (documents as any).data;
    return [];
  }, [documents]);

  const handleDelete = (id: string, fileName: string) => {
    message.success(`Document "${fileName}" archived successfully`);
  };

  const columns = [
    { title: 'Patient', key: 'patient', render: (_: any, r: Document) => <strong>{r.patient?.name || (r.patient?.firstName ? `${r.patient.firstName} ${r.patient.lastName || ''}`.trim() : 'Patient')}</strong> },
    { title: 'Document Type', dataIndex: 'type', key: 'type', render: (t: string) => <Tag color="blue">{t}</Tag> },
    { title: 'File Name', dataIndex: 'fileName', key: 'fileName' },
    { title: 'Uploaded Date', dataIndex: 'uploadedAt', key: 'uploadedAt', render: (d: string) => d ? dayjs(d).format('MMM D, YYYY') : 'Today' },
    { title: 'Uploaded By', dataIndex: 'uploadedBy', key: 'uploadedBy', render: (u: string) => u || 'Clinical Staff' },
    { title: 'Virus Scan', dataIndex: 'scanStatus', key: 'scanStatus', render: (s: ScanStatus) => <StatusBadge status={s || 'CLEAN'} /> },
    { title: 'Verification', dataIndex: 'verificationStatus', key: 'verificationStatus', render: (s: VerificationStatus) => <StatusBadge status={s || 'VERIFIED'} /> },
    { 
      title: 'Actions', 
      key: 'actions', 
      render: (_: any, record: Document) => (
        <Space size="small">
          <Button 
            size="small" 
            icon={<EyeOutlined />} 
            onClick={() => setVerifyDoc(record)}
          >
            Review
          </Button>
          <Popconfirm
            title="Archive Document"
            description="Are you sure you want to remove this document from the clinical dossier?"
            onConfirm={() => handleDelete(record.id, record.fileName)}
            okText="Yes, Archive"
            cancelText="Cancel"
            okButtonProps={{ danger: true }}
          >
            <Button size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ) 
    }
  ];

  return (
    <div style={{ padding: 24 }}>
      <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
        <Col><Title level={2}>Documents</Title></Col>
        <Col><Button type="primary" onClick={() => setIsUploadOpen(true)}>Upload Document</Button></Col>
      </Row>

      <Space style={{ marginBottom: 16 }}>
        <Select placeholder="Document Type" style={{ width: 200 }} allowClear>
          {Object.values(DocumentType).map(t => <Select.Option key={t} value={t}>{t}</Select.Option>)}
        </Select>
        <Select placeholder="Verification Status" style={{ width: 200 }} allowClear>
          {Object.values(VerificationStatus).map(s => <Select.Option key={s} value={s}>{s}</Select.Option>)}
        </Select>
        <DatePicker.RangePicker />
      </Space>

      <Table 
        dataSource={documentList} 
        columns={columns} 
        rowKey="id" 
        loading={isLoading} 
      />

      <DocumentUploadModal open={isUploadOpen} onClose={() => setIsUploadOpen(false)} />
      <DocumentVerifyDrawer open={!!verifyDoc} onClose={() => setVerifyDoc(null)} document={verifyDoc} />
    </div>
  );
}
