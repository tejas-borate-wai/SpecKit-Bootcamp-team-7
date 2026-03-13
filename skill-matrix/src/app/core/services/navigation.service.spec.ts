import { TestBed } from '@angular/core/testing';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { NavigationService } from './navigation.service';
import { selectUserRole } from '../store/session/session.selectors';

describe('NavigationService', () => {
  let service: NavigationService;
  let store: MockStore;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        NavigationService,
        provideMockStore({
          selectors: [{ selector: selectUserRole, value: null }],
        }),
      ],
    });

    service = TestBed.inject(NavigationService);
    store = TestBed.inject(MockStore);
  });

  afterEach(() => store.resetSelectors());

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('Employee role', () => {
    it('should return 5 items (MAIN section only)', (done) => {
      store.overrideSelector(selectUserRole, 'Employee');
      store.refreshState();

      service.getNavItems$().subscribe((items) => {
        expect(items.length).toBe(5);
        const routes = items.map((i) => i.route);
        expect(routes).toContain('/dashboard');
        expect(routes).toContain('/my-skills');
        expect(routes).toContain('/assessments');
        expect(routes).toContain('/certifications');
        expect(routes).toContain('/notifications');
        // Should NOT contain Manager/Admin routes
        expect(routes).not.toContain('/team');
        expect(routes).not.toContain('/reports/heatmap');
        done();
      });
    });
  });

  describe('Manager role', () => {
    it('should return Employee items plus Team and Projects sections', (done) => {
      store.overrideSelector(selectUserRole, 'Manager');
      store.refreshState();

      service.getNavItems$().subscribe((items) => {
        const routes = items.map((i) => i.route);
        // All Employee routes
        expect(routes).toContain('/dashboard');
        expect(routes).toContain('/my-skills');
        // Team section
        expect(routes).toContain('/team');
        expect(routes).toContain('/team/validation-queue');
        // Projects section
        expect(routes).toContain('/projects');
        // Reports (Manager sees Reports but not heatmap)
        expect(routes).toContain('/reports');
        // Should NOT contain Admin-only items
        expect(routes).not.toContain('/reports/heatmap');
        expect(routes).not.toContain('/admin/framework');
        done();
      });
    });
  });

  describe('Admin role', () => {
    it('should return all items including Insights and Settings', (done) => {
      store.overrideSelector(selectUserRole, 'Admin');
      store.refreshState();

      service.getNavItems$().subscribe((items) => {
        const routes = items.map((i) => i.route);
        // Basic
        expect(routes).toContain('/dashboard');
        // Manager items
        expect(routes).toContain('/team');
        expect(routes).toContain('/reports');
        // Admin-only
        expect(routes).toContain('/reports/heatmap');
        expect(routes).toContain('/admin/framework');
        expect(routes).toContain('/admin/rating-config');
        done();
      });
    });
  });

  describe('No role (null)', () => {
    it('should return empty array when role is null', (done) => {
      store.overrideSelector(selectUserRole, null);
      store.refreshState();

      service.getNavItems$().subscribe((items) => {
        expect(items.length).toBe(0);
        done();
      });
    });
  });
});
