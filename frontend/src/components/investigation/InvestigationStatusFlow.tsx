'use client';
import React from 'react';
import { Steps } from 'antd';
import { InvestigationStatus } from '../../types/investigation';

interface InvestigationStatusFlowProps {
  currentStatus: InvestigationStatus;
}

export const InvestigationStatusFlow: React.FC<InvestigationStatusFlowProps> = ({ currentStatus }) => {
  const statusList = [
    InvestigationStatus.ORDERED,
    InvestigationStatus.SCHEDULED,
    InvestigationStatus.SAMPLE_COLLECTED,
    InvestigationStatus.IN_PROGRESS,
    InvestigationStatus.REPORT_AVAILABLE,
    InvestigationStatus.REVIEWED
  ];

  let currentIndex = statusList.indexOf(currentStatus);
  if (currentIndex === -1) currentIndex = 0;

  return (
    <Steps 
      current={currentIndex} 
      size="small"
      items={statusList.map(status => ({ title: status.replace(/_/g, ' ') }))}
    />
  );
};
