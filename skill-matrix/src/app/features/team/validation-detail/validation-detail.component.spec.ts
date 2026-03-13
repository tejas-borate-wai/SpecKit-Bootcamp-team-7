import { TestBed, ComponentFixture } from '@angular/core/testing';
import { ValidationDetailComponent } from './validation-detail.component';
import { Store } from '@ngrx/store';
import { Actions } from '@ngrx/effects';
import { ActivatedRoute } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { of, EMPTY } from 'rxjs';
import * as TeamActions from '../../../core/store/team/team.actions';
import { SubmissionDetail } from '../../../shared/models/skill-submission.model';

const mockSubmission: SubmissionDetail = {
  submissionId: 'sub-001',
  userId: 'u001',
  employeeName: 'Alice',
  department: 'Frontend',
  avatarUrl: '',
  skillId: 'skill-001',
  skillName: 'Angular',
  selfRating: 3,
  managerRating: null,
  peerRating: 3.5,
  systemRating: 3.2,
  finalRating: null,
  level: null,
  confidence: null,
  status: 'Pending',
  submittedDate: '2026-01-20',
  certification: null,
  projectExperience: [],
  peerValidation: null,
};

const mockApprovedSubmission: SubmissionDetail = {
  ...mockSubmission,
  status: 'Approved',
  managerRating: 4,
  finalRating: 3.475,
  level: 'Advanced',
  confidence: 'High',
};

describe('ValidationDetailComponent', () => {
  let component: ValidationDetailComponent;
  let fixture: ComponentFixture<ValidationDetailComponent>;
  let storeSpy: jasmine.SpyObj<Store>;
  let dispatchSpy: jasmine.Spy;

  beforeEach(() => {
    storeSpy = jasmine.createSpyObj('Store', ['select', 'dispatch']);
    dispatchSpy = storeSpy.dispatch;

    storeSpy.select.and.callFake((selector: unknown) => {
      if (selector === jasmine.anything()) return of(mockSubmission);
      return of(null);
    });

    TestBed.configureTestingModule({
      imports: [ValidationDetailComponent, ReactiveFormsModule],
      providers: [
        { provide: Store, useValue: storeSpy },
        { provide: Actions, useValue: EMPTY },
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => 'sub-001' } } } },
      ],
    });

    fixture = TestBed.createComponent(ValidationDetailComponent);
    component = fixture.componentInstance;
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  describe('Approve workflow', () => {
    it('should dispatch approveSubmission with correct managerRating', () => {
      component.approveForm.setValue({ managerRating: 4, comment: 'Great work' });
      component.submitApproval();
      expect(dispatchSpy).toHaveBeenCalledWith(
        TeamActions.approveSubmission({ submissionId: 'sub-001', managerRating: 4, comment: 'Great work' })
      );
    });

    it('should NOT dispatch if form is invalid (no managerRating)', () => {
      component.approveForm.setValue({ managerRating: null, comment: null });
      component.submitApproval();
      expect(dispatchSpy).not.toHaveBeenCalledWith(jasmine.objectContaining({ type: '[Team] Approve Submission' }));
    });
  });

  describe('Reject workflow', () => {
    it('should dispatch rejectSubmission with trimmed reason', () => {
      component.rejectForm.setValue({ rejectionReason: '  Not enough evidence  ' });
      component.submitRejection();
      expect(dispatchSpy).toHaveBeenCalledWith(
        TeamActions.rejectSubmission({ submissionId: 'sub-001', rejectionReason: 'Not enough evidence' })
      );
    });

    it('should NOT dispatch if rejection reason is empty', () => {
      component.rejectForm.setValue({ rejectionReason: '' });
      component.submitRejection();
      expect(dispatchSpy).not.toHaveBeenCalledWith(jasmine.objectContaining({ type: '[Team] Reject Submission' }));
    });
  });

  describe('Admin Override workflow', () => {
    it('should dispatch overrideRating with correct data', () => {
      component.overrideForm.setValue({ overriddenRating: 3, justification: 'Downgrade due to performance review' });
      component.submitOverride();
      expect(dispatchSpy).toHaveBeenCalledWith(
        TeamActions.overrideRating({
          submissionId: 'sub-001',
          overriddenRating: 3,
          justification: 'Downgrade due to performance review',
        })
      );
    });

    it('should NOT dispatch if justification is missing', () => {
      component.overrideForm.setValue({ overriddenRating: 3, justification: '' });
      component.submitOverride();
      expect(dispatchSpy).not.toHaveBeenCalledWith(jasmine.objectContaining({ type: '[Team] Override Rating' }));
    });
  });

  describe('Action visibility', () => {
    it('should show approve form when showApproveForm is called', () => {
      component.showApproveForm();
      expect(component.activeAction).toBe('approve');
    });

    it('should hide action panel when cancelAction is called', () => {
      component.showApproveForm();
      component.cancelAction();
      expect(component.activeAction).toBeNull();
    });
  });
});
