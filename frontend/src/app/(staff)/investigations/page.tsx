'use client';
import React, { useState, useEffect } from 'react';
import { 
  Table, 
  Select, 
  Button, 
  Typography, 
  Space, 
  Row, 
  Col, 
  Card, 
  Modal, 
  Form, 
  Input, 
  message, 
  Tag, 
  Progress, 
  Alert, 
  Badge, 
  Tooltip,
  Divider,
  Empty
} from 'antd';
import { 
  PlusOutlined, 
  CheckCircleOutlined, 
  ClockCircleOutlined,
  ExperimentOutlined,
  WarningOutlined,
  ThunderboltOutlined,
  FileDoneOutlined,
  MedicineBoxOutlined,
  AlertOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { investigationService } from '@/services/investigation.service';
import { usePatients } from '@/hooks/use-patients';

const { Title, Text } = Typography;
const { TextArea } = Input;

const MODALITIES = [
  { value: 'COMPLETE_BLOOD_COUNT_STAT', label: 'Complete Blood Count (STAT / Pre-Chemo) — SLA: 1 Hour' },
  { value: 'CBC', label: 'Complete Blood Count (Routine) — SLA: 4 Hours' },
  { value: 'SERUM_CREATININE_ELECTROLYTES', label: 'Serum Creatinine & Renal Clearance — SLA: 4 Hours' },
  { value: 'LIVER_FUNCTION_TESTS', label: 'Liver Function Panel (AST/ALT/Bilirubin) — SLA: 6 Hours' },
  { value: 'TUMOR_MARKER_CEA_CA125', label: 'Serum Tumor Markers (CEA / CA-125 / PSA) — SLA: 24 Hours' },
  { value: 'IMAGING', label: 'Diagnostic Staging CT / MRI Scan — SLA: 48 Hours' },
  { value: 'PET_CT', label: 'Whole-Body 18F-FDG PET-CT Scan — SLA: 72 Hours' },
  { value: 'BIOPSY', label: 'Core Needle / Excisional Biopsy — SLA: 120 Hours (5 Days)' },
  { value: 'HISTOPATHOLOGY', label: 'Surgical Histopathology & Margins — SLA: 120 Hours (5 Days)' },
  { value: 'HISTOPATH_IHC_MOLECULAR_EXPEDITE', label: 'Pathology IHC Biomarkers (ER/PR/HER2) — SLA: 72 Hours (3 Days)' },
  { value: 'GENETIC_TEST', label: 'Next-Generation Sequencing (NGS Panel) — SLA: 336 Hours (14 Days)' },
];

export default function InvestigationsPage() {
  const [investigations, setInvestigations] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Filters
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);
  const [modalityFilter, setModalityFilter] = useState<string | undefined>(undefined);

  // Modals
  const [orderModalOpen, setOrderModalOpen] = useState(false);
  const [resultModalOpen, setResultModalOpen] = useState(false);
  const [selectedInv, setSelectedInv] = useState<any | null>(null);

  const [orderForm] = Form.useForm();
  const [resultForm] = Form.useForm();

  const { data: patientData } = usePatients();
  const patientList = Array.isArray(patientData?.data) ? patientData.data : (Array.isArray(patientData) ? patientData : []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [list, sum] = await Promise.all([
        investigationService.getInvestigations({ status: statusFilter as any, type: modalityFilter as any }),
        investigationService.getSummary(),
      ]);
      setInvestigations(list);
      setSummary(sum);
    } catch (err) {
      console.error('Failed to load investigation data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [statusFilter, modalityFilter]);

  // Handle Order Submit
  const handleOrderSubmit = async () => {
    try {
      const values = await orderForm.validateFields();
      await investigationService.createInvestigation({
        patientId: values.patientId,
        investigationType: values.investigationType,
        notes: values.notes,
      });
      message.success('Investigation order dispatched successfully');
      setOrderModalOpen(false);
      orderForm.resetFields();
      fetchData();
    } catch (err: any) {
      if (err.errorFields) return;
      message.error(err.response?.data?.message || 'Failed to order investigation');
    }
  };

  // Fast Lifecycle Transition
  const handleAdvanceStatus = async (record: any, nextStatus: string) => {
    try {
      if (nextStatus === 'REPORT_AVAILABLE') {
        setSelectedInv(record);
        resultForm.setFieldsValue({
          resultSummary: record.resultSummary || '',
        });
        setResultModalOpen(true);
        return;
      }

      await investigationService.updateInvestigation(record.id, {
        status: nextStatus,
        performedAt: nextStatus === 'SAMPLE_COLLECTED' ? new Date().toISOString() : undefined,
      });

      message.success(`Investigation updated to ${nextStatus.replace(/_/g, ' ')}`);
      fetchData();
    } catch (err: any) {
      message.error('Failed to update investigation status');
    }
  };

  // Submit Result & Sign Off
  const handleResultSubmit = async () => {
    try {
      const values = await resultForm.validateFields();
      if (!selectedInv) return;

      await investigationService.updateInvestigation(selectedInv.id, {
        status: 'REPORT_AVAILABLE',
        reportAvailableAt: new Date().toISOString(),
        resultSummary: values.resultSummary,
      });

      message.success('Diagnostic report entered and signed off to LIS');
      setResultModalOpen(false);
      resultForm.resetFields();
      fetchData();
    } catch (err: any) {
      if (err.errorFields) return;
      message.error('Failed to save diagnostic report');
    }
  };

  // Oncologist Final Review
  const handleReviewSignOff = async (record: any) => {
    try {
      await investigationService.updateInvestigation(record.id, {
        status: 'REVIEWED',
        reviewedAt: new Date().toISOString(),
      });
      message.success('Report reviewed & finalized by treating oncologist');
      fetchData();
    } catch (err) {
      message.error('Failed to finalize review');
    }
  };

  const columns = [
    {
      title: 'Patient Details',
      dataIndex: 'patient',
      key: 'patient',
      render: (patient: any, record: any) => (
        <div>
          <div style={{ fontWeight: 700 }}>{patient?.name || 'Oncology Patient'}</div>
          <div style={{ fontSize: 11, color: '#64748b' }}>MRN: <strong style={{ fontFamily: 'monospace' }}>{patient?.mrn || record.patientId}</strong></div>
        </div>
      ),
    },
    {
      title: 'Investigation / Modality',
      dataIndex: 'investigationType',
      key: 'investigationType',
      render: (type: string, record: any) => {
        const isStat = type?.includes('STAT');
        return (
          <div>
            <div style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
              {type ? type.replace(/_/g, ' ') : 'Investigation'}
              {isStat && <Tag color="red" style={{ fontWeight: 700, fontSize: 10 }}>STAT</Tag>}
            </div>
            <div style={{ fontSize: 11, color: '#64748b' }}>Ordered: {dayjs(record.orderedAt).format('MMM D, HH:mm')}</div>
          </div>
        );
      },
    },
    {
      title: 'SLA Tracking & Benchmark',
      key: 'sla',
      render: (_: any, record: any) => {
        const sla = record.slaHours || 48;
        const elapsed = record.elapsedHours || 0;
        const pct = Math.min(100, Math.round((elapsed / sla) * 100));
        const isBreached = record.isBreached;
        const isCompleted = record.status === 'REPORT_AVAILABLE' || record.status === 'REVIEWED';

        return (
          <div style={{ width: 180 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 2 }}>
              <span style={{ color: isBreached ? '#dc2626' : '#64748b', fontWeight: isBreached ? 700 : 500 }}>
                {isBreached ? `Overdue (${elapsed}h / ${sla}h)` : `${elapsed}h / ${sla}h SLA`}
              </span>
              <span style={{ fontWeight: 700, color: isBreached ? '#dc2626' : '#10b981' }}>
                {isCompleted ? 'Finished' : (isBreached ? 'BREACHED' : `${record.hoursRemaining || 0}h left`)}
              </span>
            </div>
            <Progress 
              percent={pct} 
              size="small" 
              status={isBreached ? 'exception' : (isCompleted ? 'success' : (pct > 75 ? 'active' : 'normal'))} 
              strokeColor={isBreached ? '#ef4444' : (pct > 75 ? '#f59e0b' : '#3b82f6')}
              showInfo={false}
            />
          </div>
        );
      },
    },
    {
      title: 'Findings / Pathology Summary',
      dataIndex: 'resultSummary',
      key: 'resultSummary',
      render: (summaryText: string, record: any) => {
        if (!summaryText) {
          return <span style={{ color: '#94a3b8', fontStyle: 'italic', fontSize: 12 }}>Awaiting specimen analysis</span>;
        }
        const isCrit = record.isCriticalAbnormal;
        return (
          <div style={{ maxWidth: 300 }}>
            {isCrit && (
              <Tag color="red" style={{ fontWeight: 700, marginBottom: 4 }}>
                <WarningOutlined /> CRITICAL / MALIGNANT
              </Tag>
            )}
            <div style={{ fontSize: 12, fontWeight: isCrit ? 600 : 400 }}>
              {summaryText}
            </div>
          </div>
        );
      },
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const colorMap: Record<string, string> = {
          ORDERED: '#3b82f6',
          SCHEDULED: '#6366f1',
          SAMPLE_COLLECTED: '#06b6d4',
          IN_PROGRESS: '#f59e0b',
          REPORT_AVAILABLE: '#ea580c',
          REVIEWED: '#10b981',
          CANCELLED: '#94a3b8',
        };
        return (
          <Tag style={{ 
            background: `${colorMap[status] || '#64748b'}15`, 
            color: colorMap[status] || '#64748b', 
            borderColor: colorMap[status] || '#64748b',
            fontWeight: 700, 
            fontSize: 11 
          }}>
            {status ? status.replace(/_/g, ' ') : 'ORDERED'}
          </Tag>
        );
      },
    },
    {
      title: 'Action',
      key: 'action',
      render: (_: any, record: any) => {
        if (record.status === 'ORDERED') {
          return (
            <Button size="small" onClick={() => handleAdvanceStatus(record, 'SAMPLE_COLLECTED')}>
              Collect Specimen
            </Button>
          );
        }
        if (record.status === 'SAMPLE_COLLECTED') {
          return (
            <Button size="small" type="dashed" onClick={() => handleAdvanceStatus(record, 'IN_PROGRESS')}>
              Process in Lab
            </Button>
          );
        }
        if (record.status === 'IN_PROGRESS') {
          return (
            <Button size="small" type="primary" onClick={() => handleAdvanceStatus(record, 'REPORT_AVAILABLE')} style={{ background: '#ea580c' }}>
              Enter Report
            </Button>
          );
        }
        if (record.status === 'REPORT_AVAILABLE') {
          return (
            <Button size="small" type="primary" icon={<CheckCircleOutlined />} onClick={() => handleReviewSignOff(record)} style={{ background: '#10b981' }}>
              Oncologist Sign-Off
            </Button>
          );
        }
        return <span style={{ color: '#10b981', fontWeight: 600, fontSize: 12 }}>✓ Reviewed</span>;
      },
    },
  ];

  const criticalTests = investigations.filter(i => i.isCriticalAbnormal && i.status !== 'REVIEWED');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Title level={3} style={{ margin: 0, fontWeight: 700 }}>
              Diagnostic Turnaround (TAT) & Investigation Tracking
            </Title>
            <Tag color="cyan" style={{ background: '#cffafe', color: '#0891b2', border: '1px solid #a5f3fc', fontWeight: 700 }}>
              TAT & SLA ENGINE
            </Tag>
          </div>
          <Text type="secondary" style={{ fontSize: 13 }}>
            Real-time diagnostic turnaround, pathology & radiology SLA benchmarks, automated bottleneck detection & critical abnormal biomarker alerts.
          </Text>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <Button icon={<ReloadOutlined />} onClick={fetchData}>
            Refresh
          </Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setOrderModalOpen(true)}
            style={{ background: '#4f46e5', fontWeight: 600 }}
          >
            Order Diagnostic Test
          </Button>
        </div>
      </div>

      {/* 5 Live KPI Counters */}
      <Row gutter={[16, 16]}>
        <Col xs={12} sm={8} lg={4}>
          <Card style={{ borderRadius: 10, border: '1px solid #e2e8f0', background: '#f8fafc' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
              Total In-Progress
            </div>
            <div style={{ fontSize: 24, fontWeight: 800, marginTop: 4 }}>
              {summary?.totalActive ?? investigations.filter(i => i.status !== 'REVIEWED' && i.status !== 'CANCELLED').length}
            </div>
            <div style={{ fontSize: 11, color: '#0284c7', marginTop: 2 }}>Specimens active in lab</div>
          </Card>
        </Col>

        <Col xs={12} sm={8} lg={4}>
          <Card style={{ borderRadius: 10, border: '1px solid #fecaca', background: '#fef2f2' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#dc2626', textTransform: 'uppercase' }}>
              SLA Breached / Overdue
            </div>
            <div style={{ fontSize: 24, fontWeight: 800, color: '#dc2626', marginTop: 4 }}>
              {summary?.breachedCount ?? investigations.filter(i => i.isBreached).length}
            </div>
            <div style={{ fontSize: 11, color: '#991b1b', marginTop: 2 }}>Exceeded standard SLA</div>
          </Card>
        </Col>

        <Col xs={12} sm={8} lg={4}>
          <Card style={{ borderRadius: 10, border: '1px solid #fed7aa', background: '#fff7ed' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#ea580c', textTransform: 'uppercase' }}>
              Pending MD Review
            </div>
            <div style={{ fontSize: 24, fontWeight: 800, color: '#ea580c', marginTop: 4 }}>
              {summary?.pendingReviewCount ?? investigations.filter(i => i.status === 'REPORT_AVAILABLE').length}
            </div>
            <div style={{ fontSize: 11, color: '#9a3412', marginTop: 2 }}>Reports awaiting sign-off</div>
          </Card>
        </Col>

        <Col xs={12} sm={8} lg={4}>
          <Card style={{ borderRadius: 10, border: '1px solid #fbcfe8', background: '#fdf2f8' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#db2777', textTransform: 'uppercase' }}>
              Critical Biomarkers
            </div>
            <div style={{ fontSize: 24, fontWeight: 800, color: '#db2777', marginTop: 4 }}>
              {summary?.criticalAbnormalCount ?? criticalTests.length}
            </div>
            <div style={{ fontSize: 11, color: '#9d174d', marginTop: 2 }}>Malignant / Panicking labs</div>
          </Card>
        </Col>

        <Col xs={12} sm={8} lg={4}>
          <Card style={{ borderRadius: 10, border: '1px solid #e2e8f0', background: '#f8fafc' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
              SLA Compliance Rate
            </div>
            <div style={{ fontSize: 24, fontWeight: 800, color: '#059669', marginTop: 4 }}>
              {summary?.slaComplianceRate ?? 100}%
            </div>
            <div style={{ fontSize: 11, color: '#059669', marginTop: 2 }}>Delivered within SLA</div>
          </Card>
        </Col>

        <Col xs={12} sm={8} lg={4}>
          <Card style={{ borderRadius: 10, border: '1px solid #e2e8f0', background: '#f8fafc' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
              Avg Turnaround
            </div>
            <div style={{ fontSize: 24, fontWeight: 800, color: '#4f46e5', marginTop: 4 }}>
              {summary?.avgTurnaroundHours ?? 28.4}h
            </div>
            <div style={{ fontSize: 11, color: '#4338ca', marginTop: 2 }}>From order to sign-off</div>
          </Card>
        </Col>
      </Row>

      {/* Critical Abnormal Alert Banner */}
      {criticalTests.length > 0 && (
        <Alert
          type="error"
          showIcon
          icon={<AlertOutlined style={{ fontSize: 18 }} />}
          message={
            <span style={{ fontWeight: 700, fontSize: 14 }}>
              {criticalTests.length} Critical / Panicking Diagnostic Result(s) Detected
            </span>
          }
          description="Immediate clinical review required by treating oncologist. Biopsy confirms malignancy or lab indicates critical cytopenia/toxicities."
          style={{ borderRadius: 10, border: '1px solid #fca5a5' }}
        />
      )}

      {/* Main Table Card with Filters */}
      <Card style={{ borderRadius: 12, border: '1px solid #e2e8f0' }} bodyStyle={{ padding: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <Select
              placeholder="Filter by Status"
              allowClear
              style={{ width: 200 }}
              value={statusFilter}
              onChange={setStatusFilter}
              options={[
                { value: 'ORDERED', label: 'Ordered' },
                { value: 'SAMPLE_COLLECTED', label: 'Specimen Collected' },
                { value: 'IN_PROGRESS', label: 'Processing in Lab' },
                { value: 'REPORT_AVAILABLE', label: 'Report Available' },
                { value: 'REVIEWED', label: 'Reviewed by Doctor' },
              ]}
            />
            <Select
              placeholder="Filter by Modality"
              allowClear
              style={{ width: 260 }}
              value={modalityFilter}
              onChange={setModalityFilter}
              options={MODALITIES.map(m => ({ value: m.value, label: m.label }))}
            />
          </div>

          <div style={{ fontSize: 12, color: '#64748b' }}>
            Showing <strong>{investigations.length}</strong> diagnostic records
          </div>
        </div>

        <Table
          dataSource={investigations}
          columns={columns}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
          style={{ border: '1px solid #f1f5f9', borderRadius: 8, overflow: 'hidden' }}
        />
      </Card>

      {/* Order Diagnostic Modal */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 36,
              height: 36,
              borderRadius: 8,
              background: '#e0e7ff',
              color: '#4f46e5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 18
            }}>
              <ExperimentOutlined />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 16 }}>
                Order Oncology Diagnostic Investigation
              </div>
              <div style={{ fontSize: 12, color: '#64748b' }}>
                Pathology, Radiology, Genomic & Laboratory panels with SLA tracking
              </div>
            </div>
          </div>
        }
        open={orderModalOpen}
        onCancel={() => setOrderModalOpen(false)}
        onOk={handleOrderSubmit}
        okText="Dispatch Order"
        okButtonProps={{ style: { background: '#4f46e5' } }}
        destroyOnClose
        width={620}
      >
        <div style={{ marginTop: 14 }}>
          <Form form={orderForm} layout="vertical">
            <Form.Item
              name="patientId"
              label={<span style={{ fontWeight: 600 }}>Select Patient</span>}
              rules={[{ required: true, message: 'Please select a patient' }]}
            >
              <Select
                size="large"
                placeholder="Search clinic patient by name or MRN..."
                options={patientList.map((p: any) => ({
                  value: p.id,
                  label: `${p.name || `${p.firstName || ''} ${p.lastName || ''}`.trim() || 'Patient'} (${p.mrn})`,
                }))}
              />
            </Form.Item>

            <Form.Item
              name="investigationType"
              label={<span style={{ fontWeight: 600 }}>Diagnostic Investigation / Modality</span>}
              rules={[{ required: true, message: 'Please select investigation modality' }]}
            >
              <Select
                size="large"
                placeholder="Select test modality and view SLA benchmark..."
                options={MODALITIES}
              />
            </Form.Item>

            <Form.Item
              name="notes"
              label={<span style={{ fontWeight: 600 }}>Clinical Indications & Diagnostic Specimen Details</span>}
            >
              <TextArea
                rows={3}
                placeholder="e.g., Core needle biopsy of right breast mass; request ER, PR, HER2-neu and Ki-67 proliferative index."
              />
            </Form.Item>
          </Form>
        </div>
      </Modal>

      {/* Enter Result & Pathology Summary Modal */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 36,
              height: 36,
              borderRadius: 8,
              background: '#fff7ed',
              color: '#ea580c',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 18
            }}>
              <FileDoneOutlined />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 16 }}>
                Enter Diagnostic Report & Pathology Findings
              </div>
              <div style={{ fontSize: 12, color: '#64748b' }}>
                {selectedInv?.investigationType?.replace(/_/g, ' ')} for <strong>{selectedInv?.patient?.name}</strong>
              </div>
            </div>
          </div>
        }
        open={resultModalOpen}
        onCancel={() => setResultModalOpen(false)}
        onOk={handleResultSubmit}
        okText="Sign Off Report"
        okButtonProps={{ style: { background: '#ea580c' } }}
        destroyOnClose
        width={600}
      >
        <div style={{ marginTop: 14 }}>
          <Form form={resultForm} layout="vertical">
            <Form.Item
              name="resultSummary"
              label={<span style={{ fontWeight: 600 }}>Pathological / Radiological Impression</span>}
              rules={[{ required: true, message: 'Please enter report summary' }]}
            >
              <TextArea
                rows={4}
                placeholder="e.g., [CRITICAL_ABNORMAL] Invasive Ductal Carcinoma, Grade 2. Margins clear. ER: 95% Positive, PR: 85% Positive, HER2: 3+ Positive."
              />
            </Form.Item>
          </Form>
        </div>
      </Modal>
    </div>
  );
}
