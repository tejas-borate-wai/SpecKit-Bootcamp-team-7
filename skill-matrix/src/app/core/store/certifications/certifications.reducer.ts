import { createReducer, on } from '@ngrx/store';
import { Certification } from '../../../shared/models/certification.model';
import * as CertificationsActions from './certifications.actions';

export interface CertificationsState {
  certifications: Certification[];
  loading: boolean;
  error: string | null;
  uploadInProgress: boolean;
}

export const initialCertificationsState: CertificationsState = {
  certifications: [],
  loading: false,
  error: null,
  uploadInProgress: false,
};

export const certificationsReducer = createReducer(
  initialCertificationsState,

  on(CertificationsActions.loadCertifications, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),

  on(CertificationsActions.loadCertificationsSuccess, (state, { certifications }) => ({
    ...state,
    loading: false,
    certifications,
  })),

  on(CertificationsActions.loadCertificationsFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  on(CertificationsActions.uploadCertification, (state) => ({
    ...state,
    uploadInProgress: true,
    error: null,
  })),

  on(CertificationsActions.uploadCertificationSuccess, (state, { certification }) => ({
    ...state,
    uploadInProgress: false,
    certifications: [...state.certifications, certification],
  })),

  on(CertificationsActions.uploadCertificationFailure, (state, { error }) => ({
    ...state,
    uploadInProgress: false,
    error,
  })),

  on(CertificationsActions.deleteCertificationSuccess, (state, { certId }) => ({
    ...state,
    certifications: state.certifications.filter((c) => c.certId !== certId),
  }))
);
