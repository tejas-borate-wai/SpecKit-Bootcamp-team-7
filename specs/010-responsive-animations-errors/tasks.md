# Tasks: Responsive Design, Animations & Error Handling

**Input**: Design documents from `/specs/010-responsive-animations-errors/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/shared-component-contract.md, quickstart.md

**Tests**: Not explicitly requested in the feature specification. Test tasks are omitted.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Single Angular SPA project**: `src/` at repository root
- Core infrastructure: `src/app/core/`
- Shared components: `src/app/shared/`
- Styles: `src/styles/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Create the SCSS foundations, breakpoint constants, animation config, and error message constants that all user stories depend on

- [X] T001 [P] Create breakpoint SCSS variables and responsive mixins in src/styles/_breakpoints.scss
- [X] T002 [P] Create responsive typography scale with CSS custom properties in src/styles/_typography.scss
- [X] T003 [P] Create global animation keyframes (shimmer, route transitions, reduced-motion overrides) in src/styles/_animations.scss
- [X] T004 Import _breakpoints.scss, _typography.scss, and _animations.scss into src/styles/styles.scss
- [X] T005 [P] Create typed breakpoint constants (APP_BREAKPOINTS, BreakpointName type) in src/app/core/constants/breakpoints.ts
- [X] T006 [P] Create animation configuration constants (ANIMATIONS record with duration, easing, delay per trigger) in src/app/core/constants/animation-config.ts
- [X] T007 [P] Create verbatim Section 23 error message constants (ERROR_MESSAGES) in src/app/core/constants/error-messages.ts

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core services and shared components that ALL user stories depend on â€” must complete before any story work begins

**âš ï¸ CRITICAL**: No user story work can begin until this phase is complete

- [X] T008 Create BreakpointService wrapping CDK BreakpointObserver with currentBreakpoint$, isMobile$, isTablet$, isDesktop$ observables in src/app/core/services/breakpoint.service.ts
- [X] T009 [P] Create centralized ValidationService with form validation helpers and error message lookup in src/app/core/services/validation.service.ts
- [X] T010 [P] Create route transition animation trigger (@routeAnimations, fade+slide, 300ms) in src/app/core/animations/route.animations.ts
- [X] T011 [P] Create progress bar fill animation trigger (@progressFill, width 0â†’final%, 600ms) in src/app/core/animations/progress-bar.animations.ts
- [X] T012 [P] Create toast slide-in/out animation trigger (@toastSlide, 250ms) in src/app/core/animations/toast.animations.ts
- [X] T013 [P] Create sidebar collapse/expand animation trigger (@sidebarCollapse, 240pxâ†”64px, 200ms) in src/app/core/animations/sidebar.animations.ts
- [X] T014 [P] Create modal/bottom-sheet slide-up/down animation trigger (@modalSlide, 300ms) in src/app/core/animations/modal.animations.ts
- [X] T015 [P] Create assessment success reveal animation trigger (@successReveal, scale 0.8â†’1.0+fade, 500ms) in src/app/core/animations/success.animations.ts
- [X] T016 [P] Create reusable InlineErrorComponent (displays errors when control.touched && control.invalid, icon+red text) in src/app/shared/components/inline-error/inline-error.component.ts
- [X] T017 [P] Create reusable SkeletonLoaderComponent (card, table-row, form, chart, list-item types with CSS shimmer) in src/app/shared/components/skeleton-loader/skeleton-loader.component.ts
- [X] T018 [P] Create reusable EmptyStateComponent (icon, title, message, optional CTA button) in src/app/shared/components/empty-state/empty-state.component.ts
- [X] T019 Configure provideAnimationsAsync() and withViewTransitions() in src/app/app.config.ts
- [X] T020 Integrate @routeAnimations trigger on the AppComponent wrapper around router-outlet in src/app/app.component.ts

**Checkpoint**: Foundation ready â€” all SCSS foundations, services, animation triggers, and shared components available for user story phases

---

## Phase 3: User Story 1 â€” Mobile Responsive Layout (Priority: P1) ðŸŽ¯ MVP

