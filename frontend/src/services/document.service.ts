import apiClient from './api-client';
import { UploadDocumentDto, DocumentFilter, VerificationStatus } from '../types/document';

export const documentService = {
  getDocuments: (filters?: DocumentFilter) => apiClient.get('/api/v1/documents', { params: filters }).then(res => res.data),
  uploadDocument: (file: File, metadata: UploadDocumentDto) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('metadata', JSON.stringify(metadata));
    return apiClient.post('/api/v1/documents/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }).then(res => res.data);
  },
  getDocumentDownloadUrl: (id: string) => apiClient.get(`/api/v1/documents/${id}/download`).then(res => res.data),
  verifyDocument: (id: string, status: VerificationStatus, notes?: string) => apiClient.patch(`/api/v1/documents/${id}/verify`, { status, notes }).then(res => res.data),
  deleteDocument: (id: string) => apiClient.delete(`/api/v1/documents/${id}`).then(res => res.data)
};
