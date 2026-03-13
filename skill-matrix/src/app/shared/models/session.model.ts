import { SessionUser } from './user.model';

export interface SessionState {
  user: SessionUser | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}
