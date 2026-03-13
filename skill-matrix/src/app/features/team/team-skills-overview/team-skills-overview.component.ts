import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatSelectModule } from '@angular/material/select';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { TeamMember } from '../../../shared/models/team-member.model';
import { selectTeamMembers, selectTeamLoading, selectTeamError } from '../../../core/store/team/team.selectors';
import * as TeamActions from '../../../core/store/team/team.actions';
import { AvatarComponent } from '../../../shared/components/avatar/avatar.component';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { SkeletonLoaderComponent } from '../../../shared/components/skeleton-loader/skeleton-loader.component';

@Component({
  selector: 'app-team-skills-overview',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, MatSelectModule, AvatarComponent, StatusBadgeComponent, SkeletonLoaderComponent],
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
  filterDepartment = '';
  allEmployees: TeamMember[] = [];

  ngOnInit(): void {
    this.store.dispatch(TeamActions.loadTeamMembers());
    this.employees$.subscribe((employees) => {
      this.allEmployees = employees;
      this.applyFilter();
    });
  }

  get departments(): string[] {
    return [...new Set(this.allEmployees.map((e) => e.department))].sort();
  }

  applyFilter(): void {
    let filtered = this.allEmployees;
    if (this.filterDepartment) {
      filtered = filtered.filter((e) => e.department === this.filterDepartment);
    }
    this.sortedEmployees = [...filtered];
    if (this.sortColumn) this.applySort();
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
