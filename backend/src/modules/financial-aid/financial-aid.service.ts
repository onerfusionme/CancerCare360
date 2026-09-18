import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateEstimateDto } from './dto/create-estimate.dto';
import { CreateAidApplicationDto } from './dto/create-application.dto';
import { UpdateAidApplicationStatusDto } from './dto/update-application.dto';
import { CreateDonorPledgeDto } from './dto/donor-pledge.dto';
import { CreateSchemeDto, UpdateSchemeDto } from './dto/create-scheme.dto';
import { AidOrgCategory, AidApplicationStatus } from '@prisma/client';

export const OFFICIAL_INDIAN_CANCER_SCHEMES = [
  {
    name: "Chief Minister's Relief Fund (CMRF) - Maharashtra",
    nameRegional: "मुख्यमंत्री सहाय्यता निधी - महाराष्ट्र राज्य",
    category: AidOrgCategory.GOVT_STATE_MAHARASHTRA,
    organizationName: "Government of Maharashtra, CM Secretariat",
    maxGrantAmount: 300000,
    benefitDescription: "Direct grant up to ₹3,00,000 for cancer surgery, chemotherapy cycles, and radiotherapy paid directly to the treating hospital account.",
    incomeLimitAnnual: 160000,
    eligibleRationCards: "Yellow Ration Card (BPL) or Saffron/Orange Ration Card (APL under ₹1.6 Lakhs)",
    eligibleHospitals: "Government Hospitals, Municipal BMC Hospitals, and Empaneled Private Oncology Centers",
    officialPortalUrl: "https://cmrf.maharashtra.gov.in",
    helplineNumber: "1800 123 2211 / 022-22026948",
    physicalAddress: "Chief Minister's Relief Fund Cell, 5th Floor, Mantralaya, Nariman Point, Mumbai - 400032 (or submit via District Collector Office)",
    stepByStepProcedure: `1. Obtain Official CMRF Medical Certificate Form from hospital social worker or download from cmrf.maharashtra.gov.in.
2. Have the treating surgical/medical oncologist fill in diagnosis, cancer type, TNM stage, and proposed surgery/chemo breakdown.
3. Obtain Hospital Cost Estimate on official letterhead signed and stamped by both the Treating Oncologist and Chief Medical Superintendent.
4. Secure Family Annual Income Certificate (वार्षिक उत्पन्नाचा दाखला) from the local Tahsildar / Revenue Department (< ₹1.60 Lakhs).
5. Assemble Color Copies: Ration Card (front & back), Patient Aadhaar Card, Applicant Aadhaar Card, Recent Biopsy/PET-CT Scan Histopathology Report, and Geo-tagged photograph of the patient.
6. Submission: Upload scanned dossier on cmrf.maharashtra.gov.in OR submit physical file at Mantralaya CMRF Desk / District Collectorate.
7. Tracking: Medical Scrutiny Committee verifies within 7-10 working days. Upon sanction, RTGS/NEFT payment is transferred directly to the hospital bank account.`,
    requiredDocuments: [
      "Prescribed CMRF Application Form (duly filled & signed)",
      "Hospital Cost Estimate on Letterhead with Doctor & MS Stamp",
      "Tahsildar Income Certificate (below ₹1.60 Lakhs)",
      "Yellow or Saffron/Orange Ration Card Copy",
      "Patient Aadhaar Card (and Applicant Aadhaar)",
      "Biopsy / Histopathology / PET-CT Cancer Diagnostic Report",
      "Passport Photo & Geo-tagged Patient Photo"
    ],
    processingDays: 14,
  },
  {
    name: "Lalbaugcha Raja Sarvajanik Ganeshotsav Mandal Medical Aid Fund",
    nameRegional: "लालबागचा राजा सार्वजनिक गणेशोत्सव मंडळ रुग्ण सहाय्यता निधी",
    category: AidOrgCategory.TEMPLE_TRUST,
    organizationName: "Lalbaugcha Raja Sarvajanik Ganeshotsav Mandal Trust",
    maxGrantAmount: 150000,
    benefitDescription: "Direct medical grants for cancer surgeries, chemotherapy regimens, and specialty medicines for economically needy families.",
    incomeLimitAnnual: 200000,
    eligibleRationCards: "Yellow, Orange, or Low-income White Ration Cards",
    eligibleHospitals: "Tata Memorial Hospital, KEM, Sion, Nair, and major charitable/trust cancer hospitals",
    officialPortalUrl: "https://lalbaugcharaja.com",
    helplineNumber: "022-2471 3626 / 022-2471 3627",
    physicalAddress: "Lalbaugcha Raja Mandal Office, Shree Ganesh Nagar, Dr. Babasaheb Ambedkar Road, Lalbaug Market, Mumbai - 400012",
    stepByStepProcedure: `1. Visit the treating hospital's Medical Social Work (MSW) Department (e.g. Room 54 at Tata Memorial Hospital).
2. Request a formal 'MSW Recommendation Letter' addressed to Lalbaugcha Raja Sarvajanik Ganeshotsav Mandal stating the family's financial distress and treatment requirement.
3. Attach original Hospital Cost Estimate signed by treating oncologist with itemized chemo/surgery breakdown.
4. Attach patient biopsy report, Aadhaar card copy, and ration card copy.
5. Visit Lalbaugcha Raja Mandal Office in person (Monday to Friday, 11:00 AM – 7:00 PM) at Lalbaug, Mumbai.
6. Submit the file at the Medical Assistance Desk. The Trust Medical Committee reviews cases every week.
7. Sanction: Once approved, the Trust issues an account payee cheque drawn directly in favor of the Hospital Trust Fund in the patient's name.`,
    requiredDocuments: [
      "Hospital Medical Social Worker (MSW) Letter of Recommendation",
      "Original Hospital Cost Estimate on Letterhead with Doctor Signature",
      "Histopathology / Biopsy Cancer Report",
      "Ration Card Copy (Yellow/Orange)",
      "Patient Aadhaar Card Copy",
      "Hospital Patient ID Card / Case Paper Copy"
    ],
    processingDays: 10,
  },
  {
    name: "Shree Siddhivinayak Ganapati Temple Trust Medical Aid",
    nameRegional: "श्री सिद्धिविनायक गणपती मंदिर न्यास वैद्यकीय सहाय्य योजना",
    category: AidOrgCategory.TEMPLE_TRUST,
    organizationName: "Shree Siddhivinayak Ganapati Mandir Trust, Prabhadevi",
    maxGrantAmount: 50000,
    benefitDescription: "Direct financial assistance up to ₹25,000–₹50,000 for ongoing cancer chemotherapy, surgical interventions, and life-saving medications.",
    incomeLimitAnnual: 150000,
    eligibleRationCards: "Yellow or Orange Maharashtra Ration Card",
    eligibleHospitals: "Recognized Government, Municipal, and Registered Charitable Trust Hospitals",
    officialPortalUrl: "https://www.siddhivinayak.org",
    helplineNumber: "022-2422 3206 / 022-2422 4438",
    physicalAddress: "Medical Aid Department, Shree Siddhivinayak Ganapati Mandir Trust, S.K. Bole Marg, Prabhadevi, Mumbai - 400028",
    stepByStepProcedure: `1. Obtain the official Medical Aid Application Form from the Prabhadevi Temple Office or website.
2. In-Person Submission Mandatory: Applications MUST be submitted in person at the Temple Medical Counter (Mon–Sat, 10:00 AM to 5:00 PM).
3. Medical Estimate Requirements: Must be on original hospital letterhead containing patient case paper number, nature of malignancy, proposed surgery/chemo date, and doctor's original stamp and signature (proxy 'For' signatures are strictly rejected).
4. No Retrospective Reimbursement: Applications must be submitted while treatment is ongoing or planned; discharged patients cannot claim.
5. Provide Tahsildar Income Certificate and Color Copies of Ration Card (first 2 pages and last 2 pages).
6. Verification & Cheque: Trust scrutinizes documents within 7 days and delivers financial sanction directly to the hospital.`,
    requiredDocuments: [
      "Prescribed Siddhivinayak Medical Application Form",
      "Original Hospital Estimate (with original Doctor Stamp & Sign, no 'For')",
      "Tahsildar Income Certificate of current financial year",
      "Color Copy of Maharashtra Ration Card (front and back)",
      "Color Copy of Patient Aadhaar Card",
      "Recent Biopsy / Pathology Diagnostic Report"
    ],
    processingDays: 7,
  },
  {
    name: "Prime Minister's National Relief Fund (PMNRF)",
    nameRegional: "पंतप्रधान राष्ट्रीय मदत निधी (PMNRF)",
    category: AidOrgCategory.GOVT_CENTRAL,
    organizationName: "Prime Minister's Office (PMO), Government of India",
    maxGrantAmount: 300000,
    benefitDescription: "Direct financial grant up to ₹3,00,000 for critical surgeries and systemic therapy for cancer patients nationwide.",
    incomeLimitAnnual: 250000,
    eligibleRationCards: "BPL / Antyodaya / Economically Weaker Section (EWS) certificates",
    eligibleHospitals: "All AIIMS, Regional Cancer Centres, Government Medical Colleges, and PMNRF Empaneled Hospitals",
    officialPortalUrl: "https://pmnrf.gov.in",
    helplineNumber: "011-2301 2312 / 011-2301 0256",
    physicalAddress: "PMNRF Section, Prime Minister's Office, South Block, New Delhi - 110011",
    stepByStepProcedure: `1. Download prescribed PMNRF Medical Assistance Application Form from pmnrf.gov.in.
2. Fill patient and family particulars; paste one passport-size photo and staple one extra photo.
3. Have treating oncologist fill Medical Certificate section detailing histological diagnosis, clinical stage, and itemized cost estimate.
4. Obtain local revenue authority / District Magistrate (DM) / Tahsildar Income Certificate.
5. Attach verified copies of Aadhaar Card, Ration Card, and clinical biopsy report.
6. Submit completed application via registered post to PMO South Block, New Delhi OR upload via the PMNRF online portal.
7. Approval: PMO reviews cases under discretionary powers and sanctions amount directly to the Medical Superintendent of the treating hospital.`,
    requiredDocuments: [
      "PMNRF Application Form with 2 Passport Photographs",
      "Original Medical Certificate & Treatment Cost Estimate from Doctor",
      "Income Certificate from DM / Sub-Divisional Magistrate / Tahsildar",
      "Self-Attested Aadhaar Card Copy",
      "Ration Card / Residence Proof",
      "Copy of Biopsy / Diagnostic Reports"
    ],
    processingDays: 21,
  },
  {
    name: "Mahatma Jyotirao Phule Jan Arogya Yojana (MJPJAY)",
    nameRegional: "महात्मा ज्योतिराव फुले जन आरोग्य योजना (MJPJAY)",
    category: AidOrgCategory.GOVT_STATE_MAHARASHTRA,
    organizationName: "State Health Assurance Society, Maharashtra",
    maxGrantAmount: 500000,
    benefitDescription: "100% Cashless treatment up to ₹5,00,000 per family per year covering complex cancer surgeries, medical oncology chemotherapy, and radiation therapy.",
    incomeLimitAnnual: 250000,
    eligibleRationCards: "Yellow, Orange, Antyodaya Anna Yojana (AAY), Annapurna, or White Ration Card holders",
    eligibleHospitals: "Over 1,000 Network Government and Empaneled Private Specialty Hospitals across Maharashtra",
    officialPortalUrl: "https://www.jeevandayee.gov.in",
    helplineNumber: "155388 / 1800 233 2200 (24x7 Toll-Free)",
    physicalAddress: "State Health Assurance Society, ESIS Hospital Compound, Ganpatrao Jadhav Marg, Worli, Mumbai - 400018",
    stepByStepProcedure: `1. Visit any MJPJAY network hospital with the patient's valid Yellow/Orange Ration Card and Aadhaar Card.
2. Meet the dedicated 'Arogyamitra' (आरोग्यमित्र) stationed at the hospital MJPJAY helpdesk kiosk.
3. Arogyamitra verifies eligibility on the online portal and creates a digital e-card if not already issued.
4. Treating oncologist drafts pre-authorization request for the oncology package (e.g. Modified Radical Mastectomy, Esophagectomy, Cisplatin+Fluorouracil cycles, or 3D-CRT/IMRT).
5. Pre-authorization is approved by TPA/SHAS medical committee within 12 to 24 hours.
6. Entire treatment, medications, investigations, and hospital stay are provided 100% CASHLESS without the family paying anything.`,
    requiredDocuments: [
      "Valid Maharashtra Ration Card (Yellow / Orange / Annapurna)",
      "Patient Aadhaar Card",
      "Doctor's Clinical Diagnosis & Histopathology Biopsy Report",
      "Signed Consent for Cashless MJPJAY Package"
    ],
    processingDays: 1,
  },
  {
    name: "Ayushman Bharat - Pradhan Mantri Jan Arogya Yojana (PM-JAY)",
    nameRegional: "आयुष्मान भारत - प्रधानमंत्री जन आरोग्य योजना",
    category: AidOrgCategory.GOVT_CENTRAL,
    organizationName: "National Health Authority (NHA), Government of India",
    maxGrantAmount: 500000,
    benefitDescription: "Comprehensive ₹5,00,000 cashless cover per family per year for secondary and tertiary cancer care across 27,000+ empaneled hospitals pan-India.",
    incomeLimitAnnual: 180000,
    eligibleRationCards: "SECC-2011 identified families, PM-JAY Golden Card holders",
    eligibleHospitals: "All Empaneled Government, Medical College, and Private Hospitals across India",
    officialPortalUrl: "https://pmjay.gov.in",
    helplineNumber: "14555 (24x7 Toll-Free)",
    physicalAddress: "National Health Authority, 9th Floor, Tower-l, Jeevan Bharati Building, Connaught Place, New Delhi - 110001",
    stepByStepProcedure: `1. Check eligibility at mera.pmjay.gov.in using mobile number or Ration Card / PM-JAY letter.
2. Visit any empaneled hospital or Common Service Centre (CSC) with Aadhaar Card to get an Ayushman Card (Golden Card).
3. Present the Ayushman Card at the hospital Ayushman Mitra counter.
4. The hospital initiates oncology pre-authorization based on the cancer treatment protocol.
5. All diagnostics, surgical resections, chemotherapy cycles, radiotherapy sessions, and 15 days of post-discharge medicines are completely cashless.`,
    requiredDocuments: [
      "Ayushman Golden Card / Ayushman Bharat Beneficiary ID",
      "Aadhaar Card",
      "Biopsy and Radiological Confirmation of Cancer",
      "Hospital Admission & Treatment Prescription"
    ],
    processingDays: 1,
  },
  {
    name: "Health Minister's Cancer Patient Fund (HMCPF / Rashtriya Arogya Nidhi)",
    nameRegional: "आरोग्य मंत्री कर्करोग रुग्ण निधी (RAN / HMCPF)",
    category: AidOrgCategory.GOVT_CENTRAL,
    organizationName: "Ministry of Health and Family Welfare (MoHFW), New Delhi",
    maxGrantAmount: 1500000,
    benefitDescription: "High-value financial assistance up to ₹15,00,000 for poor cancer patients living Below Poverty Line (BPL) undergoing treatment at 27 designated Regional Cancer Centres (RCCs).",
    incomeLimitAnnual: 100000,
    eligibleRationCards: "BPL Card / Antyodaya Anna Yojana (AAY) Card",
    eligibleHospitals: "27 Regional Cancer Centres (e.g. Tata Memorial Mumbai, AIIMS Delhi, Kidwai Bangalore, GCRI Ahmedabad)",
    officialPortalUrl: "https://mohfw.gov.in",
    helplineNumber: "011-2306 1481 / 011-2306 1731",
    physicalAddress: "National Health Authority & MoHFW, Nirman Bhawan, New Delhi - 110011",
    stepByStepProcedure: `1. Treatment must be at one of the 27 Regional Cancer Centres (e.g., Tata Memorial Hospital, Mumbai).
2. Obtain prescribed HMCPF Application Form Annexure-I from the hospital MSW department.
3. Form must be completed, signed by the treating oncologist, and countersigned by the Medical Superintendent of the Regional Cancer Centre.
4. Attach BPL Card / Antyodaya Card, Tahsildar income certificate, and complete diagnostic records.
5. Hospital administration forwards the application directly to the Ministry's Revolving Fund.
6. Sanction: Up to ₹2 Lakhs can be sanctioned immediately by the Medical Superintendent from the hospital's revolving fund; amounts above ₹2 Lakhs up to ₹15 Lakhs are released directly by MoHFW.`,
    requiredDocuments: [
      "Duly Filled Application Form Annexure-I (with Doctor & MS signatures)",
      "Authentic BPL / Antyodaya Ration Card",
      "State Revenue Authority Income Certificate (< ₹1 Lakh)",
      "Patient Aadhaar Card",
      "Itemized Hospital Cost Estimate for surgery/chemo/radiation",
      "Pathology / Histology Biopsy Report"
    ],
    processingDays: 20,
  },
  {
    name: "Shri Saibaba Sansthan Trust Medical Aid Scheme, Shirdi",
    nameRegional: "श्री साईबाबा संस्थान विश्वास, शिर्डी वैद्यकीय मदत योजना",
    category: AidOrgCategory.TEMPLE_TRUST,
    organizationName: "Shri Saibaba Sansthan Trust, Shirdi",
    maxGrantAmount: 50000,
    benefitDescription: "Direct medical grant covering 25% of the total surgical/treatment cost up to ₹50,000 for cancer surgery and post-operative recovery.",
    incomeLimitAnnual: 160000,
    eligibleRationCards: "Yellow Ration Card (income under ₹85,000) or Orange Ration Card (income under ₹1,60,000)",
    eligibleHospitals: "Registered Government, Municipal, Medical College, and Recognized Trust Hospitals",
    officialPortalUrl: "https://www.sai.org.in",
    helplineNumber: "02423-258500 / 02423-258671",
    physicalAddress: "Executive Officer, Shri Saibaba Sansthan Trust, Shirdi, Tal. Rahata, Dist. Ahmednagar - 423109",
    stepByStepProcedure: `1. Obtain formal Treatment/Surgery Cost Estimate on hospital letterhead with doctor's recommendation.
2. Treatment cost must exceed ₹15,000 (Sansthan does not provide subsidies for bills below ₹15,000).
3. Write formal application letter addressed to 'The Chief Executive Officer, Shri Saibaba Sansthan Trust, Shirdi'.
4. Attach Yellow/Orange Ration Card copy, Tahsildar income certificate, patient Aadhaar, and biopsy reports.
5. Provide hospital bank registration details (Account Name, Bank, Account No, IFSC code).
6. Submit application at Sansthan Administrative Office in Shirdi OR via registered post.
7. Upon review, the subsidy (25% up to ₹50,000) is transferred directly via RTGS to the hospital's bank account in the patient's name.`,
    requiredDocuments: [
      "Formal Request Application to CEO, Saibaba Sansthan Trust",
      "Original Hospital Treatment/Surgery Cost Estimate",
      "Yellow or Orange Ration Card Copy",
      "Tahsildar Income Certificate",
      "Patient Aadhaar Card",
      "Hospital RTGS / Bank Account Details Certificate"
    ],
    processingDays: 14,
  },
  {
    name: "Tata Memorial Hospital Medical Development & MSW Fund",
    nameRegional: "टाटा मेमोरियल रुग्णालय वैद्यकीय सामाजिक सेवा विभाग व ट्रस्ट फंड",
    category: AidOrgCategory.CHARITABLE_FOUNDATION,
    organizationName: "Tata Trusts & TMC Medical Social Work Department",
    maxGrantAmount: 250000,
    benefitDescription: "Socio-economic assessment and internal 'gap funding' where Tata Trusts and donor partners credit funds directly into the patient's hospital trust account to sponsor chemotherapy and surgery.",
    incomeLimitAnnual: 250000,
    eligibleRationCards: "BPL, Yellow, Orange, or Low-Income status",
    eligibleHospitals: "Tata Memorial Hospital (Parel), ACTREC (Kharghar), and all TMC Network Cancer Centres",
    officialPortalUrl: "https://tmc.gov.in",
    helplineNumber: "022-2417 7000 (Ext. 4505/4506)",
    physicalAddress: "Medical Social Work (MSW) Dept, Room No. 54, Ground Floor, Golden Jubilee Building, Tata Memorial Hospital, Dr. E Borges Road, Parel, Mumbai - 400012",
    stepByStepProcedure: `1. Register patient at Tata Memorial Hospital (Parel, Mumbai) or ACTREC (Kharghar) and obtain Smart Card Case Number.
2. Visit the MSW Department (Room 54, Golden Jubilee Building) with family income proof and ration card.
3. The Medical Social Worker assesses the 'Financial Deficit' (total treatment cost minus family capacity).
4. MSW links the patient with multiple charitable partner trusts (e.g. Tata Trusts, CPAA, J.R.D. Tata Trust, HDFC Cancer Cure Fund).
5. 'Kevat' patient navigators assist with completing the paperwork inside the hospital.
6. Financial grants are credited directly into the patient's TMC electronic wallet/trust ledger to cover chemo drugs and surgical implants.`,
    requiredDocuments: [
      "TMC Patient Smart Card / Registration Details",
      "Proof of Family Income (Income Certificate / Salary Slip / ITR)",
      "Ration Card Copy (Yellow/Orange)",
      "Patient and Guardian Aadhaar Card",
      "Treatment Cost Prescription from TMC Consultant Oncologist"
    ],
    processingDays: 5,
  },
  {
    name: "Indian Railways Cancer Patient Travel Concession",
    nameRegional: "भारतीय रेल्वे कर्करोग रुग्ण प्रवास सवलत (Appendix I/17)",
    category: AidOrgCategory.GOVT_CENTRAL,
    organizationName: "Ministry of Railways, Government of India",
    maxGrantAmount: 25000,
    benefitDescription: "100% Free Travel Concession in Sleeper and 3AC classes (75% in 1AC & 2AC) for cancer patients travelling for treatment/checkups, plus 75% concession for one accompanying escort.",
    incomeLimitAnnual: 1000000,
    eligibleRationCards: "All categories (no income ceiling applies)",
    eligibleHospitals: "All Recognized Cancer Hospitals, AIIMS, TMC, and State Medical Colleges",
    officialPortalUrl: "https://indianrail.gov.in",
    helplineNumber: "139 (Railway Helpline)",
    physicalAddress: "Available at all Computerized PRS Ticket Reservation Counters at Railway Stations across India",
    stepByStepProcedure: `1. Download the standard Railway Cancer Concession Certificate form (known as Appendix I/17).
2. Have the Officer-in-Charge / Consultant Oncologist of the treating cancer hospital fill in the patient details, treatment dates, and station of origin and destination.
3. Doctor must sign and affix the official hospital round stamp (alterations or overwriting strictly void the certificate).
4. Certificate is valid for ONE YEAR from the date of issue.
5. Take the original certificate along with patient and escort Aadhaar cards to any Railway PRS computerized reservation counter.
6. The railway clerk verifies the form and issues tickets: 100% concession in Sleeper & 3AC (only GST/reservation fee applies), and 75% concession for the escort.
7. Emergency Quota (EQ): In urgent treatment situations, patients can attach this certificate to secure confirmed tickets under the medical emergency quota.`,
    requiredDocuments: [
      "Duly Completed Railway Concession Certificate (Appendix I/17 with hospital stamp)",
      "Patient Photo ID / Aadhaar Card",
      "Accompanying Escort Photo ID / Aadhaar Card",
      "Hospital OPD / Treatment Card Copy"
    ],
    processingDays: 1,
  },
  {
    name: "Indian Cancer Society (ICS) - Cancer Cure Fund",
    nameRegional: "इंडियन कॅन्सर सोसायटी - कॅन्सर क्युअर फंड",
    category: AidOrgCategory.CHARITABLE_FOUNDATION,
    organizationName: "Indian Cancer Society & Corporate Donors",
    maxGrantAmount: 500000,
    benefitDescription: "Discretionary funding up to ₹5,00,000 for curable early-stage cancer patients (especially children, young adults, and curable adult solid tumors) whose family annual income is under ₹4,00,000.",
    incomeLimitAnnual: 400000,
    eligibleRationCards: "Yellow, Orange, or verified low income certificate",
    eligibleHospitals: "Empaneled Public and Trust Cancer Hospitals across India",
    officialPortalUrl: "https://www.indiancancersociety.org",
    helplineNumber: "1800 22 1951 / 022-2413 9445",
    physicalAddress: "Indian Cancer Society, 74, Jerbai Wadia Road, Bhoiwada, Parel, Mumbai - 400012",
    stepByStepProcedure: `1. Obtain ICS Cancer Cure Fund application form from hospital social worker or ICS office.
2. The treating oncologist certifies that the intent of treatment is CURATIVE (Stage I, II, or III with favorable prognosis).
3. Attach hospital estimate, biopsy report, family income proof, and Aadhaar card.
4. Submit via the hospital MSW department to the ICS Governing Advisory Board.
5. Governing committee meets fortnightly to evaluate and approve patient files.
6. Approved amounts are disbursed directly to the hospital's dedicated patient treatment account.`,
    requiredDocuments: [
      "ICS Application Form with Oncologist Curative Certification",
      "Itemized Hospital Cost Estimate",
      "Family Income Certificate / Bank Statement",
      "Patient Aadhaar Card",
      "Histopathology and Staging Radiology Reports"
    ],
    processingDays: 14,
  },
  {
    name: "CanKids..KidsCan (Pediatric Cancer National Financial Aid)",
    nameRegional: "कॅनकिड्स - लहान मुलांच्या कर्करोगासाठी राष्ट्रीय मदत",
    category: AidOrgCategory.CHARITABLE_FOUNDATION,
    organizationName: "CanKids..KidsCan National Pediatric Oncology NGO",
    maxGrantAmount: 200000,
    benefitDescription: "Holistic pediatric cancer financial support up to ₹2,00,000 covering chemotherapy drugs, diagnostics, blood components, accommodation, and psychological counseling for children aged 0-19.",
    incomeLimitAnnual: 300000,
    eligibleRationCards: "All needy families with pediatric cancer diagnosis",
    eligibleHospitals: "Over 120 Cancer Treatment Centres across India",
    officialPortalUrl: "https://www.cankidsindia.org",
    helplineNumber: "011-4166 3670 / +91-99535 91578",
    physicalAddress: "CanKids..KidsCan, D-30, Ground Floor, Hauz Khas, New Delhi - 110016 (Regional offices in Mumbai, Pune, Nagpur)",
    stepByStepProcedure: `1. For patients under 19 years diagnosed with leukemia, lymphoma, neuroblastoma, or pediatric solid tumors.
2. Approach the on-site CanKids social worker stationed at the hospital pediatric oncology ward.
3. Submit birth certificate/age proof, parent Aadhaar card, hospital estimate, and bone marrow/biopsy report.
4. CanKids team approves emergency drug support within 48 hours to prevent chemotherapy delay.
5. Ongoing support covers chemotherapy, specialized fungal medications, and free stay at local CanKids Home Away From Home.`,
    requiredDocuments: [
      "Child Birth Certificate / Age Proof",
      "Parent / Guardian Aadhaar Card",
      "Pediatric Oncologist Treatment Prescription & Estimate",
      "Bone Marrow Aspirate / Biopsy / Histopathology Report",
      "Family Income Proof / Ration Card"
    ],
    processingDays: 3,
  },
];

