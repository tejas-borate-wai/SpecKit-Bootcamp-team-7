# SpecKit – Step-by-Step Execution Plan
# Project: Skill Matrix Application (Frontend SPA with Mock Data)

---

## HOW THIS WORKS

- All commands run in **GitHub Copilot Chat in Agent Mode**
- Each `/speckit.specify` creates a new numbered folder: `specs/001-...`, `specs/002-...`, etc.
- `/speckit.plan` and `/speckit.tasks` run inside that same folder (no new folder)
- `/speckit.implement` runs last, per feature, to generate actual code
- Constitution runs **once** for the whole project

---

## WHO RUNS WHAT

| Command | Run By | Purpose |
|---|---|---|
| `/speckit.constitution` | **Project Manager** | Sets up the project foundation, core principles, and tech stack |
| `/speckit.specify` | **Business Analyst** | Defines the feature requirements, screens, rules, and data contracts |
| `/speckit.plan` | **Developer** | Creates the technical design and architecture plan for the feature |
| `/speckit.tasks` | **Developer** | Breaks the plan into actionable, ordered implementation tasks |
| `/speckit.implement` | **Developer** | Executes the tasks and generates the actual code |
| `/speckit.clarify` | **Business Analyst** | Asks targeted questions to remove ambiguity from the spec |
| `/speckit.analyze` | **QA** | Cross-checks spec, plan, and tasks for consistency and completeness |
| `/speckit.checklist` | **QA** | Generates a custom feature checklist to validate requirements |

---

## CROSS-REFERENCES FOR ALL PHASES

> **Every `/speckit.specify` command below implicitly requires the AI to also consult requirement.md for the following sections. You do NOT need to paste these into each command — just ensure requirement.md is in the workspace.**

| Requirement Section | What it provides | Applies to |
|---|---|---|
| Section 7 — RBAC Permission Matrix | 23-row permission table defining exact feature access per role (Employee, Manager, Admin) | ALL phases (enforce at UI + route guards) |
| Section 7A — Role-Based UI, Navigation, and Access Rules | Sidebar per role, 30-screen route inventory, element visibility rules, route guard matrix, post-login redirect, 403 handling | ALL phases (especially route setup and UI rendering) |
| Section 4 — Skill Rating Mechanism | Two-layer formula (System Rating + Final Rating), 4 rating sources, peer validation workflow, confidence indicator | Phases 4, 5, 6 |
| Section 18 — UI Requirements & Responsive Design | 7-subsection responsive spec: breakpoints, layout per breakpoint, component behavior, touch rules, typography, icons, Angular implementation notes | ALL phases (every screen must follow Section 18) |
| Section 22 — Mock Data Files | 10 JSON files in /assets/mock-data/ with field specs, mock data rules, interceptor strategy | ALL phases (data source for everything) |
| Section 23 — Error States & Validation Rules | Error messages and validation rules for assessments, certifications, projects, skills, matching, general | ALL phases (UI error handling) |
| Section 20 — Testing Requirements | Unit test coverage requirements for all critical business logic | ALL phases (each phase must include tests) |
| Section 21 — Technology Stack | Angular 17+, TypeScript strict, NgRx, Angular Material/PrimeNG, ngx-charts/Chart.js, Jasmine+Karma | ALL phases (stack consistency) |

---

## PHASE 0 — PROJECT SETUP runs once

### Step 0.1 — Constitution (run once)

> 👤 **Run by: Project Manager**

```
/speckit.constitution Please refer to requirement.md to establish the project constitution for the Skill Matrix Application.

Project Name: Skill Matrix Application (Frontend SPA with Mock Data)
Stack: Angular 17+ SPA, TypeScript (strict mode), NgRx (state management), Angular Material or PrimeNG (UI components), ngx-charts or Chart.js (charts), Angular Animations (@angular/animations), Angular Router (route guards), Angular HttpClient (mock interceptors), Jasmine + Karma (unit testing), Cypress optional (E2E), Angular CLI (build tool)

Data Strategy: Frontend-only application — NO real backend. All data served from JSON files in /assets/mock-data/ via Angular HttpClient interceptors simulating real API calls. CRUD operations update in-memory data during session; data resets on page refresh.

Mock Data Files (10 files in /assets/mock-data/):
users.json, skill-categories.json, skill-definitions.json, skill-exams.json, employee-skills.json, certifications.json, projects.json, project-assignments.json, skill-test-attempts.json, notifications.json

Roles: Employee, Manager, Admin (3 roles — no hierarchy beyond this; no backend role management)
Auth: Mock login against users.json; role stored in localStorage/NgRx; no JWT/tokens — just session simulation

Core principles to enforce:
1. Mock-First Architecture: all data flows through Angular HttpClient interceptors reading from JSON files; every service must use HttpClient (not direct JSON imports) so that switching to a real backend later requires only removing the interceptor and changing URLs
2. RBAC at UI Layer: every route has an Angular CanActivate guard checking the logged-in user's role from NgRx store or localStorage; sidebar menu items are conditionally rendered in DOM (not just hidden with CSS) — unauthorized items must not exist in the HTML; follow Section 7A exactly for sidebar, routes, element visibility, and guards
3. State Management: use NgRx for global state (user session, skill data, notifications); local component state for forms and UI-only concerns
4. Responsive Design: mobile-first approach; follow Section 18 of requirement.md for all 7 subsections (breakpoints, layout behavior, component behavior, touch rules, typography, icons, Angular CDK BreakpointObserver); test at 375px, 768px, 1280px, 1440px
5. Test Coverage: every feature must have Jasmine + Karma unit tests covering business logic (rating calculations, matching algorithm, level mapping, validation rules); refer to Section 20 of requirement.md
6. Error Handling: all error states from Section 23 must be implemented; real-time inline form validation; toast notifications for success; spinner/skeleton for loading states; never show blank pages
7. Accessibility: visible labels on all form fields; keyboard navigation supported; color never the sole indicator (always accompany with icon or text)
8. Component Architecture: use Angular standalone components or modules; shared components for reusable UI (skill cards, rating badges, stat cards, tables); lazy-load feature modules per route group
9. Consistent Design System: unified color scheme, typography scale (Section 18.5), status colors (Approved=Green, Pending=Amber, Rejected=Red, Draft=Grey, Stale=Amber border), proficiency badges (Beginner/Intermediate/Advanced/Expert)
10. Code Quality: TypeScript strict mode, no any types, ESLint configured, SCSS for styles (no inline responsive styles in TypeScript)
```

**Output:** `.specify/memory/constitution.md` filled — no numbered folder created.

---

## PHASE 1 — FEATURE: Mock Authentication & Role-Based Navigation
> Covers: Login screen, mock auth against users.json, session management, dynamic sidebar, route guards, post-login redirect, unauthorized page
> req.md Sections: 7A (all subsections), 22 (users.json)

