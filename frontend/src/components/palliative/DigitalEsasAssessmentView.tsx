'use client';

import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Slider,
  Typography,
  Space,
  Button,
  Select,
  Input,
  Tag,
  Divider,
  Alert,
  message,
  Table,
  Badge,
  Progress,
} from 'antd';
import {
  HeartOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  WarningOutlined,
  HistoryOutlined,
  SendOutlined,
  UserOutlined,
  ThunderboltOutlined,
  DollarCircleOutlined,
  SmileOutlined,
  CompassOutlined,
} from '@ant-design/icons';
import { palliativeService, EsasAssessmentRecord } from '@/services/palliative.service';
import { usePatients } from '@/hooks/use-patients';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

export function DigitalEsasAssessmentView() {
  const { data: patientsData } = usePatients();
  const patients = Array.isArray(patientsData?.data)
    ? patientsData.data
    : Array.isArray(patientsData)
    ? patientsData
    : [];

  const [selectedPatientId, setSelectedPatientId] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [assessments, setAssessments] = useState<EsasAssessmentRecord[]>([]);
  const [isLoadingAssessments, setIsLoadingAssessments] = useState(false);

  // 4 Dimensions of Total Pain (0 - 10)
  const [physicalPain, setPhysicalPain] = useState<number>(4);
  const [psychologicalDistress, setPsychologicalDistress] = useState<number>(3);
  const [socialFinancialToxicity, setSocialFinancialToxicity] = useState<number>(5);
  const [spiritualDistress, setSpiritualDistress] = useState<number>(2);

  // Core Physical Symptoms (0 - 10)
  const [fatigue, setFatigue] = useState<number>(5);
  const [shortnessOfBreath, setShortnessOfBreath] = useState<number>(2);
  const [nausea, setNausea] = useState<number>(1);
  const [appetiteLoss, setAppetiteLoss] = useState<number>(4);
  const [overallWellBeing, setOverallWellBeing] = useState<number>(4);
  const [clinicalNotes, setClinicalNotes] = useState<string>('');

  // Auto-select first patient if available
  useEffect(() => {
    if (!selectedPatientId && patients.length > 0) {
      setSelectedPatientId(patients[0].id);
    }
  }, [patients, selectedPatientId]);

  const fetchAssessments = async () => {
    try {
      setIsLoadingAssessments(true);
      const res = await palliativeService.getAssessments();
      setAssessments(res || []);
    } catch (err) {
      console.error('Error fetching assessments:', err);
    } finally {
      setIsLoadingAssessments(false);
    }
  };

  useEffect(() => {
    fetchAssessments();
  }, []);

  // Compute live Total Pain score
  const totalPainAverage = Math.round(((physicalPain + psychologicalDistress + socialFinancialToxicity + spiritualDistress) / 4) * 10) / 10;

  const getSeverityInfo = (score: number) => {
    if (score >= 7) return { label: 'Severe Distress', color: '#ef4444', badge: 'error' };
    if (score >= 4) return { label: 'Moderate Distress', color: '#f59e0b', badge: 'warning' };
    return { label: 'Mild / Managed', color: '#10b981', badge: 'success' };
  };

  const severity = getSeverityInfo(totalPainAverage);

  const handleSubmit = async () => {
    if (!selectedPatientId) {
      message.warning('Please select a patient for this assessment.');
      return;
    }

    try {
      setIsSubmitting(true);
      const payload = {
        patientId: selectedPatientId,
        physicalPain,
        psychologicalDistress,
        socialFinancialToxicity,
        spiritualDistress,
        fatigue,
        shortnessOfBreath,
        nausea,
        appetiteLoss,
        overallWellBeing,
        notes: clinicalNotes,
      };

      const result = await palliativeService.submitAssessment(payload);
      message.success(`Total Pain assessment recorded for patient (Score: ${result.totalPainScore}/10 - ${result.severityLevel})`);
      setClinicalNotes('');
      fetchAssessments();
    } catch (err: any) {
      message.error(err?.response?.data?.message || 'Failed to submit assessment.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <Row gutter={[24, 24]}>
        {/* Left Side: Assessment Form */}
        <Col xs={24} lg={15}>
          <Card
            className="glass-card"
            style={{ borderRadius: 16 }}
            styles={{ body: { padding: '24px 28px' } }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
              <div>
                <Title level={4} style={{ margin: 0, fontWeight: 700 }}>
                  <HeartOutlined style={{ color: '#f43f5e', marginRight: 8 }} />
                  Digital ESAS Total Pain & Symptom Screener
                </Title>
                <Text type="secondary" style={{ fontSize: 13 }}>
                  Rate symptom intensity on a scale of 0 (No Distress) to 10 (Worst Possible)
                </Text>
              </div>

              {/* Patient Selector */}
              <div style={{ minWidth: 240 }}>
                <Text style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 4 }}>
                  Select Patient:
                </Text>
                <Select
                  value={selectedPatientId}
                  onChange={setSelectedPatientId}
                  style={{ width: '100%' }}
                  placeholder="Choose patient..."
                >
                  {patients.map((p: any) => (
                    <Select.Option key={p.id} value={p.id}>
                      {p.firstName} {p.lastName} {p.primaryCancerType ? `(${p.primaryCancerType})` : ''}
                    </Select.Option>
                  ))}
                </Select>
              </div>
            </div>

            <Divider style={{ margin: '12px 0 20px' }} />

            {/* Total Pain: 4 Dimension Sliders */}
            <div style={{ marginBottom: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                <Tag color="magenta" style={{ fontWeight: 700 }}>THE 4 REALMS OF TOTAL PAIN</Tag>
                <Text type="secondary" style={{ fontSize: 12 }}>Evaluates physical, emotional, economic, and spiritual suffering</Text>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {/* 1. Physical Pain */}
                <div style={{ background: 'rgba(239, 68, 68, 0.04)', padding: '12px 16px', borderRadius: 10, border: '1px solid rgba(239, 68, 68, 0.15)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 700, fontSize: 14, color: '#ef4444' }}>
                      1. Physical Pain & Bodily Discomfort
                    </span>
                    <Badge count={`${physicalPain} / 10`} style={{ backgroundColor: physicalPain >= 7 ? '#ef4444' : physicalPain >= 4 ? '#f59e0b' : '#10b981', fontWeight: 800 }} />
                  </div>
                  <Slider min={0} max={10} value={physicalPain} onChange={setPhysicalPain} tooltip={{ formatter: (val) => `${val}/10` }} />
                </div>

                {/* 2. Psychological Distress */}
                <div style={{ background: 'rgba(99, 102, 241, 0.04)', padding: '12px 16px', borderRadius: 10, border: '1px solid rgba(99, 102, 241, 0.15)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 700, fontSize: 14, color: '#6366f1' }}>
                      2. Psychological & Emotional Distress (Anxiety, Sadness, Fear)
                    </span>
                    <Badge count={`${psychologicalDistress} / 10`} style={{ backgroundColor: psychologicalDistress >= 7 ? '#ef4444' : psychologicalDistress >= 4 ? '#f59e0b' : '#10b981', fontWeight: 800 }} />
                  </div>
                  <Slider min={0} max={10} value={psychologicalDistress} onChange={setPsychologicalDistress} tooltip={{ formatter: (val) => `${val}/10` }} />
                </div>

                {/* 3. Social & Financial Pain */}
                <div style={{ background: 'rgba(245, 158, 11, 0.04)', padding: '12px 16px', borderRadius: 10, border: '1px solid rgba(245, 158, 11, 0.15)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 700, fontSize: 14, color: '#d97706' }}>
                      3. Social & Financial Pain (Financial Toxicity & Family Strain)
                    </span>
                    <Badge count={`${socialFinancialToxicity} / 10`} style={{ backgroundColor: socialFinancialToxicity >= 7 ? '#ef4444' : socialFinancialToxicity >= 4 ? '#f59e0b' : '#10b981', fontWeight: 800 }} />
                  </div>
                  <Slider min={0} max={10} value={socialFinancialToxicity} onChange={setSocialFinancialToxicity} tooltip={{ formatter: (val) => `${val}/10` }} />
                </div>

                {/* 4. Spiritual Pain */}
                <div style={{ background: 'rgba(16, 185, 129, 0.04)', padding: '12px 16px', borderRadius: 10, border: '1px solid rgba(16, 185, 129, 0.15)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 700, fontSize: 14, color: '#059669' }}>
                      4. Spiritual & Existential Discomfort (Peace of Mind & Meaning)
                    </span>
                    <Badge count={`${spiritualDistress} / 10`} style={{ backgroundColor: spiritualDistress >= 7 ? '#ef4444' : spiritualDistress >= 4 ? '#f59e0b' : '#10b981', fontWeight: 800 }} />
                  </div>
                  <Slider min={0} max={10} value={spiritualDistress} onChange={setSpiritualDistress} tooltip={{ formatter: (val) => `${val}/10` }} />
                </div>
              </div>
            </div>

            {/* Core Physical Symptoms */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                <Tag color="blue" style={{ fontWeight: 700 }}>CORE SUPPORTIVE ONCOLOGY SYMPTOMS</Tag>
              </div>

              <Row gutter={[16, 12]}>
                <Col xs={24} sm={12}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, fontWeight: 600 }}>
                      <span>Fatigue / Exhaustion</span>
                      <span>{fatigue}/10</span>
                    </div>
                    <Slider min={0} max={10} value={fatigue} onChange={setFatigue} />
                  </div>
                </Col>

                <Col xs={24} sm={12}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, fontWeight: 600 }}>
                      <span>Shortness of Breath / Dyspnea</span>
                      <span>{shortnessOfBreath}/10</span>
                    </div>
                    <Slider min={0} max={10} value={shortnessOfBreath} onChange={setShortnessOfBreath} />
                  </div>
                </Col>

                <Col xs={24} sm={12}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, fontWeight: 600 }}>
                      <span>Nausea / Queasiness</span>
                      <span>{nausea}/10</span>
                    </div>
                    <Slider min={0} max={10} value={nausea} onChange={setNausea} />
                  </div>
                </Col>

                <Col xs={24} sm={12}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, fontWeight: 600 }}>
                      <span>Loss of Appetite</span>
                      <span>{appetiteLoss}/10</span>
                    </div>
                    <Slider min={0} max={10} value={appetiteLoss} onChange={setAppetiteLoss} />
                  </div>
                </Col>

                <Col xs={24}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, fontWeight: 600 }}>
                      <span>Overall Well-Being (0: Best Feeling, 10: Worst Feeling)</span>
                      <span>{overallWellBeing}/10</span>
                    </div>
                    <Slider min={0} max={10} value={overallWellBeing} onChange={setOverallWellBeing} />
                  </div>
                </Col>
              </Row>
            </div>

            <div style={{ marginTop: 16 }}>
              <Text style={{ fontSize: 13, fontWeight: 600 }}>Patient Narrative & Coordinator Observations:</Text>
              <TextArea
                rows={2}
                placeholder="Document patient statements, family concerns, or specific palliative goals..."
                value={clinicalNotes}
                onChange={(e) => setClinicalNotes(e.target.value)}
                style={{ marginTop: 6 }}
              />
            </div>

            <div style={{ marginTop: 20, textAlign: 'right' }}>
              <Button
                type="primary"
                size="large"
                icon={<SendOutlined />}
                loading={isSubmitting}
                onClick={handleSubmit}
                style={{ background: '#f43f5e', borderColor: '#f43f5e', fontWeight: 700 }}
              >
                Save Total Pain Assessment
              </Button>
            </div>
          </Card>
        </Col>

        {/* Right Side: Total Pain Meter & Action Pathways */}
        <Col xs={24} lg={9}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Live Total Pain Score Card */}
            <Card
              className="glass-card"
              style={{ borderRadius: 16, textAlign: 'center' }}
              styles={{ body: { padding: '24px' } }}
            >
              <div style={{ fontSize: 12, fontWeight: 700, opacity: 0.7, textTransform: 'uppercase' }}>
                Composite Total Pain Score
              </div>
              <div style={{ fontSize: 44, fontWeight: 800, color: severity.color, margin: '8px 0 4px' }}>
                {totalPainAverage} <span style={{ fontSize: 20, opacity: 0.5 }}>/ 10</span>
              </div>
              <Tag color={severity.badge} style={{ fontSize: 13, padding: '4px 12px', borderRadius: 20, fontWeight: 700 }}>
                {severity.label}
              </Tag>

              <Divider style={{ margin: '16px 0' }} />

              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: 11, fontWeight: 700, opacity: 0.6, textTransform: 'uppercase', marginBottom: 8 }}>
                  Total Pain Breakdown
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 12.5 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Physical Pain</span>
                    <span style={{ fontWeight: 700, color: '#ef4444' }}>{physicalPain} / 10</span>
                  </div>
                  <Progress percent={physicalPain * 10} strokeColor="#ef4444" size="small" showInfo={false} />

                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Psychological Distress</span>
                    <span style={{ fontWeight: 700, color: '#6366f1' }}>{psychologicalDistress} / 10</span>
                  </div>
                  <Progress percent={psychologicalDistress * 10} strokeColor="#6366f1" size="small" showInfo={false} />

                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Financial / Social Toxicity</span>
                    <span style={{ fontWeight: 700, color: '#f59e0b' }}>{socialFinancialToxicity} / 10</span>
                  </div>
                  <Progress percent={socialFinancialToxicity * 10} strokeColor="#f59e0b" size="small" showInfo={false} />

                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Spiritual / Existential Pain</span>
                    <span style={{ fontWeight: 700, color: '#10b981' }}>{spiritualDistress} / 10</span>
                  </div>
                  <Progress percent={spiritualDistress * 10} strokeColor="#10b981" size="small" showInfo={false} />
                </div>
              </div>
            </Card>

            {/* Automated Care Action Triggers */}
            <Card
              className="glass-card"
              style={{ borderRadius: 16 }}
              styles={{ body: { padding: '20px' } }}
            >
              <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                <ThunderboltOutlined style={{ color: '#6366f1' }} /> Automated Care Pathways
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 12.5 }}>
                {physicalPain >= 4 && (
                  <div style={{ padding: '10px 12px', background: 'rgba(239, 68, 68, 0.08)', borderRadius: 8, borderLeft: '3px solid #ef4444' }}>
                    <div style={{ fontWeight: 700, color: '#ef4444' }}>Physical Comfort Protocol</div>
                    <div style={{ opacity: 0.85, fontSize: 11.5, marginTop: 2 }}>
                      Flagged for physician comfort consultation & non-pharmacological posture/mobility support.
                    </div>
                  </div>
                )}

                {socialFinancialToxicity >= 5 && (
                  <div style={{ padding: '10px 12px', background: 'rgba(245, 158, 11, 0.08)', borderRadius: 8, borderLeft: '3px solid #f59e0b' }}>
                    <div style={{ fontWeight: 700, color: '#d97706' }}>Financial Toxicity Bridge</div>
                    <div style={{ opacity: 0.85, fontSize: 11.5, marginTop: 2 }}>
                      Automated referral to <strong>CareRelief</strong> (Aid & Grants) for medical subsidy assistance.
                    </div>
                  </div>
                )}

                {psychologicalDistress >= 5 && (
                  <div style={{ padding: '10px 12px', background: 'rgba(99, 102, 241, 0.08)', borderRadius: 8, borderLeft: '3px solid #6366f1' }}>
                    <div style={{ fontWeight: 700, color: '#4f46e5' }}>Emotional Support Circle</div>
                    <div style={{ opacity: 0.85, fontSize: 11.5, marginTop: 2 }}>
                      Assigning counselor & enrolling family into <strong>CareCircles</strong> peer support network.
                    </div>
                  </div>
                )}

                {spiritualDistress >= 5 && (
                  <div style={{ padding: '10px 12px', background: 'rgba(16, 185, 129, 0.08)', borderRadius: 8, borderLeft: '3px solid #10b981' }}>
                    <div style={{ fontWeight: 700, color: '#059669' }}>Existential Dignity Therapy</div>
                    <div style={{ opacity: 0.85, fontSize: 11.5, marginTop: 2 }}>
                      Offering chaplaincy / compassionate existential counseling and personal dignity reflection.
                    </div>
                  </div>
                )}

                {totalPainAverage < 4 && (
                  <div style={{ padding: '10px 12px', background: 'rgba(16, 185, 129, 0.08)', borderRadius: 8, borderLeft: '3px solid #10b981' }}>
                    <div style={{ fontWeight: 700, color: '#059669' }}>Well-Maintained Comfort</div>
                    <div style={{ opacity: 0.85, fontSize: 11.5, marginTop: 2 }}>
                      Symptoms currently within mild thresholds. Continue routine monitoring.
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </Col>
      </Row>

      {/* Assessment History Table */}
      <Card
        className="glass-card"
        style={{ borderRadius: 16 }}
        styles={{ body: { padding: '20px 24px' } }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <div style={{ fontWeight: 700, fontSize: 15, display: 'flex', alignItems: 'center', gap: 8 }}>
            <HistoryOutlined style={{ color: '#f43f5e' }} /> Recent Total Pain & ESAS Assessment Logs
          </div>
          <Button size="small" onClick={fetchAssessments}>
            Refresh Logs
          </Button>
        </div>

        <Table
          dataSource={assessments}
          rowKey="id"
          loading={isLoadingAssessments}
          pagination={{ pageSize: 5 }}
          columns={[
            {
              title: 'Date',
              dataIndex: 'createdAt',
              key: 'createdAt',
              render: (val) => new Date(val).toLocaleString(),
            },
            {
              title: 'Patient',
              dataIndex: 'patientName',
              key: 'patientName',
              render: (val) => <span style={{ fontWeight: 700 }}>{val || 'Patient'}</span>,
            },
            {
              title: 'Physical',
              dataIndex: 'physicalPain',
              key: 'physicalPain',
              render: (val) => <Tag color={val >= 7 ? 'red' : val >= 4 ? 'orange' : 'green'}>{val} / 10</Tag>,
            },
            {
              title: 'Emotional',
              dataIndex: 'psychologicalDistress',
              key: 'psychologicalDistress',
              render: (val) => <Tag color={val >= 7 ? 'red' : val >= 4 ? 'orange' : 'green'}>{val} / 10</Tag>,
            },
            {
              title: 'Financial Toxicity',
              dataIndex: 'socialFinancialToxicity',
              key: 'socialFinancialToxicity',
              render: (val) => <Tag color={val >= 7 ? 'red' : val >= 4 ? 'orange' : 'green'}>{val} / 10</Tag>,
            },
            {
              title: 'Spiritual',
              dataIndex: 'spiritualDistress',
              key: 'spiritualDistress',
              render: (val) => <Tag color={val >= 7 ? 'red' : val >= 4 ? 'orange' : 'green'}>{val} / 10</Tag>,
            },
            {
              title: 'Composite Score',
              dataIndex: 'totalPainScore',
              key: 'totalPainScore',
              render: (val, record) => (
                <span style={{ fontWeight: 800, color: record.severityLevel === 'SEVERE' ? '#ef4444' : record.severityLevel === 'MODERATE' ? '#f59e0b' : '#10b981' }}>
                  {val} / 10 ({record.severityLevel})
                </span>
              ),
            },
            {
              title: 'Action Triggered',
              dataIndex: 'recommendedActions',
              key: 'recommendedActions',
              render: (acts: string[]) => (
                <span style={{ fontSize: 12 }}>{acts?.[0] || 'Routine monitoring'}</span>
              ),
            },
          ]}
        />
      </Card>
    </div>
  );
}
