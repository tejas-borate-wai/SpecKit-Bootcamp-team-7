Skill Matrix Application – Requirements
1. Overview
The Skill Matrix Application is designed to evaluate, track, and manage employee skills within an organization.
Employees can take skill assessments to measure their proficiency, while managers can use this information to assign the best candidates to projects based on skill matching.
The system will initially run using mock data and static users instead of a real backend.
Key Goals
Evaluate employee skills through assessments
Track skill growth and progress
Help managers identify the best candidates for projects
Provide insights into organizational skill capabilities
Enable smarter project team building
2. Skill Structure
Skills must be organized using a hierarchical structure.
Skill Categories
High-level groups of related skills.
Examples:
Development
QA
Cloud
DevOps
Data Engineering
AI / Machine Learning
Communication
Project Management
Sub-Categories
Sub-groups under each skill category.
Example:
Development
Frontend
Backend
Mobile
Cloud
AWS
Azure
Google Cloud
DevOps
CI/CD
Containerization
Infrastructure
Skill Names
Examples:
Frontend
React
Angular
Vue
HTML
CSS
JavaScript
TypeScript
Backend
Java
Node.js
Python
.NET
Spring Boot
Mobile
Flutter
React Native
Kotlin
Swift
Database
SQL
PostgreSQL
MongoDB
Redis
DevOps
Docker
Kubernetes
Jenkins
Terraform
Skill Definitions
Each skill must include a description.
Example:
Skill: Flutter
Definition:
Flutter is a UI toolkit developed by Google used to build cross-platform mobile applications using a single codebase.
3. Skill Levels / Proficiency Framework
Each skill must have defined proficiency levels.

Level | Score | Description | Example Criteria
Beginner | 1 | Basic knowledge with minimal practical experience | Can follow tutorials, needs guidance on standard tasks, limited to simple implementations
Intermediate | 2 | Working knowledge, able to perform common tasks independently | Can build features without help, understands core concepts, writes clean code for standard requirements
Advanced | 3 | Strong expertise, can design complex solutions and guide others | Can architect modules, conduct code reviews, solve non-trivial problems, mentor juniors
Expert | 4 | Deep technical mastery, defines standards and best practices | Leads technical decisions, innovates solutions, mentors teams, recognized authority in the skill

Notes:
- Numeric scores (1–4) are used internally for calculations and comparisons
- Both the percentage rating and the level label must be shown together on all screens
- Proficiency level thresholds (mapped from percentage): 0–40% → Beginner, 41–65% → Intermediate, 66–85% → Advanced, 86–100% → Expert
4. Skill Rating Mechanism
Skill proficiency is evaluated using multiple methods that combine into a final rating.

4.1 Rating Sources
Self Assessment
Employees rate their own skill level (1–4 scale).
Manager Assessment
Managers review and validate employee skills. Manager assessment carries the highest weight.
Peer Validation
Team members provide feedback on a colleague's skill via a structured rating form.
System Generated Rating
Automatically calculated based on: test scores, certifications, and project experience.

4.2 System Generated Rating Formula
System Rating =
  (Test Score × 0.60) +
  (Certification Bonus × 0.20) +
  (Project Experience × 0.20)

Certification Bonus: If employee holds a valid certification for the skill → full 20%. No cert → 0%.
Project Experience: If employee tagged the skill on a completed project → full 20%. No tag → 0%.

4.3 Final Rating Formula (combines all sources)
Final Rating =
  (Self Rating × 0.20) +
  (Manager Rating × 0.30) +
  (Peer Rating × 0.15) +
  (System Rating × 0.35)

Note: If a rating source is not yet available (e.g., no manager assessment yet), that weight is redistributed proportionally among the remaining sources.

4.4 Rating Confidence Indicator
The UI must show how reliable a rating is:
🟢 High Confidence — 3+ sources available (e.g., test + cert + manager review)
🟡 Medium Confidence — 2 sources (e.g., test + self only)
🔴 Low Confidence — 1 source only (e.g., self-assessed, no test taken)

