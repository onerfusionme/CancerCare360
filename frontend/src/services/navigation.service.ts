import apiClient from './api-client';
import {
  PatientBarrier,
  CreateBarrierInput,
  UpdateBarrierInput,
  ResolveBarrierInput,
  TaskHandoffInput,
  RecoverAppointmentInput,
  CommandCenterMetrics,
  CommandCenterTask,
  BarrierAnalytics,
  OperationalBottlenecks,
} from '@/types/navigation';

export const navigationService = {
  // Barrier Assessment & Management
  createBarrier: async (dto: CreateBarrierInput): Promise<PatientBarrier> => {
    const response = await apiClient.post('/api/v1/navigation/barriers', dto);
    return response.data?.data || response.data;
  },

  updateBarrier: async (id: string, dto: UpdateBarrierInput): Promise<PatientBarrier> => {
    const response = await apiClient.patch(`/api/v1/navigation/barriers/${id}`, dto);
    return response.data?.data || response.data;
  },

  resolveBarrier: async (id: string, dto: ResolveBarrierInput): Promise<PatientBarrier> => {
    const response = await apiClient.patch(`/api/v1/navigation/barriers/${id}/resolve`, dto);
    return response.data?.data || response.data;
  },

  getPatientBarriers: async (patientId: string): Promise<PatientBarrier[]> => {
    const response = await apiClient.get(`/api/v1/navigation/barriers/patient/${patientId}`);
    const data = response.data?.data || response.data;
    return Array.isArray(data) ? data : [];
  },

  // Analytics & Bottlenecks
  getBarrierAnalytics: async (): Promise<BarrierAnalytics> => {
    const response = await apiClient.get('/api/v1/navigation/analytics/barriers');
    return response.data?.data || response.data;
  },

  getOperationalBottlenecks: async (): Promise<OperationalBottlenecks> => {
    const response = await apiClient.get('/api/v1/navigation/analytics/bottlenecks');
    return response.data?.data || response.data;
  },

  // Follow-Up Command Center
  getCommandCenter: async (): Promise<{ metrics: CommandCenterMetrics; tasks: CommandCenterTask[] }> => {
    const response = await apiClient.get('/api/v1/follow-up-tasks/command-center');
    const result = response.data?.data || response.data;
    return {
      metrics: result.metrics || {
        totalRequiringAttention: 0,
        criticalCount: 0,
        overdueCount: 0,
        dueTodayCount: 0,
        missedApptsCount: 0,
        noFutureApptCount: 0,
        stalledOutreachCount: 0,
        escalatedCount: 0,
        recoveredCount: 0,
      },
      tasks: Array.isArray(result.tasks) ? result.tasks : [],
    };
  },

  // Inter-Role Task Handoff
  handoffTask: async (taskId: string, dto: TaskHandoffInput): Promise<any> => {
    const response = await apiClient.post(`/api/v1/follow-up-tasks/${taskId}/handoff`, dto);
    return response.data?.data || response.data;
  },

  // Appointment Recovery (Closed-Loop Resolution)
  recoverAppointment: async (taskId: string, dto: RecoverAppointmentInput): Promise<any> => {
    const response = await apiClient.post(`/api/v1/follow-up-tasks/${taskId}/recover-appointment`, dto);
    return response.data?.data || response.data;
  },

  // Care Gap Triggers
  detectGaps: async (): Promise<any[]> => {
    const response = await apiClient.get('/api/v1/care-gaps/detect');
    const data = response.data?.data || response.data;
    return Array.isArray(data) ? data : [];
  },

  generateTasksFromGaps: async (): Promise<any> => {
    const response = await apiClient.post('/api/v1/care-gaps/generate-tasks');
    return response.data?.data || response.data;
  },

  // Longitudinal Continuity of Care Analytics
  getContinuityAnalytics: async (): Promise<any> => {
    const response = await apiClient.get('/api/v1/analytics/continuity');
    return response.data?.data || response.data;
  },
};
