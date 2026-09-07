import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { appointmentService } from '@/services/appointment.service';
import { AppointmentFilter, CreateAppointmentDto } from '@/types/appointment';

export function useAppointments(filter?: AppointmentFilter) {
  return useQuery({
    queryKey: ['appointments', filter],
    queryFn: () => appointmentService.getAppointments(filter)
  });
}

export function useAppointment(id: string) {
  return useQuery({
    queryKey: ['appointment', id],
    queryFn: () => appointmentService.getAppointment(id),
    enabled: !!id
  });
}

export function useTodaysAppointments(doctorId: string) {
  return useQuery({
    queryKey: ['appointments', 'today', doctorId],
    queryFn: () => appointmentService.getTodaysAppointments(doctorId),
    enabled: !!doctorId
  });
}

export function useAvailableSlots(doctorId: string, date: string) {
  return useQuery({
    queryKey: ['slots', doctorId, date],
    queryFn: () => appointmentService.getAvailableSlots(doctorId, date),
    enabled: !!doctorId && !!date
  });
}

export function useCreateAppointment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateAppointmentDto) => appointmentService.createAppointment(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
    }
  });
}

export function useCheckIn() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => appointmentService.checkIn(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
    }
  });
}

export function useStartConsultation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => appointmentService.startConsultation(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
    }
  });
}

export function useCompleteConsultation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => appointmentService.completeConsultation(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
    }
  });
}

export function useCancelAppointment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) => 
      appointmentService.cancel(id, reason || 'Cancelled by clinician'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
    }
  });
}

export function useNoShowRisks(date?: string) {
  return useQuery({
    queryKey: ['appointments', 'no-show-risks', date],
    queryFn: () => appointmentService.getNoShowRisks(date),
  });
}