### Step 1.1 — Specify

> 👤 **Run by: Business Analyst**

```
/speckit.specify Mock Authentication and Role-Based Navigation for Skill Matrix Application.

This is a frontend-only Angular 17 app using mock data. There is no real backend or JWT.

Screens: Login (/login), Unauthorized (/unauthorized), App Shell (sidebar + header + content area)

Login Flow:
- Login screen with email + password fields
- On submit, match credentials against users.json mock data file
- If match found → store user object (id, name, email, role, department, avatarUrl) in NgRx store AND localStorage for persistence
- Redirect based on role: Employee → /dashboard, Manager → /dashboard, Admin → /dashboard (same route, different dashboard component rendered per role — Section 7A.5)
- If no match → show error "Invalid email or password"
- If fields empty → inline validation "This field is required"

Session Management:
- User session persists in localStorage across page refresh
- On app init, check localStorage for existing session → if found, restore NgRx state and skip login
- Logout: clear NgRx state + localStorage → redirect to /login

Route Guards (Section 7A.4):
- AuthGuard: checks if user is authenticated (exists in store/localStorage) → if not, redirect to /login
- RoleGuard: accepts array of allowed roles → if user's role not in list, redirect to /unauthorized
- Route guard matrix (from Section 7A.4):
    /dashboard → AuthGuard → Employee, Manager, Admin
    /my-skills/** → AuthGuard → Employee, Manager, Admin
    /assessments/** → AuthGuard → Employee, Manager, Admin
    /certifications/** → AuthGuard → Employee, Manager, Admin
    /notifications → AuthGuard → Employee, Manager, Admin
    /team/** → AuthGuard + RoleGuard(['Manager','Admin']) → Manager, Admin
    /projects/** → AuthGuard + RoleGuard(['Manager','Admin']) → Manager, Admin
    /reports → AuthGuard + RoleGuard(['Manager','Admin']) → Manager, Admin
    /reports/heatmap → AuthGuard + RoleGuard(['Admin']) → Admin only
    /admin/** → AuthGuard + RoleGuard(['Admin']) → Admin only

Unauthorized Page (/unauthorized):
- Shows "Access Denied. You do not have permission to view this page."
- "Go to Dashboard" button → navigates to /dashboard

Dynamic Sidebar (Section 7A.1):
- Sidebar renders dynamically based on role
- Unauthorized menu items must NOT exist in the DOM (not just hidden with CSS)
- EMPLOYEE sidebar: Dashboard, My Skills, Assessments, Certifications, Notifications
- MANAGER sidebar: all Employee items + Team Skills, Skill Validation Queue, Project Matching, Projects, Team Builder
- ADMIN sidebar: all Manager items + Reports, Org Skill Heatmap, Skill Framework (Categories, Subcategories, Skill Definitions), Rating Configuration

Top Header Bar:
- Logo + Page Title (left), Search bar (center, desktop only), Notifications bell with unread count badge + User avatar with dropdown (right)
- User dropdown: profile name, role badge, Logout button

Responsive behavior: Follow Section 18.2 for sidebar (desktop=240px fixed, tablet=64px icon-only, mobile=hamburger drawer) and header layout per breakpoint.

Mock Data: users.json — fields: id, name, email, password, role (Employee/Manager/Admin), department, avatarUrl
Minimum 10 users: 6 employees, 2 managers, 1 admin, 1 with Expert-level skills

Stack: Angular 17, NgRx, Angular Router, Angular Material or PrimeNG, SCSS
```

### Step 1.2 — Plan

> 👤 **Run by: Developer**

```
/speckit.plan use Angular 17, TypeScript strict, NgRx, Angular Material or PrimeNG, Angular Router with CanActivate guards, SCSS, mock data from JSON files via HttpClient interceptors
```

### Step 1.3 — Tasks

> 👤 **Run by: Developer**

```
/speckit.tasks
```

---

## PHASE 2 — FEATURE: Skill Framework & Structure (Admin)
> Covers: Skill categories CRUD, subcategories CRUD, skill definitions CRUD, proficiency framework, rating weight configuration
> req.md Sections: 2 (Skill Structure), 3 (Proficiency Framework), 7 (Admin controls for framework), 7A.2 (admin routes)

### Step 2.1 — Specify

> 👤 **Run by: Business Analyst**

```
/speckit.specify Skill Framework and Structure Management for Skill Matrix Application — Admin functionality.

This is a frontend-only Angular 17 app. All data read from and written to in-memory copies of JSON mock data files.

Hierarchy: Skill Category → Sub-Category → Skill Name → Skill Definition (Section 2)

Screens (Admin only — blocked by RoleGuard(['Admin'])):
- Skill Framework – Categories (/admin/skill-framework/categories)
- Skill Framework – Subcategories (/admin/skill-framework/subcategories)
- Skill Framework – Definitions (/admin/skill-framework/skills)
- Rating Configuration (/admin/rating-config)

Skill Category Management:
- List all categories with name and description
- Add new category (name + description) — name must be unique
- Edit category name/description
- Cannot delete a category if any employee has skills linked to it — show error "Cannot delete: skills are linked to this category"
- Categories are the top-level groups: Development, QA, Cloud, DevOps, Data Engineering, AI/ML, Communication, Project Management (pre-populated in mock data)

Subcategory Management:
- List subcategories grouped by parent category
- Add subcategory under a category (name + parent categoryId)
- Edit subcategory
- Pre-populated examples: Development → Frontend, Backend, Mobile; Cloud → AWS, Azure, Google Cloud; DevOps → CI/CD, Containerization, Infrastructure

Skill Definition Management:
- List all skills grouped by category and subcategory
- Add skill: select category → subcategory → enter skill name + description
- Edit skill name/description
- Skill name must be unique within its subcategory — duplicate rejected with "This skill already exists in this subcategory"
- Pre-populated skills: React, Angular, Vue, HTML, CSS, JavaScript, TypeScript, Java, Node.js, Python, .NET, Spring Boot, Flutter, React Native, Docker, Kubernetes, Jenkins, Terraform, SQL, PostgreSQL, MongoDB, Redis, etc.

Proficiency Framework (Section 3):
- Display proficiency levels table: Beginner(1), Intermediate(2), Advanced(3), Expert(4)
- Each level has: Score, Description, Example Criteria
- Admin can edit descriptions and criteria — level names and scores are fixed (1–4)
- Level thresholds (mapped from percentage): 0–40% → Beginner, 41–65% → Intermediate, 66–85% → Advanced, 86–100% → Expert

Rating Weight Configuration (Section 4):
- Admin configures weights for the Final Rating formula:
    Self Rating weight (default 0.20)
    Manager Rating weight (default 0.30)
    Peer Rating weight (default 0.15)
    System Rating weight (default 0.35)
- All weights must sum to 1.00 (100%) — validate on save
- Show real-time sum as admin adjusts sliders or inputs
- Save updates in-memory (session only)

Mock Data Files:
- skill-categories.json: categoryId, categoryName, subCategories[{subCategoryId, subCategoryName}]
- skill-definitions.json: skillId, skillName, categoryId, subCategoryId, description

Stack: Angular 17, NgRx, Angular Material or PrimeNG, SCSS, mock data via interceptors
```

