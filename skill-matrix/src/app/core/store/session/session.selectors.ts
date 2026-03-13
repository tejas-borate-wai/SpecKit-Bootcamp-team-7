import { createFeatureSelector, createSelector } from '@ngrx/store';
import { SessionState } from '../../../shared/models/session.model';

export const selectSessionState = createFeatureSelector<SessionState>('session');

export const selectCurrentUser = createSelector(
  selectSessionState,
  (state) => state.user
);

export const selectIsAuthenticated = createSelector(
  selectSessionState,
  (state) => state.isAuthenticated
);

export const selectUserRole = createSelector(
  selectSessionState,
  (state) => state.user?.role ?? null
);

export const selectAuthLoading = createSelector(
  selectSessionState,
  (state) => state.loading
);

export const selectAuthError = createSelector(
  selectSessionState,
  (state) => state.error
);
