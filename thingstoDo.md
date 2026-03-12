# SpecKit – Step-by-Step Execution Plan
# Project: Skill Matrix Module – In Time Pro (ITP)

---

## HOW THIS WORKS

- All commands run in **GitHub Copilot Chat in Agent Mode**
- Each `/speckit.specify` creates a new numbered folder: `specs/001-...`, `specs/002-...`, etc.
- `/speckit.plan` and `/speckit.tasks` run inside that same folder (no new folder)
- `/speckit.implement` runs last, per feature, to generate actual code
- Constitution runs **once** for the whole project

---

## CROSS-REFERENCES FOR ALL PHASES

> **Every `/speckit.specify` command below implicitly requires the AI to also consult requirement.md for the following sections. You do NOT need to paste these into each command — just ensure requirement.md is in the workspace.**

| Requirement Section | What it provides | Applies to |
|---|---|---|
| Section 5.2 — RBAC Permission Matrix | 23-row permission table defining exact feature access per role | ALL phases (enforce at API + UI) |
| Section 5.3 — Role Hierarchy | Super Admin → Leadership → HR Admin → Manager → Employee | ALL phases (authorization inheritance) | 
| Section 14 — User Workflows | 7 detailed step-by-step workflows (admin setup, skill submission, validation, framework, analytics, forgot password, admin password reset) | Phases 1–6 |
| Section 16 — Screen Inventory | 50+ screens across 5 roles with descriptions | ALL phases (verify every screen listed in Section 16 is accounted for) |
| Section 20.2 — Key Table Schemas | Column-level schema definitions for all 17+ tables | ALL phases (use exact column names, types, and constraints) |
| Section 21 — QA Test Scenarios | 30+ specific test cases covering all features | ALL phases (each phase must satisfy the applicable test scenarios) |
| Section 22 — UI/UX Design Guidelines | Design principles, nav structure per role, color/status codes, accessibility rules | ALL phases (especially frontend work) |

---

## PHASE 0 — PROJECT MANAGER runs once

### Step 0.1 — Constitution (run once)

```
/speckit.constitution Please refer to requirement.md to establish the project constitution for the Skill Matrix Module of In Time Pro (ITP).

Project Name: Skill Matrix Module – In Time Pro (ITP)
Stack: ASP.NET Core 8 Web API, Angular 17 SPA, SQL Server 2019, EF Core 8, Clean Architecture (Domain / Application / Infrastructure / API layers)
Auth: ASP.NET Core Identity + JWT Bearer tokens + Policy-based RBAC
File Storage: Azure Blob Storage
Email: SMTP / SendGrid
Caching: Redis
CI/CD: GitHub Actions
Testing: xUnit (.NET), Jest (Angular)

Core principles to enforce:
1. Security-First: JWT auth on every API, RBAC at API + UI layers, bcrypt/PBKDF2 passwords, TLS 1.2+ in transit AND encryption at rest for all sensitive data, rate limiting, account lockout, no sensitive data in error responses, virus-scan all uploaded files before storage, input validation on ALL form fields to prevent SQL injection and XSS attacks
2. Clean Architecture: strict layer separation – Domain has no infrastructure dependencies
3. RBAC Everywhere: every endpoint and UI route enforces role permissions as defined in the permission matrix (requirement.md Section 5.2); sidebar and top navigation dynamically render only links available to the logged-in user's role; role hierarchy: Super Admin → Leadership → HR Admin → Manager → Employee (Section 5.3)
4. Test-Driven: unit + integration + E2E + security + role-access tests are mandatory; no feature is done without passing tests; refer to requirement.md Section 21 for 30+ specific test scenarios
5. Audit Compliance: all create/update/delete operations on skill data must be logged in an immutable audit trail (retained 3 years); audit log searchable by employee, date range, action type
6. API-First: RESTful versioned API (/api/v1/, /api/v2/) with Swagger/OpenAPI 3.0 documentation for every endpoint
7. Performance SLAs: dashboard pages load ≤2s, skill search returns ≤1s, bulk report generation ≤10s, system handles 10,000+ employee skill records without degradation
8. Accessibility: all screens must conform to WCAG 2.1 Level AA — visible labels + ARIA attributes on all form fields, color never the sole status indicator (icons/text must accompany), keyboard navigation fully supported, minimum contrast ratio 4.5:1
9. Resilience: system must support graceful degradation if any integration (L&D, Project Allocation, Performance Review modules) is unavailable; core skill matrix functionality must remain operational; 99.5% uptime during business hours; planned maintenance windows communicated 48 hours in advance
10. Scalability: architecture must support horizontal scaling for organizational growth; database must support partitioning of skill records by department or time period for large datasets
11. Usability: all screens responsive and functional on desktop and tablet browsers; form validation messages must be clear and actionable; Progressive Disclosure (employees see simplified views, admins see full management controls); Feedback-First (every action — save, submit, approve — provides immediate visual feedback via toast notification or inline status update)
12. State Management: use NgRx for Angular frontend state management; Docker containerization optional for environment parity
```

