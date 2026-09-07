import React from 'react';
import { Layout, Button, Avatar, Dropdown, Space, Badge, Tooltip } from 'antd';
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
  CheckOutlined
} from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/stores/app.store';
import { useAuth } from '@/hooks/use-auth';
import { UserRole } from '@/types/auth';
import GlobalSearch from '../ui/GlobalSearch';

const { Header } = Layout;

export default function HeaderBar() {
  const router = useRouter();
  const { sidebarCollapsed, toggleSidebar, language, setLanguage, themeMode, toggleThemeMode } = useAppStore();
  const { user, logout, initializeDemoUser } = useAuth();

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

  const userMenu = {
    items: [
      {
        key: 'profile',
        label: `${user?.firstName || 'Dr. Jane'} ${user?.lastName || 'Smith'}`,
        icon: <UserOutlined />,
        disabled: true,
      },
      {
        type: 'divider' as const,
      },
      {
        key: 'switch-doc',
        label: 'Switch to Dr. Jane Smith (Oncologist)',
        icon: <SwapOutlined />,
        onClick: () => initializeDemoUser(UserRole.ONCOLOGIST),
      },
      {
        key: 'switch-coord',
        label: 'Switch to Sarah Jenkins (Coordinator)',
        icon: <SwapOutlined />,
        onClick: () => initializeDemoUser(UserRole.CARE_COORDINATOR),
      },
      {
        key: 'switch-admin',
        label: 'Switch to System Admin',
        icon: <SwapOutlined />,
        onClick: () => initializeDemoUser(UserRole.ADMIN),
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
      padding: '0 28px', 
      background: isDark ? '#0b1120' : '#ffffff', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'space-between',
      borderBottom: isDark ? '1px solid #1e293b' : '1px solid #e2e8f0',
      position: 'sticky',
      top: 0,
      zIndex: 9,
      height: 68,
      boxShadow: isDark ? '0 4px 20px rgba(0, 0, 0, 0.5)' : '0 1px 2px 0 rgb(0 0 0 / 0.03)',
      transition: 'all 0.25s ease',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
        <Button
          type="text"
          icon={sidebarCollapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          onClick={toggleSidebar}
          style={{ fontSize: '18px', width: 40, height: 40, color: isDark ? '#94a3b8' : '#475569' }}
        />
        <div style={{ width: 340 }}>
          <GlobalSearch />
        </div>

        {/* Live Clinic Stats Pill */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: '6px 14px',
          background: isDark ? '#131c2e' : '#f1f5f9',
          borderRadius: 20,
          border: isDark ? '1px solid #1e293b' : '1px solid #e2e8f0',
          fontSize: 12,
          color: isDark ? '#cbd5e1' : '#334155',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ 
              width: 8, 
              height: 8, 
              borderRadius: '50%', 
              background: '#10b981', 
              boxShadow: '0 0 8px #10b981',
              display: 'inline-block' 
            }} />
            <span style={{ fontWeight: 600 }}>Active Clinic:</span>
            <span>6 Today</span>
          </div>
          <span style={{ color: isDark ? '#334155' : '#cbd5e1' }}>|</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ color: '#818cf8', fontWeight: 600 }}>1</span>
            <span style={{ color: isDark ? '#94a3b8' : '#64748b' }}>In Consult</span>
          </div>
          <span style={{ color: isDark ? '#334155' : '#cbd5e1' }}>|</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ 
              background: isDark ? 'rgba(244, 63, 94, 0.2)' : '#fee2e2', 
              color: isDark ? '#fb7185' : '#dc2626', 
              padding: '1px 6px', 
              borderRadius: 10, 
              fontWeight: 700, 
              fontSize: 11,
              border: isDark ? '1px solid rgba(244, 63, 94, 0.3)' : 'none'
            }}>
              2 Urgent Gaps
            </span>
          </div>
        </div>
      </div>

      <Space size="middle">
        {/* Dark / Light Theme Toggle */}
        <Tooltip title={isDark ? "Switch to Clinical Daylight Mode" : "Switch to Executive Dark Mode"}>
          <Button 
            type="default"
            icon={isDark ? <BulbFilled style={{ color: '#fbbf24' }} /> : <MoonOutlined style={{ color: '#6366f1' }} />}
            onClick={toggleThemeMode}
            style={{ 
              borderRadius: 8, 
              borderColor: isDark ? '#1e293b' : '#e2e8f0',
              background: isDark ? '#131c2e' : '#ffffff',
              color: isDark ? '#f8fafc' : '#0f172a',
              fontWeight: 600,
              fontSize: 12,
              display: 'flex',
              alignItems: 'center',
              gap: 6
            }}
          >
            {isDark ? 'Dark Mode' : 'Light Mode'}
          </Button>
        </Tooltip>

        <Dropdown menu={langMenu} placement="bottomRight">
          <Button 
            type="default" 
            icon={<GlobalOutlined style={{ color: '#6366f1' }} />}
            style={{ 
              borderRadius: 6, 
              borderColor: isDark ? '#1e293b' : '#e2e8f0', 
              background: isDark ? '#131c2e' : '#ffffff',
              color: isDark ? '#cbd5e1' : '#0f172a',
              fontSize: 13, 
              fontWeight: 500 
            }}
          >
            {language.toUpperCase()}
          </Button>
        </Dropdown>
        
        <Badge count={2} size="small" offset={[-2, 4]} color="#f43f5e">
          <Button 
            type="text" 
            icon={<BellOutlined style={{ fontSize: 19, color: isDark ? '#94a3b8' : '#475569' }} />} 
            style={{ width: 40, height: 40, borderRadius: 8 }}
          />
        </Badge>
        
        <div style={{ width: 1, height: 28, background: isDark ? '#1e293b' : '#e2e8f0', margin: '0 4px' }} />

        <Dropdown menu={userMenu} placement="bottomRight" trigger={['click']}>
          <div style={{ 
            cursor: 'pointer', 
            display: 'flex', 
            alignItems: 'center', 
            gap: 12, 
            padding: '4px 10px',
            borderRadius: 8,
            background: isDark ? '#131c2e' : 'transparent',
            border: isDark ? '1px solid #1e293b' : 'none',
            transition: 'background 0.2s',
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
              <span style={{ fontWeight: 600, fontSize: 13, color: isDark ? '#f8fafc' : '#0f172a' }}>
                {user?.firstName ? `${user?.firstName} ${user?.lastName || ''}` : 'Dr. Jane Smith'}
              </span>
              <span style={{ fontSize: 11, color: isDark ? '#94a3b8' : '#64748b', fontWeight: 500 }}>
                {user?.roles?.[0] === UserRole.ONCOLOGIST || user?.roles?.[0] === UserRole.MEDICAL_ONCOLOGIST ? 'Consultant Oncologist' : (user?.roles?.[0] || 'Care Coordinator')}
              </span>
            </div>
          </div>
        </Dropdown>
      </Space>
    </Header>
  );
}
