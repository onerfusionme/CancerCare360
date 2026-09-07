import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { investigationService } from '../services/investigation.service';
import { InvestigationFilter, CreateInvestigationDto, UpdateInvestigationDto } from '../types/investigation';

export const useInvestigations = (filters?: InvestigationFilter) => useQuery({
  queryKey: ['investigations', filters],
  queryFn: () => investigationService.getInvestigations(filters)
});

export const useInvestigation = (id: string) => useQuery({
  queryKey: ['investigation', id],
  queryFn: () => investigationService.getInvestigation(id),
  enabled: !!id
});

export const usePendingInvestigations = () => useQuery({
  queryKey: ['investigations', 'pending'],
  queryFn: () => investigationService.getPendingInvestigations()
});

export const useCreateInvestigation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateInvestigationDto) => investigationService.createInvestigation(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['investigations'] });
    }
  });
};

export const useUpdateInvestigation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string, dto: UpdateInvestigationDto }) => investigationService.updateInvestigation(id, dto),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['investigation', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['investigations'] });
    }
  });
};
