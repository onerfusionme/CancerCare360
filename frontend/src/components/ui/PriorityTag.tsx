import React from 'react';
import { Tag } from 'antd';
import { 
  ArrowUpOutlined, 
  ArrowRightOutlined, 
  ArrowDownOutlined,
  WarningOutlined
} from '@ant-design/icons';
import { Priority } from '@/types/common';

interface PriorityTagProps {
  priority: Priority;
}

export default function PriorityTag({ priority }: PriorityTagProps) {
  switch (priority) {
    case Priority.CRITICAL:
      return <Tag color="error" icon={<WarningOutlined />}>Critical</Tag>;
    case Priority.HIGH:
      return <Tag color="warning" icon={<ArrowUpOutlined />}>High</Tag>;
    case Priority.MEDIUM:
      return <Tag color="processing" icon={<ArrowRightOutlined />}>Medium</Tag>;
    case Priority.LOW:
      return <Tag color="default" icon={<ArrowDownOutlined />}>Low</Tag>;
    default:
      return null;
  }
}
