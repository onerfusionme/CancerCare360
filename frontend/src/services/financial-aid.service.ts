import apiClient from './api-client';

export enum AidOrgCategory {
  GOVT_CENTRAL = 'GOVT_CENTRAL',
  GOVT_STATE_MAHARASHTRA = 'GOVT_STATE_MAHARASHTRA',
  TEMPLE_TRUST = 'TEMPLE_TRUST',
  CHARITABLE_FOUNDATION = 'CHARITABLE_FOUNDATION',
  CORPORATE_CSR = 'CORPORATE_CSR',
  CROWDFUNDING = 'CROWDFUNDING',
}

export enum AidApplicationStatus {
  DRAFT = 'DRAFT',
  SUBMITTED = 'SUBMITTED',
  UNDER_REVIEW = 'UNDER_REVIEW',
  DOCS_REQUIRED = 'DOCS_REQUIRED',
  SANCTIONED = 'SANCTIONED',
  DISBURSED = 'DISBURSED',
  REJECTED = 'REJECTED',
}

export interface FinancialAidScheme {
  id: string;
  tenantId: string;
  name: string;
  nameRegional?: string;
  category: AidOrgCategory;
  organizationName: string;
  maxGrantAmount?: number;
  benefitDescription: string;
  incomeLimitAnnual?: number;
  eligibleRationCards?: string;
  eligibleHospitals?: string;
  officialPortalUrl?: string;
  helplineNumber?: string;
  physicalAddress?: string;
  stepByStepProcedure: string;
  requiredDocuments: string[];
  processingDays?: number;
  isActive: boolean;
  createdAt: string;
}

export interface TreatmentCostEstimate {
  id: string;
  tenantId: string;
  patientId?: string;
  estimateNumber: string;
  patientName: string;
  cancerType: string;
  cancerStage?: string;
  hospitalName: string;
  treatingDoctorName: string;
  treatingDoctorRegNo?: string;
  surgeryCost: number;
  chemoCost: number;
  radiationCost: number;
  targetedMedCost: number;
  icuBedCost: number;
  investigationCost: number;
  totalEstimatedCost: number;
  patientContribution: number;
  netDeficitRequired: number;
  clinicalJustification: string;
  hospitalAccountName?: string;
  hospitalBankName?: string;
  hospitalAccountNumber?: string;
  hospitalIfscCode?: string;
  createdAt: string;
  applications?: AidApplication[];
}

export interface AidApplication {
  id: string;
  tenantId: string;
  patientId?: string;
  schemeId: string;
  estimateId?: string;
  applicantName: string;
  applicantRelation: string;
  applicantContact: string;
  appliedAmount: number;
  sanctionedAmount: number;
  status: AidApplicationStatus;
  applicationRefNumber?: string;
  sanctionLetterNumber?: string;
  sanctionDate?: string;
  disbursementDate?: string;
  remarks?: string;
  documentsAttached: string[];
  createdAt: string;
  scheme?: FinancialAidScheme;
  estimate?: TreatmentCostEstimate;
}

export interface PhilanthropistDonor {
  id: string;
  tenantId: string;
  donorName: string;
  organizationOrTrust?: string;
  donorType: string;
  focusAreas: string;
  city: string;
  state: string;
  maxSponsorshipBudget?: number;
  contactEmail?: string;
  contactPhone?: string;
  verifiedStatus: boolean;
  isAcceptingCases: boolean;
  bio?: string;
  createdAt: string;
  pledges?: any[];
}

export interface ReliefSummaryMetrics {
  totalSchemes: number;
  totalEstimates: number;
  totalApplications: number;
  approvedCount: number;
  totalSanctionedAmount: number;
  totalDonors: number;
  totalPledgedAmount: number;
}

export interface CreateEstimatePayload {
  patientId?: string;
  patientName: string;
  cancerType: string;
  cancerStage?: string;
  hospitalName: string;
  treatingDoctorName: string;
  treatingDoctorRegNo?: string;
  surgeryCost?: number;
  chemoCost?: number;
  radiationCost?: number;
  targetedMedCost?: number;
  icuBedCost?: number;
  investigationCost?: number;
  totalEstimatedCost: number;
  patientContribution?: number;
  netDeficitRequired: number;
  clinicalJustification: string;
  hospitalAccountName?: string;
  hospitalBankName?: string;
  hospitalAccountNumber?: string;
  hospitalIfscCode?: string;
}

export interface CreateAidApplicationPayload {
  patientId?: string;
  schemeId: string;
  estimateId?: string;
  applicantName: string;
  applicantRelation: string;
  applicantContact: string;
  appliedAmount: number;
  documentsAttached?: string[];
  remarks?: string;
}

