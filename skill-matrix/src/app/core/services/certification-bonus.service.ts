import { Injectable, inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';

import { selectHasValidCertForSkill } from '../store/certifications/certifications.selectors';
import { applyRatingBonus, getCertificationBonusWeight } from '../../shared/utils/certification.util';

@Injectable({ providedIn: 'root' })
export class CertificationBonusService {
  private store = inject(Store);

  /** Returns true when the employee has a Valid (non-expired, non-expiring-soon) cert for the skill. */
  hasValidCertForSkill(skillId: string): Observable<boolean> {
    return this.store.select(selectHasValidCertForSkill(skillId));
  }

  /**
   * Returns the adjusted test score after applying the +10 pp certification bonus.
   * Score is capped at 100.
   */
  getAdjustedScore(testScore: number, skillId: string): Observable<number> {
    return this.hasValidCertForSkill(skillId).pipe(
      map((hasCert) => applyRatingBonus(testScore, hasCert))
    );
  }

  /**
   * Returns the certification bonus weight (100 when valid, 0 when not).
   * Used in the system rating formula: TestScore×0.60 + CertBonus×0.20 + ProjectBonus×0.20.
   */
  getCertBonusWeight(skillId: string): Observable<number> {
    return this.hasValidCertForSkill(skillId).pipe(
      map((hasCert) => getCertificationBonusWeight(hasCert))
    );
  }
}
