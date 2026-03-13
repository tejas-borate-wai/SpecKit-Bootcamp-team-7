import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators, FormArray, AbstractControl, ValidationErrors } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Observable, Subscription } from 'rxjs';
import { EligiblePeer } from '../../../shared/models/peer-validation.model';
import { selectEligiblePeers, selectTeamLoading, selectTeamError } from '../../../core/store/team/team.selectors';
import * as TeamActions from '../../../core/store/team/team.actions';
import { Actions, ofType } from '@ngrx/effects';
import { take } from 'rxjs/operators';

/** Validates that between 2 and 3 peers are selected */
function peerCountValidator(ctrl: AbstractControl): ValidationErrors | null {
  const values: boolean[] = ctrl.value as boolean[];
  const count = values.filter(Boolean).length;
  if (count < 2) return { minPeers: true };
  if (count > 3) return { maxPeers: true };
  return null;
}

@Component({
  selector: 'app-peer-validation-form',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  templateUrl: './peer-validation-form.component.html',
  styleUrls: ['./peer-validation-form.component.scss'],
})
export class PeerValidationFormComponent implements OnInit, OnDestroy {
  private store = inject(Store);
  private route = inject(ActivatedRoute);
  private fb = inject(FormBuilder);
  private actions$ = inject(Actions);

  /** Identifies which mode we are in */
  mode: 'initiate' | 'respond' | null = null;

  /** For initiation mode */
  skillId: string | null = null;

  /** For response mode */
  requestId: string | null = null;

  eligiblePeers$: Observable<EligiblePeer[]> = this.store.select(selectEligiblePeers);
  loading$: Observable<boolean> = this.store.select(selectTeamLoading);
  error$: Observable<string | null> = this.store.select(selectTeamError);

  /** Initiation form — one checkbox control per eligible peer */
  initiateForm = this.fb.group({
    peerSelections: this.fb.array([] as boolean[], peerCountValidator),
  });

  /** Response form */
  respondForm = this.fb.group({
    rating: [null as number | null, [Validators.required, Validators.min(1), Validators.max(4)]],
    comment: [null as string | null],
  });

  submitted = false;
  successMessage: string | null = null;
  peers: EligiblePeer[] = [];
  private peersSub?: Subscription;

  get peerSelections(): FormArray {
    return this.initiateForm.get('peerSelections') as FormArray;
  }

  get selectedCount(): number {
    return (this.peerSelections.value as boolean[]).filter(Boolean).length;
  }

  ngOnInit(): void {
    const skillIdParam = this.route.snapshot.paramMap.get('skillId');
    const requestIdParam = this.route.snapshot.paramMap.get('requestId');

    if (skillIdParam && this.route.snapshot.url.some((s) => s.path === 'peer-validation')) {
      this.mode = 'initiate';
      this.skillId = skillIdParam;
      this.store.dispatch(TeamActions.loadEligiblePeers({ skillId: skillIdParam }));
      this.peersSub = this.eligiblePeers$.subscribe((peers) => this.rebuildPeerControls(peers));
    } else if (requestIdParam) {
      this.mode = 'respond';
      this.requestId = requestIdParam;
    }
  }

  /** Called after eligible peers are loaded to build the form array */
  private rebuildPeerControls(peers: EligiblePeer[]): void {
    this.peers = peers;
    const fa = this.peerSelections;
    while (fa.length) fa.removeAt(0);
    peers.forEach(() => fa.push(this.fb.control(false)));
  }

  ngOnDestroy(): void {
    this.peersSub?.unsubscribe();
  }

  submitInitiation(): void {
    this.submitted = true;
    if (this.initiateForm.invalid) return;
    const selectedPeerIds = this.peers
      .filter((_, i) => this.peerSelections.at(i).value as boolean)
      .map((p) => p.userId);
    this.store.dispatch(TeamActions.createPeerValidationRequest({
      skillId: this.skillId!,
      selectedPeerIds,
    }));
    this.actions$.pipe(ofType(TeamActions.createPeerValidationRequestSuccess), take(1)).subscribe(() => {
      this.successMessage = 'Peer validation request sent! Selected peers have been notified.';
    });
  }

  submitResponse(): void {
    this.submitted = true;
    if (this.respondForm.invalid) return;
    const { rating, comment } = this.respondForm.value;
    this.store.dispatch(TeamActions.respondToPeerValidation({
      requestId: this.requestId!,
      rating: rating!,
      comment: comment ?? null,
    }));
    this.actions$.pipe(ofType(TeamActions.respondToPeerValidationSuccess), take(1)).subscribe(() => {
      this.successMessage = 'Your validation rating has been submitted successfully!';
    });
  }
}
