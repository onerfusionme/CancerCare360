import { useQuery } from '@tanstack/react-query';
import { consultationService } from '../services/consultation.service';

export const useConsultationReadiness = (patientId: string) => useQuery({
  queryKey: ['consultation-readiness', patientId],
  queryFn: () => consultationService.getConsultationReadiness(patientId),
  enabled: !!patientId
});