**Goal**: Make the application fully usable at 375px mobile viewport â€” sidebar as hamburger drawer, stat cards stacked, tables as card lists, single-column forms, bottom nav bar, FABs, 44px tap targets

**Independent Test**: Open the app at 375px viewport width, navigate Dashboard â†’ My Skills â†’ Add Skill â†’ Take Assessment, verify layout, card rendering, tap targets, bottom nav, and form behavior at each step

### Implementation for User Story 1

- [X] T021 [US1] Create BottomNavComponent with 5 role-aware tabs (Dashboard, role-specific tabs, Notifications, More) in src/app/shared/components/bottom-nav/bottom-nav.component.ts
- [X] T022 [US1] Create bottom-nav template with role-based tab configuration and active route highlighting in src/app/shared/components/bottom-nav/bottom-nav.component.html
- [X] T023 [US1] Style bottom-nav with fixed positioning, 56px height, safe-area-inset-bottom padding in src/app/shared/components/bottom-nav/bottom-nav.component.scss
- [X] T024 [US1] Implement "More" tab bottom-sheet with overflow nav items and @modalSlide animation in src/app/shared/components/bottom-nav/bottom-nav.component.ts
- [X] T025 [P] [US1] Create FABComponent (fixed bottom-right, 56Ã—56px, navigates to route on tap, aria-label) in src/app/shared/components/fab/fab.component.ts
- [X] T026 [P] [US1] Create SwipeDirective for swipe-left/right gesture detection (50px threshold, 100px vertical restraint) in src/app/shared/directives/swipe.directive.ts
- [X] T027 [P] [US1] Create MinTapTargetDirective to enforce 44Ã—44px minimum on interactive elements in src/app/shared/directives/min-tap-target.directive.ts
- [X] T028 [US1] Update AppShellComponent to conditionally render sidebar (desktop/tablet) vs bottom-nav (mobile) using BreakpointService.isMobile$ with @if in src/app/app.component.html
- [X] T029 [US1] Add FAB rendering logic to AppShellComponent based on current route and mobile breakpoint (My Skillsâ†’Add, Projectsâ†’Create, Certificationsâ†’Upload) in src/app/app.component.ts
- [X] T030 [US1] Update sidebar component to render as hidden hamburger drawer on mobile with @sidebarCollapse animation in the existing sidebar component
- [X] T031 [US1] Update header component for mobile: show logo+hamburger+bell+avatar only, hide search bar and page title in the existing header component
- [X] T032 [US1] Add mobile responsive SCSS to Dashboard â€” stat cards 1/row stacked, content full-width with 16px padding in the existing dashboard component SCSS
- [X] T033 [P] [US1] Create ResponsiveTableComponent that switches between table (desktop/tablet) and expandable card list (mobile) in src/app/shared/components/responsive-table/responsive-table.component.ts
- [X] T034 [US1] Create responsive-table template with @if switching on isMobile$, card layout with primary field title and expand chevron in src/app/shared/components/responsive-table/responsive-table.component.html
- [X] T035 [US1] Style responsive-table with full-width cards, 8px gap, expand animation in src/app/shared/components/responsive-table/responsive-table.component.scss
- [X] T036 [US1] Replace skill list table with ResponsiveTableComponent in the existing My Skills list component
- [X] T037 [US1] Update Add Skill / Edit Skill forms for mobile â€” single column, labels stacked, sticky submit button at viewport bottom in the existing skill form component SCSS
- [X] T038 [US1] Update Take Assessment screen for mobile â€” full-screen question card, vertical stacked options, sticky Previous/Next at bottom in the existing assessment component SCSS
- [X] T039 [US1] Apply swipe-left directive on skill cards at mobile to reveal quick actions (View, Edit, Delete) in the existing My Skills list component
- [X] T040 [US1] Update modals/dialogs to render as full-screen bottom sheets with drag handle on mobile using @modalSlide animation in the existing modal/dialog components
- [X] T041 [US1] Update toast notifications for mobile â€” full-width at top instead of top-right 360px in the existing toast component SCSS
- [X] T042 [US1] Add main content bottom padding (56px + safe-area) when bottom nav is visible to prevent content obscuring in the existing app shell styles
- [X] T043 [US1] Add responsive SCSS for charts on mobile â€” max height 250px, legend hidden (tap to show), horizontally scrollable in the existing chart component SCSS files