### Step 2.2 — Plan

> 👤 **Run by: Developer**

```
/speckit.plan use Angular 17, TypeScript strict, NgRx, Angular Material or PrimeNG, SCSS, mock data from JSON files via HttpClient interceptors
```

### Step 2.3 — Tasks

> 👤 **Run by: Developer**

```
/speckit.tasks
```

---

## PHASE 3 — FEATURE: Employee Skill Profile & Dashboard
> Covers: Add/edit/delete skills, self-rating, skill profile tabs, skill progress tracking, employee dashboard widgets, profile completion, skill expiry, achievement badges
> req.md Sections: 6 (Employee Skill Profile), 13 (Progress Tracking), 3 (Proficiency levels display)

### Step 3.1 — Specify

> 👤 **Run by: Business Analyst**

```
/speckit.specify Employee Skill Profile and Dashboard for Skill Matrix Application.

This is a frontend-only Angular 17 app. All data from /assets/mock-data/ JSON files via HttpClient interceptors.

Screens (All roles — Employee, Manager, Admin):
- Dashboard (/dashboard) — role-specific rendering (Section 7A.5)
- My Skills List (/my-skills)
- Skill Detail (/my-skills/:skillId)
- Add Skill (/my-skills/add)
- Edit Skill (/my-skills/:skillId/edit)

Employee Dashboard Widgets (Section 6 — Dashboard Screens by Role):
- Skills list with rating + level + badge
- Profile completion percentage (skills assessed / total available)
- Skills not yet assessed shown as gap cards with "Start Assessment" CTA
- Certification badges and expiry alerts
- Skill progress chart (line chart per skill)
- Recent activity feed (last 5 actions: assessments taken, certs uploaded)
- Achievement badges earned

Manager Dashboard Widgets:
- Pending skill approvals count
- Team skill strength summary (chart: skill coverage across team)
- Employees with incomplete profiles
- Stale skills needing team attention
- Project skill match recommendations
- Team availability overview
- Recent team activity feed

Admin Dashboard Widgets:
- Organization-wide skill health score
- Total skills tracked across all employees
- Skill gap summary by department
- Org skill heatmap (top-level view)
- Certification compliance rate
- Most common skill gaps
- User count by role

My Skills List (/my-skills):
- Table showing: Skill | Category | Level Badge | Rating % | Status | Last Updated | Actions
- Actions per row: View Detail, Edit, Delete (via three-dot menu)
- "Add Skill" button at top
- UI Element Visibility (Section 7A.3): Employee/Manager see own skills only; Admin can see/edit/delete any skill; "Override Rating" button visible only for Admin
- Responsive: Desktop=full table, Tablet=reduced columns, Mobile=card list (Section 18.3)

Add Skill (/my-skills/add):
- Employee selects from global skill library: Category → Subcategory → Skill (cascading dropdowns)
- Sets self-rating (Beginner / Intermediate / Advanced / Expert via 1–4 scale)
- Error if skill already exists in profile: "This skill is already in your profile." (Section 23)
- On save: skill added to employee-skills.json in-memory with status, selfRating, lastUpdated

Edit Skill:
- Can update self-rating

Delete Skill (Section 6):
- Employee can remove a skill from active profile
- Deleted skills retained in history for audit and progress tracking but hidden from active profile view
- Cannot delete a skill linked to an active project: "This skill is linked to an active project and cannot be deleted." (Section 23)

Skill Detail (/my-skills/:skillId):
- Shows all ratings: Self Rating, Manager Rating, Peer Rating, System Rating, Final Rating
- Rating Confidence Indicator (Section 4.4): 🟢 High (3+ sources), 🟡 Medium (2 sources), 🔴 Low (1 source)
- Proficiency level badge + percentage
- Certified badge (if certification exists for this skill)
- Skill progress chart (line chart showing score trend over time)
- Status: current status of the skill

Skill Progress Tracking (Section 13):
- Score history stored per skill
- Line chart visualization showing trend (Jan→60%, Apr→72%, Jul→85%)
- Best score vs latest score comparison
- Achievement badges: "First Assessment", "Reached Advanced", "Improved by 20%"

Skill Expiry Rule (Section 6):
- If skill rating not updated for 6 months → marked as "Stale" with amber warning badge
- Stale skills shown in profile but flagged visually (amber border)
- Stale skills excluded from project candidate matching results
- Employee clears stale status by retaking assessment or getting manager review

Profile Completion:
- Calculated: (skills assessed / total available skills) × 100
- Skills not attempted highlighted with "Take Assessment" CTA

Mock Data:
- employee-skills.json: userId, skills[{skillId, selfRating, managerRating, peerRating, systemRating, finalRating, level, status, lastUpdated}]
- skill-test-attempts.json: attemptId, userId, skillId, score, earnedPoints, maxPoints, date, timeTaken

Stack: Angular 17, NgRx, Angular Material or PrimeNG, ngx-charts or Chart.js (progress charts), SCSS
```

### Step 3.2 — Plan

> 👤 **Run by: Developer**

```
/speckit.plan use Angular 17, TypeScript strict, NgRx, Angular Material or PrimeNG, ngx-charts or Chart.js, Angular Animations, SCSS, mock data from JSON files via HttpClient interceptors
```

### Step 3.3 — Tasks

> 👤 **Run by: Developer**

```
/speckit.tasks
```

---

## PHASE 4 — FEATURE: Skill Assessments
> Covers: Take assessment, timer, difficulty levels, scoring with difficulty weighting, retake rules, post-assessment score card, test history
> req.md Sections: 5 (Assessment Methods), 11 (Skill Assessments), 12 (Rating Calculation — Layer 1)

### Step 4.1 — Specify

> 👤 **Run by: Business Analyst**

