import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { treatmentService } from '../services/treatment.service';
import { TreatmentFilter, CreateTreatmentDto, UpdateTreatmentDto } from '../types/treatment';

export const useTreatments = (filters?: TreatmentFilter) => useQuery({
  queryKey: ['treatments', filters],
  queryFn: () => treatmentService.getTreatments(filters)
});

export const usePatientTreatments = (patientId: string) => useQuery({
  queryKey: ['treatments', 'patient', patientId],
  queryFn: () => treatmentService.getPatientTreatments(patientId),
  enabled: !!patientId
});

export const useCreateTreatment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateTreatmentDto) => treatmentService.createTreatment(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['treatments'] });
    }
  });
};

export const useUpdateTreatment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string, dto: UpdateTreatmentDto }) => treatmentService.updateTreatment(id, dto),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['treatments'] });
    }
  });
};
