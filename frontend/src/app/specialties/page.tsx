'use client';

import React, { useState } from 'react';
import { Row, Col, Typography, Card, Tag, Button, Tabs, Space, Divider } from 'antd';
import { 
  MedicineBoxOutlined, 
  CalendarOutlined, 
  CheckCircleOutlined,
  ThunderboltOutlined,
  ExperimentOutlined,
  ArrowRightOutlined
} from '@ant-design/icons';
import { WebsiteHeader } from '@/components/website/WebsiteHeader';
import { WebsiteFooter } from '@/components/website/WebsiteFooter';
import { BookConsultationModal } from '@/components/website/BookConsultationModal';

const { Title, Text, Paragraph } = Typography;

const SPECIALTY_PROGRAMS = [
  {
    key: 'medical',
    title: 'Medical Oncology & Daycare Lounge',
    badge: 'Systemic Precision Therapeutics',
    leadDoctor: 'Dr. Priya Mehta (Senior Medical Oncologist)',
    overview: 'Our Medical Oncology division delivers evidence-based systemic therapies using the latest international protocols from NCCN and ESMO. Every regimen is chosen based on precise histological grading and molecular genomic biomarkers.',
    highlights: [
      { name: 'Immunotherapy & Checkpoint Inhibitors', detail: 'Advanced anti-PD-1/PD-L1 biologics (Keytruda, Opdivo) harnessing the body’s own immune system to target cancer cells.' },
      { name: 'Targeted Kinase Inhibitors', detail: 'Oral targeted molecules matching specific mutations (EGFR, ALK, ROS1 in lung cancer; CDK4/6 in breast cancer; BRAF in melanoma).' },
      { name: 'Daycare Chemotherapy Suites', detail: '40 dedicated infusion bays with HEPA filtration, reclining patient couches, automated infusion pumps, and specialized oncology nurses.' },
      { name: 'Chemo Port Insertion & Maintenance', detail: 'Fluoroscopy-guided subcutaneous venous port implantation preventing repeated venipunctures and extravasation.' },
    ],
    conditions: ['Breast Cancer', 'Lung Cancer (NSCLC & SCLC)', 'Colorectal & GI Cancers', 'Prostate & Bladder Cancer', 'Ovarian & Cervical Cancer'],
  },
  {
    key: 'surgical',
    title: 'Surgical Oncology & Robotic Resection',
    badge: 'Organ-Preserving Minimally Invasive Surgery',
    leadDoctor: 'Dr. Rajesh Kumar (Head of Surgical Oncology)',
    overview: 'Our surgical oncologists prioritize complete tumor clearance with maximum normal tissue preservation. From complex head and neck microvascular flap reconstructions to sphincter-saving colorectal surgery and robotic pelvic resections.',
    highlights: [
      { name: 'Robotic & Laparoscopic Oncosurgery', detail: 'DaVinci robotic surgical platform offering 3D magnification, wristed instruments, and minimal post-operative pain and blood loss.' },
      { name: 'Head & Neck Free-Flap Reconstruction', detail: 'Radial forearm and anterolateral thigh microvascular flaps restoring speech and swallowing function after oral cancer resection.' },
      { name: 'Breast Oncoplastic Surgery', detail: 'Lump excision with local glandular remodeling, ensuring superior cosmetic symmetry without compromising surgical margins.' },
      { name: 'HIPEC (Hyperthermic Intraperitoneal Chemo)', detail: 'Cytoreductive surgery combined with heated chemotherapy perfusion for advanced ovarian and appendiceal peritoneal metastases.' },
    ],
    conditions: ['Oral Cavity & Tongue Carcinoma', 'Breast Tumors (Mastectomy & BCS)', 'Colorectal Carcinoma', 'Stomach & Esophageal Cancer', 'Thyroid Malignancies'],
  },
  {
    key: 'radiation',
    title: 'Radiation Oncology (TrueBeam IGRT / SRS)',
    badge: 'Sub-Millimeter Tumor Targeting',
    leadDoctor: 'Dr. Ananya Desai (Chief of Radiation Oncology)',
    overview: 'Equipped with the high-precision Varian TrueBeam linear accelerator, our radiation division delivers ablative radiation doses to tumors while sparing adjacent critical organs with real-time image guidance.',
    highlights: [
      { name: 'Image-Guided Radiotherapy (IGRT / VMAT)', detail: 'Volumetric modulated arc therapy delivering precise high-dose radiation in continuous 360° sweeps within 2 minutes.' },
      { name: 'Stereotactic Radiosurgery (SRS / SBRT)', detail: 'Non-invasive pinpoint radiation treating early lung tumors, liver oligometastases, and intracranial brain lesions in 1–5 sessions.' },
      { name: 'High-Dose Rate (HDR) Brachytherapy', detail: 'Internal radionuclide source placement for high-dose targeted eradication of cervical, uterine, and prostate cancers.' },
      { name: 'Surface Guided Radiotherapy (SGRT)', detail: 'Optical camera surface tracking ensuring patient motion remains within 1mm tolerance without tattoos or physical restraints.' },
    ],
    conditions: ['Cervical Carcinoma (EBRT + Brachy)', 'Prostate Adenocarcinoma (IGRT)', 'Brain Tumors & Metastases (SRS)', 'Head & Neck Carcinoma', 'Spine & Bone Oligometastases'],
  },
  {
    key: 'hemato',
    title: 'Hemato-Oncology & Bone Marrow Transplant (BMT)',
    badge: 'Specialized Blood Cancers Unit',
    leadDoctor: 'Dr. Priya Mehta & Transplant MDT',
    overview: 'Dedicated high-efficiency cleanroom facilities equipped with positive pressure HEPA filtration, specialized for managing acute leukemias, aggressive lymphomas, and performing autologous and allogeneic stem cell transplants.',
    highlights: [
      { name: 'Acute Leukemia Induction & Consolidation', detail: 'Intensive protocol chemotherapy for Acute Myeloid Leukemia (AML) and Acute Lymphoblastic Leukemia (ALL) with 24/7 blood bank support.' },
      { name: 'Autologous Stem Cell Transplantation', detail: 'High-dose rescue therapy for relapsed Multiple Myeloma and refractory Hodgkin / Non-Hodgkin Lymphomas.' },
      { name: 'Allogeneic Matched Sibling / MUD Transplants', detail: 'Stem cell donor harvesting and transplantation for high-risk hematological malignancies and bone marrow failure syndromes.' },
    ],
    conditions: ['Acute & Chronic Leukemias', 'Hodgkin & Non-Hodgkin Lymphoma', 'Multiple Myeloma', 'Myelodysplastic Syndrome (MDS)', 'Aplastic Anemia'],
  },
  {
    key: 'pathology',
    title: 'Molecular Pathology & Genomic Diagnostics',
    badge: 'Next-Generation Sequencing (NGS)',
    leadDoctor: 'Molecular Diagnostics Board',
    overview: 'Modern oncology is guided by genes. Our molecular pathology laboratory provides comprehensive genomic profiling within 48 to 72 hours, identifying actionable drug targets for targeted chemotherapy and clinical trials.',
    highlights: [
      { name: 'Next-Generation Sequencing (500+ Gene Panels)', detail: 'Deep tumor sequencing interrogating EGFR, ALK, ROS1, KRAS, BRAF, MET, RET, and NTRK fusions for precision therapy selection.' },
      { name: 'Hereditary Cancer Risk Panels (BRCA1/2)', detail: 'Germline testing identifying familial risk in breast, ovarian, pancreatic, and prostate cancer relatives with genetic counseling.' },
      { name: 'Liquid Biopsy (Circulating Tumor DNA)', detail: 'Non-invasive peripheral blood test detecting resistance mutations and minimal residual disease without requiring repeated surgical biopsies.' },
      { name: 'Immunohistochemistry (IHC) Biomarker Battery', detail: 'Rapid 24-hour staining for ER, PR, HER2-neu, Ki-67, PD-L1, and Mismatch Repair (MMR) proteins.' },
    ],
    conditions: ['Tumor Molecular Profiling', 'Hereditary Cancer Risk', 'Liquid Biopsy Surveillance', 'Minimal Residual Disease (MRD)'],
  },
];

