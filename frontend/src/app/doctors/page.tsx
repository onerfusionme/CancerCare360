'use client';

import React, { useState, useMemo } from 'react';
import { Row, Col, Typography, Card, Input, Select, Button, Tag, Space, Empty } from 'antd';
import { 
  SearchOutlined, 
  CalendarOutlined, 
  UserOutlined, 
  ClockCircleOutlined, 
  SafetyCertificateOutlined,
  PhoneOutlined
} from '@ant-design/icons';
import { WebsiteHeader } from '@/components/website/WebsiteHeader';
import { WebsiteFooter } from '@/components/website/WebsiteFooter';
import { BookConsultationModal } from '@/components/website/BookConsultationModal';

const { Title, Text, Paragraph } = Typography;

const DOCTORS_DIRECTORY = [
  {
    id: '156cfc61-1ff8-4ba5-92ab-97bcf967be1d',
    name: 'Dr. Priya Mehta',
    designation: 'Senior Medical Oncologist & Director',
    department: 'Medical Oncology',
    specialtyCode: 'MEDICAL_ONCOLOGY',
    qualifications: 'MBBS, MD (Medicine), DM (Medical Oncology - Tata Memorial Hospital), ESMO Certified',
    experience: '16+ Years Clinical Experience',
    languages: 'English, Hindi, Marathi, Gujarati',
    focus: 'Breast Carcinoma, Non-Small Cell Lung Cancer, Checkpoint Immunotherapy, Targeted Kinase Inhibitors, Adjuvant/Neoadjuvant Regimens',
    opdSchedule: 'Monday, Wednesday, Friday: 10:00 AM – 04:00 PM',
    room: 'Medical Oncology Suite 201 (Main Campus)',
  },
  {
    id: '606a1e99-8786-4e3a-9cc5-9bad80fee0f3',
    name: 'Dr. Rajesh Kumar',
    designation: 'Head of Surgical Oncology',
    department: 'Surgical Oncology',
    specialtyCode: 'SURGICAL_ONCOLOGY',
    qualifications: 'MBBS, MS (General Surgery), MCh (Surgical Oncology - AIIMS), FACS (USA)',
    experience: '20+ Years Clinical Experience',
    languages: 'English, Hindi, Tamil',
    focus: 'Head & Neck Resections, Microvascular Free-Flap Reconstruction, Robotic DaVinci Surgery, Colorectal & Gastrointestinal Malignancies',
    opdSchedule: 'Tuesday, Thursday, Saturday: 09:30 AM – 03:30 PM',
    room: 'Surgical OPD Room 104 (Main Campus)',
  },
  {
    id: 'edd89cfa-c3e4-4335-a751-26a01990fb74',
    name: 'Dr. Ananya Desai',
    designation: 'Chief of Radiation Oncology',
    department: 'Radiation Oncology',
    specialtyCode: 'RADIATION_ONCOLOGY',
    qualifications: 'MBBS, MD (Radiation Oncology), DNB, ASTRO International Fellow (USA)',
    experience: '15+ Years Clinical Experience',
    languages: 'English, Hindi, Marathi, Bengali',
    focus: 'Varian TrueBeam Image-Guided Radiotherapy (IGRT), Stereotactic Radiosurgery (SRS/SBRT), Cervical & Prostate Brachytherapy',
    opdSchedule: 'Monday to Friday: 10:30 AM – 05:00 PM',
    room: 'Radiation Bunker 2 Suite (Main Campus)',
  },
  {
    id: 'coord-lead-kavita',
    name: 'Dr. Kavita Sharma',
    designation: 'Lead Nurse Navigator & Care Continuity Director',
    department: 'Care Navigation & Coordination',
    specialtyCode: 'MEDICAL_ONCOLOGY',
    qualifications: 'MBBS, MSc (Oncology Nursing & Care Coordination), WHO Patient Navigation Fellow',
    experience: '12+ Years Clinical Experience',
    languages: 'English, Hindi, Marathi, Punjabi',
    focus: 'Active Care Gap Recovery, Socioeconomic & Travel Barrier Assistance, Ayushman Bharat Scheme Triage, Survivorship Planning',
    opdSchedule: 'Monday to Saturday: 09:00 AM – 06:00 PM',
    room: 'Care Continuity Navigation Hub (Ground Floor)',
  },
];

