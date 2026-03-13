import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Store } from '@ngrx/store';
import { combineLatest, map, Observable, Subject, takeUntil } from 'rxjs';
import { MatIconModule } from '@angular/material/icon';
import { selectCurrentUser } from '../../../core/store/session/session.selectors';
import {
  selectMyActiveSkills, selectMyStaleSkills, selectProfileCompletion,
  selectTestAttempts, selectSkillDefinitions, selectDashboardWidgets,
} from '../../../core/store/skills/skills.selectors';
import * as SkillsActions from '../../../core/store/skills/skills.actions';
import { StatCardComponent } from '../../../shared/components/stat-card/stat-card.component';
import { SkillCardComponent } from '../../../shared/components/skill-card/skill-card.component';
import { AchievementBadgeComponent } from '../../../shared/components/achievement-badge/achievement-badge.component';
import { RatingBadgeComponent } from '../../../shared/components/rating-badge/rating-badge.component';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { AchievementService } from '../../../core/services/achievement.service';
import { AchievementBadge } from '../../../shared/models/achievement.model';
import { EmployeeSkill } from '../../../shared/models/employee-skill.model';
import { SkillTestAttempt } from '../../../shared/models/skill-test-attempt.model';
import { loadCertifications } from '../../../core/store/certifications/certifications.actions';
import { selectExpiringSoonCertifications } from '../../../core/store/certifications/certifications.selectors';
import { CertificationWithStatus } from '../../../shared/models/certification.model';

@Component({
  selector: 'app-employee-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule, StatCardComponent, SkillCardComponent, AchievementBadgeComponent, RatingBadgeComponent, StatusBadgeComponent],
  templateUrl: './employee-dashboard.component.html',
  styleUrls: ['./employee-dashboard.component.scss'],
})
export class EmployeeDashboardComponent implements OnInit {
  private readonly store = inject(Store);
  private readonly achievementService = inject(AchievementService);

  user$ = this.store.select(selectCurrentUser);
  activeSkills$ = this.store.select(selectMyActiveSkills);
  staleSkills$ = this.store.select(selectMyStaleSkills);
  profileCompletion$ = this.store.select(selectProfileCompletion);
  widgets$ = this.store.select(selectDashboardWidgets);
  testAttempts$ = this.store.select(selectTestAttempts);
  definitions$ = this.store.select(selectSkillDefinitions);

  allBadges$: Observable<AchievementBadge[]> = combineLatest([
    this.activeSkills$, this.testAttempts$
  ]).pipe(
    map(([skills, attempts]) =>
      this.achievementService.computeAllAchievements(skills.map(s => s.skillId), attempts)
    )
  );

  recentSkills$: Observable<EmployeeSkill[]> = this.activeSkills$.pipe(
    map(skills => [...skills].sort((a, b) => b.lastUpdated.localeCompare(a.lastUpdated)).slice(0, 5))
  );

  expiringSoonCerts$ = this.store.select(selectExpiringSoonCertifications);

  ngOnInit(): void {
    this.store.select(selectCurrentUser)
      .pipe(takeUntil(new Subject<void>()))
      .subscribe(user => {
        if (user) {
          this.store.dispatch(SkillsActions.loadMySkills({ userId: user.id }));
          this.store.dispatch(SkillsActions.loadTestAttempts({ userId: user.id }));
          this.store.dispatch(loadCertifications());
        }
      });
    this.store.dispatch(SkillsActions.loadSkillLibrary());
  }
}
