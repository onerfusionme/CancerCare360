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
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      tokens: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (credentials) => {
        set({ isLoading: true });
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
      partialize: (state) => ({ tokens: state.tokens, user: state.user, isAuthenticated: state.isAuthenticated }),
    }
  )
);
