# Research: Employee Skill Profile and Dashboard

**Feature**: 003-employee-skill-profile-dashboard  
**Date**: 2026-03-12  
**Status**: Complete — all NEEDS CLARIFICATION resolved

---

## Decision 1: Chart Library for Skill Progress Visualization

**Decision**: Use ngx-charts (`@swimlane/ngx-charts`) for line-chart progress visualization.

**Rationale**: ngx-charts is a pure Angular charting library built on D3.js with native Angular component architecture. It supports standalone components, provides responsive container resizing, built-in animations, and Angular-idiomatic data binding via `@Input()`. Line charts natively support the time-series data pattern needed for skill progress tracking (date → score %).

**Key Configuration**:
- `ngx-charts-line-chart` component with `[results]` input accepting `{ name, series: [{ name, value }] }` format
- Enable animations via `[animations]="true"` — respects `prefers-reduced-motion` when combined with Angular Animations
- Responsive: `[view]` property set dynamically via BreakpointObserver (desktop full-size, mobile 250px max height)
- X-axis: assessment dates; Y-axis: score percentage (0–100%)
- Custom tooltip showing: date, score, level achieved

**Alternatives Considered**:
| Approach | Verdict |
|---|---|
| Chart.js (via ng2-charts) | Excellent library but Canvas-based — less accessible than SVG; requires wrapper `ng2-charts` which adds a dependency layer |
| D3.js directly | Too low-level for the scope; would require substantial custom code for charts that ngx-charts provides out-of-box |
| ECharts (via ngx-echarts) | Feature-rich but heavier bundle; overkill for simple line charts |
| Custom SVG chart | Maximum control but violates YAGNI; significant effort for what is essentially a standard line chart |

---

## Decision 2: NgRx Skills State Architecture

**Decision**: Single `skills` feature state slice with sub-properties for the current user's skills, skill library (categories/definitions), and dashboard aggregations.

**Rationale**: A unified feature slice avoids state fragmentation while keeping related skill data colocated. Selectors derive computed values (stale detection, profile completion, achievement badges) from the base state. Dashboard widget data is computed via memoized selectors rather than stored separately — this prevents data duplication and ensures consistency.

**State Shape**:
```typescript
interface SkillsState {
  mySkills: EmployeeSkill[];           // Current user's skills
  allEmployeeSkills: EmployeeSkillRecord[]; // All employees' skills (for manager/admin dashboards)
  skillCategories: SkillCategory[];     // From skill-categories.json (read-only)
  skillDefinitions: SkillDefinition[];  // From skill-definitions.json (read-only)
  testAttempts: SkillTestAttempt[];     // Current user's test history
  loading: boolean;
  error: string | null;
}
```

**Selector Strategy**:
- `selectMySkills` → base skill list for current user
- `selectMyActiveSkills` → filters out soft-deleted skills
- `selectMyStaleSkills` → filters where lastUpdated > 6 months
- `selectProfileCompletion` → computed: (assessed / total) × 100
- `selectSkillById(skillId)` → single skill for detail view
- `selectSkillProgress(skillId)` → test attempts mapped to chart data
- `selectAchievements(skillId)` → computed badges from attempt history
- `selectConfidenceLevel(skill)` → count non-null rating sources
- `selectDashboardWidgets` → role-specific aggregations

**Alternatives Considered**:
| Approach | Verdict |
|---|---|
| Separate state slices per concern (mySkills, library, dashboard) | Over-fragmented for 1 feature; increases boilerplate; cross-slice selectors add complexity |
| ComponentStore for local state | Constitution mandates NgRx for global shared state; ComponentStore acceptable only for form/UI state |
| Signals-based reactive state | Not yet standard in NgRx 17; can be used for component-level reactivity but store must be NgRx |

---

## Decision 3: Stale Skill Detection Strategy

**Decision**: Compute staleness at selector level by comparing `skill.lastUpdated` against current date minus 6 months. No background timer or scheduled check.

**Rationale**: Since data resets on refresh (mock-first architecture), stale detection is a pure function of `lastUpdated` date vs current time. Computing it in a selector ensures it's always up-to-date when the view renders. The mock data should include pre-configured stale skills (lastUpdated dates older than 6 months) for demo purposes.

**Implementation**:
```typescript
// Selector logic (pseudo)
const isStale = (lastUpdated: string): boolean => {
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
  return new Date(lastUpdated) < sixMonthsAgo;
};
```

