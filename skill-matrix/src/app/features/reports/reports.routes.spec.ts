/**
 * Reports routing configuration tests.
 *
 * These tests verify that:
 *  - The /reports parent route in app.routes.ts requires authGuard + roleGuard (Manager, Admin)
 *  - The /reports/heatmap child route has roleGuard restricted to Admin only
 *  - All other report child routes have no additional role restrictions
 */

import { Routes } from '@angular/router';
import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { RouterStateSnapshot, ActivatedRouteSnapshot, Router } from '@angular/router';

import { reportsRoutes } from './reports.routes';
import { routes as appRoutes } from '../../app.routes';
import { roleGuard } from '../../core/auth/role.guard';
import { authGuard } from '../../core/auth/auth.guard';
import { selectUserRole } from '../../core/store/session/session.selectors';
import { selectCurrentUser } from '../../core/store/session/session.selectors';
import { UserRole } from '../../shared/models/user.model';

// ── Helpers ───────────────────────────────────────────────────────────────────

function triggerRoleGuard(
  role: UserRole | null,
  allowedRoles: string[],
): ReturnType<typeof roleGuard> {
  const store = TestBed.inject(MockStore);
  store.overrideSelector(selectUserRole, role);
  store.refreshState();

  const route = { data: { roles: allowedRoles } } as unknown as ActivatedRouteSnapshot;
  const state = {} as RouterStateSnapshot;
  return TestBed.runInInjectionContext(() => roleGuard(route, state));
}

// ── Route configuration assertions ───────────────────────────────────────────

describe('reportsRoutes configuration', () => {
  it('contains a root path with child routes', () => {
    expect(reportsRoutes.length).toBeGreaterThan(0);
    const root = reportsRoutes[0];
    expect(root.path).toBe('');
    expect(Array.isArray(root.children)).toBeTrue();
  });

  it('defines a skill-gap child route', () => {
    const children = reportsRoutes[0].children as Routes;
    const route = children.find((r) => r.path === 'skill-gap');
    expect(route).toBeDefined();
    expect(route!.canActivate).toBeUndefined();
  });

  it('defines a team child route without extra guards', () => {
    const children = reportsRoutes[0].children as Routes;
    const route = children.find((r) => r.path === 'team');
    expect(route).toBeDefined();
    expect(route!.canActivate).toBeUndefined();
  });

  it('defines a trends child route without extra guards', () => {
    const children = reportsRoutes[0].children as Routes;
    const route = children.find((r) => r.path === 'trends');
    expect(route).toBeDefined();
    expect(route!.canActivate).toBeUndefined();
  });

  it('defines a heatmap route with roleGuard restricted to Admin', () => {
    const children = reportsRoutes[0].children as Routes;
    const heatmap = children.find((r) => r.path === 'heatmap');
    expect(heatmap).toBeDefined();
    expect(heatmap!.canActivate).toContain(roleGuard);
    expect((heatmap!.data as { roles: string[] })['roles']).toEqual(['Admin']);
  });
});

describe('app.routes — /reports parent route', () => {
  it('exists and has canActivate guards', () => {
    const reportsRoute = appRoutes.find((r) => r.path === 'reports');
    expect(reportsRoute).toBeDefined();
    expect(reportsRoute!.canActivate).toBeDefined();
    expect(Array.isArray(reportsRoute!.canActivate)).toBeTrue();
  });

  it('requires authGuard on the /reports route', () => {
    const reportsRoute = appRoutes.find((r) => r.path === 'reports')!;
    expect(reportsRoute.canActivate).toContain(authGuard);
  });

  it('requires roleGuard on the /reports route', () => {
    const reportsRoute = appRoutes.find((r) => r.path === 'reports')!;
    expect(reportsRoute.canActivate).toContain(roleGuard);
  });

  it('allows Manager and Admin roles for the /reports route', () => {
    const reportsRoute = appRoutes.find((r) => r.path === 'reports')!;
    const roles = (reportsRoute.data as { roles: string[] })['roles'];
    expect(roles).toContain('Manager');
    expect(roles).toContain('Admin');
  });

  it('does NOT allow Employee role for the /reports route', () => {
    const reportsRoute = appRoutes.find((r) => r.path === 'reports')!;
    const roles = (reportsRoute.data as { roles: string[] })['roles'];
    expect(roles).not.toContain('Employee');
  });
});

// ── Guard behavior for report routes ─────────────────────────────────────────

describe('roleGuard behaviour for /reports routes', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      providers: [
        provideMockStore({
          selectors: [
            { selector: selectUserRole, value: null },
            { selector: selectCurrentUser, value: null },
          ],
        }),
      ],
    });
  });

  afterEach(() => TestBed.resetTestingModule());

  describe('/reports parent (Manager + Admin)', () => {
    const ALLOWED: UserRole[] = ['Manager', 'Admin'];

    it.each
      ? it.each(ALLOWED)('allows %s', (role) => {
          triggerRoleGuard(role, ['Manager', 'Admin']);
        })
      : it('allows Manager', (done) => {
          const result = triggerRoleGuard('Manager', ['Manager', 'Admin']);
          (result as any).subscribe((val: unknown) => {
            expect(val).toBeTrue();
            done();
          });
        });

    it('redirects Employee to /unauthorized', (done) => {
      const result = triggerRoleGuard('Employee', ['Manager', 'Admin']);
      (result as any).subscribe((val: unknown) => {
        expect(val?.toString()).toContain('unauthorized');
        done();
      });
    });

    it('redirects unauthenticated (null) user to /unauthorized', (done) => {
      const result = triggerRoleGuard(null, ['Manager', 'Admin']);
      (result as any).subscribe((val: unknown) => {
        expect(val?.toString()).toContain('unauthorized');
        done();
      });
    });
  });

  describe('/reports/heatmap (Admin only)', () => {
    it('allows Admin', (done) => {
      const result = triggerRoleGuard('Admin', ['Admin']);
      (result as any).subscribe((val: unknown) => {
        expect(val).toBeTrue();
        done();
      });
    });

    it('redirects Manager to /unauthorized', (done) => {
      const result = triggerRoleGuard('Manager', ['Admin']);
      (result as any).subscribe((val: unknown) => {
        expect(val?.toString()).toContain('unauthorized');
        done();
      });
    });

    it('redirects Employee to /unauthorized', (done) => {
      const result = triggerRoleGuard('Employee', ['Admin']);
      (result as any).subscribe((val: unknown) => {
        expect(val?.toString()).toContain('unauthorized');
        done();
      });
    });
  });
});
