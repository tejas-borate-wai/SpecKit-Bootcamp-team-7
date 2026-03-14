# Data Model: Responsive Design, Animations & Error Handling

**Feature**: 010-responsive-animations-errors
**Date**: 2026-03-13

---

## Overview

This phase introduces no new persistent data entities. Instead, it defines configuration-level models and TypeScript interfaces for the cross-cutting responsive, animation, and error handling infrastructure. These models govern layout decisions, animation behavior, validation rules, and search/filter operations across all 30 existing screens.

---

## Entity: BreakpointConfig

**Purpose**: Central definition of the 6 named viewport breakpoints used throughout the application.

| Field | Type | Description |
|---|---|---|
| `name` | `BreakpointName` | Named identifier: `'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl' \| '2xl'` |
| `minWidth` | `number` | Minimum viewport width in pixels (0, 480, 768, 1024, 1280, 1440) |
| `mediaQuery` | `string` | CSS media query string for BreakpointObserver |
| `context` | `string` | Human-readable context (e.g., "Mobile portrait", "Tablet") |

### TypeScript Interface

```typescript
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

### SCSS Variables (mirror)

```scss
$breakpoint-xs: 0px;
$breakpoint-sm: 480px;
$breakpoint-md: 768px;
$breakpoint-lg: 1024px;
$breakpoint-xl: 1280px;
$breakpoint-2xl: 1440px;
```

### Validation Rules

- Breakpoint values are compile-time constants — no runtime mutation
- All component SCSS must reference these variables via `@use` — no magic pixel values

---

## Entity: AnimationConfig

**Purpose**: Typed configuration for all animation triggers used in the application.

| Field | Type | Description |
|---|---|---|
| `name` | `string` | Animation trigger name (e.g., `'routeTransition'`, `'progressBarFill'`) |
| `duration` | `number` | Duration in milliseconds |
| `easing` | `string` | CSS easing function (e.g., `'ease-in'`, `'ease-out'`, `'ease-in-out'`) |
| `delay` | `number` | Delay before animation starts in milliseconds |

### TypeScript Interface

```typescript
export interface AnimationConfig {
  readonly name: string;
  readonly duration: number;
  readonly easing: string;
  readonly delay: number;
}