export interface UpdateAidStatusPayload {
  status: AidApplicationStatus;
  sanctionedAmount?: number;
  applicationRefNumber?: string;
  sanctionLetterNumber?: string;
  remarks?: string;
}

export interface CreatePledgePayload {
  donorId: string;
  patientId?: string;
  estimateId?: string;
  pledgedAmount: number;
  transactionRef?: string;
  note?: string;
}

export interface CreateSchemePayload {
  name: string;
  nameRegional?: string;
  category: AidOrgCategory;
  organizationName: string;
  maxGrantAmount?: number;
  benefitDescription: string;
  incomeLimitAnnual?: number;
  eligibleRationCards?: string;
  eligibleHospitals?: string;
  officialPortalUrl?: string;
  helplineNumber?: string;
  physicalAddress?: string;
  stepByStepProcedure: string;
  requiredDocuments: string[];
  processingDays?: number;
  isActive?: boolean;
}

export const financialAidService = {
  async getSummary(): Promise<ReliefSummaryMetrics> {
    const res = await apiClient.get<ReliefSummaryMetrics>('/api/v1/relief/summary');
    return res.data;
  },

  async getSchemes(category?: AidOrgCategory, search?: string): Promise<FinancialAidScheme[]> {
    const params: any = {};
    if (category) params.category = category;
    if (search) params.search = search;
    const res = await apiClient.get<FinancialAidScheme[]>('/api/v1/relief/schemes', { params });
    return res.data;
  },

  async getSchemeById(id: string): Promise<FinancialAidScheme> {
    const res = await apiClient.get<FinancialAidScheme>(`/api/v1/relief/schemes/${id}`);
    return res.data;
  },

  async createScheme(payload: CreateSchemePayload): Promise<FinancialAidScheme> {
    const res = await apiClient.post<FinancialAidScheme>('/api/v1/relief/schemes', payload);
    return res.data;
  },

  async updateScheme(id: string, payload: CreateSchemePayload): Promise<FinancialAidScheme> {
    const res = await apiClient.patch<FinancialAidScheme>(`/api/v1/relief/schemes/${id}`, payload);
    return res.data;
  },

  async deleteScheme(id: string): Promise<any> {
    const res = await apiClient.delete(`/api/v1/relief/schemes/${id}`);
    return res.data;
  },

  async createEstimate(payload: CreateEstimatePayload): Promise<TreatmentCostEstimate> {
    const res = await apiClient.post<TreatmentCostEstimate>('/api/v1/relief/estimates', payload);
    return res.data;
  },

  async getEstimates(patientId?: string): Promise<TreatmentCostEstimate[]> {
    const params: any = {};
    if (patientId) params.patientId = patientId;
    const res = await apiClient.get<TreatmentCostEstimate[]>('/api/v1/relief/estimates', { params });
    return res.data;
  },

  async getEstimateById(id: string): Promise<TreatmentCostEstimate> {
    const res = await apiClient.get<TreatmentCostEstimate>(`/api/v1/relief/estimates/${id}`);
    return res.data;
  },

  async createApplication(payload: CreateAidApplicationPayload): Promise<AidApplication> {
    const res = await apiClient.post<AidApplication>('/api/v1/relief/applications', payload);
    return res.data;
  },

  async getApplications(patientId?: string): Promise<AidApplication[]> {
    const params: any = {};
    if (patientId) params.patientId = patientId;
    const res = await apiClient.get<AidApplication[]>('/api/v1/relief/applications', { params });
    return res.data;
  },

  async updateApplicationStatus(id: string, payload: UpdateAidStatusPayload): Promise<AidApplication> {
    const res = await apiClient.patch<AidApplication>(`/api/v1/relief/applications/${id}/status`, payload);
    return res.data;
  },

  async updateApplication(id: string, payload: Partial<CreateAidApplicationPayload>): Promise<AidApplication> {
    const res = await apiClient.put<AidApplication>(`/api/v1/relief/applications/${id}`, payload);
    return res.data;
  },

  async deleteApplication(id: string): Promise<any> {
    const res = await apiClient.delete(`/api/v1/relief/applications/${id}`);
    return res.data;
  },

  async getDonors(): Promise<PhilanthropistDonor[]> {
    const res = await apiClient.get<PhilanthropistDonor[]>('/api/v1/relief/donors');
    return res.data;
  },

  async createDonorPledge(payload: CreatePledgePayload): Promise<any> {
    const res = await apiClient.post('/api/v1/relief/donors/pledge', payload);
    return res.data;
  },
};
