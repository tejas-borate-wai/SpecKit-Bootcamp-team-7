# Shared Component Contracts: Responsive Design, Animations & Error Handling

**Feature**: 010-responsive-animations-errors
**Date**: 2026-03-13

---

## Overview

This phase introduces no new mock API endpoints. Instead, it defines contracts for shared infrastructure components, services, and SCSS foundations that all feature modules (Phases 1–9) must integrate with. These contracts ensure consistent responsive behavior, animation patterns, and error handling across the entire application.

---

## 1. BreakpointService Contract

**Location**: `src/app/core/services/breakpoint.service.ts`
**Provided in**: `root` (singleton)

### Public API

| Member | Type | Description |
|---|---|---|
| `currentBreakpoint$` | `Observable<BreakpointName>` | Emits the active breakpoint name whenever the viewport crosses a threshold. Values: `'xs'`, `'sm'`, `'md'`, `'lg'`, `'xl'`, `'2xl'` |
| `isMobile$` | `Observable<boolean>` | `true` when viewport is `xs` or `sm` (< 768px) |
| `isTablet$` | `Observable<boolean>` | `true` when viewport is `md` or `lg` (768px–1279px) |
| `isDesktop$` | `Observable<boolean>` | `true` when viewport is `xl` or `2xl` (≥ 1280px) |

### Usage Contract

- Feature components MUST inject `BreakpointService` for JS-side breakpoint logic
- Feature components MUST NOT inject `BreakpointObserver` directly
- Feature component SCSS MUST use `$breakpoint-*` variables from `_breakpoints.scss` for CSS-side media queries

---

## 2. BottomNavComponent Contract

**Location**: `src/app/shared/components/bottom-nav/`
**Selector**: `<app-bottom-nav>`

### Inputs

| Input | Type | Required | Description |
|---|---|---|---|
| `role` | `'Employee' \| 'Manager' \| 'Admin'` | Yes | Current user's role — determines which tabs are shown |

### Rendering Rules

- Rendered ONLY when `BreakpointService.isMobile$` is `true` (DOM-level absence at ≥768px)
- Shows exactly 5 tabs: 4 role-specific primary + 1 fixed "More"
- "More" tab opens a bottom-sheet with overflow nav items
- Active tab is highlighted based on current route

### Tab Configuration

| Role | Tab 1 | Tab 2 | Tab 3 | Tab 4 | Tab 5 |
|---|---|---|---|---|---|
| Employee | Dashboard | My Skills | Assessments | Notifications | More |
| Manager | Dashboard | Team Skills | Projects | Notifications | More |
| Admin | Dashboard | Frameworks | Reports | Notifications | More |

---

## 3. FABComponent Contract

**Location**: `src/app/shared/components/fab/`
**Selector**: `<app-fab>`

### Inputs

| Input | Type | Required | Description |
|---|---|---|---|
| `icon` | `string` | Yes | Material icon identifier |
| `label` | `string` | Yes | Accessible label (used as `aria-label`) |
| `route` | `string` | Yes | Route to navigate to on tap |

### Rendering Rules

- Rendered ONLY when `BreakpointService.isMobile$` is `true`
- Positioned fixed at bottom-right, above the bottom nav bar
- Minimum tap target: 56×56px (exceeds the 44px minimum)

### Screen-to-FAB Mapping

| Screen Route | FAB Icon | FAB Label | FAB Target Route |
|---|---|---|---|
| `/my-skills` | `add` | Add Skill | `/my-skills/add` |
| `/projects` | `add` | Create Project | `/projects/create` |
| `/certifications` | `upload` | Upload Certification | `/certifications/upload` |

---

## 4. SkeletonLoaderComponent Contract

**Location**: `src/app/shared/components/skeleton-loader/`
**Selector**: `<app-skeleton-loader>`

### Inputs

| Input | Type | Required | Default | Description |
|---|---|---|---|---|
| `type` | `'card' \| 'table-row' \| 'form' \| 'chart' \| 'list-item'` | Yes | — | Shape of the skeleton to render |
| `count` | `number` | No | `1` | Number of skeleton items to render |
| `columns` | `number` | No | `4` | Number of columns for `table-row` type |

### Rendering Rules

- Skeleton shapes match the content they replace (cards, table rows, etc.)
- CSS shimmer animation applied via global `.skeleton` class
- Shimmer disabled when `prefers-reduced-motion: reduce` is active
- Must be replaced by content when data loads, or by error/retry state after 10s timeout

---

## 5. EmptyStateComponent Contract

**Location**: `src/app/shared/components/empty-state/`
**Selector**: `<app-empty-state>`

### Inputs

| Input | Type | Required | Description |
|---|---|---|---|
| `icon` | `string` | No | SVG icon to display |
| `title` | `string` | Yes | Primary heading text |
| `message` | `string` | Yes | Descriptive message |
| `actionLabel` | `string` | No | Optional CTA button text |
| `actionRoute` | `string` | No | Optional route for CTA navigation |

### Outputs

| Output | Type | Description |
|---|---|---|
| `actionClick` | `EventEmitter<void>` | Emits when the CTA button is clicked (if present) |

### Usage

Every filtered list, search result area, and data table MUST show this component when no items match. A blank area MUST never be displayed.

---

## 6. InlineErrorComponent Contract

**Location**: `src/app/shared/components/inline-error/`
**Selector**: `<app-field-error>`

### Inputs

| Input | Type | Required | Description |
|---|---|---|---|
| `control` | `AbstractControl \| null` | Yes | The reactive form control to observe |
| `errorMessages` | `Record<string, string>` | Yes | Map of Angular validator error keys to display messages |

### Rendering Rules

- Shows error messages ONLY when `control.touched && control.invalid`
- Renders all applicable error messages simultaneously (multiple errors on one field)
- Each error displayed with an error icon + red text (`--color-rejected`)
- Error clears automatically when the control value becomes valid