```
/speckit.specify Skill Assessments Module for Skill Matrix Application.

This is a frontend-only Angular 17 app. Assessment questions stored in skill-exams.json.

Screens:
- Assessments List (/assessments) — all roles
- Take Assessment (/assessments/:skillId/take) — all roles
- Assessment Result (/assessments/:skillId/result) — all roles

Assessment List (/assessments):
- Shows all skills with assessment status: Not Attempted, In Progress, Completed
- Skills not attempted have "Start Assessment" button
- Completed skills show: last score, last attempt date, "Retake" button (if cooldown passed)
- Filter by category, status

Take Assessment Screen (/assessments/:skillId/take):
- Assessment structure (Section 5):
    5–10 questions per skill
    Multiple choice answers (4 options)
    One correct answer per question
    Each question has difficultyLevel: Easy, Medium, or Hard
- Timer: default 15 minutes, countdown displayed at top-right
    On time expired → auto-submit answered questions only → show "Time's up! Your test has been auto-submitted." (Section 23)
- Questions displayed one at a time with Previous / Next navigation
- Progress bar showing current question / total questions
- Randomized question order on each attempt (Section 5)
- Submit button on last question or explicitly via "Submit Test" button

Retake Rules (Section 5):
- Retake allowed only after 24 hours from last attempt
- If attempting before cooldown → show "You can retake this assessment in X hours Y minutes." (Section 23)
- No questions available for a skill → "Assessment not available yet for this skill." (Section 23)

Score Calculation with Difficulty Weighting (Section 12):
- Test Score Calculation:
    Easy question correct   → 1 point
    Medium question correct → 2 points
    Hard question correct   → 3 points
    Test Score = (earned points / max possible points) × 100

System Generated Rating Formula (Section 4.2 / Section 12 — Layer 1):
- System Rating = (Test Score × 0.60) + (Certification Bonus × 0.20) + (Project Experience × 0.20)
- Certification Bonus: If employee holds a valid certification for the skill → full 20%. No cert → 0%.
- Project Experience: If employee tagged the skill on a completed project → full 20%. No tag → 0%.

Post-Assessment Score Card (Section 12):
After each test, display a breakdown card showing:
- Test score (weighted by difficulty) — e.g., "72% (18/25 points)"
- Certification bonus applied (if any) — e.g., "+20% cert bonus" or "No certification"
- Project experience bonus applied (if any) — e.g., "+20% project exp" or "No project tagged"
- System rating result — calculated from formula
- Final rating (if all sources available) — or "Awaiting manager review"
- Level achieved — Beginner / Intermediate / Advanced / Expert
- Level change indicator — e.g., "⬆ Intermediate → Advanced" or "No change"

Level Mapping (Section 3):
- 0–40% → Beginner, 41–65% → Intermediate, 66–85% → Advanced, 86–100% → Expert

Test History:
- All previous attempts stored in skill-test-attempts.json
- Show: attempt date, score, earned/max points, time taken
- Displayed in Skill Detail screen under progress tab

Responsive Behavior (Section 18.3 — Assessment Test Screen):
- Desktop: question card centered max-width 720px, timer top-right, progress bar full width
- Tablet: full-width question card, larger tap targets
- Mobile: full-screen question card, options stacked vertically (not 2×2 grid), timer as compact badge, Previous/Next buttons full-width at bottom, sticky at viewport bottom

Mock Data:
- skill-exams.json: skillId, questions[{questionText, options[], correctAnswer, difficultyLevel}]
- skill-test-attempts.json: attemptId, userId, skillId, score, earnedPoints, maxPoints, date, timeTaken

Stack: Angular 17, NgRx, Angular Material or PrimeNG, SCSS
```

### Step 4.2 — Plan

> 👤 **Run by: Developer**

```
/speckit.plan use Angular 17, TypeScript strict, NgRx, Angular Material or PrimeNG, SCSS, mock data from JSON files via HttpClient interceptors
```

### Step 4.3 — Tasks

> 👤 **Run by: Developer**

```
/speckit.tasks
```

---

## PHASE 5 — FEATURE: Certifications
> Covers: Upload certifications, certification data, certified badge, +10% rating bonus, expiry tracking
> req.md Sections: 5 (Certification Uploads), 6 (Upload Certifications in profile)

### Step 5.1 — Specify

> 👤 **Run by: Business Analyst**

```
/speckit.specify Certifications Module for Skill Matrix Application.

This is a frontend-only Angular 17 app. Certification data stored in certifications.json mock file. File uploads are simulated (file reference stored, not actually uploaded to a server).

Screens:
- Certifications List (/certifications) — all roles
- Upload Certification (/certifications/upload) — all roles

Certifications List (/certifications):
- Table/cards showing all uploaded certifications
- Columns: Certification Name, Skill, Issuing Organization, Issue Date, Expiry Date, Status (Valid/Expired/Expiring Soon)
- Expiring Soon = within 30 days of expiry → amber badge
- Expired = past expiry date → red badge
- Valid = not expired → green badge

Upload Certification (/certifications/upload):
- Form fields: Certification Name, Skill (dropdown from user's skills), Issuing Organization, Issue Date, Expiry Date, File Upload
- Supported file formats: PDF, JPG, PNG (Section 5)
- File size limit: 5 MB (simulated — just validate file size on client side)
- Validation errors (Section 23):
    Invalid file format (not PDF/JPG/PNG) → "Only PDF, JPG, and PNG files are accepted."
    File too large (> 5 MB) → "File size must not exceed 5 MB."
    Missing required fields → highlight with "This field is required."
    Expiry date before issue date → "Expiry date must be after issue date."

Certification Benefits (Section 5):
- Approved certification provides: Certified Badge on skill profile
- +10% rating bonus (max 100%): Example: Test Score 75% + Cert Bonus 10% = Final 85%
- Certification contributes to System Rating formula: Certification Bonus × 0.20 weight

Certification Expiry:
- System tracks expiry dates from certifications.json
- Expiring certifications flagged in dashboard
- Stale/expired certifications no longer contribute to rating bonus

Mock Data:
- certifications.json: certId, userId, skillId, certName, issuingOrg, issueDate, expiryDate, filePath

Responsive: Forms follow Section 18.3 — Desktop two-column, Mobile single-column full-width inputs with sticky submit button.

Stack: Angular 17, NgRx, Angular Material or PrimeNG, SCSS
```

### Step 5.2 — Plan

> 👤 **Run by: Developer**

```
/speckit.plan use Angular 17, TypeScript strict, NgRx, Angular Material or PrimeNG, SCSS, mock data from JSON files via HttpClient interceptors
```

### Step 5.3 — Tasks

> 👤 **Run by: Developer**

```
/speckit.tasks
```

---

## PHASE 6 — FEATURE: Peer Validation & Manager/Admin Controls
> Covers: Peer validation workflow, manager approve/reject skills, validation queue, team skills overview, manager/admin dashboard actions
> req.md Sections: 4.5 (Peer Validation Workflow), 7 (Manager/Admin Controls), 7A.3 (UI element visibility)

### Step 6.1 — Specify

> 👤 **Run by: Business Analyst**

