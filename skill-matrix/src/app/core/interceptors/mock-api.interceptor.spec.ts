import { TestBed } from '@angular/core/testing';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { mockApiInterceptor } from './mock-api.interceptor';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('mockApiInterceptor', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;

  // Spy on fetch to return canned user data without hitting the network
  const mockUsers = [
    {
      id: 'u001',
      name: 'Priya Sharma',
      email: 'priya.sharma@skillmatrix.com',
      password: 'password123',
      role: 'Employee',
      department: 'Frontend Development',
      avatarUrl: 'https://example.com/avatar.jpg',
    },
  ];

  beforeEach(() => {
    // Reset the module-level users cache between tests
    (globalThis as any)._usersCache = null;

    spyOn(globalThis, 'fetch').and.returnValue(
      Promise.resolve({
        json: () => Promise.resolve(mockUsers),
      } as Response)
    );

    TestBed.configureTestingModule({
      imports: [MatSnackBarModule, NoopAnimationsModule],
      providers: [
        provideHttpClient(withInterceptors([mockApiInterceptor])),
        provideHttpClientTesting(),
      ],
    });

    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should return 200 with user (minus password) for valid credentials', (done) => {
    http
      .post<any>('/api/auth/login', {
        email: 'priya.sharma@skillmatrix.com',
        password: 'password123',
      })
      .subscribe({
        next: (user) => {
          expect(user.id).toBe('u001');
          expect(user.email).toBe('priya.sharma@skillmatrix.com');
          expect((user as any).password).toBeUndefined();
          done();
        },
        error: done.fail,
      });
  });

  it('should return 401 for invalid credentials', (done) => {
    http
      .post<any>('/api/auth/login', {
        email: 'priya.sharma@skillmatrix.com',
        password: 'wrongpassword',
      })
      .subscribe({
        next: () => done.fail('expected 401'),
        error: (err: HttpErrorResponse) => {
          expect(err.status).toBe(401);
          expect(err.error.message).toBe('Invalid email or password');
          done();
        },
      });
  });

  it('should return 400 when email or password is missing', (done) => {
    http
      .post<any>('/api/auth/login', { email: '', password: '' })
      .subscribe({
        next: () => done.fail('expected 400'),
        error: (err: HttpErrorResponse) => {
          expect(err.status).toBe(400);
          done();
        },
      });
  });

  it('should pass through non-login requests unchanged', (done) => {
    http.get('/api/some-other-endpoint').subscribe({
      next: (data) => {
        expect(data).toBeTruthy();
        done();
      },
      error: done.fail,
    });

    const req = httpMock.expectOne('/api/some-other-endpoint');
    req.flush({ ok: true });
  });
});
