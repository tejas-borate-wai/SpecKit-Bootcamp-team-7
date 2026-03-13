import { createReducer, on } from '@ngrx/store';
import { SessionState } from '../../../shared/models/session.model';
import { SessionActions } from './session.actions';

export const initialSessionState: SessionState = {
  user: null,
  isAuthenticated: false,
  loading: false,
  error: null,
};

export const sessionReducer = createReducer(
  initialSessionState,

  on(SessionActions.login, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),

  on(SessionActions.loginSuccess, (state, { user }) => ({
    ...state,
    user,
    isAuthenticated: true,
    loading: false,
    error: null,
  })),

  on(SessionActions.loginFailure, (state, { error }) => ({
    ...state,
    user: null,
    isAuthenticated: false,
    loading: false,
    error,
  })),

  on(SessionActions.logout, () => ({
    ...initialSessionState,
  })),

  on(SessionActions.restoreSession, (state) => ({
    ...state,
    loading: true,
  })),

  on(SessionActions.restoreSessionSuccess, (state, { user }) => ({
    ...state,
    user,
    isAuthenticated: true,
    loading: false,
    error: null,
  })),

  on(SessionActions.restoreSessionFailure, () => ({
    ...initialSessionState,
  })),
);
