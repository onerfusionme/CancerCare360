import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AppState {
  sidebarCollapsed: boolean;
  currentTenant: string | null;
  language: string;
  
  toggleSidebar: () => void;
  setTenant: (tenantId: string) => void;
  setLanguage: (lang: string) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      sidebarCollapsed: false,
      currentTenant: null,
      language: 'en',

      toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
      setTenant: (tenantId) => set({ currentTenant: tenantId }),
      setLanguage: (lang) => set({ language: lang }),
    }),
    {
      name: 'app-settings',
    }
  )
);
