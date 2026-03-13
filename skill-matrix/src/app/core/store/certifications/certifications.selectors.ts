import { createFeatureSelector, createSelector } from '@ngrx/store';
import { CertificationsState } from './certifications.reducer';
import {
  computeCertificationStatus,
  hasValidCertification,
  mapCertificationsWithStatus,
} from '../../../shared/utils/certification.util';
import { CertificationWithStatus } from '../../../shared/models/certification.model';

export const selectCertificationsState =
  createFeatureSelector<CertificationsState>('certifications');

export const selectAllCertifications = createSelector(
  selectCertificationsState,
  (s) => s.certifications
);

export const selectCertificationsLoading = createSelector(
  selectCertificationsState,
  (s) => s.loading
);

export const selectCertificationsError = createSelector(
  selectCertificationsState,
  (s) => s.error
);

export const selectUploadInProgress = createSelector(
  selectCertificationsState,
  (s) => s.uploadInProgress
);

export const selectCertificationsWithStatus = createSelector(
  selectAllCertifications,
  (certs): CertificationWithStatus[] => mapCertificationsWithStatus(certs)
);

export const selectCertificationsForSkill = (skillId: string) =>
  createSelector(selectAllCertifications, (certs) =>
    certs.filter((c) => c.skillId === skillId)
  );

export const selectHasValidCertForSkill = (skillId: string) =>
  createSelector(selectCertificationsForSkill(skillId), (certs) =>
    certs.some((c) => hasValidCertification(c))
  );

export const selectExpiringSoonCertifications = createSelector(
  selectAllCertifications,
  (certs): CertificationWithStatus[] =>
    mapCertificationsWithStatus(certs).filter((c) => c.status === 'Expiring Soon')
);
