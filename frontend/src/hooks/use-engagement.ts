import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { engagementService } from '../services/engagement.service';
import { EducationContent, Campaign, PatientPreferences, ConsentArtefact } from '../types/engagement';

export const useEducationArticles = () => {
  return useQuery({
    queryKey: ['education-articles'],
    queryFn: engagementService.getArticles,
  });
};

export const useCampaigns = () => {
  return useQuery({
    queryKey: ['campaigns'],
    queryFn: engagementService.getCampaigns,
  });
};

export const usePortalProfile = () => {
  return useQuery({
    queryKey: ['portal-profile'],
    queryFn: engagementService.getPortalProfile,
  });
};

export const usePortalAppointments = () => {
  return useQuery({
    queryKey: ['portal-appointments'],
    queryFn: engagementService.getPortalAppointments,
  });
};

export const usePortalTimeline = () => {
  return useQuery({
    queryKey: ['portal-timeline'],
    queryFn: engagementService.getPortalTimeline,
  });
};

export const usePortalDocuments = () => {
  return useQuery({
    queryKey: ['portal-documents'],
    queryFn: engagementService.getPortalDocuments,
  });
};

export const usePortalEducation = (lang?: string) => {
  return useQuery({
    queryKey: ['portal-education', lang],
    queryFn: () => engagementService.getPortalEducation(lang),
  });
};

export const useUpdatePreferences = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: Partial<PatientPreferences>) => engagementService.updatePreferences(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portal-profile'] });
    },
  });
};
