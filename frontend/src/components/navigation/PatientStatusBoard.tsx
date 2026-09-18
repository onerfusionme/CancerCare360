'use client';

import React from 'react';
import { Card, Tag, Typography, Space, Button, Tooltip, Badge, Row, Col } from 'antd';
import { 
  PhoneOutlined, 
  SwapOutlined, 
  CalendarOutlined, 
  AlertOutlined, 
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  UserOutlined,
  ClockCircleOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { CommandCenterTask } from '@/types/navigation';

const { Text } = Typography;

interface PatientStatusBoardProps {
  tasks: CommandCenterTask[];
  onScreenBarrier: (task: CommandCenterTask) => void;
  onRecover: (task: CommandCenterTask) => void;
  onHandoff: (task: CommandCenterTask) => void;
  onOutreach: (task: CommandCenterTask) => void;
}

export default function PatientStatusBoard({
  tasks,
  onScreenBarrier,
  onRecover,
  onHandoff,
  onOutreach,
}: PatientStatusBoardProps) {
  // Distribute tasks across 5 stages
  const columns = React.useMemo(() => {
    const col1_detected: CommandCenterTask[] = [];
    const col2_outreach: CommandCenterTask[] = [];
    const col3_barrier: CommandCenterTask[] = [];
    const col4_escalated: CommandCenterTask[] = [];
    const col5_recovered: CommandCenterTask[] = [];

    tasks.forEach((t) => {
      const hasActiveBarrier = t.barriers && t.barriers.some((b) => b.status !== 'RESOLVED');
      const isRecovered = t.status === 'RESOLVED' || t.patient?.followUpStage === 'RE_ENGAGED';
      const isEscalated = (t.escalationLevel && t.escalationLevel > 0) || (t.handoffs && t.handoffs.length > 0);
      const hasOutreach = (t.outreachLogs && t.outreachLogs.length > 0) || t.status === 'IN_PROGRESS';

      if (isRecovered) {
        col5_recovered.push(t);
      } else if (isEscalated) {
        col4_escalated.push(t);
      } else if (hasActiveBarrier) {
        col3_barrier.push(t);
      } else if (hasOutreach) {
        col2_outreach.push(t);
      } else {
        col1_detected.push(t);
      }
    });

    return [
      {
        id: 'detected',
        title: 'Care Gap Detected',
        badgeColor: '#ef4444',
        tasks: col1_detected,
        desc: 'Unaddressed gaps flagged by protocol rules',
      },
      {
        id: 'outreach',
        title: 'Outreach in Progress',
        badgeColor: '#f97316',
        tasks: col2_outreach,
        desc: 'Patient contacted, waiting for response or slot',
      },
      {
        id: 'barrier',
        title: 'Barrier Identified',
        badgeColor: '#eab308',
        tasks: col3_barrier,
        desc: 'Social, financial or hospital barrier flagged',
      },
      {
        id: 'escalated',
        title: 'Clinical Review & Escalation',
        badgeColor: '#8b5cf6',
        tasks: col4_escalated,
        desc: 'Handed off to doctor/nurse/social work',
      },
      {
        id: 'recovered',
        title: 'Recovered & Re-engaged',
        badgeColor: '#10b981',
        tasks: col5_recovered,
        desc: 'Slot booked, gap resolved, patient active',
      },
    ];
  }, [tasks]);

  const getPriorityColor = (score: number) => {
    if (score >= 80) return '#ef4444';
    if (score >= 60) return '#f97316';
    if (score >= 40) return '#eab308';
    return '#3b82f6';
  };

  const getDaysOverdue = (dueDate: string) => {
    const diff = dayjs().diff(dayjs(dueDate), 'day');
    return diff;
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, minmax(260px, 1fr))', gap: 16, overflowX: 'auto', paddingBottom: 16 }}>
      {columns.map((col) => (
        <div
          key={col.id}
          style={{
            background: '#f8fafc',
            borderRadius: 8,
            border: '1px solid #e2e8f0',
            display: 'flex',
            flexDirection: 'column',
            minHeight: 520,
          }}
        >
          {/* Column Header */}
          <div style={{ padding: '12px 14px', borderBottom: '1px solid #e2e8f0', background: '#ffffff', borderTopLeftRadius: 8, borderTopRightRadius: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text strong style={{ fontSize: 13 }}>{col.title}</Text>
              <Badge count={col.tasks.length} style={{ backgroundColor: col.badgeColor }} />
            </div>
            <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>{col.desc}</div>
          </div>

          {/* Cards List */}
          <div style={{ padding: 10, display: 'flex', flexDirection: 'column', gap: 10, flex: 1, overflowY: 'auto' }}>
            {col.tasks.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 10px', color: '#94a3b8', fontSize: 12 }}>
                No patients in this stage
              </div>
            ) : (
              col.tasks.map((task) => {
                const daysOverdue = getDaysOverdue(task.dueDate);
                const activeBarriers = task.barriers?.filter((b) => b.status !== 'RESOLVED') || [];

                return (
                  <Card
                    key={task.id}
                    size="small"
                    style={{
                      borderRadius: 6,
                      boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                      borderColor: task.priorityScore >= 80 ? '#fca5a5' : '#e2e8f0',
                      background: '#ffffff',
                    }}
                    bodyStyle={{ padding: 12 }}
                  >
                    {/* Priority & Overdue row */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                      <Tooltip title={task.priorityReason || 'Multi-factor clinical prioritization'}>
                        <Tag
                          color={getPriorityColor(task.priorityScore)}
                          style={{ fontWeight: 700, fontSize: 11, margin: 0, cursor: 'help' }}
                        >
                          Score: {task.priorityScore}/100
                        </Tag>
                      </Tooltip>

                      {daysOverdue > 0 ? (
                        <Tag color="red" style={{ fontSize: 10, margin: 0 }}>
                          <ClockCircleOutlined style={{ marginRight: 3 }} />
                          {daysOverdue}d overdue
                        </Tag>
                      ) : (
                        <Tag color="blue" style={{ fontSize: 10, margin: 0 }}>
                          Due {dayjs(task.dueDate).format('DD MMM')}
                        </Tag>
                      )}
                    </div>

                    {/* Patient info */}
                    <div style={{ marginBottom: 6 }}>
                      <div style={{ fontWeight: 600, fontSize: 13, color: '#0f172a' }}>
                        {task.patient?.firstName} {task.patient?.lastName}
                      </div>
                      <div style={{ fontSize: 11, color: '#64748b' }}>
                        MRN: <Text code style={{ fontSize: 11 }}>{task.patient?.mrn}</Text>
                      </div>
                      {task.patient?.cancerType && (
                        <div style={{ fontSize: 11, color: '#475569', marginTop: 2 }}>
                          {task.patient.cancerType} ({task.patient.cancerStage || 'Stage II'})
                        </div>
                      )}
                    </div>

                    {/* Gap type badge */}
                    <div style={{ marginBottom: 6 }}>
                      <Tag color="geekblue" style={{ fontSize: 10 }}>
                        {(task.careGapType || task.taskType || 'CARE_GAP').replace(/_/g, ' ')}
                      </Tag>
                    </div>

                    {/* Active barrier indicator */}
                    {activeBarriers.length > 0 && (
                      <div style={{ background: '#fef3c7', padding: '4px 6px', borderRadius: 4, marginBottom: 6, fontSize: 11, color: '#92400e' }}>
                        <AlertOutlined style={{ marginRight: 4 }} />
                        <span style={{ fontWeight: 600 }}>{activeBarriers[0].category}: </span>
                        <span>{activeBarriers[0].barrierDetail.slice(0, 45)}...</span>
                      </div>
                    )}

                    {/* Suggested Next Action */}
                    {task.nextAction && (
                      <div style={{ fontSize: 11, color: '#4338ca', marginBottom: 8, background: '#e0e7ff', padding: '3px 6px', borderRadius: 4 }}>
                        &rarr; {task.nextAction}
                      </div>
                    )}

                    {/* Action buttons */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 4, marginTop: 4 }}>
                      <Button
                        size="small"
                        icon={<PhoneOutlined />}
                        style={{ fontSize: 11 }}
                        onClick={() => onOutreach(task)}
                      >
                        Outreach
                      </Button>
                      <Button
                        size="small"
                        icon={<AlertOutlined />}
                        style={{ fontSize: 11 }}
                        onClick={() => onScreenBarrier(task)}
                      >
                        Barrier
                      </Button>
                      <Button
                        size="small"
                        icon={<SwapOutlined />}
                        style={{ fontSize: 11 }}
                        onClick={() => onHandoff(task)}
                      >
                        Handoff
                      </Button>
                      <Button
                        size="small"
                        type="primary"
                        icon={<CheckCircleOutlined />}
                        style={{ fontSize: 11, background: '#16a34a', borderColor: '#16a34a' }}
                        onClick={() => onRecover(task)}
                      >
                        Recover
                      </Button>
                    </div>
                  </Card>
                );
              })
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
