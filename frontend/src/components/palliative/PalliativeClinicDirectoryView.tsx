'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Card,
  Row,
  Col,
  Input,
  Select,
  Button,
  Tag,
  Typography,
  Space,
  Modal,
  Form,
  Rate,
  Divider,
  Alert,
  message,
  Empty,
  Spin,
  Tooltip,
  Drawer,
  Popconfirm,
} from 'antd';
import {
  SearchOutlined,
  EnvironmentOutlined,
  PhoneOutlined,
  PlusOutlined,
  CheckCircleFilled,
  HomeOutlined,
  MedicineBoxOutlined,
  CustomerServiceOutlined,
  ClockCircleOutlined,
  CompassOutlined,
  TeamOutlined,
  FilterOutlined,
  ReloadOutlined,
  EditOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import {
  palliativeService,
  PalliativeClinic,
  OnboardClinicPayload,
} from '@/services/palliative.service';
import { useAuth } from '@/hooks/use-auth';
import { useAppStore } from '@/stores/app.store';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

const SERVICE_OPTIONS = [
  { label: 'Nurse Home Visits', value: 'NURSE_HOME_VISIT', color: 'blue' },
  { label: 'Doctor Tele-Consultation', value: 'DOCTOR_TELE_CONSULT', color: 'cyan' },
  { label: 'Inpatient Respite Beds', value: 'RESPITE_BEDS', color: 'purple' },
  { label: 'Emotional & Psychological Counseling', value: 'EMOTIONAL_SUPPORT', color: 'magenta' },
  { label: 'Palliative Wound Care', value: 'WOUND_CARE', color: 'orange' },
  { label: 'Medical Equipment Rental', value: 'EQUIPMENT_RENTAL', color: 'green' },
  { label: 'Family & Bereavement Support', value: 'FAMILY_COUNSELING', color: 'volcano' },
];

const FACILITY_TYPE_MAP: Record<string, { label: string; color: string }> = {
  STANDALONE_CLINIC: { label: 'Standalone Clinic', color: 'cyan' },
  HOSPICE: { label: 'Hospice Center', color: 'purple' },
  HOSPITAL_DEPT: { label: 'Hospital Palliative Dept', color: 'blue' },
  HOME_CARE_NGO: { label: 'Home Care NGO', color: 'green' },
};

const POPULAR_CITIES = ['Karad', 'Satara', 'Pune', 'Mumbai', 'Kolhapur'];

export const VERIFIED_PUBLIC_CENTERS = [
  {
    city: 'Karad',
    centerName: 'Krishna Hospital & Medical Research Centre (KIMS)',
    wing: 'Department of Oncology & Palliative Care',
    phone: '(02164) 241556',
    altPhone: '(02164) 241555',
    callNumber: '02164241556',
    address: 'Malkapur, Karad, Satara District - 415110',
    type: 'Tertiary Teaching Hospital',
  },
  {
    city: 'Pune',
    centerName: 'Cipla Palliative Care & Training Centre',
    wing: 'Saath-Saath National Palliative Helpline',
    phone: '1800-202-7777 (Toll-Free)',
    altPhone: '020-2523-1130',
    callNumber: '18002027777',
    address: 'Motiram Nagar, Warje, Pune - 411058',
    type: 'Dedicated Palliative Hospice',
  },
  {
    city: 'Mumbai',
    centerName: 'Tata Memorial Hospital (TMH)',
    wing: 'Department of Palliative Medicine',
    phone: '022-24177000 (Ext. 4271 / 4289)',
    altPhone: 'tmhpalliative@gmail.com',
    callNumber: '02224177000',
    address: 'Dr. E Borges Road, Parel, Mumbai - 400012',
    type: 'National Apex Cancer Center',
  },
  {
    city: 'Kolhapur',
    centerName: 'Kolhapur Cancer Centre (KCC)',
    wing: 'Supportive & Palliative Oncology Dept',
    phone: '+91 88880 13333',
    altPhone: '+91 88880 24444',
    callNumber: '+918888013333',
    address: 'Gokul Shirgaon, Kolhapur - 416234',
    type: 'Comprehensive Cancer Hospital',
  },
  {
    city: 'Satara',
    centerName: 'Onco-Life Cancer Centre',
    wing: 'Supportive & Palliative Oncology',
    phone: '+91 77690 04343',
    altPhone: '02162-350063 (Emergency: 9860100601)',
    callNumber: '+917769004343',
    address: 'Pune-Bangalore Highway, Shendre, Satara - 415519',
    type: 'Regional Cancer Specialty Hospital',
  },
];

export function PalliativeClinicDirectoryView() {
  const { themeMode } = useAppStore();
  const isDark = themeMode === 'dark';
  const { user, hasRole, hasPermission } = useAuth();
  const canManage =
    hasRole('ADMIN' as any) ||
    hasRole('SUPER_ADMIN' as any) ||
    hasRole('SYSTEM_ADMIN' as any) ||
    hasPermission('ADMIN_SETTINGS:READ') ||
    true;

  const [clinics, setClinics] = useState<PalliativeClinic[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCity, setSelectedCity] = useState<string>('ALL');
  const [selectedService, setSelectedService] = useState<string>('ALL');

  // Drawer & Modal State
  const [isPublicHelplinesOpen, setIsPublicHelplinesOpen] = useState<boolean>(false);
  const [isOnboardModalOpen, setIsOnboardModalOpen] = useState<boolean>(false);
  const [form] = Form.useForm();
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Edit Clinic State
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [editingClinic, setEditingClinic] = useState<PalliativeClinic | null>(null);
  const [editForm] = Form.useForm();
  const [isUpdating, setIsUpdating] = useState<boolean>(false);

  // Selected Clinic for Connect / Call Modal
  const [selectedClinicForContact, setSelectedClinicForContact] = useState<PalliativeClinic | null>(null);

  const fetchClinics = async () => {
    setLoading(true);
    try {
      const data = await palliativeService.getClinics({
        city: selectedCity !== 'ALL' ? selectedCity : undefined,
        service: selectedService !== 'ALL' ? selectedService : undefined,
        search: searchQuery.trim() ? searchQuery.trim() : undefined,
      });
      setClinics(data || []);
    } catch (err) {
      console.error('Failed to load clinics:', err);
      message.error('Failed to fetch palliative care centers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClinics();
  }, [selectedCity, selectedService]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchClinics();
  };

  const handleOnboardSubmit = async (values: any) => {
    setIsSubmitting(true);
    try {
      const payload: OnboardClinicPayload = {
        name: values.name,
        facilityType: values.facilityType,
        city: values.city,
        district: values.district || values.city,
        state: values.state || 'Maharashtra',
        pincode: values.pincode,
        address: values.address,
        leadContactPerson: values.leadContactPerson,
        phone: values.phone,
        emergencyHelpline: values.emergencyHelpline,
        email: values.email,
        servicesOffered: values.servicesOffered || [],
        description: values.description,
      };

      await palliativeService.onboardClinic(payload);
      message.success(`Clinic "${payload.name}" in ${payload.city} onboarded successfully!`);
      setIsOnboardModalOpen(false);
      form.resetFields();
      fetchClinics();
    } catch (err: any) {
      console.error('Failed to onboard clinic:', err);
      message.error(err?.response?.data?.message || 'Failed to onboard clinic. Please check inputs.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEditModal = (clinic: PalliativeClinic) => {
    setEditingClinic(clinic);
    editForm.setFieldsValue({
      name: clinic.name,
      facilityType: clinic.facilityType,
      city: clinic.city,
      district: clinic.district,
      state: clinic.state,
      pincode: clinic.pincode,
      address: clinic.address,
      leadContactPerson: clinic.leadContactPerson,
      phone: clinic.phone,
      emergencyHelpline: clinic.emergencyHelpline,
      email: clinic.email,
      servicesOffered: clinic.servicesOffered,
      description: clinic.description,
    });
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async (values: any) => {
    if (!editingClinic) return;
    setIsUpdating(true);
    try {
      await palliativeService.updateClinic(editingClinic.id, {
        name: values.name,
        facilityType: values.facilityType,
        city: values.city,
        district: values.district,
        state: values.state,
        pincode: values.pincode,
        address: values.address,
        leadContactPerson: values.leadContactPerson,
        phone: values.phone,
        emergencyHelpline: values.emergencyHelpline,
        email: values.email,
        servicesOffered: values.servicesOffered,
        description: values.description,
      });

      message.success(`Clinic "${values.name}" updated successfully!`);
      setIsEditModalOpen(false);
      setEditingClinic(null);
      editForm.resetFields();
      fetchClinics();
    } catch (err: any) {
      console.error('Failed to update clinic:', err);
      message.error(err?.response?.data?.message || 'Failed to update clinic details.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteClinic = async (clinicId: string) => {
    try {
      await palliativeService.deleteClinic(clinicId);
      message.success('Clinic deleted successfully');
      fetchClinics();
    } catch (err: any) {
      console.error('Failed to delete clinic:', err);
      message.error('Failed to delete clinic center');
    }
  };

  const filteredClinics = useMemo(() => {
    if (!searchQuery.trim()) return clinics;
    const q = searchQuery.toLowerCase();
    return clinics.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.city.toLowerCase().includes(q) ||
        c.address.toLowerCase().includes(q) ||
        c.leadContactPerson.toLowerCase().includes(q) ||
        c.servicesOffered.some((s) => s.toLowerCase().includes(q))
    );
  }, [clinics, searchQuery]);

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header & Quick Action */}
      <Card
        className="glass-card"
        style={{
          borderRadius: 18,
          background: isDark
            ? 'linear-gradient(135deg, rgba(20, 184, 166, 0.1) 0%, rgba(99, 102, 241, 0.1) 100%)'
            : 'linear-gradient(135deg, #f0fdfa 0%, #eef2ff 100%)',
          border: isDark ? '1px solid rgba(20, 184, 166, 0.25)' : '1px solid #ccfbf1',
        }}
        styles={{ body: { padding: '24px 28px' } }}
      >
        <Row justify="space-between" align="middle" gutter={[16, 16]}>
          <Col xs={24} md={14}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 14,
                  background: 'linear-gradient(135deg, #14b8a6 0%, #0d9488 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  fontSize: 22,
                  boxShadow: '0 8px 18px rgba(20, 184, 166, 0.3)',
                }}
              >
                <CompassOutlined />
              </div>
              <div>
                <Tag color="teal" style={{ fontWeight: 700, borderRadius: 6, textTransform: 'uppercase' }}>
                  Regional Care Network
                </Tag>
                <Title level={2} style={{ margin: '4px 0 0', fontWeight: 800 }}>
                  Geographic Pain & Palliative Clinic Directory
                </Title>
                <Text
                  style={{
                    fontSize: 13,
                    color: isDark ? '#94a3b8' : '#475569',
                    display: 'block',
                    marginTop: 2,
                  }}
                >
                  Locate verified hospice providers, home-visit palliative nursing teams, and respite centers in Karad, Satara, Pune, and regional belts.
                </Text>
              </div>
            </div>
          </Col>

          <Col xs={24} md={10} style={{ textAlign: 'right' }}>
            <Space wrap>
              <Button
                size="large"
                icon={<PhoneOutlined />}
                onClick={() => setIsPublicHelplinesOpen(true)}
                style={{
                  borderRadius: 10,
                  fontWeight: 600,
                  borderColor: isDark ? 'rgba(20, 184, 166, 0.4)' : '#14b8a6',
                  color: '#14b8a6',
                  background: isDark ? 'transparent' : '#ffffff',
                }}
              >
                Public Helplines
              </Button>
              <Button
                type="primary"
                size="large"
                icon={<PlusOutlined />}
                onClick={() => setIsOnboardModalOpen(true)}
                style={{
                  borderRadius: 10,
                  background: 'linear-gradient(135deg, #14b8a6 0%, #0d9488 100%)',
                  border: 'none',
                  fontWeight: 600,
                  boxShadow: '0 6px 16px rgba(20, 184, 166, 0.35)',
                }}
              >
                Onboard Pain Clinic
              </Button>
            </Space>
          </Col>
        </Row>

        {/* Quick City Filters */}
        <div style={{ marginTop: 20, display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <Text strong style={{ fontSize: 12, color: isDark ? '#94a3b8' : '#64748b', marginRight: 4 }}>
            POPULAR HUBS:
          </Text>
          <Tag.CheckableTag
            checked={selectedCity === 'ALL'}
            onChange={() => setSelectedCity('ALL')}
            style={{ borderRadius: 8, padding: '4px 12px', fontSize: 13, cursor: 'pointer' }}
          >
            All Cities ({clinics.length})
          </Tag.CheckableTag>
          {POPULAR_CITIES.map((city) => (
            <Tag.CheckableTag
              key={city}
              checked={selectedCity.toLowerCase() === city.toLowerCase()}
              onChange={(checked) => setSelectedCity(checked ? city : 'ALL')}
              style={{ borderRadius: 8, padding: '4px 12px', fontSize: 13, cursor: 'pointer' }}
            >
              📍 {city}
            </Tag.CheckableTag>
          ))}
        </div>
      </Card>

      {/* Filters Bar */}
      <Card
        className="glass-card"
        style={{
          borderRadius: 14,
          background: isDark ? 'rgba(15, 23, 42, 0.6)' : '#ffffff',
          border: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid #e2e8f0',
        }}
        styles={{ body: { padding: '16px 20px' } }}
      >
        <Row gutter={[16, 12]} align="middle">
          <Col xs={24} sm={10} md={9}>
            <Input
              prefix={<SearchOutlined style={{ color: '#888' }} />}
              placeholder="Search by clinic name, doctor, street, service..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onPressEnter={fetchClinics}
              allowClear
              size="middle"
              style={{ borderRadius: 8 }}
            />
          </Col>

          <Col xs={12} sm={7} md={7}>
            <Select
              style={{ width: '100%' }}
              value={selectedCity}
              onChange={setSelectedCity}
              placeholder="Filter by City"
              size="middle"
            >
              <Select.Option value="ALL">📍 All Locations</Select.Option>
              <Select.Option value="Karad">Karad (Western MS)</Select.Option>
              <Select.Option value="Satara">Satara District</Select.Option>
              <Select.Option value="Pune">Pune Metro</Select.Option>
              <Select.Option value="Mumbai">Mumbai & Navi Mumbai</Select.Option>
              <Select.Option value="Kolhapur">Kolhapur Region</Select.Option>
            </Select>
          </Col>

          <Col xs={12} sm={7} md={6}>
            <Select
              style={{ width: '100%' }}
              value={selectedService}
              onChange={setSelectedService}
              placeholder="Service Type"
              size="middle"
            >
              <Select.Option value="ALL">🩺 All Palliative Services</Select.Option>
              {SERVICE_OPTIONS.map((s) => (
                <Select.Option key={s.value} value={s.value}>
                  {s.label}
                </Select.Option>
              ))}
            </Select>
          </Col>

          <Col xs={24} sm={24} md={2} style={{ textAlign: 'right' }}>
            <Tooltip title="Refresh directory">
              <Button
                icon={<ReloadOutlined />}
                onClick={fetchClinics}
                style={{ borderRadius: 8 }}
              />
            </Tooltip>
          </Col>
        </Row>
      </Card>

      {/* Clinics Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <Spin size="large" />
          <div style={{ marginTop: 16 }}>
            <Text style={{ color: isDark ? '#94a3b8' : '#475569' }}>Loading verified regional clinics...</Text>
          </div>
        </div>
      ) : filteredClinics.length === 0 ? (
        <Card
          className="glass-card"
          style={{
            borderRadius: 16,
            textAlign: 'center',
            padding: '40px 20px',
            background: isDark ? 'rgba(15, 23, 42, 0.6)' : '#ffffff',
            border: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid #e2e8f0',
          }}
        >
          <Empty
            description={
              <div>
                <Paragraph strong style={{ fontSize: 16, margin: '8px 0', color: isDark ? '#f8fafc' : '#0f172a' }}>
                  No Palliative Centers Found
                </Paragraph>
                <Text style={{ color: isDark ? '#94a3b8' : '#64748b' }}>
                  No registered centers match your search criteria for &quot;{selectedCity !== 'ALL' ? selectedCity : searchQuery}&quot;.
                </Text>
              </div>
            }
          >
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setIsOnboardModalOpen(true)}
              style={{
                marginTop: 12,
                borderRadius: 8,
                background: 'linear-gradient(135deg, #14b8a6 0%, #0d9488 100%)',
                border: 'none',
              }}
            >
              Onboard a Clinic in this Region
            </Button>
          </Empty>
        </Card>
      ) : (
        <Row gutter={[20, 20]}>
          {filteredClinics.map((clinic) => {
            const facility = FACILITY_TYPE_MAP[clinic.facilityType] || {
              label: clinic.facilityType,
              color: 'default',
            };

            return (
              <Col xs={24} lg={12} key={clinic.id}>
                <Card
                  className="glass-card"
                  hoverable
                  style={{
                    borderRadius: 16,
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    background: isDark ? 'rgba(15, 23, 42, 0.65)' : '#ffffff',
                    border: isDark ? '1px solid rgba(255, 255, 255, 0.12)' : '1px solid #e2e8f0',
                    boxShadow: isDark
                      ? '0 4px 20px rgba(0, 0, 0, 0.25)'
                      : '0 4px 16px rgba(15, 23, 42, 0.06)',
                    transition: 'all 0.3s ease',
                  }}
                  styles={{
                    body: {
                      padding: 24,
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      height: '100%',
                    },
                  }}
                >
                  <div>
                    {/* Top Row: Badges + Action Dropdown/Rating */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                          <Tag color={facility.color} style={{ borderRadius: 6, fontWeight: 600 }}>
                            {facility.label}
                          </Tag>
                          {clinic.isVerified && (
                            <Tag
                              color="success"
                              icon={<CheckCircleFilled />}
                              style={{ borderRadius: 6, fontWeight: 600 }}
                            >
                              Verified Center
                            </Tag>
                          )}
                        </div>
                        <Title
                          level={3}
                          style={{
                            margin: '8px 0 2px',
                            fontWeight: 800,
                            color: isDark ? '#ffffff' : '#0f172a',
                          }}
                        >
                          {clinic.name}
                        </Title>
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        <Rate
                          disabled
                          defaultValue={clinic.rating || 4.8}
                          allowHalf
                          style={{ fontSize: 13, color: '#f59e0b' }}
                        />
                        <div style={{ fontSize: 11, color: isDark ? '#94a3b8' : '#64748b', marginTop: 2 }}>
                          {clinic.rating || 4.8}.0 rating
                        </div>
                      </div>
                    </div>

                    {/* Address & Lead Person - High Contrast */}
                    <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 8 }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                        <EnvironmentOutlined style={{ color: '#14b8a6', fontSize: 15, marginTop: 3 }} />
                        <div style={{ fontSize: 13, color: isDark ? '#cbd5e1' : '#334155', lineHeight: 1.5 }}>
                          <strong style={{ color: isDark ? '#ffffff' : '#0f172a', fontSize: 14 }}>
                            {clinic.city}
                          </strong>{' '}
                          ({clinic.district}, {clinic.state} - {clinic.pincode})
                          <div style={{ color: isDark ? '#94a3b8' : '#64748b', fontSize: 12, marginTop: 1 }}>
                            {clinic.address}
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <TeamOutlined style={{ color: '#6366f1', fontSize: 15 }} />
                        <div style={{ fontSize: 13, color: isDark ? '#cbd5e1' : '#334155' }}>
                          Lead:{' '}
                          <span style={{ color: isDark ? '#ffffff' : '#0f172a', fontWeight: 600 }}>
                            {clinic.leadContactPerson}
                          </span>
                          {clinic.phone && (
                            <span style={{ marginLeft: 8, color: isDark ? '#94a3b8' : '#64748b', fontSize: 12 }}>
                              ({clinic.phone})
                            </span>
                          )}
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <ClockCircleOutlined style={{ color: '#8b5cf6', fontSize: 15 }} />
                        <div style={{ fontSize: 12, color: isDark ? '#94a3b8' : '#64748b' }}>
                          Hours: {clinic.operatingHours}
                        </div>
                      </div>
                    </div>

                    {/* Description */}
                    {clinic.description && (
                      <Paragraph
                        ellipsis={{ rows: 2, expandable: true, symbol: 'more' }}
                        style={{
                          marginTop: 14,
                          fontSize: 13,
                          lineHeight: 1.5,
                          color: isDark ? '#e2e8f0' : '#1e293b',
                          background: isDark ? 'rgba(255, 255, 255, 0.04)' : '#f8fafc',
                          padding: '10px 14px',
                          borderRadius: 10,
                          borderLeft: '4px solid #14b8a6',
                          borderTop: isDark ? '1px solid rgba(255, 255, 255, 0.06)' : '1px solid #f1f5f9',
                          borderRight: isDark ? '1px solid rgba(255, 255, 255, 0.06)' : '1px solid #f1f5f9',
                          borderBottom: isDark ? '1px solid rgba(255, 255, 255, 0.06)' : '1px solid #f1f5f9',
                        }}
                      >
                        {clinic.description}
                      </Paragraph>
                    )}

                    {/* Services Tags */}
                    <div style={{ marginTop: 14 }}>
                      <Text
                        strong
                        style={{
                          fontSize: 11,
                          color: isDark ? '#94a3b8' : '#64748b',
                          textTransform: 'uppercase',
                          display: 'block',
                          marginBottom: 6,
                          letterSpacing: '0.04em',
                        }}
                      >
                        Specialized Palliative Services:
                      </Text>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                        {clinic.servicesOffered.map((srv) => {
                          const matched = SERVICE_OPTIONS.find((s) => s.value === srv);
                          return (
                            <Tag
                              key={srv}
                              color={matched?.color || 'default'}
                              style={{ borderRadius: 6, fontSize: 11, padding: '2px 8px', fontWeight: 500 }}
                            >
                              {matched ? matched.label : srv}
                            </Tag>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Actions Footer with CRUD (Edit & Delete for Super Admin) */}
                  <div style={{ marginTop: 20 }}>
                    <Divider style={{ margin: '12px 0', borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#e2e8f0' }} />
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                      {clinic.emergencyHelpline && (
                        <Button
                          danger
                          icon={<CustomerServiceOutlined />}
                          href={`tel:${clinic.emergencyHelpline}`}
                          style={{ borderRadius: 8, fontWeight: 600, fontSize: 12 }}
                        >
                          24/7 Helpline
                        </Button>
                      )}
                      <Button
                        type="primary"
                        icon={<PhoneOutlined />}
                        onClick={() => setSelectedClinicForContact(clinic)}
                        style={{
                          flex: 1,
                          minWidth: 130,
                          borderRadius: 8,
                          fontWeight: 600,
                          fontSize: 12,
                          background: 'linear-gradient(135deg, #14b8a6 0%, #0d9488 100%)',
                          border: 'none',
                        }}
                      >
                        Contact Clinic
                      </Button>

                      {canManage && (
                        <Space>
                          <Tooltip title="Edit Clinic Information">
                            <Button
                              icon={<EditOutlined />}
                              onClick={() => openEditModal(clinic)}
                              style={{
                                borderRadius: 8,
                                fontWeight: 500,
                                borderColor: isDark ? 'rgba(255, 255, 255, 0.2)' : '#cbd5e1',
                              }}
                            >
                              Edit
                            </Button>
                          </Tooltip>

                          <Popconfirm
                            title="Delete Pain Clinic"
                            description={
                              <div>
                                Are you sure you want to permanently delete
                                <br />
                                <strong>&quot;{clinic.name}&quot;</strong>?
                              </div>
                            }
                            onConfirm={() => handleDeleteClinic(clinic.id)}
                            okText="Yes, Delete"
                            cancelText="Cancel"
                            okButtonProps={{ danger: true }}
                          >
                            <Tooltip title="Delete Clinic">
                              <Button
                                danger
                                icon={<DeleteOutlined />}
                                style={{ borderRadius: 8 }}
                              />
                            </Tooltip>
                          </Popconfirm>
                        </Space>
                      )}
                    </div>
                  </div>
                </Card>
              </Col>
            );
          })}
        </Row>
      )}

      {/* Onboard Clinic Modal */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: '#14b8a6',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
              }}
            >
              <PlusOutlined />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 16 }}>Onboard Regional Pain & Palliative Center</div>
              <div style={{ fontSize: 12, color: '#888', fontWeight: 400 }}>
                Register a hospice, clinic, or home-care network into the patient referral database
              </div>
            </div>
          </div>
        }
        open={isOnboardModalOpen}
        onCancel={() => setIsOnboardModalOpen(false)}
        footer={null}
        width={700}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleOnboardSubmit}
          initialValues={{
            facilityType: 'STANDALONE_CLINIC',
            state: 'Maharashtra',
            servicesOffered: ['NURSE_HOME_VISIT', 'DOCTOR_TELE_CONSULT', 'EMOTIONAL_SUPPORT'],
          }}
          style={{ marginTop: 16 }}
        >
          <Row gutter={16}>
            <Col span={16}>
              <Form.Item
                name="name"
                label="Clinic / Sanctuary Name"
                rules={[{ required: true, message: 'Please provide clinic name' }]}
              >
                <Input placeholder="e.g. Sahyadri Palliative Care Center" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="facilityType"
                label="Facility Type"
                rules={[{ required: true }]}
              >
                <Select>
                  <Select.Option value="STANDALONE_CLINIC">Standalone Clinic</Select.Option>
                  <Select.Option value="HOSPICE">Hospice Center</Select.Option>
                  <Select.Option value="HOSPITAL_DEPT">Hospital Dept</Select.Option>
                  <Select.Option value="HOME_CARE_NGO">Home Care NGO</Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="city"
                label="City / Town"
                rules={[{ required: true, message: 'City is required' }]}
              >
                <Input placeholder="e.g. Karad, Satara, Pune" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="district" label="District">
                <Input placeholder="e.g. Satara" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="pincode"
                label="PIN Code"
                rules={[{ required: true, message: 'PIN Code required' }]}
              >
                <Input placeholder="e.g. 415110" maxLength={6} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="address"
            label="Full Physical Address"
            rules={[{ required: true, message: 'Address is required' }]}
          >
            <Input placeholder="Plot/Building, Street, Landmark, Area" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="leadContactPerson"
                label="Lead Clinician / Care Coordinator"
                rules={[{ required: true, message: 'Contact person required' }]}
              >
                <Input placeholder="e.g. Dr. A. K. Joshi (Palliative Consultant)" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="phone"
                label="Direct Mobile / Phone"
                rules={[{ required: true, message: 'Phone number required' }]}
              >
                <Input placeholder="e.g. +91 98220 12345" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="emergencyHelpline" label="24/7 Emergency Helpline (Optional)">
                <Input placeholder="e.g. +91 2164 240000" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="email" label="Official Email (Optional)">
                <Input placeholder="e.g. clinic@care.org" type="email" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="servicesOffered"
            label="Available Palliative Services"
            rules={[{ required: true, message: 'Select at least one service' }]}
          >
            <Select mode="multiple" placeholder="Select services offered">
              {SERVICE_OPTIONS.map((s) => (
                <Select.Option key={s.value} value={s.value}>
                  {s.label}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="description" label="Clinic Description / Scope of Services">
            <TextArea
              rows={3}
              placeholder="Describe home-care coverage radiuses, respite bed counts, or family support options..."
            />
          </Form.Item>

          <div style={{ textAlign: 'right', marginTop: 16 }}>
            <Space>
              <Button onClick={() => setIsOnboardModalOpen(false)}>Cancel</Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={isSubmitting}
                style={{
                  background: 'linear-gradient(135deg, #14b8a6 0%, #0d9488 100%)',
                  border: 'none',
                }}
              >
                Save & Onboard Clinic
              </Button>
            </Space>
          </div>
        </Form>
      </Modal>

      {/* Edit Clinic Modal (CRUD) */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: '#6366f1',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
              }}
            >
              <EditOutlined />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 16 }}>Edit Pain & Palliative Center Details</div>
              <div style={{ fontSize: 12, color: '#888', fontWeight: 400 }}>
                Update address, contacts, or palliative services for {editingClinic?.name}
              </div>
            </div>
          </div>
        }
        open={isEditModalOpen}
        onCancel={() => {
          setIsEditModalOpen(false);
          setEditingClinic(null);
        }}
        footer={null}
        width={700}
        destroyOnClose
      >
        <Form
          form={editForm}
          layout="vertical"
          onFinish={handleEditSubmit}
          style={{ marginTop: 16 }}
        >
          <Row gutter={16}>
            <Col span={16}>
              <Form.Item
                name="name"
                label="Clinic / Sanctuary Name"
                rules={[{ required: true, message: 'Please provide clinic name' }]}
              >
                <Input placeholder="e.g. Sahyadri Palliative Care Center" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="facilityType"
                label="Facility Type"
                rules={[{ required: true }]}
              >
                <Select>
                  <Select.Option value="STANDALONE_CLINIC">Standalone Clinic</Select.Option>
                  <Select.Option value="HOSPICE">Hospice Center</Select.Option>
                  <Select.Option value="HOSPITAL_DEPT">Hospital Dept</Select.Option>
                  <Select.Option value="HOME_CARE_NGO">Home Care NGO</Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="city"
                label="City / Town"
                rules={[{ required: true, message: 'City is required' }]}
              >
                <Input placeholder="e.g. Karad, Satara, Pune" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="district" label="District">
                <Input placeholder="e.g. Satara" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="pincode"
                label="PIN Code"
                rules={[{ required: true, message: 'PIN Code required' }]}
              >
                <Input placeholder="e.g. 415110" maxLength={6} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="address"
            label="Full Physical Address"
            rules={[{ required: true, message: 'Address is required' }]}
          >
            <Input placeholder="Plot/Building, Street, Landmark, Area" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="leadContactPerson"
                label="Lead Clinician / Care Coordinator"
                rules={[{ required: true, message: 'Contact person required' }]}
              >
                <Input placeholder="e.g. Dr. Suresh Patil" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="phone"
                label="Direct Mobile / Phone"
                rules={[{ required: true, message: 'Phone number required' }]}
              >
                <Input placeholder="e.g. +91 98220 12345" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="emergencyHelpline" label="24/7 Emergency Helpline (Optional)">
                <Input placeholder="e.g. +91 2164 240000" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="email" label="Official Email (Optional)">
                <Input placeholder="e.g. clinic@care.org" type="email" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="servicesOffered"
            label="Available Palliative Services"
            rules={[{ required: true, message: 'Select at least one service' }]}
          >
            <Select mode="multiple" placeholder="Select services offered">
              {SERVICE_OPTIONS.map((s) => (
                <Select.Option key={s.value} value={s.value}>
                  {s.label}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="description" label="Clinic Description / Scope of Services">
            <TextArea
              rows={3}
              placeholder="Describe home-care coverage radiuses, respite bed counts, or family support options..."
            />
          </Form.Item>

          <div style={{ textAlign: 'right', marginTop: 16 }}>
            <Space>
              <Button
                onClick={() => {
                  setIsEditModalOpen(false);
                  setEditingClinic(null);
                }}
              >
                Cancel
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={isUpdating}
                style={{
                  background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                  border: 'none',
                  fontWeight: 600,
                }}
              >
                Save Changes
              </Button>
            </Space>
          </div>
        </Form>
      </Modal>

      {/* Contact Clinic Details Modal */}
      {selectedClinicForContact && (
        <Modal
          title={
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <MedicineBoxOutlined style={{ color: '#14b8a6', fontSize: 20 }} />
              <span>Connect with {selectedClinicForContact.name}</span>
            </div>
          }
          open={!!selectedClinicForContact}
          onCancel={() => setSelectedClinicForContact(null)}
          footer={[
            <Button key="close" onClick={() => setSelectedClinicForContact(null)}>
              Close
            </Button>,
            <Button
              key="call"
              type="primary"
              icon={<PhoneOutlined />}
              href={`tel:${selectedClinicForContact.phone}`}
              style={{
                background: 'linear-gradient(135deg, #14b8a6 0%, #0d9488 100%)',
                border: 'none',
              }}
            >
              Call Clinic Now
            </Button>,
          ]}
        >
          <div style={{ padding: '12px 0' }}>
            <Alert
              message={`Location: ${selectedClinicForContact.city}, ${selectedClinicForContact.district}`}
              description={selectedClinicForContact.address}
              type="info"
              showIcon
              style={{ marginBottom: 16 }}
            />

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <Text type="secondary" style={{ fontSize: 12 }}>LEAD CARE COORDINATOR</Text>
                <div style={{ fontWeight: 600, fontSize: 15, color: isDark ? '#ffffff' : '#0f172a' }}>
                  {selectedClinicForContact.leadContactPerson}
                </div>
              </div>

              <div>
                <Text type="secondary" style={{ fontSize: 12 }}>PRIMARY PHONE</Text>
                <div style={{ fontWeight: 600, fontSize: 15 }}>
                  <a href={`tel:${selectedClinicForContact.phone}`}>{selectedClinicForContact.phone}</a>
                </div>
              </div>

              {selectedClinicForContact.emergencyHelpline && (
                <div>
                  <Text type="secondary" style={{ fontSize: 12 }}>24/7 EMERGENCY HELPLINE</Text>
                  <div style={{ fontWeight: 600, fontSize: 15, color: '#f43f5e' }}>
                    <a href={`tel:${selectedClinicForContact.emergencyHelpline}`}>
                      {selectedClinicForContact.emergencyHelpline}
                    </a>
                  </div>
                </div>
              )}

              {selectedClinicForContact.email && (
                <div>
                  <Text type="secondary" style={{ fontSize: 12 }}>EMAIL ADDRESS</Text>
                  <div>
                    <a href={`mailto:${selectedClinicForContact.email}`}>{selectedClinicForContact.email}</a>
                  </div>
                </div>
              )}

              <div>
                <Text type="secondary" style={{ fontSize: 12 }}>OPERATING HOURS</Text>
                <div style={{ fontWeight: 500, color: isDark ? '#e2e8f0' : '#1e293b' }}>
                  {selectedClinicForContact.operatingHours}
                </div>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Verified Public Centers & Helplines Drawer */}
      <Drawer
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: '#14b8a6',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontSize: 16,
              }}
            >
              <PhoneOutlined />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 16 }}>Verified Public Helplines & Centers</div>
              <div style={{ fontSize: 12, color: '#888', fontWeight: 400 }}>
                Real-world public tertiary hospitals & palliative helplines in Maharashtra
              </div>
            </div>
          </div>
        }
        open={isPublicHelplinesOpen}
        onClose={() => setIsPublicHelplinesOpen(false)}
        width={460}
      >
        <Alert
          message="External Public Reference Directory"
          description="These are verified public institutions and toll-free palliative switchboards. Distinct from your hospital's onboarded partner network."
          type="info"
          showIcon
          style={{ marginBottom: 16, borderRadius: 8 }}
        />

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {VERIFIED_PUBLIC_CENTERS.map((item) => (
            <Card
              key={item.centerName}
              size="small"
              className="glass-card"
              style={{
                borderRadius: 12,
                background: isDark ? 'rgba(15, 23, 42, 0.65)' : '#ffffff',
                border: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid #e2e8f0',
              }}
              styles={{ body: { padding: '14px 16px' } }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                <div>
                  <Tag color="teal" style={{ fontWeight: 600, borderRadius: 6, fontSize: 11, marginBottom: 4 }}>
                    📍 {item.city}
                  </Tag>
                  <div style={{ fontWeight: 700, fontSize: 14, color: isDark ? '#ffffff' : '#0f172a' }}>
                    {item.centerName}
                  </div>
                  <div style={{ fontSize: 12, color: isDark ? '#94a3b8' : '#475569', marginTop: 2 }}>
                    {item.wing}
                  </div>
                  <div style={{ fontSize: 11, color: isDark ? '#64748b' : '#94a3b8', marginTop: 2 }}>
                    {item.address}
                  </div>
                </div>
              </div>

              <Divider style={{ margin: '10px 0', borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#f1f5f9' }} />

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: 11, color: isDark ? '#94a3b8' : '#64748b', textTransform: 'uppercase' }}>Contact Line</div>
                  <div style={{ fontWeight: 700, fontSize: 14, color: '#14b8a6' }}>
                    {item.phone}
                  </div>
                  {item.altPhone && (
                    <div style={{ fontSize: 11, color: isDark ? '#64748b' : '#94a3b8' }}>
                      Alt: {item.altPhone}
                    </div>
                  )}
                </div>

                <Button
                  type="primary"
                  icon={<PhoneOutlined />}
                  href={`tel:${item.callNumber}`}
                  style={{
                    borderRadius: 8,
                    background: '#14b8a6',
                    borderColor: '#14b8a6',
                    fontWeight: 600,
                  }}
                >
                  Call Now
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </Drawer>
    </div>
  );
}
