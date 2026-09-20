'use client';

import React from 'react';
import { Card, Typography, Row, Col, Tag, Alert, Divider, Space } from 'antd';
import {
  HeartOutlined,
  CompassOutlined,
  SmileOutlined,
  TeamOutlined,
  SafetyCertificateOutlined,
  CheckCircleOutlined,
  MedicineBoxOutlined,
  BookOutlined,
  HomeOutlined,
  PhoneOutlined,
} from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;

export function PalliativeDossierView() {
  return (
    <div style={{ maxWidth: 1120, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Banner / Title Header */}
      <Card
        className="glass-card"
        style={{
          borderRadius: 18,
          background: 'linear-gradient(135deg, rgba(244, 63, 94, 0.08) 0%, rgba(99, 102, 241, 0.08) 100%)',
          border: '1px solid rgba(244, 63, 94, 0.2)',
        }}
        styles={{ body: { padding: '28px 32px' } }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 14,
              background: 'linear-gradient(135deg, #f43f5e 0%, #e11d48 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontSize: 24,
              boxShadow: '0 8px 20px rgba(244, 63, 94, 0.3)',
            }}
          >
            <HeartOutlined />
          </div>
          <div>
            <Tag color="magenta" style={{ fontWeight: 700, borderRadius: 6, textTransform: 'uppercase' }}>
              Supportive & Compassionate Oncology
            </Tag>
            <Title level={2} style={{ margin: '4px 0 0', fontWeight: 800 }}>
              Pain & Palliative Oncology: Clinical Philosophy & Total Care Framework
            </Title>
            <Text type="secondary" style={{ fontSize: 14 }}>
              An expert committee reference dossier on whole-person relief, human dignity, and proactive supportive oncology
            </Text>
          </div>
        </div>
      </Card>

      {/* Core Concept Definition */}
      <Card className="glass-card" style={{ borderRadius: 16 }} styles={{ body: { padding: '26px 30px' } }}>
        <Title level={3} style={{ marginTop: 0, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
          <CompassOutlined style={{ color: '#f43f5e' }} /> 1. The Core Concept: Redefining Supportive Oncology
        </Title>
        <Paragraph style={{ fontSize: 15, lineHeight: 1.7, opacity: 0.9 }}>
          Historically, palliative care was mistakenly perceived solely as hospice or end-of-life care—viewed as something
          introduced only when curative efforts had concluded. Modern oncology completely reframes this paradigm:
        </Paragraph>

        <Alert
          message="Early & Concurrent Integration: The Core Principle"
          description="Palliative oncology is proactive supportive care provided from the very day of cancer diagnosis alongside active disease-directed therapy. Its sole purpose is to maximize physical comfort, alleviate distress, safeguard personal autonomy, and support the patient and family through every step of treatment."
          type="info"
          showIcon
          style={{ marginBottom: 20, borderRadius: 10 }}
        />

        <Row gutter={[20, 16]}>
          <Col xs={24} md={8}>
            <div
              style={{
                padding: '18px 20px',
                borderRadius: 12,
                background: 'rgba(99, 102, 241, 0.05)',
                border: '1px solid rgba(99, 102, 241, 0.15)',
                height: '100%',
              }}
            >
              <div style={{ fontWeight: 700, fontSize: 15, color: '#4f46e5', marginBottom: 6 }}>
                Concurrent with Treatment
              </div>
              <Text type="secondary" style={{ fontSize: 13.5 }}>
                Patients do not choose between active cancer treatment and comfort care. Both proceed simultaneously in perfect harmony.
              </Text>
            </div>
          </Col>

          <Col xs={24} md={8}>
            <div
              style={{
                padding: '18px 20px',
                borderRadius: 12,
                background: 'rgba(16, 185, 129, 0.05)',
                border: '1px solid rgba(16, 185, 129, 0.15)',
                height: '100%',
              }}
            >
              <div style={{ fontWeight: 700, fontSize: 15, color: '#059669', marginBottom: 6 }}>
                Evidence-Proven Quality of Life
              </div>
              <Text type="secondary" style={{ fontSize: 13.5 }}>
                Peer-reviewed clinical trials prove that early supportive care improves day-to-day energy, decreases emergency visits, and helps patients better tolerate their prescribed protocols.
              </Text>
            </div>
          </Col>

          <Col xs={24} md={8}>
            <div
              style={{
                padding: '18px 20px',
                borderRadius: 12,
                background: 'rgba(245, 158, 11, 0.05)',
                border: '1px solid rgba(245, 158, 11, 0.15)',
                height: '100%',
              }}
            >
              <div style={{ fontWeight: 700, fontSize: 15, color: '#d97706', marginBottom: 6 }}>
                Patient-Centric Autonomy
              </div>
              <Text type="secondary" style={{ fontSize: 13.5 }}>
                Care decisions are anchored in the patient's individual values, comfort goals, cultural considerations, and personal dignity.
              </Text>
            </div>
          </Col>
        </Row>
      </Card>

      {/* The 4 Dimensions of Total Pain */}
      <Card className="glass-card" style={{ borderRadius: 16 }} styles={{ body: { padding: '26px 30px' } }}>
        <Title level={3} style={{ marginTop: 0, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
          <HeartOutlined style={{ color: '#e11d48' }} /> 2. The Four Dimensions of "Total Pain"
        </Title>
        <Paragraph style={{ fontSize: 15, lineHeight: 1.7, opacity: 0.9 }}>
          Pioneered by the founder of modern supportive care, <strong>Dame Cicely Saunders</strong>, the concept of
          <strong> "Total Pain"</strong> recognizes that a cancer patient's suffering can never be reduced to a purely
          biological sensation. True relief requires listening to and comforting all four interconnected realms of human existence:
        </Paragraph>

        <Row gutter={[20, 20]} style={{ marginTop: 12 }}>
          {/* Realm 1: Physical Pain */}
          <Col xs={24} md={12}>
            <Card
              className="glass-card"
              style={{
                borderRadius: 14,
                borderLeft: '4px solid #ef4444',
                height: '100%',
              }}
              styles={{ body: { padding: '20px' } }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <span
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    background: 'rgba(239, 68, 68, 0.15)',
                    color: '#ef4444',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 800,
                  }}
                >
                  1
                </span>
                <span style={{ fontWeight: 800, fontSize: 16 }}>Physical Pain</span>
              </div>
              <Paragraph type="secondary" style={{ fontSize: 13.5, marginBottom: 8 }}>
                The physical discomfort experienced in the body:
              </Paragraph>
              <ul style={{ paddingLeft: 20, fontSize: 13, opacity: 0.85, margin: 0, lineHeight: 1.6 }}>
                <li>Aching in muscles, joints, bones, or surgical sites</li>
                <li>Deep visceral pressure, fullness, or abdominal tension</li>
                <li>Nerve tingling, burning, numbness, or heightened sensitivity</li>
                <li>Fatigue, weakness, and loss of easy physical mobility</li>
              </ul>
            </Card>
          </Col>

          {/* Realm 2: Psychological Pain */}
          <Col xs={24} md={12}>
            <Card
              className="glass-card"
              style={{
                borderRadius: 14,
                borderLeft: '4px solid #6366f1',
                height: '100%',
              }}
              styles={{ body: { padding: '20px' } }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <span
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    background: 'rgba(99, 102, 241, 0.15)',
                    color: '#6366f1',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 800,
                  }}
                >
                  2
                </span>
                <span style={{ fontWeight: 800, fontSize: 16 }}>Psychological Pain</span>
              </div>
              <Paragraph type="secondary" style={{ fontSize: 13.5, marginBottom: 8 }}>
                The emotional and mental toll experienced across the cancer trajectory:
              </Paragraph>
              <ul style={{ paddingLeft: 20, fontSize: 13, opacity: 0.85, margin: 0, lineHeight: 1.6 }}>
                <li>Anxiety about upcoming appointments, procedures, or scans</li>
                <li>Grief over the sudden loss of former routine and independence</li>
                <li>Sadness, helplessness, and feelings of vulnerability</li>
                <li>Sleep difficulties caused by an overactive, worried mind</li>
              </ul>
            </Card>
          </Col>

          {/* Realm 3: Social & Financial Pain */}
          <Col xs={24} md={12}>
            <Card
              className="glass-card"
              style={{
                borderRadius: 14,
                borderLeft: '4px solid #f59e0b',
                height: '100%',
              }}
              styles={{ body: { padding: '20px' } }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <span
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    background: 'rgba(245, 158, 11, 0.15)',
                    color: '#f59e0b',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 800,
                  }}
                >
                  3
                </span>
                <span style={{ fontWeight: 800, fontSize: 16 }}>Social & Financial Pain (Financial Toxicity)</span>
              </div>
              <Paragraph type="secondary" style={{ fontSize: 13.5, marginBottom: 8 }}>
                The strain that serious illness exerts on families and economic survival:
              </Paragraph>
              <ul style={{ paddingLeft: 20, fontSize: 13, opacity: 0.85, margin: 0, lineHeight: 1.6 }}>
                <li>Anxiety over out-of-pocket costs, travel, and diagnostic expenses</li>
                <li>Loss of income or livelihood for both the patient and primary caregiver</li>
                <li>Fear of becoming an emotional or financial burden to children or spouse</li>
                <li>Social isolation and feeling disconnected from community life</li>
              </ul>
            </Card>
          </Col>

          {/* Realm 4: Spiritual & Existential Pain */}
          <Col xs={24} md={12}>
            <Card
              className="glass-card"
              style={{
                borderRadius: 14,
                borderLeft: '4px solid #10b981',
                height: '100%',
              }}
              styles={{ body: { padding: '20px' } }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <span
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    background: 'rgba(16, 185, 129, 0.15)',
                    color: '#10b981',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 800,
                  }}
                >
                  4
                </span>
                <span style={{ fontWeight: 800, fontSize: 16 }}>Spiritual & Existential Pain</span>
              </div>
              <Paragraph type="secondary" style={{ fontSize: 13.5, marginBottom: 8 }}>
                The inner questions of meaning, purpose, and peace:
              </Paragraph>
              <ul style={{ paddingLeft: 20, fontSize: 13, opacity: 0.85, margin: 0, lineHeight: 1.6 }}>
                <li>Struggling with existential questions: <em>"Why did this happen to me?"</em></li>
                <li>Feelings of guilt, unfulfilled dreams, or unresolved conflicts</li>
                <li>Seeking peace of mind, inner solace, and spiritual grounding</li>
                <li>The deep desire to be remembered with love, respect, and dignity</li>
              </ul>
            </Card>
          </Col>
        </Row>
      </Card>

      {/* Patient-Centered Supportive Care Pathway Flowchart */}
      <Card className="glass-card" style={{ borderRadius: 16 }} styles={{ body: { padding: '26px 30px' } }}>
        <Title level={3} style={{ marginTop: 0, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
          <SafetyCertificateOutlined style={{ color: '#0284c7' }} /> 3. The Patient-Centered Supportive Care Pathway
        </Title>
        <Paragraph style={{ fontSize: 14.5, opacity: 0.85, marginBottom: 20 }}>
          How supportive and comfort care is woven into the patient's continuous treatment journey:
        </Paragraph>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Step 1 */}
          <div
            style={{
              padding: '16px 20px',
              borderRadius: 12,
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              display: 'flex',
              alignItems: 'center',
              gap: 16,
            }}
          >
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                background: '#4f46e5',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                flexShrink: 0,
              }}
            >
              I
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 15 }}>Step 1: Early Assessment & Deep Listening</div>
              <div style={{ fontSize: 13, opacity: 0.7, marginTop: 2 }}>
                Screening for all 4 dimensions of Total Pain at every clinical visit via digital questionnaires, patient consultations, and family conversations.
              </div>
            </div>
          </div>

          {/* Step 2 */}
          <div
            style={{
              padding: '16px 20px',
              borderRadius: 12,
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              display: 'flex',
              alignItems: 'center',
              gap: 16,
            }}
          >
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                background: '#0284c7',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                flexShrink: 0,
              }}
            >
              II
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 15 }}>Step 2: Formulating the Personalized Comfort Plan</div>
              <div style={{ fontSize: 13, opacity: 0.7, marginTop: 2 }}>
                Collaborative goal-setting between the oncologist, palliative nurse, counselor, patient, and family—identifying what matters most to the patient in their daily life.
              </div>
            </div>
          </div>

          {/* Step 3 */}
          <div
            style={{
              padding: '16px 20px',
              borderRadius: 12,
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              display: 'flex',
              alignItems: 'center',
              gap: 16,
            }}
          >
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                background: '#059669',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                flexShrink: 0,
              }}
            >
              III
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 15 }}>Step 3: Multimodal Comfort Delivery & Symptom Relief</div>
              <div style={{ fontSize: 13, opacity: 0.7, marginTop: 2 }}>
                Delivering whole-person relief: physical comfort therapies, energy pacing, nutritional comfort support, psychological counseling, and financial guidance through relief schemes.
              </div>
            </div>
          </div>

          {/* Step 4 */}
          <div
            style={{
              padding: '16px 20px',
              borderRadius: 12,
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              display: 'flex',
              alignItems: 'center',
              gap: 16,
            }}
          >
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                background: '#e11d48',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                flexShrink: 0,
              }}
            >
              IV
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 15 }}>Step 4: Continuous Home Nursing & Caregiver Solace</div>
              <div style={{ fontSize: 13, opacity: 0.7, marginTop: 2 }}>
                Providing community access via local pain clinics, home-based nursing visits, 24/7 symptom helplines, and respite support for family caregivers.
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
