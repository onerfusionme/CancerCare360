import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { documentService } from '../services/document.service';
import { DocumentFilter, UploadDocumentDto, VerificationStatus } from '../types/document';

export const useDocuments = (filters?: DocumentFilter) => useQuery({
  queryKey: ['documents', filters],
  queryFn: () => documentService.getDocuments(filters)
});

export const useUploadDocument = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ file, metadata }: { file: File, metadata: UploadDocumentDto }) => documentService.uploadDocument(file, metadata),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
    }
  });
};

export const useVerifyDocument = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status, notes }: { id: string, status: VerificationStatus, notes?: string }) => documentService.verifyDocument(id, status, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
    }
  });
};