**Output:** `.specify/memory/constitution.md` filled — no numbered folder created.

---

## PHASE 1 — FEATURE: Authentication & Security
> Covers: Login, JWT, refresh tokens, logout, forgot password, reset password, first-login password change, account lockout

### Step 1.1 — Specify

```
/speckit.specify Authentication and Security Module for In Time Pro (ITP) Skill Matrix.

Screens: Login, Forgot Password, Reset Password, Change Password – First Login, Change Password – Settings.

Flows:
- Login: POST /api/v1/auth/login returns JWT access token (60 min expiry) + refresh token (7 days). Failed login increments FailedLoginAttempts; after 5 failures account is locked for 15 min (both thresholds configurable by Super Admin).
- Refresh: POST /api/v1/auth/refresh exchanges valid refresh token for new access token.
- Logout: POST /api/v1/auth/logout revokes current refresh token.
- Forgot Password: POST /api/v1/auth/forgot-password accepts email; sends single-use HTTPS reset link (token expires 30 min); no indication whether email exists (security by design).
- Reset Password: POST /api/v1/auth/reset-password validates token (not expired, not used), hashes new password, marks token used, revokes all refresh tokens for user.
- Change Password – First Login: POST /api/v1/auth/change-password-first-login; mandatory screen on first login (IsFirstLogin=true); cannot be skipped; sets IsFirstLogin=false on success.
- Change Password – Settings: POST /api/v1/auth/change-password for authenticated users.
- Admin-triggered password reset: Super Admin/HR Admin clicks Reset Password for a user; system generates token and sends reset email; action logged in audit trail.

Password complexity: min 8 chars, 1 uppercase, 1 lowercase, 1 digit, 1 special character.
Default Super Admin account: admin@intimepro.com / Admin@123 — seeded on first deployment; forced password change on first login.

DB Tables: SystemUsers, RefreshTokens, PasswordResetTokens, UserRoles.
DB Schemas: Refer to requirement.md Section 20.2 for exact column definitions, types, and constraints for each table — SystemUsers (11 fields incl. EmployeeId FK, IsFirstLogin, FailedLoginAttempts, LockoutUntil), UserRoles (5 fields incl. RoleName, AssignedBy), RefreshTokens (7 fields incl. TokenHash as SHA-256, IsRevoked), PasswordResetTokens (7 fields incl. TokenHash, IsUsed, ExpiresAt 30min).
Role Hierarchy (Section 5.3): Super Admin → Leadership → HR Admin → Manager → Employee.
Stack: ASP.NET Core 8, ASP.NET Core Identity, JWT Bearer, Angular 17.
```

### Step 1.2 — Plan

```
/speckit.plan use ASP.NET Core 8, ASP.NET Core Identity, JWT Bearer tokens, EF Core 8, SQL Server, Angular 17, Clean Architecture
```

### Step 1.3 — Tasks

```
/speckit.tasks
```

---

## PHASE 2 — FEATURE: User Management (Super Admin)
> Covers: Create/edit/deactivate users, role assignment, bulk CSV import, resend invite, system settings, Super Admin screens

### Step 2.1 — Specify

