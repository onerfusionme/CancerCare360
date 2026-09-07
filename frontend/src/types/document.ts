export enum DocumentType {
  CLINICAL_NOTE = 'CLINICAL_NOTE',
  LAB_REPORT = 'LAB_REPORT',
  IMAGING_REPORT = 'IMAGING_REPORT',
  PATHOLOGY_REPORT = 'PATHOLOGY_REPORT',
  CONSENT_FORM = 'CONSENT_FORM',
  PRESCRIPTION = 'PRESCRIPTION',
  DISCHARGE_SUMMARY = 'DISCHARGE_SUMMARY',
  OTHER = 'OTHER'
}
export enum ScanStatus {
  PENDING = 'PENDING',
  CLEAN = 'CLEAN',
  INFECTED = 'INFECTED',
  ERROR = 'ERROR'
}
export enum OcrStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED'
}
export enum VerificationStatus {
  PENDING = 'PENDING',
  VERIFIED = 'VERIFIED',
  REJECTED = 'REJECTED'
}
export interface Document {
  id: string;
  patientId: string;
  journeyId?: string;
  type: DocumentType;
  fileName: string;
  fileSize: number;
  mimeType: string;
  uploadedBy: string;
  uploadedAt: string;
  scanStatus: ScanStatus;
  ocrStatus: OcrStatus;
  verificationStatus: VerificationStatus;
  notes?: string;
  source?: string;
  patient?: any;
}
export interface DocumentFilter {
  patientId?: string;
  type?: DocumentType;
  verificationStatus?: VerificationStatus;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}
export interface UploadDocumentDto {
  patientId: string;
  journeyId?: string;
  type: DocumentType;
  source?: string;
  notes?: string;
}
