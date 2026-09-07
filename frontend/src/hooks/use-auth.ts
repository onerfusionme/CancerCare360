import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/stores/auth.store';
import { authService } from '@/services/auth.service';

export function useAuth() {
  const store = useAuthStore();
  
  const profileQuery = useQuery({
    queryKey: ['profile'],
    queryFn: authService.getProfile,
    enabled: store.isAuthenticated,
    staleTime: 5 * 60 * 1000,
  });

  return {
    ...store,
    profile: profileQuery.data,
    isProfileLoading: profileQuery.isLoading,
  };
}