export const INITIAL_PHILANTHROPISTS = [
  {
    donorName: "Bajaj Foundation Oncology CSR Pool",
    organizationOrTrust: "Bajaj Finserv CSR & Health Initiative",
    donorType: "CSR_FOUNDATION",
    focusAreas: "Rural Maharashtra Cancer Patients, Esophageal & Oral Cancer Surgery Subsidies",
    city: "Pune",
    state: "Maharashtra",
    maxSponsorshipBudget: 1500000,
    contactEmail: "csr.health@bajajfinserv.in",
    contactPhone: "+91-20-7157-6000",
    verifiedStatus: true,
    isAcceptingCases: true,
    bio: "Dedicated corporate social responsibility fund sponsoring surgical implants, radiation fractions, and chemotherapy cycles for families in Western Maharashtra (Satara, Pune, Kolhapur).",
  },
  {
    donorName: "Kalyani Precision Care Trust",
    organizationOrTrust: "Bharat Forge & Kalyani Philanthropy",
    donorType: "CSR_FOUNDATION",
    focusAreas: "Chemotherapy Regimens for Head & Neck, Lung, and Gastrointestinal Cancers",
    city: "Pune",
    state: "Maharashtra",
    maxSponsorshipBudget: 1000000,
    contactEmail: "philanthropy@kalyanigroup.com",
    contactPhone: "+91-20-6704-2000",
    verifiedStatus: true,
    isAcceptingCases: true,
    bio: "Supporting underprivileged cancer warriors across Satara, Karad, and Pune districts to ensure no chemotherapy cycle is missed due to financial deficits.",
  },
  {
    donorName: "Shri Sant Dnyaneshwar Medical Seva Trust",
    organizationOrTrust: "Community Philanthropic Trust",
    donorType: "COMMUNITY_TEMPLE",
    focusAreas: "Emergency Chemo Drugs & Nutrition Support for Rural Patients",
    city: "Satara",
    state: "Maharashtra",
    maxSponsorshipBudget: 500000,
    contactEmail: "seva@dnyaneshwarmedical.org",
    contactPhone: "+91-98220-41520",
    verifiedStatus: true,
    isAcceptingCases: true,
    bio: "Community trust founded by local doctors and business leaders in Satara district providing direct sponsorship grants up to ₹40,000 per patient for oncology medication costs.",
  },
  {
    donorName: "Dr. Suresh Patil Oncology Angel Fund",
    organizationOrTrust: "Independent Philanthropist",
    donorType: "INDIVIDUAL_DONOR",
    focusAreas: "Esophageal Cancer, Elderly Patients, Dysphagia Nutritional Supplements",
    city: "Kolhapur",
    state: "Maharashtra",
    maxSponsorshipBudget: 750000,
    contactEmail: "patil.angelfund@gmail.com",
    contactPhone: "+91-94220-88310",
    verifiedStatus: true,
    isAcceptingCases: true,
    bio: "Retired surgeon and philanthropist sponsoring chemo premedications, oral nutritional formulas, and radiation therapy for cancer patients in southern Maharashtra.",
  },
];

