import React, { useEffect, useState } from 'react';
import { Modal, Spin, Typography, Alert, Space, Divider } from 'antd';
import { useAiGapExplanation } from '../../hooks/use-ai';

const { Title, Paragraph, Text } = Typography;

interface GapExplanationModalProps {
  open: boolean;
  onClose: () => void;
  gapType: string;
  gapData: any;
}

export const GapExplanationModal: React.FC<GapExplanationModalProps> = ({ open, onClose, gapType, gapData }) => {
  const { mutateAsync: explainGap, isPending } = useAiGapExplanation();
  const [explanation, setExplanation] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open && gapType && gapData && !explanation) {
      explainGap({ gapType, gapData })
        .then(setExplanation)
        .catch(err => setError(err.message));
    }
  }, [open, gapType, gapData, explainGap, explanation]);

  return (
    <Modal
      title="AI Care Gap Explanation"
      open={open}
      onCancel={onClose}
      footer={null}
      width={600}
      destroyOnClose
    >
      {isPending ? (
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <Spin tip="Generating explanation..." />
        </div>
      ) : error ? (
        <Alert type="error" message="Failed to load explanation" description={error} />
      ) : explanation ? (
        <div>
          <Alert message={`Clinical Urgency: ${explanation.clinicalUrgency}`} type={explanation.clinicalUrgency === 'HIGH' ? 'error' : 'warning'} showIcon style={{ marginBottom: 16 }} />
          
          <Title level={5}>Summary</Title>
          <Paragraph>{explanation.summary}</Paragraph>
          
          <Divider />
          
          <Title level={5}>Root Cause Reasoning</Title>
          <Paragraph>{explanation.rootCauseReasoning}</Paragraph>
          
          <Divider />
          
          <Title level={5}>Suggested Action</Title>
          <Paragraph><Text strong>{explanation.suggestedAction}</Text></Paragraph>
        </div>
      ) : null}
    </Modal>
  );
};