```
/speckit.specify Peer Validation and Manager/Admin Controls for Skill Matrix Application.

This is a frontend-only Angular 17 app. All data from JSON mock files via interceptors.

Screens (Manager + Admin only — guarded by RoleGuard):
- Team Skills Overview (/team/skills)
- Employee Skill Profile (any) (/team/skills/:employeeId)
- Skill Validation Queue (/team/validation)
- Validation Detail (/team/validation/:submissionId)

Peer Validation Workflow (Section 4.5):
- When employee submits a skill for validation, they select 2–3 peers from their team
- Selected peers receive a notification requesting validation
- Each peer submits a rating (1–4 scale) via a structured form with optional comment
- Minimum 2 peer responses required for peer rating to be included in formula
- If fewer than 2 peers respond within 7 days, peer weight (0.15) is redistributed to other sources
- Peers can only validate skills they also have in their own profile
- Peer validation form: Skill being validated, proficiency rating (1–4), optional comment, Submit button

Manager Assessment:
- Managers review and validate employee skills from validation queue
- Manager sets Manager Rating (1–4 scale, can match or override employee's self-rating)
- Mandatory: add optional comment explaining rating
- Manager assessment carries highest individual weight (0.30) in Final Rating formula

Team Skills Overview (/team/skills) — Manager + Admin:
- Table of all employees in team with their skills summary
- UI Element Visibility (Section 7A.3): Manager sees own team only; Admin sees all employees
- Columns: Employee Name, Department, Skills Count, Avg Rating, Profile Completion %, Actions
- "View Profile" link → navigates to /team/skills/:employeeId
- "Send Validation Request" button visible for both Manager and Admin

Skill Validation Queue (/team/validation):
- List of pending skill submissions awaiting approval
- Sortable by employee name, skill name, submit date
- UI Element Visibility (Section 7A.3):
    Manager: "Approve" + "Reject" buttons for own team only; "Override Rating" hidden
    Admin: "Approve" + "Reject" for all employees; "Override Rating" visible

Validation Detail (/team/validation/:submissionId):
- Shows: Employee name, Skill name, Self Rating, Uploaded certification (if any), Project experience evidence (if any)
- Manager/Admin sets Manager Rating (1–4)
- Approve: marks skill Approved → triggers final rating calculation → updates employee-skills.json in-memory
- Reject: requires mandatory rejection reason → notifies employee
- Override (Admin only): Admin can override any rating with documented justification

Final Rating Calculation (Section 4.3):
Final Rating = (Self Rating × 0.20) + (Manager Rating × 0.30) + (Peer Rating × 0.15) + (System Rating × 0.35)
Note: If a source is missing, its weight is redistributed proportionally.

Rating Confidence Indicator (Section 4.4):
🟢 High Confidence — 3+ sources available
🟡 Medium Confidence — 2 sources
🔴 Low Confidence — 1 source only

Mock Data:
- employee-skills.json: contains selfRating, managerRating, peerRating, systemRating, finalRating, status per skill
- users.json: role field determines who can approve

Stack: Angular 17, NgRx, Angular Material or PrimeNG, SCSS
```

### Step 6.2 — Plan

> 👤 **Run by: Developer**

```
/speckit.plan use Angular 17, TypeScript strict, NgRx, Angular Material or PrimeNG, SCSS, mock data from JSON files via HttpClient interceptors
```

### Step 6.3 — Tasks

> 👤 **Run by: Developer**

```
/speckit.tasks
```

---

## PHASE 7 — FEATURE: Project Management, Candidate Matching & Team Builder
> Covers: Create projects, project statuses, candidate matching with match score, team builder, skill gap detection, employee availability, project alignment
> req.md Sections: 14 (Project Creation), 15 (Candidate Matching), 16 (Team Builder), 17 (Availability & Alignment)

### Step 7.1 — Specify

> 👤 **Run by: Business Analyst**

```
/speckit.specify Project Management, Candidate Matching, and Team Builder for Skill Matrix Application.

This is a frontend-only Angular 17 app. All data from JSON mock files via interceptors.

Screens (Manager + Admin only — guarded by RoleGuard):
- Projects List (/projects)
- Create Project (/projects/create)
- Project Detail (/projects/:projectId)
- Project Matching (/team/matching)
- Team Builder (/projects/team-builder)

Project Creation (Section 14):
- Form fields: Project Name, Description, Status, Start Date, Deadline, Required Roles, Required Skills (multi-select from skill library with minimum proficiency level per skill), Created By (auto-filled with logged-in user)
- Project statuses: Draft, Open, In Progress, Completed
- Validation errors (Section 23):
    Missing project name → "Project name is required."
    Start date after deadline → "Start date must be before deadline."
    No required skills added → "Add at least one required skill to create a project."
    Duplicate project name → "A project with this name already exists."
- UI Element Visibility (Section 7A.3):
    Manager: Create/Edit/Delete own projects
    Admin: Create/Edit/Delete all projects

Projects List (/projects):
- Table: Project Name, Status badge, Start Date, Deadline, Skills Required count, Team Size, Actions
- Filter by status, date range
- "Create Project" button

Candidate Matching (Section 15):
- Manager defines required skills + minimum proficiency for a project
- System scans all employee skill profiles and calculates Match Score:
    Match Score = (Skills Matched / Skills Required) × 100
- Match Breakdown table per candidate: Skill | Required Level | Candidate Level | Status (Exceeds/Meets/Below)
- Candidates ranked by match score
- Availability Integration: Available ✅ shown first, Partially Available shown with warning, Busy ❌ shown last and greyed out
- Filters: Department, Availability, Minimum match score
- Only non-stale, non-expired skill ratings included in matching
- If no candidates match → "No candidates found matching the required skills. Consider lowering the minimum proficiency or providing training." (Section 23)
- Export matched candidates as PDF
- Responsive: Desktop=filters panel left + candidate grid right, Tablet=filter button + single column, Mobile=filter FAB + full-width cards (Section 18.3)

Team Builder (Section 16):
- Managers build teams for projects by role slots
- Example: Banking App → Flutter Developer ×2, Backend Developer ×1, QA Engineer ×1
- Assign candidates from matching results to project roles
- "Add to Project" button per candidate

Skill Gap Detection (Section 16):
- If no candidate meets requirements → system flags skill gap
- Shows: Required skill + level, Highest available skill level, Gap percentage
- Learning Path Suggestions: recommends training for employees closest to requirement

Employee Availability (Section 17):
- Three statuses: Available, Partially Available, Busy
- Availability Rules:
    Employee added to project via Team Builder → status auto-changes to Busy
    Project marked Completed → all assigned employees auto-set to Available
    Employees can manually set "Partially Available" from their profile
    Managers can override availability with logged reason
- Project Alignment View table: Employee | Role | Current Project | Status | Since

Mock Data:
- projects.json: projectId, name, description, status, startDate, deadline, requiredSkills[], requiredRoles[], createdBy
- project-assignments.json: projectId, userId, role, assignedDate

Stack: Angular 17, NgRx, Angular Material or PrimeNG, SCSS
```

### Step 7.2 — Plan

> 👤 **Run by: Developer**

