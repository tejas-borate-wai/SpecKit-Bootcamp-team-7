import { MemoizedSelector } from '@ngrx/store';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { TestBed } from '@angular/core/testing';
import {
  selectCurrentUser,
  selectIsAuthenticated,
  selectUserRole,
  selectAuthLoading,
  selectAuthError,
} from './session.selectors';
import { SessionState } from '../../../shared/models/session.model';
import { SessionUser } from '../../../shared/models/user.model';

const mockUser: SessionUser = {
  id: 'u009',
  name: 'Kavitha Menon',
  email: 'kavitha.menon@skillmatrix.com',
  role: 'Manager',
  department: 'Engineering',
  avatarUrl: 'https://example.com/avatar.jpg',
};

const authenticatedState: { session: SessionState } = {
  session: {
    user: mockUser,
    isAuthenticated: true,
    loading: false,
    error: null,
  },
};

const unauthenticatedState: { session: SessionState } = {
  session: {
    user: null,
    isAuthenticated: false,
    loading: false,
    error: null,
  },
};

describe('Session Selectors', () => {
  let store: MockStore;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideMockStore({ initialState: authenticatedState })],
    });
    store = TestBed.inject(MockStore);
  });

  afterEach(() => store.resetSelectors());

  describe('selectCurrentUser', () => {
    it('should return user when authenticated', (done) => {
      store.setState(authenticatedState);
      store.refreshState();
      store.select(selectCurrentUser).subscribe((user) => {
        expect(user).toEqual(mockUser);
        done();
      });
    });

    it('should return null when unauthenticated', (done) => {
      store.setState(unauthenticatedState);
      store.refreshState();
      store.select(selectCurrentUser).subscribe((user) => {
        expect(user).toBeNull();
        done();
      });
    });
  });

  describe('selectIsAuthenticated', () => {
    it('should return true when authenticated', (done) => {
      store.setState(authenticatedState);
      store.refreshState();
      store.select(selectIsAuthenticated).subscribe((val) => {
        expect(val).toBeTrue();
        done();
      });
    });

    it('should return false when not authenticated', (done) => {
      store.setState(unauthenticatedState);
      store.refreshState();
      store.select(selectIsAuthenticated).subscribe((val) => {
        expect(val).toBeFalse();
        done();
      });
    });
  });

  describe('selectUserRole', () => {
    it('should return role when user is present', (done) => {
      store.setState(authenticatedState);
      store.refreshState();
      store.select(selectUserRole).subscribe((role) => {
        expect(role).toBe('Manager');
        done();
      });
    });

    it('should return null when user is null', (done) => {
      store.setState(unauthenticatedState);
      store.refreshState();
      store.select(selectUserRole).subscribe((role) => {
        expect(role).toBeNull();
        done();
      });
    });
  });

  describe('selectAuthLoading', () => {
    it('should return loading state', (done) => {
      store.setState({ session: { ...authenticatedState.session, loading: true } });
      store.refreshState();
      store.select(selectAuthLoading).subscribe((val) => {
        expect(val).toBeTrue();
        done();
      });
    });
  });

  describe('selectAuthError', () => {
    it('should return error string when present', (done) => {
      store.setState({ session: { ...unauthenticatedState.session, error: 'Invalid email or password' } });
      store.refreshState();
      store.select(selectAuthError).subscribe((err) => {
        expect(err).toBe('Invalid email or password');
        done();
      });
    });

    it('should return null when no error', (done) => {
      store.setState(authenticatedState);
      store.refreshState();
      store.select(selectAuthError).subscribe((err) => {
        expect(err).toBeNull();
        done();
      });
    });
  });
});
