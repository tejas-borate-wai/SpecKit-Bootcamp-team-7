# Research: Responsive Design, Animations & Error Handling — Angular 17

**Date**: 2026-03-13  
**Scope**: Angular 17 standalone components, mobile-first, 6-breakpoint system

---

## 1. Angular CDK BreakpointObserver — Centralized BreakpointService

### How BreakpointObserver Works

`BreakpointObserver` from `@angular/cdk/layout` provides two methods:
- **`isMatched(query)`** — synchronous check of current viewport against a media query
- **`observe(queries[])`** — returns an `Observable<BreakpointState>` that emits whenever any of the supplied media queries' match status changes. The emitted `BreakpointState` contains a `matches: boolean` and `breakpoints: { [query: string]: boolean }` map.

### Decision: Centralized BreakpointService

**Recommendation: YES — wrap in a `BreakpointService`.**

Rationale: Direct injection of `BreakpointObserver` scatters breakpoint string literals across components. A central service provides:
- Single source of truth for breakpoint definitions
- Typed API (`currentBreakpoint$` returning an enum/string name)
- Easier testing (mock one service vs. CDK internals)

### Custom Breakpoint Definitions

The CDK's built-in `Breakpoints` constants (XSmall, Small, Medium, Large, XLarge) use Material Design thresholds that **do not match** spec breakpoints. Define custom constants:

```typescript
// breakpoints.ts
export const APP_BREAKPOINTS = {
  xs: '(max-width: 479.98px)',          // 0–479px
  sm: '(min-width: 480px) and (max-width: 767.98px)',   // 480–767px
  md: '(min-width: 768px) and (max-width: 1023.98px)',  // 768–1023px
  lg: '(min-width: 1024px) and (max-width: 1279.98px)', // 1024–1279px
  xl: '(min-width: 1280px) and (max-width: 1439.98px)', // 1280–1439px
  '2xl': '(min-width: 1440px)',         // 1440px+
} as const;

export type BreakpointName = keyof typeof APP_BREAKPOINTS;
```

### Service API Design

**Decision: Expose BOTH a single `currentBreakpoint$` observable AND convenience boolean observables.**

- `currentBreakpoint$: Observable<BreakpointName>` — emits the active breakpoint name whenever viewport crosses a threshold. Best for structural layout decisions (e.g., switch sidebar mode, swap table-to-cards).
- `isMobile$: Observable<boolean>` — true when `xs` or `sm` (< 768px). Convenience for the most common conditional (bottom nav, FAB, drawer).
- `isTablet$: Observable<boolean>` — true when `md` or `lg` (768–1279px).
- `isDesktop$: Observable<boolean>` — true when `xl` or `2xl` (≥ 1280px).

```typescript
@Injectable({ providedIn: 'root' })
export class BreakpointService {
  private breakpointObserver = inject(BreakpointObserver);

  currentBreakpoint$: Observable<BreakpointName> = this.breakpointObserver
    .observe(Object.values(APP_BREAKPOINTS))
    .pipe(
      map(state => {
        for (const [name, query] of Object.entries(APP_BREAKPOINTS)) {
          if (state.breakpoints[query]) return name as BreakpointName;
        }
        return 'xs' as BreakpointName; // fallback
      }),
      distinctUntilChanged(),
      shareReplay(1)
    );

  isMobile$ = this.currentBreakpoint$.pipe(
    map(bp => bp === 'xs' || bp === 'sm')
  );
  isTablet$ = this.currentBreakpoint$.pipe(
    map(bp => bp === 'md' || bp === 'lg')
  );
  isDesktop$ = this.currentBreakpoint$.pipe(
    map(bp => bp === 'xl' || bp === '2xl')
  );
}
```

### Usage in Standalone Components

```typescript
@Component({
  standalone: true,
  imports: [AsyncPipe, NgIf],
  template: `
    <app-sidebar *ngIf="!(isMobile$ | async)" />
    <app-bottom-nav *ngIf="isMobile$ | async" />
  `
})
export class AppShellComponent {
  private bp = inject(BreakpointService);
  isMobile$ = this.bp.isMobile$;
}
```

