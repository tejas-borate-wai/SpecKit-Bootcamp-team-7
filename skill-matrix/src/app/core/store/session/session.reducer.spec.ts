import { SessionActions } from './session.actions';
import { initialSessionState, sessionReducer } from './session.reducer';
import { SessionUser } from '../../../shared/models/user.model';

const mockUser: SessionUser = {
  id: 'u001',
  name: 'Priya Sharma',
  email: 'priya.sharma@skillmatrix.com',
  role: 'Employee',
  department: 'Frontend Development',
  avatarUrl: 'https://example.com/avatar.jpg',
};

describe('sessionReducer', () => {
  it('should return initial state for unknown action', () => {
    const state = sessionReducer(undefined, { type: '@@UNKNOWN' } as any);
    expect(state).toEqual(initialSessionState);
  });

  describe('Login', () => {
    it('should set loading=true and clear error', () => {
      const stateWithError = { ...initialSessionState, error: 'old error' };
      const state = sessionReducer(
        stateWithError,
        SessionActions.login({ credentials: { email: 'a@b.com', password: 'pw' } })
      );
      expect(state.loading).toBeTrue();
      expect(state.error).toBeNull();
      expect(state.isAuthenticated).toBeFalse();
    });
  });

  describe('Login Success', () => {
    it('should set user, isAuthenticated=true and loading=false', () => {
      const loadingState = { ...initialSessionState, loading: true };
      const state = sessionReducer(loadingState, SessionActions.loginSuccess({ user: mockUser }));
      expect(state.user).toEqual(mockUser);
      expect(state.isAuthenticated).toBeTrue();
      expect(state.loading).toBeFalse();
      expect(state.error).toBeNull();
    });
  });

  describe('Login Failure', () => {
    it('should set error, loading=false and clear user', () => {
      const loadingState = { ...initialSessionState, loading: true };
      const state = sessionReducer(
        loadingState,
        SessionActions.loginFailure({ error: 'Invalid email or password' })
      );
      expect(state.error).toBe('Invalid email or password');
      expect(state.loading).toBeFalse();
      expect(state.user).toBeNull();
      expect(state.isAuthenticated).toBeFalse();
    });
  });

  describe('Logout', () => {
    it('should reset to initial state', () => {
      const authenticatedState = {
        user: mockUser,
        isAuthenticated: true,
        loading: false,
        error: null,
      };
      const state = sessionReducer(authenticatedState, SessionActions.logout());
      expect(state).toEqual(initialSessionState);
    });
  });

  describe('Restore Session', () => {
    it('should set loading=true', () => {
      const state = sessionReducer(initialSessionState, SessionActions.restoreSession());
      expect(state.loading).toBeTrue();
    });
  });

  describe('Restore Session Success', () => {
    it('should set user and isAuthenticated=true', () => {
      const state = sessionReducer(
        { ...initialSessionState, loading: true },
        SessionActions.restoreSessionSuccess({ user: mockUser })
      );
      expect(state.user).toEqual(mockUser);
      expect(state.isAuthenticated).toBeTrue();
      expect(state.loading).toBeFalse();
    });
  });

  describe('Restore Session Failure', () => {
    it('should reset to initial state', () => {
      const state = sessionReducer(
        { ...initialSessionState, loading: true },
        SessionActions.restoreSessionFailure()
      );
      expect(state).toEqual(initialSessionState);
    });
  });
});
