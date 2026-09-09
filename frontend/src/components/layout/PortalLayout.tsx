'use client';

import React from 'react';
import { Layout, Menu, Space, Button, Dropdown, Avatar } from 'antd';
import { useRouter, usePathname } from 'next/navigation';
import { 
  HomeOutlined, 
  CalendarOutlined, 
  HistoryOutlined, 
  FileTextOutlined, 
  BookOutlined, 
  SettingOutlined,
  GlobalOutlined,
  HeartOutlined,
  UserOutlined,
  MedicineBoxOutlined
} from '@ant-design/icons';
import { useAppStore } from '@/stores/app.store';
import { useAuth } from '@/hooks/use-auth';

const { Header, Content, Footer } = Layout;

export function PortalLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { language, setLanguage } = useAppStore();
  const { user } = useAuth();

  const items = [
    { key: '/portal', icon: <HomeOutlined />, label: 'My Care Home' },
    { key: '/portal/appointments', icon: <CalendarOutlined />, label: 'Appointments' },
    { key: '/portal/journey', icon: <HistoryOutlined />, label: 'Treatment Roadmap' },
    { key: '/portal/records', icon: <FileTextOutlined />, label: 'My Reports & Labs' },
    { key: '/portal/education', icon: <BookOutlined />, label: 'Patient Guides' },
    { key: '/portal/settings', icon: <SettingOutlined />, label: 'Settings & Privacy' },
  ];

  const langMenu = {
    items: [
      { key: 'en', label: 'English', onClick: () => setLanguage('en') },
      { key: 'hi', label: 'हिंदी', onClick: () => setLanguage('hi') },
      { key: 'mr', label: 'मराठी', onClick: () => setLanguage('mr') },
    ],
    selectedKeys: [language]
  };

  return (
    <Layout style={{ minHeight: '100vh', background: '#f8fafc' }}>
      <Header style={{ 
        background: '#ffffff', 
        padding: '0 28px', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)', 
        borderBottom: '1px solid #e2e8f0',
        position: 'sticky',
        top: 0,
        zIndex: 10,
        height: 64,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
          <div 
            onClick={() => router.push('/portal')}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 10, 
              cursor: 'pointer' 
            }}
          >
            <div style={{
              width: 34,
              height: 34,
              borderRadius: 8,
              background: 'linear-gradient(135deg, #0d9488 0%, #059669 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              fontSize: 18,
              boxShadow: '0 2px 6px rgba(13, 148, 136, 0.3)'
            }}>
              <HeartOutlined />
            </div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', lineHeight: 1.2 }}>
                CancerCare<span style={{ color: '#0d9488' }}>Companion</span>
              </div>
              <div style={{ fontSize: 10, color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>
                City General Hospital Patient Portal
              </div>
            </div>
          </div>

          <Menu 
            mode="horizontal" 
            selectedKeys={[pathname]} 
            items={items} 
            onClick={({ key }) => router.push(key)}
            style={{ 
              borderBottom: 'none', 
              minWidth: 460, 
              background: 'transparent',
              fontWeight: 500,
            }}
          />
        </div>

        <Space size="middle">
          <Button 
            size="small" 
            icon={<MedicineBoxOutlined />}
            onClick={() => router.push('/dashboard')}
            style={{ borderRadius: 6, fontSize: 12, fontWeight: 600 }}
          >
            Clinician Desk
          </Button>

          <Dropdown menu={langMenu} placement="bottomRight">
            <Button icon={<GlobalOutlined style={{ color: '#0d9488' }} />} style={{ borderRadius: 6, borderColor: '#cbd5e1' }}>
              {language === 'hi' ? 'हिंदी' : language === 'mr' ? 'मराठी' : 'English'}
            </Button>
          </Dropdown>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '4px 8px' }}>
            <Avatar style={{ backgroundColor: '#0d9488', fontWeight: 600 }}>
              {user?.firstName ? user.firstName[0].toUpperCase() : 'P'}
            </Avatar>
            <div style={{ lineHeight: 1.2 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#0f172a' }}>
                {user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : 'Patient Portal'}
              </div>
              <div style={{ fontSize: 11, color: '#64748b' }}>Digital Health ID (ABHA)</div>
            </div>
          </div>
        </Space>
      </Header>

      <Content style={{ padding: '28px 24px', maxWidth: '1240px', margin: '0 auto', width: '100%' }}>
        {children}
      </Content>

      <Footer style={{ textAlign: 'center', color: '#64748b', background: '#f1f5f9', borderTop: '1px solid #e2e8f0', padding: '20px 24px' }}>
        <div style={{ fontWeight: 600, color: '#334155', marginBottom: 4 }}>
          City General Hospital • Comprehensive Cancer Center
        </div>
        <div style={{ fontSize: 12 }}>
          Emergency Oncology Helpline: <strong>+91-1800-419-CARE</strong> (24/7 Toll-Free) • ABDM Connected Health Record
        </div>
      </Footer>
    </Layout>
  );
}
