import { createAction, props } from '@ngrx/store';
import { Certification, CreateCertificationPayload } from '../../../shared/models/certification.model';

export const loadCertifications = createAction('[Certifications] Load Certifications');

export const loadCertificationsSuccess = createAction(
  '[Certifications] Load Certifications Success',
  props<{ certifications: Certification[] }>()
);

export const loadCertificationsFailure = createAction(
  '[Certifications] Load Certifications Failure',
  props<{ error: string }>()
);

export const uploadCertification = createAction(
  '[Certifications] Upload Certification',
  props<{ payload: CreateCertificationPayload }>()
);

export const uploadCertificationSuccess = createAction(
  '[Certifications] Upload Certification Success',
  props<{ certification: Certification }>()
);

export const uploadCertificationFailure = createAction(
  '[Certifications] Upload Certification Failure',
  props<{ error: string }>()
);

export const deleteCertification = createAction(
  '[Certifications] Delete Certification',
  props<{ certId: string }>()
);

export const deleteCertificationSuccess = createAction(
  '[Certifications] Delete Certification Success',
  props<{ certId: string }>()
);
