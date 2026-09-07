'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import AppLayout from '@/components/layout/AppLayout';
import { Spin } from 'antd';

export default function StaffLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, initializeDemoUser } = useAuth();

  useEffect(() => {
    if (!isAuthenticated && !isLoading) {
      initializeDemoUser();
    }
  }, [isAuthenticated, isLoading, initializeDemoUser]);

  return <AppLayout>{children}</AppLayout>;
}
