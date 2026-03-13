import { HttpInterceptorFn, HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { delay, Observable, of, switchMap, tap, throwError, catchError } from 'rxjs';
import { User } from '../../shared/models/user.model';
import { ToastService } from '../../shared/services/toast.service';

let usersCache: User[] | null = null;

async function loadUsers(): Promise<User[]> {
  if (usersCache) return usersCache;
  const response = await fetch('/assets/mock-data/users.json');
  usersCache = await response.json();
  return usersCache!;
}

function getSimulatedDelay(): number {
  return Math.floor(Math.random() * 150) + 50;
}

export const mockApiInterceptor: HttpInterceptorFn = (req, next) => {
  const toastService = inject(ToastService);

  if (req.url === '/api/auth/login' && req.method === 'POST') {
    return handleLogin(req.body as { email?: string; password?: string });
  }

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 403) {
        toastService.showError('You do not have permission to perform this action.');
      }
      return throwError(() => error);
    })
  );
};

function handleLogin(body: { email?: string; password?: string } | null): Observable<HttpResponse<unknown>> {
  if (!body?.email || !body?.password) {
    return throwError(() => new HttpErrorResponse({
      status: 400,
      statusText: 'Bad Request',
      error: { message: 'Email and password are required' },
    })).pipe(delay(getSimulatedDelay()));
  }

  return new Observable<HttpResponse<unknown>>((subscriber) => {
    loadUsers().then((users) => {
      const match = users.find(
        (u) => u.email === body.email && u.password === body.password
      );

      if (match) {
        const { password, ...sessionUser } = match;
        subscriber.next(new HttpResponse({
          status: 200,
          body: sessionUser,
        }));
        subscriber.complete();
      } else {
        subscriber.error(new HttpErrorResponse({
          status: 401,
          statusText: 'Unauthorized',
          error: { message: 'Invalid email or password' },
        }));
      }
    });
  }).pipe(delay(getSimulatedDelay()));
}
