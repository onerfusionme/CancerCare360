'use client';

import React from 'react';
import { Layout, Menu, Space, Button, Dropdown, Avatar, Tooltip } from 'antd';
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
  MedicineBoxOutlined,
  TeamOutlined,
  BankOutlined,
  DashboardOutlined,
  BulbFilled,
  MoonOutlined
} from '@ant-design/icons';
import { useAppStore } from '@/stores/app.store';
import { useAuth } from '@/hooks/use-auth';

const { Header, Content, Footer } = Layout;

export function PortalLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { language, setLanguage, themeMode, toggleThemeMode } = useAppStore();
  const { user } = useAuth();
  const isDark = themeMode === 'dark';

  const items = [
    { key: '/portal', icon: <HomeOutlined />, label: 'My Care Home' },
    { key: '/portal/community', icon: <TeamOutlined />, label: 'CareCircles (Family Connect)' },
    { key: '/portal/relief', icon: <BankOutlined />, label: 'Treatment Aid & Grants' },
    { key: '/portal/appointments', icon: <CalendarOutlined />, label: 'Appointments' },
    { key: '/portal/journey', icon: <HistoryOutlined />, label: 'Treatment Roadmap' },
    { key: '/portal/records', icon: <FileTextOutlined />, label: 'My Reports & Labs' },
    { key: '/portal/education', icon: <BookOutlined />, label: 'Patient Guides' },
    { key: '/portal/settings', icon: <SettingOutlined />, label: 'Settings & Privacy' },
  ];

  const getActivePortalKey = () => {
    if (!pathname) return '/portal';
    if (pathname === '/portal') return '/portal';
    const match = items.find(it => it.key !== '/portal' && pathname.startsWith(it.key));
    return match ? match.key : pathname;
  };

  const activeKey = getActivePortalKey();

  const langMenu = {
    items: [
      { key: 'en', label: 'English', onClick: () => setLanguage('en') },
      { key: 'hi', label: 'हिंदी', onClick: () => setLanguage('hi') },
      { key: 'mr', label: 'मराठी', onClick: () => setLanguage('mr') },
    ],
    selectedKeys: [language]
  };

  return (
    <Layout className="ambient-canvas" style={{ minHeight: '100vh', background: 'transparent' }}>
      <Header style={{ 
        background: isDark ? 'rgba(15, 23, 42, 0.88)' : 'rgba(255, 255, 255, 0.82)', 
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        padding: '0 28px', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.06)', 
        borderBottom: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(255, 255, 255, 0.6)',
        position: 'sticky',
        top: 0,
        zIndex: 10,
        height: 68,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
          <div 
            onClick={() => router.push('/portal')}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 12, 
              cursor: 'pointer' 
            }}
          >
            <div style={{
              width: 38,
              height: 38,
              borderRadius: 10,
              background: 'linear-gradient(135deg, #0d9488 0%, #059669 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              fontSize: 20,
              boxShadow: '0 4px 14px rgba(13, 148, 136, 0.35)'
            }}>
              <HeartOutlined />
            </div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 700, color: isDark ? '#f8fafc' : '#0f172a', lineHeight: 1.2 }}>
                CancerCare<span style={{ color: '#0d9488' }}>Companion</span>
              </div>
              <div style={{ fontSize: 10, color: isDark ? '#94a3b8' : '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                City Cancer Center Patient Portal
              </div>
            </div>
          </div>

          <Menu 
            mode="horizontal" 
            selectedKeys={[activeKey]} 
            items={items} 
            onClick={({ key }) => router.push(key)}
            style={{ 
              borderBottom: 'none', 
              minWidth: 460, 
              background: 'transparent',
              fontWeight: 600,
            }}
          />
        </div>

        <Space size="middle">
          {/* Direct Return to Dashboard */}
          <Tooltip title="Return to Clinical Oncology Dashboard">
            <Button 
              type="default"
              icon={<DashboardOutlined style={{ color: '#6366f1' }} />}
              onClick={() => router.push('/dashboard')}
              style={{ 
                borderRadius: 10, 
                fontSize: 12, 
                fontWeight: 600,
                background: isDark ? 'rgba(99, 102, 241, 0.15)' : 'rgba(238, 242, 255, 0.9)',
                borderColor: isDark ? 'rgba(99, 102, 241, 0.3)' : 'rgba(99, 102, 241, 0.25)',
                color: isDark ? '#a5b4fc' : '#4338ca',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
              }}
            >
              Dashboard
            </Button>
          </Tooltip>

          {/* Dark / Light Mode Toggle */}
          <Tooltip title={isDark ? "Switch to Daylight Mode" : "Switch to Dark Mode"}>
            <Button 
              type="default"
              icon={isDark ? <BulbFilled style={{ color: '#fbbf24' }} /> : <MoonOutlined style={{ color: '#6366f1' }} />}
              onClick={toggleThemeMode}
              style={{ 
                borderRadius: 10, 
                fontSize: 12,
                fontWeight: 600,
                background: isDark ? 'rgba(30, 41, 59, 0.7)' : 'rgba(255, 255, 255, 0.75)',
                borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(226, 232, 240, 0.8)',
                color: isDark ? '#f8fafc' : '#0f172a',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
              }}
            >
              {isDark ? 'Dark' : 'Light'}
            </Button>
          </Tooltip>

          <Dropdown menu={langMenu} placement="bottomRight">
            <Button 
              icon={<GlobalOutlined style={{ color: '#0d9488' }} />} 
              style={{ 
                borderRadius: 10, 
                borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(226, 232, 240, 0.8)',
                background: isDark ? 'rgba(30, 41, 59, 0.7)' : 'rgba(255, 255, 255, 0.75)',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
                fontWeight: 600,
                color: isDark ? '#f8fafc' : '#0f172a',
              }}
            >
              {language === 'hi' ? 'हिंदी' : language === 'mr' ? 'मराठी' : 'English'}
            </Button>
          </Dropdown>

          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 10, 
            padding: '4px 12px',
            background: isDark ? 'rgba(30, 41, 59, 0.7)' : 'rgba(255, 255, 255, 0.65)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            borderRadius: 10,
            border: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(226, 232, 240, 0.7)',
          }}>
            <Avatar style={{ backgroundColor: '#0d9488', fontWeight: 600 }}>
              {user?.firstName ? user.firstName[0].toUpperCase() : 'P'}
            </Avatar>
            <div style={{ lineHeight: 1.2 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: isDark ? '#f8fafc' : '#0f172a' }}>
                {user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : 'Patient Portal'}
              </div>
              <div style={{ fontSize: 11, color: isDark ? '#94a3b8' : '#64748b' }}>Digital Health ID (ABHA)</div>
            </div>
          </div>
        </Space>
      </Header>

      <Content style={{ padding: '32px 28px', maxWidth: '1280px', margin: '0 auto', width: '100%' }}>
        {children}
      </Content>

      <Footer style={{ 
        textAlign: 'center', 
        color: '#64748b', 
        background: 'var(--glass-header-bg)', 
        backdropFilter: 'blur(16px)',
        borderTop: '1px solid var(--glass-card-border)', 
        padding: '24px 28px' 
      }}>
        <div style={{ fontWeight: 600, marginBottom: 4 }}>
          City General Hospital • Comprehensive Cancer Center
        </div>
        <div style={{ fontSize: 12 }}>
          Emergency Oncology Helpline: <strong>+91-1800-419-CARE</strong> (24/7 Toll-Free) • ABDM Connected Health Record
        </div>
      </Footer>
    </Layout>
  );
}
