'use client';

import React, { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ConfigProvider } from 'antd';
import { useAppStore } from '@/stores/app.store';
import enUS from 'antd/locale/en_US';
// import hiIN from 'antd/locale/hi_IN';
// import mrIN from 'antd/locale/mr_IN';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
        retry: 1,
      },
    },
  }));
  
  const { language } = useAppStore();

  const getAntdLocale = () => {
    // Return appropriate locale mapping based on language, fallback to en_US
    return enUS;
  };

  return (
    <QueryClientProvider client={queryClient}>
      <ConfigProvider 
        locale={getAntdLocale()}
        theme={{
          token: {
            colorPrimary: '#4f46e5',
            colorInfo: '#0284c7',
            colorSuccess: '#059669',
            colorWarning: '#d97706',
            colorError: '#dc2626',
            fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            colorBgBase: '#ffffff',
            colorBgLayout: '#f8fafc',
            colorBgContainer: '#ffffff',
            colorBorder: '#e2e8f0',
            colorBorderSecondary: '#f1f5f9',
            colorText: '#1e293b',
            colorTextSecondary: '#64748b',
            colorTextTertiary: '#94a3b8',
            borderRadius: 8,
            borderRadiusLG: 12,
            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05), 0 2px 4px -2px rgb(0 0 0 / 0.05)',
            boxShadowSecondary: '0 10px 15px -3px rgb(0 0 0 / 0.07), 0 4px 6px -4px rgb(0 0 0 / 0.07)',
          },
          components: {
            Layout: {
              headerBg: '#ffffff',
              siderBg: '#0f172a',
              bodyBg: '#f8fafc',
            },
            Menu: {
              darkItemBg: '#0f172a',
              darkItemSelectedBg: '#4f46e5',
              darkItemHoverBg: '#1e293b',
              darkSubMenuItemBg: '#090d16',
              darkItemColor: '#94a3b8',
              darkItemSelectedColor: '#ffffff',
              iconSize: 18,
            },
            Card: {
              colorBorderSecondary: '#e2e8f0',
              headerHeight: 48,
              paddingLG: 20,
            },
            Table: {
              headerBg: '#f8fafc',
              headerColor: '#475569',
              rowHoverBg: '#f8fafc',
              borderColor: '#f1f5f9',
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
