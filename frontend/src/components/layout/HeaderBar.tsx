import React, { useState } from 'react';
import { Layout, Button, Avatar, Dropdown, Space, Badge, Tooltip, Drawer, List, Tag, Empty, message } from 'antd';
import {
  MenuUnfoldOutlined,
  MenuFoldOutlined,
  BellOutlined,
  GlobalOutlined,
  LogoutOutlined,
  UserOutlined,
  BulbFilled,
  MoonOutlined,
  SwapOutlined,
  CheckOutlined,
  HeartOutlined,
  AlertOutlined,
  ClockCircleOutlined,
  DashboardOutlined
} from '@ant-design/icons';
import { useRouter, usePathname } from 'next/navigation';
import { useAppStore } from '@/stores/app.store';
import { useAuth } from '@/hooks/use-auth';
import { useAppointments } from '@/hooks/use-appointments';
import { UserRole } from '@/types/auth';
import GlobalSearch from '../ui/GlobalSearch';

const { Header } = Layout;

export default function HeaderBar() {
  const router = useRouter();
  const pathname = usePathname();
  const { sidebarCollapsed, toggleSidebar, language, setLanguage, themeMode, toggleThemeMode } = useAppStore();
  const { user, logout, initializeDemoUser } = useAuth();
  const [notifDrawerOpen, setNotifDrawerOpen] = useState(false);
  const { data: appointments } = useAppointments();

  const getBreadcrumbLabel = (path: string) => {
    if (path === '/dashboard') return 'Clinical Dashboard';
    if (path.startsWith('/patients')) return 'Patients Directory';
    if (path.startsWith('/appointments')) return 'Appointments & Clinic Flow';
    if (path.startsWith('/community')) return 'CareCircles (Family Connect)';
    if (path.startsWith('/relief')) return 'CareRelief (Aid & Grants)';
    if (path.startsWith('/gaps')) return 'Care Gaps & Follow-Up';
    if (path.startsWith('/consultations')) return 'Consultation Briefing';
    if (path.startsWith('/investigations')) return 'Investigations';
    if (path.startsWith('/journey')) return 'Treatment Journeys';
    if (path.startsWith('/documents')) return 'Clinical Documents';
    if (path.startsWith('/campaigns')) return 'Outreach & Campaigns';
    if (path.startsWith('/education')) return 'Patient Education';
    if (path.startsWith('/analytics')) return 'Analytics';
    if (path.startsWith('/reports')) return 'Registry & Reports';
    if (path.startsWith('/admin')) return 'Administration';
    return 'Workspace';
  };

  const apptList = Array.isArray(appointments) ? appointments : ((appointments as any)?.data || []);
  const todayCount = apptList.length;
  const inConsultCount = apptList.filter((a: any) => a.status === 'IN_PROGRESS').length;

  const isDark = themeMode === 'dark';

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.warn('Logout API failed, forcing local logout:', error);
    } finally {
      router.push('/login');
    }
  };

  const primaryRole = user?.roles?.[0]?.replace(/_/g, ' ') || 'CLINICAL USER';

  const userMenu = {
    items: [
      {
        key: 'profile',
        label: (
          <div style={{ padding: '4px 0' }}>
            <div style={{ fontWeight: 600, color: isDark ? '#f8fafc' : '#0f172a' }}>
              {user?.firstName || 'Clinical'} {user?.lastName || 'User'}
            </div>
            <div style={{ fontSize: 11, color: '#64748b' }}>
              {user?.email}
            </div>
            <div style={{ marginTop: 4 }}>
              <Tag color="cyan" style={{ fontSize: 10, fontWeight: 700, borderRadius: 4, textTransform: 'uppercase' }}>
                {primaryRole}
              </Tag>
            </div>
          </div>
        ),
        disabled: true,
      },
      {
        type: 'divider' as const,
      },
      {
        key: 'portal-preview',
        label: 'View Patient Portal',
        icon: <HeartOutlined style={{ color: '#0d9488' }} />,
        onClick: () => router.push('/portal'),
      },
      {
        type: 'divider' as const,
      },
      {
        key: 'logout',
        label: 'Logout',
        icon: <LogoutOutlined />,
        onClick: handleLogout,
        danger: true
      }
    ]
  };

  const langMenu = {
    items: [
      { key: 'en', label: 'English', onClick: () => setLanguage('en') },
      { key: 'hi', label: 'हिंदी', onClick: () => setLanguage('hi') },
      { key: 'mr', label: 'मराठी', onClick: () => setLanguage('mr') },
    ],
    selectedKeys: [language]
  };

  return (
    <Header style={{ 
      padding: '0 20px', 
      background: isDark ? 'rgba(11, 17, 32, 0.85)' : 'rgba(255, 255, 255, 0.85)', 
      backdropFilter: 'blur(20px) saturate(180%)',
      WebkitBackdropFilter: 'blur(20px) saturate(180%)',
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'space-between',
      borderBottom: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(255, 255, 255, 0.5)',
      position: 'sticky',
      top: 0,
      zIndex: 99,
      height: 64,
      boxShadow: isDark ? '0 8px 32px rgba(0, 0, 0, 0.4)' : '0 4px 20px rgba(0, 0, 0, 0.03)',
      transition: 'all 0.25s ease',
      overflow: 'hidden',
      whiteSpace: 'nowrap',
      flexWrap: 'nowrap',
    }}>
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: 12, 
        flexShrink: 1, 
        minWidth: 0, 
        overflow: 'hidden',
        whiteSpace: 'nowrap',
        flexWrap: 'nowrap'
      }}>
        <Button
          type="text"
          icon={sidebarCollapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          onClick={toggleSidebar}
          style={{ fontSize: '18px', width: 38, height: 38, flexShrink: 0, color: isDark ? '#94a3b8' : '#475569' }}
        />

        <div style={{ width: 220, minWidth: 150, flexShrink: 1 }}>
          <GlobalSearch />
        </div>

        {/* Dynamic Interactive Breadcrumb Pill */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          fontSize: 12,
          color: isDark ? '#cbd5e1' : '#334155',
          fontWeight: 600,
          padding: '5px 12px',
          background: isDark ? 'rgba(30, 41, 59, 0.65)' : 'rgba(241, 245, 249, 0.75)',
          borderRadius: 16,
          border: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(255, 255, 255, 0.7)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.03)',
          flexShrink: 0,
        }}>
          <span 
            onClick={() => router.push('/dashboard')}
            style={{ cursor: 'pointer', color: '#6366f1', display: 'flex', alignItems: 'center', gap: 5, fontWeight: 700 }}
            title="Navigate to Dashboard"
          >
            <DashboardOutlined /> <span>Dashboard</span>
          </span>
          {pathname !== '/dashboard' && (
            <>
              <span style={{ color: isDark ? '#64748b' : '#94a3b8' }}>/</span>
              <span style={{ 
                color: isDark ? '#f8fafc' : '#0f172a', 
                fontWeight: 700, 
                maxWidth: 160, 
                overflow: 'hidden', 
                textOverflow: 'ellipsis', 
                whiteSpace: 'nowrap' 
              }}>
                {getBreadcrumbLabel(pathname)}
              </span>
            </>
          )}
        </div>

        {/* Compact Live Clinic Stats Pill */}
        <Tooltip title="Click to view today's clinic flow & appointments">
          <div 
            onClick={() => router.push('/appointments')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '5px 12px',
              background: isDark ? 'rgba(30, 41, 59, 0.65)' : 'rgba(241, 245, 249, 0.75)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              borderRadius: 16,
              border: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(255, 255, 255, 0.7)',
              fontSize: 11.5,
              color: isDark ? '#cbd5e1' : '#334155',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.03)',
              cursor: 'pointer',
              flexShrink: 0,
            }}
          >
            <span style={{ 
              width: 7, 
              height: 7, 
              borderRadius: '50%', 
              background: '#10b981', 
              boxShadow: '0 0 6px #10b981',
              display: 'inline-block' 
            }} />
            <span style={{ fontWeight: 700 }}>{todayCount} Today</span>
            <span style={{ color: isDark ? '#475569' : '#cbd5e1' }}>•</span>
            <span style={{ color: '#818cf8', fontWeight: 600 }}>{inConsultCount} In Consult</span>
          </div>
        </Tooltip>
      </div>

      <Space size={8} wrap={false} style={{ flexShrink: 0 }}>
        {/* Dark / Light Theme Toggle */}
        <Tooltip title={isDark ? "Switch to Clinical Daylight Mode" : "Switch to Executive Dark Mode"}>
          <Button 
            type="default"
            icon={isDark ? <BulbFilled style={{ color: '#fbbf24' }} /> : <MoonOutlined style={{ color: '#6366f1' }} />}
            onClick={toggleThemeMode}
            style={{ 
              borderRadius: 10, 
              borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(226, 232, 240, 0.8)',
              background: isDark ? 'rgba(30, 41, 59, 0.7)' : 'rgba(255, 255, 255, 0.75)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              color: isDark ? '#f8fafc' : '#0f172a',
              fontWeight: 600,
              fontSize: 12,
              display: 'flex',
              alignItems: 'center',
              gap: 4
            }}
          >
            {isDark ? 'Dark' : 'Light'}
          </Button>
        </Tooltip>

        <Dropdown menu={langMenu} placement="bottomRight">
          <Button 
            type="default" 
            icon={<GlobalOutlined style={{ color: '#6366f1' }} />}
            style={{ 
              borderRadius: 10, 
              borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(226, 232, 240, 0.8)', 
              background: isDark ? 'rgba(30, 41, 59, 0.7)' : 'rgba(255, 255, 255, 0.75)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              color: isDark ? '#cbd5e1' : '#0f172a',
              fontSize: 12, 
              fontWeight: 600 
            }}
          >
            {language.toUpperCase()}
          </Button>
        </Dropdown>
        
        <Tooltip title="Clinical Priority Alerts">
          <Badge count={2} size="small" offset={[-2, 4]} color="#f43f5e">
            <Button 
              type="text" 
              icon={<BellOutlined style={{ fontSize: 18, color: isDark ? '#94a3b8' : '#475569' }} />} 
              style={{ width: 36, height: 36, borderRadius: 10 }}
              onClick={() => setNotifDrawerOpen(true)}
            />
          </Badge>
        </Tooltip>
        
        <div style={{ width: 1, height: 24, background: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(226, 232, 240, 0.8)', margin: '0 2px' }} />

        <Dropdown menu={userMenu} placement="bottomRight" trigger={['click']}>
          <div style={{ 
            cursor: 'pointer', 
            display: 'flex', 
            alignItems: 'center', 
            gap: 12, 
            padding: '4px 12px',
            borderRadius: 10,
            background: isDark ? 'rgba(30, 41, 59, 0.65)' : 'rgba(255, 255, 255, 0.65)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            border: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(226, 232, 240, 0.7)',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.03)',
            transition: 'all 0.2s',
          }}>
            <Avatar 
              style={{ 
                backgroundColor: '#6366f1', 
                fontWeight: 600, 
                boxShadow: '0 2px 8px rgba(99, 102, 241, 0.4)' 
              }} 
              icon={<UserOutlined />} 
            />
            <div style={{ lineHeight: '1.25', display: 'flex', flexDirection: 'column' }}>
              <span style={{ 
                fontWeight: 600, 
                fontSize: 12.5, 
                color: isDark ? '#f8fafc' : '#0f172a',
                maxWidth: 130,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}>
                {user?.firstName ? `${user?.firstName} ${user?.lastName || ''}` : 'Clinical Staff'}
              </span>
              <span style={{ 
                fontSize: 10.5, 
                color: isDark ? '#94a3b8' : '#64748b', 
                fontWeight: 500,
                maxWidth: 130,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}>
                {user?.roles?.[0] === UserRole.ONCOLOGIST || user?.roles?.[0] === UserRole.MEDICAL_ONCOLOGIST ? 'Consultant Oncologist' : (user?.roles?.[0] || 'Care Coordinator')}
              </span>
            </div>
          </div>
        </Dropdown>
      </Space>

      {/* Clinical Notifications Drawer */}
      <Drawer
        title="Clinical Priority Alerts & Tasks"
        placement="right"
        width={380}
        onClose={() => setNotifDrawerOpen(false)}
        open={notifDrawerOpen}
      >
        <Empty 
          image={Empty.PRESENTED_IMAGE_SIMPLE} 
          description="No priority clinical alerts" 
          style={{ marginTop: 60 }} 
        />
      </Drawer>
    </Header>
  );
}
