import { Component, inject, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet, NavigationEnd, ChildrenOutletContexts } from '@angular/router';
import { BreakpointObserver } from '@angular/cdk/layout';
import { MatSidenavModule, MatSidenav } from '@angular/material/sidenav';
import { Store } from '@ngrx/store';
import { Subscription, filter, take } from 'rxjs';
import { SidebarComponent } from './shared/components/sidebar/sidebar.component';
import { HeaderComponent } from './shared/components/header/header.component';
import { selectIsAuthenticated, selectCurrentUser } from './core/store/session/session.selectors';
import { NotificationActions } from './core/store/notifications/notifications.actions';
import { BREAKPOINTS } from './core/breakpoints';
import { BreakpointService } from './core/services/breakpoint.service';
import { routeAnimations } from './core/animations/route.animations';
import { BottomNavComponent } from './shared/components/bottom-nav/bottom-nav.component';
import { FABComponent } from './shared/components/fab/fab.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    MatSidenavModule,
    SidebarComponent,
    HeaderComponent,
    BottomNavComponent,
    FABComponent,
  ],
  animations: [routeAnimations],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit, OnDestroy {
  @ViewChild('sidenav') sidenav!: MatSidenav;

  private breakpointObserver = inject(BreakpointObserver);
  private router = inject(Router);
  private store = inject(Store);
  private contexts = inject(ChildrenOutletContexts);
  private subs = new Subscription();
  private bp = inject(BreakpointService);

  isAuthenticated$ = this.store.select(selectIsAuthenticated);
  isMobile$ = this.bp.isMobile$;
  sidebarMode: 'side' | 'over' = 'side';
  sidebarOpened = true;
  sidebarCollapsed = false;
  showShell = false;
  prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  currentRoute = '';

  private readonly hiddenRoutes = ['/login', '/unauthorized'];

  private readonly fabConfig: Record<string, { icon: string; route: string; label: string }> = {
    '/my-skills': { icon: 'add', route: '/my-skills/add', label: 'Add skill' },
    '/projects': { icon: 'add', route: '/projects/create', label: 'Create project' },
    '/certifications': { icon: 'upload', route: '/certifications/upload', label: 'Upload certification' },
  };

  get fabAction(): { icon: string; route: string; label: string } | null {
    for (const [path, config] of Object.entries(this.fabConfig)) {
      if (this.currentRoute === path || this.currentRoute.startsWith(path + '/list')) {
        return config;
      }
    }
    return null;
  }

  ngOnInit(): void {
    // Load notifications for users with a hydrated session (page refresh)
    this.store.select(selectCurrentUser).pipe(take(1)).subscribe((user) => {
      if (user) {
        this.store.dispatch(NotificationActions.load({ userId: user.id }));
      }
    });

    this.subs.add(
      this.breakpointObserver
        .observe([BREAKPOINTS.mobile, BREAKPOINTS.tablet, BREAKPOINTS.desktop])
        .subscribe((result) => {
          if (result.breakpoints[BREAKPOINTS.mobile]) {
            this.sidebarMode = 'over';
            this.sidebarOpened = false;
            this.sidebarCollapsed = false;
          } else if (result.breakpoints[BREAKPOINTS.tablet]) {
            this.sidebarMode = 'side';
            this.sidebarOpened = true;
            this.sidebarCollapsed = true;
          } else {
            this.sidebarMode = 'side';
            this.sidebarOpened = true;
            this.sidebarCollapsed = false;
          }
        })
    );

    this.subs.add(
      this.router.events
        .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
        .subscribe((event) => {
          this.showShell = !this.hiddenRoutes.some((r) =>
            event.urlAfterRedirects.startsWith(r)
          );
          this.currentRoute = event.urlAfterRedirects;

          if (
            !event.urlAfterRedirects.startsWith('/login') &&
            !event.urlAfterRedirects.startsWith('/unauthorized')
          ) {
            localStorage.setItem('skillmatrix_last_route', event.urlAfterRedirects);
          }
        })
    );
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  onToggleSidebar(): void {
    this.sidenav?.toggle();
  }

  onCloseSidebar(): void {
    if (this.sidebarMode === 'over') {
      this.sidenav?.close();
    }
  }

  getRouteAnimationData(): string {
    return this.contexts.getContext('primary')?.route?.snapshot?.url?.toString() ?? '';
  }
}
