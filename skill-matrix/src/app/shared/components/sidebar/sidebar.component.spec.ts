import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { of } from 'rxjs';
import { SidebarComponent } from './sidebar.component';
import { NavigationService } from '../../../core/services/navigation.service';
import { selectUserRole } from '../../../core/store/session/session.selectors';
import { NavItem } from '../../models/navigation.model';
import { By } from '@angular/platform-browser';

const employeeItems: NavItem[] = [
  { label: 'Dashboard', icon: 'dashboard', route: '/dashboard', roles: ['Employee', 'Manager', 'Admin'] },
  { label: 'My Skills', icon: 'psychology', route: '/my-skills', roles: ['Employee', 'Manager', 'Admin'] },
];

const adminItems: NavItem[] = [
  ...employeeItems,
  { label: 'Reports', icon: 'assessment', route: '/reports', roles: ['Manager', 'Admin'], section: 'INSIGHTS' },
  {
    label: 'Skill Framework',
    icon: 'account_tree',
    route: '/admin/framework',
    roles: ['Admin'],
    section: 'SETTINGS',
    children: [
      { label: 'Categories', icon: 'category', route: '/admin/framework', roles: ['Admin'] },
    ],
  },
];

describe('SidebarComponent', () => {
  let component: SidebarComponent;
  let fixture: ComponentFixture<SidebarComponent>;
  let mockNavService: jasmine.SpyObj<NavigationService>;

  beforeEach(async () => {
    mockNavService = jasmine.createSpyObj('NavigationService', ['getNavItems$']);
    mockNavService.getNavItems$.and.returnValue(of(employeeItems));

    await TestBed.configureTestingModule({
      imports: [SidebarComponent, RouterTestingModule, NoopAnimationsModule],
      providers: [
        provideMockStore({ selectors: [{ selector: selectUserRole, value: 'Employee' }] }),
        { provide: NavigationService, useValue: mockNavService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SidebarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Employee nav items', () => {
    it('should render only employee items', () => {
      const links = fixture.debugElement.queryAll(By.css('a[mat-list-item]'));
      expect(links.length).toBe(employeeItems.length);
    });

    it('should NOT render admin-only items in DOM', () => {
      const allText = fixture.nativeElement.textContent;
      expect(allText).not.toContain('Reports');
      expect(allText).not.toContain('Skill Framework');
    });
  });

  describe('Admin nav items', () => {
    beforeEach(() => {
      mockNavService.getNavItems$.and.returnValue(of(adminItems));
      fixture.detectChanges();
    });

    it('should render section headers for INSIGHTS and SETTINGS', () => {
      // Trigger async pipe update
      component.navItems$ = mockNavService.getNavItems$();
      fixture.detectChanges();
      const allText = fixture.nativeElement.textContent;
      expect(allText).toContain('Dashboard');
    });
  });

  describe('Collapsed input', () => {
    it('should accept collapsed=true input', () => {
      component.collapsed = true;
      fixture.detectChanges();
      const nav = fixture.debugElement.query(By.css('nav.sidebar-nav'));
      expect(nav.classes['collapsed']).toBeTrue();
    });

    it('should default to collapsed=false', () => {
      expect(component.collapsed).toBeFalse();
    });
  });

  describe('closeSidebar output', () => {
    it('should emit closeSidebar on nav item click', () => {
      const closeSpy = jasmine.createSpy('closeSidebar');
      component.closeSidebar.subscribe(closeSpy);
      component.onItemClick();
      expect(closeSpy).toHaveBeenCalled();
    });
  });
});
