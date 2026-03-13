import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Store } from '@ngrx/store';
import { map, Observable } from 'rxjs';
import { selectCurrentUser } from '../../../core/store/session/session.selectors';
import {
  selectAllEmployeeSkills, selectSkillDefinitions, selectSkillCategories,
} from '../../../core/store/skills/skills.selectors';
import * as SkillsActions from '../../../core/store/skills/skills.actions';
import { StatCardComponent } from '../../../shared/components/stat-card/stat-card.component';
import { isStale } from '../../../shared/utils/skill-utils';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, StatCardComponent],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss'],
})
export class AdminDashboardComponent implements OnInit {
  private readonly store = inject(Store);

  user$ = this.store.select(selectCurrentUser);
  allEmployeeSkills$ = this.store.select(selectAllEmployeeSkills);
  definitions$ = this.store.select(selectSkillDefinitions);
  categories$ = this.store.select(selectSkillCategories);

  totalUsers$: Observable<number> = this.allEmployeeSkills$.pipe(
    map(records => records.length)
  );

  totalSkillsTracked$: Observable<number> = this.allEmployeeSkills$.pipe(
    map(records => records.reduce(
      (total, r) => total + r.skills.filter(s => !s.isDeleted).length, 0
    ))
  );

  orgSkillHealthScore$: Observable<number> = this.allEmployeeSkills$.pipe(
    map(records => {
      let total = 0, count = 0;
      records.forEach(r =>
        r.skills.filter(s => !s.isDeleted && s.finalRating !== null).forEach(s => {
          total += s.finalRating!;
          count++;
        })
      );
      return count > 0 ? Math.round(total / count) : 0;
    })
  );

  staleCount$: Observable<number> = this.allEmployeeSkills$.pipe(
    map(records => records.reduce(
      (total, r) => total + r.skills.filter(s => !s.isDeleted && isStale(s.lastUpdated)).length, 0
    ))
  );

  pendingCount$: Observable<number> = this.allEmployeeSkills$.pipe(
    map(records => records.reduce(
      (total, r) => total + r.skills.filter(s => !s.isDeleted && s.status === 'Pending').length, 0
    ))
  );

  totalCategories$: Observable<number> = this.categories$.pipe(
    map(cats => cats.length)
  );

  ngOnInit(): void {
    this.store.dispatch(SkillsActions.loadAllEmployeeSkills());
    this.store.dispatch(SkillsActions.loadSkillLibrary());
  }
}