```
/speckit.specify User Management Module for In Time Pro (ITP) Skill Matrix — Super Admin and HR Admin functionality.

Screens: System Dashboard, Employee List, Add Employee, Edit Employee, Bulk Import (CSV), Role Assignment, Resend Invite, System Settings.

Super Admin Dashboard Widgets (Section 6.5 — all must be implemented):
- Total registered users
- Users by role (breakdown chart)
- Users pending role assignment
- Recent user creation and role-change activity
- Failed login attempts in last 24 hours
- System health indicators

Features:
- Employee List: paginated, searchable, filterable table; columns: name, email, department, designation, role badges, account status, last-login date.
- Add Employee: form with name, email, department, designation, initial role; triggers welcome email with credentials on save; new employee has IsFirstLogin=true.
- Edit Employee: edit profile details, role, active/inactive status; admin-triggered password reset button.
- Deactivate/Activate: PATCH /api/v1/users/{id}/deactivate and /activate.
- Unlock Account: PATCH /api/v1/users/{id}/unlock; logged in audit trail.
- Role Assignment: assign/revoke one or more roles (Employee, Manager, HR Admin, Leadership) per user; confirmation dialog required; audit-logged; role without assignment = cannot login.
- Bulk Import CSV: upload CSV with columns: name, email, department, designation, role; validates duplicate emails and invalid roles per row; does not stop valid rows; sends summary notification to initiating admin; downloadable error report.
- Resend Invite: POST /api/v1/users/{id}/resend-invite; resends welcome email.
- System Settings (Super Admin only): configure account lockout threshold (default 5), lockout duration (default 15 min), password complexity rules, JWT access token expiry (default 60 min), refresh token expiry (default 7 days), global notification defaults.

Business rules: Default Super Admin (admin@intimepro.com) cannot be deleted; email reserved; employee without role cannot log in; single user can hold multiple roles.
API: Section 19.7 of requirement.md — all 12 endpoints: GET/POST /api/v1/users, GET/PUT /api/v1/users/{id}, PATCH roles/deactivate/activate/unlock, POST reset-password/resend-invite, POST /api/v1/users/import + GET /api/v1/users/import/{jobId}/status.
DB Tables: Employees (master table — EmployeeId, Name, Email, Department, Designation, ReportingManagerId, IsActive), SystemUsers, UserRoles, AuditLogs.
DB Schemas: Refer to requirement.md Section 20.2 for exact column definitions for all tables above.

Audit Log Viewer (HR Admin screen):
- Searchable audit trail by: employee name/ID, date range, action type (Create/Update/Delete/Approve/Reject)
- Columns: Timestamp, UserId, UserRole, Action, EntityType, EntityId, OldValue (JSON), NewValue (JSON)
- Retain for minimum 3 years
- Export audit log results to CSV
- Backend: implement GET /api/v1/audit-logs?employeeId=&fromDate=&toDate=&action= (HR Admin + Super Admin only)
```

### Step 2.2 — Plan

```
/speckit.plan use ASP.NET Core 8, EF Core 8, SQL Server, Angular 17, Clean Architecture
```

### Step 2.3 — Tasks

```
/speckit.tasks
```

---

## PHASE 3 — FEATURE: Skill Framework Management (HR Admin)
> Covers: Skill categories, subcategories, skill definitions, proficiency levels, rating weight configuration

### Step 3.1 — Specify

```
/speckit.specify Skill Framework Management Module for In Time Pro (ITP) Skill Matrix — HR Admin functionality.

Hierarchy: Skill Category → Sub Category → Skill Name → Skill Definition.

Features:
- Skill Category CRUD: HR Admin creates/edits/deactivates categories (name + description). Deactivated categories hidden from new additions but retained in historical records. Cannot delete if linked to employee records.
- Subcategory CRUD: add/edit/deactivate subcategories under a category.
- Skill Definition CRUD: add/edit individual skill names and descriptions under subcategories. Skill names unique within subcategory — duplicate rejected with validation error.
- Proficiency Framework: 4 fixed levels — Beginner(1), Intermediate(2), Advanced(3), Expert(4). HR Admin can update level descriptions and criteria; level names and scores are fixed.
- Rating Weight Configuration: HR Admin configures weighting for final rating formula: Self(0.20) + Manager(0.50) + Peer(0.15) + System(0.15). All weights must sum to 100% — validated on save. Weights stored in RatingWeightConfig table.

Final Rating Formula: (Self × weight) + (Manager × weight) + (Peer × weight) + (System × weight).

Screens: Skill Category Management, Skill Definition Management, Proficiency Framework Settings, Rating Weight Configuration.
API: Section 19.2 of requirement.md.
DB Tables: SkillCategories, SkillSubCategories, SkillDefinitions, ProficiencyLevels, RatingWeightConfig.
DB Schemas: Refer to requirement.md Section 20.2 for exact column definitions — SkillCategories (8 fields incl. CategoryName unique, IsActive, CreatedBy FK), SkillDefinitions (8 fields incl. SubCategoryId FK, SkillName, IsActive).
```

