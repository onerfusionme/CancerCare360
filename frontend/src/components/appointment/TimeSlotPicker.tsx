'use client';

import React from 'react';
import { Row, Col, Card, Typography } from 'antd';
import { TimeSlot } from '@/types/appointment';

const { Text } = Typography;

interface TimeSlotPickerProps {
  slots: TimeSlot[];
  selectedSlot?: string;
  onSelect: (time: string) => void;
}

export default function TimeSlotPicker({ slots, selectedSlot, onSelect }: TimeSlotPickerProps) {
  return (
    <Row gutter={[12, 12]}>
      {slots.map((slot, idx) => {
        const isSelected = selectedSlot === slot.startTime;
        return (
          <Col span={6} key={idx}>
            <Card
              hoverable={slot.available}
              onClick={() => slot.available && onSelect(slot.startTime)}
              style={{
                textAlign: 'center',
                backgroundColor: slot.available ? (isSelected ? '#e6f7ff' : '#f6ffed') : '#f5f5f5',
                borderColor: isSelected ? '#1890ff' : (slot.available ? '#b7eb8f' : '#d9d9d9'),
                cursor: slot.available ? 'pointer' : 'not-allowed',
              }}
              bodyStyle={{ padding: '12px 8px' }}
            >
              <Text strong={isSelected} type={slot.available ? undefined : 'secondary'}>
                {new Date(slot.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Text>
            </Card>
          </Col>
        );
      })}
    </Row>
  );
}
