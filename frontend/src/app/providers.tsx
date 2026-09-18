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
            colorBgBase: isDark ? '#060911' : '#f8fafc',
            colorBgLayout: 'transparent',
            colorBgContainer: isDark ? 'rgba(15, 23, 42, 0.68)' : 'rgba(255, 255, 255, 0.72)',
            colorBgElevated: isDark ? 'rgba(30, 41, 59, 0.82)' : 'rgba(255, 255, 255, 0.88)',
            colorBorder: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(226, 232, 240, 0.75)',
            colorBorderSecondary: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(241, 245, 249, 0.75)',
            colorText: isDark ? '#f8fafc' : '#0f172a',
            colorTextHeading: isDark ? '#ffffff' : '#0f172a',
            colorTextSecondary: isDark ? '#cbd5e1' : '#334155',
            colorTextTertiary: isDark ? '#94a3b8' : '#475569',
            borderRadius: 12,
            borderRadiusLG: 16,
            borderRadiusSM: 8,
            boxShadow: isDark 
              ? '0 8px 32px 0 rgba(0, 0, 0, 0.45)' 
              : '0 8px 32px 0 rgba(31, 38, 135, 0.07)',
            boxShadowSecondary: isDark
              ? '0 16px 48px -8px rgba(0, 0, 0, 0.6)'
              : '0 16px 40px -8px rgba(99, 102, 241, 0.12)',
          },
          components: {
            Layout: {
              headerBg: 'transparent',
              siderBg: 'transparent',
              bodyBg: 'transparent',
            },
            Menu: {
              darkItemBg: 'transparent',
              darkItemSelectedBg: 'linear-gradient(135deg, rgba(99, 102, 241, 0.85) 0%, rgba(139, 92, 246, 0.85) 100%)',
              darkItemHoverBg: 'rgba(255, 255, 255, 0.06)',
              darkSubMenuItemBg: 'transparent',
              darkItemColor: '#94a3b8',
              darkItemSelectedColor: '#ffffff',
              iconSize: 18,
              itemBorderRadius: 10,
              itemMarginInline: 10,
            },
            Card: {
              colorBgContainer: isDark ? 'rgba(15, 23, 42, 0.68)' : 'rgba(255, 255, 255, 0.72)',
              colorBorderSecondary: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(226, 232, 240, 0.7)',
              headerHeight: 52,
              paddingLG: 24,
            },
            Modal: {
              contentBg: isDark ? 'rgba(15, 23, 42, 0.85)' : 'rgba(255, 255, 255, 0.9)',
              headerBg: 'transparent',
            },
            Tabs: {
              titleFontSize: 14,
              horizontalItemPadding: '10px 18px',
            },
            Table: {
              headerBg: isDark ? 'rgba(19, 28, 46, 0.6)' : 'rgba(248, 250, 252, 0.6)',
              headerColor: isDark ? '#cbd5e1' : '#475569',
              rowHoverBg: isDark ? 'rgba(99, 102, 241, 0.08)' : 'rgba(99, 102, 241, 0.04)',
              borderColor: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(241, 245, 249, 0.7)',
            },
            Button: {
              fontWeight: 600,
              controlHeight: 40,
              borderRadius: 10,
            },
            Tag: {
              borderRadiusSM: 6,
            },
          }
        }}
      >
        {children}
      </ConfigProvider>
    </QueryClientProvider>
  );
}
