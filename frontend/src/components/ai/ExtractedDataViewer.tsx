import React, { useState } from 'react';
import { Table, Tag, Button, Space, Alert, Typography, Modal, Input } from 'antd';
import { CheckCircleOutlined, EditOutlined } from '@ant-design/icons';
import { AiExtractionResult } from '../../types/ai';

const { Text } = Typography;

interface ExtractedDataViewerProps {
  result: AiExtractionResult;
  onAccept: () => void;
  onModify: (updatedEntities: Record<string, any>) => void;
}

export const ExtractedDataViewer: React.FC<ExtractedDataViewerProps> = ({ result, onAccept, onModify }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedEntities, setEditedEntities] = useState<Record<string, any>>(result.entities);

  const getConfidenceBadge = (score: number) => {
    if (score >= 85) return <Tag color="green">High ({score}%)</Tag>;
    if (score >= 70) return <Tag color="orange">Medium ({score}%)</Tag>;
    return <Tag color="red">Low ({score}%)</Tag>;
  };

  const columns = [
    {
      title: 'Field',
      dataIndex: 'field',
      key: 'field',
      render: (text: string) => <Text strong>{text.charAt(0).toUpperCase() + text.slice(1).replace(/([A-Z])/g, ' $1')}</Text>,
    },
    {
      title: 'Value',
      dataIndex: 'value',
      key: 'value',
      render: (value: any, record: any) => {
        if (isEditing) {
          return (
            <Input 
              defaultValue={value} 
              onChange={(e) => setEditedEntities({ ...editedEntities, [record.field]: e.target.value })} 
            />
          );
        }
        return <Text>{value?.toString() || 'N/A'}</Text>;
      },
    },
    {
      title: 'Confidence',
      dataIndex: 'confidence',
      key: 'confidence',
      render: (confidence: number) => getConfidenceBadge(confidence),
    },
  ];

  const dataSource = Object.keys(result.entities).map(key => ({
    key,
    field: key,
    value: result.entities[key],
    confidence: result.confidenceScores[key] || 0,
  }));

  const handleSave = () => {
    onModify(editedEntities);
    setIsEditing(false);
  };

  return (
    <div>
      <Alert
        message={result.clinicalDisclaimer || "AI-Extracted Data: Please verify against the original document before accepting."}
        type="info"
        showIcon
        style={{ marginBottom: 16 }}
      />
      <Table 
        dataSource={dataSource} 
        columns={columns} 
        pagination={false} 
        size="small" 
        bordered
      />
      <div style={{ marginTop: 16, display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
        {isEditing ? (
          <Space>
            <Button onClick={() => setIsEditing(false)}>Cancel</Button>
            <Button type="primary" onClick={handleSave}>Save Changes</Button>
          </Space>
        ) : (
          <Space>
            <Button icon={<EditOutlined />} onClick={() => setIsEditing(true)}>Edit Extracted Values</Button>
            <Button type="primary" style={{ backgroundColor: 'green' }} icon={<CheckCircleOutlined />} onClick={onAccept}>Accept Extracted Data</Button>
          </Space>
        )}
      </div>
    </div>
  );
};
