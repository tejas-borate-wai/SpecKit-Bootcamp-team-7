import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { take } from 'rxjs';
import { selectCurrentUser } from '../../core/store/session/session.selectors';
import * as SkillsActions from '../../core/store/skills/skills.actions';
import { EmployeeDashboardComponent } from './employee-dashboard/employee-dashboard.component';
import { ManagerDashboardComponent } from './manager-dashboard/manager-dashboard.component';
import { AdminDashboardComponent } from './admin-dashboard/admin-dashboard.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, EmployeeDashboardComponent, ManagerDashboardComponent, AdminDashboardComponent],
  template: `
    @if (user$ | async; as user) {
      @switch (user.role) {
        @case ('Employee') { <app-employee-dashboard/> }
        @case ('Manager') { <app-manager-dashboard/> }
        @case ('Admin') { <app-admin-dashboard/> }
        @default {
          <div style="padding:24px">
            <p>Welcome, {{ user.name }}. Your dashboard is being set up.</p>
          </div>
        }
      }
    }
  `,
})
export class DashboardComponent implements OnInit {
  private readonly store = inject(Store);
  user$ = this.store.select(selectCurrentUser);

  ngOnInit(): void {
    this.user$.pipe(take(1)).subscribe(user => {
      if (user) {
        this.store.dispatch(SkillsActions.loadMySkills({ userId: user.id }));
      }
    });
    this.store.dispatch(SkillsActions.loadSkillLibrary());
    this.store.dispatch(SkillsActions.loadAllEmployeeSkills());
  }
}