**Checkpoint**: App is fully usable at 375px mobile viewport â€” sidebar hidden, bottom nav active, stat cards stacked, tables as cards, forms single-column, 44px tap targets enforced

---

## Phase 4: User Story 2 â€” Tablet Optimized Layout (Priority: P1)

**Goal**: Optimize the application for 768px tablet viewport â€” sidebar as 64px icon-only rail with tooltips, stat cards 2/row, search icon tap-to-reveal, horizontal-scrollable tables, charts with legend below

**Independent Test**: Open the app at 768px viewport width, verify sidebar icon-only rail, 2-column stat cards, hidden search with tap access, horizontal-scrollable tables, and chart legend below

### Implementation for User Story 2

- [X] T044 [US2] Update sidebar component for tablet â€” 64px icon-only rail with tooltip on hover, @sidebarCollapse animation between states in the existing sidebar component
- [X] T045 [US2] Update header component for tablet â€” hide search bar, show search icon that expands input on tap in the existing header component
- [X] T046 [US2] Update Dashboard stat cards for tablet â€” 2 cards per row using CSS grid auto-fill in the existing dashboard component SCSS
- [X] T047 [US2] Add horizontal scroll wrapper to all data tables at tablet breakpoint with overflow-x: auto in the existing table/list component SCSS files
- [X] T048 [US2] Update chart components for tablet â€” 100% width, legend positioned below chart instead of beside in the existing chart component SCSS files
- [X] T049 [US2] Update content area for tablet â€” full-width with 24px padding in the existing app shell / layout SCSS
- [X] T050 [US2] Update form layouts for tablet â€” transition from two-column (desktop) to responsive based on available width in the existing form component SCSS files
- [X] T051 [US2] Ensure bottom nav bar is NOT rendered at tablet (â‰¥768px) â€” verify @if guard on isMobile$ excludes tablet in src/app/app.component.html
- [X] T052 [US2] Update responsive-table columns to filter by visibleAt for tablet â€” hide lower-priority columns while keeping horizontal scroll for remaining in src/app/shared/components/responsive-table/responsive-table.component.ts

**Checkpoint**: App displays optimized tablet layout at 768px â€” icon-only sidebar, 2-col cards, search icon, scrollable tables, legend-below charts

---

## Phase 5: User Story 3 â€” Smooth Animations and Motion Feedback (Priority: P2)

**Goal**: Add purposeful animations to all key interactions â€” route transitions, progress bar fills, assessment success, toast slide-in/out, sidebar collapse, modal slides â€” all respecting prefers-reduced-motion

**Independent Test**: Complete an assessment end-to-end and observe: route transition on navigation, progress bar animation on score card, success animation on completion, toast slide-in on confirmation action

### Implementation for User Story 3

- [X] T053 [US3] Integrate @progressFill animation on all percentage progress bars (score card, profile completion, skill level bars) in the existing progress bar / score card components
- [X] T054 [US3] Integrate @successReveal animation on assessment completion screen â€” animate before showing score details in the existing assessment result component
- [X] T055 [US3] Integrate @toastSlide animation on the toast notification component â€” slide-in on appear, slide-out on dismiss/timeout in the existing toast/notification component
- [X] T056 [US3] Integrate @sidebarCollapse animation on sidebar width transitions (expandedâ†”icon-only, hamburger open/close) in the existing sidebar component
- [X] T057 [US3] Integrate @modalSlide animation on all modal and bottom-sheet open/close transitions in the existing modal/dialog components
- [X] T058 [US3] Add prefers-reduced-motion support â€” disable legacy animations via @.disabled binding on root component in src/app/app.component.ts
- [X] T059 [US3] Add prefers-reduced-motion CSS override for View Transitions and shimmer animations in src/styles/_animations.scss