### Step 3.2 — Plan

```
/speckit.plan use ASP.NET Core 8, EF Core 8, SQL Server, Angular 17, Clean Architecture
```

### Step 3.3 — Tasks

```
/speckit.tasks
```

---

## PHASE 4 — FEATURE: Employee Skill Profile
> Covers: Add skills, self-assessment, submit for validation, certification upload, skill progress, profile tabs

### Step 4.1 — Specify

```
/speckit.specify Employee Skill Profile Module for In Time Pro (ITP) Skill Matrix.

Screens: My Skill Dashboard, Add Skill, My Skills List, Skill Detail, Upload Certification, Certifications List, Skill Progress, All Employee Skills (HR Admin — search and filter skill profiles across the entire organization, Section 16.3).

Employee Dashboard Widgets (Section 6.1 — all must be implemented):
- Skill profile completion percentage
- Pending validation requests count
- Upcoming certification expiry alerts
- Recommended skills based on current role
- Skill progress trend (chart)

Features:
- Add Skill: employee selects from global skill library (Category → Subcategory → Skill); sets self-rating (Beginner/Intermediate/Advanced/Expert); optionally uploads certification or links project experience.
- Skills can be saved as Draft or Submitted for Manager Validation.
- Employee can submit multiple skills in a single batch.
- Skill statuses: Draft, Pending Review, Approved, Rejected, Expired (not updated in 12 months — configurable).
- Certification Upload: PDF or JPG/PNG, max 5 MB; must include issuing org, issue date, expiry date; stored in secure Azure Blob Storage; file must be virus-scanned before storage.
- Certification expiry reminders: system sends notifications 90, 60, 30 days before expiry.
- Certification notification rule (Section 9.2): HR Admin receives a notification when a certification is uploaded for the FIRST TIME for a new skill category.
- Profile completion percentage calculated and displayed.
- Skill Progress tab: visual timeline chart showing proficiency changes over time per skill.
- Recommended skills shown based on department or role.
- Warning shown if skill rating not updated in 12 months.
- Project Experience Tagging: when employee is assigned to a project in the Project Allocation Module, relevant skills can be tagged to that project period. Upon project completion, tagged skills can be submitted for validation. Project completion triggers a prompt to the manager to endorse skills used. Skills from project experience require manager endorsement before becoming final.

Skill Table columns: Skill, Category, Sub Category, Self Rating, Manager Rating, Final Rating, Status, Last Updated.

Profile Tabs: My Skills, Certifications, Skill Progress, Project Experience.
API: Sections 19.3, 19.4 of requirement.md.
DB Tables: Employees, EmployeeSkills, SkillRatings, SkillSubmissions, Certifications, ProjectSkillTags.
DB Schemas: Refer to requirement.md Section 20.2 for exact column definitions — EmployeeSkills (10 fields incl. SelfRating, ManagerRating, PeerRating, SystemRating, FinalRating computed, Status), Certifications (10 fields incl. IssuingOrganization, ExpiryDate, FilePath, IsVerified).
```

### Step 4.2 — Plan

```
/speckit.plan use ASP.NET Core 8, EF Core 8, SQL Server, Azure Blob Storage, Angular 17, Clean Architecture
```

### Step 4.3 — Tasks

```
/speckit.tasks
```

---

## PHASE 5 — FEATURE: Skill Validation Workflow (Manager & HR Admin)
> Covers: Validation queue, approve/reject/override, peer validation, manager controls

### Step 5.1 — Specify

