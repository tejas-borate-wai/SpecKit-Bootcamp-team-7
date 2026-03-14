import { Injectable, inject } from '@angular/core';
import { BreakpointObserver } from '@angular/cdk/layout';
import { Observable } from 'rxjs';
import { map, distinctUntilChanged, shareReplay } from 'rxjs/operators';
import { APP_BREAKPOINTS, BreakpointName } from '../constants/breakpoints';

@Injectable({ providedIn: 'root' })
export class BreakpointService {
  private breakpointObserver = inject(BreakpointObserver);

  currentBreakpoint$: Observable<BreakpointName> = this.breakpointObserver
    .observe(Object.values(APP_BREAKPOINTS))
    .pipe(
      map(state => {
        for (const [name, query] of Object.entries(APP_BREAKPOINTS)) {
          if (state.breakpoints[query]) return name as BreakpointName;
        }
        return 'xs' as BreakpointName;
      }),
      distinctUntilChanged(),
      shareReplay(1)
    );

  isMobile$: Observable<boolean> = this.currentBreakpoint$.pipe(
    map(bp => bp === 'xs' || bp === 'sm')
  );

  isTablet$: Observable<boolean> = this.currentBreakpoint$.pipe(
    map(bp => bp === 'md' || bp === 'lg')
  );

  isDesktop$: Observable<boolean> = this.currentBreakpoint$.pipe(
    map(bp => bp === 'xl' || bp === '2xl')
  );
}