### Key Takeaway
Do **not** use CDK's built-in `Breakpoints` enum — it doesn't match the spec's 6-breakpoint system. Define custom queries. The service pattern ensures DRY breakpoints and enables easy unit testing.

---

## 2. Angular Animations for Route Transitions

### Critical Version Note (Angular 17)

- **`trigger()`, `state()`, `transition()`, `animate()`** from `@angular/animations` — fully available and NOT deprecated in Angular 17 (deprecated only in v20.2+).
- **`animate.enter` / `animate.leave`** — Angular 20+ features, **NOT available in Angular 17**.
- **`withViewTransitions()`** — introduced in Angular 17 as **developer preview**. Uses native browser View Transitions API (`document.startViewTransition`).

### Decision: Dual Approach

**Primary: `withViewTransitions()` from Angular Router** (recommended for Angular 17).  
**Fallback: Legacy `@angular/animations` trigger** for non-route animations (progress bars, toasts, modals).

#### Approach A — View Transitions API (Route Navigation)

```typescript
// app.config.ts
import { provideRouter, withViewTransitions } from '@angular/router';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes, withViewTransitions()),
    provideAnimationsAsync(), // for non-route animations
  ]
};
```

Custom CSS transitions in **global styles** (not component styles — view encapsulation blocks pseudo-element targeting):

```css
/* Fade + slide for route transitions */
@keyframes slide-fade-in {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
}
@keyframes slide-fade-out {
  to {
    opacity: 0;
    transform: translateY(-8px);
  }
}

::view-transition-old(root) {
  animation: slide-fade-out 200ms ease-in;
}
::view-transition-new(root) {
  animation: slide-fade-in 200ms ease-out;
}
```

**Pros**: Native browser performance, no JS animation overhead, progressive enhancement (falls back to instant swap in unsupported browsers).  
**Cons**: Developer preview in Angular 17; limited browser support (Chrome 111+, Edge 111+, no Firefox at time of writing).

#### Approach B — Legacy `@angular/animations` Trigger (Fallback / Component Animations)

Still needed for: progress bar fill, toast slide-in/out, sidebar expand/collapse, modal slide-up/down, success animation.

```typescript
// route-animations.ts
import { trigger, transition, style, animate, query, group } from '@angular/animations';

export const routeAnimations = trigger('routeAnimations', [
  transition('* <=> *', [
    query(':enter, :leave', [
      style({ position: 'absolute', width: '100%' })
    ], { optional: true }),
    group([
      query(':leave', [
        animate('200ms ease-in', style({ opacity: 0, transform: 'translateY(-8px)' }))
      ], { optional: true }),
      query(':enter', [
        style({ opacity: 0, transform: 'translateY(8px)' }),
        animate('200ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ], { optional: true }),
    ])
  ])
]);
```

Used on the component hosting `<router-outlet>`:

```typescript
@Component({
  animations: [routeAnimations],
  template: `
    <div [@routeAnimations]="getRouteAnimationData()">
      <router-outlet />
    </div>
  `
})
export class AppComponent {
  getRouteAnimationData() {
    // return route data for animation state
  }
}
```

### Handling `prefers-reduced-motion`

**Option 1 (Recommended for View Transitions)**: CSS media query — zero JS needed:

```css
@media (prefers-reduced-motion: reduce) {
  ::view-transition-old(root),
  ::view-transition-new(root) {
    animation: none !important;
  }
}
```

**Option 2 (Legacy animations)**: Use `@.disabled` binding on the root component:

```typescript
@Component({
  template: `<div [@.disabled]="prefersReducedMotion">...</div>`
})
export class AppComponent {
  prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}
```

### Recommendation

Use `withViewTransitions()` for **route-level** transitions (spec FR-017). Use legacy `@angular/animations` for **component-level** animations (FR-018 through FR-022). Both approaches handle `prefers-reduced-motion` cleanly. If browser support is a concern, provide the legacy trigger as a fallback for route animations as well.