```
/speckit.specify Skill Validation Workflow Module for In Time Pro (ITP) Skill Matrix — Manager and HR Admin functionality.

Screens: Manager Dashboard, Team Skills Overview, Skill Validation Queue, Skill Validation Detail, Team Skill Report, Project Skill Matching (manager view).

Manager Dashboard Widgets (Section 6.2 — all must be implemented):
- Pending skill validations count
- Team skill coverage summary (chart)
- Employees with incomplete profiles
- Project skill match recommendations
- Recent validation activity feed

Validation Lifecycle: Submitted → Pending Manager Review → Approved / Rejected / Returned for Revision → Final Rating Published.

Features:
- Validation Queue: list of pending skill submissions from direct reports; sortable by employee and skill.
- Validation Detail: shows employee's self-rating, uploaded certifications, project experience evidence.
- Manager sets Manager Rating (can match or override self-rating); adds optional comment.
- Approve: marks submission Approved; triggers final rating calculation; notifies employee.
- Reject: mandatory rejection reason; notifies employee with reason.
- Override: Manager can adjust proficiency rating with documented justification.
- HR Admin override: can override any employee's rating across the org (PUT /api/v1/validation/{submissionId}/override).
- Manager can endorse project skills: validate skills gained through project experience (Section 10.1).
- Manager cannot view or edit skill profiles of employees outside their reporting line (enforced at API level).
- Peer Validation: team members submit peer ratings via structured form; peer rating carries 0.15 weight in final formula.
- Rating sources labeled distinctly in skill history: Self / Manager / Peer / System / Performance Review.

System-Generated Ratings (SystemRating field in EmployeeSkills):
- Auto-calculated by the system based on: (a) assessment scores from completed technical assessments, (b) number and recency of project skill tags, (c) valid certifications linked to the skill.
- SystemRating carries 0.15 weight in final rating formula.
- Updated automatically when: a new assessment result is recorded, a project tag is endorsed, or a certification is verified.

Performance Review Skill Updates (Section 9.4):
- During scheduled performance review cycles (configurable: quarterly / half-yearly / annually), managers can review and update skill ratings from within the performance review form.
- Skill updates originating from a performance review are recorded with source label "Performance Review" in SkillRatings table and visible in the skill rating history.
- Review cycle frequency is configurable by HR Admin.

Business rules: Employee cannot have final rating without at least one manager assessment. Rejection requires reason.
API: Section 19.5 of requirement.md.
DB Tables: SkillSubmissions, SkillRatings, EmployeeSkills, AuditLogs.
```

### Step 5.2 — Plan

```
/speckit.plan use ASP.NET Core 8, EF Core 8, SQL Server, Angular 17, Clean Architecture
```

### Step 5.3 — Tasks

```
/speckit.tasks
```

---

## PHASE 6 — FEATURE: Reporting & Analytics
> Covers: Skill gap analysis, org heatmap, team capability reports, demand vs supply, certification compliance, skill growth trends

### Step 6.1 — Specify

```
/speckit.specify Reporting and Analytics Module for In Time Pro (ITP) Skill Matrix — HR Admin and Leadership functionality.

Screens: Admin Dashboard, Skill Gap Analysis, Org Skill Heatmap, Certification Tracker, Executive Dashboard (Leadership), Department Gap Analysis, Skill Demand vs Supply, Report Export.

HR Admin Dashboard Widgets (Section 6.3 — all must be implemented):
- Organization skill health score
- Total skills tracked
- Skills pending approval (all teams)
- Expiring certifications in next 30/60/90 days
- Skill gap summary by department
- Recent system activity

Reports:
1. Skill Gap Analysis: compare required skills (defined by HR Admin per dept/role) vs current employee skill levels. Output: Department, Required Skill, Current Coverage %, Gap Level (Critical/High/Low). Reflects real-time data.
2. Team Capability Report: skill coverage and avg proficiency per skill per team. Manager+ access.
3. Org Skill Heatmap: color-coded grid — skill proficiency across all departments. Green=high coverage, Yellow=moderate, Red=critical gap. HR Admin + Leadership access. Auto-updates on skill approval.
4. Skill Demand vs Supply: project skill requirements vs available employee capabilities. Pulled from Project Allocation Module.
5. Certification Compliance Report: valid vs expired vs missing certifications per employee for required skill areas.
6. Skill Growth Trends: quarter-over-quarter or year-over-year proficiency growth across teams/org.

Export formats:
- HR Admin + Manager: PDF, Excel (.xlsx), CSV
- Leadership: PDF and Excel only — raw CSV export is NOT permitted for Leadership (requirement Section 11)
- All reports include Generated On timestamp and generating user's name.

Leadership Dashboard Widgets (requirement Section 6.4 — must all be implemented):
- Org-wide skill distribution heatmap
- Top skill categories across the organization
- Critical skill gaps by department
- Hiring vs training recommendation summary (indicates whether gap is better addressed by hiring externally or training existing employees)
- Quarter-over-quarter skill growth trends
- Certification compliance rate

UI Color & Status conventions (apply across ALL screens — requirement Section 22.3):
- Approved = Green, Pending Review = Orange/Amber, Rejected = Red, Draft = Grey, Expired = Dark Red
- Expert proficiency = Dark Blue, Advanced = Blue, Intermediate = Teal, Beginner = Light Blue
- Color is NEVER the sole status indicator — always accompany with icon or text label

UI/UX Design Principles (Section 22.1 — apply across ALL screens built in every phase):
- Consistency: unified design system aligned with existing ITP platform
- Role-Adaptive Navigation: sidebar and top nav dynamically render only links available to logged-in user's role
- Progressive Disclosure: employees see simplified views; admins see full management controls
- Feedback-First: every action (save, submit, approve) provides immediate visual feedback (toast notification or inline status update)

Access: Leadership = read-only, cannot edit any data. HR Admin = full access + export all formats.
API: Section 19.6 of requirement.md.
```

