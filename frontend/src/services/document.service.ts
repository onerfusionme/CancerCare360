import apiClient from './api-client';
import { UploadDocumentDto, DocumentFilter, VerificationStatus } from '../types/document';

export const documentService = {
  getDocuments: (filters?: DocumentFilter) => apiClient.get('/api/v1/documents', { params: filters }).then(res => {
    if (res.data && Array.isArray(res.data.data)) {
      return res.data.data;
    }
    return Array.isArray(res.data) ? res.data : [];
  }),
  uploadDocument: (file: File, metadata: UploadDocumentDto) => {
    const formData = new FormData();
    formData.append('file', file);
    if (metadata.patientId) {
      formData.append('patientId', metadata.patientId);
    }
    if (metadata.journeyId) {
      formData.append('journeyId', metadata.journeyId);
    }
    const docType = (metadata as any).documentType || metadata.type;
    if (docType) {
      formData.append('documentType', docType);
    }
    if (metadata.source) {
      formData.append('source', metadata.source);
    }
    if (metadata.notes) {
      formData.append('notes', metadata.notes);
    }
    formData.append('metadata', JSON.stringify(metadata));
    return apiClient.post('/api/v1/documents/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }).then(res => res.data?.data || res.data);
  },
  getDocumentDownloadUrl: (id: string) => apiClient.get(`/api/v1/documents/${id}/download`).then(res => res.data?.data || res.data),
  verifyDocument: (id: string, status: VerificationStatus, notes?: string) => apiClient.patch(`/api/v1/documents/${id}/verify`, { status, notes }).then(res => res.data?.data || res.data),
  deleteDocument: (id: string) => apiClient.delete(`/api/v1/documents/${id}`).then(res => res.data?.data || res.data)
};
