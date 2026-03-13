import { ActionReducer } from '@ngrx/store';
import { SessionState } from '../../../shared/models/session.model';
import { SessionUser } from '../../../shared/models/user.model';

const STORAGE_KEY = 'skillmatrix_session';

function isValidSession(data: unknown): data is { user: SessionUser; isAuthenticated: boolean } {
  if (!data || typeof data !== 'object') return false;
  const obj = data as Record<string, unknown>;
  if (!obj['user'] || typeof obj['user'] !== 'object') return false;
  const user = obj['user'] as Record<string, unknown>;
  return (
    typeof user['id'] === 'string' &&
    typeof user['email'] === 'string' &&
    typeof user['role'] === 'string' &&
    ['Employee', 'Manager', 'Admin'].includes(user['role'] as string)
  );
}

export function sessionHydrationMetaReducer(
  reducer: ActionReducer<{ session: SessionState }>
): ActionReducer<{ session: SessionState }> {
  return (state, action) => {
    if (action.type === '@ngrx/store/init') {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (isValidSession(parsed)) {
            const nextState = reducer(state, action);
            return {
              ...nextState,
              session: {
                user: parsed.user,
                isAuthenticated: true,
                loading: false,
                error: null,
              },
            };
          } else {
            localStorage.removeItem(STORAGE_KEY);
          }
        }
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    }

    const nextState = reducer(state, action);

    if (nextState.session.isAuthenticated && nextState.session.user) {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          user: nextState.session.user,
          isAuthenticated: true,
        })
      );
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }

    return nextState;
  };
}
