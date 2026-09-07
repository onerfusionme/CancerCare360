'use client';
import React, { useState } from 'react';
import { Table, Typography, Button, Space, Select, DatePicker, Row, Col, Tag } from 'antd';
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

  const columns = [
    { title: 'Patient', key: 'patient', render: (_: any, r: Document) => `${r.patient?.name || 'Unknown'}` },
    { title: 'Document Type', dataIndex: 'type', key: 'type', render: (t: string) => <Tag color="blue">{t}</Tag> },
    { title: 'File Name', dataIndex: 'fileName', key: 'fileName' },
    { title: 'Uploaded Date', dataIndex: 'uploadedAt', key: 'uploadedAt', render: (d: string) => d ? dayjs(d).format('MMM D, YYYY') : '-' },
    { title: 'Uploaded By', dataIndex: 'uploadedBy', key: 'uploadedBy' },
    { title: 'Virus Scan', dataIndex: 'scanStatus', key: 'scanStatus', render: (s: ScanStatus) => <StatusBadge status={s} /> },
    { title: 'Verification', dataIndex: 'verificationStatus', key: 'verificationStatus', render: (s: VerificationStatus) => <StatusBadge status={s} /> },
    { 
      title: 'Actions', 
      key: 'actions', 
      render: (_: any, record: Document) => (
        <Space>
          <a>View</a>
          <a onClick={() => setVerifyDoc(record)}>Verify</a>
          <a style={{ color: 'red' }}>Delete</a>
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

      <Table dataSource={documents} columns={columns} rowKey="id" loading={isLoading} />

      <DocumentUploadModal open={isUploadOpen} onClose={() => setIsUploadOpen(false)} />
      <DocumentVerifyDrawer open={!!verifyDoc} onClose={() => setVerifyDoc(null)} document={verifyDoc} />
    </div>
  );
}
