import apiClient from './api-client';
import {
  RoleDashboardData,
  CareContinuityMetrics,
  InvestigationTATMetrics,
  ReportRequestDto,
  ReportResult,
} from '../types/analytics';

export const getRoleDashboard = async (role: string): Promise<RoleDashboardData> => {
  const { data } = await apiClient.get(`/api/v1/analytics/dashboard?role=${role}`);
  return data;
};

export const getCareContinuity = async (): Promise<CareContinuityMetrics> => {
  const { data } = await apiClient.get('/api/v1/analytics/care-continuity');
  return data;
};

export const getInvestigationTAT = async (): Promise<InvestigationTATMetrics[]> => {
  const { data } = await apiClient.get('/api/v1/analytics/investigation-tat');
  return data;
};

export const generateReport = async (dto: ReportRequestDto): Promise<ReportResult> => {
  const { data } = await apiClient.post('/api/v1/analytics/reports', dto);
  return data;
};

export const exportPatientFhir = async (patientId: string): Promise<Blob> => {
  const { data } = await apiClient.get(`/api/v1/patients/${patientId}/export-fhir`, { responseType: 'blob' });
  return data;
};