### Step 6.2 — Plan

```
/speckit.plan use ASP.NET Core 8, EF Core 8, SQL Server, Redis (report caching), Angular 17, Clean Architecture
```

### Step 6.3 — Tasks

```
/speckit.tasks
```

---

## PHASE 7 — FEATURE: Project Skill Matching
> Covers: Match employees to project skill requirements, skill match score, filters, recommendations

### Step 7.1 — Specify

```
/speckit.specify Project Skill Matching Module for In Time Pro (ITP) Skill Matrix — Manager and HR Admin functionality.

Screen: Project Skill Matching (Manager and HR Admin).

Workflow:
1. Manager defines required skills and minimum proficiency levels for a project.
2. System scans all employee skill profiles with Approved status only.
3. System calculates Skill Match Score per eligible employee.
   Formula: (Matched required skills / Total required skills) × 100; proficiency weight bonus applied when employee level exceeds minimum required.
4. Employees displayed ranked by match score.
5. Manager selects employees and raises allocation request in Project Module.

Filters: skill category, department/team, minimum proficiency level, availability (not currently 100% allocated).
Employees 100% allocated to another project are flagged but still shown in results.
Match score recalculated in real time as required skills are added or removed.
Results exportable as PDF report for project planning.

Only Approved skill status included in matching. Draft/Pending/Rejected/Expired skills excluded.
API: GET /api/v1/reports/project-matching of requirement.md.
```

### Step 7.2 — Plan

```
/speckit.plan use ASP.NET Core 8, EF Core 8, SQL Server, Angular 17, Clean Architecture
```

### Step 7.3 — Tasks

```
/speckit.tasks
```

---

## PHASE 8 — FEATURE: Notifications & Alerts
> Covers: All notification events, in-app notification bell, email notifications, notification preferences

### Step 8.1 — Specify

