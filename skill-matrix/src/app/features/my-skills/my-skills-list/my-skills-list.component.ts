import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { FormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { BreakpointObserver } from '@angular/cdk/layout';
import { Subject, takeUntil, filter, Observable } from 'rxjs';
import { selectMyActiveSkills, selectMyStaleSkills, selectSkillCategories, selectSkillDefinitions, selectSkillsError, selectSkillsLoading } from '../../../core/store/skills/skills.selectors';
import { SkeletonLoaderComponent } from '../../../shared/components/skeleton-loader/skeleton-loader.component';
import * as SkillsActions from '../../../core/store/skills/skills.actions';
import { selectCurrentUser } from '../../../core/store/session/session.selectors';
import { EmployeeSkill } from '../../../shared/models/employee-skill.model';
import { SkillDefinition } from '../../../shared/models/skill-definition.model';
import { SkillCategory } from '../../../shared/models/skill-category.model';
import { RatingBadgeComponent } from '../../../shared/components/rating-badge/rating-badge.component';
import { CertifiedBadgeComponent } from '../../../shared/components/certified-badge/certified-badge.component';
import { ConfirmDeleteDialogComponent } from '../confirm-delete-dialog/confirm-delete-dialog.component';
import { BREAKPOINTS } from '../../../core/breakpoints';
import { isStale } from '../../../shared/utils/skill-utils';
import { loadCertifications } from '../../../core/store/certifications/certifications.actions';
import { selectHasValidCertForSkill } from '../../../core/store/certifications/certifications.selectors';

@Component({
  selector: 'app-my-skills-list',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule, MatIconModule, MatButtonModule, MatMenuModule,
    MatDialogModule, MatTooltipModule, MatSnackBarModule, RatingBadgeComponent, CertifiedBadgeComponent,
    SkeletonLoaderComponent, FormsModule, MatSelectModule,
  ],
  templateUrl: './my-skills-list.component.html',
  styleUrls: ['./my-skills-list.component.scss'],
})
export class MySkillsListComponent implements OnInit, OnDestroy {
  private store = inject(Store);
  private router = inject(Router);
  private bp = inject(BreakpointObserver);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);
  private destroy$ = new Subject<void>();

  activeSkills$ = this.store.select(selectMyActiveSkills);
  staleSkills$ = this.store.select(selectMyStaleSkills);
  definitions$ = this.store.select(selectSkillDefinitions);
  categories$ = this.store.select(selectSkillCategories);
  user$ = this.store.select(selectCurrentUser);
  error$ = this.store.select(selectSkillsError);
  loading$ = this.store.select(selectSkillsLoading);

  isMobile = false;
  isTablet = false;
  staleCount = 0;
  filterStatus: '' | 'Active' | 'Stale' = '';
  filterCategory = '';

  get displayedColumns(): string[] {
    if (this.isMobile) return ['skill', 'level', 'status', 'actions'];
    if (this.isTablet) return ['skill', 'level', 'rating', 'status', 'actions'];
    return ['skill', 'category', 'level', 'rating', 'status', 'lastUpdated', 'actions'];
  }

  ngOnInit(): void {
    this.bp.observe([BREAKPOINTS.mobile, BREAKPOINTS.tablet])
      .pipe(takeUntil(this.destroy$))
      .subscribe((state) => {
        this.isMobile = state.breakpoints[BREAKPOINTS.mobile];
        this.isTablet = state.breakpoints[BREAKPOINTS.tablet] && !this.isMobile;
      });

    this.user$.pipe(takeUntil(this.destroy$)).subscribe((user) => {
      if (user) {
        this.store.dispatch(SkillsActions.loadMySkills({ userId: user.id }));
        this.store.dispatch(SkillsActions.loadSkillLibrary());
        this.store.dispatch(SkillsActions.loadTestAttempts({ userId: user.id }));
        this.store.dispatch(loadCertifications());
      }
    });

    this.staleSkills$.pipe(takeUntil(this.destroy$)).subscribe((stale) => {
      this.staleCount = stale.length;
    });

    this.error$.pipe(takeUntil(this.destroy$), filter(Boolean)).subscribe((err) => {
      this.snackBar.open(err, 'Dismiss', { duration: 5000, panelClass: 'error-snack' });
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  isStaleRow(skill: EmployeeSkill): boolean {
    return isStale(skill.lastUpdated);
  }

  getDefinition(skillId: string, definitions: SkillDefinition[]): SkillDefinition | undefined {
    return definitions.find((d) => d.skillId === skillId);
  }

  formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  onView(skillId: string): void {
    this.router.navigate(['/my-skills', skillId]);
  }

  onEdit(skillId: string): void {
    this.router.navigate(['/my-skills', skillId, 'edit']);
  }

  onDelete(userId: string, skill: EmployeeSkill): void {
    const ref = this.dialog.open(ConfirmDeleteDialogComponent, {
      width: '360px',
      data: { skillId: skill.skillId },
    });
    ref.afterClosed().pipe(filter(result => result === true)).subscribe(() => {
      this.store.dispatch(SkillsActions.deleteSkill({ userId, skillId: skill.skillId }));
    });
  }

  onAddSkill(): void {
    this.router.navigate(['/my-skills', 'add']);
  }

  hasValidCert(skillId: string): Observable<boolean> {
    return this.store.select(selectHasValidCertForSkill(skillId));
  }

  filterSkills(skills: EmployeeSkill[], defs: SkillDefinition[]): EmployeeSkill[] {
    return skills.filter((s) => {
      if (this.filterStatus === 'Stale' && !this.isStaleRow(s)) return false;
      if (this.filterStatus === 'Active' && this.isStaleRow(s)) return false;
      if (this.filterCategory) {
        const def = defs.find((d) => d.skillId === s.skillId);
        if (def?.categoryId !== this.filterCategory) return false;
      }
      return true;
    });
  }

  getCategoryName(categoryId: string | undefined, categories: SkillCategory[]): string {
    if (!categoryId) return '—';
    return categories.find((c) => c.categoryId === categoryId)?.categoryName ?? categoryId;
  }

  getCategories(defs: SkillDefinition[], categories: SkillCategory[]): { id: string; name: string }[] {
    const ids = [...new Set(defs.map((d) => d.categoryId))];
    return ids.map((id) => ({
      id,
      name: categories.find((c) => c.categoryId === id)?.categoryName ?? id,
    })).sort((a, b) => a.name.localeCompare(b.name));
  }
}
