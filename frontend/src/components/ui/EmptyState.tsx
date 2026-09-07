import React from 'react';
import { Empty, Button } from 'antd';

interface EmptyStateProps {
  title?: string;
  description?: string;
  actionText?: string;
  onAction?: () => void;
}

export default function EmptyState({ 
  title = 'No Data Found', 
  description = 'There is no data to display in this view.',
  actionText,
  onAction 
}: EmptyStateProps) {
  return (
    <Empty
      image={Empty.PRESENTED_IMAGE_SIMPLE}
      description={
        <div>
          <div style={{ fontWeight: 500, fontSize: 16, marginBottom: 8 }}>{title}</div>
          <div style={{ color: '#8c8c8c' }}>{description}</div>
        </div>
      }
    >
      {actionText && onAction && (
        <Button type="primary" onClick={onAction}>
          {actionText}
        </Button>
      )}
    </Empty>
  );
}
