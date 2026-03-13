import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { ValidationQueueItem } from '../../../shared/models/skill-submission.model';
import { selectValidationQueue, selectTeamLoading, selectTeamError } from '../../../core/store/team/team.selectors';
import * as TeamActions from '../../../core/store/team/team.actions';

type SortableKey = 'employeeName' | 'skillName' | 'submittedDate';

@Component({
  selector: 'app-validation-queue',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './validation-queue.component.html',
  styleUrls: ['./validation-queue.component.scss'],
})
export class ValidationQueueComponent implements OnInit {
  private store = inject(Store);

  queue$: Observable<ValidationQueueItem[]> = this.store.select(selectValidationQueue);
  loading$: Observable<boolean> = this.store.select(selectTeamLoading);
  error$: Observable<string | null> = this.store.select(selectTeamError);

  sortColumn: SortableKey = 'submittedDate';
  sortDirection: 'asc' | 'desc' = 'desc';
  sortedQueue: ValidationQueueItem[] = [];

  ngOnInit(): void {
    this.store.dispatch(TeamActions.loadValidationQueue());
    this.queue$.subscribe((queue) => {
      this.sortedQueue = [...queue];
      this.applySort();
    });
  }

  sort(column: SortableKey): void {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }
    this.applySort();
  }

  private applySort(): void {
    this.sortedQueue = [...this.sortedQueue].sort((a, b) => {
      const av = a[this.sortColumn];
      const bv = b[this.sortColumn];
      const cmp = typeof av === 'string' ? av.localeCompare(bv as string) : 0;
      return this.sortDirection === 'asc' ? cmp : -cmp;
    });
  }

  peerStatusLabel(status: string | null): string {
    if (!status) return 'Not requested';
    const map: Record<string, string> = {
      created: 'Created',
      notified: 'Notified',
      awaiting_responses: 'Awaiting Responses',
      completed: 'Completed',
      expired: 'Expired',
    };
    return map[status] ?? status;
  }

  peerStatusClass(status: string | null): string {
    if (!status) return 'status-none';
    return `status-${status.replace('_', '-')}`;
  }
}
