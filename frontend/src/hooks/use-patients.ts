import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { patientService } from '@/services/patient.service';
import { PatientFilter, CreatePatientDto, UpdatePatientDto } from '@/types/patient';

export const patientKeys = {
  all: ['patients'] as const,
  lists: () => [...patientKeys.all, 'list'] as const,
  list: (filters: PatientFilter) => [...patientKeys.lists(), filters] as const,
  details: () => [...patientKeys.all, 'detail'] as const,
  detail: (id: string) => [...patientKeys.details(), id] as const,
  journeys: () => [...patientKeys.all, 'journey'] as const,
  journey: (id: string) => [...patientKeys.journeys(), id] as const,
};

export function usePatients(filters: PatientFilter = {}) {
  return useQuery({
    queryKey: patientKeys.list(filters),
    queryFn: () => patientService.getPatients(filters),
    placeholderData: (prev) => prev,
  });
}

export function usePatient(id: string) {
  return useQuery({
    queryKey: patientKeys.detail(id),
    queryFn: () => patientService.getPatient(id),
    enabled: !!id,
  });
}

export function usePatientJourney(id: string) {
  return useQuery({
    queryKey: patientKeys.journey(id),
    queryFn: () => patientService.getPatientJourney(id),
    enabled: !!id,
  });
}

export function useCreatePatient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreatePatientDto) => patientService.createPatient(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: patientKeys.lists() });
    },
  });
}

export function useUpdatePatient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdatePatientDto }) => 
      patientService.updatePatient(id, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: patientKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: patientKeys.lists() });
    },
  });
}

export function useDeletePatient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => patientService.deletePatient(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: patientKeys.lists() });
    },
  });
}
