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
  LogoutOutlined,
  RiseOutlined,
  FolderOpenOutlined,
  NotificationOutlined,
  HeartOutlined
} from '@ant-design/icons';
import { useRouter, usePathname } from 'next/navigation';
import { useAppStore } from '@/stores/app.store';
import { useAuth } from '@/hooks/use-auth';
import HeaderBar from './HeaderBar';

const { Header, Sider, Content } = Layout;

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { sidebarCollapsed, toggleSidebar, themeMode } = useAppStore();
  const { user, hasRole } = useAuth();
  const isDark = themeMode === 'dark';

  const menuItems: any[] = [
    { key: '/dashboard', icon: <DashboardOutlined />, label: 'Dashboard' },
    { key: '/registry', icon: <TeamOutlined />, label: 'Patient Registry' },
    { key: '/patients', icon: <UserOutlined />, label: 'Patients' },
    { key: '/consultations', icon: <FileSearchOutlined />, label: 'Consultation Readiness' },
    { key: '/gaps', icon: <AlertOutlined />, label: 'Care Gaps & Follow-up' },
    { key: '/appointments', icon: <CalendarOutlined />, label: 'Appointments & Clinic Flow' },
    { key: '/investigations', icon: <ExperimentOutlined />, label: 'Investigations' },
    { key: '/journey', icon: <MedicineBoxOutlined />, label: 'Treatment Journey' },
    { key: '/documents', icon: <FolderOpenOutlined />, label: 'Clinical Documents' },
    { key: '/campaigns', icon: <NotificationOutlined />, label: 'Patient Campaigns' },
    { key: '/education', icon: <ReadOutlined />, label: 'Education & Engagement' },
    { 
      key: 'analytics-group', 
      icon: <BarChartOutlined />, 
      label: 'Analytics',
      children: [
        { key: '/analytics', label: 'Operational Analytics' },
        { key: '/analytics/practice', icon: <RiseOutlined />, label: 'Practice Growth' }
      ]
    },
    { key: '/reports', icon: <FileTextOutlined />, label: 'Reports' },
  ];

  if (hasRole('ADMIN' as any)) {
    menuItems.push({
      key: 'admin-group',
      icon: <SettingOutlined />,
      label: 'Administration',
      children: [
        { key: '/admin', label: 'System Overview' },
        { key: '/admin/ai', label: 'AI Governance & Safety' },
        { key: '/gaps/rules', label: 'Care Gap Rules' }
      ]
    });
  }

  // Find active key based on pathname
  const activeKey = pathname;

  return (
    <Layout style={{ minHeight: '100vh', background: isDark ? '#060911' : '#f8fafc' }}>
      <Sider 
        trigger={null} 
        collapsible 
        collapsed={sidebarCollapsed}
        theme="dark"
        width={264}
        className="executive-sider"
        style={{
          overflow: 'auto',
          height: '100vh',
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
          background: isDark ? '#090d16' : '#0f172a',
          borderRight: isDark ? '1px solid #1e293b' : '1px solid #1e293b',
          zIndex: 10,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div style={{ 
          height: 68, 
          display: 'flex', 
          alignItems: 'center', 
          padding: sidebarCollapsed ? '0 16px' : '0 20px',
          borderBottom: isDark ? '1px solid #1e293b' : '1px solid #1e293b',
          gap: 12,
        }}>
          <div style={{
            width: 36,
            height: 36,
            borderRadius: 8,
            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 10px rgba(99, 102, 241, 0.4)',
            flexShrink: 0,
          }}>
            <MedicineBoxOutlined style={{ fontSize: 20, color: '#ffffff' }} />
          </div>
          {!sidebarCollapsed && (
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#f8fafc', letterSpacing: '-0.02em', lineHeight: 1.2 }}>
                CancerCare<span style={{ color: '#818cf8' }}>360</span>
              </div>
              <div style={{ fontSize: 10, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Enterprise Oncology OS
              </div>
            </div>
          )}
        </div>

        {!sidebarCollapsed && (
          <div style={{ 
            margin: '12px 14px 4px', 
            padding: '8px 12px', 
            background: isDark ? '#131c2e' : '#1e293b', 
            borderRadius: 6,
            border: isDark ? '1px solid #1e293b' : '1px solid #334155',
          }}>
            <div style={{ fontSize: 10, color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.05em' }}>
              Active Facility
            </div>
            <div style={{ fontSize: 12, color: '#f1f5f9', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              City General Hospital
            </div>
            <div style={{ fontSize: 11, color: '#818cf8' }}>
              Medical Oncology Wing
            </div>
          </div>
        )}

        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[activeKey]}
          items={menuItems}
          onClick={({ key }) => {
            if (key.startsWith('/')) {
              router.push(key);
            }
          }}
          style={{ 
            background: 'transparent', 
            borderRight: 0, 
            marginTop: 8,
            padding: '0 8px',
          }}
        />

        {!sidebarCollapsed && (
          <div style={{ 
            marginTop: 'auto', 
            padding: '16px 16px', 
            borderTop: isDark ? '1px solid #1e293b' : '1px solid #1e293b',
            background: isDark ? '#05070d' : '#090d16',
          }}>
            <Button
              block
              ghost
              icon={<HeartOutlined style={{ color: '#0d9488' }} />}
              onClick={() => router.push('/portal')}
              style={{
                borderColor: '#0d9488',
                color: '#2dd4bf',
                marginBottom: 12,
                fontSize: 12,
                fontWeight: 600,
                height: 34,
                borderRadius: 6
              }}
            >
              Patient Portal Companion
            </Button>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <span style={{ 
                width: 7, 
                height: 7, 
                borderRadius: '50%', 
                background: '#10b981', 
                boxShadow: '0 0 6px #10b981',
                display: 'inline-block' 
              }} />
              <span style={{ fontSize: 11, color: '#94a3b8', fontWeight: 500 }}>
                FHIR R4 & ABDM Connected
              </span>
            </div>
            <div style={{ fontSize: 10, color: '#64748b' }}>
              DPDP Act 2023 Clinical Guardrails
            </div>
          </div>
        )}
      </Sider>
      <Layout style={{ marginLeft: sidebarCollapsed ? 80 : 264, minHeight: '100vh', transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)', background: isDark ? '#060911' : '#f8fafc' }}>
        <HeaderBar />
        <Content style={{ 
          margin: 0, 
          padding: '24px 32px', 
          background: isDark ? '#060911' : '#f8fafc', 
          minHeight: 'calc(100vh - 68px)',
        }}>
          {children}
        </Content>
      </Layout>
    </Layout>
  );
}