@Injectable()
export class FinancialAidService {
  private readonly logger = new Logger(FinancialAidService.name);

  constructor(private readonly prisma: PrismaService) {}

  async resolveTenantId(tenantId?: string): Promise<string> {
    if (tenantId && tenantId !== 'undefined' && tenantId !== 'null') {
      try {
        await this.prisma.$executeRaw`SELECT set_config('app.current_tenant', ${tenantId}, true)`;
      } catch (e) {}
      return tenantId;
    }
    const first = await this.prisma.tenant.findFirst();
    const resolved = first?.id || '240e0a7f-8d51-4cc0-8380-bfc441991eb3';
    try {
      await this.prisma.$executeRaw`SELECT set_config('app.current_tenant', ${resolved}, true)`;
    } catch (e) {}
    return resolved;
  }

  /**
   * Automatically initializes all official Indian schemes and trusts for the tenant if empty
   */
  async ensureDefaultSchemes(rawTenantId?: string) {
    const tenantId = await this.resolveTenantId(rawTenantId);
    const count = await this.prisma.financialAidScheme.count({
      where: { tenantId },
    });

    if (count === 0) {
      this.logger.log(`Seeding official Indian cancer aid schemes for tenant ${tenantId}...`);
      for (const scheme of OFFICIAL_INDIAN_CANCER_SCHEMES) {
        await this.prisma.financialAidScheme.create({
          data: {
            tenantId,
            ...scheme,
          },
        });
      }

      for (const donor of INITIAL_PHILANTHROPISTS) {
        await this.prisma.philanthropistDonor.create({
          data: {
            tenantId,
            ...donor,
          },
        });
      }
    }
  }

