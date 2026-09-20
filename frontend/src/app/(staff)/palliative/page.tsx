'use client';

import React, { useState } from 'react';
import { Tabs, Typography, Card, Tag, Space, Breadcrumb } from 'antd';
import {
  HeartOutlined,
  BookOutlined,
  DashboardOutlined,
  CompassOutlined,
  MedicineBoxOutlined,
  HomeOutlined,
} from '@ant-design/icons';
import Link from 'next/link';
import { PalliativeDossierView } from '@/components/palliative/PalliativeDossierView';
import { DigitalEsasAssessmentView } from '@/components/palliative/DigitalEsasAssessmentView';
import { PalliativeClinicDirectoryView } from '@/components/palliative/PalliativeClinicDirectoryView';

const { Title, Text } = Typography;

export default function PalliativeOncologyPage() {
  const [activeTab, setActiveTab] = useState<string>('dossier');

  const tabItems = [
    {
      key: 'dossier',
      label: (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 14, fontWeight: 600 }}>
          <BookOutlined style={{ color: '#f43f5e' }} />
          Clinical Philosophy & Total Pain Dossier
        </span>
      ),
      children: <PalliativeDossierView />,
    },
    {
      key: 'screener',
      label: (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 14, fontWeight: 600 }}>
          <DashboardOutlined style={{ color: '#6366f1' }} />
          Digital ESAS Total Pain Screener
        </span>
      ),
      children: <DigitalEsasAssessmentView />,
    },
    {
      key: 'network',
      label: (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 14, fontWeight: 600 }}>
          <CompassOutlined style={{ color: '#14b8a6' }} />
          Geographic Pain Clinic Network
        </span>
      ),
      children: <PalliativeClinicDirectoryView />,
    },
  ];

  return (
    <div style={{ padding: '0 4px 32px' }}>
      {/* Breadcrumb */}
      <Breadcrumb
        style={{ marginBottom: 16 }}
        items={[
          {
            title: (
              <Link href="/dashboard" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                <HomeOutlined />
                <span>Dashboard</span>
              </Link>
            ),
          },
          {
            title: (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: '#f43f5e', fontWeight: 600 }}>
                <HeartOutlined />
                <span>Pain & Palliative Oncology</span>
              </span>
            ),
          },
        ]}
      />

      {/* Main Tabs Container */}
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        type="card"
        size="large"
        items={tabItems}
        style={{
          marginTop: 8,
        }}
      />
    </div>
  );
}