**Checkpoint**: All 6 animation types are active, smooth at 60fps, and suppressed when prefers-reduced-motion is enabled

---

## Phase 6: User Story 4 â€” Error Messages and Validation Feedback (Priority: P1)

**Goal**: Implement all Section 23 error messages verbatim with inline validation, skeleton loaders on all async screens, empty states, success toasts, and never-blank-page guarantee

**Independent Test**: Submit the certification upload form with deliberate invalid inputs (wrong file type, missing name, inverted dates), verify each field shows the correct inline error, form remains open, and no data saved until all valid

### Implementation for User Story 4

- [X] T060 [US4] Integrate InlineErrorComponent with ERROR_MESSAGES on the certification upload form â€” file format, file size, expiry before issue, required fields in the existing certification upload component
- [X] T061 [P] [US4] Integrate InlineErrorComponent with ERROR_MESSAGES on the project creation form â€” project name required, start after deadline, no skills added, duplicate name in the existing project creation component
- [X] T062 [P] [US4] Integrate InlineErrorComponent with ERROR_MESSAGES on the login form â€” invalid credentials, required field errors in the existing login component
- [X] T063 [P] [US4] Integrate InlineErrorComponent with ERROR_MESSAGES on the add/edit skill forms â€” duplicate skill in profile, required fields in the existing skill form components
- [X] T064 [P] [US4] Integrate InlineErrorComponent with ERROR_MESSAGES on the skill framework forms (admin) â€” duplicate skill in subcategory, category has linked skills in the existing admin skill framework components
- [X] T065 [US4] Implement assessment timer auto-submit with "Time's up! Your test has been auto-submitted." banner on expiry in the existing take-assessment component
- [X] T066 [US4] Implement retake cooldown check with "You can retake this assessment in X hours Y minutes." message in the existing assessments list component
- [X] T067 [US4] Implement "Assessment not available yet for this skill." empty state when no questions exist in the existing take-assessment component
- [X] T068 [US4] Implement "This skill is linked to an active project and cannot be deleted." error on skill delete attempt in the existing my-skills component
- [X] T069 [US4] Add SkeletonLoaderComponent to Dashboard screen â€” show card skeletons while data loads in the existing dashboard component
- [X] T070 [P] [US4] Add SkeletonLoaderComponent to My Skills list â€” show table-row/card skeletons while data loads in the existing my-skills list component
- [X] T071 [P] [US4] Add SkeletonLoaderComponent to Assessments list â€” show list-item skeletons while data loads in the existing assessments list component
- [X] T072 [P] [US4] Add SkeletonLoaderComponent to Team Skills Overview â€” show table skeletons while data loads in the existing team-skills component
- [X] T073 [P] [US4] Add SkeletonLoaderComponent to Reports screens â€” show chart skeletons while data loads in the existing report components
- [X] T074 [P] [US4] Add SkeletonLoaderComponent to Projects list and Certifications list â€” show skeletons while data loads in the existing project and certification list components
- [X] T075 [US4] Implement 10-second skeleton timeout â€” replace skeleton with error/retry state if data never resolves, using RxJS timeout operator in the existing data-loading components
- [X] T076 [US4] Add green success toast on successful actions: skill saved, certification uploaded, skill approved, project created in the existing form submission handlers
- [X] T077 [US4] Ensure error visual styling follows design system â€” red (#EF4444) text + icon for errors, amber for warnings, green for success across all inline error and toast components

**Checkpoint**: All Section 23 error messages implemented verbatim, skeleton loaders on all async screens, empty states on all lists, success toasts on actions, no blank pages ever

---

## Phase 7: User Story 5 â€” Real-Time Search and Filtering (Priority: P2)

**Goal**: Implement global search filtering employees by skill/department/proficiency/certification/availability in real time, plus filter controls on all list screens that update without page reload

**Independent Test**: Open Team Skills Overview, type a partial skill name in search, confirm list updates per keystroke without submit action

### Implementation for User Story 5

- [X] T078 [US5] Create GlobalSearchService with cross-entity search logic against NgRx state (employees, skills, projects, certifications) in src/app/core/services/global-search.service.ts
- [X] T079 [US5] Create GlobalSearchComponent with search input, real-time results dropdown, and result navigation in src/app/shared/components/global-search/global-search.component.ts
- [X] T080 [US5] Create global-search template with search input, results list grouped by type, and empty state handling in src/app/shared/components/global-search/global-search.component.html
- [X] T081 [US5] Style global-search â€” desktop: visible in header center, tablet: hidden behind icon with tap-to-reveal, mobile: not in header in src/app/shared/components/global-search/global-search.component.scss
- [X] T082 [US5] Integrate GlobalSearchComponent into header bar, replacing static search placeholder in the existing header component
- [X] T083 [P] [US5] Add filter controls (category, status dropdowns) with real-time list filtering to My Skills list in the existing my-skills list component
- [X] T084 [P] [US5] Add filter controls (category, status dropdowns) with real-time list filtering to Assessments list in the existing assessments list component
- [X] T085 [P] [US5] Add filter controls (status, date range) with real-time list filtering to Projects list in the existing projects list component
- [X] T086 [P] [US5] Add filter controls (department, availability, min match score) with real-time list filtering to Team Skills Overview in the existing team-skills component
- [X] T087 [P] [US5] Add filter controls (department, skill category, view-by options) with real-time filtering to Reports screens in the existing report components
- [X] T088 [US5] Add EmptyStateComponent with "No results found for your search." to all filtered/searched lists when no matches in all list components

**Checkpoint**: Global search works with per-keystroke filtering, all list screens have filter controls that update immediately, empty states shown on no-match

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Typography enforcement, desktop large-screen layout finalization, responsive CSS custom property alignment, and final validation

- [X] T089 [P] Apply responsive typography scale (H1/H2/Card Title/Body/Labels) across all existing screen components using CSS custom properties from _typography.scss
- [X] T090 [P] Verify desktop layout (â‰¥1280px) across all screens â€” 240px sidebar, 1440px max-width centered content, 48px padding, stat cards 4/row, full table columns, two-column forms
- [X] T091 [P] Verify 2xl layout (â‰¥1440px) â€” content max-width cap, no overflow, proper centering on large monitors
- [X] T092 Ensure all icons are SVG format, user avatars use object-fit cover at 40px (desktop) / 36px (mobile), retina-ready images across all components
- [X] T093 Ensure no hover-only interactions remain â€” verify all hover triggers have equivalent tap/click interactions across all components
- [X] T094 Run quickstart.md validation â€” verify Angular CDK installed, provideAnimationsAsync() configured, withViewTransitions() enabled, all SCSS imports present

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies â€” can start immediately
- **Foundational (Phase 2)**: Depends on Setup (Phase 1) completion â€” BLOCKS all user stories
- **User Story 1 â€” Mobile (Phase 3)**: Depends on Foundational (Phase 2) â€” MVP target
- **User Story 2 â€” Tablet (Phase 4)**: Depends on Foundational (Phase 2) â€” can run in parallel with US1
- **User Story 3 â€” Animations (Phase 5)**: Depends on Foundational (Phase 2) â€” can run in parallel with US1/US2
- **User Story 4 â€” Error Handling (Phase 6)**: Depends on Foundational (Phase 2) â€” can run in parallel with US1/US2/US3
- **User Story 5 â€” Search & Filter (Phase 7)**: Depends on Foundational (Phase 2) â€” can run in parallel with other stories
- **Polish (Phase 8)**: Depends on ALL user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational â€” independent of other stories
- **User Story 2 (P1)**: Can start after Foundational â€” shares sidebar/header work with US1 but targets different breakpoint
- **User Story 3 (P2)**: Can start after Foundational â€” animation triggers are created in Phase 2, integration is story work
- **User Story 4 (P1)**: Can start after Foundational â€” InlineErrorComponent and SkeletonLoader created in Phase 2, form-level integration is story work
- **User Story 5 (P2)**: Can start after Foundational â€” independent search/filter infrastructure

### Within Each User Story

- Shared components before feature-level integration
- Component logic before template before styles
- Core implementation before cross-screen application
- Story complete before moving to next priority

### Parallel Opportunities

- All Phase 1 tasks (T001â€“T007) marked [P] can run in parallel
- All Phase 2 tasks marked [P] can run in parallel (T009â€“T018)
- Once Phase 2 completes, US1/US2/US3/US4/US5 can all start in parallel
- Within US4, skeleton loader integrations (T070â€“T074) can run in parallel
- Within US5, filter control tasks (T083â€“T087) can run in parallel

---

## Parallel Example: User Story 1 (Mobile)

```bash
# After Phase 2 completes, launch in parallel:
Task T025: "Create FABComponent in src/app/shared/components/fab/fab.component.ts"
Task T026: "Create SwipeDirective in src/app/shared/directives/swipe.directive.ts"
Task T027: "Create MinTapTargetDirective in src/app/shared/directives/min-tap-target.directive.ts"

# Then launch bottom nav + responsive table in parallel:
Task T021-T024: "Bottom nav component (sequential â€” logic, template, style, more-sheet)"
Task T033-T035: "Responsive table component (sequential â€” logic, template, style)"

# Then integrate into existing screens sequentially:
Task T028: "Update AppShellComponent for mobile conditional rendering"
Task T030: "Update sidebar for mobile drawer"
...
```

## Parallel Example: User Story 4 (Error Handling)

```bash
# After Phase 2 completes, launch form integrations in parallel:
Task T060: "Certification upload form validation"
Task T061: "Project creation form validation"
Task T062: "Login form validation"
Task T063: "Add/edit skill form validation"
Task T064: "Skill framework form validation"

# Launch skeleton integrations in parallel:
Task T070: "My Skills list skeleton"
Task T071: "Assessments list skeleton"
Task T072: "Team Skills skeleton"
Task T073: "Reports skeleton"
Task T074: "Projects + Certifications skeleton"
```

---

## Implementation Strategy

### MVP First (User Story 1 â€” Mobile Responsive)

1. Complete Phase 1: Setup (SCSS foundations + constants)
2. Complete Phase 2: Foundational (services, animations, shared components)
3. Complete Phase 3: User Story 1 â€” Mobile Layout
4. **STOP and VALIDATE**: Test at 375px viewport â€” navigate all major screens
5. Deploy/demo if ready â€” app is mobile-usable

### Incremental Delivery

1. Setup + Foundational â†’ Infrastructure ready
2. Add US1 (Mobile) â†’ Test at 375px â†’ Deploy (MVP!)
3. Add US2 (Tablet) â†’ Test at 768px â†’ Deploy
4. Add US4 (Error Handling) â†’ Test all forms with invalid data â†’ Deploy
5. Add US3 (Animations) â†’ Visual polish pass â†’ Deploy
6. Add US5 (Search & Filter) â†’ Test search and filters â†’ Deploy
7. Polish phase â†’ Typography, icons, final validation â†’ ðŸš€ Complete

### Parallel Team Strategy

With multiple developers after Foundational is complete:

- Developer A: User Story 1 (Mobile) + User Story 2 (Tablet) â€” layout specialist
- Developer B: User Story 4 (Error Handling) â€” validation/UX specialist
- Developer C: User Story 3 (Animations) + User Story 5 (Search & Filter) â€” interaction specialist

---

## Notes

- [P] tasks = different files, no dependencies on incomplete tasks in same story
- [Story] label maps task to specific user story for traceability
- This phase modifies existing Phase 1â€“9 components in-place â€” no new routes or screens
- All animation triggers are created in Phase 2 (Foundational) so stories only do integration
- Error messages must be verbatim from Section 23 â€” use ERROR_MESSAGES constants only
- DOM-level conditional rendering (@if/ngIf) required for bottom nav, FABs â€” not CSS display:none
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
