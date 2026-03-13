import { ActionReducer } from '@ngrx/store';
import { sessionHydrationMetaReducer } from './session.meta-reducer';
import { SessionState } from '../../../shared/models/session.model';
import { SessionUser } from '../../../shared/models/user.model';
import { initialSessionState } from './session.reducer';

const STORAGE_KEY = 'skillmatrix_session';

const mockUser: SessionUser = {
  id: 'u001',
  name: 'Priya Sharma',
  email: 'priya.sharma@skillmatrix.com',
  role: 'Employee',
  department: 'Frontend Development',
  avatarUrl: 'https://example.com/avatar.jpg',
};

const authenticatedSessionState: SessionState = {
  user: mockUser,
  isAuthenticated: true,
  loading: false,
  error: null,
};

function makePassthroughReducer(
  override?: Partial<SessionState>
): ActionReducer<{ session: SessionState }> {
  return (state = { session: initialSessionState }, action) => ({
    session: { ...initialSessionState, ...override },
  });
}

describe('sessionHydrationMetaReducer', () => {
  beforeEach(() => localStorage.clear());
  afterEach(() => localStorage.clear());

  describe('Hydration on @ngrx/store/init', () => {
    it('should restore valid session from localStorage', () => {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ user: mockUser, isAuthenticated: true })
      );

      const baseReducer = makePassthroughReducer();
      const metaReducer = sessionHydrationMetaReducer(baseReducer);
      const result = metaReducer(undefined, { type: '@ngrx/store/init' });

      expect(result.session.isAuthenticated).toBeTrue();
      expect(result.session.user).toEqual(mockUser);
      expect(result.session.loading).toBeFalse();
      expect(result.session.error).toBeNull();
    });

    it('should clear localStorage and use initial state for corrupted JSON', () => {
      localStorage.setItem(STORAGE_KEY, 'not-valid-json{{{');

      const baseReducer = makePassthroughReducer();
      const metaReducer = sessionHydrationMetaReducer(baseReducer);
      metaReducer(undefined, { type: '@ngrx/store/init' });

      expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
    });

    it('should clear and ignore data missing required fields', () => {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ user: { id: 'u001' } }) // missing email and role
      );

      const baseReducer = makePassthroughReducer();
      const metaReducer = sessionHydrationMetaReducer(baseReducer);
      metaReducer(undefined, { type: '@ngrx/store/init' });

      expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
    });

    it('should reject data with invalid role value', () => {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          user: { id: 'u001', email: 'a@b.com', role: 'SuperAdmin' },
          isAuthenticated: true,
        })
      );

      const baseReducer = makePassthroughReducer();
      const metaReducer = sessionHydrationMetaReducer(baseReducer);
      metaReducer(undefined, { type: '@ngrx/store/init' });

      expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
    });

    it('should not hydrate when localStorage is empty', () => {
      const baseReducer = makePassthroughReducer();
      const metaReducer = sessionHydrationMetaReducer(baseReducer);
      const result = metaReducer(undefined, { type: '@ngrx/store/init' });

      expect(result.session.isAuthenticated).toBeFalse();
      expect(result.session.user).toBeNull();
    });
  });

  describe('Persistence after state change', () => {
    it('should write to localStorage when user is authenticated', () => {
      const baseReducer = makePassthroughReducer(authenticatedSessionState);
      const metaReducer = sessionHydrationMetaReducer(baseReducer);
      metaReducer(undefined, { type: 'SOME_ACTION' });

      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY)!);
      expect(stored.user).toEqual(mockUser);
      expect(stored.isAuthenticated).toBeTrue();
    });

    it('should remove from localStorage when user is not authenticated', () => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ user: mockUser }));

      const baseReducer = makePassthroughReducer({ user: null, isAuthenticated: false });
      const metaReducer = sessionHydrationMetaReducer(baseReducer);
      metaReducer(undefined, { type: 'SOME_ACTION' });

      expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
    });
  });
});
