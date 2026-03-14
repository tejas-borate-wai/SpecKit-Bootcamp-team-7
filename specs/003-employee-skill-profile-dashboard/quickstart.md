# Quickstart: Employee Skill Profile and Dashboard

**Feature**: 003-employee-skill-profile-dashboard  
**Date**: 2026-03-12

---

## Prerequisites

- Phase 1 (Mock Authentication & Role-Based Navigation) implemented and functional
- Phase 2 (Skill Framework & Admin) implemented — skill-categories.json and skill-definitions.json populated
- Node.js 18+ and npm 9+
- Angular CLI 17+

## Additional Dependencies

```bash
# Chart library for skill progress visualization
npm install @swimlane/ngx-charts

# ngx-charts depends on d3 (auto-installed as peer dependency)
```

## Key File Locations

| File | Purpose |
|---|---|
| `src/app/core/store/skills/skills.actions.ts` | NgRx actions for skill CRUD and data loading |
| `src/app/core/store/skills/skills.reducer.ts` | Skills state reducer |
| `src/app/core/store/skills/skills.effects.ts` | Async effects: HTTP calls via interceptor |
| `src/app/core/store/skills/skills.selectors.ts` | Memoized selectors: stale detection, profile completion, confidence, achievements |
| `src/app/core/services/skill.service.ts` | HttpClient calls for employee-skills CRUD |
| `src/app/core/services/skill-library.service.ts` | HttpClient calls for categories/definitions |
| `src/app/core/services/dashboard.service.ts` | Aggregation logic for dashboard widgets |
| `src/app/core/services/achievement.service.ts` | Badge computation from score history |
| `src/app/core/interceptors/mock-api.interceptor.ts` | Extended with employee-skills + test attempts endpoints |
| `src/app/shared/models/employee-skill.model.ts` | EmployeeSkill, SkillStatus, ProficiencyLevel types |
| `src/app/shared/models/skill-test-attempt.model.ts` | SkillTestAttempt interface |
| `src/app/shared/models/achievement.model.ts` | AchievementBadge, AchievementType types |
| `src/app/shared/models/dashboard.model.ts` | Dashboard widget data interfaces |
| `src/app/shared/components/skill-card/` | Reusable skill summary card with stale indicator |
| `src/app/shared/components/rating-badge/` | Proficiency level badge (Beginner–Expert) |
| `src/app/shared/components/stat-card/` | Dashboard metric widget |
| `src/app/shared/components/confidence-indicator/` | Rating confidence (🟢🟡🔴) display |
| `src/app/shared/components/achievement-badge/` | Achievement badge display |
| `src/app/shared/components/progress-chart/` | ngx-charts line chart wrapper |
| `src/app/shared/pipes/proficiency-label.pipe.ts` | Maps percentage → level label |
| `src/app/shared/pipes/stale-check.pipe.ts` | Checks if date > 6 months ago |
| `src/app/features/dashboard/dashboard.component.ts` | Role-switched dashboard container |
| `src/app/features/dashboard/employee-dashboard/` | Employee dashboard widgets |
| `src/app/features/dashboard/manager-dashboard/` | Manager dashboard widgets |
| `src/app/features/dashboard/admin-dashboard/` | Admin dashboard widgets |
| `src/app/features/my-skills/my-skills-list/` | Skills list with responsive table/card layout |
| `src/app/features/my-skills/add-skill/` | Add skill form with cascading dropdowns |
| `src/app/features/my-skills/skill-detail/` | Skill detail view with ratings, chart, achievements |
| `src/app/features/my-skills/edit-skill/` | Edit self-rating form |
| `src/app/features/my-skills/my-skills.routes.ts` | My-skills feature route config |
| `src/app/features/dashboard/dashboard.routes.ts` | Dashboard feature route config |
| `src/assets/mock-data/employee-skills.json` | Employee skill profile data |
| `src/assets/mock-data/skill-test-attempts.json` | Assessment attempt history |

## Build Order (Recommended)

