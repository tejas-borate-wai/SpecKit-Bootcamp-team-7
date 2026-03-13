import { TestBed, ComponentFixture } from '@angular/core/testing';
import { PeerValidationFormComponent } from './peer-validation-form.component';
import { Store } from '@ngrx/store';
import { Actions } from '@ngrx/effects';
import { ActivatedRoute } from '@angular/router';
import { of, EMPTY } from 'rxjs';
import { ReactiveFormsModule } from '@angular/forms';
import * as TeamActions from '../../../core/store/team/team.actions';
import { EligiblePeer } from '../../../shared/models/peer-validation.model';

const mockPeers: EligiblePeer[] = [
  { userId: 'u002', name: 'Bob', department: 'Frontend', avatarUrl: '', skillLevel: 'Advanced' },
  { userId: 'u003', name: 'Carol', department: 'Frontend', avatarUrl: '', skillLevel: 'Intermediate' },
  { userId: 'u004', name: 'Dave', department: 'Frontend', avatarUrl: '', skillLevel: 'Expert' },
];

describe('PeerValidationFormComponent', () => {
  let component: PeerValidationFormComponent;
  let fixture: ComponentFixture<PeerValidationFormComponent>;
  let storeSpy: jasmine.SpyObj<Store>;
  let dispatchSpy: jasmine.Spy;

  function setupForInitiation(skillId = 'skill-001'): void {
    storeSpy.select.and.returnValue(of(mockPeers));
    TestBed.configureTestingModule({
      imports: [PeerValidationFormComponent, ReactiveFormsModule],
      providers: [
        { provide: Store, useValue: storeSpy },
        { provide: Actions, useValue: EMPTY },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: { get: (key: string) => (key === 'skillId' ? skillId : null) },
              url: [{ path: 'peer-validation' }],
            },
          },
        },
      ],
    });
    fixture = TestBed.createComponent(PeerValidationFormComponent);
    component = fixture.componentInstance;
  }

  beforeEach(() => {
    storeSpy = jasmine.createSpyObj('Store', ['select', 'dispatch']);
    dispatchSpy = storeSpy.dispatch;
  });

  afterEach(() => TestBed.resetTestingModule());

  describe('Initiation mode', () => {
    beforeEach(() => setupForInitiation());

    it('should set mode to initiate and dispatch loadEligiblePeers', () => {
      fixture.detectChanges();
      expect(component.mode).toBe('initiate');
      expect(dispatchSpy).toHaveBeenCalledWith(TeamActions.loadEligiblePeers({ skillId: 'skill-001' }));
    });

    it('should have form invalid when fewer than 2 peers are selected', () => {
      fixture.detectChanges();
      // Select only 1 peer
      component.peerSelections.at(0).setValue(true);
      component.submitted = true;
      expect(component.initiateForm.invalid).toBeTrue();
      expect(component.initiateForm.get('peerSelections')?.errors?.['minPeers']).toBeTrue();
    });

    it('should allow submitting with exactly 2 peers selected', () => {
      fixture.detectChanges();
      component.peerSelections.at(0).setValue(true);
      component.peerSelections.at(1).setValue(true);
      expect(component.initiateForm.valid).toBeTrue();
    });

    it('should have form invalid when more than 3 peers are selected', () => {
      // Manually add a 4th peer control to the form array
      component['peers'] = [
        ...mockPeers,
        { userId: 'u005', name: 'Eve', department: 'Frontend', avatarUrl: '', skillLevel: 'Beginner' },
      ];
      while (component.peerSelections.length) component.peerSelections.removeAt(0);
      component['peers'].forEach(() => component.peerSelections.push(
        (component as unknown as { fb: { control: (v: boolean) => unknown } }).fb.control(false) as never
      ));
      component.peerSelections.at(0).setValue(true);
      component.peerSelections.at(1).setValue(true);
      component.peerSelections.at(2).setValue(true);
      component.peerSelections.at(3).setValue(true);
      component.initiateForm.get('peerSelections')!.updateValueAndValidity();
      expect(component.initiateForm.invalid).toBeTrue();
      expect(component.initiateForm.get('peerSelections')?.errors?.['maxPeers']).toBeTrue();
    });

    it('should dispatch createPeerValidationRequest with selected peer IDs', () => {
      fixture.detectChanges();
      component.peerSelections.at(0).setValue(true);
      component.peerSelections.at(1).setValue(true);
      component.submitInitiation();
      expect(dispatchSpy).toHaveBeenCalledWith(
        TeamActions.createPeerValidationRequest({
          skillId: 'skill-001',
          selectedPeerIds: ['u002', 'u003'],
        })
      );
    });
  });

  describe('Response mode', () => {
    beforeEach(() => {
      storeSpy.select.and.returnValue(of([]));
      TestBed.configureTestingModule({
        imports: [PeerValidationFormComponent, ReactiveFormsModule],
        providers: [
          { provide: Store, useValue: storeSpy },
          { provide: Actions, useValue: EMPTY },
          {
            provide: ActivatedRoute,
            useValue: {
              snapshot: {
                paramMap: { get: (key: string) => (key === 'requestId' ? 'pv-001' : null) },
                url: [{ path: 'peer-validation' }, { path: 'pv-001' }],
              },
            },
          },
        ],
      });
      fixture = TestBed.createComponent(PeerValidationFormComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });

    it('should set mode to respond', () => {
      expect(component.mode).toBe('respond');
    });

    it('should have form invalid when rating is not set', () => {
      component.submitted = true;
      expect(component.respondForm.invalid).toBeTrue();
    });

    it('should dispatch respondToPeerValidation with correct rating and comment', () => {
      component.respondForm.setValue({ rating: 3, comment: 'Great Angular skills.' });
      component.submitResponse();
      expect(dispatchSpy).toHaveBeenCalledWith(
        TeamActions.respondToPeerValidation({
          requestId: 'pv-001',
          rating: 3,
          comment: 'Great Angular skills.',
        })
      );
    });

    it('should NOT dispatch if rating is missing', () => {
      component.respondForm.setValue({ rating: null, comment: null });
      component.submitResponse();
      expect(dispatchSpy).not.toHaveBeenCalledWith(
        jasmine.objectContaining({ type: '[Team] Respond To Peer Validation' })
      );
    });
  });
});
