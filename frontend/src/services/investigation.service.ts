import apiClient from './api-client';
import { CreateInvestigationDto, UpdateInvestigationDto, InvestigationFilter, Investigation, InvestigationStatus, InvestigationType } from '../types/investigation';

export const investigationService = {
  getInvestigations: async (filters?: InvestigationFilter): Promise<Investigation[]> => {
    const response = await apiClient.get('/api/v1/investigations', { params: filters });
    const rawList = response.data?.data && Array.isArray(response.data.data)
      ? response.data.data
      : (Array.isArray(response.data) ? response.data : []);

    return rawList.map((item: any) => ({
      id: item.id,
      patientId: item.patientId,
      journeyId: item.journeyId,
      type: item.type || item.investigationType,
      status: item.status,
      orderedBy: typeof item.orderedBy === 'object' && item.orderedBy ? `Dr. ${item.orderedBy.firstName || ''} ${item.orderedBy.lastName || ''}`.trim() : (item.orderedBy || 'Attending Physician'),
      orderedDate: item.orderedDate || item.orderedAt,
      scheduledDate: item.scheduledDate || item.scheduledAt,
      collectedDate: item.collectedDate || item.performedAt,
      reportDate: item.reportDate || item.reportAvailableAt || item.reportGeneratedAt,
      reviewedDate: item.reviewedDate || item.reviewedAt,
      turnaroundTimeDays: item.turnaroundTimeDays ?? (item.turnaroundHours ? Math.round(item.turnaroundHours / 24) : 1),
      notes: item.notes || item.resultSummary,
      documentId: item.documentId || item.relatedDocumentId,
      patient: item.patient ? {
        id: item.patient.id,
        name: item.patient.name || `${item.patient.firstName || ''} ${item.patient.lastName || ''}`.trim() || 'Patient',
        mrn: item.patient.mrn || 'MRN-ONC-001'
      } : null
    }));
  },
  
  getInvestigation: async (id: string): Promise<Investigation> => {
    const response = await apiClient.get(`/api/v1/investigations/${id}`);
    const item = response.data;
    if (!item) return item;
    return {
      id: item.id,
      patientId: item.patientId,
      journeyId: item.journeyId,
      type: item.type || item.investigationType,
      status: item.status,
      orderedBy: typeof item.orderedBy === 'object' && item.orderedBy ? `Dr. ${item.orderedBy.firstName || ''} ${item.orderedBy.lastName || ''}`.trim() : (item.orderedBy || 'Attending Physician'),
      orderedDate: item.orderedDate || item.orderedAt,
      scheduledDate: item.scheduledDate || item.scheduledAt,
      collectedDate: item.collectedDate || item.performedAt,
      reportDate: item.reportDate || item.reportAvailableAt || item.reportGeneratedAt,
      reviewedDate: item.reviewedDate || item.reviewedAt,
      turnaroundTimeDays: item.turnaroundTimeDays ?? (item.turnaroundHours ? Math.round(item.turnaroundHours / 24) : 1),
      notes: item.notes || item.resultSummary,
      documentId: item.documentId || item.relatedDocumentId,
      patient: item.patient ? {
        id: item.patient.id,
        name: item.patient.name || `${item.patient.firstName || ''} ${item.patient.lastName || ''}`.trim() || 'Patient',
        mrn: item.patient.mrn || 'MRN-ONC-001'
      } : null
    };
  },
  
  createInvestigation: async (dto: CreateInvestigationDto): Promise<Investigation> => {
    const response = await apiClient.post('/api/v1/investigations', dto);
    return response.data;
  },
  
  updateInvestigation: async (id: string, dto: UpdateInvestigationDto): Promise<Investigation> => {
    const response = await apiClient.patch(`/api/v1/investigations/${id}`, dto);
    return response.data;
  },
  
  deleteInvestigation: async (id: string): Promise<boolean> => {
    const response = await apiClient.delete(`/api/v1/investigations/${id}`);
    return response.data;
  },
  
  getPendingInvestigations: async (): Promise<Investigation[]> => {
    const response = await apiClient.get('/api/v1/investigations', { params: { status: 'ORDERED' } });
    const rawList = response.data?.data && Array.isArray(response.data.data)
      ? response.data.data
      : (Array.isArray(response.data) ? response.data : []);
    return rawList;
  }
};
