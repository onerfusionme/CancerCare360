import React from 'react';
import { Layout, Menu, Button, Avatar, Dropdown, Space, Badge } from 'antd';
import {
  DashboardOutlined,
  TeamOutlined,
  UserOutlined,
  FileSearchOutlined,
  AlertOutlined,
  CalendarOutlined,
  ExperimentOutlined,
  MedicineBoxOutlined,
  ReadOutlined,
  BarChartOutlined,
  FileTextOutlined,
  SettingOutlined,
  MenuUnfoldOutlined,
  MenuFoldOutlined,
  BellOutlined,
  GlobalOutlined,
  LogoutOutlined
} from '@ant-design/icons';
import { useRouter, usePathname } from 'next/navigation';
import { useAppStore } from '@/stores/app.store';
import { useAuth } from '@/hooks/use-auth';
import HeaderBar from './HeaderBar';

const { Header, Sider, Content } = Layout;

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { sidebarCollapsed, toggleSidebar } = useAppStore();
  const { user, hasRole } = useAuth();

  const menuItems = [
    { key: '/dashboard', icon: <DashboardOutlined />, label: 'Dashboard' },
    { key: '/registry', icon: <TeamOutlined />, label: 'Patient Registry' },
    { key: '/patients', icon: <UserOutlined />, label: 'Patients' },
    { key: '/consultations', icon: <FileSearchOutlined />, label: 'Consultation Readiness' },
    { key: '/gaps', icon: <AlertOutlined />, label: 'Care Gaps & Follow-up' },
    { key: '/appointments', icon: <CalendarOutlined />, label: 'Appointments & Clinic Flow' },
    { key: '/investigations', icon: <ExperimentOutlined />, label: 'Investigations' },
    { key: '/journey', icon: <MedicineBoxOutlined />, label: 'Treatment Journey' },
    { key: '/education', icon: <ReadOutlined />, label: 'Education & Engagement' },
    { key: '/analytics', icon: <BarChartOutlined />, label: 'Analytics' },
    { key: '/reports', icon: <FileTextOutlined />, label: 'Reports' },
  ];

  if (hasRole('ADMIN' as any)) {
    menuItems.push({ key: '/admin', icon: <SettingOutlined />, label: 'Administration' });
  }

  // Find active key based on pathname
  const activeKey = menuItems.find(item => pathname.startsWith(item.key))?.key || '/dashboard';

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider 
        trigger={null} 
        collapsible 
        collapsed={sidebarCollapsed}
        theme="light"
        width={260}
        style={{
          overflow: 'auto',
          height: '100vh',
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
          boxShadow: '2px 0 8px 0 rgba(29,35,41,.05)',
          zIndex: 10
        }}
      >
        <div style={{ height: 64, display: 'flex', alignItems: 'center', justifyContent: 'center', borderBottom: '1px solid #f0f0f0' }}>
          {sidebarCollapsed ? (
            <MedicineBoxOutlined style={{ fontSize: 24, color: '#1677ff' }} />
          ) : (
            <Space>
              <MedicineBoxOutlined style={{ fontSize: 24, color: '#1677ff' }} />
              <span style={{ fontSize: 18, fontWeight: 600, color: '#1677ff' }}>CancerCare360</span>
            </Space>
          )}
        </div>
        <Menu
          theme="light"
          mode="inline"
          selectedKeys={[activeKey]}
          items={menuItems}
          onClick={({ key }) => router.push(key)}
          style={{ borderRight: 0, marginTop: 8 }}
        />
      </Sider>
      <Layout style={{ marginLeft: sidebarCollapsed ? 80 : 260, transition: 'all 0.2s' }}>
        <HeaderBar />
        <Content style={{ margin: '24px 16px', padding: 24, background: '#fff', borderRadius: 8, minHeight: 280 }}>
          {children}
        </Content>
      </Layout>
    </Layout>
  );
}
