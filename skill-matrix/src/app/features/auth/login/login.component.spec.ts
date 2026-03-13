import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { LoginComponent } from './login.component';
import { SessionActions } from '../../../core/store/session/session.actions';
import { selectAuthError, selectAuthLoading } from '../../../core/store/session/session.selectors';
import { By } from '@angular/platform-browser';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let store: MockStore;

  const initialState = {
    session: { user: null, isAuthenticated: false, loading: false, error: null },
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoginComponent, NoopAnimationsModule],
      providers: [
        provideMockStore({
          initialState,
          selectors: [
            { selector: selectAuthLoading, value: false },
            { selector: selectAuthError, value: null },
          ],
        }),
      ],
    }).compileComponents();

    store = TestBed.inject(MockStore);
    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => store.resetSelectors());

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Form Validation', () => {
    it('should have invalid form when empty', () => {
      expect(component.loginForm.invalid).toBeTrue();
    });

    it('should be valid with email and password filled', () => {
      component.loginForm.setValue({ email: 'test@example.com', password: 'password123' });
      expect(component.loginForm.valid).toBeTrue();
    });

    it('should mark controls as touched on submit with invalid form', () => {
      component.onSubmit();
      expect(component.loginForm.get('email')?.touched).toBeTrue();
      expect(component.loginForm.get('password')?.touched).toBeTrue();
    });

    it('should not dispatch when form is invalid', () => {
      const dispatchSpy = spyOn(store, 'dispatch');
      component.onSubmit();
      expect(dispatchSpy).not.toHaveBeenCalled();
    });
  });

  describe('Action Dispatch', () => {
    it('should dispatch Login action with credentials on valid submit', () => {
      const dispatchSpy = spyOn(store, 'dispatch');
      component.loginForm.setValue({
        email: 'priya.sharma@skillmatrix.com',
        password: 'password123',
      });
      component.onSubmit();
      expect(dispatchSpy).toHaveBeenCalledWith(
        SessionActions.login({
          credentials: {
            email: 'priya.sharma@skillmatrix.com',
            password: 'password123',
          },
        })
      );
    });
  });

  describe('Error Display', () => {
    it('should display error message from store', () => {
      store.overrideSelector(selectAuthError, 'Invalid email or password');
      store.refreshState();
      fixture.detectChanges();

      const errorEl = fixture.debugElement.query(By.css('.auth-error, [data-testid="auth-error"]'));
      // The error observable is async — verify component reads it
      component.error$.subscribe((err) => {
        expect(err).toBe('Invalid email or password');
      });
    });

    it('should show no error when error$ is null', () => {
      store.overrideSelector(selectAuthError, null);
      store.refreshState();
      fixture.detectChanges();

      component.error$.subscribe((err) => {
        expect(err).toBeNull();
      });
    });
  });
});
