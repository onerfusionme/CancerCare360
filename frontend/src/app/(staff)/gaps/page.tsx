'use client';

import React, { useState } from 'react';
import { Tabs, Table, Tag, Button, Switch, Select, Space, Card, Typography, Modal } from 'antd';
import { useTasks, useTaskStats } from '@/hooks/use-follow-up';
import { useDetectGaps, useGenerateTasks } from '@/hooks/use-care-gaps';
import { outreachService } from '@/services/outreach.service';
import { useQuery } from '@tanstack/react-query';
import TaskStatsCards from '@/components/follow-up/TaskStatsCards';
import GapDetectionResults from '@/components/care-gap/GapDetectionResults';
import OutreachModal from '@/components/follow-up/OutreachModal';
import { GapExplanationModal } from '@/components/ai/GapExplanationModal';
import { CareGap } from '@/types/care-gap';

const { Option } = Select;
const { Title } = Typography;

export default function CareGapsPage() {
  const [activeTab, setActiveTab] = useState('1');
  const [outreachModalOpen, setOutreachModalOpen] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string | undefined>();
  
  const [explainGapModalOpen, setExplainGapModalOpen] = useState(false);
  const [selectedGap, setSelectedGap] = useState<CareGap | null>(null);

  // Tab 1
  const { data: stats } = useTaskStats();
  const { data: tasks, isLoading: tasksLoading } = useTasks();

  // Tab 2
  const { data: gaps, refetch: detectGaps, isFetching: detectingGaps } = useDetectGaps();
  const generateTasksMutation = useGenerateTasks();

  // Tab 3
  const { data: outreachLogs, isLoading: outreachLoading } = useQuery({
    queryKey: ['outreachLogs', 'all'],
    queryFn: () => outreachService.getTaskOutreach('all'), // mock all
    enabled: activeTab === '3'
  });

  const handleGenerateTasks = async () => {
    await generateTasksMutation.mutateAsync();
  };

  const getPriorityColor = (p: string) => {
    switch(p) {
      case 'URGENT': return 'red';
      case 'HIGH': return 'orange';
      case 'NORMAL': return 'blue';
      case 'LOW': return 'default';
      default: return 'default';
    }
  };

  const taskColumns = [
    {
      title: 'Patient',
      key: 'patient',
      render: (_: any, record: any) => (
        <div>
          <div>{record.patient?.name || 'Unknown'}</div>
          <div style={{ fontSize: '12px', color: '#888' }}>MRN: {record.patient?.mrn}</div>
        </div>
      )
    },
    { title: 'Task Type', dataIndex: 'taskType', key: 'taskType', render: (t: string) => <Tag>{t.replace('_', ' ')}</Tag> },
    { title: 'Description', dataIndex: 'description', key: 'desc' },
    { title: 'Priority', dataIndex: 'priority', key: 'priority', render: (p: string) => <Tag color={getPriorityColor(p)}>{p}</Tag> },
    { title: 'Due Date', dataIndex: 'dueDate', key: 'dueDate', render: (d: string) => d ? new Date(d).toLocaleDateString() : '' },
    { title: 'Status', dataIndex: 'status', key: 'status' },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: any) => (
        <Space>
          <Button size="small" onClick={() => { setSelectedTaskId(record.id); setOutreachModalOpen(true); }}>Log Contact</Button>
          <Button size="small" type="primary">Resolve</Button>
        </Space>
      )
    }
  ];

  const outreachColumns = [
    { title: 'Patient', key: 'patient', render: (_: any, record: any) => record.patient?.name },
    { title: 'Channel', dataIndex: 'channel', key: 'channel', render: (c: string) => <Tag color="blue">{c}</Tag> },
    { title: 'Outcome', dataIndex: 'outcome', key: 'outcome' },
    { title: 'Date', dataIndex: 'contactedAt', key: 'date', render: (d: string) => d ? new Date(d).toLocaleString() : '' },
    { title: 'Notes', dataIndex: 'notes', key: 'notes' },
    { title: 'Next Action', dataIndex: 'nextAction', key: 'nextAction' }
  ];

  return (
    <div style={{ padding: 24 }}>
      <Title level={2}>Care Gaps & Follow-up</Title>
      
      {stats && <TaskStatsCards stats={stats} />}

      <Card>
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <Tabs.TabPane tab="My Tasks" key="1">
            <div style={{ marginBottom: 16 }}>
              <Space>
                <Select placeholder="Filter Priority" style={{ width: 120 }}>
                  <Option value="HIGH">High</Option>
                  <Option value="URGENT">Urgent</Option>
                </Select>
                <span>Overdue Only: <Switch /></span>
              </Space>
            </div>
            <Table columns={taskColumns} dataSource={tasks || []} rowKey="id" loading={tasksLoading} />
          </Tabs.TabPane>
          <Tabs.TabPane tab="Care Gap Detection" key="2">
            <div style={{ marginBottom: 16 }}>
              <Button type="primary" onClick={() => detectGaps()} loading={detectingGaps}>Run Detection</Button>
            </div>
            <GapDetectionResults 
              gaps={gaps || []} 
              onGenerateTasks={handleGenerateTasks} 
              loading={generateTasksMutation.isPending} 
              onExplainGap={(gap) => {
                setSelectedGap(gap);
                setExplainGapModalOpen(true);
              }}
            />
          </Tabs.TabPane>
          <Tabs.TabPane tab="Outreach Log" key="3">
            <div style={{ marginBottom: 16 }}>
              <Button type="primary" onClick={() => { setSelectedTaskId(undefined); setOutreachModalOpen(true); }}>Log Contact</Button>
            </div>
            <Table columns={outreachColumns} dataSource={outreachLogs || []} rowKey="id" loading={outreachLoading} />
          </Tabs.TabPane>
        </Tabs>
      </Card>

      <OutreachModal 
        open={outreachModalOpen} 
        onClose={() => setOutreachModalOpen(false)} 
        taskId={selectedTaskId} 
      />

      <GapExplanationModal
        open={explainGapModalOpen}
        onClose={() => setExplainGapModalOpen(false)}
        gapType={selectedGap?.gapType || ''}
        gapData={selectedGap}
      />
    </div>
  );
}
