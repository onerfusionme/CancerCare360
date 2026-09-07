import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { journeyService } from '../services/journey.service';

export const useJourneys = (filters?: any) => useQuery({
  queryKey: ['journeys', filters],
  queryFn: () => journeyService.getJourneys(filters)
});

export const useJourney = (id: string) => useQuery({
  queryKey: ['journey', id],
  queryFn: () => journeyService.getJourney(id),
  enabled: !!id
});

export const usePatientTimeline = (patientId: string) => useQuery({
  queryKey: ['timeline', 'patient', patientId],
  queryFn: () => journeyService.getPatientTimeline(patientId),
  enabled: !!patientId
});

export const useCreateJourney = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: any) => journeyService.createJourney(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['journeys'] });
    }
  });
};

export const useUpdateJourney = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string, dto: any }) => journeyService.updateJourney(id, dto),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['journey', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['journeys'] });
    }
  });
};