**Visual Indicators**:
- Stale skills: amber border (`--color-stale-border`), amber "Stale" badge
- Stale skills visible in profile but excluded from project candidate matching (enforced in Phase 7)
- Clearing stale: updating self-rating or receiving manager review sets `lastUpdated` to now

**Alternatives Considered**:
| Approach | Verdict |
|---|---|
| Background interval check (setInterval) | Unnecessary complexity; staleness is date-based, not event-based |
| Server-side flag in mock data | Would require interceptor to periodically update data; over-engineered for mock app |
| Pipe-based calculation | Pipes are for display transformation; staleness affects business logic (matching exclusion), so it belongs in selectors |

---

## Decision 4: Achievement Badge Computation

**Decision**: Compute achievement badges on-the-fly from score history in a dedicated `AchievementService` called by NgRx effects or selectors. Badges are derived data, not persisted.

**Rationale**: Achievement badges ("First Assessment", "Reached Advanced", "Improved by 20%") can be deterministically computed from `skill-test-attempts.json` data. Storing them would create redundancy and risk inconsistency. Computing at render time from the source data ensures accuracy.

**Badge Definitions**:
| Badge | Condition | Data Source |
|---|---|---|
| First Assessment | At least 1 attempt exists for the skill | `skill-test-attempts.json` filtered by userId + skillId |
| Reached Advanced | Any attempt score ≥ 66% (Advanced threshold) | Highest score in attempts for the skill |
| Improved by 20% | Score improved by ≥ 20 percentage points across any two attempts | Compare first attempt score to best subsequent score |

**Implementation Pattern**:
```typescript
computeAchievements(attempts: SkillTestAttempt[]): AchievementBadge[] {
  const badges: AchievementBadge[] = [];
  if (attempts.length > 0) badges.push({ type: 'first-assessment', label: 'First Assessment' });
  const maxScore = Math.max(...attempts.map(a => a.score));
  if (maxScore >= 66) badges.push({ type: 'reached-advanced', label: 'Reached Advanced' });
  if (attempts.length >= 2) {
    const firstScore = attempts[0].score; // sorted by date ascending
    if (maxScore - firstScore >= 20) badges.push({ type: 'improved-20', label: 'Improved by 20%' });
  }
  return badges;
}
```

**Alternatives Considered**:
| Approach | Verdict |
|---|---|
| Persist badges in employee-skills.json | Creates data redundancy; must be kept in sync with attempts data |
| NgRx selector only | Acceptable but computation involves sorting/filtering; service encapsulates logic more cleanly |
| Server-side computation | No server exists; must be client-side |

---

## Decision 5: Dashboard Widget Architecture

**Decision**: Use a container/presenter pattern. `DashboardComponent` is a role-switched container that renders `EmployeeDashboardComponent`, `ManagerDashboardComponent`, or `AdminDashboardComponent` based on the user's role from the NgRx session store.

**Rationale**: Each role's dashboard has fundamentally different widgets and data requirements. A single component with 3 sets of conditionals would be unmaintainable. Separate components per role keep each dashboard focused and independently testable. The parent `DashboardComponent` simply uses `@switch` on the user role.

**Role Rendering**:
```typescript
// dashboard.component.html
@switch (userRole()) {
  @case ('Employee') { <app-employee-dashboard /> }
  @case ('Manager') { <app-manager-dashboard /> }
  @case ('Admin') { <app-admin-dashboard /> }
}
```

**Widget Components** (shared, reusable):
- `StatCardComponent` — numeric metric with title, value, optional trend indicator
- `SkillCardComponent` — skill summary with level badge, rating, stale indicator
- `ProgressChartComponent` — ngx-charts line chart wrapper
- `ActivityFeedComponent` — list of recent action items

**Data Flow**: Each dashboard sub-component dispatches actions to load its specific data via NgRx effects → selectors populate the template.

**Alternatives Considered**:
| Approach | Verdict |
|---|---|
| Single component with `*ngIf` blocks | Unmaintainable; violates single-responsibility; hard to test individual widget sets |
| Dynamic component loading (`ViewContainerRef`) | Over-engineered for 3 known roles; `@switch` is simpler and type-safe |
| Route-based role dashboards (/dashboard/employee) | Would require separate routes and guards; spec says single /dashboard route |

---

## Decision 6: Skill CRUD via MockApiInterceptor

**Decision**: Extend the existing `MockApiInterceptor` with endpoints for employee-skills CRUD and skill-test-attempts reads. CRUD operations mutate in-memory arrays.