---

## 3. Mobile Bottom Navigation Bar Pattern

### Decision: Shared Standalone Component in the App Shell

**Placement**: Render `<app-bottom-nav>` inside the `AppShellComponent` template, **not** in individual feature components. It is an app-level navigation concern, same as the sidebar.

```html
<!-- app-shell.component.html -->
<app-sidebar *ngIf="!(isMobile$ | async)" />
<main>
  <router-outlet />
</main>
<app-bottom-nav *ngIf="isMobile$ | async" [role]="currentUserRole" />
```

### Conditional Rendering vs CSS Display

**Decision: Use structural directive (`*ngIf`) driven by `BreakpointService.isMobile$`**, not CSS `display: none`. Reason: The spec requires DOM-level absence at ≥768px (SC-007: "confirmed by DOM inspection, not CSS visibility"). This means `*ngIf` / `@if`, not `[hidden]` or `display:none`.

### Role-Aware Tabs

The bottom nav shows 5 tabs. The first 4 are role-specific; the 5th is always "More".

| Role | Tab 1 | Tab 2 | Tab 3 | Tab 4 | Tab 5 |
|------|-------|-------|-------|-------|-------|
| Employee | Dashboard | My Skills | Assessments | Notifications | More |
| Manager | Dashboard | Team Skills | Projects | Notifications | More |
| Admin | Dashboard | Frameworks | Reports | Notifications | More |

### "More" Menu Implementation

**Recommendation: Bottom-sheet action list triggered by the "More" tab.**

- Tapping "More" does NOT navigate to a route. It opens a slide-up bottom sheet (consistent with FR-022 modal/bottom-sheet animation spec) containing the remaining nav items for that role.
- The bottom sheet contains a scrollable list of navigation links.
- Tapping a link navigates and dismisses the sheet.
- Tapping the backdrop or swiping down dismisses the sheet.

Implementation approach:
- Use Angular CDK `Overlay` or a simple absolutely-positioned panel with animation.
- Items in "More" = all sidebar items minus the 4 already shown in the bottom bar.
- Derive from the same role-based nav config used by the sidebar (single source of truth).

### Styling

```css
.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 56px;
  display: flex;
  justify-content: space-around;
  align-items: center;
  background: white;
  border-top: 1px solid #e0e0e0;
  z-index: 1000;
  padding-bottom: env(safe-area-inset-bottom); /* iPhone notch */
}
```

**Key detail**: Add `padding-bottom: 56px + safe-area` to the main content area when bottom nav is visible, to prevent content from being obscured.

---

## 4. Responsive Table-to-Card Pattern

### Decision: Component-Based Approach (Not CSS-Only)

**Rationale**: CSS-only table-to-card (using `display: block` on `<tr>` / `<td>`) is fragile and produces poor accessibility tree output. The spec requires **expandable card lists** at mobile (FR-006), which implies interactive expand/collapse — impossible with CSS-only.

### Architecture

Create a `<app-responsive-table>` wrapper component that accepts data and column definitions and internally switches rendering:

```typescript
@Component({
  standalone: true,
  selector: 'app-responsive-table',
  template: `
    @if (isMobile$ | async) {
      <!-- Card list view -->
      @for (row of data; track trackBy(row)) {
        <app-data-card [row]="row" [columns]="columns" />
      }
    } @else {
      <!-- Standard table view -->
      <table>...</table>
    }
  `
})
export class ResponsiveTableComponent {
  @Input() data: any[];
  @Input() columns: ColumnDef[];
  isMobile$ = inject(BreakpointService).isMobile$;
}
```

### Column Hiding at Tablet

Define column visibility per breakpoint in the column definition:

```typescript
interface ColumnDef {
  key: string;
  header: string;
  visibleAt?: BreakpointName[]; // e.g., ['md', 'lg', 'xl', '2xl']
}
```

