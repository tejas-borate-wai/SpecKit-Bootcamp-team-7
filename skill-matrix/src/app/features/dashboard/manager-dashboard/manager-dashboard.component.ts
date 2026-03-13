import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Store } from '@ngrx/store';
import { map, Observable } from 'rxjs';
import { selectCurrentUser } from '../../../core/store/session/session.selectors';
import {
  selectAllEmployeeSkills, selectSkillDefinitions,
} from '../../../core/store/skills/skills.selectors';
import * as SkillsActions from '../../../core/store/skills/skills.actions';
import { StatCardComponent } from '../../../shared/components/stat-card/stat-card.component';
import { RatingBadgeComponent } from '../../../shared/components/rating-badge/rating-badge.component';
import { isStale } from '../../../shared/utils/skill-utils';
import { EmployeeSkillRecord } from '../../../shared/models/employee-skill.model';

@Component({
  selector: 'app-manager-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, StatCardComponent, RatingBadgeComponent],
  templateUrl: './manager-dashboard.component.html',
  styleUrls: ['./manager-dashboard.component.scss'],
})
export class ManagerDashboardComponent implements OnInit {
  private readonly store = inject(Store);

  user$ = this.store.select(selectCurrentUser);
  allEmployeeSkills$ = this.store.select(selectAllEmployeeSkills);
  definitions$ = this.store.select(selectSkillDefinitions);

  pendingCount$: Observable<number> = this.allEmployeeSkills$.pipe(
    map(records => records.reduce(
      (total, r) => total + r.skills.filter(s => !s.isDeleted && s.status === 'Pending').length, 0
    ))
  );

  staleCount$: Observable<number> = this.allEmployeeSkills$.pipe(
    map(records => records.reduce(
      (total, r) => total + r.skills.filter(s => !s.isDeleted && isStale(s.lastUpdated)).length, 0
    ))
  );

  totalEmployees$: Observable<number> = this.allEmployeeSkills$.pipe(
    map(records => records.length)
  );

  incompleteProfiles$: Observable<EmployeeSkillRecord[]> = this.allEmployeeSkills$.pipe(
    map(records => records.filter(r => r.skills.filter(s => !s.isDeleted).length < 3))
  );

  teamSkillCount$: Observable<number> = this.allEmployeeSkills$.pipe(
    map(records => records.reduce(
      (total, r) => total + r.skills.filter(s => !s.isDeleted).length, 0
    ))
  );

  ngOnInit(): void {
    this.store.dispatch(SkillsActions.loadAllEmployeeSkills());
    this.store.dispatch(SkillsActions.loadSkillLibrary());
  }
}
