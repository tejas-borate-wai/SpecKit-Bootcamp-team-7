// src/app/shared/models/file-validation.model.ts

export const ALLOWED_FORMATS: string[] = [
  'application/pdf',
  'image/jpeg',
  'image/png',
];

/** Maximum allowed file size in bytes (5 MB) */
export const MAX_FILE_SIZE = 5_242_880;
