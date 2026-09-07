import React from 'react';
import { Layout, Button, Avatar, Dropdown, Space, Badge } from 'antd';
import {
  MenuUnfoldOutlined,
  MenuFoldOutlined,
  BellOutlined,
  GlobalOutlined,
  LogoutOutlined,
  UserOutlined
} from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/stores/app.store';
import { useAuth } from '@/hooks/use-auth';
import { UserRole } from '@/types/auth';
import GlobalSearch from '../ui/GlobalSearch';

const { Header } = Layout;

export default function HeaderBar() {
  const router = useRouter();
  const { sidebarCollapsed, toggleSidebar, language, setLanguage } = useAppStore();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  const userMenu = {
    items: [
      {
        key: 'profile',
        label: 'My Profile',
        icon: <UserOutlined />
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
      background: '#ffffff', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'space-between',
      borderBottom: '1px solid #e2e8f0',
      position: 'sticky',
      top: 0,
      zIndex: 9,
      height: 68,
      boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.03)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
        <Button
          type="text"
          icon={sidebarCollapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          onClick={toggleSidebar}
          style={{ fontSize: '18px', width: 40, height: 40, color: '#475569' }}
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
          background: '#f1f5f9',
          borderRadius: 20,
          border: '1px solid #e2e8f0',
          fontSize: 12,
          color: '#334155',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981', display: 'inline-block' }} />
            <span style={{ fontWeight: 600 }}>Active Clinic:</span>
            <span>14 Today</span>
          </div>
          <span style={{ color: '#cbd5e1' }}>|</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ color: '#6366f1', fontWeight: 600 }}>3</span>
            <span style={{ color: '#64748b' }}>In Consult</span>
          </div>
          <span style={{ color: '#cbd5e1' }}>|</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ 
              background: '#fee2e2', 
              color: '#dc2626', 
              padding: '1px 6px', 
              borderRadius: 10, 
              fontWeight: 700, 
              fontSize: 11 
            }}>
              2 Urgent Gaps
            </span>
          </div>
        </div>
      </div>

      <Space size="middle">
        <Dropdown menu={langMenu} placement="bottomRight">
          <Button 
            type="default" 
            icon={<GlobalOutlined style={{ color: '#4f46e5' }} />}
            style={{ borderRadius: 6, borderColor: '#e2e8f0', fontSize: 13, fontWeight: 500 }}
          >
            {language.toUpperCase()}
          </Button>
        </Dropdown>
        
        <Badge count={2} size="small" offset={[-2, 4]} color="#e11d48">
          <Button 
            type="text" 
            icon={<BellOutlined style={{ fontSize: 19, color: '#475569' }} />} 
            style={{ width: 40, height: 40, borderRadius: 8 }}
          />
        </Badge>
        
        <div style={{ width: 1, height: 28, background: '#e2e8f0', margin: '0 4px' }} />

        <Dropdown menu={userMenu} placement="bottomRight" trigger={['click']}>
          <div style={{ 
            cursor: 'pointer', 
            display: 'flex', 
            alignItems: 'center', 
            gap: 12, 
            padding: '4px 8px',
            borderRadius: 8,
            transition: 'background 0.2s',
          }}>
            <Avatar 
              style={{ 
                backgroundColor: '#4f46e5', 
                fontWeight: 600, 
                boxShadow: '0 2px 4px rgba(79, 70, 229, 0.2)' 
              }} 
              icon={<UserOutlined />} 
            />
            <div style={{ lineHeight: '1.25', display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontWeight: 600, fontSize: 13, color: '#0f172a' }}>
                {user?.firstName ? `${user?.firstName} ${user?.lastName || ''}` : 'Dr. Jane Smith'}
              </span>
              <span style={{ fontSize: 11, color: '#64748b', fontWeight: 500 }}>
                {user?.roles?.[0] === UserRole.ONCOLOGIST || user?.roles?.[0] === UserRole.MEDICAL_ONCOLOGIST ? 'Consultant Oncologist' : (user?.roles?.[0] || 'Care Coordinator')}
              </span>
            </div>
          </div>
        </Dropdown>
      </Space>
    </Header>
  );
}
