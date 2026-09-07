import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { careGapService } from '@/services/care-gap.service';
import { CreateRuleDto } from '@/types/care-gap';

export function useCareGapRules() {
  return useQuery({
    queryKey: ['care-gap-rules'],
    queryFn: () => careGapService.getRules()
  });
}

export function useDetectGaps() {
  return useQuery({
    queryKey: ['detected-care-gaps'],
    queryFn: () => careGapService.detectGaps(),
    enabled: false
  });
}

export function useGenerateTasks() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => careGapService.generateTasks(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    }
  });
}
