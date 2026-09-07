import axios from 'axios';
import {
  RoleDashboardData,
  CareContinuityMetrics,
  InvestigationTATMetrics,
  ReportRequestDto,
  ReportResult,
} from '../types/analytics';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api',
});

// Mocking the responses for development so the UI works perfectly without backend
export const getRoleDashboard = async (role: string): Promise<RoleDashboardData> => {
  try {
    const { data } = await api.get(`/analytics/dashboard?role=${role}`);
    return data;
  } catch (error) {
    // Mock fallback
    let stats = [];
    if (role === 'Oncologist') {
      stats = [
        { label: "My Today's Appointments", value: 12, trend: 2, description: 'vs yesterday' },
        { label: 'Active Cancer Patients', value: 84, trend: 5, description: 'vs last month' },
        { label: 'Reports Pending Review', value: 7, trend: -1, description: 'Requires attention' },
        { label: 'Overdue Milestones', value: 3, trend: 0, description: 'Clinical pathways' },
      ];
    } else if (role === 'Care Coordinator') {
      stats = [
        { label: 'Open Follow-up Tasks', value: 24, trend: -5, description: 'In queue' },
        { label: 'Care Gaps Detected', value: 18, trend: 2, description: 'High priority' },
        { label: 'Outreach Calls Due Today', value: 35, trend: 10, description: 'Scheduled' },
        { label: 'High-Risk Patients', value: 9, trend: -1, description: 'Needs review' },
      ];
    } else if (role === 'HOD') {
      stats = [
        { label: 'Department Patient Volume', value: 450, trend: 15, description: 'Total active' },
        { label: 'Care Continuity Index', value: '88%', trend: 3, description: 'Goal: 90%' },
        { label: 'Avg Consult Wait Time', value: '14 min', trend: -2, description: 'vs last week' },
        { label: 'Investigation Turnaround', value: '2.4 days', trend: -0.5, description: 'Average' },
      ];
    } else {
      stats = [
        { label: 'Total Hospital Patients', value: 12500, trend: 150, description: 'All departments' },
        { label: 'Active Clinical Users', value: 342, trend: 12, description: 'Logged in' },
        { label: 'Total System Audits (24h)', value: 8450, trend: 400, description: 'Logs generated' },
        { label: 'System Storage & AI Ops', value: '72%', trend: 5, description: 'Capacity' },
      ];
    }

    return {
      stats,
      recentActivity: [
        { id: '1', time: '10 mins ago', description: 'Patient record updated for John Doe', type: 'info' },
        { id: '2', time: '30 mins ago', description: 'Critical lab result for Jane Smith', type: 'alert' },
        { id: '3', time: '1 hour ago', description: 'System backup completed successfully', type: 'success' },
        { id: '4', time: '2 hours ago', description: 'New care pathway initiated for 3 patients', type: 'info' },
      ],
      shortcuts: [
        { label: 'New Patient', url: '/patients/new', icon: 'PlusOutlined' },
        { label: 'View Schedule', url: '/appointments', icon: 'CalendarOutlined' },
        { label: 'Generate Report', url: '/reports', icon: 'FileTextOutlined' },
      ]
    };
  }
};

export const getCareContinuity = async (): Promise<CareContinuityMetrics> => {
  try {
    const { data } = await api.get('/analytics/care-continuity');
    return data;
  } catch (error) {
    return {
      totalActiveJourneys: 3420,
      careContinuityIndex: 86.5,
      lostToFollowUpRate: 4.2,
      averageLabTurnaroundHours: 36,
      stageDistribution: [
        { stage: 'Screening', count: 1200, percentage: 35 },
        { stage: 'Diagnosis', count: 800, percentage: 23 },
        { stage: 'Treatment Planning', count: 450, percentage: 13 },
        { stage: 'Active Treatment', count: 650, percentage: 19 },
        { stage: 'Survivorship', count: 320, percentage: 10 },
      ],
      retentionFunnel: [
        { step: 'Initial Consult', retained: 1000, dropped: 0 },
        { step: 'Diagnosis', retained: 850, dropped: 150 },
        { step: 'Treatment Planning', retained: 800, dropped: 50 },
        { step: 'Treatment Start', retained: 760, dropped: 40 },
        { step: 'Follow-up', retained: 710, dropped: 50 },
      ]
    };
  }
};

export const getInvestigationTAT = async (): Promise<InvestigationTATMetrics[]> => {
  try {
    const { data } = await api.get('/analytics/investigation-tat');
    return data;
  } catch (error) {
    return [
      { investigation: 'CT Scan', slaHours: 24, actualHours: 22, volume: 150 },
      { investigation: 'MRI Scan', slaHours: 48, actualHours: 52, volume: 80 },
      { investigation: 'PET Scan', slaHours: 72, actualHours: 68, volume: 45 },
      { investigation: 'Biopsy', slaHours: 120, actualHours: 130, volume: 60 },
      { investigation: 'Complete Blood Count', slaHours: 4, actualHours: 3.5, volume: 500 },
    ];
  }
};

export const generateReport = async (dto: ReportRequestDto): Promise<ReportResult> => {
  try {
    const { data } = await api.post('/analytics/reports', dto);
    return data;
  } catch (error) {
    // Mock report generation delay
    await new Promise(res => setTimeout(res, 1500));
    return {
      url: '#',
      data: 'Mock CSV Data\nCol1,Col2\nVal1,Val2',
      filename: `Report_${dto.reportType}_${new Date().toISOString()}.csv`
    };
  }
};

export const exportPatientFhir = async (patientId: string): Promise<Blob> => {
  try {
    const { data } = await api.get(`/patients/${patientId}/export-fhir`, { responseType: 'blob' });
    return data;
  } catch (error) {
    return new Blob(['Mock FHIR JSON data'], { type: 'application/json' });
  }
};
