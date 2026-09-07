import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { aiService } from '../services/ai.service';
import { AiExtractionResult, AiConsultationSummary, AiGapExplanation, AiEducationDraft, AiInteractionLog, AiGovernanceStats } from '../types/ai';

export function useAiExtraction() {
  return useMutation<AiExtractionResult, Error, { documentId: string; options?: any }>({
    mutationFn: ({ documentId, options }) => aiService.extractDocument(documentId, options),
  });
}

export function useAiConsultationSummary(patientId: string, journeyId?: string) {
  return useQuery<AiConsultationSummary, Error>({
    queryKey: ['ai', 'consultation-summary', patientId, journeyId],
    queryFn: () => aiService.summarizeConsultation(patientId, journeyId),
    enabled: !!patientId,
  });
}

export function useAiGapExplanation() {
  return useMutation<AiGapExplanation, Error, { gapType: string; gapData: any }>({
    mutationFn: ({ gapType, gapData }) => aiService.explainCareGap(gapType, gapData),
  });
}

export function useAiEducationDraft() {
  return useMutation<AiEducationDraft, Error, { topic: string; language: string; keyPoints: string[] }>({
    mutationFn: ({ topic, language, keyPoints }) => aiService.draftEducation(topic, language, keyPoints),
  });
}

export function useAiLogs(filter?: any) {
  return useQuery<AiInteractionLog[], Error>({
    queryKey: ['ai', 'logs', filter],
    queryFn: () => aiService.getLogs(filter),
  });
}

export function useAiGovernanceStats() {
  return useQuery<AiGovernanceStats, Error>({
    queryKey: ['ai', 'governance-stats'],
    queryFn: () => aiService.getGovernanceStats(),
  });
}

export function useReviewAiInteraction() {
  const queryClient = useQueryClient();
  return useMutation<void, Error, { id: string; reviewStatus: string; reviewNotes?: string }>({
    mutationFn: ({ id, reviewStatus, reviewNotes }) => aiService.reviewInteraction(id, reviewStatus, reviewNotes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai', 'logs'] });
      queryClient.invalidateQueries({ queryKey: ['ai', 'governance-stats'] });
    }
  });
}
