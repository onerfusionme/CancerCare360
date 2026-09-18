'use client';

import React from 'react';
import { Layout, Menu, Button, Avatar, Dropdown, Space, Badge } from 'antd';
import {
  DashboardOutlined,
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
  HeartOutlined,
  TeamOutlined,
  BankOutlined,
  AuditOutlined
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
    { key: '/patients', icon: <UserOutlined />, label: 'Patients Directory' },
    { key: '/second-opinion', icon: <AuditOutlined style={{ color: '#818cf8' }} />, label: 'Second Opinion Hub' },
    { key: '/community', icon: <TeamOutlined style={{ color: '#2dd4bf' }} />, label: 'CareCircles (Family Connect)' },
    { key: '/relief', icon: <BankOutlined style={{ color: '#f59e0b' }} />, label: 'CareRelief (Aid & Grants)' },
    { key: '/gaps', icon: <AlertOutlined />, label: 'Care Gaps & Follow-Up' },
    { key: '/appointments', icon: <CalendarOutlined />, label: 'Appointments & Flow' },
    { key: '/consultations', icon: <FileSearchOutlined />, label: 'Consultation Briefing' },
    { key: '/investigations', icon: <ExperimentOutlined />, label: 'Investigations' },
    { key: '/journey', icon: <MedicineBoxOutlined />, label: 'Treatment Journeys' },
    { key: '/documents', icon: <FolderOpenOutlined />, label: 'Clinical Documents' },
    { key: '/campaigns', icon: <NotificationOutlined />, label: 'Outreach & Campaigns' },
    { key: '/education', icon: <ReadOutlined />, label: 'Patient Education' },
    { 
      key: 'analytics-group', 
      icon: <BarChartOutlined />, 
      label: 'Analytics',
      children: [
        { key: '/analytics', label: 'Operational & Continuity' },
        { key: '/analytics/practice', label: 'Practice Growth' }
      ]
    },
    { key: '/reports', icon: <FileTextOutlined />, label: 'Registry & Reports' },
  ];

  if (hasRole('ADMIN' as any)) {
    menuItems.push({
      key: 'admin-group',
      icon: <SettingOutlined />,
      label: 'Administration',
      children: [
        { key: '/admin', label: 'System Overview' },
        { key: '/gaps/rules', label: 'Care Gap Protocol Rules' },
        { key: '/admin/ai', label: 'AI Governance & Safety' },
        { key: '/admin/docs', label: 'API Documentation' },
      ]
    });
  }

  // Find active key based on pathname, supporting nested subroutes
  const getSelectedKey = () => {
    if (!pathname) return '/dashboard';
    const allKeys: string[] = [];
    menuItems.forEach((item: any) => {
      if (item.children) {
        item.children.forEach((child: any) => allKeys.push(child.key));
      } else {
        allKeys.push(item.key);
      }
    });

    if (allKeys.includes(pathname)) return pathname;

    // Prefix matching for subpages (e.g. /patients/[id] -> /patients)
    const matched = allKeys
      .filter(k => k.startsWith('/') && pathname.startsWith(k))
      .sort((a, b) => b.length - a.length)[0];

    return matched || pathname;
  };

  const activeKey = getSelectedKey();

  return (
    <Layout className="ambient-canvas" style={{ minHeight: '100vh', background: 'transparent' }}>
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
          background: isDark ? 'rgba(9, 13, 22, 0.88)' : 'rgba(15, 23, 42, 0.88)',
          backdropFilter: 'blur(24px) saturate(190%)',
          WebkitBackdropFilter: 'blur(24px) saturate(190%)',
          borderRight: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '4px 0 24px rgba(0, 0, 0, 0.12)',
          zIndex: 10,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div 
          onClick={() => router.push('/dashboard')}
          title="Go to Dashboard"
          style={{ 
            height: 68, 
            display: 'flex', 
            alignItems: 'center', 
            padding: sidebarCollapsed ? '0 16px' : '0 20px',
            borderBottom: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(255, 255, 255, 0.08)',
            gap: 12,
            cursor: 'pointer',
            transition: 'opacity 0.2s ease',
            userSelect: 'none',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.85')}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
        >
          <div style={{
            width: 38,
            height: 38,
            borderRadius: 10,
            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 14px rgba(99, 102, 241, 0.45)',
            flexShrink: 0,
          }}>
            <MedicineBoxOutlined style={{ fontSize: 20, color: '#ffffff' }} />
          </div>
          {!sidebarCollapsed && (
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#f8fafc', letterSpacing: '-0.02em', lineHeight: 1.2 }}>
                CancerCare<span style={{ color: '#818cf8' }}>360</span>
              </div>
              <div style={{ fontSize: 10, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Enterprise Oncology OS
              </div>
            </div>
          )}
        </div>

        {!sidebarCollapsed && (
          <div style={{ 
            margin: '14px 14px 6px', 
            padding: '10px 14px', 
            background: 'rgba(255, 255, 255, 0.06)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            borderRadius: 10,
            border: '1px solid rgba(255, 255, 255, 0.08)',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
          }}>
            <div style={{ fontSize: 10, color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.05em' }}>
              Active Facility
            </div>
            <div style={{ fontSize: 12.5, color: '#f1f5f9', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              City Cancer Center
            </div>
            <div style={{ fontSize: 11, color: '#818cf8', fontWeight: 500 }}>
              Comprehensive Oncology Institute
            </div>
          </div>
        )}

        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[activeKey]}
          defaultOpenKeys={['analytics-group', 'admin-group']}
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
            padding: '0 6px',
          }}
        />

        {!sidebarCollapsed && (
          <div style={{ 
            marginTop: 'auto', 
            padding: '16px 16px', 
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            background: 'rgba(0, 0, 0, 0.2)',
          }}>
            <Button
              block
              ghost
              icon={<HeartOutlined style={{ color: '#2dd4bf' }} />}
              onClick={() => router.push('/portal')}
              style={{
                borderColor: 'rgba(45, 212, 191, 0.4)',
                color: '#2dd4bf',
                background: 'rgba(45, 212, 191, 0.08)',
                marginBottom: 12,
                fontSize: 12,
                fontWeight: 600,
                height: 36,
                borderRadius: 8
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
                boxShadow: '0 0 8px #10b981',
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
      <Layout style={{ marginLeft: sidebarCollapsed ? 80 : 264, minHeight: '100vh', transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)', background: 'transparent' }}>
        <HeaderBar />
        <Content style={{ 
          margin: 0, 
          padding: '24px 32px', 
          background: 'transparent', 
          minHeight: 'calc(100vh - 64px)',
        }}>
          {children}
        </Content>
      </Layout>
    </Layout>
  );
}
