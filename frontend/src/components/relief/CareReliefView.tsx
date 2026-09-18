'use client';

import React, { useState, useEffect } from 'react';
import {
  Card,
  Tabs,
  Row,
  Col,
  Typography,
  Tag,
  Button,
  Input,
  Select,
  Modal,
  Form,
  Radio,
  Alert,
  Space,
  Badge,
  Divider,
  message,
  Tooltip,
  Empty,
  Spin,
  Table,
  Statistic,
  Descriptions,
  List,
  Checkbox,
  Popconfirm,
} from 'antd';
import {
  BankOutlined,
  HeartOutlined,
  FileTextOutlined,
  SafetyCertificateOutlined,
  CheckCircleOutlined,
  DollarOutlined,
  SearchOutlined,
  PhoneOutlined,
  GlobalOutlined,
  EnvironmentOutlined,
  PrinterOutlined,
  PlusOutlined,
  TeamOutlined,
  ClockCircleOutlined,
  SolutionOutlined,
  InfoCircleOutlined,
  CheckSquareOutlined,
  UserOutlined,
  EditOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import {
  financialAidService,
  FinancialAidScheme,
  TreatmentCostEstimate,
  AidApplication,
  PhilanthropistDonor,
  ReliefSummaryMetrics,
  AidOrgCategory,
  AidApplicationStatus,
} from '@/services/financial-aid.service';
import { useAuthStore } from '@/stores/auth.store';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { TextArea } = Input;

export default function CareReliefView() {
  const user = useAuthStore((state) => state.user);
  const [activeTab, setActiveTab] = useState<string>('schemes');

  // Summary Metrics
  const [metrics, setMetrics] = useState<ReliefSummaryMetrics | null>(null);
  const [loadingMetrics, setLoadingMetrics] = useState<boolean>(false);

  // Schemes Directory State
  const [schemes, setSchemes] = useState<FinancialAidScheme[]>([]);
  const [loadingSchemes, setLoadingSchemes] = useState<boolean>(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedSchemeModal, setSelectedSchemeModal] = useState<FinancialAidScheme | null>(null);

  // Scheme Onboarding & Editing State (CRUD)
  const [schemeModalOpen, setSchemeModalOpen] = useState<boolean>(false);
  const [editingScheme, setEditingScheme] = useState<FinancialAidScheme | null>(null);
  const [schemeForm] = Form.useForm();
  const [savingScheme, setSavingScheme] = useState<boolean>(false);

  // Cost Estimate Generator State
  const [estimates, setEstimates] = useState<TreatmentCostEstimate[]>([]);
  const [loadingEstimates, setLoadingEstimates] = useState<boolean>(false);
  const [estimateForm] = Form.useForm();
  const [creatingEstimate, setCreatingEstimate] = useState<boolean>(false);
  const [selectedEstimateForView, setSelectedEstimateForView] = useState<TreatmentCostEstimate | null>(null);

  // Dynamic Calculation state in estimate form
  const [calcTotal, setCalcTotal] = useState<number>(350000);
  const [calcContribution, setCalcContribution] = useState<number>(50000);
  const [calcDeficit, setCalcDeficit] = useState<number>(300000);

  // Application Tracker State
  const [applications, setApplications] = useState<AidApplication[]>([]);
  const [loadingApplications, setLoadingApplications] = useState<boolean>(false);
  const [applyModalOpen, setApplyModalOpen] = useState<boolean>(false);
  const [applyForm] = Form.useForm();
  const [submittingApply, setSubmittingApply] = useState<boolean>(false);
  const [statusModalOpen, setStatusModalOpen] = useState<boolean>(false);
  const [selectedAppForStatus, setSelectedAppForStatus] = useState<AidApplication | null>(null);
  const [statusForm] = Form.useForm();
  const [updatingStatus, setUpdatingStatus] = useState<boolean>(false);

  // Donors State
  const [donors, setDonors] = useState<PhilanthropistDonor[]>([]);
  const [loadingDonors, setLoadingDonors] = useState<boolean>(false);
  const [pledgeModalOpen, setPledgeModalOpen] = useState<boolean>(false);
  const [selectedDonorForPledge, setSelectedDonorForPledge] = useState<PhilanthropistDonor | null>(null);
  const [pledgeForm] = Form.useForm();
  const [submittingPledge, setSubmittingPledge] = useState<boolean>(false);

  // 1. Initial Data Load
  useEffect(() => {
    loadSummary();
    loadSchemes();
    loadEstimates();
    loadApplications();
    loadDonors();
  }, []);

  const loadSummary = async () => {
    setLoadingMetrics(true);
    try {
      const data = await financialAidService.getSummary();
      setMetrics(data);
    } catch (err) {
      // silent
    } finally {
      setLoadingMetrics(false);
    }
  };

  const loadSchemes = async (category?: string, query?: string) => {
    setLoadingSchemes(true);
    try {
      const cat = category && category !== 'ALL' ? (category as AidOrgCategory) : undefined;
      const data = await financialAidService.getSchemes(cat, query || undefined);
      setSchemes(data);
    } catch (err) {
      message.error('Failed to load financial aid schemes');
    } finally {
      setLoadingSchemes(false);
    }
  };

  const handleOpenOnboardScheme = () => {
    setEditingScheme(null);
    schemeForm.resetFields();
    schemeForm.setFieldsValue({
      category: AidOrgCategory.TEMPLE_TRUST,
      processingDays: 14,
      requiredDocumentsText: `Ration Card (Yellow/Orange/White)
Income Certificate from Tahsildar / SDO (< ₹2,50,000/yr)
Hospital Doctor Treatment Protocol & Cost Estimate on letterhead
Patient & Family Aadhaar Card copies
Cancer Histopathology / Biopsy / PET-CT Report
Cancelled Cheque or Bank Passbook copy of the Hospital`,
      stepByStepProcedure: `1. Obtain official Treatment Cost Estimate & Medical Certificate signed by the Treating Oncologist and Hospital Medical Superintendent.
2. Complete the financial grant requisition form and attach income certificate, ration card, and diagnostic reports.
3. Submit the completed application dossier at the trust aid desk or upload to official portal.
4. Social work scrutiny and verification committee reviews the financial deficit.
5. Sanction letter issued and grant amount disbursed directly to the Hospital's Cancer Care account via RTGS/Cheque.`,
    });
    setSchemeModalOpen(true);
  };

  const handleOpenEditScheme = (scheme: FinancialAidScheme) => {
    setEditingScheme(scheme);
    schemeForm.resetFields();
    schemeForm.setFieldsValue({
      name: scheme.name,
      nameRegional: scheme.nameRegional,
      category: scheme.category,
      organizationName: scheme.organizationName,
      maxGrantAmount: scheme.maxGrantAmount,
      benefitDescription: scheme.benefitDescription,
      incomeLimitAnnual: scheme.incomeLimitAnnual,
      eligibleRationCards: scheme.eligibleRationCards,
      eligibleHospitals: scheme.eligibleHospitals,
      helplineNumber: scheme.helplineNumber,
      officialPortalUrl: scheme.officialPortalUrl,
      physicalAddress: scheme.physicalAddress,
      stepByStepProcedure: scheme.stepByStepProcedure,
      requiredDocumentsText: scheme.requiredDocuments?.join('\n') || '',
      processingDays: scheme.processingDays,
    });
    setSchemeModalOpen(true);
  };

  const handleSaveScheme = async (values: any) => {
    setSavingScheme(true);
    try {
      const docsArray = typeof values.requiredDocumentsText === 'string'
        ? values.requiredDocumentsText.split('\n').map((s: string) => s.trim()).filter((s: string) => s.length > 0)
        : [];

      const payload = {
        name: values.name,
        nameRegional: values.nameRegional || undefined,
        category: values.category,
        organizationName: values.organizationName,
        maxGrantAmount: values.maxGrantAmount ? Number(values.maxGrantAmount) : undefined,
        benefitDescription: values.benefitDescription,
        incomeLimitAnnual: values.incomeLimitAnnual ? Number(values.incomeLimitAnnual) : undefined,
        eligibleRationCards: values.eligibleRationCards || undefined,
        eligibleHospitals: values.eligibleHospitals || undefined,
        helplineNumber: values.helplineNumber || undefined,
        officialPortalUrl: values.officialPortalUrl || undefined,
        physicalAddress: values.physicalAddress || undefined,
        stepByStepProcedure: values.stepByStepProcedure,
        requiredDocuments: docsArray,
        processingDays: values.processingDays ? Number(values.processingDays) : undefined,
      };

      if (editingScheme) {
        await financialAidService.updateScheme(editingScheme.id, payload);
        message.success('Aid scheme/trust updated successfully!');
      } else {
        await financialAidService.createScheme(payload);
        message.success('Aid scheme/trust onboarded successfully!');
      }

      setSchemeModalOpen(false);
      schemeForm.resetFields();
      loadSchemes(selectedCategory, searchQuery);
      loadSummary();
    } catch (err: any) {
      message.error(err?.response?.data?.message || 'Failed to save scheme');
    } finally {
      setSavingScheme(false);
    }
  };

  const handleDeleteScheme = async (schemeId: string) => {
    try {
      await financialAidService.deleteScheme(schemeId);
      message.success('Aid scheme removed successfully');
      loadSchemes(selectedCategory, searchQuery);
      loadSummary();
    } catch (err: any) {
      message.error(err?.response?.data?.message || 'Failed to delete scheme');
    }
  };

  const loadEstimates = async () => {
    setLoadingEstimates(true);
    try {
      const data = await financialAidService.getEstimates();
      setEstimates(data);
    } catch (err) {
      // silent
    } finally {
      setLoadingEstimates(false);
    }
  };

  const loadApplications = async () => {
    setLoadingApplications(true);
    try {
      const data = await financialAidService.getApplications();
      setApplications(data);
    } catch (err) {
      // silent
    } finally {
      setLoadingApplications(false);
    }
  };

  const loadDonors = async () => {
    setLoadingDonors(true);
    try {
      const data = await financialAidService.getDonors();
      setDonors(data);
    } catch (err) {
      // silent
    } finally {
      setLoadingDonors(false);
    }
  };

  // Re-calculate deficit whenever total or contribution changes
  const handleCostFieldChange = () => {
    const values = estimateForm.getFieldsValue();
    const surgery = Number(values.surgeryCost || 0);
    const chemo = Number(values.chemoCost || 0);
    const radiation = Number(values.radiationCost || 0);
    const targeted = Number(values.targetedMedCost || 0);
    const icu = Number(values.icuBedCost || 0);
    const inv = Number(values.investigationCost || 0);
    const total = surgery + chemo + radiation + targeted + icu + inv;
    const contribution = Number(values.patientContribution || 0);
    const deficit = Math.max(0, total - contribution);

    setCalcTotal(total);
    setCalcContribution(contribution);
    setCalcDeficit(deficit);
    estimateForm.setFieldsValue({
      totalEstimatedCost: total,
      netDeficitRequired: deficit,
    });
  };

  // Handle Estimate Submission
  const handleSaveEstimate = async (values: any) => {
    setCreatingEstimate(true);
    try {
      const created = await financialAidService.createEstimate({
        patientName: values.patientName,
        cancerType: values.cancerType,
        cancerStage: values.cancerStage,
        hospitalName: values.hospitalName,
        treatingDoctorName: values.treatingDoctorName,
        treatingDoctorRegNo: values.treatingDoctorRegNo,
        surgeryCost: Number(values.surgeryCost || 0),
        chemoCost: Number(values.chemoCost || 0),
        radiationCost: Number(values.radiationCost || 0),
        targetedMedCost: Number(values.targetedMedCost || 0),
        icuBedCost: Number(values.icuBedCost || 0),
        investigationCost: Number(values.investigationCost || 0),
        totalEstimatedCost: calcTotal,
        patientContribution: calcContribution,
        netDeficitRequired: calcDeficit,
        clinicalJustification: values.clinicalJustification,
        hospitalAccountName: values.hospitalAccountName,
        hospitalBankName: values.hospitalBankName,
        hospitalAccountNumber: values.hospitalAccountNumber,
        hospitalIfscCode: values.hospitalIfscCode,
      });
      message.success(`Estimate ${created.estimateNumber} generated successfully!`);
      setSelectedEstimateForView(created);
      estimateForm.resetFields();
      loadEstimates();
      loadSummary();
    } catch (err: any) {
      message.error(err?.response?.data?.message || 'Failed to create estimate dossier');
    } finally {
      setCreatingEstimate(false);
    }
  };

  // Handle Application Submission
  const handleOpenApplyModal = (scheme?: FinancialAidScheme) => {
    if (scheme) {
      applyForm.setFieldsValue({
        schemeId: scheme.id,
        appliedAmount: scheme.maxGrantAmount || 100000,
      });
    }
    setApplyModalOpen(true);
  };

  const handleSubmitApplication = async (values: any) => {
    setSubmittingApply(true);
    try {
      await financialAidService.createApplication({
        schemeId: values.schemeId,
        estimateId: values.estimateId || undefined,
        applicantName: values.applicantName,
        applicantRelation: values.applicantRelation,
        applicantContact: values.applicantContact,
        appliedAmount: Number(values.appliedAmount),
        remarks: values.remarks,
      });
      message.success('Aid application successfully submitted!');
      setApplyModalOpen(false);
      applyForm.resetFields();
      loadApplications();
      loadSummary();
    } catch (err: any) {
      message.error(err?.response?.data?.message || 'Failed to submit aid application');
    } finally {
      setSubmittingApply(false);
    }
  };

  // Handle Status Update
  const handleOpenStatusModal = (app: AidApplication) => {
    setSelectedAppForStatus(app);
    statusForm.setFieldsValue({
      status: app.status,
      sanctionedAmount: app.sanctionedAmount || app.appliedAmount,
      applicationRefNumber: app.applicationRefNumber,
      sanctionLetterNumber: app.sanctionLetterNumber,
      remarks: app.remarks,
    });
    setStatusModalOpen(true);
  };

  const handleUpdateStatus = async (values: any) => {
    if (!selectedAppForStatus) return;
    setUpdatingStatus(true);
    try {
      await financialAidService.updateApplicationStatus(selectedAppForStatus.id, {
        status: values.status,
        sanctionedAmount: Number(values.sanctionedAmount || 0),
        applicationRefNumber: values.applicationRefNumber,
        sanctionLetterNumber: values.sanctionLetterNumber,
        remarks: values.remarks,
      });
      message.success('Application status updated successfully!');
      setStatusModalOpen(false);
      loadApplications();
      loadSummary();
    } catch (err: any) {
      message.error('Failed to update status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  // Handle Donor Pledge
  const handleOpenPledgeModal = (donor: PhilanthropistDonor) => {
    setSelectedDonorForPledge(donor);
    pledgeForm.setFieldsValue({
      pledgedAmount: 50000,
    });
    setPledgeModalOpen(true);
  };

  const handleCreatePledge = async (values: any) => {
    if (!selectedDonorForPledge) return;
    setSubmittingPledge(true);
    try {
      await financialAidService.createDonorPledge({
        donorId: selectedDonorForPledge.id,
        pledgedAmount: Number(values.pledgedAmount),
        transactionRef: values.transactionRef,
        note: values.note,
      });
      message.success('Sponsorship pledge recorded successfully!');
      setPledgeModalOpen(false);
      pledgeForm.resetFields();
      loadDonors();
      loadSummary();
    } catch (err: any) {
      message.error('Failed to record pledge');
    } finally {
      setSubmittingPledge(false);
    }
  };

  const formatCurrency = (amt?: number | null) => {
    if (amt === null || amt === undefined) return 'N/A';
    return `₹${amt.toLocaleString('en-IN')}`;
  };

  const getCategoryColor = (cat: AidOrgCategory) => {
    switch (cat) {
      case AidOrgCategory.GOVT_STATE_MAHARASHTRA:
        return 'orange';
      case AidOrgCategory.GOVT_CENTRAL:
        return 'blue';
      case AidOrgCategory.TEMPLE_TRUST:
        return 'gold';
      case AidOrgCategory.CHARITABLE_FOUNDATION:
        return 'purple';
      case AidOrgCategory.CORPORATE_CSR:
        return 'cyan';
      default:
        return 'default';
    }
  };

  const getStatusColor = (status: AidApplicationStatus) => {
    switch (status) {
      case AidApplicationStatus.SANCTIONED:
      case AidApplicationStatus.DISBURSED:
        return 'green';
      case AidApplicationStatus.UNDER_REVIEW:
        return 'processing';
      case AidApplicationStatus.DOCS_REQUIRED:
        return 'warning';
      case AidApplicationStatus.REJECTED:
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Luminous Frosted Glass Hero Command Banner */}
      <div className="glass-hero" style={{ padding: '28px 36px' }}>
        <Row gutter={[24, 20]} align="middle" justify="space-between">
          <Col xs={24} md={15}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 8 }}>
              <div
                style={{
                  background: 'rgba(255, 255, 255, 0.18)',
                  backdropFilter: 'blur(10px)',
                  WebkitBackdropFilter: 'blur(10px)',
                  borderRadius: 12,
                  width: 46,
                  height: 46,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 24,
                  color: '#fbbf24',
                  boxShadow: '0 4px 16px rgba(245, 158, 11, 0.3)',
                }}
              >
                <BankOutlined />
              </div>
              <div>
                <Title level={3} style={{ color: '#ffffff', margin: 0, fontWeight: 800, letterSpacing: '-0.02em' }}>
                  CareRelief
                </Title>
                <Text style={{ color: '#99f6e4', fontSize: 13, fontWeight: 600 }}>
                  Financial Aid, Government Relief Schemes & Temple Trust Grants Navigator
                </Text>
              </div>
            </div>
            <Paragraph style={{ color: '#e2e8f0', fontSize: 13.5, margin: '8px 0 0', maxWidth: 740, lineHeight: 1.6 }}>
              Comprehensive funding directory connecting cancer patients with <b>CMRF Maharashtra, PMNRF, Lalbaugcha Raja Mandal, Siddhivinayak Trust, MJPJAY</b>, and philanthropic sponsors. Generate official treatment cost dossiers and track grants in one place.
            </Paragraph>
          </Col>

          <Col xs={24} md={9} style={{ textAlign: 'right' }}>
            <div style={{ display: 'inline-flex', gap: 12, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
              <div className="glass-stat-widget" style={{ minWidth: 100 }}>
                <div style={{ fontSize: 22, fontWeight: 800, color: '#fbbf24' }}>
                  {metrics?.totalSchemes || 12}
                </div>
                <div style={{ fontSize: 11, color: '#cbd5e1', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Verified Schemes</div>
              </div>

              <div className="glass-stat-widget" style={{ minWidth: 120 }}>
                <div style={{ fontSize: 22, fontWeight: 800, color: '#34d399' }}>
                  {formatCurrency(metrics?.totalSanctionedAmount || 0)}
                </div>
                <div style={{ fontSize: 11, color: '#cbd5e1', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Sanctioned Funds</div>
              </div>

              <div className="glass-stat-widget" style={{ minWidth: 95 }}>
                <div style={{ fontSize: 22, fontWeight: 800, color: '#38bdf8' }}>
                  {metrics?.totalDonors || 4}
                </div>
                <div style={{ fontSize: 11, color: '#cbd5e1', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Angel Donors</div>
              </div>
            </div>
          </Col>
        </Row>
      </div>

      {/* Main Tabs Workspace (Glassified) */}
      <Card
        className="glass-card"
        style={{ borderRadius: 18 }}
        styles={{ body: { padding: '20px 24px' } }}
      >
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={[
            {
              key: 'schemes',
              label: (
                <span style={{ fontWeight: 600, fontSize: 14 }}>
                  <BankOutlined /> Schemes & Temple Trusts Directory ({schemes.length})
                </span>
              ),
              children: (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                  {/* Category Filter & Search Bar (Glass Panel) */}
                  <div
                    className="glass-panel"
                    style={{
                      padding: '16px 20px',
                      borderRadius: 14,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: 12,
                    }}
                  >
                    <Radio.Group
                      value={selectedCategory}
                      onChange={(e) => {
                        setSelectedCategory(e.target.value);
                        loadSchemes(e.target.value, searchQuery);
                      }}
                      buttonStyle="solid"
                    >
                      <Radio.Button value="ALL">All Sources ({schemes.length})</Radio.Button>
                      <Radio.Button value={AidOrgCategory.GOVT_STATE_MAHARASHTRA}>🏛️ Maharashtra Govt</Radio.Button>
                      <Radio.Button value={AidOrgCategory.TEMPLE_TRUST}>🛕 Temple Trusts</Radio.Button>
                      <Radio.Button value={AidOrgCategory.GOVT_CENTRAL}>🇮🇳 Central Govt</Radio.Button>
                      <Radio.Button value={AidOrgCategory.CHARITABLE_FOUNDATION}>🎗️ Foundations & NGOs</Radio.Button>
                      <Radio.Button value={AidOrgCategory.CORPORATE_CSR}>🏢 Corporate CSR</Radio.Button>
                    </Radio.Group>

                    <Space wrap>
                      <Input
                        prefix={<SearchOutlined style={{ color: '#0d9488' }} />}
                        placeholder="Search scheme name, temple trust, city..."
                        value={searchQuery}
                        onChange={(e) => {
                          setSearchQuery(e.target.value);
                          loadSchemes(selectedCategory, e.target.value);
                        }}
                        style={{
                          width: 280,
                          borderRadius: 20,
                          background: 'rgba(255, 255, 255, 0.65)',
                          backdropFilter: 'blur(8px)',
                        }}
                        allowClear
                      />
                      <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={handleOpenOnboardScheme}
                        style={{
                          background: 'linear-gradient(135deg, #0d9488 0%, #0f766e 100%)',
                          borderColor: 'transparent',
                          fontWeight: 600,
                          borderRadius: 20,
                          boxShadow: '0 4px 12px rgba(13, 148, 136, 0.28)',
                        }}
                      >
                        + Onboard Temple / CSR / Trust
                      </Button>
                    </Space>
                  </div>

                  {/* Schemes Cards Grid */}
                  {loadingSchemes ? (
                    <div style={{ textAlign: 'center', padding: '60px 0' }}>
                      <Spin size="large" />
                    </div>
                  ) : schemes.length === 0 ? (
                    <Empty description="No schemes found matching your search." style={{ padding: '40px 0' }} />
                  ) : (
                    <Row gutter={[20, 20]}>
                      {schemes.map((scheme) => (
                        <Col xs={24} md={12} key={scheme.id}>
                          <Card
                            className="glass-card"
                            hoverable
                            style={{
                              borderRadius: 16,
                              height: '100%',
                              display: 'flex',
                              flexDirection: 'column',
                            }}
                            styles={{ body: { padding: 22, flex: 1, display: 'flex', flexDirection: 'column' } }}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                              <div style={{ flex: 1, paddingRight: 8 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginBottom: 6 }}>
                                  <Tag color={getCategoryColor(scheme.category)} style={{ fontWeight: 700, fontSize: 11, margin: 0, borderRadius: 6 }}>
                                    {scheme.category.replace(/_/g, ' ')}
                                  </Tag>
                                  {scheme.organizationName && (
                                    <Tag color="cyan" style={{ fontSize: 11, margin: 0, borderRadius: 6 }}>
                                      {scheme.organizationName}
                                    </Tag>
                                  )}
                                </div>
                                <Title level={5} style={{ margin: '4px 0 2px 0', color: '#0f172a', fontWeight: 700, fontSize: 16 }}>
                                  {scheme.name}
                                </Title>
                                {scheme.nameRegional && (
                                  <div style={{ fontSize: 12.5, color: '#0d9488', fontWeight: 600, marginTop: 2 }}>
                                    {scheme.nameRegional}
                                  </div>
                                )}
                              </div>

                              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
                                <Tag
                                  color="green"
                                  style={{
                                    fontSize: 13,
                                    fontWeight: 800,
                                    padding: '4px 12px',
                                    borderRadius: 12,
                                    border: '1px solid rgba(74, 222, 128, 0.4)',
                                    background: 'rgba(240, 253, 244, 0.85)',
                                    backdropFilter: 'blur(6px)',
                                    color: '#15803d',
                                    margin: 0,
                                    boxShadow: '0 2px 6px rgba(22, 101, 52, 0.08)',
                                  }}
                                >
                                  {scheme.maxGrantAmount ? `Up to ${formatCurrency(scheme.maxGrantAmount)}` : '100% Cashless'}
                                </Tag>
                                <Space size={4}>
                                  <Tooltip title="Edit Scheme / Trust Information">
                                    <Button
                                      type="text"
                                      size="small"
                                      icon={<EditOutlined style={{ color: '#0d9488', fontSize: 14 }} />}
                                      onClick={() => handleOpenEditScheme(scheme)}
                                    />
                                  </Tooltip>
                                  <Popconfirm
                                    title="Delete Scheme / Trust"
                                    description="Are you sure you want to remove this aid scheme?"
                                    onConfirm={() => handleDeleteScheme(scheme.id)}
                                    okText="Yes, Delete"
                                    cancelText="Cancel"
                                    okButtonProps={{ danger: true }}
                                  >
                                    <Button
                                      type="text"
                                      size="small"
                                      danger
                                      icon={<DeleteOutlined style={{ fontSize: 14 }} />}
                                    />
                                  </Popconfirm>
                                </Space>
                              </div>
                            </div>

                            <Paragraph
                              ellipsis={{ rows: 2 }}
                              style={{ fontSize: 13, color: '#475569', lineHeight: 1.55, margin: '8px 0 14px 0' }}
                            >
                              {scheme.benefitDescription}
                            </Paragraph>

                            {/* Eligibility Specs (Frosted Glass Panel) */}
                            <div
                              style={{
                                background: 'rgba(255, 255, 255, 0.55)',
                                border: '1px solid rgba(255, 255, 255, 0.75)',
                                borderRadius: 10,
                                padding: '12px 14px',
                                fontSize: 12,
                                color: '#334155',
                                marginBottom: 16,
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 6,
                                backdropFilter: 'blur(8px)',
                                boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.8)',
                              }}
                            >
                              {scheme.incomeLimitAnnual && (
                                <div>
                                  <b>Income Ceiling:</b> Under {formatCurrency(scheme.incomeLimitAnnual)} / year
                                </div>
                              )}
                              {scheme.eligibleRationCards && (
                                <div>
                                  <b>Ration Card:</b> {scheme.eligibleRationCards}
                                </div>
                              )}
                              {scheme.helplineNumber && (
                                <div>
                                  <PhoneOutlined style={{ color: '#0d9488' }} /> <b>Helpline:</b> {scheme.helplineNumber}
                                </div>
                              )}
                            </div>

                            {/* Action Buttons */}
                            <div style={{ marginTop: 'auto', display: 'flex', gap: 10 }}>
                              <Button
                                block
                                icon={<SolutionOutlined />}
                                onClick={() => setSelectedSchemeModal(scheme)}
                                style={{
                                  borderRadius: 10,
                                  fontWeight: 600,
                                  background: 'rgba(255, 255, 255, 0.7)',
                                  backdropFilter: 'blur(6px)',
                                  border: '1px solid rgba(226, 232, 240, 0.8)',
                                }}
                              >
                                View Procedure & Checklist
                              </Button>
                              <Button
                                type="primary"
                                icon={<PlusOutlined />}
                                onClick={() => handleOpenApplyModal(scheme)}
                                style={{
                                  borderRadius: 10,
                                  fontWeight: 600,
                                  background: 'linear-gradient(135deg, #0d9488 0%, #0f766e 100%)',
                                  borderColor: 'transparent',
                                  boxShadow: '0 4px 12px rgba(13, 148, 136, 0.28)',
                                }}
                              >
                                Apply for Aid
                              </Button>
                            </div>
                          </Card>
                        </Col>
                      ))}
                    </Row>
                  )}
                </div>
              ),
            },
            {
              key: 'estimate',
              label: (
                <span style={{ fontWeight: 600, fontSize: 14 }}>
                  <FileTextOutlined /> 1-Click Treatment Cost Dossier Generator ({estimates.length})
                </span>
              ),
              children: (
                <Row gutter={[24, 24]}>
                  {/* Left Column: Cost Calculation Form */}
                  <Col xs={24} lg={14}>
                    <Card
                      className="glass-card"
                      title={
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <DollarOutlined style={{ color: '#0d9488' }} />
                          <span>Generate Official Hospital Cost Estimate Certificate (वैद्यकीय खर्चाचे अंदाजपत्रक)</span>
                        </div>
                      }
                      style={{ borderRadius: 16 }}
                      styles={{ body: { padding: 24 } }}
                    >
                      <Form form={estimateForm} layout="vertical" onFinish={handleSaveEstimate}>
                        <Row gutter={16}>
                          <Col xs={24} sm={12}>
                            <Form.Item name="patientName" label="Patient Full Name" rules={[{ required: true }]}>
                              <Input placeholder="e.g. Parvati More" />
                            </Form.Item>
                          </Col>
                          <Col xs={24} sm={12}>
                            <Form.Item name="cancerType" label="Cancer Diagnosis" rules={[{ required: true }]}>
                              <Input placeholder="e.g. Mid-Thoracic Esophageal Cancer" />
                            </Form.Item>
                          </Col>
                        </Row>

                        <Row gutter={16}>
                          <Col xs={24} sm={12}>
                            <Form.Item name="cancerStage" label="TNM Clinical Stage">
                              <Input placeholder="e.g. cT3 N1 M0 • Stage III" />
                            </Form.Item>
                          </Col>
                          <Col xs={24} sm={12}>
                            <Form.Item name="hospitalName" label="Treating Hospital" rules={[{ required: true }]}>
                              <Input placeholder="e.g. City Comprehensive Cancer Center / TMH" />
                            </Form.Item>
                          </Col>
                        </Row>

                        <Row gutter={16}>
                          <Col xs={24} sm={12}>
                            <Form.Item name="treatingDoctorName" label="Consultant Oncologist" rules={[{ required: true }]}>
                              <Input placeholder="e.g. Dr. Priya Mehta, M.Ch (Surgical Oncology)" />
                            </Form.Item>
                          </Col>
                          <Col xs={24} sm={12}>
                            <Form.Item name="treatingDoctorRegNo" label="Medical Council Reg. No.">
                              <Input placeholder="e.g. MMC-2012/05/1429" />
                            </Form.Item>
                          </Col>
                        </Row>

                        <Divider orientation="left" style={{ fontSize: 13, color: '#0d9488', fontWeight: 700 }}>
                          Itemized Hospital Treatment Expenses (in ₹)
                        </Divider>

                        <Row gutter={16}>
                          <Col xs={24} sm={8}>
                            <Form.Item name="surgeryCost" label="Surgery & Anesthesia">
                              <Input type="number" placeholder="120000" onChange={handleCostFieldChange} />
                            </Form.Item>
                          </Col>
                          <Col xs={24} sm={8}>
                            <Form.Item name="chemoCost" label="Chemotherapy Cycles">
                              <Input type="number" placeholder="90000" onChange={handleCostFieldChange} />
                            </Form.Item>
                          </Col>
                          <Col xs={24} sm={8}>
                            <Form.Item name="radiationCost" label="Radiation Therapy (IMRT)">
                              <Input type="number" placeholder="80000" onChange={handleCostFieldChange} />
                            </Form.Item>
                          </Col>
                        </Row>

                        <Row gutter={16}>
                          <Col xs={24} sm={8}>
                            <Form.Item name="targetedMedCost" label="Specialty / Targeted Meds">
                              <Input type="number" placeholder="30000" onChange={handleCostFieldChange} />
                            </Form.Item>
                          </Col>
                          <Col xs={24} sm={8}>
                            <Form.Item name="icuBedCost" label="ICU / Room Stay">
                              <Input type="number" placeholder="20000" onChange={handleCostFieldChange} />
                            </Form.Item>
                          </Col>
                          <Col xs={24} sm={8}>
                            <Form.Item name="investigationCost" label="Diagnostics & PET-CT">
                              <Input type="number" placeholder="10000" onChange={handleCostFieldChange} />
                            </Form.Item>
                          </Col>
                        </Row>

                        <Row gutter={16}>
                          <Col xs={24} sm={12}>
                            <Form.Item name="patientContribution" label="Amount Arranged / Self-Funded by Family (₹)">
                              <Input type="number" placeholder="50000" onChange={handleCostFieldChange} />
                            </Form.Item>
                          </Col>
                          <Col xs={24} sm={12}>
                            <Form.Item
                              name="clinicalJustification"
                              label="Doctor Clinical Justification"
                              rules={[{ required: true }]}
                            >
                              <Input placeholder="Curative intent multimodal chemo-radiotherapy followed by surgery." />
                            </Form.Item>
                          </Col>
                        </Row>

                        {/* Deficit Banner (Frosted Glass) */}
                        <div
                          style={{
                            background: 'rgba(204, 251, 241, 0.45)',
                            border: '1px solid rgba(45, 212, 191, 0.4)',
                            borderRadius: 14,
                            padding: '16px 20px',
                            marginBottom: 18,
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            backdropFilter: 'blur(10px)',
                            boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.8)',
                          }}
                        >
                          <div>
                            <div style={{ fontSize: 12, color: '#0f766e', fontWeight: 700, letterSpacing: '0.04em' }}>
                              CALCULATED FINANCIAL DEFICIT NEEDED FROM TRUST
                            </div>
                            <div style={{ fontSize: 11.5, color: '#64748b', marginTop: 2 }}>
                              Total Estimated Cost ({formatCurrency(calcTotal)}) − Family Contribution ({formatCurrency(calcContribution)})
                            </div>
                          </div>
                          <div style={{ fontSize: 24, fontWeight: 800, color: '#0d9488' }}>
                            {formatCurrency(calcDeficit)}
                          </div>
                        </div>

                        <Divider orientation="left" style={{ fontSize: 13, color: '#64748b' }}>
                          Hospital Bank RTGS Details (For Direct Trust Transfer)
                        </Divider>

                        <Row gutter={16}>
                          <Col xs={24} sm={12}>
                            <Form.Item name="hospitalAccountName" label="Hospital Beneficiary Name">
                              <Input placeholder="City Comprehensive Cancer Trust Fund" />
                            </Form.Item>
                          </Col>
                          <Col xs={24} sm={12}>
                            <Form.Item name="hospitalAccountNumber" label="Bank Account Number">
                              <Input placeholder="38291048291" />
                            </Form.Item>
                          </Col>
                          <Col xs={24} sm={12}>
                            <Form.Item name="hospitalBankName" label="Bank Name & Branch">
                              <Input placeholder="State Bank of India, Medical Campus" />
                            </Form.Item>
                          </Col>
                          <Col xs={24} sm={12}>
                            <Form.Item name="hospitalIfscCode" label="IFSC Code">
                              <Input placeholder="SBIN0000412" />
                            </Form.Item>
                          </Col>
                        </Row>

                        <Button
                          type="primary"
                          htmlType="submit"
                          loading={creatingEstimate}
                          icon={<PrinterOutlined />}
                          style={{
                            background: 'linear-gradient(135deg, #0d9488 0%, #0f766e 100%)',
                            borderColor: 'transparent',
                            height: 44,
                            width: '100%',
                            fontWeight: 700,
                            borderRadius: 12,
                            boxShadow: '0 4px 14px rgba(13, 148, 136, 0.3)',
                          }}
                        >
                          Compile & Generate Official Treatment Cost Dossier
                        </Button>
                      </Form>
                    </Card>
                  </Col>

                  {/* Right Column: Existing Generated Estimates */}
                  <Col xs={24} lg={10}>
                    <Card
                      className="glass-card"
                      title={
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <CheckCircleOutlined style={{ color: '#10b981' }} />
                          <span>Generated Cost Dossiers ({estimates.length})</span>
                        </div>
                      }
                      style={{ borderRadius: 16, minHeight: 450 }}
                      styles={{ body: { padding: 20 } }}
                    >
                      {loadingEstimates ? (
                        <div style={{ textAlign: 'center', padding: '40px 0' }}><Spin /></div>
                      ) : estimates.length === 0 ? (
                        <Empty description="No cost estimates generated yet. Fill out the form on the left to compile your first treatment cost certificate." />
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                          {estimates.map((est) => (
                            <div
                              key={est.id}
                              style={{
                                border: '1px solid rgba(255, 255, 255, 0.75)',
                                borderRadius: 14,
                                padding: 16,
                                background: 'rgba(255, 255, 255, 0.55)',
                                backdropFilter: 'blur(10px)',
                                boxShadow: '0 4px 12px rgba(15, 23, 42, 0.04)',
                              }}
                            >
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div>
                                  <Tag color="cyan" style={{ fontWeight: 700, borderRadius: 6 }}>{est.estimateNumber}</Tag>
                                  <div style={{ fontWeight: 700, fontSize: 14, color: '#0f172a', marginTop: 4 }}>
                                    {est.patientName}
                                  </div>
                                  <div style={{ fontSize: 12, color: '#64748b' }}>
                                    {est.cancerType} {est.cancerStage ? `• ${est.cancerStage}` : ''}
                                  </div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                  <div style={{ fontSize: 11, color: '#94a3b8' }}>Deficit Required</div>
                                  <div style={{ fontSize: 16, fontWeight: 800, color: '#0d9488' }}>
                                    {formatCurrency(est.netDeficitRequired)}
                                  </div>
                                </div>
                              </div>

                              <Divider style={{ margin: '10px 0' }} />

                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: 11, color: '#64748b' }}>
                                  Doctor: <b>{est.treatingDoctorName}</b>
                                </span>
                                <Space>
                                  <Button
                                    size="small"
                                    icon={<PrinterOutlined />}
                                    onClick={() => setSelectedEstimateForView(est)}
                                    style={{ borderRadius: 8 }}
                                  >
                                    View Certificate
                                  </Button>
                                  <Button
                                    size="small"
                                    type="primary"
                                    onClick={() => {
                                      applyForm.setFieldsValue({
                                        estimateId: est.id,
                                        appliedAmount: est.netDeficitRequired,
                                        applicantName: `${est.patientName}'s Family`,
                                      });
                                      setApplyModalOpen(true);
                                    }}
                                    style={{ background: '#0d9488', borderRadius: 8 }}
                                  >
                                    Apply
                                  </Button>
                                </Space>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </Card>
                  </Col>
                </Row>
              ),
            },
            {
              key: 'applications',
              label: (
                <span style={{ fontWeight: 600, fontSize: 14 }}>
                  <SolutionOutlined /> Multi-Scheme Application & Sanction Tracker ({applications.length})
                </span>
              ),
              children: (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <Title level={5} style={{ margin: 0, color: '#0f172a' }}>
                        Live Application Tracking Across Government Funds & Temple Trusts
                      </Title>
                      <Text style={{ fontSize: 12, color: '#64748b' }}>
                        Track files submitted to CMRF Maharashtra, Lalbaugcha Raja Mandal, Siddhivinayak, PMNRF, and MJPJAY.
                      </Text>
                    </div>

                    <Button
                      type="primary"
                      icon={<PlusOutlined />}
                      onClick={() => handleOpenApplyModal()}
                      style={{ background: '#0d9488', borderColor: '#0d9488', fontWeight: 600 }}
                    >
                      Submit New Grant Application
                    </Button>
                  </div>

                  <Table
                    dataSource={applications}
                    rowKey="id"
                    loading={loadingApplications}
                    pagination={{ pageSize: 8 }}
                    columns={[
                      {
                        title: 'Ref Number',
                        dataIndex: 'applicationRefNumber',
                        key: 'ref',
                        render: (ref: string) => <Tag color="blue" style={{ fontWeight: 700 }}>{ref}</Tag>,
                      },
                      {
                        title: 'Applicant & Relation',
                        key: 'applicant',
                        render: (_, record: AidApplication) => (
                          <div>
                            <div style={{ fontWeight: 700, color: '#0f172a' }}>{record.applicantName}</div>
                            <div style={{ fontSize: 11, color: '#64748b' }}>
                              {record.applicantRelation} • {record.applicantContact}
                            </div>
                          </div>
                        ),
                      },
                      {
                        title: 'Scheme / Trust',
                        key: 'scheme',
                        render: (_, record: AidApplication) => (
                          <div>
                            <div style={{ fontWeight: 700, color: '#0d9488' }}>{record.scheme?.name}</div>
                            <div style={{ fontSize: 11, color: '#64748b' }}>{record.scheme?.organizationName}</div>
                          </div>
                        ),
                      },
                      {
                        title: 'Applied Amount',
                        dataIndex: 'appliedAmount',
                        key: 'applied',
                        render: (amt: number) => <b>{formatCurrency(amt)}</b>,
                      },
                      {
                        title: 'Sanctioned Amount',
                        dataIndex: 'sanctionedAmount',
                        key: 'sanctioned',
                        render: (amt: number, record: AidApplication) => (
                          <span style={{ color: amt > 0 ? '#10b981' : '#94a3b8', fontWeight: 800 }}>
                            {amt > 0 ? formatCurrency(amt) : 'Pending Review'}
                          </span>
                        ),
                      },
                      {
                        title: 'Workflow Status',
                        dataIndex: 'status',
                        key: 'status',
                        render: (status: AidApplicationStatus) => (
                          <Tag color={getStatusColor(status)} style={{ fontWeight: 700 }}>
                            {status.replace(/_/g, ' ')}
                          </Tag>
                        ),
                      },
                      {
                        title: 'Submission Date',
                        dataIndex: 'createdAt',
                        key: 'date',
                        render: (dt: string) => new Date(dt).toLocaleDateString(),
                      },
                      {
                        title: 'Actions',
                        key: 'actions',
                        render: (_, record: AidApplication) => (
                          <Button
                            size="small"
                            onClick={() => handleOpenStatusModal(record)}
                            style={{ fontWeight: 600 }}
                          >
                            Update Status
                          </Button>
                        ),
                      },
                    ]}
                  />
                </div>
              ),
            },
            {
              key: 'donors',
              label: (
                <span style={{ fontWeight: 600, fontSize: 14 }}>
                  <HeartOutlined /> Angel Donors & Corporate CSR Hub ({donors.length})
                </span>
              ),
              children: (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <Alert
                    message="Corporate CSR & Philanthropic Benefactor Pool"
                    description="Verified business houses, corporate CSR initiatives, and high-net-worth philanthropists committed to direct patient sponsorship. Donors sponsor specific chemotherapy cycles, surgical resection implants, or radiation therapy fractions directly into hospital accounts."
                    type="info"
                    showIcon
                    style={{
                      borderRadius: 12,
                      background: 'rgba(240, 253, 250, 0.65)',
                      border: '1px solid rgba(94, 234, 212, 0.6)',
                      backdropFilter: 'blur(10px)',
                    }}
                  />

                  <Row gutter={[20, 20]}>
                    {donors.map((donor) => (
                      <Col xs={24} md={12} key={donor.id}>
                        <Card
                          className="glass-card"
                          hoverable
                          style={{
                            borderRadius: 16,
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                          }}
                          styles={{ body: { padding: 22, flex: 1, display: 'flex', flexDirection: 'column' } }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                            <div>
                              <Tag color="cyan" style={{ fontWeight: 700, borderRadius: 6 }}>
                                {donor.donorType.replace(/_/g, ' ')}
                              </Tag>
                              <Title level={5} style={{ margin: '6px 0 2px 0', color: '#0f172a', fontSize: 16, fontWeight: 700 }}>
                                {donor.donorName}
                              </Title>
                              <div style={{ fontSize: 12.5, color: '#64748b' }}>
                                {donor.organizationOrTrust} • {donor.city}, {donor.state}
                              </div>
                            </div>

                            <Tag
                              color="green"
                              style={{
                                fontWeight: 800,
                                fontSize: 12.5,
                                padding: '3px 10px',
                                borderRadius: 10,
                                background: 'rgba(240, 253, 244, 0.85)',
                                border: '1px solid rgba(74, 222, 128, 0.4)',
                              }}
                            >
                              Budget: {formatCurrency(donor.maxSponsorshipBudget)}
                            </Tag>
                          </div>

                          <Paragraph style={{ fontSize: 13, color: '#334155', lineHeight: 1.55, margin: '8px 0 14px 0' }}>
                            {donor.bio}
                          </Paragraph>

                          <div
                            style={{
                              background: 'rgba(255, 255, 255, 0.55)',
                              border: '1px solid rgba(255, 255, 255, 0.75)',
                              borderRadius: 10,
                              padding: '12px 14px',
                              fontSize: 12,
                              color: '#334155',
                              marginBottom: 16,
                              backdropFilter: 'blur(8px)',
                              boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.8)',
                            }}
                          >
                            <div><b>Focus Areas:</b> {donor.focusAreas}</div>
                            {donor.contactEmail && <div style={{ marginTop: 4 }}><b>Email:</b> {donor.contactEmail}</div>}
                          </div>

                          <div style={{ marginTop: 'auto' }}>
                            <Button
                              type="primary"
                              block
                              icon={<HeartOutlined />}
                              onClick={() => handleOpenPledgeModal(donor)}
                              style={{
                                background: 'linear-gradient(135deg, #0d9488 0%, #0f766e 100%)',
                                borderColor: 'transparent',
                                fontWeight: 600,
                                borderRadius: 10,
                                height: 40,
                                boxShadow: '0 4px 12px rgba(13, 148, 136, 0.28)',
                              }}
                            >
                              Request Sponsorship / Pledge
                            </Button>
                          </div>
                        </Card>
                      </Col>
                    ))}
                  </Row>
                </div>
              ),
            },
          ]}
        />
      </Card>

      {/* Scheme Detail & Step-by-Step Procedure Modal */}
      <Modal
        title={
          selectedSchemeModal && (
            <div>
              <div style={{ fontSize: 16, fontWeight: 800, color: '#0f172a' }}>
                {selectedSchemeModal.name}
              </div>
              {selectedSchemeModal.nameRegional && (
                <div style={{ fontSize: 13, color: '#0d9488', fontWeight: 600 }}>
                  {selectedSchemeModal.nameRegional}
                </div>
              )}
            </div>
          )
        }
        open={!!selectedSchemeModal}
        onCancel={() => setSelectedSchemeModal(null)}
        width={750}
        footer={[
          <Button key="close" onClick={() => setSelectedSchemeModal(null)}>
            Close
          </Button>,
          <Button
            key="apply"
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              const s = selectedSchemeModal;
              setSelectedSchemeModal(null);
              handleOpenApplyModal(s || undefined);
            }}
            style={{ background: '#0d9488', borderColor: '#0d9488' }}
          >
            Apply for This Grant
          </Button>,
        ]}
      >
        {selectedSchemeModal && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <Descriptions bordered size="small" column={2}>
              <Descriptions.Item label="Maximum Aid Amount" span={2}>
                <b style={{ color: '#16a34a', fontSize: 15 }}>
                  {selectedSchemeModal.maxGrantAmount
                    ? formatCurrency(selectedSchemeModal.maxGrantAmount)
                    : '100% Cashless Package'}
                </b>
              </Descriptions.Item>
              <Descriptions.Item label="Income Limit">
                {selectedSchemeModal.incomeLimitAnnual
                  ? `Under ${formatCurrency(selectedSchemeModal.incomeLimitAnnual)} / year`
                  : 'No strict income ceiling'}
              </Descriptions.Item>
              <Descriptions.Item label="Eligible Ration Cards">
                {selectedSchemeModal.eligibleRationCards || 'All needy categories'}
              </Descriptions.Item>
              <Descriptions.Item label="Helpline" span={2}>
                <PhoneOutlined style={{ color: '#0d9488' }} /> {selectedSchemeModal.helplineNumber}
              </Descriptions.Item>
              <Descriptions.Item label="Official Portal" span={2}>
                <a href={selectedSchemeModal.officialPortalUrl} target="_blank" rel="noopener noreferrer">
                  <GlobalOutlined /> {selectedSchemeModal.officialPortalUrl}
                </a>
              </Descriptions.Item>
              <Descriptions.Item label="Submission Office" span={2}>
                <EnvironmentOutlined style={{ color: '#dc2626' }} /> {selectedSchemeModal.physicalAddress}
              </Descriptions.Item>
            </Descriptions>

            <Divider orientation="left" style={{ fontSize: 13, color: '#0d9488', fontWeight: 700 }}>
              Step-by-Step Application Procedure
            </Divider>

            <div
              style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: 8,
                padding: '14px 18px',
                fontSize: 13,
                color: '#334155',
                lineHeight: 1.6,
                whiteSpace: 'pre-line',
              }}
            >
              {selectedSchemeModal.stepByStepProcedure}
            </div>

            <Divider orientation="left" style={{ fontSize: 13, color: '#0d9488', fontWeight: 700 }}>
              Mandatory Documents Checklist
            </Divider>

            <List
              size="small"
              bordered
              dataSource={selectedSchemeModal.requiredDocuments}
              renderItem={(item) => (
                <List.Item>
                  <Space>
                    <CheckSquareOutlined style={{ color: '#10b981', fontSize: 15 }} />
                    <span style={{ fontSize: 13, color: '#1e293b' }}>{item}</span>
                  </Space>
                </List.Item>
              )}
            />
          </div>
        )}
      </Modal>

      {/* Official Printable Cost Estimate Certificate Modal */}
      <Modal
        title="Official Treatment Cost Estimate Certificate (वैद्यकीय खर्चाचे अंदाजपत्रक)"
        open={!!selectedEstimateForView}
        onCancel={() => setSelectedEstimateForView(null)}
        width={700}
        footer={[
          <Button key="close" onClick={() => setSelectedEstimateForView(null)}>
            Close
          </Button>,
          <Button
            key="print"
            type="primary"
            icon={<PrinterOutlined />}
            onClick={() => window.print()}
            style={{ background: '#0d9488' }}
          >
            Print Certificate
          </Button>,
        ]}
      >
        {selectedEstimateForView && (
          <div
            style={{
              border: '2px solid #0f172a',
              padding: 24,
              borderRadius: 8,
              background: '#ffffff',
              fontFamily: 'serif',
            }}
          >
            <div style={{ textAlign: 'center', borderBottom: '2px solid #0f172a', paddingBottom: 12, marginBottom: 16 }}>
              <div style={{ fontSize: 18, fontWeight: 800, textTransform: 'uppercase' }}>
                {selectedEstimateForView.hospitalName}
              </div>
              <div style={{ fontSize: 12, color: '#475569' }}>
                Comprehensive Oncology Institute & Cancer Hospital
              </div>
              <div style={{ fontSize: 15, fontWeight: 700, marginTop: 8, color: '#0f172a', textDecoration: 'underline' }}>
                MEDICAL TREATMENT COST ESTIMATE CERTIFICATE (वैद्यकीय खर्चाचे अंदाजपत्रक)
              </div>
              <div style={{ fontSize: 11, color: '#64748b', marginTop: 4 }}>
                Estimate Ref: <b>{selectedEstimateForView.estimateNumber}</b> • Date: {new Date(selectedEstimateForView.createdAt).toLocaleDateString()}
              </div>
            </div>

            <Paragraph style={{ fontSize: 13, lineHeight: 1.6 }}>
              This is to certify that patient <b>{selectedEstimateForView.patientName}</b> has been clinically evaluated and diagnosed with <b>{selectedEstimateForView.cancerType}</b> {selectedEstimateForView.cancerStage ? `(${selectedEstimateForView.cancerStage})` : ''}. The patient requires urgent multimodal oncology management as outlined below:
            </Paragraph>

            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12, marginBottom: 16 }}>
              <thead>
                <tr style={{ background: '#f1f5f9', borderBottom: '1px solid #cbd5e1' }}>
                  <th style={{ padding: '6px 8px', textAlign: 'left' }}>Intervention / Treatment Protocol</th>
                  <th style={{ padding: '6px 8px', textAlign: 'right' }}>Estimated Amount (INR)</th>
                </tr>
              </thead>
              <tbody>
                {selectedEstimateForView.surgeryCost > 0 && (
                  <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '6px 8px' }}>Surgical Resection & Reconstruction</td>
                    <td style={{ padding: '6px 8px', textAlign: 'right' }}>{formatCurrency(selectedEstimateForView.surgeryCost)}</td>
                  </tr>
                )}
                {selectedEstimateForView.chemoCost > 0 && (
                  <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '6px 8px' }}>Chemotherapy Regimen & Premedications</td>
                    <td style={{ padding: '6px 8px', textAlign: 'right' }}>{formatCurrency(selectedEstimateForView.chemoCost)}</td>
                  </tr>
                )}
                {selectedEstimateForView.radiationCost > 0 && (
                  <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '6px 8px' }}>Radiotherapy Fractions (IMRT / VMAT)</td>
                    <td style={{ padding: '6px 8px', textAlign: 'right' }}>{formatCurrency(selectedEstimateForView.radiationCost)}</td>
                  </tr>
                )}
                {selectedEstimateForView.targetedMedCost > 0 && (
                  <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '6px 8px' }}>Targeted / Immunotherapy Specialty Drugs</td>
                    <td style={{ padding: '6px 8px', textAlign: 'right' }}>{formatCurrency(selectedEstimateForView.targetedMedCost)}</td>
                  </tr>
                )}
                {selectedEstimateForView.icuBedCost > 0 && (
                  <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '6px 8px' }}>ICU & Inpatient Bed Charges</td>
                    <td style={{ padding: '6px 8px', textAlign: 'right' }}>{formatCurrency(selectedEstimateForView.icuBedCost)}</td>
                  </tr>
                )}
                {selectedEstimateForView.investigationCost > 0 && (
                  <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '6px 8px' }}>Diagnostics, PET-CT & Lab Investigations</td>
                    <td style={{ padding: '6px 8px', textAlign: 'right' }}>{formatCurrency(selectedEstimateForView.investigationCost)}</td>
                  </tr>
                )}
                <tr style={{ borderTop: '2px solid #0f172a', fontWeight: 800 }}>
                  <td style={{ padding: '8px 8px' }}>TOTAL ESTIMATED HOSPITAL COST</td>
                  <td style={{ padding: '8px 8px', textAlign: 'right' }}>{formatCurrency(selectedEstimateForView.totalEstimatedCost)}</td>
                </tr>
                <tr>
                  <td style={{ padding: '4px 8px', color: '#64748b' }}>Less: Amount Arranged / Self-Funded by Patient</td>
                  <td style={{ padding: '4px 8px', textAlign: 'right', color: '#64748b' }}>− {formatCurrency(selectedEstimateForView.patientContribution)}</td>
                </tr>
                <tr style={{ background: '#f0fdfa', fontWeight: 800, color: '#0d9488', fontSize: 14 }}>
                  <td style={{ padding: '8px 8px' }}>NET FINANCIAL DEFICIT REQUIRED FROM TRUST / RELIEF FUND</td>
                  <td style={{ padding: '8px 8px', textAlign: 'right' }}>{formatCurrency(selectedEstimateForView.netDeficitRequired)}</td>
                </tr>
              </tbody>
            </table>

            <div style={{ fontSize: 12, background: '#f8fafc', padding: 10, borderRadius: 6, marginBottom: 16 }}>
              <b>Clinical Justification:</b> {selectedEstimateForView.clinicalJustification}
            </div>

            <div style={{ fontSize: 12, border: '1px dashed #cbd5e1', padding: 10, borderRadius: 6, marginBottom: 24 }}>
              <div style={{ fontWeight: 700, marginBottom: 4 }}>Hospital Bank Account for Direct Trust RTGS / NEFT:</div>
              <div>Beneficiary: <b>{selectedEstimateForView.hospitalAccountName || 'Cancer Care Trust Fund'}</b></div>
              <div>Account Number: <b>{selectedEstimateForView.hospitalAccountNumber || '38291048291'}</b></div>
              <div>Bank: <b>{selectedEstimateForView.hospitalBankName || 'State Bank of India'}</b> • IFSC: <b>{selectedEstimateForView.hospitalIfscCode || 'SBIN0000412'}</b></div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 36, textAlign: 'center' }}>
              <div>
                <div style={{ borderTop: '1px solid #0f172a', width: 180, paddingTop: 4, fontWeight: 700, fontSize: 12 }}>
                  Medical Social Worker
                </div>
                <div style={{ fontSize: 11, color: '#64748b' }}>MSW Department</div>
              </div>

              <div>
                <div style={{ borderTop: '1px solid #0f172a', width: 220, paddingTop: 4, fontWeight: 700, fontSize: 12 }}>
                  {selectedEstimateForView.treatingDoctorName}
                </div>
                <div style={{ fontSize: 11, color: '#64748b' }}>
                  Consultant Oncologist {selectedEstimateForView.treatingDoctorRegNo ? `(${selectedEstimateForView.treatingDoctorRegNo})` : ''}
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Submit Grant Application Modal */}
      <Modal
        title="Submit Financial Aid Application"
        open={applyModalOpen}
        onCancel={() => setApplyModalOpen(false)}
        footer={null}
        width={550}
      >
        <Form form={applyForm} layout="vertical" onFinish={handleSubmitApplication}>
          <Form.Item name="schemeId" label="Select Government Scheme or Temple Trust" rules={[{ required: true }]}>
            <Select placeholder="Select Scheme / Trust">
              {schemes.map((s) => (
                <Option key={s.id} value={s.id}>
                  {s.name} ({formatCurrency(s.maxGrantAmount)})
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="estimateId" label="Attach Generated Treatment Cost Estimate">
            <Select placeholder="Select Cost Estimate Dossier (Optional)" allowClear>
              {estimates.map((e) => (
                <Option key={e.id} value={e.id}>
                  {e.estimateNumber} — {e.patientName} ({formatCurrency(e.netDeficitRequired)} Deficit)
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item name="applicantName" label="Applicant / Family Full Name" rules={[{ required: true }]}>
                <Input placeholder="e.g. Mayur More" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item name="applicantRelation" label="Relationship to Patient" rules={[{ required: true }]}>
                <Select placeholder="Relationship">
                  <Option value="Son">Son (मुलगा)</Option>
                  <Option value="Daughter">Daughter (मुलगी)</Option>
                  <Option value="Spouse">Spouse (पती/पत्नी)</Option>
                  <Option value="Parent">Parent</Option>
                  <Option value="Self">Self (Patient)</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item name="applicantContact" label="Contact Mobile Number" rules={[{ required: true }]}>
                <Input placeholder="e.g. 9822012345" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item name="appliedAmount" label="Applied Grant Amount (₹)" rules={[{ required: true }]}>
                <Input type="number" placeholder="150000" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="remarks" label="Additional Notes for Trust Review Committee">
            <TextArea rows={2} placeholder="Emergency request for chemotherapy cycles 3-6 at City Cancer Center." />
          </Form.Item>

          <Button
            type="primary"
            htmlType="submit"
            loading={submittingApply}
            style={{ background: '#0d9488', borderColor: '#0d9488', width: '100%', height: 40, fontWeight: 700 }}
          >
            Submit Application File to Trust
          </Button>
        </Form>
      </Modal>

      {/* Update Application Status Modal */}
      <Modal
        title="Update Application & Sanction Order"
        open={statusModalOpen}
        onCancel={() => setStatusModalOpen(false)}
        footer={null}
        width={500}
      >
        <Form form={statusForm} layout="vertical" onFinish={handleUpdateStatus}>
          <Form.Item name="status" label="Application Workflow Status" rules={[{ required: true }]}>
            <Select>
              <Option value={AidApplicationStatus.SUBMITTED}>Submitted (पावती मिळाली)</Option>
              <Option value={AidApplicationStatus.UNDER_REVIEW}>Under Medical Committee Review (तपासणी सुरू)</Option>
              <Option value={AidApplicationStatus.DOCS_REQUIRED}>Additional Documents Required (कागदपत्रे प्रलंबित)</Option>
              <Option value={AidApplicationStatus.SANCTIONED}>Sanction Approved (मंजूर झाले)</Option>
              <Option value={AidApplicationStatus.DISBURSED}>Disbursed to Hospital Account (रुग्णालय खात्यात वर्ग)</Option>
              <Option value={AidApplicationStatus.REJECTED}>Rejected (नामंजूर)</Option>
            </Select>
          </Form.Item>

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item name="sanctionedAmount" label="Approved Sanction Amount (₹)">
                <Input type="number" placeholder="150000" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item name="applicationRefNumber" label="Govt/Trust Acknowledgement Ref">
                <Input placeholder="e.g. CMRF/2026/8492" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="sanctionLetterNumber" label="Official Sanction Order / Cheque Number">
            <Input placeholder="e.g. SANCTION-ORD-89214 / CHEQUE-049210" />
          </Form.Item>

          <Form.Item name="remarks" label="Remarks / Hospital Ledger Note">
            <TextArea rows={2} placeholder="RTGS credited to Hospital cancer trust ledger." />
          </Form.Item>

          <Button
            type="primary"
            htmlType="submit"
            loading={updatingStatus}
            style={{ background: '#0d9488', borderColor: '#0d9488', width: '100%', height: 40, fontWeight: 700 }}
          >
            Save Status & Record Sanction
          </Button>
        </Form>
      </Modal>

      {/* Donor Pledge Modal */}
      <Modal
        title={`Request Sponsorship: ${selectedDonorForPledge?.donorName}`}
        open={pledgeModalOpen}
        onCancel={() => setPledgeModalOpen(false)}
        footer={null}
        width={500}
      >
        <Form form={pledgeForm} layout="vertical" onFinish={handleCreatePledge}>
          <Form.Item name="pledgedAmount" label="Pledge / Sponsorship Amount (₹)" rules={[{ required: true }]}>
            <Input type="number" placeholder="50000" />
          </Form.Item>

          <Form.Item name="transactionRef" label="Cheque / RTGS Transaction Reference">
            <Input placeholder="e.g. CSR-RTGS-928104" />
          </Form.Item>

          <Form.Item name="note" label="Sponsorship Note / Direct Allocation">
            <TextArea rows={2} placeholder="Sponsoring 3 chemotherapy cycles for esophageal cancer patient." />
          </Form.Item>

          <Button
            type="primary"
            htmlType="submit"
            loading={submittingPledge}
            style={{ background: '#0d9488', borderColor: '#0d9488', width: '100%', height: 40, fontWeight: 700 }}
          >
            Record Sponsorship Allocation
          </Button>
        </Form>
      </Modal>

      {/* Onboard / Edit Scheme & Temple Trust Modal */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <BankOutlined style={{ color: '#0d9488' }} />
            <span>{editingScheme ? 'Edit Financial Aid Scheme / Temple Trust' : 'Onboard New Temple Trust, Foundation or CSR Grant'}</span>
          </div>
        }
        open={schemeModalOpen}
        onCancel={() => setSchemeModalOpen(false)}
        footer={null}
        width={760}
        style={{ top: 20 }}
      >
        <Paragraph style={{ color: '#64748b', fontSize: 13, marginBottom: 20 }}>
          Register charitable temple trusts (e.g. Lalbaugcha Raja, Siddhivinayak), corporate CSR funds, or institutional cancer grants so cancer patients and oncology social workers can access eligibility rules, required document checklists, and sanction workflows.
        </Paragraph>

        <Form form={schemeForm} layout="vertical" onFinish={handleSaveScheme}>
          <Row gutter={16}>
            <Col xs={24} sm={16}>
              <Form.Item
                name="name"
                label="Scheme / Grant Title"
                rules={[{ required: true, message: 'Please enter scheme or grant title' }]}
              >
                <Input placeholder="e.g. Lalbaugcha Raja Dialysis & Cancer Medical Aid Fund" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item
                name="category"
                label="Category"
                rules={[{ required: true, message: 'Select category' }]}
              >
                <Select>
                  <Option value={AidOrgCategory.TEMPLE_TRUST}>🛕 Temple Trust</Option>
                  <Option value={AidOrgCategory.CORPORATE_CSR}>🏢 Corporate CSR</Option>
                  <Option value={AidOrgCategory.CHARITABLE_FOUNDATION}>🎗️ Charitable Foundation / NGO</Option>
                  <Option value={AidOrgCategory.GOVT_STATE_MAHARASHTRA}>🏛️ Maharashtra State Govt</Option>
                  <Option value={AidOrgCategory.GOVT_CENTRAL}>🇮🇳 Central Government</Option>
                  <Option value={AidOrgCategory.CROWDFUNDING}>🤝 Crowdfunding / Community Pool</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="nameRegional"
                label="Regional Language Name (Marathi / Hindi)"
              >
                <Input placeholder="उदा. लालबागचा राजा वैद्यकीय सहाय्यता निधी" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="organizationName"
                label="Trust / Temple / Corporate Organization"
                rules={[{ required: true, message: 'Please enter organization or temple trust name' }]}
              >
                <Input placeholder="e.g. Lalbaugcha Raja Sarvajanik Ganeshotsav Mandal" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} sm={8}>
              <Form.Item
                name="maxGrantAmount"
                label="Max Grant Amount (₹)"
              >
                <Input type="number" placeholder="e.g. 100000 (empty = 100% cashless)" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item
                name="incomeLimitAnnual"
                label="Annual Income Limit (₹)"
              >
                <Input type="number" placeholder="e.g. 250000" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item
                name="processingDays"
                label="Turnaround Time (Days)"
              >
                <Input type="number" placeholder="e.g. 14" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="benefitDescription"
            label="Grant Benefits & Treatment Scope"
            rules={[{ required: true, message: 'Please describe the benefits' }]}
          >
            <TextArea
              rows={2}
              placeholder="e.g. Direct financial grant disbursed to treating hospital oncology ledger for Chemotherapy, Radiation, or Surgery for economically weaker patients."
            />
          </Form.Item>

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="eligibleRationCards"
                label="Eligible Ration Cards"
              >
                <Input placeholder="e.g. Yellow, Orange (BPL / APL / Antyodaya)" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="eligibleHospitals"
                label="Empanelled / Eligible Hospitals"
              >
                <Input placeholder="e.g. All NABH / Govt empanelled cancer centers in Maharashtra" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} sm={8}>
              <Form.Item
                name="helplineNumber"
                label="Helpline / Contact Phone"
              >
                <Input placeholder="e.g. +91 22 2471 2345" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item
                name="officialPortalUrl"
                label="Official Website / Application Portal"
              >
                <Input placeholder="e.g. https://lalbaugcharaja.com" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item
                name="physicalAddress"
                label="Physical Aid Desk / Office Address"
              >
                <Input placeholder="e.g. Lalbaug, Parel, Mumbai 400012" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="stepByStepProcedure"
            label="Application Procedure (Step-by-Step Instructions)"
            rules={[{ required: true, message: 'Please provide application steps' }]}
          >
            <TextArea
              rows={4}
              placeholder={`1. Obtain treatment cost estimation letter from oncologist.\n2. Submit requisition with income certificate and pathology reports.\n3. Medical scrutiny committee review.\n4. Cheque/RTGS issued to hospital.`}
            />
          </Form.Item>

          <Form.Item
            name="requiredDocumentsText"
            label="Mandatory Verification Documents (One per line)"
            rules={[{ required: true, message: 'Please enter required documents' }]}
          >
            <TextArea
              rows={4}
              placeholder={`Ration Card (Yellow/Orange)\nIncome Certificate from Tahsildar\nHospital Treatment Cost Estimate\nPatient Aadhaar Card\nCancer Biopsy / PET-CT Report`}
            />
          </Form.Item>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 16 }}>
            <Button onClick={() => setSchemeModalOpen(false)}>
              Cancel
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={savingScheme}
              style={{ background: '#0d9488', borderColor: '#0d9488', fontWeight: 700 }}
            >
              {editingScheme ? 'Update Scheme Information' : 'Register & Publish Scheme'}
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
}
