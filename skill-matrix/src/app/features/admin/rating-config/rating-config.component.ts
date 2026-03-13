import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Store } from '@ngrx/store';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSliderModule } from '@angular/material/slider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { Subscription } from 'rxjs';
import { RatingWeightConfig } from '../../../shared/models/rating-weight.model';
import * as AdminActions from '../../../core/store/admin/admin.actions';
import {
  selectRatingWeights,
  selectRatingWeightsLoading,
} from '../../../core/store/admin/admin.selectors';

function sumToOne(control: AbstractControl): ValidationErrors | null {
  const g = control as FormGroup;
  const sum = (+(g.get('selfRating')?.value ?? 0))
    + (+(g.get('managerRating')?.value ?? 0))
    + (+(g.get('peerRating')?.value ?? 0))
    + (+(g.get('systemRating')?.value ?? 0));
  return Math.abs(sum - 1.0) <= 0.001 ? null : { sumNot100: true };
}

@Component({
  selector: 'app-rating-config',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSliderModule,
    MatProgressSpinnerModule,
    MatCardModule,
    MatIconModule,
  ],
  templateUrl: './rating-config.component.html',
  styleUrl: './rating-config.component.scss',
})
export class RatingConfigComponent implements OnInit, OnDestroy {
  private store = inject(Store);
  private fb = inject(FormBuilder);
  private sub?: Subscription;

  loading$ = this.store.select(selectRatingWeightsLoading);

  form!: FormGroup;
  currentSum = 1.0;
  saved = false;

  readonly fields: Array<{ key: keyof RatingWeightConfig; label: string }> = [
    { key: 'selfRating', label: 'Self Rating' },
    { key: 'managerRating', label: 'Manager Rating' },
    { key: 'peerRating', label: 'Peer Rating' },
    { key: 'systemRating', label: 'System Rating' },
  ];

  ngOnInit(): void {
    this.form = this.fb.group(
      {
        selfRating: [0.2, [Validators.required, Validators.min(0), Validators.max(1)]],
        managerRating: [0.3, [Validators.required, Validators.min(0), Validators.max(1)]],
        peerRating: [0.15, [Validators.required, Validators.min(0), Validators.max(1)]],
        systemRating: [0.35, [Validators.required, Validators.min(0), Validators.max(1)]],
      },
      { validators: sumToOne }
    );

    // Real-time sum
    this.sub = this.form.valueChanges.subscribe((v) => {
      this.currentSum = +(+(v.selfRating ?? 0) + +(v.managerRating ?? 0) + +(v.peerRating ?? 0) + +(v.systemRating ?? 0)).toFixed(4);
      this.saved = false;
    });

    // Load saved weights
    this.store.select(selectRatingWeights).subscribe((w) => {
      if (w) {
        this.form.patchValue(w, { emitEvent: false });
        this.currentSum = +(w.selfRating + w.managerRating + w.peerRating + w.systemRating).toFixed(4);
      }
    });

    this.store.dispatch(AdminActions.loadRatingWeights());
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  get sumValid(): boolean { return Math.abs(this.currentSum - 1.0) <= 0.001; }

  asPercent(val: unknown): number { return Math.round(+(val ?? 0) * 100); }

  save(): void {
    if (this.form.invalid) { return; }
    this.store.dispatch(AdminActions.updateRatingWeights({ weights: this.form.value }));
    this.saved = true;
  }
}