```
/speckit.plan use Angular 17, TypeScript strict, NgRx, Angular Material or PrimeNG, SCSS, mock data from JSON files via HttpClient interceptors
```

### Step 7.3 — Tasks

> 👤 **Run by: Developer**

```
/speckit.tasks
```

---

## PHASE 8 — FEATURE: Reporting & Analytics
> Covers: Skill gap analysis, team capability reports, org skill heatmap, skill trend analysis, report exports
> req.md Sections: 8 (Reporting & Insights)

### Step 8.1 — Specify

> 👤 **Run by: Business Analyst**

```
/speckit.specify Reporting and Analytics Module for Skill Matrix Application.

This is a frontend-only Angular 17 app. All report data computed from in-memory mock data.

Screens:
- Reports (/reports) — Manager (team only) + Admin (org-wide) — guarded by RoleGuard
- Skill Gap Analysis (/reports/skill-gap) — Manager (own team) + Admin (all teams)
- Team Capability Report (/reports/team) — Manager + Admin
- Org Skill Heatmap (/reports/heatmap) — Admin only
- Skill Trend Analysis (/reports/trends) — Manager (team) + Admin (org-wide)

Reports (Section 8):

1. Skill Gap Analysis:
- Compare required project skills vs actual team skills
- Output: Required Skill, Required Level, Team Average Level, Gap %
- Example: Required → Kubernetes 70%, Team Avg → 45%, Gap → 25%
- Manager sees own team; Admin sees all departments

2. Team Capability Reports:
- Skill distribution and coverage across teams
- View by: department, skill category
- Shows average proficiency per skill per team

3. Organization Skill Heatmap (Admin only):
- Color-coded grid: skill proficiency across all departments
- Table: Skill | Beginner count | Intermediate count | Advanced count | Expert count
- Example: Flutter → 10 | 5 | 3 | 1; React → 8 | 6 | 4 | 2
- Visualized using chart library (ngx-charts or Chart.js)

4. Skill Trend Analysis:
- Track skill growth across teams over time periods
- Line chart showing proficiency trends quarter-over-quarter
- Manager sees own team trends; Admin sees org-wide

Report UI Visibility (Section 7A.3):
- Manager: Team-level data only, Org heatmap tab hidden, Org gap analysis tab hidden
- Admin: All teams, all tabs visible

Report Export Formats (Section 8):
- Skill Gap Analysis → PDF, Excel
- Team Capability Report → PDF, Excel
- Org Skill Heatmap → PDF, Image (PNG)
- Candidate Matching Results → PDF
- Employee Skill List → CSV, Excel
- Skill Trend Analysis → PDF
- All exports include: report title, generated on date, generating user's name

Charts Responsive Behavior (Section 18.3):
- Desktop: full-size, all axis labels, legend beside chart
- Tablet: 100% width, legend below chart
- Mobile: reduced height (max 250px), simplified labels, pinch-to-zoom, legend hidden (tap to show), horizontally scrollable if data exceeds width

Data Source: All reports computed client-side from employee-skills.json, projects.json, users.json, certifications.json

Stack: Angular 17, NgRx, Angular Material or PrimeNG, ngx-charts or Chart.js, SCSS
```

### Step 8.2 — Plan

> 👤 **Run by: Developer**

```
/speckit.plan use Angular 17, TypeScript strict, NgRx, Angular Material or PrimeNG, ngx-charts or Chart.js, SCSS, mock data from JSON files via HttpClient interceptors
```

### Step 8.3 — Tasks

> 👤 **Run by: Developer**

```
/speckit.tasks
```

---

## PHASE 9 — FEATURE: Notifications & Alerts
> Covers: All notification events, in-app notification bell, notification list screen, reminders
> req.md Sections: 10 (Notifications and Reminders)

### Step 9.1 — Specify

> 👤 **Run by: Business Analyst**

```
/speckit.specify Notifications and Alerts Module for Skill Matrix Application.

This is a frontend-only Angular 17 app. Notifications stored in notifications.json and managed via NgRx state.

Screen:
- Notifications (/notifications) — all roles

Notification Bell (in top header):
- Bell icon in top-right header
- Unread count badge showing number of unread notifications
- Click bell → navigate to /notifications list
- Badge disappears when all notifications read

Notifications List (/notifications):
- Shows all notifications for the logged-in user
- Each notification: type icon, message, date/time, read/unread status
- Click a notification → marks as read + navigates to relevant screen (if applicable)
- "Mark All as Read" button

Notification Events (Section 10 of req.md):
- Skill approval received → Employee → "Your [Skill Name] has been approved by [Manager Name]."
- Skill rejection received → Employee → "Your [Skill Name] was rejected. Reason: [reason]."
- Assessment result available → Employee → "Your [Skill Name] assessment score: [score]%."
- Certification expiry approaching (30 days) → Employee → "Your [Cert Name] expires on [Date]. Renew to maintain your rating."
- Certification expired → Employee → "Your [Cert Name] has expired and is no longer contributing to your rating."
- Skill marked stale (6 months) → Employee → "Your [Skill Name] rating is outdated. Retake the assessment to keep it current." (Section 6)
- Peer validation request → Peer → "[Employee Name] requested you to validate their [Skill Name] skill."
- Peer validation completed → Employee → "[Peer Name] has validated your [Skill Name] skill."
- Skill gap training suggestion → Employee → "Based on project requirements, consider improving your [Skill Name] (currently [X]%, needed [Y]%)."
- New skill pending approval → Manager → "[Employee Name] submitted [Skill Name] for validation."

Notification Rules:
- Notifications are in-app only (no real email — mock app)
- All notifications pre-populated in notifications.json for demo purposes
- New notifications generated during session (e.g., completing an assessment) are added to NgRx state
- Read/unread status tracked in state

Mock Data:
- notifications.json: notificationId, userId, type, message, isRead, date, linkTo (optional route)

Stack: Angular 17, NgRx, Angular Material or PrimeNG, SCSS
```

### Step 9.2 — Plan

> 👤 **Run by: Developer**

```
/speckit.plan use Angular 17, TypeScript strict, NgRx, Angular Material or PrimeNG, SCSS, mock data from JSON files via HttpClient interceptors
```

### Step 9.3 — Tasks

> 👤 **Run by: Developer**

```
/speckit.tasks
```

---

## PHASE 10 — FEATURE: Responsive Design, Animations & Error Handling
> Covers: Full responsive implementation (Section 18), animations (Section 19), error states (Section 23), search and filtering (Section 10)
> req.md Sections: 18 (complete), 19, 23, 10

### Step 10.1 — Specify

> 👤 **Run by: UI/UX Designer + Business Analyst**