4.5 Peer Validation Workflow
- When an employee submits a skill for validation, the system allows the employee to select 2–3 peers from their team.
- Selected peers receive a notification requesting validation.
- Each peer submits a rating (1–4 scale) via a structured form with optional comment.
- Minimum 2 peer responses required for peer rating to be included in the formula.
- If fewer than 2 peers respond within 7 days, peer weight is redistributed to other sources.
- Peers can only validate skills they also have in their own profile (prevents unqualified reviews).
5. Skill Assessment Methods
Technical Assessments
Each skill includes an assessment test.
Structure:
5–10 questions
Multiple choice answers
One correct answer per question
Question Structure
Question
questionText
options
correctAnswer
difficultyLevel (Easy / Medium / Hard)
Test Configuration
Each skill test supports:
Time limit (default 15 minutes)
Configurable question count
Difficulty tags
Test Status
Each skill should display assessment status:
Not Attempted
In Progress
Completed
Retake Rules
To prevent gaming:
Retake allowed only after 24 hours
Question order randomized each attempt
Certification Uploads
Employees can upload certifications related to skills.
Supported formats:
PDF
JPG / PNG
Certification data includes:
Certification Name
Issuing Organization
Issue Date
Expiry Date
Certification Benefits
Approved certifications provide:
Certified Badge
+10% rating bonus (max 100%)
Example:
Test Score → 75%
Certification Bonus → +10%
Final Rating → 85%
Project Experience Tagging
Employees may tag skills used in completed projects.
Example:
Project: Banking App
Skills Used:
Flutter
Firebase
REST API
Periodic Evaluations
Managers can conduct skill reviews during performance evaluations.
6. Employee Skill Profile
Employees maintain a personal skill profile.
Employees can:
Add or Update Skills
Add new skills or modify existing ones.
Complete Skill Assessments
Take skill exams to determine proficiency.
Upload Certifications
Upload and manage certifications.
Delete Skills
Employees may remove a skill from their active profile. Deleted skills are retained in history for audit and progress tracking but hidden from the active profile view. Deleting a skill does not affect project matching history.
Track Skill Progress
The system stores all skill attempts and shows improvement over time.
Progress Visualization
Line chart showing score trend
Best score vs latest score comparison
Example:
Flutter Progress
Jan → 60%
Apr → 72%
Jul → 85%
View Proficiency Levels
Skills display:
Rating percentage
Proficiency level
Certified badge
Example:
Flutter
Rating: 82%
Level: Advanced
✔ Certified
Personal Skill Dashboard
Employees see:
Skills list
Certification badges
Skill progress charts
Profile completion score
Example:
Skills Assessed → 6 / 10
Profile Completion → 60%
Skills not attempted are highlighted with:
Take Assessment
Skill Expiry Rule
If a skill rating has not been updated (via test retake, certification, or manager review) for 6 months, the system:
- Marks the skill as "Stale" with a warning badge
- Sends a notification to the employee: "Your [Skill Name] rating is outdated. Retake the assessment to keep it current."
- Stale skills are still shown in the profile but flagged visually (amber border)
- Stale skills are excluded from project candidate matching results
- Employee can clear the stale status by retaking the assessment or getting a manager review

Dashboard Screens by Role

Employee Dashboard:
- Skills list with rating + level + badge
- Profile completion percentage (skills assessed / total available)
- Skills not yet assessed shown as gap cards with "Start Assessment" CTA
- Certification badges and expiry alerts
- Skill progress chart (line chart per skill)
- Recent activity feed (last 5 actions: assessments taken, certs uploaded)
- Achievement badges earned

Manager Dashboard:
- Pending skill approvals count
- Team skill strength summary (chart: skill coverage across team)
- Employees with incomplete profiles
- Stale skills needing team attention
- Project skill match recommendations
- Team availability overview
- Recent team activity feed

Admin Dashboard:
- Organization-wide skill health score
- Total skills tracked across all employees
- Skill gap summary by department
- Org skill heatmap (top-level view)
- Certification compliance rate
- Most common skill gaps
- User count by role
7. Manager / Admin Controls
Managers and administrators manage organizational skill data.
Approve Skills
Managers can approve employee skills or certifications.
Manage Skill Categories
Admins can create or modify skill categories.
Define Skill Framework
Admins configure:
Proficiency levels
Rating scales
Certification bonus logic
Track Team Skill Distribution
Managers can view dashboards showing:
Team skill strengths
Skill gaps
Available employees
Role-Based Access Control

Action | Employee | Manager | Admin
Add / update own skills | ✔ | ✔ | ✔
Delete own skills | ✔ | ✔ | ✔
Take skill assessments | ✔ | ✔ | ✔
Upload certifications | ✔ | ✔ | ✔
View own skill profile | ✔ | ✔ | ✔
View own skill progress | ✔ | ✔ | ✔
Request peer validation | ✔ | ✔ | ✔
Submit peer validation for others | ✔ | ✔ | ✔
Approve / validate skills | ❌ | ✔ | ✔
View team skill profiles | ❌ | ✔ | ✔
View team skill reports | ❌ | ✔ | ✔
Create projects | ❌ | ✔ | ✔
Match candidates to project | ❌ | ✔ | ✔
Build project teams | ❌ | ✔ | ✔
View employee availability | ❌ | ✔ | ✔
Export reports (PDF / Excel) | ❌ | ✔ | ✔
Manage skill categories | ❌ | ❌ | ✔
Manage subcategories | ❌ | ❌ | ✔
Define skill framework | ❌ | ❌ | ✔
Configure rating weights | ❌ | ❌ | ✔
View org-wide heatmap | ❌ | ❌ | ✔
View org-wide skill gap analysis | ❌ | ❌ | ✔
Manage all employee skills | ❌ | ❌ | ✔

