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
      padding: '0 24px', 
      background: '#fff', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'space-between',
      boxShadow: '0 1px 4px rgba(0,21,41,.08)',
      position: 'sticky',
      top: 0,
      zIndex: 9
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <Button
          type="text"
          icon={sidebarCollapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          onClick={toggleSidebar}
          style={{ fontSize: '16px', width: 64, height: 64, marginLeft: -24 }}
        />
        <div style={{ width: 300 }}>
          <GlobalSearch />
        </div>
      </div>

      <Space size="large">
        <Dropdown menu={langMenu} placement="bottomRight">
          <Button type="text" icon={<GlobalOutlined />}>
            {language.toUpperCase()}
          </Button>
        </Dropdown>
        
        <Badge count={5} size="small">
          <Button type="text" icon={<BellOutlined style={{ fontSize: 18 }} />} />
        </Badge>
        
        <Dropdown menu={userMenu} placement="bottomRight" trigger={['click']}>
          <Space style={{ cursor: 'pointer' }}>
            <Avatar style={{ backgroundColor: '#1677ff' }} icon={<UserOutlined />} />
            <div style={{ lineHeight: '1.2', display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontWeight: 500, fontSize: 14 }}>{user?.firstName} {user?.lastName}</span>
              <span style={{ fontSize: 12, color: '#888' }}>{user?.roles[0]}</span>
            </div>
          </Space>
        </Dropdown>
      </Space>
    </Header>
  );
}