```
/speckit.specify Responsive Design, Animations, and Error Handling for Skill Matrix Application.

This is a frontend-only Angular 17 app. This phase applies cross-cutting UI polish to ALL screens built in Phases 1–9.

RESPONSIVE DESIGN (Section 18 — all 7 subsections):

18.1 Breakpoints (mobile-first):
- xs (0px) Mobile small — iPhone SE, Android small
- sm (480px) Mobile large — phones landscape, large phones
- md (768px) Tablet — iPad, Android tablets
- lg (1024px) Desktop small — iPad Pro landscape, small laptops
- xl (1280px) Desktop standard — 13"/14" laptops
- 2xl (1440px+) Desktop large — Full HD monitors

18.2 Layout Behavior:
- Sidebar: Desktop=240px fixed, Tablet=64px icon-only with tooltip, Mobile=hidden+hamburger drawer
- Header: Desktop=logo+title+search+bell+avatar, Tablet=hidden search (tap icon), Mobile=logo+hamburger+bell+avatar
- Content: Desktop=max-1440px centered pad-48px, Tablet=full-width pad-24px, Mobile=full-width pad-16px

18.3 Component Behavior:
- Stat Cards: Desktop=4/row, Tablet=2/row, Mobile=1/row stacked
- Skill Table: Desktop=full columns, Tablet=reduced columns, Mobile=card list per row
- Assessment: Desktop=centered 720px card, Mobile=full-screen vertical options, sticky nav buttons
- Candidate Match: Desktop=filters left + cards right, Tablet=filter button+single col, Mobile=FAB filter+full-width
- Charts: Desktop=full size+legend beside, Tablet=100% width+legend below, Mobile=250px max height+scrollable
- Data Tables: Desktop=full+sorting, Tablet=horizontal scroll, Mobile=expandable card list
- Forms: Desktop=two-column, Mobile=single-column+labels stacked+sticky submit
- Modals: Desktop=centered 560px, Mobile=full-screen bottom sheets with drag handle
- Toasts: Desktop=top-right 360px, Mobile=full-width top

18.4 Touch Rules:
- Min tap target 44×44px
- No hover-only interactions
- Swipe left on skill card → quick actions
- Bottom nav bar on mobile (5 tabs: Dashboard, My Skills, Assessments, Notifications, More)
- FAB per screen: My Skills→Add Skill, Projects→Create Project, Certifications→Upload Cert

18.5 Typography Scaling:
- H1: 28px(desktop) → 24px(tablet) → 20px(mobile)
- H2: 20px → 18px → 16px
- Card Title: 16px → 15px → 14px
- Body: 14px all
- Labels: 12px → 12px → 11px

18.6 Icon/Image: SVG, object-fit cover avatars (40px desktop, 36px mobile), retina-ready

18.7 Angular Implementation:
- CDK BreakpointObserver for breakpoint detection
- Central breakpoints.ts constants file
- CSS custom properties for spacing/fonts (media query swaps)
- CSS Grid/Flexbox with auto-fill/auto-fit
- SCSS only — no inline responsive styles in TypeScript

ANIMATIONS (Section 19):
- Page transitions (route animations)
- Skill progress bar animations
- Test completion success animation
- Toast slide-in/out
- Sidebar collapse/expand transitions
- Modal/bottom-sheet slide-up animations

SEARCH AND FILTERING (Section 10):
- Global search: search employees by Skill, Department, Proficiency level, Certification, Availability
- Filter components on: Skills list, Assessments list, Projects list, Reports, Team Skills Overview
- Real-time filtering as user types

ERROR HANDLING (Section 23 — all error states):
- Assessment: time expired auto-submit, retake cooldown, no questions
- Certification: invalid format, too large, missing fields, bad dates
- Project: missing name, bad dates, no skills, duplicate name
- Skill Profile: duplicate skill, delete linked skill
- Matching: no candidates found
- General: real-time inline validation, red error text below field, green success toasts, spinner/skeleton loading, never blank pages

Stack: Angular 17, Angular CDK (BreakpointObserver), Angular Animations, SCSS
```

### Step 10.2 — Plan

> 👤 **Run by: Developer + UI/UX Designer**

```
/speckit.plan use Angular 17, TypeScript strict, Angular CDK BreakpointObserver, Angular Animations, SCSS, responsive mobile-first design
```

### Step 10.3 — Tasks

> 👤 **Run by: Developer**

```
/speckit.tasks
```

---

## PHASE 11 — IMPLEMENT ALL FEATURES (run per feature at the end)

After all 10 features have their `spec.md`, `plan.md`, and `tasks.md` ready, switch to each feature branch and run implement.

> **Note:** Branch names are auto-generated by SpecKit when you run `/speckit.specify`. Run `git branch` in terminal to see the exact branch names created. The names below are examples — your actual branch names will be auto-generated.

### How to switch to a feature branch before implementing

> 👤 **Run by: Developer** — all implement commands below

In terminal:
```bash
git branch
```
(lists all created branches — use the exact names from this output)

```bash
git checkout 001-mock-authentication-navigation
```
Then in Copilot Chat:
```
/speckit.implement Start the implementation in phases
```

Repeat for each feature:
```bash
git checkout 002-skill-framework-structure
```
```
/speckit.implement Start the implementation in phases
```

```bash
git checkout 003-employee-skill-profile-dashboard
```
```
/speckit.implement Start the implementation in phases
```

```bash
git checkout 004-skill-assessments
```
```
/speckit.implement Start the implementation in phases
```

```bash
git checkout 005-certifications
```
```
/speckit.implement Start the implementation in phases
```

```bash
git checkout 006-peer-validation-manager-controls
```
```
/speckit.implement Start the implementation in phases
```

```bash
git checkout 007-project-management-team-builder
```
```
/speckit.implement Start the implementation in phases
```

```bash
git checkout 008-reporting-analytics
```
```
/speckit.implement Start the implementation in phases
```

```bash
git checkout 009-notifications-alerts
```
```
/speckit.implement Start the implementation in phases
```

```bash
git checkout 010-responsive-design-animations-errors
```
```
/speckit.implement Start the implementation in phases
```

---

## OPTIONAL ENHANCEMENT COMMANDS

Use these between steps to improve quality:

| When to Use | Command | Run By | Purpose |
|---|---|---|---|
| After `specify`, before `plan` | `/speckit.clarify` | **Business Analyst** | AI asks structured questions to remove ambiguity |
| After `tasks`, before `implement` | `/speckit.analyze` | **QA** | Cross-artifact consistency check |
| After `plan` | `/speckit.checklist` | **QA** | Validate requirements completeness |

---

## FINAL FOLDER STRUCTURE (after all phases)

