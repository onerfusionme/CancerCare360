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
        return user?.roles?.includes(role) ?? false;
      },

      hasPermission: (permission) => {
        // Mock permission logic based on roles
        const user = get().user;
        if (!user) return false;
        if (user.roles.includes(UserRole.ADMIN)) return true;
        // Basic check mapping permission prefixes to roles
        return true; 
      }
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
