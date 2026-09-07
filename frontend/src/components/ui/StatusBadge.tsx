import React from 'react';
import { Tag } from 'antd';

export type StatusType = 
  | 'COMPLETED' 
  | 'SCHEDULED' 
  | 'PENDING' 
  | 'OVERDUE' 
  | 'CANCELLED' 
  | 'MISSED' 
  | 'ACTIVE' 
  | 'INACTIVE';

interface StatusBadgeProps {
  status: StatusType | string;
  className?: string;
}

export default function StatusBadge({ status, className }: StatusBadgeProps) {
  let color = 'default';
  
  switch (status.toUpperCase()) {
    case 'COMPLETED':
    case 'ACTIVE':
    case 'ACHIEVED':
      color = 'green';
      break;
    case 'SCHEDULED':
    case 'CONFIRMED':
    case 'IN_PROGRESS':
      color = 'blue';
      break;
    case 'PENDING':
    case 'EXPECTED':
      color = 'orange';
      break;
    case 'OVERDUE':
    case 'MISSED':
    case 'DELAYED':
      color = 'red';
      break;
    case 'CANCELLED':
    case 'INACTIVE':
      color = 'default';
      break;
  }

  // Format text (e.g., IN_PROGRESS -> In Progress)
  const text = status
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');

  return <Tag color={color} className={className}>{text}</Tag>;
}
