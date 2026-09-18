import apiClient from './api-client';
import { CreateInvestigationDto, UpdateInvestigationDto, InvestigationFilter, Investigation } from '../types/investigation';

export const investigationService = {
  getInvestigations: async (filters?: InvestigationFilter): Promise<any[]> => {
    const response = await apiClient.get('/api/v1/investigations', { params: filters });
    const rawList = response.data?.data && Array.isArray(response.data.data)
      ? response.data.data
      : (Array.isArray(response.data) ? response.data : []);

    return rawList.map((item: any) => ({
      id: item.id,
      patientId: item.patientId,
      journeyId: item.journeyId,
      type: item.type || item.investigationType,
      investigationType: item.investigationType || item.type,
      status: item.status,
      orderedBy: typeof item.orderedBy === 'object' && item.orderedBy 
        ? `Dr. ${item.orderedBy.firstName || ''} ${item.orderedBy.lastName || ''}`.trim() 
        : (item.orderedBy || 'Attending Physician'),
      orderedDate: item.orderedDate || item.orderedAt,
      orderedAt: item.orderedAt || item.orderedDate,
      scheduledDate: item.scheduledDate || item.scheduledAt,
      collectedDate: item.collectedDate || item.performedAt,
      performedAt: item.performedAt || item.collectedDate,
      reportDate: item.reportDate || item.reportAvailableAt || item.reportGeneratedAt,
      reportAvailableAt: item.reportAvailableAt || item.reportDate,
      reviewedDate: item.reviewedDate || item.reviewedAt,
      reviewedAt: item.reviewedAt || item.reviewedDate,
      reviewedBy: typeof item.reviewedBy === 'object' && item.reviewedBy 
        ? `Dr. ${item.reviewedBy.firstName || ''} ${item.reviewedBy.lastName || ''}`.trim() 
        : null,
      turnaroundTimeDays: item.turnaroundTimeDays ?? (item.turnaroundHours ? Math.round(item.turnaroundHours / 24) : 1),
      turnaroundHours: item.turnaroundHours,
      notes: item.notes || item.resultSummary,
      resultSummary: item.resultSummary || item.notes,
      documentId: item.documentId || item.relatedDocumentId,
      slaHours: item.slaHours || 48,
      elapsedHours: item.elapsedHours || 0,
      isBreached: !!item.isBreached,
      hoursRemaining: item.hoursRemaining ?? 0,
      urgencyStatus: item.urgencyStatus || 'ON_TRACK',
      isCriticalAbnormal: !!item.isCriticalAbnormal,
      patient: item.patient ? {
        id: item.patient.id,
        name: item.patient.name || `${item.patient.firstName || ''} ${item.patient.lastName || ''}`.trim() || 'Patient',
        mrn: item.patient.mrn || '—',
      } : null,
    }));
  },
  
  getInvestigation: async (id: string): Promise<any> => {
    const response = await apiClient.get(`/api/v1/investigations/${id}`);
    return response.data?.data || response.data;
  },
  
  createInvestigation: async (dto: any): Promise<any> => {
    const payload = {
      patientId: dto.patientId,
      journeyId: dto.journeyId,
      investigationType: dto.investigationType || dto.type,
      scheduledAt: dto.scheduledDate || dto.scheduledAt,
      notes: dto.notes || dto.resultSummary,
    };
    const response = await apiClient.post('/api/v1/investigations', payload);
    return response.data?.data || response.data;
  },
  
  updateInvestigation: async (id: string, dto: any): Promise<any> => {
    const response = await apiClient.patch(`/api/v1/investigations/${id}`, dto);
    return response.data?.data || response.data;
  },
  
  deleteInvestigation: async (id: string): Promise<boolean> => {
    const response = await apiClient.delete(`/api/v1/investigations/${id}`);
    return response.data;
  },
  
  getSummary: async (): Promise<any> => {
    const response = await apiClient.get('/api/v1/investigations/summary');
    return response.data?.data || response.data;
  },

  getPendingInvestigations: async (): Promise<any[]> => {
    const response = await apiClient.get('/api/v1/investigations', { params: { status: 'ORDERED' } });
    return response.data?.data || response.data || [];
  },
};
