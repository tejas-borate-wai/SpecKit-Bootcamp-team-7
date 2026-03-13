import { Component, inject, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet, NavigationEnd } from '@angular/router';
import { BreakpointObserver } from '@angular/cdk/layout';
import { MatSidenavModule, MatSidenav } from '@angular/material/sidenav';
import { Store } from '@ngrx/store';
import { Subscription, filter } from 'rxjs';
import { SidebarComponent } from './shared/components/sidebar/sidebar.component';
import { HeaderComponent } from './shared/components/header/header.component';
import { selectIsAuthenticated } from './core/store/session/session.selectors';
import { BREAKPOINTS } from './core/breakpoints';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    MatSidenavModule,
    SidebarComponent,
    HeaderComponent,
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit, OnDestroy {
  @ViewChild('sidenav') sidenav!: MatSidenav;

  private breakpointObserver = inject(BreakpointObserver);
  private router = inject(Router);
  private store = inject(Store);
  private subs = new Subscription();

  isAuthenticated$ = this.store.select(selectIsAuthenticated);
  sidebarMode: 'side' | 'over' = 'side';
  sidebarOpened = true;
  sidebarCollapsed = false;
  showShell = false;

  private readonly hiddenRoutes = ['/login', '/unauthorized'];

  ngOnInit(): void {
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
}