export const ANIMATIONS: Record<string, AnimationConfig> = {
  routeTransition: { name: 'routeTransition', duration: 300, easing: 'ease-in-out', delay: 0 },
  progressBarFill: { name: 'progressBarFill', duration: 600, easing: 'ease-out', delay: 0 },
  testCompletionReveal: { name: 'testCompletionReveal', duration: 500, easing: 'ease-out', delay: 0 },
  toastSlide: { name: 'toastSlide', duration: 250, easing: 'ease-in-out', delay: 0 },
  sidebarCollapse: { name: 'sidebarCollapse', duration: 200, easing: 'ease-in-out', delay: 0 },
  modalSlide: { name: 'modalSlide', duration: 300, easing: 'ease-out', delay: 0 },
  statCardCounter: { name: 'statCardCounter', duration: 800, easing: 'ease-out', delay: 0 },
} as const;
```

### Validation Rules

- All durations must be positive integers
- Animation configs are compile-time constants — not user-configurable
- All animations must be disabled when `prefers-reduced-motion: reduce` is active

---

## Entity: ValidationRule

**Purpose**: Maps form field + error condition to a specific verbatim error message from Section 23.

| Field | Type | Description |
|---|---|---|
| `field` | `string` | Form control name the rule applies to |
| `errorKey` | `string` | Angular validator error key (e.g., `'required'`, `'maxFileSize'`) |
| `message` | `string` | Exact error message text displayed to the user |
| `context` | `string` | Screen or form where this rule applies |

### TypeScript Interface

```typescript
export interface ValidationRule {
  readonly field: string;
  readonly errorKey: string;
  readonly message: string;
  readonly context: string;
}
```

### Error Message Constants

```typescript
export const ERROR_MESSAGES = {
  // General
  required: 'This field is required.',

  // Certification Upload
  fileFormat: 'Only PDF, JPG, and PNG files are accepted.',
  fileSize: 'File size must not exceed 5 MB.',
  expiryBeforeIssue: 'Expiry date must be after issue date.',

  // Assessment
  timeUp: "Time's up! Your test has been auto-submitted.",
  retakeCooldown: (hours: number, minutes: number) =>
    `You can retake this assessment in ${hours} hours ${minutes} minutes.`,
  assessmentNotAvailable: 'Assessment not available yet for this skill.',

  // Project
  projectNameRequired: 'Project name is required.',
  startAfterDeadline: 'Start date must be before deadline.',
  noSkillsAdded: 'Add at least one required skill to create a project.',
  duplicateProjectName: 'A project with this name already exists.',

  // Skill Profile
  duplicateSkill: 'This skill is already in your profile.',
  linkedSkillDelete: 'This skill is linked to an active project and cannot be deleted.',

  // Candidate Matching
  noCandidatesFound: 'No candidates found matching the required skills. Consider lowering the minimum proficiency or providing training.',

  // Skill Framework
  duplicateSkillInSubcategory: 'This skill already exists in this subcategory.',
  categoryHasLinkedSkills: 'Cannot delete: skills are linked to this category.',

  // Login
  invalidCredentials: 'Invalid email or password.',
} as const;
```

### Validation Rules

- All error message strings must be verbatim — no paraphrasing (FR-027)
- Error text rendered in `--color-rejected` (#EF4444) with an icon
- Errors appear inline below the respective field
- Errors clear automatically when the field value becomes valid

---

## Entity: ColumnDefinition

**Purpose**: Configures responsive behavior for data table columns (visibility per breakpoint, card-mode rendering).

| Field | Type | Description |
|---|---|---|
| `key` | `string` | Data field key from the row object |
| `header` | `string` | Column header text |
| `visibleAt` | `BreakpointName[]` | Breakpoints at which this column is visible in table mode |
| `isPrimary` | `boolean` | If true, used as the card title at mobile breakpoint |
| `sortable` | `boolean` | Whether the column supports sorting |

### TypeScript Interface

```typescript
export interface ColumnDefinition {
  readonly key: string;
  readonly header: string;
  readonly visibleAt?: BreakpointName[];
  readonly isPrimary?: boolean;
  readonly sortable?: boolean;
  readonly cellTemplate?: string;
}
```

### Validation Rules

- At least one column must be marked `isPrimary: true` for mobile card rendering
- If `visibleAt` is undefined, the column is visible at all breakpoints
- Column definitions are per-screen configuration — not stored data

---

## Entity: NavItem

**Purpose**: Defines navigation items used by both the sidebar and the mobile bottom navigation bar, with role-based visibility.

| Field | Type | Description |
|---|---|---|
| `label` | `string` | Display text for the navigation item |
| `icon` | `string` | SVG icon identifier from the component library |
| `route` | `string` | Angular Router path to navigate to |
| `roles` | `Role[]` | Array of roles that can see this item (`['Employee', 'Manager', 'Admin']`) |
| `isBottomNavPrimary` | `boolean` | If true, shown in the bottom nav bar (mobile); if false, shown in "More" menu |

### TypeScript Interface

```typescript
export type Role = 'Employee' | 'Manager' | 'Admin';

export interface NavItem {
  readonly label: string;
  readonly icon: string;
  readonly route: string;
  readonly roles: Role[];
  readonly isBottomNavPrimary?: boolean;
  readonly children?: NavItem[];
}
```

### Validation Rules

- Items where `roles` does not include the current user's role must NOT be rendered to the DOM (enforcement rule #2)
- Bottom nav shows exactly 4 `isBottomNavPrimary: true` items + 1 fixed "More" tab
- The same `NavItem[]` array is the single source of truth for both sidebar and bottom nav

---

## Entity: SearchResult

**Purpose**: Represents a single result from the global search feature.

| Field | Type | Description |
|---|---|---|
| `type` | `'employee' \| 'skill' \| 'project' \| 'certification'` | The entity type of the result |
| `title` | `string` | Primary display text (e.g., employee name, skill name) |
| `subtitle` | `string` | Secondary text (e.g., department, category) |
| `route` | `string` | Angular Router path to navigate to on click |
| `metadata` | `Record<string, string>` | Additional display info (e.g., proficiency level, availability) |

### TypeScript Interface

```typescript
export interface SearchResult {
  readonly type: 'employee' | 'skill' | 'project' | 'certification';
  readonly title: string;
  readonly subtitle: string;
  readonly route: string;
  readonly metadata?: Record<string, string>;
}
```

### Validation Rules

- Search executes against NgRx state (no HTTP calls)
- Results update on every keystroke (synchronous filtering)
- Empty results show a "No results found" empty state message

---

## Entity: EmptyStateConfig

**Purpose**: Configuration for the reusable empty state component displayed when lists/tables/search have no results.

| Field | Type | Description |
|---|---|---|
| `icon` | `string` | SVG icon to display |
| `title` | `string` | Primary empty state heading |
| `message` | `string` | Descriptive message below the heading |
| `actionLabel` | `string \| null` | Optional CTA button text |
| `actionRoute` | `string \| null` | Optional route to navigate to on CTA click |

### TypeScript Interface

```typescript
export interface EmptyStateConfig {
  readonly icon: string;
  readonly title: string;
  readonly message: string;
  readonly actionLabel?: string;
  readonly actionRoute?: string;
}
```

---

## Entity: FABConfig

**Purpose**: Defines the Floating Action Button shown on specific screens at mobile viewports.

| Field | Type | Description |
|---|---|---|
| `icon` | `string` | Material icon identifier |
| `label` | `string` | Accessible label for the FAB |
| `route` | `string` | Navigation target on tap |
| `roles` | `Role[]` | Roles that can see this FAB |
| `screenRoute` | `string` | The route pattern where this FAB appears |

### TypeScript Interface

```typescript
export interface FABConfig {
  readonly icon: string;
  readonly label: string;
  readonly route: string;
  readonly roles: Role[];
  readonly screenRoute: string;
}

