import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { TeamMember } from '../../../shared/models/team-member.model';
import { selectTeamMembers, selectTeamLoading, selectTeamError } from '../../../core/store/team/team.selectors';
import * as TeamActions from '../../../core/store/team/team.actions';
import { AvatarComponent } from '../../../shared/components/avatar/avatar.component';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';

@Component({
  selector: 'app-team-skills-overview',
  standalone: true,
  imports: [CommonModule, RouterLink, AvatarComponent, StatusBadgeComponent],
  templateUrl: './team-skills-overview.component.html',
  styleUrls: ['./team-skills-overview.component.scss'],
})
export class TeamSkillsOverviewComponent implements OnInit {
  private store = inject(Store);

  employees$: Observable<TeamMember[]> = this.store.select(selectTeamMembers);
  loading$: Observable<boolean> = this.store.select(selectTeamLoading);
  error$: Observable<string | null> = this.store.select(selectTeamError);

  sortColumn: keyof TeamMember | '' = '';
  sortDirection: 'asc' | 'desc' = 'asc';
  sortedEmployees: TeamMember[] = [];

  ngOnInit(): void {
    this.store.dispatch(TeamActions.loadTeamMembers());
    this.employees$.subscribe((employees) => {
      this.sortedEmployees = [...employees];
      if (this.sortColumn) this.applySort();
    });
  }

  sort(column: keyof TeamMember): void {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }
    this.applySort();
  }

  private applySort(): void {
    const col = this.sortColumn;
    if (!col) return;
    this.sortedEmployees = [...this.sortedEmployees].sort((a, b) => {
      const av = a[col as keyof TeamMember];
      const bv = b[col as keyof TeamMember];
      const cmp = typeof av === 'string' ? (av as string).localeCompare(bv as string) : (av as number) - (bv as number);
      return this.sortDirection === 'asc' ? cmp : -cmp;
    });
  }

  formatRating(rating: number): string {
    return rating.toFixed(1);
  }
}