export default function SpecialtiesPage() {
  const [bookOpen, setBookOpen] = useState(false);
  const [activeSpecialty, setActiveSpecialty] = useState<string>('medical');

  const currentProg = SPECIALTY_PROGRAMS.find((p) => p.key === activeSpecialty) || SPECIALTY_PROGRAMS[0];

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
            Clinical Centers of Excellence
          </Tag>
          <Title level={1} style={{ color: '#ffffff', fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 800, margin: '8px 0 16px' }}>
            Oncology Specialities & Treatment Programs
          </Title>
          <Paragraph style={{ color: '#c7d2fe', fontSize: '18px', maxWidth: '780px', lineHeight: 1.6 }}>
            Explore our specialized clinical departments offering advanced targeted therapy, robotic surgical resections, image-guided TrueBeam radiotherapy, and in-house genomic pathology.
          </Paragraph>
        </div>
      </section>

      {/* Main Specialties Explorer */}
      <section style={{ padding: '60px 24px', maxWidth: '1280px', margin: '0 auto' }}>
        {/* Navigation Tabs */}
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '40px' }}>
          {SPECIALTY_PROGRAMS.map((p) => {
            const isActive = activeSpecialty === p.key;
            return (
              <button
                key={p.key}
                onClick={() => setActiveSpecialty(p.key)}
                style={{
                  background: isActive ? '#4f46e5' : '#ffffff',
                  color: isActive ? '#ffffff' : '#334155',
                  border: isActive ? '1px solid #4f46e5' : '1px solid #cbd5e1',
                  borderRadius: '10px',
                  padding: '12px 20px',
                  fontWeight: 600,
                  fontSize: '14px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  boxShadow: isActive ? '0 4px 12px rgba(79, 70, 229, 0.3)' : 'none',
                }}
              >
                {p.title.split('&')[0].trim()}
              </button>
            );
          })}
        </div>

        {/* Selected Program Showcase Card */}
        <Card
          style={{
            borderRadius: '20px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 8px 24px rgba(15, 23, 42, 0.05)',
            marginBottom: '48px',
          }}
          bodyStyle={{ padding: '40px' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
            <div>
              <Tag color="blue" style={{ fontSize: '12px', fontWeight: 600, marginBottom: '8px' }}>
                {currentProg.badge}
              </Tag>
              <Title level={2} style={{ color: '#0f172a', margin: 0, fontSize: '28px' }}>
                {currentProg.title}
              </Title>
              <div style={{ color: '#4f46e5', fontWeight: 600, fontSize: '14px', marginTop: '6px' }}>
                Lead Specialist: {currentProg.leadDoctor}
              </div>
            </div>

            <Button
              type="primary"
              size="large"
              icon={<CalendarOutlined />}
              onClick={() => setBookOpen(true)}
              style={{ background: '#4f46e5', fontWeight: 600 }}
            >
              Book Department Consultation
            </Button>
          </div>

          <Paragraph style={{ color: '#475569', fontSize: '16px', lineHeight: 1.8, marginBottom: '32px' }}>
            {currentProg.overview}
          </Paragraph>

          <Title level={4} style={{ color: '#0f172a', marginBottom: '16px' }}>
            Signature Treatment Modalities & Infrastructure
          </Title>

          <Row gutter={[20, 20]} style={{ marginBottom: '32px' }}>
            {currentProg.highlights.map((h, i) => (
              <Col xs={24} md={12} key={i}>
                <div style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  padding: '20px',
                  height: '100%',
                }}>
                  <div style={{ fontWeight: 700, fontSize: '15px', color: '#0f172a', marginBottom: '6px' }}>
                    {h.name}
                  </div>
                  <div style={{ fontSize: '13px', color: '#64748b', lineHeight: 1.6 }}>
                    {h.detail}
                  </div>
                </div>
              </Col>
            ))}
          </Row>

          <div style={{ background: '#eef2ff', borderRadius: '12px', padding: '20px', border: '1px solid #c7d2fe' }}>
            <Text strong style={{ color: '#312e81', fontSize: '14px' }}>
              Common Malignancies Managed in this Division:
            </Text>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '8px' }}>
              {currentProg.conditions.map((c) => (
                <Tag key={c} color="purple" style={{ fontSize: '13px', padding: '4px 10px', borderRadius: '6px' }}>
                  {c}
                </Tag>
              ))}
            </div>
          </div>
        </Card>
      </section>

      <BookConsultationModal open={bookOpen} onClose={() => setBookOpen(false)} />
      <WebsiteFooter />
    </div>
  );
}