export const FAB_CONFIGS: FABConfig[] = [
  { icon: 'add', label: 'Add Skill', route: '/my-skills/add', roles: ['Employee', 'Manager', 'Admin'], screenRoute: '/my-skills' },
  { icon: 'add', label: 'Create Project', route: '/projects/create', roles: ['Manager', 'Admin'], screenRoute: '/projects' },
  { icon: 'upload', label: 'Upload Certification', route: '/certifications/upload', roles: ['Employee', 'Manager', 'Admin'], screenRoute: '/certifications' },
];
```

### Validation Rules

- FABs only render on mobile (`< 768px`) — controlled by `BreakpointService.isMobile$`
- FAB is removed from DOM (not hidden with CSS) when not at mobile breakpoint
- Only one FAB per screen; FABs do not appear on detail/read-only screens

---

## Entity: TypographyScale

**Purpose**: Defines the responsive typography values that scale across breakpoints.

| Style | Desktop (≥1280px) | Tablet (768–1279px) | Mobile (<768px) |
|---|---|---|---|
| H1 | 28px | 24px | 20px |
| H2 | 20px | 18px | 16px |
| Card Title | 16px | 15px | 14px |
| Body | 14px | 14px | 14px |
| Labels | 12px | 12px | 11px |

### SCSS Implementation

```scss
// _typography.scss
:root {
  --font-h1: 20px;        // mobile-first default
  --font-h2: 16px;
  --font-card-title: 14px;
  --font-body: 14px;
  --font-label: 11px;
}

@media (min-width: $breakpoint-md) {
  :root {
    --font-h1: 24px;
    --font-h2: 18px;
    --font-card-title: 15px;
    --font-label: 12px;
  }
}

@media (min-width: $breakpoint-xl) {
  :root {
    --font-h1: 28px;
    --font-h2: 20px;
    --font-card-title: 16px;
    --font-label: 12px;
  }
}
```

---

## Relationships

```
BreakpointConfig ──defines──> BreakpointService (runtime detection)
BreakpointConfig ──defines──> _breakpoints.scss (CSS media queries)
BreakpointConfig ──consumed by──> ColumnDefinition.visibleAt
BreakpointConfig ──consumed by──> BottomNavComponent (isMobile$)
BreakpointConfig ──consumed by──> FABConfig (mobile-only rendering)
BreakpointConfig ──consumed by──> ResponsiveTableComponent (table vs card)

AnimationConfig ──consumed by──> route.animations.ts
AnimationConfig ──consumed by──> progress-bar.animations.ts
AnimationConfig ──consumed by──> toast.animations.ts
AnimationConfig ──consumed by──> modal.animations.ts
AnimationConfig ──consumed by──> sidebar.animations.ts
AnimationConfig ──consumed by──> success.animations.ts

ValidationRule ──provides messages──> InlineErrorComponent
ValidationRule ──constants from──> ERROR_MESSAGES

NavItem ──renders in──> SidebarComponent (desktop/tablet)
NavItem ──renders in──> BottomNavComponent (mobile)
NavItem ──filtered by──> Role (RBAC)

SearchResult ──produced by──> GlobalSearchService
SearchResult ──displayed in──> GlobalSearchComponent
SearchResult ──queries──> NgRx store (skills, users, projects, certifications)
```

---

## State Transitions

This phase does not introduce new persistent state transitions. All models are configuration-level (compile-time constants or runtime computed values). The only runtime state changes are:

| State | Trigger | Effect |
|---|---|---|
| Breakpoint changes | Browser window resize | `BreakpointService` emits new `BreakpointName` → all subscribed components reflow |
| Search query changes | User types in global search | `GlobalSearchService` filters NgRx state → `SearchResult[]` updated |
| Filter changes | User adjusts filter controls | Filtered list updates in-place (local component state) |
| Skeleton → Content | HTTP response received | Loading flag set to false → skeleton replaced by content |
| Skeleton → Error | 10s timeout | Loading flag set to false, error flag set to true → retry/error state shown |
| Form field invalid → valid | User corrects input | Reactive form validation clears error → inline error component hides |