```
/speckit.specify Notifications and Alerts Module for In Time Pro (ITP) Skill Matrix.

Screens: Notifications list (all roles), Notification Settings (HR Admin), notification bell icon in top nav.

Notification Events (from requirement.md Section 13.1):
- Skill submission pending review → Manager (in-app + email)
- Skill submission approved → Employee (in-app + email)
- Skill submission rejected → Employee (in-app + email with reason)
- Certification uploaded for review → Manager, HR Admin (in-app)
- Certification uploaded for FIRST TIME in a new skill category → HR Admin (in-app notification, Section 9.2)
- Certification expiring in 90 days → Employee (in-app + email)
- Certification expiring in 30 days → Employee + Manager (in-app + email)
- Certification expired → Employee + Manager + HR Admin (in-app + email)
- Skill rating not updated for 12 months → Employee + Manager (in-app)
- Assessment scheduled → Employee (in-app + email)
- Assessment result published → Employee + Manager (in-app)
- New skill category added → All users (in-app)
- Profile completion below threshold → Employee (in-app)
- New employee account created (welcome email with credentials) → New Employee (email)
- Password reset requested → Employee (email with secure link, expires 30 min)
- Password changed confirmation → Employee (in-app + email)
- Account locked out → Employee (in-app + email)
- Account unlocked → Employee (in-app + email)
- Bulk import completed → Super Admin / HR Admin (in-app + email with row-level error summary)

Rules:
- In-app notifications: always shown; cannot be disabled; bell icon with unread count badge.
- Email notifications: configurable per user (can disable email, not in-app).
- Notifications marked as read when clicked.
- Email includes direct link to relevant screen.
- HR Admin configures global reminder thresholds (e.g., change 90-day cert alert to 60-day).

Notification Preferences — Per User Settings (Employee + Manager):
- Each Employee and Manager can configure their own email notification preferences from their profile/settings.
- Screen: "Notification Preferences" accessible from user profile menu for Employee and Manager roles.
- They can enable/disable email for each notification event type; in-app notifications cannot be disabled.
- HR Admin can configure global defaults and override thresholds (e.g., certification reminder days).
- Notification Settings screen in HR Admin section controls global rules and reminder thresholds for all users.

DB Tables: NotificationLogs.
Email: SMTP / SendGrid integration.
```

### Step 8.2 — Plan

```
/speckit.plan use ASP.NET Core 8, EF Core 8, SQL Server, SendGrid/SMTP, Angular 17, Clean Architecture
```

### Step 8.3 — Tasks

```
/speckit.tasks
```

---

## PHASE 9 — FEATURE: Technical Assessments
> Covers: Assessment scheduling by HR Admin/Manager, score-to-proficiency mapping, auto-recording results to skill profile, configurable thresholds

### Step 9.1 — Specify

```
/speckit.specify Technical Assessments Module for In Time Pro (ITP) Skill Matrix.

Screens: (HR Admin) Schedule Assessment screen, Assessment Management list; (Employee) My Assessments screen showing scheduled and completed assessments.

Features:
- HR Admin and Manager can schedule skill-based assessments for individual employees or entire teams.
- Assessment is linked to a specific SkillDefinition.
- Employees are notified when an assessment is scheduled (in-app + email).
- Assessment is administered through the ITP platform (questions and scoring handled internally).
- Upon completion, assessment score is automatically recorded against the employee's skill profile as a SkillRating record with source = "Assessment".
- AssessmentScoreToLevel mapping is configurable by HR Admin (e.g., score 0-25 = Beginner, 26-50 = Intermediate, 51-75 = Advanced, 76-100 = Expert).
- System-Generated Rating (SystemRating field in EmployeeSkills) is auto-updated when an assessment result is saved.
- Assessment result published notification sent to Employee + Manager (in-app).
- All assessment records are labeled distinctly as "Assessment" source in the skill rating history.
- HR Admin can view all scheduled and completed assessments across the org.
- Manager can view assessments for their direct reports.

DB Tables: Employees, SkillDefinitions, EmployeeSkills, SkillRatings (source = Assessment), AuditLogs.
New table needed: Assessments (AssessmentId, EmployeeId FK, SkillId FK, ScheduledBy FK → SystemUsers, ScheduledAt, CompletedAt, RawScore, MappedLevel, Status: Scheduled/Completed/Cancelled).
Stack: ASP.NET Core 8, EF Core 8, SQL Server, Angular 17.
```

### Step 9.2 — Plan

```
/speckit.plan use ASP.NET Core 8, EF Core 8, SQL Server, Angular 17, Clean Architecture
```

### Step 9.3 — Tasks

```
/speckit.tasks
```

---

## PHASE 10 — IMPLEMENT ALL FEATURES (run per feature at the end)

After all 9 features have their `spec.md`, `plan.md`, and `tasks.md` ready, switch to each feature branch and run implement.

> **Note:** Branch names are auto-generated by SpecKit when you run `/speckit.specify`. Run `git branch` in terminal to see the exact branch names created. The names below are examples — your actual branch names will be auto-generated.

### How to switch to a feature branch before implementing

In terminal:
```bash
git branch
```
(lists all created branches — use the exact names from this output)

```bash
git checkout 001-authentication-security
```
Then in Copilot Chat:
```
/speckit.implement Start the implementation in phases
```

Repeat for each feature:
```bash
git checkout 002-user-management
```
```
/speckit.implement Start the implementation in phases
```

