'use client';
import React, { useState } from 'react';
import { Drawer, Button, Input, Space, message, Descriptions, Tabs } from 'antd';
import dayjs from 'dayjs';
import { Document, VerificationStatus } from '../../types/document';
import { useVerifyDocument } from '../../hooks/use-documents';
import { useAiExtraction } from '../../hooks/use-ai';
import { ExtractedDataViewer } from '../ai/ExtractedDataViewer';

interface DocumentVerifyDrawerProps {
  open: boolean;
  onClose: () => void;
  document: Document | null;
}

export const DocumentVerifyDrawer: React.FC<DocumentVerifyDrawerProps> = ({ open, onClose, document }) => {
  const [notes, setNotes] = useState('');
  const { mutateAsync: verifyDoc, isPending } = useVerifyDocument();
  const { mutateAsync: extractDoc, data: extractionResult, isPending: extracting } = useAiExtraction();
  const [lastDocId, setLastDocId] = useState<string | null>(null);

  React.useEffect(() => {
    if (open && document && document.id !== lastDocId) {
      setLastDocId(document.id);
      extractDoc({ documentId: document.id });
    }
  }, [open, document, lastDocId]);

  if (!document) return null;

  const handleVerify = async (status: VerificationStatus) => {
    try {
      await verifyDoc({ id: document.id, status, notes });
      message.success(`Document marked as ${status.toLowerCase()}`);
      onClose();
    } catch (error) {
      message.error('Failed to verify document');
    }
  };

  return (
    <Drawer
      title="Verify Document"
      placement="right"
      width={600}
      onClose={onClose}
      open={open}
      extra={
        <Space>
          <Button onClick={onClose}>Cancel</Button>
          <Button danger loading={isPending} onClick={() => handleVerify(VerificationStatus.REJECTED)}>Reject</Button>
          <Button type="primary" style={{ backgroundColor: 'green' }} loading={isPending} onClick={() => handleVerify(VerificationStatus.VERIFIED)}>Accept</Button>
        </Space>
      }
    >
      <Descriptions column={1} bordered size="small" style={{ marginBottom: 16 }}>
        <Descriptions.Item label="Type">{document.type}</Descriptions.Item>
        <Descriptions.Item label="File Name">{document.fileName}</Descriptions.Item>
        <Descriptions.Item label="Uploaded By">{document.uploadedBy}</Descriptions.Item>
        <Descriptions.Item label="Date">{dayjs(document.uploadedAt).format('MMM D, YYYY HH:mm')}</Descriptions.Item>
      </Descriptions>
      
      <Tabs
        defaultActiveKey="2"
        items={[
          {
            key: '1',
            label: 'Document Viewer',
            children: (
              <div style={{ marginBottom: 16, height: 400, backgroundColor: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <p>Document Viewer (iframe or img) here for {document.fileName}</p>
              </div>
            )
          },
          {
            key: '2',
            label: 'AI Extracted Data',
            children: (
              <div style={{ marginBottom: 16, minHeight: 400 }}>
                {extracting ? (
                  <div style={{ padding: 24, textAlign: 'center' }}>Extracting data...</div>
                ) : extractionResult ? (
                  <ExtractedDataViewer 
                    result={extractionResult} 
                    onAccept={() => message.success('Extracted data accepted')}
                    onModify={(updated) => message.success('Extracted data modified')}
                  />
                ) : (
                  <div style={{ padding: 24, textAlign: 'center' }}>No extracted data available</div>
                )}
              </div>
            )
          }
        ]}
      />

      <div>
        <label style={{ display: 'block', marginBottom: 8 }}>Verification Notes</label>
        <Input.TextArea rows={4} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Add any notes here..." />
      </div>
    </Drawer>
  );
};
