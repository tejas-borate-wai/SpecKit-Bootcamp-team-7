import { Component, Input, inject, TrackByFunction } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { BreakpointService } from '../../../core/services/breakpoint.service';
import { BreakpointName } from '../../../core/constants/breakpoints';

export interface ColumnDefinition {
  readonly key: string;
  readonly header: string;
  readonly visibleAt?: BreakpointName[];
  readonly isPrimary?: boolean;
  readonly sortable?: boolean;
  readonly cellTemplate?: string;
}

@Component({
  selector: 'app-responsive-table',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './responsive-table.component.html',
  styleUrl: './responsive-table.component.scss',
})
export class ResponsiveTableComponent {
  @Input() data: Record<string, unknown>[] = [];
  @Input() columns: ColumnDefinition[] = [];
  @Input() trackByFn: TrackByFunction<Record<string, unknown>> = (i) => i;

  private bp = inject(BreakpointService);
  isMobile$ = this.bp.isMobile$;
  currentBreakpoint$ = this.bp.currentBreakpoint$;

  expandedIndex: number | null = null;

  get primaryColumn(): ColumnDefinition | undefined {
    return this.columns.find(c => c.isPrimary);
  }

  get secondaryColumns(): ColumnDefinition[] {
    return this.columns.filter(c => !c.isPrimary).slice(0, 3);
  }

  get detailColumns(): ColumnDefinition[] {
    return this.columns.filter(c => !c.isPrimary).slice(3);
  }

  getVisibleColumns(breakpoint: BreakpointName): ColumnDefinition[] {
    return this.columns.filter(c => !c.visibleAt || c.visibleAt.includes(breakpoint));
  }

  toggleExpand(index: number): void {
    this.expandedIndex = this.expandedIndex === index ? null : index;
  }

  getValue(row: Record<string, unknown>, key: string): unknown {
    return row[key];
  }
}
