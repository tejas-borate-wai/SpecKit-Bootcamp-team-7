import { Component, inject, Input, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-chart-wrapper',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './chart-wrapper.component.html',
  styleUrls: ['./chart-wrapper.component.scss'],
})
export class ChartWrapperComponent implements OnInit, OnDestroy {
  @Input() ariaLabel = 'Chart';

  private readonly breakpointObserver = inject(BreakpointObserver);
  private readonly destroy$ = new Subject<void>();

  breakpointClass: 'chart-desktop' | 'chart-tablet' | 'chart-mobile' = 'chart-desktop';
  legendVisible = true;

  ngOnInit(): void {
    this.breakpointObserver
      .observe([
        '(min-width: 1280px)',
        '(min-width: 768px) and (max-width: 1279px)',
        '(max-width: 767px)',
      ])
      .pipe(takeUntil(this.destroy$))
      .subscribe((result) => {
        if (result.breakpoints['(max-width: 767px)']) {
          this.breakpointClass = 'chart-mobile';
          this.legendVisible = false;
        } else if (result.breakpoints['(min-width: 768px) and (max-width: 1279px)']) {
          this.breakpointClass = 'chart-tablet';
          this.legendVisible = true;
        } else {
          this.breakpointClass = 'chart-desktop';
          this.legendVisible = true;
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  toggleLegend(): void {
    this.legendVisible = !this.legendVisible;
  }
}
