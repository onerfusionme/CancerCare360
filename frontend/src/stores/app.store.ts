import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AppState {
  sidebarCollapsed: boolean;
  currentTenant: string | null;
  language: string;
  
  themeMode: 'dark' | 'light';
  
  toggleSidebar: () => void;
  setTenant: (tenantId: string) => void;
  setLanguage: (lang: string) => void;
  toggleThemeMode: () => void;
  setThemeMode: (mode: 'dark' | 'light') => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      sidebarCollapsed: false,
      currentTenant: null,
      language: 'en',
      themeMode: 'dark',

      toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
      setTenant: (tenantId) => set({ currentTenant: tenantId }),
      setLanguage: (lang) => set({ language: lang }),
      toggleThemeMode: () => set((state) => ({ themeMode: state.themeMode === 'dark' ? 'light' : 'dark' })),
      setThemeMode: (mode) => set({ themeMode: mode }),
    }),
    {
      name: 'app-settings',
    }
  )
);