```
specs/
├── 001-mock-authentication-navigation/
│   ├── spec.md
│   ├── plan.md
│   └── tasks.md
├── 002-skill-framework-structure/
│   └── ...
├── 003-employee-skill-profile-dashboard/
│   └── ...
├── 004-skill-assessments/
│   └── ...
├── 005-certifications/
│   └── ...
├── 006-peer-validation-manager-controls/
│   └── ...
├── 007-project-management-team-builder/
│   └── ...
├── 008-reporting-analytics/
│   └── ...
├── 009-notifications-alerts/
│   └── ...
└── 010-responsive-design-animations-errors/
    └── ...
.specify/memory/constitution.md   ← filled once in Phase 0
```

---

## MOCK DATA FILES COVERAGE CHECK

| Mock Data File (req.md Section 22) | Covered In Phase |
|---|---|
| users.json | Phase 1 (auth, session, role) |
| skill-categories.json | Phase 2 (framework CRUD) |
| skill-definitions.json | Phase 2 (skill definitions CRUD) |
| skill-exams.json | Phase 4 (assessments, questions) |
| employee-skills.json | Phase 3 (profile), Phase 4 (scores), Phase 6 (ratings) |
| certifications.json | Phase 5 (upload, expiry, badge) |
| projects.json | Phase 7 (creation, matching) |
| project-assignments.json | Phase 7 (team builder, availability) |
| skill-test-attempts.json | Phase 4 (test history, scoring) |
| notifications.json | Phase 9 (alerts, notifications) |

---

## REQUIREMENT SECTIONS COVERAGE CHECK

| req.md Section | What it covers | Covered in Phase |
|---|---|---|
| Section 1 — Overview | Key goals, mock data strategy | Phase 0 (constitution) |
| Section 2 — Skill Structure | Categories, subcategories, skill names, definitions | Phase 2 |
| Section 3 — Proficiency Framework | 4 levels, scores, thresholds, example criteria | Phase 2 (config), Phase 3 (display), Phase 4 (mapping) |
| Section 4 — Skill Rating Mechanism | Rating sources, System Rating formula, Final Rating formula, confidence indicator, peer validation | Phase 4 (system rating), Phase 6 (final rating, peer validation) |
| Section 5 — Skill Assessment Methods | Test structure, question format, retake rules, certification uploads, project tagging | Phase 4 (tests), Phase 5 (certs) |
| Section 6 — Employee Skill Profile | Add/edit/delete skills, progress, dashboard widgets, skill expiry | Phase 3 |
| Section 7 — Manager/Admin Controls | Approve skills, RBAC matrix (23 rows), manage framework, team dashboards | Phase 2 (framework), Phase 6 (approve/validation) |
| Section 7A — Role-Based UI & Navigation | Sidebar per role, 30-screen route inventory, element visibility, route guards, redirects, 403 | Phase 1 (core), ALL phases (enforcement) |
| Section 8 — Reporting & Insights | Gap analysis, heatmap, capability reports, trends, export formats | Phase 8 |
| Section 9 — Integration with Existing Modules | Project allocation, performance reviews, learning suggestions | Phase 7 (projects), Phase 9 (suggestions in notifications) |
| Section 10 — User Experience & Workflow | Navigation, skill workflow, search/filtering, notifications, responsive reference | Phase 10 (search/filtering), Phase 9 (notifications) |
| Section 11 — Skill Assessments | Timer, randomized, difficulty, retake cooldown | Phase 4 |
| Section 12 — Rating Calculation | Two-layer formula, difficulty weighting, level mapping, post-assessment card | Phase 4 (Layer 1), Phase 6 (Layer 2) |
| Section 13 — Skill Progress Tracking | Score history, line chart, best vs latest, achievement badges | Phase 3 |
| Section 14 — Project Creation | Project fields, statuses | Phase 7 |
| Section 15 — Candidate Matching | Match score formula, breakdown, availability, filters, export | Phase 7 |
| Section 16 — Project Team Builder | Build teams, skill gap detection, learning path suggestions | Phase 7 |
| Section 17 — Employee Availability | 3 statuses, auto-rules, manager override, alignment view | Phase 7 |
| Section 18 — UI & Responsive Design | Breakpoints, layout, components, touch, typography, icons, Angular impl | Phase 10 (dedicated), ALL phases (baseline) |
| Section 19 — Animations | Page transitions, progress bars, success animations | Phase 10 |
| Section 20 — Testing Requirements | Unit test coverage for all business logic | ALL phases |
| Section 21 — Technology Stack | Angular 17, TypeScript, NgRx, Material/PrimeNG, etc. | Phase 0 (constitution), ALL phases |
| Section 22 — Mock Data Files | 10 JSON files with field specs, interceptor strategy | ALL phases (data layer) |
| Section 23 — Error States & Validation | All error messages and validation rules | Phase 10 (dedicated), ALL phases (as built) |

---

## SCREEN / ROUTE COVERAGE CHECK

| Screen (from Section 7A.2) | Route | Covered in Phase |
|---|---|---|
| Login | /login | Phase 1 |
| Dashboard (Employee) | /dashboard | Phase 3 |
| Dashboard (Manager) | /dashboard | Phase 3 |
| Dashboard (Admin) | /dashboard | Phase 3 |
| Unauthorized | /unauthorized | Phase 1 |
| My Skills List | /my-skills | Phase 3 |
| Skill Detail | /my-skills/:skillId | Phase 3 |
| Add Skill | /my-skills/add | Phase 3 |
| Edit Skill | /my-skills/:skillId/edit | Phase 3 |
| Assessments List | /assessments | Phase 4 |
| Take Assessment | /assessments/:skillId/take | Phase 4 |
| Assessment Result | /assessments/:skillId/result | Phase 4 |
| Certifications List | /certifications | Phase 5 |
| Upload Certification | /certifications/upload | Phase 5 |
| Notifications | /notifications | Phase 9 |
| Team Skills Overview | /team/skills | Phase 6 |
| Employee Skill Profile (any) | /team/skills/:employeeId | Phase 6 |
| Skill Validation Queue | /team/validation | Phase 6 |
| Validation Detail | /team/validation/:submissionId | Phase 6 |
| Project Matching | /team/matching | Phase 7 |
| Projects List | /projects | Phase 7 |
| Create Project | /projects/create | Phase 7 |
| Project Detail | /projects/:projectId | Phase 7 |
| Team Builder | /projects/team-builder | Phase 7 |
| Reports | /reports | Phase 8 |
| Skill Gap Analysis | /reports/skill-gap | Phase 8 |
| Team Capability Report | /reports/team | Phase 8 |
| Org Skill Heatmap | /reports/heatmap | Phase 8 |
| Skill Trend Analysis | /reports/trends | Phase 8 |
| Skill Framework – Categories | /admin/skill-framework/categories | Phase 2 |
| Skill Framework – Subcategories | /admin/skill-framework/subcategories | Phase 2 |
| Skill Framework – Definitions | /admin/skill-framework/skills | Phase 2 |
| Rating Configuration | /admin/rating-config | Phase 2 |
