import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatRadioModule } from '@angular/material/radio';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Subject, takeUntil } from 'rxjs';
import { selectSkillById, selectSkillsLoading } from '../../../core/store/skills/skills.selectors';
import { selectCurrentUser } from '../../../core/store/session/session.selectors';
import * as SkillsActions from '../../../core/store/skills/skills.actions';

@Component({
  selector: 'app-edit-skill',
  standalone: true,
  imports: [
    CommonModule, RouterModule, ReactiveFormsModule,
    MatFormFieldModule, MatRadioModule, MatButtonModule, MatIconModule,
  ],
  templateUrl: './edit-skill.component.html',
  styleUrls: ['./edit-skill.component.scss'],
})
export class EditSkillComponent implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly store = inject(Store);
  private readonly fb = inject(FormBuilder);
  private readonly destroy$ = new Subject<void>();

  skillId = '';
  userId = '';
  loading$ = this.store.select(selectSkillsLoading);

  form = this.fb.group({
    selfRating: [null as number | null, Validators.required],
  });

  ngOnInit(): void {
    this.skillId = this.route.snapshot.paramMap.get('skillId') ?? '';

    this.store.select(selectCurrentUser)
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        if (user) {
          this.userId = user.id;
          this.store.dispatch(SkillsActions.loadMySkills({ userId: user.id }));
        }
      });

    this.store.select(selectSkillById(this.skillId))
      .pipe(takeUntil(this.destroy$))
      .subscribe(skill => {
        if (skill) {
          this.form.patchValue({ selfRating: skill.selfRating });
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onSave(): void {
    if (this.form.invalid) return;
    const selfRating = this.form.value.selfRating as number;
    this.store.dispatch(
      SkillsActions.updateSkillRating({ userId: this.userId, skillId: this.skillId, selfRating })
    );
    // Navigate back after a short delay for the effect to process
    setTimeout(() => {
      this.router.navigate(['/my-skills', this.skillId]);
    }, 400);
  }

  onCancel(): void {
    this.router.navigate(['/my-skills', this.skillId]);
  }
}
