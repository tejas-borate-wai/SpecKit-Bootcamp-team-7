import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { roleGuard } from './role.guard';
import { selectUserRole } from '../store/session/session.selectors';
import { UserRole } from '../../shared/models/user.model';

function runGuard(role: UserRole | null, allowedRoles: string[]) {
  const store = TestBed.inject(MockStore);
  store.overrideSelector(selectUserRole, role);
  store.refreshState();

  const route = { data: { roles: allowedRoles } } as unknown as ActivatedRouteSnapshot;
  const state = {} as RouterStateSnapshot;
  return TestBed.runInInjectionContext(() => roleGuard(route, state));
}

describe('roleGuard', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      providers: [
        provideMockStore({
          selectors: [{ selector: selectUserRole, value: null }],
        }),
      ],
    });
  });

  it('should allow activation when role is in allowed list', (done) => {
    const result = runGuard('Manager', ['Manager', 'Admin']);
    (result as any).subscribe((val: any) => {
      expect(val).toBeTrue();
      done();
    });
  });

  it('should redirect to /unauthorized when role is not in allowed list', (done) => {
    const result = runGuard('Employee', ['Manager', 'Admin']);
    (result as any).subscribe((val: any) => {
      expect(val.toString()).toBe('/unauthorized');
      done();
    });
  });

  it('should redirect to /unauthorized when role is null', (done) => {
    const result = runGuard(null, ['Manager', 'Admin']);
    (result as any).subscribe((val: any) => {
      expect(val.toString()).toBe('/unauthorized');
      done();
    });
  });

  it('should allow activation when no roles restriction is defined', (done) => {
    const result = runGuard('Employee', []);
    // empty roles list = no restriction
    const isObservable = typeof (result as any).subscribe === 'function';
    if (isObservable) {
      (result as any).subscribe((val: any) => {
        expect(val).toBeTrue();
        done();
      });
    } else {
      expect(result).toBeTrue();
      done();
    }
  });

  it('should allow Admin to access Admin-only routes', (done) => {
    const result = runGuard('Admin', ['Admin']);
    (result as any).subscribe((val: any) => {
      expect(val).toBeTrue();
      done();
    });
  });
});
