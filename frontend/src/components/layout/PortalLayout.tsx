'use client';

import React from 'react';
import { Layout, Menu } from 'antd';
import { useRouter, usePathname } from 'next/navigation';
import { 
  HomeOutlined, 
  CalendarOutlined, 
  HistoryOutlined, 
  FileTextOutlined, 
  BookOutlined, 
  SettingOutlined 
} from '@ant-design/icons';

const { Header, Content, Footer } = Layout;

export function PortalLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  const items = [
    { key: '/portal', icon: <HomeOutlined />, label: 'Home' },
    { key: '/portal/appointments', icon: <CalendarOutlined />, label: 'Appointments' },
    { key: '/portal/journey', icon: <HistoryOutlined />, label: 'My Journey' },
    { key: '/portal/records', icon: <FileTextOutlined />, label: 'Records' },
    { key: '/portal/education', icon: <BookOutlined />, label: 'Education' },
    { key: '/portal/settings', icon: <SettingOutlined />, label: 'Settings' },
  ];

  return (
    <Layout style={{ minHeight: '100vh', background: '#f5f5f5' }}>
      <Header style={{ background: '#fff', padding: '0 24px', display: 'flex', alignItems: 'center', boxShadow: '0 1px 4px rgba(0,0,0,0.1)', zIndex: 1 }}>
        <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#1890ff', marginRight: '40px' }}>
          CancerCare360 Portal
        </div>
        <Menu 
          mode="horizontal" 
          selectedKeys={[pathname]} 
          items={items} 
          onClick={({ key }) => router.push(key)}
          style={{ flex: 1, borderBottom: 'none' }}
        />
      </Header>
      <Content style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
        {children}
      </Content>
      <Footer style={{ textAlign: 'center', color: '#8c8c8c' }}>
        CancerCare360 ©{new Date().getFullYear()} Created with ❤️ for Patients
      </Footer>
    </Layout>
  );
}
