import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { followUpService } from '@/services/follow-up.service';
import { TaskFilter, CreateTaskDto, UpdateTaskDto } from '@/types/follow-up';

export function useTasks(filter?: TaskFilter) {
  return useQuery({
    queryKey: ['tasks', filter],
    queryFn: () => followUpService.getTasks(filter)
  });
}

export function useMyTasks() {
  return useQuery({
    queryKey: ['tasks', 'my'],
    queryFn: () => followUpService.getMyTasks()
  });
}

export function useOverdueTasks() {
  return useQuery({
    queryKey: ['tasks', 'overdue'],
    queryFn: () => followUpService.getOverdueTasks()
  });
}

export function useTaskStats() {
  return useQuery({
    queryKey: ['tasks', 'stats'],
    queryFn: () => followUpService.getDashboardStats()
  });
}

export function useCreateTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateTaskDto) => followUpService.createTask(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    }
  });
}

export function useUpdateTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateTaskDto }) => followUpService.updateTask(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    }
  });
}

export function useEscalateTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => followUpService.escalateTask(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    }
  });
}
