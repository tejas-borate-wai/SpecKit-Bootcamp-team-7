import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { BreakpointObserver, BreakpointState } from '@angular/cdk/layout';
import { Subject } from 'rxjs';
import { AppComponent } from './app.component';
import { selectIsAuthenticated } from './core/store/session/session.selectors';
import { BREAKPOINTS } from './core/breakpoints';

describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;
  let store: MockStore;
  let breakpointSubject: Subject<BreakpointState>;
  let mockBreakpointObserver: jasmine.SpyObj<BreakpointObserver>;

  beforeEach(async () => {
    breakpointSubject = new Subject<BreakpointState>();
    mockBreakpointObserver = jasmine.createSpyObj('BreakpointObserver', ['observe']);
    mockBreakpointObserver.observe.and.returnValue(breakpointSubject.asObservable());

    await TestBed.configureTestingModule({
      imports: [AppComponent, RouterTestingModule, NoopAnimationsModule],
      providers: [
        provideMockStore({
          selectors: [{ selector: selectIsAuthenticated, value: false }],
        }),
        { provide: BreakpointObserver, useValue: mockBreakpointObserver },
      ],
    }).compileComponents();

    store = TestBed.inject(MockStore);
    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => store.resetSelectors());

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Shell visibility', () => {
    it('should have showShell=false initially before any navigation', () => {
      expect(component.showShell).toBeFalse();
    });

    it('should set showShell=false for /login route', () => {
      const hiddenRoutes = ['/login', '/unauthorized'];
      const show = !hiddenRoutes.some((r) => '/login'.startsWith(r));
      expect(show).toBeFalse();
    });

    it('should set showShell=true for /dashboard route', () => {
      const hiddenRoutes = ['/login', '/unauthorized'];
      const show = !hiddenRoutes.some((r) => '/dashboard'.startsWith(r));
      expect(show).toBeTrue();
    });

    it('should set showShell=false for /unauthorized route', () => {
      const hiddenRoutes = ['/login', '/unauthorized'];
      const show = !hiddenRoutes.some((r) => '/unauthorized'.startsWith(r));
      expect(show).toBeFalse();
    });
  });

  describe('BreakpointObserver integration', () => {
    it('should set mode=over and opened=false on mobile breakpoint', () => {
      breakpointSubject.next({
        matches: true,
        breakpoints: {
          [BREAKPOINTS.mobile]: true,
          [BREAKPOINTS.tablet]: false,
          [BREAKPOINTS.desktop]: false,
        },
      } as BreakpointState);

      expect(component.sidebarMode).toBe('over');
      expect(component.sidebarOpened).toBeFalse();
      expect(component.sidebarCollapsed).toBeFalse();
    });

    it('should set mode=side, collapsed=true on tablet breakpoint', () => {
      breakpointSubject.next({
        matches: true,
        breakpoints: {
          [BREAKPOINTS.mobile]: false,
          [BREAKPOINTS.tablet]: true,
          [BREAKPOINTS.desktop]: false,
        },
      } as BreakpointState);

      expect(component.sidebarMode).toBe('side');
      expect(component.sidebarOpened).toBeTrue();
      expect(component.sidebarCollapsed).toBeTrue();
    });

    it('should set mode=side, collapsed=false on desktop breakpoint', () => {
      breakpointSubject.next({
        matches: true,
        breakpoints: {
          [BREAKPOINTS.mobile]: false,
          [BREAKPOINTS.tablet]: false,
          [BREAKPOINTS.desktop]: true,
        },
      } as BreakpointState);

      expect(component.sidebarMode).toBe('side');
      expect(component.sidebarOpened).toBeTrue();
      expect(component.sidebarCollapsed).toBeFalse();
    });
  });

  describe('Cleanup', () => {
    it('should unsubscribe on destroy', () => {
      const unsubSpy = spyOn(component['subs'], 'unsubscribe');
      component.ngOnDestroy();
      expect(unsubSpy).toHaveBeenCalled();
    });
  });
});
