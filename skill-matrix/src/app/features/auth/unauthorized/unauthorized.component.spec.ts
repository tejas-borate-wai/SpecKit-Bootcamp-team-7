import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { By } from '@angular/platform-browser';
import { UnauthorizedComponent } from './unauthorized.component';

describe('UnauthorizedComponent', () => {
  let component: UnauthorizedComponent;
  let fixture: ComponentFixture<UnauthorizedComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UnauthorizedComponent, RouterTestingModule, NoopAnimationsModule],
    }).compileComponents();

    fixture = TestBed.createComponent(UnauthorizedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display "Access Denied" heading', () => {
    const h1 = fixture.nativeElement.querySelector('h1');
    expect(h1.textContent).toContain('Access Denied');
  });

  it('should display permission message', () => {
    const text = fixture.nativeElement.textContent;
    expect(text).toContain('You do not have permission to view this page.');
  });

  it('should have a "Go to Dashboard" link pointing to /dashboard', () => {
    const link = fixture.debugElement.query(By.css('a[routerLink]'));
    expect(link).toBeTruthy();
    expect(link.nativeElement.textContent.trim()).toContain('Go to Dashboard');
    expect(link.attributes['routerLink']).toBe('/dashboard');
  });
});