export default function DoctorsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState('ALL');
  const [bookModalOpen, setBookModalOpen] = useState(false);
  const [bookingDoctor, setBookingDoctor] = useState<{ id: string; specialty: string } | null>(null);

  const filteredDoctors = useMemo(() => {
    return DOCTORS_DIRECTORY.filter((doc) => {
      const matchesSearch = 
        doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.focus.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.qualifications.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesDept = selectedDept === 'ALL' || doc.department.toLowerCase().includes(selectedDept.toLowerCase());
      return matchesSearch && matchesDept;
    });
  }, [searchTerm, selectedDept]);

  const handleBook = (id: string, specialty: string) => {
    setBookingDoctor({ id, specialty });
    setBookModalOpen(true);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
      <WebsiteHeader />

      {/* Hero Banner */}
      <section style={{
        background: 'linear-gradient(135deg, #090e1a 0%, #1e1b4b 100%)',
        color: '#ffffff',
        padding: '70px 24px',
      }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <Tag color="cyan" style={{ fontSize: '13px', padding: '4px 12px', borderRadius: '12px', marginBottom: '16px' }}>
            Multidisciplinary Medical Faculty
          </Tag>
          <Title level={1} style={{ color: '#ffffff', fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 800, margin: '8px 0 16px' }}>
            Find an Oncology Specialist
          </Title>
          <Paragraph style={{ color: '#c7d2fe', fontSize: '18px', maxWidth: '780px', lineHeight: 1.6 }}>
            Consult internationally recognized cancer specialists collaborating across medical, surgical, radiation, and genomic oncology disciplines.
          </Paragraph>
        </div>
      </section>

      {/* Directory & Search */}
      <section style={{ padding: '60px 24px', maxWidth: '1280px', margin: '0 auto' }}>
        <div style={{
          background: '#ffffff',
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          padding: '24px',
          marginBottom: '40px',
          boxShadow: '0 4px 12px rgba(15, 23, 42, 0.04)',
        }}>
          <Row gutter={[16, 16]}>
            <Col xs={24} md={14}>
              <Input
                size="large"
                prefix={<SearchOutlined style={{ color: '#94a3b8' }} />}
                placeholder="Search by oncologist name, disease focus (e.g. Breast, Lung, Robotic, TrueBeam)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                allowClear
              />
            </Col>
            <Col xs={24} md={10}>
              <Select
                size="large"
                style={{ width: '100%' }}
                value={selectedDept}
                onChange={(val) => setSelectedDept(val)}
              >
                <Select.Option value="ALL">All Clinical Departments</Select.Option>
                <Select.Option value="Medical">Medical Oncology & Chemo</Select.Option>
                <Select.Option value="Surgical">Surgical Oncology & Robotic</Select.Option>
                <Select.Option value="Radiation">Radiation Oncology (TrueBeam)</Select.Option>
                <Select.Option value="Navigation">Care Continuity & Navigation</Select.Option>
              </Select>
            </Col>
          </Row>
        </div>

        {/* Doctors Grid */}
        {filteredDoctors.length === 0 ? (
          <Empty description="No specialists match your search criteria" style={{ padding: '40px 0' }} />
        ) : (
          <Row gutter={[24, 24]}>
            {filteredDoctors.map((doc) => (
              <Col xs={24} lg={12} key={doc.id}>
                <Card
                  hoverable
                  style={{
                    borderRadius: '16px',
                    border: '1px solid #e2e8f0',
                    height: '100%',
                    boxShadow: '0 4px 12px rgba(15, 23, 42, 0.04)',
                  }}
                  bodyStyle={{ padding: '32px', display: 'flex', flexDirection: 'column', height: '100%' }}
                >
                  <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start', marginBottom: '20px' }}>
                    <div style={{
                      width: '72px',
                      height: '72px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #4f46e5 0%, #0284c7 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#ffffff',
                      fontSize: '28px',
                      fontWeight: 800,
                      flexShrink: 0,
                    }}>
                      {doc.name.split(' ')[1][0]}
                    </div>

                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a' }}>{doc.name}</div>
                      <div style={{ fontSize: '14px', fontWeight: 600, color: '#4f46e5' }}>{doc.designation}</div>
                      <Tag color="blue" style={{ marginTop: '6px', borderRadius: '4px' }}>{doc.department}</Tag>
                    </div>
                  </div>

                  <div style={{ fontSize: '13px', color: '#475569', marginBottom: '10px' }}>
                    <strong>Qualifications:</strong> {doc.qualifications}
                  </div>

                  <div style={{ fontSize: '13px', color: '#475569', marginBottom: '10px' }}>
                    <strong>Experience:</strong> {doc.experience} &nbsp;|&nbsp; <strong>Languages:</strong> {doc.languages}
                  </div>

                  <div style={{ fontSize: '13px', color: '#475569', marginBottom: '20px', flex: 1, lineHeight: 1.6 }}>
                    <strong>Clinical Subspecialties & Focus:</strong> {doc.focus}
                  </div>

                  <div style={{
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: '10px',
                    padding: '12px 16px',
                    fontSize: '13px',
                    marginBottom: '20px',
                  }}>
                    <div style={{ color: '#0f172a', fontWeight: 600 }}>
                      <ClockCircleOutlined style={{ color: '#4f46e5', marginRight: '6px' }} />
                      OPD Hours: {doc.opdSchedule}
                    </div>
                    <div style={{ color: '#64748b', fontSize: '12px', marginTop: '2px' }}>
                      Location: {doc.room}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '12px' }}>
                    <Button
                      type="primary"
                      icon={<CalendarOutlined />}
                      onClick={() => handleBook(doc.id, doc.specialtyCode)}
                      style={{ flex: 1, height: '42px', background: '#4f46e5', fontWeight: 600 }}
                    >
                      Book Consultation
                    </Button>
                    <Button
                      icon={<PhoneOutlined />}
                      href="tel:+912224177000"
                      style={{ height: '42px' }}
                    >
                      Call Desk
                    </Button>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        )}
      </section>

      <BookConsultationModal
        open={bookModalOpen}
        onClose={() => setBookModalOpen(false)}
        defaultDoctorId={bookingDoctor?.id}
        defaultSpecialty={bookingDoctor?.specialty}
      />

      <WebsiteFooter />
    </div>
  );
}
