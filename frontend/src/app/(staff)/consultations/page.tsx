'use client';
import React, { useState } from 'react';
import { Select, Typography, Spin, Empty } from 'antd';
import { useConsultationReadiness } from '@/hooks/use-consultation';
import { useAiConsultationSummary } from '@/hooks/use-ai';
import { ReadinessCard } from '@/components/consultation/ReadinessCard';
import { AiSummaryCard } from '@/components/ai/AiSummaryCard';

const { Title } = Typography;

export default function ConsultationsPage() {
  const [patientId, setPatientId] = useState<string | null>(null);
  const { data: readiness, isLoading } = useConsultationReadiness(patientId || '');
  const { data: aiSummary, isLoading: aiLoading } = useAiConsultationSummary(patientId || '');

  return (
    <div style={{ padding: 24 }}>
      <Title level={2}>Consultation Readiness</Title>
      <div style={{ marginBottom: 24 }}>
        <Select
          showSearch
          placeholder="Select a patient"
          style={{ width: 300 }}
          onChange={setPatientId}
          options={[
            { value: 'p1', label: 'John Doe (MRN: 12345)' },
            { value: 'p2', label: 'Jane Smith (MRN: 67890)' }
          ]}
        />
      </div>

      {!patientId ? (
        <Empty description="Select a patient to view consultation readiness" />
      ) : isLoading ? (
        <Spin size="large" />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <AiSummaryCard summary={aiSummary} isLoading={aiLoading} />
          <ReadinessCard readiness={readiness} />
        </div>
      )}
    </div>
  );
}