---

## 7. GlobalSearchComponent Contract

**Location**: `src/app/shared/components/global-search/`
**Selector**: `<app-global-search>`

### Behavior

- Rendered in the header bar
- Desktop: visible search input (full width in header center area)
- Tablet: hidden behind a search icon; tap reveals the input
- Mobile: not visible in header (search accessible via "More" bottom sheet or dedicated screen)
- Filters against NgRx state: employees by skill name, department, proficiency level, certification status, availability
- Results update as the user types (keystroke-by-keystroke, no submit button)
- Results shown in a dropdown panel below the search input
- Empty results show "No results found for your search."
- Clicking a result navigates to the relevant screen and closes the search panel

### Outputs

| Output | Type | Description |
|---|---|---|
| `resultSelected` | `EventEmitter<SearchResult>` | Emits the selected search result for navigation |

---

## 8. ResponsiveTableComponent Contract

**Location**: `src/app/shared/components/responsive-table/`
**Selector**: `<app-responsive-table>`

### Inputs

| Input | Type | Required | Description |
|---|---|---|---|
| `data` | `any[]` | Yes | Array of row data objects |
| `columns` | `ColumnDefinition[]` | Yes | Column definitions with responsive visibility rules |
| `trackBy` | `(item: any) => any` | Yes | Track-by function for rendering |

### Outputs

| Output | Type | Description |
|---|---|---|
| `rowAction` | `EventEmitter<{ action: string; row: any }>` | Emits when a row action is triggered |

### Rendering Rules

- Desktop (≥1280px): Full table with all columns, sorting enabled
- Tablet (768–1279px): Horizontally scrollable table, columns filtered by `visibleAt`
- Mobile (<768px): Expandable card list — primary column as card title, expand to show all fields

---

## 9. SwipeDirective Contract

**Location**: `src/app/shared/directives/swipe.directive.ts`
**Selector**: `[appSwipe]`

### Outputs

| Output | Type | Description |
|---|---|---|
| `swipeLeft` | `EventEmitter<void>` | Emits when a left swipe gesture is detected |
| `swipeRight` | `EventEmitter<void>` | Emits when a right swipe gesture is detected |

### Behavior

- Horizontal threshold: 50px minimum
- Vertical restraint: 100px maximum (prevents confusion with scroll)
- Only active on mobile (`< 768px`); no-op on desktop
- Does NOT call `preventDefault()` on touch events (preserves native scrolling)

---

## 10. Animation Triggers Contract

### Route Transition Animation

**Trigger**: `@routeAnimations`
**Applied to**: `AppComponent` wrapper div around `<router-outlet>`

| Transition | Duration | Effect |
|---|---|---|
| `* <=> *` | 300ms | Outgoing view fades out + slides up 8px; incoming view fades in + slides down 8px |

### Progress Bar Fill Animation

**Trigger**: `@progressFill`
**Applied to**: Progress bar elements (score card, profile completion)

| Transition | Duration | Effect |
|---|---|---|
| `void => *` | 600ms | Width animates from 0% to final percentage |

### Toast Animation

**Trigger**: `@toastSlide`
**Applied to**: Toast notification component

| Transition | Duration | Effect |
|---|---|---|
| `void => *` (enter) | 250ms | Slides in from right edge (desktop) or top (mobile) |
| `* => void` (leave) | 250ms | Slides out + fades |

### Sidebar Collapse Animation

**Trigger**: `@sidebarCollapse`
**Applied to**: Sidebar component

| Transition | Duration | Effect |
|---|---|---|
| `expanded <=> collapsed` | 200ms | Width transitions 240px ↔ 64px |

### Modal/Bottom Sheet Animation

**Trigger**: `@modalSlide`
**Applied to**: Modal and bottom sheet containers

| Transition | Duration | Effect |
|---|---|---|
| `void => *` (enter) | 300ms | Slides up from bottom edge |
| `* => void` (leave) | 300ms | Slides down to bottom edge |

### Success Animation

**Trigger**: `@successReveal`
**Applied to**: Assessment completion score card

| Transition | Duration | Effect |
|---|---|---|
| `void => *` | 500ms | Scale from 0.8 to 1.0 + fade in |

---

## 11. SCSS Foundation Contract

### Required Imports

All feature component SCSS files MUST include:

```scss
@use 'styles/breakpoints' as bp;
@use 'styles/variables' as vars;
```

### Available Mixins

```scss
// Responsive media query mixins
@mixin mobile { @media (max-width: #{bp.$breakpoint-md - 0.02px}) { @content; } }
@mixin tablet { @media (min-width: bp.$breakpoint-md) and (max-width: #{bp.$breakpoint-xl - 0.02px}) { @content; } }
@mixin desktop { @media (min-width: bp.$breakpoint-xl) { @content; } }
@mixin breakpoint-up($bp) { @media (min-width: $bp) { @content; } }
@mixin breakpoint-down($bp) { @media (max-width: #{$bp - 0.02px}) { @content; } }
```

### Available CSS Custom Properties

All spacing, typography, and layout values are available as CSS custom properties set at `:root` and overridden per breakpoint via media queries in `styles.scss`.

---

## 12. Error Message Constants Contract

**Location**: `src/app/core/constants/error-messages.ts`

All error messages MUST be referenced from this file. Hardcoded error strings in component templates or TypeScript files are prohibited. This ensures verbatim compliance with Section 23 of requirement.md and enables easy auditing.

```typescript
import { ERROR_MESSAGES } from '@core/constants/error-messages';

// Usage in component
this.errorMessages = {
  required: ERROR_MESSAGES.required,
  fileFormat: ERROR_MESSAGES.fileFormat,
};
```