7A. Role-Based UI, Navigation, and Access Rules

This section defines exactly what each role sees in the UI — sidebar menus, accessible screens, visible/hidden controls, route guards, and redirect behavior. The UI must adapt completely based on the logged-in user's role.

---

7A.1 Sidebar Navigation Menu Per Role

The sidebar renders dynamically — only menu items the logged-in role is allowed to see are rendered in the DOM. Items are not just hidden with CSS; they must not exist in the HTML for unauthorized roles.

EMPLOYEE Sidebar:
  MAIN
  ├── Dashboard              (/dashboard)
  ├── My Skills              (/my-skills)
  ├── Assessments            (/assessments)
  ├── Certifications         (/certifications)
  └── Notifications          (/notifications)

MANAGER Sidebar:
  MAIN
  ├── Dashboard              (/dashboard)
  ├── My Skills              (/my-skills)
  ├── Assessments            (/assessments)
  ├── Certifications         (/certifications)
  ├── Notifications          (/notifications)
  TEAM
  ├── Team Skills            (/team/skills)
  ├── Skill Validation Queue (/team/validation)
  ├── Project Matching       (/team/matching)
  PROJECTS
  ├── Projects               (/projects)
  └── Team Builder           (/projects/team-builder)

ADMIN Sidebar:
  MAIN
  ├── Dashboard              (/dashboard)
  ├── My Skills              (/my-skills)
  ├── Assessments            (/assessments)
  ├── Certifications         (/certifications)
  ├── Notifications          (/notifications)
  TEAM
  ├── Team Skills            (/team/skills)
  ├── Skill Validation Queue (/team/validation)
  ├── Project Matching       (/team/matching)
  PROJECTS
  ├── Projects               (/projects)
  └── Team Builder           (/projects/team-builder)
  INSIGHTS
  ├── Reports                (/reports)
  └── Org Skill Heatmap      (/reports/heatmap)
  SETTINGS
  ├── Skill Framework        (/admin/skill-framework)
  │     ├── Categories       (/admin/skill-framework/categories)
  │     ├── Subcategories    (/admin/skill-framework/subcategories)
  │     └── Skill Definitions(/admin/skill-framework/skills)
  └── Rating Configuration   (/admin/rating-config)

---

7A.2 Screen / Route Inventory Per Role

Screen | Route | Employee | Manager | Admin
Login | /login | ✔ | ✔ | ✔
Dashboard | /dashboard | ✔ | ✔ | ✔
My Skills List | /my-skills | ✔ | ✔ | ✔
Skill Detail | /my-skills/:skillId | ✔ | ✔ | ✔
Add Skill | /my-skills/add | ✔ | ✔ | ✔
Edit Skill | /my-skills/:skillId/edit | ✔ | ✔ | ✔
Assessments List | /assessments | ✔ | ✔ | ✔
Take Assessment | /assessments/:skillId/take | ✔ | ✔ | ✔
Assessment Result | /assessments/:skillId/result | ✔ | ✔ | ✔
Certifications List | /certifications | ✔ | ✔ | ✔
Upload Certification | /certifications/upload | ✔ | ✔ | ✔
Notifications | /notifications | ✔ | ✔ | ✔
Team Skills Overview | /team/skills | ❌ | ✔ | ✔
Employee Skill Profile (any) | /team/skills/:employeeId | ❌ | ✔ | ✔
Skill Validation Queue | /team/validation | ❌ | ✔ | ✔
Validation Detail | /team/validation/:submissionId | ❌ | ✔ | ✔
Project Matching | /team/matching | ❌ | ✔ | ✔
Projects List | /projects | ❌ | ✔ | ✔
Create Project | /projects/create | ❌ | ✔ | ✔
Project Detail | /projects/:projectId | ❌ | ✔ | ✔
Team Builder | /projects/team-builder | ❌ | ✔ | ✔
Reports | /reports | ❌ | ✔ (team only) | ✔ (org-wide)
Skill Gap Analysis | /reports/skill-gap | ❌ | ✔ (own team) | ✔ (all teams)
Team Capability Report | /reports/team | ❌ | ✔ | ✔
Org Skill Heatmap | /reports/heatmap | ❌ | ❌ | ✔
Skill Trend Analysis | /reports/trends | ❌ | ✔ (team) | ✔ (org-wide)
Skill Framework – Categories | /admin/skill-framework/categories | ❌ | ❌ | ✔
Skill Framework – Subcategories | /admin/skill-framework/subcategories | ❌ | ❌ | ✔
Skill Framework – Definitions | /admin/skill-framework/skills | ❌ | ❌ | ✔
Rating Configuration | /admin/rating-config | ❌ | ❌ | ✔