1. **Models & Types** — Define `EmployeeSkill`, `SkillTestAttempt`, `AchievementBadge`, `ConfidenceLevel`, dashboard data interfaces
2. **Utility Functions** — `ratingToPercentage()`, `percentageToLevel()`, `computeConfidence()`, `isStale()`
3. **Mock Data** — Create/populate `employee-skills.json` and `skill-test-attempts.json`
4. **Extend MockApiInterceptor** — Add employee-skills CRUD endpoints and test-attempts query endpoints
5. **Services** — `SkillService`, `SkillLibraryService`, `AchievementService`, `DashboardService`
6. **NgRx Skills Store** — Actions, reducer, selectors (stale detection, profile completion, skill views)
7. **NgRx Skills Effects** — Wire HTTP calls through effects
8. **Shared Pipes** — `ProficiencyLabelPipe`, `StaleCheckPipe`
9. **Shared Components** — `RatingBadgeComponent`, `SkillCardComponent`, `StatCardComponent`, `ConfidenceIndicatorComponent`, `AchievementBadgeComponent`, `ProgressChartComponent`
10. **My Skills List** — Responsive table/card layout with BreakpointObserver, three-dot menu, stale indicators
11. **Add Skill** — Cascading dropdown form (Category → Subcategory → Skill), self-rating selection, duplicate validation
12. **Edit Skill** — Self-rating update form
13. **Skill Detail** — All ratings display, confidence indicator, progress line chart, achievement badges, certification badge
14. **My Skills Routes** — Wire routes with lazy loading
15. **Employee Dashboard** — Skills summary, profile completion, gap cards, cert alerts, activity feed, achievements
16. **Manager Dashboard** — Pending approvals, team strength chart, incomplete profiles, stale alert, recommendations
17. **Admin Dashboard** — Org health score, total skills, department gaps, compliance rate, common gaps, role counts
18. **Dashboard Container** — Role-switched `@switch` component
19. **Dashboard Routes** — Wire dashboard lazy route (update from Phase 1 placeholder)
20. **Unit Tests** — Level mapping, stale detection, profile completion, confidence computation, achievement logic, CRUD operations, selectors

## Running the App

```bash
# Development server
ng serve

# Navigate to http://localhost:4200/login
# Login with test credentials, then navigate to /dashboard or /my-skills
```

## Running Tests

```bash
# Unit tests
ng test

# Unit tests with coverage
ng test --code-coverage
```

## Test Credentials

| Role | Email | Password |
|---|---|---|
| Employee | priya.sharma@skillmatrix.com | password123 |
| Employee (Expert) | vikram.reddy@skillmatrix.com | password123 |
| Manager | kavitha.menon@skillmatrix.com | password123 |
| Admin | deepak.joshi@skillmatrix.com | password123 |

## Verification Checklist

### My Skills List
- [ ] Skills table renders with all 7 columns on desktop
- [ ] Tablet hides Category and Last Updated columns
- [ ] Mobile renders each skill as a card
- [ ] Stale skills show amber border and "Stale" badge
- [ ] Three-dot menu shows View Detail, Edit, Delete
- [ ] "Add Skill" button visible at top
- [ ] Admin sees "Override Rating" button; Employee/Manager do not (not in DOM)
- [ ] Employee/Manager see only their own skills
- [ ] Empty state shows "Add your first skill" CTA when no skills

### Add Skill
- [ ] Category dropdown populates from skill-categories.json
- [ ] Subcategory dropdown populates on category selection
- [ ] Skill dropdown populates on subcategory selection
- [ ] Self-rating selection works (1–4 mapped to Beginner–Expert)
- [ ] Duplicate skill → error "This skill is already in your profile."
- [ ] Empty fields → inline "This field is required"
- [ ] Saved skill appears in My Skills list with status "Draft"

### Skill Detail
- [ ] All 4 rating sources displayed (with nulls shown as "—")
- [ ] Confidence indicator shows correct color (🟢🟡🔴) based on source count
- [ ] Proficiency badge shows correct level and percentage
- [ ] "Certified" badge shown if certification exists for this skill
- [ ] Progress line chart renders with historical data points
- [ ] Best score and latest score shown side by side
- [ ] Achievement badges display correctly based on history

### Edit Skill
- [ ] Current self-rating pre-populated
- [ ] Rating update saves and refreshes lastUpdated
- [ ] Editing a stale skill clears the stale status

### Delete Skill
- [ ] Skill removed from active list on delete
- [ ] Skill linked to active project → error "This skill is linked to an active project and cannot be deleted."
- [ ] Deleted skill retained in history (accessible via data)

### Dashboards
- [ ] Employee dashboard shows all 7 widget types
- [ ] Manager dashboard shows all 7 widget types
- [ ] Admin dashboard shows all 7 widget types
- [ ] Stat cards: 4/row desktop, 2/row tablet, 1/row mobile
- [ ] Profile completion percentage is accurate
- [ ] Gap cards show "Start Assessment" CTA for unassessed skills
