import { TestBed, ComponentFixture } from '@angular/core/testing';
import { EmployeeProfileComponent } from './employee-profile.component';
import { Store } from '@ngrx/store';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';
import * as TeamActions from '../../../core/store/team/team.actions';
import { EmployeeSkillProfile } from '../../../shared/models/team-member.model';

const mockProfile: EmployeeSkillProfile = {
  userId: 'u001',
  name: 'Alice',
  email: 'alice@company.com',
  department: 'Frontend',
  avatarUrl: '',
  skills: [
    {
      skillId: 'skill-001',
      skillName: 'Angular',
      categoryName: 'Frontend',
      selfRating: 3,
      managerRating: 4,
      peerRating: 3.5,
      systemRating: 3.2,
      finalRating: 3.475,
      level: 'Advanced',
      status: 'Approved',
      lastUpdated: '2026-01-25',
      sourceCount: 4,
      confidence: 'High',
    },
    {
      skillId: 'skill-002',
      skillName: 'TypeScript',
      categoryName: 'Frontend',
      selfRating: 2,
      managerRating: 3,
      peerRating: null,
      systemRating: 2.5,
      finalRating: 2.55,
      level: 'Intermediate',
      status: 'Approved',
      lastUpdated: '2026-01-20',
      sourceCount: 2,
      confidence: 'Medium',
    },
    {
      skillId: 'skill-003',
      skillName: 'CSS',
      categoryName: 'Frontend',
      selfRating: 1,
      managerRating: null,
      peerRating: null,
      systemRating: null,
      finalRating: 1.0,
      level: 'Beginner',
      status: 'Pending',
      lastUpdated: '2026-01-15',
      sourceCount: 1,
      confidence: 'Low',
    },
  ],
};

describe('EmployeeProfileComponent', () => {
  let component: EmployeeProfileComponent;
  let fixture: ComponentFixture<EmployeeProfileComponent>;
  let storeSpy: jasmine.SpyObj<Store>;

  beforeEach(() => {
    storeSpy = jasmine.createSpyObj('Store', ['select', 'dispatch']);
    storeSpy.select.and.returnValue(of(mockProfile));

    TestBed.configureTestingModule({
      imports: [EmployeeProfileComponent, RouterTestingModule],
      providers: [
        { provide: Store, useValue: storeSpy },
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: { get: () => 'u001' } } },
        },
      ],
    });
    fixture = TestBed.createComponent(EmployeeProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should dispatch loadEmployeeProfile on init', () => {
    expect(storeSpy.dispatch).toHaveBeenCalledWith(TeamActions.loadEmployeeProfile({ userId: 'u001' }));
  });

  it('should render all skill rows in the table', () => {
    const rows = fixture.nativeElement.querySelectorAll('.skills-table tbody tr');
    expect(rows.length).toBe(3);
  });

  it('should show correct confidence level: sourceCount=4 → High', () => {
    const result = component.asConfidenceLevel('High');
    expect(result).toBe('High');
  });

  it('should show correct confidence level: sourceCount=2 → Medium', () => {
    const result = component.asConfidenceLevel('Medium');
    expect(result).toBe('Medium');
  });

  it('should show correct confidence level: sourceCount=1 → Low', () => {
    const result = component.asConfidenceLevel('Low');
    expect(result).toBe('Low');
  });

  it('asConfidenceLevel should fall back to Low for null', () => {
    const result = component.asConfidenceLevel(null);
    expect(result).toBe('Low');
  });

  it('should contain a back link to /team', () => {
    const backLink = fixture.nativeElement.querySelector('.back-link');
    expect(backLink).toBeTruthy();
  });
});
