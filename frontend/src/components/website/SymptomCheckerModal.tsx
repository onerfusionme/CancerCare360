'use client';

import React, { useState } from 'react';
import { Modal, Checkbox, Button, Alert, Typography, Space, Divider, Progress } from 'antd';
import { 
  ThunderboltOutlined, 
  CheckCircleOutlined, 
  WarningOutlined, 
  AlertOutlined, 
  CalendarOutlined,
  PhoneOutlined
} from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;

interface SymptomCheckerModalProps {
  open: boolean;
  onClose: () => void;
  onBook: () => void;
}

const SYMPTOM_QUESTIONS = [
  {
    id: 'lump',
    label: 'Palpable lump or thickening',
    desc: 'Painless, firm or hard lump in the breast, armpit, neck, groin, or testicle lasting over 2 weeks.',
    weight: 3,
  },
  {
    id: 'oral_ulcer',
    label: 'Non-healing mouth or tongue ulcer',
    desc: 'White/red patch or ulcer in oral cavity lasting > 2 weeks (especially in tobacco/pan masala users).',
    weight: 3,
  },
  {
    id: 'bleeding',
    label: 'Unusual bleeding or discharge',
    desc: 'Coughing up blood, blood in stool/urine, or abnormal post-menopausal / inter-menstrual bleeding.',
    weight: 3,
  },
  {
    id: 'weight_loss',
    label: 'Unexplained significant weight loss',
    desc: 'Unintentional loss of 5-10% body weight within a few months accompanied by chronic fatigue.',
    weight: 2,
  },
  {
    id: 'swallowing',
    label: 'Persistent difficulty swallowing (dysphagia)',
    desc: 'Feeling of food sticking in the chest or painful swallowing lasting over 2 weeks.',
    weight: 2,
  },
  {
    id: 'cough',
    label: 'Chronic persistent cough or hoarseness',
    desc: 'Voice hoarseness or nagging cough lasting > 3 weeks, not responding to antibiotics.',
    weight: 2,
  },
  {
    id: 'bowel_change',
    label: 'Persistent change in bowel or bladder habits',
    desc: 'Unexplained alternating diarrhea and constipation, narrow stool caliber, or tenesmus.',
    weight: 2,
  },
  {
    id: 'skin_mole',
    label: 'Changing mole or skin lesion',
    desc: 'Mole changing size, irregular borders, multiple shades of black/brown, or spontaneous bleeding.',
    weight: 2,
  },
];

