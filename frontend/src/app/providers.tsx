'use client';

import React, { useState, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ConfigProvider, theme } from 'antd';
import { useAppStore } from '@/stores/app.store';
import enUS from 'antd/locale/en_US';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
        retry: 1,
      },
    },
  }));
  
  const { language, themeMode } = useAppStore();

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', themeMode);
    }
  }, [themeMode]);

  const isDark = themeMode === 'dark';

  return (
    <QueryClientProvider client={queryClient}>
      <ConfigProvider 
        locale={enUS}
        theme={{
          algorithm: isDark ? theme.darkAlgorithm : theme.defaultAlgorithm,
          token: {
            colorPrimary: '#6366f1',
            colorInfo: '#06b6d4',
            colorSuccess: '#10b981',
            colorWarning: '#f59e0b',
            colorError: '#f43f5e',
            fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            colorBgBase: isDark ? '#090d16' : '#ffffff',
            colorBgLayout: isDark ? '#060911' : '#f8fafc',
            colorBgContainer: isDark ? '#0f172a' : '#ffffff',
            colorBorder: isDark ? '#1e293b' : '#e2e8f0',
            colorBorderSecondary: isDark ? '#172033' : '#f1f5f9',
            colorText: isDark ? '#f1f5f9' : '#0f172a',
            colorTextSecondary: isDark ? '#94a3b8' : '#64748b',
            colorTextTertiary: isDark ? '#64748b' : '#94a3b8',
            borderRadius: 8,
            borderRadiusLG: 12,
            boxShadow: isDark 
              ? '0 4px 12px 0 rgba(0, 0, 0, 0.5), 0 2px 4px 0 rgba(0, 0, 0, 0.4)' 
              : '0 4px 6px -1px rgb(0 0 0 / 0.05), 0 2px 4px -2px rgb(0 0 0 / 0.05)',
            boxShadowSecondary: isDark
              ? '0 12px 24px -4px rgba(0, 0, 0, 0.6), 0 6px 12px -2px rgba(0, 0, 0, 0.5)'
              : '0 10px 15px -3px rgb(0 0 0 / 0.07), 0 4px 6px -4px rgb(0 0 0 / 0.07)',
          },
          components: {
            Layout: {
              headerBg: isDark ? '#0f172a' : '#ffffff',
              siderBg: isDark ? '#090d16' : '#0f172a',
              bodyBg: isDark ? '#060911' : '#f8fafc',
            },
            Menu: {
              darkItemBg: isDark ? '#090d16' : '#0f172a',
              darkItemSelectedBg: '#6366f1',
              darkItemHoverBg: '#1e293b',
              darkSubMenuItemBg: '#060911',
              darkItemColor: '#94a3b8',
              darkItemSelectedColor: '#ffffff',
              iconSize: 18,
            },
            Card: {
              colorBorderSecondary: isDark ? '#1e293b' : '#e2e8f0',
              headerHeight: 48,
              paddingLG: 20,
            },
            Table: {
              headerBg: isDark ? '#131c2e' : '#f8fafc',
              headerColor: isDark ? '#cbd5e1' : '#475569',
              rowHoverBg: isDark ? '#1e293b' : '#f8fafc',
              borderColor: isDark ? '#1e293b' : '#f1f5f9',
            },
            Button: {
              fontWeight: 500,
              controlHeight: 38,
            },
            Tag: {
              borderRadiusSM: 4,
            },
          }
        }}
      >
        {children}
      </ConfigProvider>
    </QueryClientProvider>
  );
}
