import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Store } from '@ngrx/store';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { Subject, takeUntil, combineLatest, Observable } from 'rxjs';
import { selectMyActiveSkills, selectTestAttempts, selectSkillDefinitions } from '../../../core/store/skills/skills.selectors';
import * as SkillsActions from '../../../core/store/skills/skills.actions';
import { selectCurrentUser } from '../../../core/store/session/session.selectors';
import { EmployeeSkill } from '../../../shared/models/employee-skill.model';
import { SkillDefinition } from '../../../shared/models/skill-definition.model';
import { SkillTestAttempt } from '../../../shared/models/skill-test-attempt.model';
import { AchievementBadge } from '../../../shared/models/achievement.model';
import { ConfidenceLevel } from '../../../shared/models/dashboard.model';
import { RatingBadgeComponent } from '../../../shared/components/rating-badge/rating-badge.component';
import { ConfidenceIndicatorComponent } from '../../../shared/components/confidence-indicator/confidence-indicator.component';
import { ProgressChartComponent } from '../../../shared/components/progress-chart/progress-chart.component';
import { AchievementBadgeComponent } from '../../../shared/components/achievement-badge/achievement-badge.component';
import { CertifiedBadgeComponent } from '../../../shared/components/certified-badge/certified-badge.component';
import { AchievementService } from '../../../core/services/achievement.service';
import { computeConfidence, ratingToPercentage } from '../../../shared/utils/skill-utils';
import * as CertificationsActions from '../../../core/store/certifications/certifications.actions';
import { selectHasValidCertForSkill } from '../../../core/store/certifications/certifications.selectors';

@Component({
  selector: 'app-skill-detail',
  standalone: true,
  imports: [
    CommonModule, RouterModule, MatIconModule, MatButtonModule,
    RatingBadgeComponent, ConfidenceIndicatorComponent, ProgressChartComponent, AchievementBadgeComponent, CertifiedBadgeComponent,
  ],
  templateUrl: './skill-detail.component.html',
  styleUrls: ['./skill-detail.component.scss'],
})
export class SkillDetailComponent implements OnInit, OnDestroy {
  private store = inject(Store);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private achievementService = inject(AchievementService);
  private destroy$ = new Subject<void>();

  skill: EmployeeSkill | null = null;
  definition: SkillDefinition | null = null;
  attempts: SkillTestAttempt[] = [];
  achievements: AchievementBadge[] = [];
  confidence: ConfidenceLevel = 'low';
  userId = '';
  skillId = '';

  ngOnInit(): void {
    this.skillId = this.route.snapshot.paramMap.get('skillId') ?? '';

    this.store.dispatch(CertificationsActions.loadCertifications());

    combineLatest([
      this.store.select(selectCurrentUser),
      this.store.select(selectMyActiveSkills),
      this.store.select(selectTestAttempts),
      this.store.select(selectSkillDefinitions),
    ]).pipe(takeUntil(this.destroy$)).subscribe(([user, skills, attempts, defs]) => {
      if (user) {
        this.userId = user.id;
        if (skills.length === 0) {
          this.store.dispatch(SkillsActions.loadMySkills({ userId: user.id }));
        }
        if (attempts.length === 0) {
          this.store.dispatch(SkillsActions.loadTestAttempts({ userId: user.id }));
        }
        if (defs.length === 0) {
          this.store.dispatch(SkillsActions.loadSkillLibrary());
        }
      }

      this.skill = skills.find((s) => s.skillId === this.skillId) ?? null;
      this.definition = defs.find((d) => d.skillId === this.skillId) ?? null;
      this.attempts = attempts.filter((a) => a.skillId === this.skillId);

      if (this.skill) {
        this.confidence = computeConfidence(this.skill);
        this.achievements = this.achievementService.computeAchievements(this.skillId, attempts);
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  formatRating(val: number | null): string {
    return val !== null ? `${ratingToPercentage(val).toFixed(0)}%` : '—';
  }

  formatSystemRating(val: number | null): string {
    return val !== null ? `${val}%` : '—';
  }

  onEdit(): void {
    this.router.navigate(['/my-skills', this.skillId, 'edit']);
  }

  onBack(): void {
    this.router.navigate(['/my-skills']);
  }

  hasValidCert(skillId: string): Observable<boolean> {
    return this.store.select(selectHasValidCertForSkill(skillId));
  }
}
