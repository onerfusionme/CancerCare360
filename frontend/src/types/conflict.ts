export interface DataConflict {
  id: string;
  patientId: string;
  field: string;
  oldValue: string;
  newValue: string;
  source: string;
  detectedAt: string;
  status: 'PENDING' | 'RESOLVED';
}
export interface CreateConflictDto {
  patientId: string;
  field: string;
  oldValue: string;
  newValue: string;
  source: string;
}
export interface ResolveConflictDto {
  resolution: 'KEEP_OLD' | 'ACCEPT_NEW' | 'MANUAL';
  manualValue?: string;
}
