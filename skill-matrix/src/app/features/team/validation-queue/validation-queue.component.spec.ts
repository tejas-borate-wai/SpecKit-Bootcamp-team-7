import { TestBed, ComponentFixture } from '@angular/core/testing';
import { ValidationQueueComponent } from './validation-queue.component';
import { Store } from '@ngrx/store';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';
import { ValidationQueueItem } from '../../../shared/models/skill-submission.model';
import * as TeamActions from '../../../core/store/team/team.actions';

const mockQueue: ValidationQueueItem[] = [
  {
    submissionId: 'sub-002',
    userId: 'u001',
    employeeName: 'Alice',
    department: 'Frontend',
    skillId: 'skill-007',
    skillName: 'Node.js',
    selfRating: 4,
    status: 'Pending',
    submittedDate: '2026-02-01',
    certificationId: null,
    hasCertification: false,
    hasProjectExperience: false,
    peerValidationStatus: 'awaiting_responses',
    peerRating: null,
  },
  {
    submissionId: 'sub-001',
    userId: 'u002',
    employeeName: 'Bob',
    department: 'Backend',
    skillId: 'skill-002',
    skillName: 'Angular',
    selfRating: 3,
    status: 'Pending',
    submittedDate: '2026-01-20',
    certificationId: 'cert-001',
    hasCertification: true,
    hasProjectExperience: true,
    peerValidationStatus: 'completed',
    peerRating: 3.5,
  },
];

describe('ValidationQueueComponent', () => {
  let component: ValidationQueueComponent;
  let fixture: ComponentFixture<ValidationQueueComponent>;
  let storeSpy: jasmine.SpyObj<Store>;

  beforeEach(() => {
    storeSpy = jasmine.createSpyObj('Store', ['select', 'dispatch']);
    storeSpy.select.and.returnValue(of(mockQueue));

    TestBed.configureTestingModule({
      imports: [ValidationQueueComponent, RouterTestingModule],
      providers: [{ provide: Store, useValue: storeSpy }],
    });
    fixture = TestBed.createComponent(ValidationQueueComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should dispatch loadValidationQueue on init', () => {
    expect(storeSpy.dispatch).toHaveBeenCalledWith(TeamActions.loadValidationQueue());
  });

  describe('Sort functionality', () => {
    it('should default to sorted by submittedDate descending', () => {
      expect(component.sortColumn).toBe('submittedDate');
      expect(component.sortDirection).toBe('desc');
    });

    it('should toggle sort direction when same column is clicked twice', () => {
      component.sort('employeeName');
      const firstDir = component.sortDirection;
      component.sort('employeeName');
      expect(component.sortDirection).toBe(firstDir === 'asc' ? 'desc' : 'asc');
    });

    it('should reset sort direction to asc when a different column is clicked', () => {
      component.sort('employeeName');
      component.sortDirection = 'desc';
      component.sort('skillName');
      expect(component.sortDirection).toBe('asc');
      expect(component.sortColumn).toBe('skillName');
    });
  });

  describe('Peer status label', () => {
    it('should return "Completed" for status "completed"', () => {
      expect(component.peerStatusLabel('completed')).toBe('Completed');
    });
    it('should return "Awaiting Responses" for status "awaiting_responses"', () => {
      expect(component.peerStatusLabel('awaiting_responses')).toBe('Awaiting Responses');
    });
    it('should return "Not requested" for null status', () => {
      expect(component.peerStatusLabel(null)).toBe('Not requested');
    });
  });
});
