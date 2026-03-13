import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { LoginCredentials, SessionUser } from '../../../shared/models/user.model';

export const SessionActions = createActionGroup({
  source: 'Session',
  events: {
    'Login': props<{ credentials: LoginCredentials }>(),
    'Login Success': props<{ user: SessionUser }>(),
    'Login Failure': props<{ error: string }>(),
    'Logout': emptyProps(),
    'Restore Session': emptyProps(),
    'Restore Session Success': props<{ user: SessionUser }>(),
    'Restore Session Failure': emptyProps(),
  },
});
