import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, AuthTokens, LoginCredentials, UserRole } from '@/types/auth';
import { authService } from '@/services/auth.service';

interface AuthState {
  user: User | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
  hasRole: (role: UserRole) => boolean;
  hasPermission: (permission: string) => boolean;
  initializeDemoUser: (role?: UserRole) => Promise<void>;
}

const ROLE_CREDENTIALS: Record<string, LoginCredentials> = {
  [UserRole.ONCOLOGIST]: { email: 'priya.mehta@cancercare.com', password: 'Doctor@123' },
  [UserRole.CARE_COORDINATOR]: { email: 'coordinator@cancercare.com', password: 'Coord@123' },
  [UserRole.ADMIN]: { email: 'admin@cancercare.com', password: 'Admin@123' },
  [UserRole.SURGICAL_ONCOLOGIST]: { email: 'rajesh.kumar@cancercare.com', password: 'Doctor@123' },
  [UserRole.RADIATION_ONCOLOGIST]: { email: 'ananya.desai@cancercare.com', password: 'Doctor@123' },
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      tokens: null,
      isAuthenticated: false,
      isLoading: false,

      initializeDemoUser: async (role = UserRole.ONCOLOGIST) => {
        const creds = ROLE_CREDENTIALS[role] || ROLE_CREDENTIALS[UserRole.ONCOLOGIST];
        await get().login(creds);
      },

      login: async (credentials) => {
        set({ isLoading: true, user: null, tokens: null, isAuthenticated: false });
        try {
          const { user, tokens } = await authService.login(credentials);
          set({ user, tokens, isAuthenticated: true, isLoading: false });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      logout: async () => {
        set({ isLoading: true });
        try {
          await authService.logout();
        } finally {
          set({ user: null, tokens: null, isAuthenticated: false, isLoading: false });
        }
      },

      refreshToken: async () => {
        const { tokens } = get();
        if (!tokens?.refreshToken) throw new Error('No refresh token available');
        
        try {
          const newTokens = await authService.refreshToken(tokens.refreshToken);
          set({ tokens: newTokens });
        } catch (error) {
          set({ user: null, tokens: null, isAuthenticated: false });
          throw error;
        }
      },

      hasRole: (role) => {
        const user = get().user;
        if (!user || !user.roles) return false;
        return user.roles.some(
          (r: any) => String(r).toUpperCase() === String(role).toUpperCase()
        );
      },

      hasPermission: (permission) => {
        const user = get().user;
        if (!user) return false;
        if (
          user.roles?.some((r: any) =>
            ['ADMIN', 'SYSTEM_ADMIN', 'SUPER_ADMIN'].includes(String(r).toUpperCase())
          )
        ) {
          return true;
        }
        if (!user.permissions) return true; // Default fallback to allow navigation if not strictly restricted
        const [resource] = permission.split(':');
        return (
          user.permissions.includes(permission) ||
          user.permissions.includes(`${resource}:ALL`) ||
          user.permissions.includes(`${resource}:READ`)
        );
      },
    }),
    {
      name: 'auth-storage',
      version: 2,
      migrate: (persistedState: any, version: number) => {
        if (version < 2 || persistedState?.tokens?.accessToken === 'demo-access-token') {
          return { user: null, tokens: null, isAuthenticated: false, isLoading: false };
        }
        return persistedState;
      },
      partialize: (state) => ({ tokens: state.tokens, user: state.user, isAuthenticated: state.isAuthenticated }),
    }
  )
);
