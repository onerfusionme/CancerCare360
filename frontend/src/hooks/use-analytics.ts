import { useQuery, useMutation } from '@tanstack/react-query';
import {
  getRoleDashboard,
  getCareContinuity,
  getInvestigationTAT,
  generateReport,
  exportPatientFhir,
} from '../services/analytics.service';
import { ReportRequestDto } from '../types/analytics';

export const useRoleDashboard = (role: string) => {
  return useQuery({
    queryKey: ['dashboard', role],
    queryFn: () => getRoleDashboard(role),
    staleTime: 5 * 60 * 1000, // 5 mins
  });
};

export const useCareContinuity = () => {
  return useQuery({
    queryKey: ['analytics', 'care-continuity'],
    queryFn: getCareContinuity,
  });
};

export const useInvestigationTAT = () => {
  return useQuery({
    queryKey: ['analytics', 'investigation-tat'],
    queryFn: getInvestigationTAT,
  });
};

export const useGenerateReport = () => {
  return useMutation({
    mutationFn: (dto: ReportRequestDto) => generateReport(dto),
  });
};

export const useExportFhir = () => {
  return useMutation({
    mutationFn: (patientId: string) => exportPatientFhir(patientId),
  });
};
