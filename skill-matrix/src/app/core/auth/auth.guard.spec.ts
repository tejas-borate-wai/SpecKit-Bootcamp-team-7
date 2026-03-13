import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { authGuard } from './auth.guard';
import { selectIsAuthenticated } from '../store/session/session.selectors';

function runGuard(isAuthenticated: boolean) {
  const store = TestBed.inject(MockStore);
  store.overrideSelector(selectIsAuthenticated, isAuthenticated);
  store.refreshState();

  const route = {} as ActivatedRouteSnapshot;
  const state = {} as RouterStateSnapshot;
  return TestBed.runInInjectionContext(() => authGuard(route, state));
}

describe('authGuard', () => {
  let router: Router;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      providers: [
        provideMockStore({
          selectors: [{ selector: selectIsAuthenticated, value: false }],
        }),
      ],
    });
    router = TestBed.inject(Router);
  });

  it('should allow activation when authenticated', (done) => {
    const result = runGuard(true);
    (result as any).subscribe((val: any) => {
      expect(val).toBeTrue();
      done();
    });
  });

  it('should redirect to /login when not authenticated', (done) => {
    const result = runGuard(false);
    (result as any).subscribe((val: any) => {
      expect(val.toString()).toBe('/login');
      done();
    });
  });
});
