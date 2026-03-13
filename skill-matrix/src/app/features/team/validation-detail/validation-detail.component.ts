import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { SubmissionDetail } from '../../../shared/models/skill-submission.model';
import { selectSelectedSubmission, selectTeamLoading, selectTeamError } from '../../../core/store/team/team.selectors';
import * as TeamActions from '../../../core/store/team/team.actions';
import { selectCurrentUser } from '../../../core/store/session/session.selectors';
import { AvatarComponent } from '../../../shared/components/avatar/avatar.component';
import { ConfidenceIndicatorComponent } from '../../../shared/components/confidence-indicator/confidence-indicator.component';
import { Actions, ofType } from '@ngrx/effects';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-validation-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule, AvatarComponent, ConfidenceIndicatorComponent],
  templateUrl: './validation-detail.component.html',
  styleUrls: ['./validation-detail.component.scss'],
})
export class ValidationDetailComponent implements OnInit {
  private store = inject(Store);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private actions$ = inject(Actions);

  submission$: Observable<SubmissionDetail | null> = this.store.select(selectSelectedSubmission);
  loading$: Observable<boolean> = this.store.select(selectTeamLoading);
  error$: Observable<string | null> = this.store.select(selectTeamError);
  session$ = this.store.select(selectCurrentUser);

  activeAction: 'approve' | 'reject' | 'override' | null = null;

  approveForm = this.fb.group({
    managerRating: [null as number | null, [Validators.required, Validators.min(1), Validators.max(4)]],
    comment: [null as string | null],
  });

  rejectForm = this.fb.group({
    rejectionReason: ['', [Validators.required, Validators.minLength(1)]],
  });

  overrideForm = this.fb.group({
    overriddenRating: [null as number | null, [Validators.required, Validators.min(1), Validators.max(4)]],
    justification: ['', [Validators.required, Validators.minLength(1)]],
  });

  ngOnInit(): void {
    const submissionId = this.route.snapshot.paramMap.get('submissionId');
    if (submissionId) {
      this.store.dispatch(TeamActions.loadSubmissionDetail({ submissionId }));
    }
  }

  showApproveForm(): void { this.activeAction = 'approve'; }
  showRejectForm(): void { this.activeAction = 'reject'; }
  showOverrideForm(): void { this.activeAction = 'override'; }
  cancelAction(): void { this.activeAction = null; }

  submitApproval(): void {
    if (!this.approveForm.valid) return;
    const submissionId = this.route.snapshot.paramMap.get('submissionId')!;
    const { managerRating, comment } = this.approveForm.value;
    this.store.dispatch(TeamActions.approveSubmission({
      submissionId,
      managerRating: managerRating!,
      comment: comment ?? null,
    }));
    this.actions$.pipe(ofType(TeamActions.approveSubmissionSuccess), take(1)).subscribe(() => {
      this.router.navigate(['/team/validation']);
    });
  }

  submitRejection(): void {
    if (!this.rejectForm.valid) return;
    const submissionId = this.route.snapshot.paramMap.get('submissionId')!;
    const { rejectionReason } = this.rejectForm.value;
    this.store.dispatch(TeamActions.rejectSubmission({
      submissionId,
      rejectionReason: rejectionReason!.trim(),
    }));
    this.actions$.pipe(ofType(TeamActions.rejectSubmissionSuccess), take(1)).subscribe(() => {
      this.router.navigate(['/team/validation']);
    });
  }

  submitOverride(): void {
    if (!this.overrideForm.valid) return;
    const submissionId = this.route.snapshot.paramMap.get('submissionId')!;
    const { overriddenRating, justification } = this.overrideForm.value;
    this.store.dispatch(TeamActions.overrideRating({
      submissionId,
      overriddenRating: overriddenRating!,
      justification: justification!.trim(),
    }));
    this.actions$.pipe(ofType(TeamActions.overrideRatingSuccess), take(1)).subscribe(() => {
      this.store.dispatch(TeamActions.loadSubmissionDetail({ submissionId }));
      this.activeAction = null;
    });
  }

  ratingLabel(rating: number | null): string {
    if (rating === null) return 'Not rated';
    const labels: Record<number, string> = { 1: '1 – Beginner', 2: '2 – Intermediate', 3: '3 – Advanced', 4: '4 – Expert' };
    return labels[rating] ?? rating.toString();
  }

  peerStatusLabel(status: string): string {
    const map: Record<string, string> = {
      created: 'Created',
      notified: 'Notified',
      awaiting_responses: 'Awaiting Responses',
      completed: 'Completed',
      expired: 'Expired',
    };
    return map[status] ?? status;
  }
}
