import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { EmployeeSkillProfile } from '../../../shared/models/team-member.model';
import { selectSelectedEmployee, selectTeamLoading, selectTeamError } from '../../../core/store/team/team.selectors';
import * as TeamActions from '../../../core/store/team/team.actions';
import { AvatarComponent } from '../../../shared/components/avatar/avatar.component';
import { ConfidenceIndicatorComponent, AnyConfidenceLevel } from '../../../shared/components/confidence-indicator/confidence-indicator.component';

@Component({
  selector: 'app-employee-profile',
  standalone: true,
  imports: [CommonModule, RouterLink, AvatarComponent, ConfidenceIndicatorComponent],
  templateUrl: './employee-profile.component.html',
  styleUrls: ['./employee-profile.component.scss'],
})
export class EmployeeProfileComponent implements OnInit {
  private store = inject(Store);
  private route = inject(ActivatedRoute);

  profile$: Observable<EmployeeSkillProfile | null> = this.store.select(selectSelectedEmployee);
  loading$: Observable<boolean> = this.store.select(selectTeamLoading);
  error$: Observable<string | null> = this.store.select(selectTeamError);

  ngOnInit(): void {
    const userId = this.route.snapshot.paramMap.get('userId');
    if (userId) {
      this.store.dispatch(TeamActions.loadEmployeeProfile({ userId }));
    }
  }

  asConfidenceLevel(val: string | null): AnyConfidenceLevel {
    return (val ?? 'Low') as AnyConfidenceLevel;
  }
}