```bash
git checkout 003-skill-framework-management
```
```
/speckit.implement Start the implementation in phases
```

```bash
git checkout 004-employee-skill-profile
```
```
/speckit.implement Start the implementation in phases
```

```bash
git checkout 005-skill-validation-workflow
```
```
/speckit.implement Start the implementation in phases
```

```bash
git checkout 006-reporting-analytics
```
```
/speckit.implement Start the implementation in phases
```

```bash
git checkout 007-project-skill-matching
```
```
/speckit.implement Start the implementation in phases
```

```bash
git checkout 008-notifications-alerts
```
```
/speckit.implement Start the implementation in phases
```

```bash
git checkout 009-technical-assessments
```
```
/speckit.implement Start the implementation in phases
```

---

## MODULE INTEGRATIONS (Section 15 of requirement.md)

These integrations connect the Skill Matrix to other ITP modules. The Skill Matrix module must handle graceful degradation when these external modules are unavailable.

| Integration | What is needed from Skill Matrix side |
|---|---|
| **Employee Profile Module** (Section 15.1) | Read employee's Department, Designation, ReportingManagerId from the Employee Profile to drive RBAC rules. If ReportingManagerId changes, skill validation routing must auto-update to new manager. |
| **Project Allocation Module** (Section 15.2) | Consume project skill requirements for Skill Matching engine. When employee assigned to project, allow skill tagging for that period. Project completion triggers manager endorsement prompt. |
| **Performance Review Module** (Section 15.3) | Skill Matrix section embedded in performance review form. Skill updates from review labeled with review cycle name in audit trail. Manager completes skill validation + performance review in single workflow. |
| **L&D Module** (Section 15.4) | Skill gaps auto-surfaced as learning recommendations in L&D. Course completion in L&D can trigger a pending skill level update (requires manager confirmation). Certifications earned through L&D auto-link to the employee's certification profile. |

> These integrations are **in-scope for V1** but depend on other modules being available. Implement with graceful degradation — if the external module API is unavailable, Skill Matrix core functions must still work.

---

## OPTIONAL ENHANCEMENT COMMANDS

Use these between steps to improve quality:

| When to Use | Command | Purpose |
|---|---|---|
| After `specify`, before `plan` | `/speckit.clarify` | AI asks structured questions to remove ambiguity |
| After `tasks`, before `implement` | `/speckit.analyze` | Cross-artifact consistency check |
| After `plan` | `/speckit.checklist` | Validate requirements completeness |

---

## FINAL FOLDER STRUCTURE (after all phases)

```
specs/
├── 001-authentication-security/
│   ├── spec.md
│   ├── plan.md
│   ├── research.md
│   ├── data-model.md
│   ├── contracts/
│   └── tasks.md
├── 002-user-management/
│   └── ...
├── 003-skill-framework-management/
│   └── ...
├── 004-employee-skill-profile/
│   └── ...
├── 005-skill-validation-workflow/
│   └── ...
├── 006-reporting-analytics/
│   └── ...
├── 007-project-skill-matching/
│   └── ...
├── 008-notifications-alerts/
│   └── ...
└── 009-technical-assessments/
    └── ...
.specify/memory/constitution.md   ← filled once in Phase 0
```

## ALL DB TABLES COVERAGE CHECK

| Table (requirement Section 20) | Covered In Phase |
|---|---|
| Employees | Phase 2, Phase 4, Phase 5, Phase 9 |
| SkillCategories | Phase 3 |
| SkillSubCategories | Phase 3 |
| SkillDefinitions | Phase 3 |
| ProficiencyLevels | Phase 3 |
| EmployeeSkills | Phase 4, Phase 5 |
| SkillRatings | Phase 4, Phase 5, Phase 9 |
| SkillSubmissions | Phase 4, Phase 5 |
| Certifications | Phase 4 |
| ProjectSkillTags | Phase 4 |
| AuditLogs | Phase 2, Phase 5 |
| NotificationLogs | Phase 8 |
| RatingWeightConfig | Phase 3 |
| SystemUsers | Phase 1 |
| UserRoles | Phase 1 |
| RefreshTokens | Phase 1 |
| PasswordResetTokens | Phase 1 |
| Assessments (new) | Phase 9 |