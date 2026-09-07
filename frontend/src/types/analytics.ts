export interface RoleDashboardData {
  stats: {
    label: string;
    value: number | string;
    trend?: number;
    description?: string;
  }[];
  recentActivity: {
    id: string;
    time: string;
    description: string;
    type: 'alert' | 'success' | 'info' | 'warning';
  }[];
  shortcuts: {
    label: string;
    url: string;
    icon: string;
  }[];
  [key: string]: any;
}

export interface CareContinuityMetrics {
  totalActiveJourneys: number;
  careContinuityIndex: number;
  lostToFollowUpRate: number;
  averageLabTurnaroundHours: number;
  stageDistribution: {
    stage: string;
    count: number;
    percentage: number;
  }[];
  retentionFunnel: {
    step: string;
    retained: number;
    dropped: number;
  }[];
}

export interface InvestigationTATMetrics {
  investigation: string;
  slaHours: number;
  actualHours: number;
  volume: number;
}

export interface ReportRequestDto {
  reportType: 'PATIENT_CENSUS' | 'CARE_GAPS' | 'INVESTIGATION_TAT' | 'TREATMENT_COMPLETION';
  startDate: string;
  endDate: string;
  departmentId?: string;
  format: 'CSV' | 'JSON';
}

export interface ReportResult {
  url?: string;
  data?: any;
  filename: string;
}