  // -------------------------------------------------------------
  // Schemes Directory
  // -------------------------------------------------------------

  async getSchemes(rawTenantId?: string, category?: AidOrgCategory, search?: string) {
    const tenantId = await this.resolveTenantId(rawTenantId);
    await this.ensureDefaultSchemes(tenantId);

    const where: any = { tenantId, isActive: true };
    if (category) {
      where.category = category;
    }
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { nameRegional: { contains: search, mode: 'insensitive' } },
        { organizationName: { contains: search, mode: 'insensitive' } },
        { benefitDescription: { contains: search, mode: 'insensitive' } },
      ];
    }

    return this.prisma.financialAidScheme.findMany({
      where,
      orderBy: [{ maxGrantAmount: 'desc' }, { name: 'asc' }],
    });
  }

  async getSchemeById(rawTenantId: string | undefined, id: string) {
    const tenantId = await this.resolveTenantId(rawTenantId);
    await this.ensureDefaultSchemes(tenantId);
    const scheme = await this.prisma.financialAidScheme.findFirst({
      where: { id },
    });
    if (!scheme) {
      throw new NotFoundException(`Financial aid scheme with ID ${id} not found.`);
    }
    return scheme;
  }

  async createScheme(rawTenantId: string | undefined, dto: CreateSchemeDto) {
    const tenantId = await this.resolveTenantId(rawTenantId);
    await this.ensureDefaultSchemes(tenantId);
    return this.prisma.financialAidScheme.create({
      data: {
        tenantId,
        name: dto.name,
        nameRegional: dto.nameRegional || null,
        category: dto.category,
        organizationName: dto.organizationName,
        maxGrantAmount: dto.maxGrantAmount || null,
        benefitDescription: dto.benefitDescription,
        incomeLimitAnnual: dto.incomeLimitAnnual || null,
        eligibleRationCards: dto.eligibleRationCards || 'All',
        eligibleHospitals: dto.eligibleHospitals || 'All Empaneled Hospitals',
        officialPortalUrl: dto.officialPortalUrl || null,
        helplineNumber: dto.helplineNumber || null,
        physicalAddress: dto.physicalAddress || null,
        stepByStepProcedure: dto.stepByStepProcedure,
        requiredDocuments: dto.requiredDocuments || [],
        processingDays: dto.processingDays || 14,
        isActive: dto.isActive !== undefined ? dto.isActive : true,
      },
    });
  }

  async updateScheme(rawTenantId: string | undefined, id: string, dto: UpdateSchemeDto) {
    const tenantId = await this.resolveTenantId(rawTenantId);
    const existing = await this.prisma.financialAidScheme.findFirst({
      where: { id },
    });
    if (!existing) {
      throw new NotFoundException(`Scheme with ID ${id} not found.`);
    }

    return this.prisma.financialAidScheme.update({
      where: { id },
      data: {
        name: dto.name,
        nameRegional: dto.nameRegional,
        category: dto.category,
        organizationName: dto.organizationName,
        maxGrantAmount: dto.maxGrantAmount,
        benefitDescription: dto.benefitDescription,
        incomeLimitAnnual: dto.incomeLimitAnnual,
        eligibleRationCards: dto.eligibleRationCards,
        eligibleHospitals: dto.eligibleHospitals,
        officialPortalUrl: dto.officialPortalUrl,
        helplineNumber: dto.helplineNumber,
        physicalAddress: dto.physicalAddress,
        stepByStepProcedure: dto.stepByStepProcedure,
        requiredDocuments: dto.requiredDocuments,
        processingDays: dto.processingDays,
        isActive: dto.isActive !== undefined ? dto.isActive : existing.isActive,
      },
    });
  }

  async deleteScheme(rawTenantId: string | undefined, id: string) {
    const tenantId = await this.resolveTenantId(rawTenantId);
    const existing = await this.prisma.financialAidScheme.findFirst({
      where: { id },
    });
    if (!existing) {
      throw new NotFoundException(`Scheme with ID ${id} not found.`);
    }

    return this.prisma.financialAidScheme.delete({
      where: { id },
    });
  }

  // -------------------------------------------------------------
  // Treatment Cost Estimates & Deficit Dossier
  // -------------------------------------------------------------

  async createTreatmentEstimate(rawTenantId: string | undefined, dto: CreateEstimateDto) {
    const tenantId = await this.resolveTenantId(rawTenantId);
    const timestamp = Date.now().toString().slice(-4);
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const estimateNumber = `EST-${new Date().getFullYear()}-${timestamp}${randomSuffix}`;

    const estimate = await this.prisma.treatmentCostEstimate.create({
      data: {
        tenantId,
        estimateNumber,
        patientId: dto.patientId || null,
        patientName: dto.patientName,
        cancerType: dto.cancerType,
        cancerStage: dto.cancerStage,
        hospitalName: dto.hospitalName,
        treatingDoctorName: dto.treatingDoctorName,
        treatingDoctorRegNo: dto.treatingDoctorRegNo,
        surgeryCost: dto.surgeryCost || 0,
        chemoCost: dto.chemoCost || 0,
        radiationCost: dto.radiationCost || 0,
        targetedMedCost: dto.targetedMedCost || 0,
        icuBedCost: dto.icuBedCost || 0,
        investigationCost: dto.investigationCost || 0,
        totalEstimatedCost: dto.totalEstimatedCost,
        patientContribution: dto.patientContribution || 0,
        netDeficitRequired: dto.netDeficitRequired,
        clinicalJustification: dto.clinicalJustification,
        hospitalAccountName: dto.hospitalAccountName || 'City Cancer Care Trust Fund',
        hospitalBankName: dto.hospitalBankName || 'State Bank of India',
        hospitalAccountNumber: dto.hospitalAccountNumber || '38291048291',
        hospitalIfscCode: dto.hospitalIfscCode || 'SBIN0000412',
      },
    });

    return estimate;
  }

  async getEstimates(rawTenantId?: string, patientId?: string) {
    const tenantId = await this.resolveTenantId(rawTenantId);
    const where: any = { tenantId };
    if (patientId) {
      where.patientId = patientId;
    }
    return this.prisma.treatmentCostEstimate.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        applications: {
          select: {
            id: true,
            status: true,
            appliedAmount: true,
            sanctionedAmount: true,
            scheme: { select: { name: true } },
          },
        },
      },
    });
  }

  async getEstimateById(rawTenantId: string | undefined, id: string) {
    const tenantId = await this.resolveTenantId(rawTenantId);
    const estimate = await this.prisma.treatmentCostEstimate.findFirst({
      where: { id },
      include: {
        patient: true,
        applications: {
          include: { scheme: true },
        },
      },
    });
    if (!estimate) {
      throw new NotFoundException(`Estimate with ID ${id} not found.`);
    }
    return estimate;
  }

  // -------------------------------------------------------------
  // Aid Applications Tracker
  // -------------------------------------------------------------

  async createAidApplication(rawTenantId: string | undefined, dto: CreateAidApplicationDto) {
    const tenantId = await this.resolveTenantId(rawTenantId);
    // Generate application reference number
    const refYear = new Date().getFullYear();
    const refRandom = Math.floor(10000 + Math.random() * 90000);
    const applicationRefNumber = `AID-${refYear}-${refRandom}`;

    const application = await this.prisma.aidApplication.create({
      data: {
        tenantId,
        patientId: dto.patientId || null,
        schemeId: dto.schemeId,
        estimateId: dto.estimateId || null,
        applicantName: dto.applicantName,
        applicantRelation: dto.applicantRelation,
        applicantContact: dto.applicantContact,
        appliedAmount: dto.appliedAmount,
        status: AidApplicationStatus.SUBMITTED,
        applicationRefNumber,
        documentsAttached: dto.documentsAttached || [
          'Hospital Cost Estimate Certificate',
          'Biopsy / Histopathology Report',
          'Aadhaar Card',
          'Ration Card',
          'Income Certificate',
        ],
        remarks: dto.remarks || 'Application compiled and submitted via CareRelief Navigator.',
      },
      include: {
        scheme: true,
        estimate: true,
      },
    });

    return application;
  }

  async getApplications(rawTenantId?: string, patientId?: string) {
    const tenantId = await this.resolveTenantId(rawTenantId);
    const where: any = { tenantId };
    if (patientId) {
      where.patientId = patientId;
    }

    return this.prisma.aidApplication.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        scheme: true,
        estimate: true,
      },
    });
  }

  async updateApplicationStatus(rawTenantId: string | undefined, id: string, dto: UpdateAidApplicationStatusDto) {
    const tenantId = await this.resolveTenantId(rawTenantId);
    const existing = await this.prisma.aidApplication.findFirst({
      where: { id },
    });
    if (!existing) {
      throw new NotFoundException(`Aid Application with ID ${id} not found.`);
    }

    const data: any = {
      status: dto.status,
    };
    if (dto.sanctionedAmount !== undefined) data.sanctionedAmount = dto.sanctionedAmount;
    if (dto.applicationRefNumber) data.applicationRefNumber = dto.applicationRefNumber;
    if (dto.sanctionLetterNumber) data.sanctionLetterNumber = dto.sanctionLetterNumber;
    if (dto.remarks) data.remarks = dto.remarks;

    if (dto.status === AidApplicationStatus.SANCTIONED && !existing.sanctionDate) {
      data.sanctionDate = new Date();
    }
    if (dto.status === AidApplicationStatus.DISBURSED && !existing.disbursementDate) {
      data.disbursementDate = new Date();
    }

    return this.prisma.aidApplication.update({
      where: { id },
      data,
      include: {
        scheme: true,
        estimate: true,
      },
    });
  }

  // -------------------------------------------------------------
  // Philanthropist Donors & Pledges
  // -------------------------------------------------------------

  async getDonors(rawTenantId?: string) {
    const tenantId = await this.resolveTenantId(rawTenantId);
    await this.ensureDefaultSchemes(tenantId);
    return this.prisma.philanthropistDonor.findMany({
      where: { tenantId, verifiedStatus: true },
      orderBy: { maxSponsorshipBudget: 'desc' },
      include: {
        pledges: {
          select: {
            id: true,
            pledgedAmount: true,
            paymentStatus: true,
            createdAt: true,
          },
        },
      },
    });
  }

  async createDonorPledge(rawTenantId: string | undefined, dto: CreateDonorPledgeDto) {
    const tenantId = await this.resolveTenantId(rawTenantId);
    return this.prisma.donorPledge.create({
      data: {
        tenantId,
        donorId: dto.donorId,
        patientId: dto.patientId || null,
        estimateId: dto.estimateId || null,
        pledgedAmount: dto.pledgedAmount,
        paymentStatus: 'PLEDGED',
        transactionRef: dto.transactionRef || `TXN-${Date.now().toString().slice(-6)}`,
        note: dto.note || 'Direct donor contribution toward patient cancer treatment deficit.',
      },
      include: {
        donor: true,
      },
    });
  }

  // -------------------------------------------------------------
  // Summary Analytics
  // -------------------------------------------------------------

  async getSummaryMetrics(rawTenantId?: string) {
    const tenantId = await this.resolveTenantId(rawTenantId);
    await this.ensureDefaultSchemes(tenantId);

    const [
      totalSchemes,
      totalEstimates,
      totalApplications,
      approvedApplications,
      totalDonors,
      totalPledges,
    ] = await Promise.all([
      this.prisma.financialAidScheme.count({ where: { tenantId, isActive: true } }),
      this.prisma.treatmentCostEstimate.count({ where: { tenantId } }),
      this.prisma.aidApplication.count({ where: { tenantId } }),
      this.prisma.aidApplication.findMany({
        where: {
          tenantId,
          status: { in: [AidApplicationStatus.SANCTIONED, AidApplicationStatus.DISBURSED] },
        },
        select: { sanctionedAmount: true },
      }),
      this.prisma.philanthropistDonor.count({ where: { tenantId, verifiedStatus: true } }),
      this.prisma.donorPledge.findMany({
        where: { tenantId },
        select: { pledgedAmount: true },
      }),
    ]);

    const totalSanctionedAmount = approvedApplications.reduce(
      (sum, app) => sum + (app.sanctionedAmount || 0),
      0,
    );
    const totalPledgedAmount = totalPledges.reduce(
      (sum, p) => sum + (p.pledgedAmount || 0),
      0,
    );

    return {
      totalSchemes,
      totalEstimates,
      totalApplications,
      approvedCount: approvedApplications.length,
      totalSanctionedAmount,
      totalDonors,
      totalPledgedAmount,
    };
  }
}
