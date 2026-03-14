// src/app/shared/models/certification.model.ts

export type CertificationStatus = 'Valid' | 'Expiring Soon' | 'Expired';

export interface Certification {
  certId: string;
  userId: string;
  skillId: string;
  certName: string;
  issuingOrg: string;
  issueDate: string;   // ISO 8601 date (YYYY-MM-DD)
  expiryDate: string;  // ISO 8601 date (YYYY-MM-DD)
  filePath: string;
}

export interface FileMetadata {
  fileName: string;
  fileSize: number;  // bytes
  fileType: string;  // MIME type
  filePath: string;  // simulated: "assets/uploads/{fileName}"
}

export interface CreateCertificationPayload {
  certName: string;
  skillId: string;
  issuingOrg: string;
  issueDate: string;  // ISO 8601 date
  expiryDate: string; // ISO 8601 date
  filePath: string;   // from FileMetadata.filePath
}

export interface CertificationWithStatus extends Certification {
  status: CertificationStatus;
}
