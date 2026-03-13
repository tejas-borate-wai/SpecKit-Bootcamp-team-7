import { TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { Observable, of, throwError } from 'rxjs';
import { Action } from '@ngrx/store';
import { HttpErrorResponse } from '@angular/common/http';
import * as TeamActions from './team.actions';
import * as effects from './team.effects';
import { TeamService } from '../../services/team.service';

const mockTeamService = {
  approveSubmission: jasmine.createSpy('approveSubmission'),
  rejectSubmission: jasmine.createSpy('rejectSubmission'),
  overrideRating: jasmine.createSpy('overrideRating'),
  getTeamMembers: jasmine.createSpy('getTeamMembers').and.returnValue(of([])),
  getEmployeeProfile: jasmine.createSpy('getEmployeeProfile'),
  getValidationQueue: jasmine.createSpy('getValidationQueue').and.returnValue(of([])),
  getSubmissionDetail: jasmine.createSpy('getSubmissionDetail'),
};

describe('Team Effects', () => {
  let actions$: Observable<Action>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideMockActions(() => actions$),
        { provide: TeamService, useValue: mockTeamService },
      ],
    });
  });

  describe('approveSubmission$ effect', () => {
    it('should dispatch approveSubmissionSuccess with rating data on success', (done) => {
      const approveResult = {
        submissionId: 'sub-001',
        status: 'Approved',
        managerRating: 4,
        finalRating: 3.475,
        level: 'Advanced',
        confidence: 'High',
        sourceCount: 4,
        effectiveWeights: {},
      };
      mockTeamService.approveSubmission.and.returnValue(of(approveResult));

      actions$ = of(TeamActions.approveSubmission({ submissionId: 'sub-001', managerRating: 4, comment: null }));

      effects.approveSubmission$({} as never).subscribe((action: Action) => {
        expect(action).toEqual(TeamActions.approveSubmissionSuccess({
          submissionId: 'sub-001',
          managerRating: 4,
          finalRating: 3.475,
          level: 'Advanced',
          confidence: 'High',
          sourceCount: 4,
          effectiveWeights: {},
        }));
        done();
      });
    });

    it('should dispatch approveSubmissionFailure on HTTP error', (done) => {
      mockTeamService.approveSubmission.and.returnValue(
        throwError(() => new HttpErrorResponse({ status: 403, error: { error: 'Forbidden' } }))
      );

      actions$ = of(TeamActions.approveSubmission({ submissionId: 'sub-001', managerRating: 4, comment: null }));

      effects.approveSubmission$({} as never).subscribe((action: Action) => {
        expect(action).toEqual(TeamActions.approveSubmissionFailure({ error: 'Forbidden' }));
        done();
      });
    });
  });
});