At tablet, filter visible columns: `columns.filter(c => !c.visibleAt || c.visibleAt.includes(currentBreakpoint))`. The table at tablet keeps horizontal scroll (FR-006) with a `overflow-x: auto` wrapper for any remaining wide content.

### Card Layout at Mobile

Each card shows:
- **Primary field** (e.g., skill name) as the card title
- **2–3 secondary fields** visible by default
- **Expand chevron** to reveal all remaining columns
- Cards are full-width, stacked, with 8px gap

### Key Takeaway
Component-based switching is the right call for this spec. It gives full control over the card layout, supports expandable detail, and plays well with `BreakpointService`. CSS-only is only appropriate for simpler cases where you just want to reflow, not structurally change the UI.

---

## 5. Inline Form Validation with Angular Reactive Forms

### Validation Timing Strategy

**Decision: Show errors on blur + on submit. NOT on every keystroke.**

- **On blur**: When the user leaves a field (`touched` = true), if the field is invalid, show the error. This avoids shouting errors while the user is still typing.
- **On submit**: Call `form.markAllAsTouched()` to trigger display of all errors at once for any fields the user skipped.
- **On correction**: Once an error is shown, clear it in real-time as the user corrects the value (the reactive form's `statusChanges` handles this automatically since validity updates on every keystroke).

This pattern satisfies spec FR-026 ("real-time validation, inline below the field, cleared when valid") while avoiding hostile UX of screaming errors before the user finishes typing.

### Reusable Inline Error Component

```typescript
@Component({
  standalone: true,
  selector: 'app-field-error',
  template: `
    @if (control?.touched && control?.invalid) {
      @for (error of activeErrors; track error) {
        <div class="field-error" role="alert">
          <mat-icon>error_outline</mat-icon>
          <span>{{ error }}</span>
        </div>
      }
    }
  `,
  styles: [`
    .field-error {
      color: #d32f2f;
      font-size: 12px;
      margin-top: 4px;
      display: flex;
      align-items: center;
      gap: 4px;
    }
  `]
})
export class FieldErrorComponent {
  @Input() control: AbstractControl | null = null;
  @Input() errorMessages: Record<string, string> = {};

  get activeErrors(): string[] {
    if (!this.control?.errors) return [];
    return Object.keys(this.control.errors)
      .filter(key => this.errorMessages[key])
      .map(key => this.errorMessages[key]);
  }
}
```

Usage:

```html
<input formControlName="certName" />
<app-field-error
  [control]="form.get('certName')"
  [errorMessages]="{ required: 'This field is required.' }" />
```

### Centralized Error Message Constants

**Decision: Single `validation-messages.ts` constants file.**

```typescript
// shared/constants/validation-messages.ts
export const VALIDATION_MESSAGES = {
  required: 'This field is required.',
  fileFormat: 'Only PDF, JPG, and PNG files are accepted.',
  fileSize: 'File size must not exceed 5 MB.',
  expiryBeforeIssue: 'Expiry date must be after issue date.',
  startAfterDeadline: 'Start date must be before deadline.',
  noSkillsAdded: 'Add at least one required skill to create a project.',
  duplicateProjectName: 'A project with this name already exists.',
  duplicateSkill: 'This skill already exists in your profile.',
  linkedSkillDelete: 'This skill is linked to an active project and cannot be deleted.',
  assessmentNotAvailable: 'Assessment not available yet for this skill.',
  retakeCooldown: (hours: number, minutes: number) =>
    `You can retake this assessment in ${hours} hours ${minutes} minutes.`,
  timeUp: "Time's up! Your test has been auto-submitted.",
  noCandidatesFound: 'No candidates found matching the required skills. Consider lowering the minimum proficiency or providing training.',
} as const;
```

All error messages are specified **verbatim** in the spec (FR-027). The constants file is the single source of truth referenced by all forms.

### Submit Guard Pattern

```typescript
onSubmit() {
  if (this.form.invalid) {
    this.form.markAllAsTouched(); // triggers all field-error displays
    return;
  }
  // proceed with submission
}
```

---

## 6. Skeleton Loader Implementation

### Decision: CSS-Only Shimmer with Shape-Matching Components

No third-party libraries needed. Create dedicated skeleton components that mirror the dimensions of the content they replace.

### Shimmer Animation (Global CSS)

```css
/* styles.scss (global) */
@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

.skeleton {
  background: linear-gradient(
    90deg,
    #e0e0e0 25%,
    #f0f0f0 50%,
    #e0e0e0 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s ease-in-out infinite;
  border-radius: 4px;
}

@media (prefers-reduced-motion: reduce) {
  .skeleton {
    animation: none;
    background: #e0e0e0;
  }
}
```

### Shape-Matching Skeleton Components

**Card skeleton** (for dashboard stat cards, skill cards):

```typescript
@Component({
  standalone: true,
  selector: 'app-card-skeleton',
  template: `
    <div class="card-skeleton">
      <div class="skeleton skeleton-title"></div>
      <div class="skeleton skeleton-text"></div>
      <div class="skeleton skeleton-text short"></div>
    </div>
  `,
  styles: [`
    .card-skeleton { padding: 16px; border: 1px solid #e0e0e0; border-radius: 8px; }
    .skeleton-title { height: 20px; width: 60%; margin-bottom: 12px; }
    .skeleton-text { height: 14px; width: 100%; margin-bottom: 8px; }
    .skeleton-text.short { width: 40%; }
  `]
})
export class CardSkeletonComponent {}
```

**Table row skeleton** (for data tables):

```typescript
@Component({
  standalone: true,
  selector: 'app-table-skeleton',
  template: `
    @for (row of rows; track $index) {
      <div class="table-row-skeleton">
        @for (col of cols; track $index) {
          <div class="skeleton skeleton-cell"></div>
        }
      </div>
    }
  `,
  styles: [`
    .table-row-skeleton { display: flex; gap: 16px; padding: 12px 0; border-bottom: 1px solid #f0f0f0; }
    .skeleton-cell { height: 16px; flex: 1; }
  `]
})
export class TableSkeletonComponent {
  @Input() rows = 5;
  @Input() cols = 4;
}
```

### Usage Pattern

```html
@if (isLoading) {
  <app-card-skeleton />
  <app-card-skeleton />
  <app-card-skeleton />
} @else {
  @for (card of cards; track card.id) {
    <app-stat-card [data]="card" />
  }
}
```

### Skeleton Shows Until Data Resolves or Timeout

Per spec edge case: if data never resolves, after **10 seconds** replace skeleton with a retry/error state. Implement via `timeout` RxJS operator on the data observable:

```typescript
data$ = this.dataService.load().pipe(
  timeout(10000),
  catchError(() => of({ error: true, data: [] }))
);
```

### Key Takeaway
CSS-only shimmer is sufficient — no animation library needed. Create 3–4 skeleton components (card, table-row, form, chart) that cover all spec screens. Respect `prefers-reduced-motion` by disabling the shimmer animation.

---

## 7. Swipe Gesture Detection — Skill Card Quick Actions

### Decision: Native Touch Events — No Third-Party Library

Use `touchstart`, `touchmove`, `touchend` events directly. This avoids HammerJS (which has been semi-abandoned and adds bundle weight) and keeps the implementation minimal.

### Implementation Pattern

Create a reusable `SwipeDirective`:

```typescript
@Directive({
  standalone: true,
  selector: '[appSwipe]'
})
export class SwipeDirective {
  @Output() swipeLeft = new EventEmitter<void>();
  @Output() swipeRight = new EventEmitter<void>();

  private startX = 0;
  private startY = 0;
  private threshold = 50;  // minimum px to qualify as swipe
  private restraint = 100; // max vertical allowed

  @HostListener('touchstart', ['$event'])
  onTouchStart(e: TouchEvent) {
    const touch = e.changedTouches[0];
    this.startX = touch.pageX;
    this.startY = touch.pageY;
  }

  @HostListener('touchend', ['$event'])
  onTouchEnd(e: TouchEvent) {
    const touch = e.changedTouches[0];
    const dx = touch.pageX - this.startX;
    const dy = touch.pageY - this.startY;

    if (Math.abs(dx) >= this.threshold && Math.abs(dy) <= this.restraint) {
      if (dx < 0) this.swipeLeft.emit();
      else this.swipeRight.emit();
    }
  }
}
```

### Revealing Quick Actions on Swipe-Left

The card component uses the directive and manages a `revealed` state:

```typescript
@Component({
  standalone: true,
  imports: [SwipeDirective],
  template: `
    <div class="card-wrapper" appSwipe
         (swipeLeft)="showActions()"
         (swipeRight)="hideActions()">
      <div class="card-content" [style.transform]="revealed ? 'translateX(-120px)' : 'translateX(0)'"
           [style.transition]="'transform 200ms ease'">
        <!-- card content -->
      </div>
      <div class="quick-actions" [class.visible]="revealed">
        <button (click)="onView()">View</button>
        <button (click)="onEdit()">Edit</button>
        <button (click)="onDelete()">Delete</button>
      </div>
    </div>
  `
})
```

### Considerations

- **Scroll interference**: The `restraint` value (max vertical movement) prevents diagonal drags from triggering swipes. Do NOT call `preventDefault()` on `touchmove` globally — it blocks native scrolling.
- **Accessibility**: The swipe actions must be the **same** actions available via the three-dot overflow menu (spec assumption). Swipe is an enhancement, not the only path.
- **Desktop**: Swipe only applies on mobile (< 768px). On desktop, the three-dot menu provides the same actions. Guard the directive or the template render with `isMobile$`.
- **`touchmove` for visual feedback**: Optionally listen to `touchmove` to translate the card in real-time (following the finger), clamped to max reveal width. This provides a more polished feel but adds complexity.

### Key Takeaway
Native touch events are sufficient for simple swipe detection. A directive-based approach keeps it reusable across any card component. The 50px threshold + 100px vertical restraint is a well-established heuristic for distinguishing swipe from scroll.

---

## Summary of Decisions

| Topic | Decision | Rationale |
|-------|----------|-----------|
| Breakpoints | Custom `BreakpointService` wrapping CDK `BreakpointObserver` | CDK's built-in breakpoints don't match spec; central service avoids scattered query strings |
| Breakpoint API | Single `currentBreakpoint$` + convenience `isMobile$`/`isTablet$`/`isDesktop$` | Covers both granular layout logic and common conditional rendering |
| Route animation | `withViewTransitions()` (primary) + legacy `@angular/animations` (fallback) | Native View Transitions are performant and progressive; legacy needed for component animations |
| `prefers-reduced-motion` | CSS media query for View Transitions, `@.disabled` for legacy animations | Both paths covered; spec explicitly requires respecting this setting |
| Bottom nav | `*ngIf` conditional rendering in app shell; bottom-sheet for "More" | DOM-level absence required at ≥768px (SC-007); "More" is a sub-nav, not a route |
| Table-to-card | Component-based switching (not CSS-only) | Spec requires expandable cards at mobile; CSS-only can't deliver interactivity |
| Form validation | Show on blur + on submit; clear on correction | Balances real-time feedback (FR-026) with usable UX; `markAllAsTouched()` on submit |
| Error messages | Centralized `VALIDATION_MESSAGES` constants | Spec requires verbatim strings (FR-027); single source avoids drift |
| Skeleton loaders | CSS-only shimmer + shape-matching skeleton components | No library needed; 3–4 components cover all screen shapes |
| Skeletons timeout | 10s timeout → error/retry state | Spec edge case: skeleton must not show indefinitely |
| Swipe gestures | Native `touchstart`/`touchend` directive | Avoids HammerJS; simple threshold math is sufficient |
| Swipe actions | Same as three-dot menu (View, Edit, Delete) | Spec assumption: swipe is enhancement, not exclusive path |