**Rationale**: Constitution principle I requires all data flow through HttpClient + interceptor. The interceptor pattern from Phase 1 already handles auth endpoints. This feature adds skill-specific endpoints following the same URL convention pattern.

**New Interceptor Endpoints**:
| Method | URL Pattern | JSON Source | Operation |
|---|---|---|---|
| `GET` | `/api/employee-skills/:userId` | employee-skills.json | Get skills for a user |
| `POST` | `/api/employee-skills/:userId/skills` | employee-skills.json | Add skill to user's profile |
| `PUT` | `/api/employee-skills/:userId/skills/:skillId` | employee-skills.json | Update skill (self-rating) |
| `DELETE` | `/api/employee-skills/:userId/skills/:skillId` | employee-skills.json | Soft-delete skill |
| `GET` | `/api/skill-test-attempts/:userId` | skill-test-attempts.json | Get all test attempts for user |
| `GET` | `/api/skill-test-attempts/:userId/:skillId` | skill-test-attempts.json | Get attempts for specific skill |
| `GET` | `/api/certifications/:userId` | certifications.json | Get user's certifications |
| `GET` | `/api/project-assignments/:userId` | project-assignments.json | Check project links for delete constraint |

**RBAC at Interceptor Level**:
- Employee/Manager: only access own `userId` data; 403 for other users
- Admin: access any `userId`

**Alternatives Considered**:
| Approach | Verdict |
|---|---|
| Direct JSON import in service | Violates constitution enforcement rule #1 |
| Separate interceptor per feature | Over-fragmented; single interceptor with URL routing is simpler |
| LocalStorage as data store | Would add persistence across refresh (contradicts "resets on refresh" design) |

---

## Decision 7: Responsive Skill Table / Card Layout

**Decision**: Use a single `MySkillsListComponent` with BreakpointObserver to switch between three display modes: full table (desktop), condensed table (tablet), and card list (mobile).

**Rationale**: The spec requires three distinct layouts per breakpoint (FR-005). Using BreakpointObserver from Angular CDK allows reactive layout switching in a single component. The template uses `@if` blocks conditioned on a breakpoint signal/observable to render the appropriate layout.

**Layout Modes**:
| Breakpoint | Layout | Columns/Cards |
|---|---|---|
| Desktop (≥1024px) | `mat-table` | Skill, Category, Level Badge, Rating %, Status, Last Updated, Actions |
| Tablet (768–1023px) | `mat-table` (condensed) | Skill, Level Badge, Rating %, Status, Actions (Category + Last Updated hidden) |
| Mobile (<768px) | Card list | Each row as a card: Skill Name (bold), Level Badge pill, Rating %, Status pill, three-dot menu |

**Touch Integration**:
- Swipe left on mobile card → reveals Delete action (per constitution touch rules 18.4)
- FAB on mobile → "Add Skill" (per constitution 18.4)
- Three-dot menu → View Detail, Edit, Delete

**Alternatives Considered**:
| Approach | Verdict |
|---|---|
| CSS-only responsive table | Limited control over column visibility/reflow; hard to switch to card layout |
| Separate components per breakpoint | Code duplication; would need to keep 3 templates in sync |
| PrimeNG `p-table` with responsive mode | Works but locks into PrimeNG; we chose Angular Material in Phase 1 |

---

## Decision 8: Profile Completion Calculation

**Decision**: Compute profile completion as a memoized NgRx selector: `(skills with at least one assessment attempt) / (total available skill definitions) × 100`.

**Rationale**: Profile completion is derived data that depends on the employee's assessed skills vs the total skill library. Computing it in a selector ensures it updates automatically when skills are added/removed. The denominator uses the total skill definitions count from `skill-definitions.json`.

**Formula**:
```
profileCompletion = (assessedSkills.length / totalSkillDefinitions.length) × 100
```

Where `assessedSkills` = skills in the employee's profile that have at least one test attempt or a non-null systemRating.

**Edge Cases**:
- No skills in profile → 0%
- Total skill definitions is 0 → 0% (avoid division by zero)
- All skills assessed → 100%

**Alternatives Considered**:
| Approach | Verdict |
|---|---|
| Count by self-rating only | Wouldn't capture system-assessed skills; less accurate |
| Store completion % in mock data | Redundant; would require sync whenever skills change |
| Count skills added (not assessed) | Spec says "skills assessed", not just added; assessment-based is more meaningful |