---

7A.3 UI Element Visibility Rules Per Screen

The following controls are conditionally shown/hidden/disabled based on the logged-in role.
Rule: unauthorized controls must be REMOVED from the DOM (not just hidden with display:none).

MY SKILLS LIST screen:
  Control | Employee | Manager | Admin
  "Add Skill" button | ✔ visible | ✔ visible | ✔ visible
  "Delete" option in skill row menu | ✔ own skills only | ✔ own skills only | ✔ any skill
  "Edit" option in skill row menu | ✔ own skills only | ✔ own skills only | ✔ any skill
  "Override Rating" button | ❌ hidden | ❌ hidden | ✔ visible

SKILL VALIDATION QUEUE screen (Manager/Admin only):
  Control | Manager | Admin
  "Approve" button | ✔ own team only | ✔ all employees
  "Reject" button | ✔ own team only | ✔ all employees
  "Override Rating" button | ❌ hidden | ✔ visible

PROJECTS LIST screen:
  Control | Manager | Admin
  "Create Project" button | ✔ visible | ✔ visible
  "Delete Project" button | ✔ own projects | ✔ all projects
  "Edit Project" button | ✔ own projects | ✔ all projects

REPORTS screen:
  Control | Manager | Admin
  Team-level report data | ✔ own team only | ✔ all teams
  Org-wide heatmap tab | ❌ tab hidden | ✔ visible
  Org-wide gap analysis tab | ❌ tab hidden | ✔ visible
  "Export CSV" button | ✔ visible | ✔ visible
  "Export PDF" button | ✔ visible | ✔ visible

ADMIN SETTINGS screens (Admin only):
  All controls (CRUD for categories, subcategories, skills, rating weights) are
  not rendered at all for Employee and Manager roles — the entire route is blocked.

TEAM SKILLS OVERVIEW screen (Manager/Admin only):
  Control | Manager | Admin
  Employee rows visible | own team only | all employees
  "View Profile" link | ✔ visible | ✔ visible
  "Send Validation Request" | ✔ visible | ✔ visible

---

7A.4 Route Guard Rules (Angular Implementation)

Every protected route must have an Angular CanActivate route guard checking the logged-in user's role from the NgRx store (or localStorage session).

Guard behavior:
- Unauthenticated user accessing any route → redirect to /login
- Authenticated user accessing a route not permitted for their role → redirect to /unauthorized
- /unauthorized page shows: "Access Denied. You do not have permission to view this page." with a "Go to Dashboard" button
- After login, redirect based on role:
    Employee → /dashboard (Employee Dashboard)
    Manager  → /dashboard (Manager Dashboard)
    Admin    → /dashboard (Admin Dashboard)
  (Same /dashboard route renders different dashboard component based on role)