export function SymptomCheckerModal({ open, onClose, onBook }: SymptomCheckerModalProps) {
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [showResult, setShowResult] = useState(false);

  const handleToggle = (id: string) => {
    setSelectedSymptoms((prev) => 
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleReset = () => {
    setSelectedSymptoms([]);
    setShowResult(false);
    onClose();
  };

  const totalScore = selectedSymptoms.reduce((acc, id) => {
    const q = SYMPTOM_QUESTIONS.find((item) => item.id === id);
    return acc + (q?.weight || 0);
  }, 0);

  const getTriageLevel = () => {
    if (totalScore >= 4) {
      return {
        level: 'URGENT',
        color: '#e11d48',
        bg: '#fff1f2',
        border: '#fecdd3',
        title: 'High Priority Specialist Review Advised',
        desc: 'You have reported one or more high-consequence oncology warning signs. We strongly recommend scheduling a multidisciplinary diagnostic evaluation within 48 to 72 hours.',
        action: 'Book Priority Consultation',
      };
    }
    if (totalScore >= 2) {
      return {
        level: 'MODERATE',
        color: '#d97706',
        bg: '#fffbeb',
        border: '#fde68a',
        title: 'Specialist Clinical Workup Recommended',
        desc: 'You have noted persistent symptoms that warrant clinical evaluation. Early diagnostic investigation (such as ultrasound, low-dose CT, or endoscopic check) ensures peace of mind.',
        action: 'Schedule Specialist Review',
      };
    }
    return {
      level: 'ROUTINE',
      color: '#059669',
      bg: '#ecfdf5',
      border: '#a7f3d0',
      title: 'Low Immediate Red-Flag Risk',
      desc: 'No acute red-flag warning signs were identified. For ongoing health and early prevention, we recommend periodic wellness cancer screening based on your age and risk profile.',
      action: 'Explore Preventive Screening',
    };
  };

  const triage = getTriageLevel();

  return (
    <Modal
      open={open}
      onCancel={handleReset}
      footer={null}
      width={680}
      destroyOnClose
      centered
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ThunderboltOutlined style={{ color: '#f43f5e', fontSize: '20px' }} />
          <span style={{ fontSize: '18px', fontWeight: 700, color: '#0f172a' }}>
            Cancer Early Warning Signs & Symptom Triage
          </span>
        </div>
      }
    >
      <div style={{ marginTop: '12px' }}>
        {!showResult ? (
          <>
            <Paragraph style={{ color: '#64748b', fontSize: '14px', marginBottom: '16px' }}>
              Select any persistent symptoms you or your family member have experienced over the past 2–4 weeks. This assessment is based on WHO and NCI oncology triage protocols.
            </Paragraph>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '380px', overflowY: 'auto', paddingRight: '4px' }}>
              {SYMPTOM_QUESTIONS.map((q) => {
                const checked = selectedSymptoms.includes(q.id);
                return (
                  <div
                    key={q.id}
                    onClick={() => handleToggle(q.id)}
                    style={{
                      border: checked ? '1.5px solid #4f46e5' : '1px solid #e2e8f0',
                      background: checked ? '#eef2ff' : '#ffffff',
                      borderRadius: '8px',
                      padding: '12px 16px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '12px',
                      transition: 'all 0.2s',
                    }}
                  >
                    <Checkbox checked={checked} onChange={() => handleToggle(q.id)} style={{ marginTop: '2px' }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, color: checked ? '#312e81' : '#0f172a', fontSize: '14px' }}>
                        {q.label}
                      </div>
                      <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                        {q.desc}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <Divider style={{ margin: '16px 0' }} />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text type="secondary" style={{ fontSize: '13px' }}>
                {selectedSymptoms.length} symptom{selectedSymptoms.length === 1 ? '' : 's'} selected
              </Text>
              <Button
                type="primary"
                onClick={() => setShowResult(true)}
                size="large"
                style={{ background: '#4f46e5', fontWeight: 600, minWidth: '150px' }}
              >
                Analyze Symptoms
              </Button>
            </div>
          </>
        ) : (
          <div style={{ padding: '8px 0' }}>
            <div style={{
              background: triage.bg,
              border: `1.5px solid ${triage.border}`,
              borderRadius: '12px',
              padding: '24px',
              textAlign: 'center',
            }}>
              {triage.level === 'URGENT' && <AlertOutlined style={{ fontSize: '36px', color: triage.color, marginBottom: '8px' }} />}
              {triage.level === 'MODERATE' && <WarningOutlined style={{ fontSize: '36px', color: triage.color, marginBottom: '8px' }} />}
              {triage.level === 'ROUTINE' && <CheckCircleOutlined style={{ fontSize: '36px', color: triage.color, marginBottom: '8px' }} />}

              <Title level={4} style={{ color: triage.color, margin: '8px 0' }}>
                {triage.title}
              </Title>

              <Paragraph style={{ color: '#334155', fontSize: '14px', maxWidth: '500px', margin: '0 auto 16px auto', lineHeight: 1.6 }}>
                {triage.desc}
              </Paragraph>

              {selectedSymptoms.length > 0 && (
                <div style={{ textAlign: 'left', background: '#ffffff', padding: '12px 16px', borderRadius: '8px', marginBottom: '16px', border: '1px solid #e2e8f0' }}>
                  <Text strong style={{ fontSize: '12px', textTransform: 'uppercase', color: '#64748b' }}>
                    Symptoms Identified for Clinical Review:
                  </Text>
                  <ul style={{ margin: '6px 0 0 0', paddingLeft: '20px', color: '#1e293b', fontSize: '13px' }}>
                    {selectedSymptoms.map((id) => {
                      const item = SYMPTOM_QUESTIONS.find((q) => q.id === id);
                      return <li key={id}><strong>{item?.label}</strong> — {item?.desc}</li>;
                    })}
                  </ul>
                </div>
              )}

              <Space size="middle" wrap style={{ justifyContent: 'center' }}>
                <Button
                  type="primary"
                  icon={<CalendarOutlined />}
                  onClick={onBook}
                  size="large"
                  style={{ background: '#4f46e5', fontWeight: 600 }}
                >
                  {triage.action}
                </Button>

                <Button
                  icon={<PhoneOutlined />}
                  size="large"
                  href="tel:+912224177000"
                  style={{ borderColor: '#cbd5e1' }}
                >
                  Call Helpline: +91 22 2417 7000
                </Button>

                <Button onClick={() => setShowResult(false)} size="large">
                  Modify Answers
                </Button>
              </Space>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
