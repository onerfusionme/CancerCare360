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
} from '@ant-design/icons';
import {
  palliativeService,
  PalliativeClinic,
  OnboardClinicPayload,
} from '@/services/palliative.service';

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

export function PalliativeClinicDirectoryView() {
  const [clinics, setClinics] = useState<PalliativeClinic[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCity, setSelectedCity] = useState<string>('ALL');
  const [selectedService, setSelectedService] = useState<string>('ALL');

  // Modal State
  const [isOnboardModalOpen, setIsOnboardModalOpen] = useState<boolean>(false);
  const [form] = Form.useForm();
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

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
          background: 'linear-gradient(135deg, rgba(20, 184, 166, 0.08) 0%, rgba(99, 102, 241, 0.08) 100%)',
          border: '1px solid rgba(20, 184, 166, 0.25)',
        }}
        styles={{ body: { padding: '24px 28px' } }}
      >
        <Row justify="space-between" align="middle" gutter={[16, 16]}>
          <Col xs={24} md={16}>
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
                <Text type="secondary" style={{ fontSize: 13 }}>
                  Locate verified hospice providers, home-visit palliative nursing teams, and respite centers in Karad, Satara, Pune, and regional belts.
                </Text>
              </div>
            </div>
          </Col>

          <Col xs={24} md={8} style={{ textAlign: 'right' }}>
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
          </Col>
        </Row>

        {/* Quick City Filters */}
        <div style={{ marginTop: 20, display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <Text strong style={{ fontSize: 12, color: 'var(--text-secondary, #888)', marginRight: 4 }}>
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
        style={{ borderRadius: 14 }}
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
            <Text type="secondary">Loading verified regional clinics...</Text>
          </div>
        </div>
      ) : filteredClinics.length === 0 ? (
        <Card className="glass-card" style={{ borderRadius: 16, textAlign: 'center', padding: '40px 20px' }}>
          <Empty
            description={
              <div>
                <Paragraph strong style={{ fontSize: 16, margin: '8px 0' }}>
                  No Palliative Centers Found
                </Paragraph>
                <Text type="secondary">
                  No registered centers match your search criteria for &quot;{selectedCity !== 'ALL' ? selectedCity : searchQuery}&quot;.
                </Text>
              </div>
            }
          >
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setIsOnboardModalOpen(true)}
              style={{ marginTop: 12, borderRadius: 8 }}
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
                    border: '1px solid rgba(255, 255, 255, 0.15)',
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
                    {/* Top Row: Name + Badges */}
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
                        <Title level={4} style={{ margin: '8px 0 2px', fontWeight: 700 }}>
                          {clinic.name}
                        </Title>
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        <Rate
                          disabled
                          defaultValue={clinic.rating || 5}
                          allowHalf
                          style={{ fontSize: 13, color: '#f59e0b' }}
                        />
                        <div style={{ fontSize: 11, color: '#888', marginTop: 2 }}>
                          {clinic.rating || 5}.0 rating
                        </div>
                      </div>
                    </div>

                    {/* Address & Lead Person */}
                    <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                        <EnvironmentOutlined style={{ color: '#14b8a6', marginTop: 3 }} />
                        <Text style={{ fontSize: 13, color: 'var(--text-secondary, #a1a1aa)' }}>
                          <strong style={{ color: 'var(--text-primary, #ffffff)' }}>{clinic.city}</strong> ({clinic.district}, {clinic.state} - {clinic.pincode})
                          <br />
                          {clinic.address}
                        </Text>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <TeamOutlined style={{ color: '#6366f1' }} />
                        <Text style={{ fontSize: 13, color: 'var(--text-secondary, #a1a1aa)' }}>
                          Lead: <span style={{ color: 'var(--text-primary, #ffffff)', fontWeight: 500 }}>{clinic.leadContactPerson}</span>
                        </Text>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <ClockCircleOutlined style={{ color: '#8b5cf6' }} />
                        <Text style={{ fontSize: 12, color: 'var(--text-secondary, #a1a1aa)' }}>
                          Hours: {clinic.operatingHours}
                        </Text>
                      </div>
                    </div>

                    {/* Description */}
                    {clinic.description && (
                      <Paragraph
                        ellipsis={{ rows: 2, expandable: true, symbol: 'more' }}
                        style={{
                          marginTop: 12,
                          fontSize: 13,
                          lineHeight: 1.5,
                          color: 'var(--text-secondary, #d4d4d8)',
                          background: 'rgba(255, 255, 255, 0.03)',
                          padding: '8px 12px',
                          borderRadius: 8,
                          borderLeft: '3px solid #14b8a6',
                        }}
                      >
                        {clinic.description}
                      </Paragraph>
                    )}

                    {/* Services Tags */}
                    <div style={{ marginTop: 14 }}>
                      <Text strong style={{ fontSize: 11, color: '#888', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>
                        Specialized Palliative Services:
                      </Text>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                        {clinic.servicesOffered.map((srv) => {
                          const matched = SERVICE_OPTIONS.find((s) => s.value === srv);
                          return (
                            <Tag
                              key={srv}
                              color={matched?.color || 'default'}
                              style={{ borderRadius: 6, fontSize: 11, padding: '1px 8px' }}
                            >
                              {matched ? matched.label : srv}
                            </Tag>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div style={{ marginTop: 20 }}>
                    <Divider style={{ margin: '12px 0' }} />
                    <Row gutter={[10, 10]} align="middle">
                      {clinic.emergencyHelpline && (
                        <Col span={12}>
                          <Button
                            block
                            danger
                            icon={<CustomerServiceOutlined />}
                            href={`tel:${clinic.emergencyHelpline}`}
                            style={{ borderRadius: 8, fontWeight: 600, fontSize: 12 }}
                          >
                            24/7 Helpline
                          </Button>
                        </Col>
                      )}
                      <Col span={clinic.emergencyHelpline ? 12 : 24}>
                        <Button
                          block
                          type="primary"
                          icon={<PhoneOutlined />}
                          onClick={() => setSelectedClinicForContact(clinic)}
                          style={{
                            borderRadius: 8,
                            fontWeight: 600,
                            fontSize: 12,
                            background: 'linear-gradient(135deg, #14b8a6 0%, #0d9488 100%)',
                            border: 'none',
                          }}
                        >
                          Contact Clinic
                        </Button>
                      </Col>
                    </Row>
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
                <div style={{ fontWeight: 600, fontSize: 15 }}>{selectedClinicForContact.leadContactPerson}</div>
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
                <div style={{ fontWeight: 500 }}>{selectedClinicForContact.operatingHours}</div>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