Route guard matrix:
Route | Guard Required | Allowed Roles
/dashboard | AuthGuard | Employee, Manager, Admin
/my-skills/** | AuthGuard | Employee, Manager, Admin
/assessments/** | AuthGuard | Employee, Manager, Admin
/certifications/** | AuthGuard | Employee, Manager, Admin
/notifications | AuthGuard | Employee, Manager, Admin
/team/** | AuthGuard + RoleGuard(['Manager','Admin']) | Manager, Admin
/projects/** | AuthGuard + RoleGuard(['Manager','Admin']) | Manager, Admin
/reports | AuthGuard + RoleGuard(['Manager','Admin']) | Manager, Admin
/reports/heatmap | AuthGuard + RoleGuard(['Admin']) | Admin only
/admin/** | AuthGuard + RoleGuard(['Admin']) | Admin only

---

7A.5 Post-Login Redirect and Dashboard Rendering

The /dashboard route is shared across all roles but renders a different component:
- Role = Employee → renders EmployeeDashboardComponent
- Role = Manager  → renders ManagerDashboardComponent
- Role = Admin    → renders AdminDashboardComponent

Dashboard component selection is handled by a role-resolver or ngSwitch in the dashboard container. The sidebar, header role badge, and available actions all update automatically to match the role.

---

7A.6 UI Feedback for Restricted Actions

If a user somehow reaches a control they should not see (e.g., via URL manipulation):
- API call returns 403 (mock interceptor returns 403 for unauthorized role)
- UI shows: toast notification "You do not have permission to perform this action."
- No data is returned or modified

8. Reporting & Insights
Analytics help leaders understand workforce capabilities.
Skill Gap Analysis
Compare required project skills vs team skills.
Example:
Required → Kubernetes 70%
Team Avg → 45%
Gap → 25%
Team Capability Reports
Managers can view skill distribution across teams.
Project Skill Matching
System recommends best employees based on:
Skill rating
Certifications
Availability
Organization Skill Heatmaps
Example:
Skill | Beginner | Intermediate | Advanced | Expert
Flutter | 10 | 5 | 3 | 1
React | 8 | 6 | 4 | 2
Skill Trend Analysis
Track skill growth across teams over time.

Report Export Formats
All reports must support export:
- Skill Gap Analysis → PDF, Excel
- Team Capability Report → PDF, Excel
- Org Skill Heatmap → PDF, Image (PNG)
- Candidate Matching Results → PDF
- Employee Skill List → CSV, Excel
- Skill Trend Analysis → PDF
All exports include: report title, generated on date, and generating user's name.
9. Integration with Existing Modules
Employee Profiles
Skills appear inside employee profile.
Project Allocation
Managers assign employees to projects based on skills.
Managers can see current project alignment.
Example:
Employee | Role | Current Project | Availability
Krishna | Flutter Developer | Banking App | Busy
Neha | Frontend Developer | None | Available
Performance Reviews
Skill improvements and certifications contribute to reviews.
Learning & Development Programs
System recommends training when skill gaps appear.
Example:
Employee: Amit
Skill: Kubernetes → 45%
Suggested Training:
Kubernetes Fundamentals
Docker Training
10. User Experience & Workflow
The system should be intuitive and easy to use.
Easy Navigation
Users can access:
Skills
Certifications
Assessments
Reports
Skill Update Workflow
Employees:
Add skills
Take assessment
Upload certification
View updated rating
Search and Filtering
Users can search employees by:
Skill
Department
Proficiency level
Certification
Availability
Notifications and Reminders
System sends alerts for:
Skill approvals
Assessment results
Certification expiry
Skill gap training suggestions
Responsive Design
The application must support all screen sizes without any functionality being lost. Refer to Section 18 for the full responsive design specification.

Design principles:
Card layouts
Skill badges
Charts
Progress indicators
11. Skill Assessments
Each skill includes a structured exam.
Features:
Time limit (15 minutes default)
Randomized questions
Difficulty levels
Retake cooldown (24 hours)
Test history shows all previous attempts.
12. Rating Calculation
Skill ratings use a two-layer weighted scoring system (see Section 4 for full details).

Layer 1 — System Generated Rating:
System Rating =
  (Test Score × 0.60) +
  (Certification Bonus × 0.20) +
  (Project Experience × 0.20)

Test Score Calculation (with difficulty weighting):
  Easy question correct   → 1 point
  Medium question correct → 2 points
  Hard question correct   → 3 points
  Test Score = (earned points / max possible points) × 100

Layer 2 — Final Rating (combines all sources):
Final Rating =
  (Self Rating × 0.20) +
  (Manager Rating × 0.30) +
  (Peer Rating × 0.15) +
  (System Rating × 0.35)

Level Mapping:
0–40%   → Beginner
41–65%  → Intermediate
66–85%  → Advanced
86–100% → Expert

Post-Assessment Score Card:
After each test, display a breakdown card showing:
- Test score (weighted by difficulty)
- Certification bonus applied (if any)
- Project experience bonus applied (if any)
- System rating result
- Final rating (if all sources available)
- Level achieved
- Level change indicator (e.g., "⬆ Intermediate → Advanced")
13. Skill Progress Tracking
Track improvement using:
Score history
Line chart visualization
Best vs latest score
Achievement badges
Examples:
First Assessment
Reached Advanced
Improved by 20%
14. Project Creation
Managers create projects.
Fields include:
Project Name
Description
Status
Start Date
Deadline
Required Roles
Required Skills
Created By
Project statuses:
Draft
Open
In Progress
Completed
15. Candidate Matching
Candidates are ranked using Match Score.
Formula:
Match Score =
(Skills Matched / Skills Required) × 100
Match Breakdown
Skill | Required | Candidate | Status
Flutter | Advanced | Expert | Exceeds
Firebase | 60% | 45% | Below
REST API | 50% | 72% | Meets
Availability Integration
Candidates display availability:
Available ✅
Busy ❌
Managers can assign candidates using:
Add to Project
Filters include:
Department
Availability
Minimum match score
Matched candidates can be exported as PDF.
16. Project Team Builder
Managers build teams for projects.
Example:
Banking App
Flutter Developer ×2
Backend Developer ×1
QA Engineer ×1
Skill Gap Detection
If no candidate meets requirements:
System flags skill gap.
Example:
Required → Kubernetes 70%
Highest Skill → 45%
Gap → 25%
Learning Path Suggestions
System recommends training for employees closest to requirement.
17. Employee Availability & Project Alignment
Managers can see employee assignments and availability status.

Availability Statuses:
- Available — not assigned to any active project
- Partially Available — assigned to a project but has capacity for additional work
- Busy — fully assigned to one or more active projects

Availability Rules:
- When an employee is added to a project via Team Builder, their status automatically changes to Busy
- When a project is marked as Completed, all assigned employees are automatically set back to Available
- Employees can manually set themselves to "Partially Available" from their profile
- Managers can override an employee's availability status with a reason logged
- Candidate matching (Section 15) uses availability as a filter: Available shown first, Partially Available shown with warning, Busy shown last and greyed out

Project Alignment View:
Employee | Role | Current Project | Status | Since
Krishna | Flutter Developer | Banking App | Busy | Feb 2026
Neha | Frontend Developer | None | Available | —
Amit | Backend Developer | CRM Portal | Partially Available | Jan 2026
18. UI Requirements and Responsive Design Specification

18.1 Breakpoints

The application uses a mobile-first approach with the following breakpoints:

Breakpoint | Name | Min Width | Target Devices
xs | Mobile (small) | 0px | Phones (portrait): iPhone SE, Android small
sm | Mobile (large) | 480px | Phones (landscape), large phones
md | Tablet | 768px | iPad, Android tablets (portrait)
lg | Desktop (small) | 1024px | iPad Pro (landscape), small laptops
xl | Desktop (standard) | 1280px | Standard laptops, 13"/14" screens
2xl | Desktop (large) | 1440px+ | Full HD monitors, 16"+ screens

Primary supported sizes: Mobile (360–480px), Tablet (768–1024px), Desktop (1280px+).
All features must be fully usable at all three primary sizes — nothing is hidden or disabled for mobile/tablet.

---

18.2 Layout Behavior Per Breakpoint

SIDEBAR NAVIGATION:
- Desktop (lg+): Fixed sidebar 240px wide, always visible, full text + icons
- Tablet (md): Sidebar collapses to icon-only mode (64px wide), hover shows tooltip labels, hamburger icon in header expands to full sidebar as an overlay
- Mobile (xs/sm): Sidebar hidden completely, accessed via hamburger menu (☰) in top header, opens as a full-screen drawer from the left side with close (✕) button, overlay darkens the background

TOP HEADER BAR:
- Desktop: Logo + Page Title (left), Search bar (center, 400px wide), Notifications bell + Avatar (right)
- Tablet: Logo + Page Title (left), Notifications bell + Avatar (right), Search bar moves below header as a collapsible bar when search icon is tapped
- Mobile: Logo (left), Hamburger menu icon (left of logo), Notifications bell (right), Avatar (right), Page title hidden or shown as 1-line truncated text below header

MAIN CONTENT AREA:
- Desktop: max-width 1440px, centered with padding 0 48px, multi-column grid layouts
- Tablet: full width, padding 0 24px, reduced columns
- Mobile: full width, padding 0 16px, single column stack

---

18.3 Component Behavior Per Breakpoint

STAT CARDS (Dashboard):
- Desktop (xl+): 4 cards in a row (25% each)
- Tablet (md): 2 cards per row (50% each)
- Mobile (sm and below): 1 card per row (100%), stacked vertically

SKILL LIST TABLE:
- Desktop: Full table with all columns: Skill | Category | Level Badge | Rating | Status | Last Updated | Actions
- Tablet: Show: Skill | Level Badge | Rating | Status | Actions (hide Category and Last Updated, accessible on row expand)
- Mobile: Convert table to card list — each row becomes a card showing Skill Name (bold), Level Badge pill, Rating %, Status pill, and a three-dot menu icon. No horizontal scrolling.

SKILL ASSESSMENT (Test Screen):
- Desktop: Question card centered at max-width 720px, timer top-right, progress bar full width
- Tablet: Full-width question card, all controls same, slightly larger tap targets
- Mobile: Full-screen question card, options stacked vertically (not 2×2 grid), timer shown as compact badge top-right, navigation buttons (Previous / Next) full-width at bottom of screen, sticky at viewport bottom

PROJECT CANDIDATE MATCH CARDS:
- Desktop: Side-by-side layout — filters panel (left 300px) + candidate cards grid (right, 2 columns)
- Tablet: Filters collapse into a "Filter" button that opens a bottom sheet, candidate cards single column
- Mobile: Filters accessible via a floating "Filter" FAB button (bottom-right), candidate cards full-width single column

CHARTS (Progress charts, Heatmap, Reports):
- Desktop: Full-size chart, all axis labels visible, legend shown beside chart
- Tablet: Chart scales to 100% container width, legend moves below chart
- Mobile: Chart height reduced (max 250px), only key data points shown, pinch-to-zoom enabled, legend hidden by default (tap to show). Chart is horizontally scrollable if data exceeds screen width (do not clip data).

DATA TABLES (Team Skills Overview, Reports, Project Alignment):
- Desktop: Full multi-column table with sorting headers
- Tablet: Reduced columns, horizontal scroll enabled within a fixed-height scroll container
- Mobile: Table replaced with an expandable card list — tap a row to expand full details. Show only Name + key status column in collapsed state.

FORMS (Add Skill, Upload Certification, Create Project):
- Desktop: Two-column form layout for fields where logical (e.g., Issue Date | Expiry Date side by side)
- Tablet: Two-column where space allows, single column for narrow fields
- Mobile: All fields single column, labels stacked above inputs (not inline), full-width inputs, submit button full-width and sticky at bottom of form

MODAL DIALOGS and SLIDE-OVER PANELS:
- Desktop: Modal centered (max-width 560px), slide-over panels from right (480px wide)
- Tablet: Modal full-width with 24px horizontal margin, slide-over becomes full-width bottom sheet
- Mobile: All modals and slide-overs become full-screen bottom sheets that slide up from the bottom, with a drag handle at the top and close (✕) button top-right

NOTIFICATION TOASTS:
- Desktop: Slide in from top-right corner, max-width 360px
- Tablet: Slide in from top-center, max-width 90%
- Mobile: Full-width at top of screen (100% viewport width, no margin), or bottom of screen above navigation

---

18.4 Touch and Interaction Rules for Mobile/Tablet

- All tap targets must be minimum 44×44px (Apple HIG and WCAG standard)
- No hover-only interactions — every hover action must have a tap equivalent
- Swipe gestures:
    Swipe left on a skill card → reveals quick action buttons (Retake Assessment, Delete)
    Swipe right to close a bottom sheet or drawer
- No double-tap or long-press required for any primary action
- Bottom navigation bar on mobile (xs/sm) for primary routes:
    Tab 1: Dashboard (grid icon)
    Tab 2: My Skills (layers icon)
    Tab 3: Assessments (clipboard icon)
    Tab 4: Notifications (bell icon)
    Tab 5: More (three dots → opens remaining nav items as a list)
  Manager/Admin see additional tabs in the "More" sheet.
- Floating Action Button (FAB): On mobile, the primary action per screen is a floating button (bottom-right):
    My Skills screen → FAB = "Add Skill" (+)
    Projects screen → FAB = "Create Project" (+)
    Certifications screen → FAB = "Upload Certification" (+)

---

18.5 Typography Scaling Per Breakpoint

Element | Desktop | Tablet | Mobile
Page Heading (H1) | 28px / 700wt | 24px / 700wt | 20px / 700wt
Section Heading (H2) | 20px / 600wt | 18px / 600wt | 16px / 600wt
Card Title | 16px / 600wt | 15px / 600wt | 14px / 600wt
Body Text | 14px / 400wt | 14px / 400wt | 14px / 400wt
Labels / Captions | 12px / 500wt | 12px / 500wt | 11px / 500wt
Button Text | 14px / 500wt | 14px / 500wt | 14px / 500wt

---

18.6 Image and Icon Behavior

- All user avatar images use object-fit: cover in a fixed circle (40px desktop, 36px mobile)
- SVG icons scale with font size — never use fixed pixel sizes on icons
- Skill category icons (if used) are SVG and crisp at all densities (1x, 2x, 3x retina)
- Chart illustrations and empty-state SVGs scale to max 280px on mobile, max 360px on desktop

---

18.7 Responsive Angular Implementation Notes

- Use Angular CDK BreakpointObserver to detect breakpoint changes in components
- Define breakpoint tokens in a central breakpoints.ts constants file
- Use CSS custom properties (variables) for spacing and font sizes, changing values via media queries
- Use Angular Flex Layout or CSS Grid with auto-fill/auto-fit for card grids
- All responsive layout changes must be in SCSS — never apply inline responsive styles in TypeScript
- Test all screens at: 375px (iPhone SE), 768px (iPad), 1280px (laptop), 1440px (desktop)
19. Animations
UI includes smooth animations:
Page transitions
Skill progress bars
Test completion success animation
20. Testing Requirements
Unit tests must cover:
Login validation
Skill rating calculation (weighted formula with difficulty)
Skill level mapping (percentage → level)
Skill add / edit / delete functionality
Certification upload validation (format, size, required fields)
Candidate matching algorithm (match score + availability filter)
Skill gap analysis accuracy
Reporting modules (correct data + export)
Notification triggers
Peer validation workflow (request, respond, timeout)
Skill expiry detection
Project team builder logic
All critical business logic must be covered by tests.

21. Technology Stack

Layer | Technology
Frontend Framework | Angular 17+
Language | TypeScript (strict mode)
State Management | NgRx (for global state like user session, skill data)
UI Components | Angular Material or PrimeNG
Charts | ngx-charts or Chart.js
Animations | Angular Animations (@angular/animations)
Routing | Angular Router with route guards for role-based access
HTTP | Angular HttpClient (mock interceptors for local data)
Mock Data | JSON files stored in /assets/mock-data/ folder
Unit Testing | Jasmine + Karma
E2E Testing | Cypress (optional)
Build Tool | Angular CLI

Mock Data Strategy:
All mock data is stored as JSON files inside the /assets/mock-data/ directory.
The application uses Angular HttpClient interceptors to serve mock data from JSON files, simulating real API calls.
This allows easy migration to a real backend later — just remove the interceptor and point to real API URLs.

22. Mock Data Files
The following JSON files must be created in /assets/mock-data/:

File | Purpose | Key Fields
users.json | All system users (employees, managers, admin) | id, name, email, password, role, department, avatarUrl
skill-categories.json | Skill categories and subcategories | categoryId, categoryName, subCategories[]
skill-definitions.json | Individual skills with descriptions | skillId, skillName, categoryId, subCategoryId, description
skill-exams.json | Assessment questions per skill | skillId, questions[{questionText, options[], correctAnswer, difficultyLevel}]
employee-skills.json | Employee skill profiles with ratings | userId, skills[{skillId, selfRating, managerRating, peerRating, systemRating, finalRating, level, status, lastUpdated}]
certifications.json | Uploaded certifications | certId, userId, skillId, certName, issuingOrg, issueDate, expiryDate, filePath
projects.json | Projects with required skills | projectId, name, description, status, startDate, deadline, requiredSkills[], requiredRoles[], createdBy
project-assignments.json | Employee-to-project mapping | projectId, userId, role, assignedDate
skill-test-attempts.json | Test attempt history | attemptId, userId, skillId, score, earnedPoints, maxPoints, date, timeTaken
notifications.json | Notification messages | notificationId, userId, type, message, isRead, date

Mock Data Rules:
- JSON files are the single source of truth for the frontend
- All CRUD operations (add/edit/delete skills, create projects, etc.) update the in-memory copy of the JSON data during the session
- On page refresh, data resets to the original JSON file content (unless localStorage persistence is added)
- Each mock user must have a complete skill profile with at least 3–5 skills at various levels
- At least 2 projects with required skills must be pre-populated
- At least 10 mock users: 6 employees, 2 managers, 1 admin, 1 with multiple skills at Expert level

23. Error States & Validation Rules
The application must handle error states gracefully across all features.

Assessment Errors:
- Time expired during test → auto-submit with answered questions only; show "Time's up! Your test has been auto-submitted."
- Attempting retake before cooldown expires → show "You can retake this assessment in X hours Y minutes."
- No questions available for a skill → show "Assessment not available yet for this skill."

Certification Upload Errors:
- Invalid file format (not PDF/JPG/PNG) → "Only PDF, JPG, and PNG files are accepted."
- File too large (> 5 MB) → "File size must not exceed 5 MB."
- Missing required fields (cert name, issuing org, dates) → highlight empty fields with "This field is required."
- Expiry date before issue date → "Expiry date must be after issue date."

Project Creation Errors:
- Missing project name → "Project name is required."
- Start date after deadline → "Start date must be before deadline."
- No required skills added → "Add at least one required skill to create a project."
- Duplicate project name → "A project with this name already exists."

Skill Profile Errors:
- Adding a skill that already exists in profile → "This skill is already in your profile."
- Attempting to delete a skill currently linked to an active project → "This skill is linked to an active project and cannot be deleted."

Candidate Matching Errors:
- No candidates match minimum requirements → "No candidates found matching the required skills. Consider lowering the minimum proficiency or providing training."

General Validation:
- All form fields must show real-time inline validation (not just on submit)
- Error messages must be red text below the field
- Success actions must show a green toast notification (e.g., "Skill added successfully", "Certification uploaded")
- Loading states must show a spinner or skeleton screen — never a blank page