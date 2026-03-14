# Quickstart: Responsive Design, Animations & Error Handling

**Feature**: 010-responsive-animations-errors
**Date**: 2026-03-13

---

## Prerequisites

- Phases 1–9 structurally complete (all 30 screens exist and are routable)
- Angular 17+ project with Angular CLI
- Angular CDK installed (`@angular/cdk`)
- `@angular/animations` available (bundled with Angular)
- NgRx store configured with existing feature slices (session, skills, notifications, projects, teamSkills)

---

## Step 1: Verify Dependencies

```bash
# Check Angular CDK is installed (required for BreakpointObserver)
ng version
npm list @angular/cdk

# If not installed:
npm install @angular/cdk
```

Ensure `provideAnimationsAsync()` (or `provideAnimations()`) is in `app.config.ts`:

```typescript
// app.config.ts
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes, withViewTransitions()),
    provideAnimationsAsync(),
    // ... existing providers
  ]
};
```

---

## Step 2: Create SCSS Foundations

### `src/styles/_breakpoints.scss`

```scss
$breakpoint-xs: 0px;
$breakpoint-sm: 480px;
$breakpoint-md: 768px;
$breakpoint-lg: 1024px;
$breakpoint-xl: 1280px;
$breakpoint-2xl: 1440px;

@mixin mobile { @media (max-width: #{$breakpoint-md - 0.02px}) { @content; } }
@mixin tablet { @media (min-width: $breakpoint-md) and (max-width: #{$breakpoint-xl - 0.02px}) { @content; } }
@mixin desktop { @media (min-width: $breakpoint-xl) { @content; } }
@mixin breakpoint-up($bp) { @media (min-width: $bp) { @content; } }
@mixin breakpoint-down($bp) { @media (max-width: #{$bp - 0.02px}) { @content; } }
```

### `src/styles/_typography.scss`

```scss
@use 'breakpoints' as bp;

:root {
  --font-h1: 20px;
  --font-h2: 16px;
  --font-card-title: 14px;
  --font-body: 14px;
  --font-label: 11px;
}

@include bp.tablet {
  :root {
    --font-h1: 24px;
    --font-h2: 18px;
    --font-card-title: 15px;
    --font-label: 12px;
  }
}

@include bp.desktop {
  :root {
    --font-h1: 28px;
    --font-h2: 20px;
    --font-card-title: 16px;
    --font-label: 12px;
  }
}
```

### `src/styles/_animations.scss`

```scss
@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

.skeleton {
  background: linear-gradient(90deg, #e0e0e0 25%, #f0f0f0 50%, #e0e0e0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s ease-in-out infinite;
  border-radius: 4px;
}

@media (prefers-reduced-motion: reduce) {
  .skeleton { animation: none; background: #e0e0e0; }
}

/* Route transition (View Transitions API) */
::view-transition-old(root) {
  animation: slide-fade-out 200ms ease-in;
}
::view-transition-new(root) {
  animation: slide-fade-in 200ms ease-out;
}

@keyframes slide-fade-in {
  from { opacity: 0; transform: translateY(8px); }
}
@keyframes slide-fade-out {
  to { opacity: 0; transform: translateY(-8px); }
}

@media (prefers-reduced-motion: reduce) {
  ::view-transition-old(root),
  ::view-transition-new(root) {
    animation: none !important;
  }
}
```

Import all in `src/styles/styles.scss`:

```scss
@use 'variables';
@use 'breakpoints';
@use 'typography';
@use 'animations';
```

---

## Step 3: Create BreakpointService

```typescript
// src/app/core/constants/breakpoints.ts
export const APP_BREAKPOINTS = {
  xs: '(max-width: 479.98px)',
  sm: '(min-width: 480px) and (max-width: 767.98px)',
  md: '(min-width: 768px) and (max-width: 1023.98px)',
  lg: '(min-width: 1024px) and (max-width: 1279.98px)',
  xl: '(min-width: 1280px) and (max-width: 1439.98px)',
  '2xl': '(min-width: 1440px)',
} as const;

export type BreakpointName = keyof typeof APP_BREAKPOINTS;
```

```typescript
// src/app/core/services/breakpoint.service.ts
import { Injectable, inject } from '@angular/core';
import { BreakpointObserver } from '@angular/cdk/layout';
import { Observable } from 'rxjs';
import { map, distinctUntilChanged, shareReplay } from 'rxjs/operators';
import { APP_BREAKPOINTS, BreakpointName } from '../constants/breakpoints';

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
        return 'xs' as BreakpointName;
      }),
      distinctUntilChanged(),
      shareReplay(1)
    );

  isMobile$: Observable<boolean> = this.currentBreakpoint$.pipe(
    map(bp => bp === 'xs' || bp === 'sm')
  );

  isTablet$: Observable<boolean> = this.currentBreakpoint$.pipe(
    map(bp => bp === 'md' || bp === 'lg')
  );

  isDesktop$: Observable<boolean> = this.currentBreakpoint$.pipe(
    map(bp => bp === 'xl' || bp === '2xl')
  );
}
```

---

## Step 4: Create Error Message Constants

```typescript
// src/app/core/constants/error-messages.ts
export const ERROR_MESSAGES = {
  required: 'This field is required.',
  fileFormat: 'Only PDF, JPG, and PNG files are accepted.',
  fileSize: 'File size must not exceed 5 MB.',
  expiryBeforeIssue: 'Expiry date must be after issue date.',
  timeUp: "Time's up! Your test has been auto-submitted.",
  retakeCooldown: (hours: number, minutes: number) =>
    `You can retake this assessment in ${hours} hours ${minutes} minutes.`,
  assessmentNotAvailable: 'Assessment not available yet for this skill.',
  projectNameRequired: 'Project name is required.',
  startAfterDeadline: 'Start date must be before deadline.',
  noSkillsAdded: 'Add at least one required skill to create a project.',
  duplicateProjectName: 'A project with this name already exists.',
  duplicateSkill: 'This skill is already in your profile.',
  linkedSkillDelete: 'This skill is linked to an active project and cannot be deleted.',
  noCandidatesFound: 'No candidates found matching the required skills. Consider lowering the minimum proficiency or providing training.',
  duplicateSkillInSubcategory: 'This skill already exists in this subcategory.',
  categoryHasLinkedSkills: 'Cannot delete: skills are linked to this category.',
  invalidCredentials: 'Invalid email or password.',
} as const;
```

---

## Step 5: Verify Setup

```bash
# Build to check for compilation errors
ng build --configuration development

# Run existing unit tests to ensure nothing is broken
ng test --watch=false

# Serve and test at multiple viewports
ng serve
# Open browser DevTools → toggle device toolbar → test at 375px, 768px, 1280px, 1440px
```

---

## Implementation Order

1. **SCSS foundations** — breakpoints, typography, animations (global)
2. **BreakpointService** — core service wrapping CDK
3. **Error message constants** — centralized validation strings
4. **Shared components** — skeleton loader, empty state, inline error, responsive table
5. **Animation triggers** — route transitions, progress bars, toasts, sidebar, modals, success
6. **App shell updates** — sidebar responsive behavior, header responsive behavior, bottom nav, FABs
7. **Feature component retrofits** — apply responsive layouts, animations, and error handling to all 30 screens
8. **Global search** — search service + header component
9. **Mobile enhancements** — swipe directive, touch targets, bottom sheets
10. **Unit tests** — breakpoint service, validation utils, search/filter logic, animation configs
