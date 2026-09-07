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
            colorPrimary: '#1677ff',
            fontFamily: 'Inter, sans-serif',
            colorBgContainer: '#ffffff',
            borderRadius: 6,
          },
          components: {
            Layout: {
              headerBg: '#ffffff',
              siderBg: '#ffffff',
            }
          }
        }}
      >
        {children}
      </ConfigProvider>
    </QueryClientProvider>
  );
}
