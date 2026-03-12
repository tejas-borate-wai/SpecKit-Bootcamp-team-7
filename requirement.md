Skill Matrix Module
In Time Pro (ITP) – Workforce Capability Management

Document Version: 1.0
Prepared By: Product Team (PM, BA, Developer, QA, UI/UX)
Date: March 2026
Status: Draft for Review

---

1. Introduction
1.1 Overview

The Skill Matrix Module is designed to enhance the existing In Time Pro (ITP) workforce management platform by introducing a structured system for capturing, managing, and analyzing employee skills across the organization.

Currently, ITP lacks a centralized mechanism to record employee competencies. This module provides a comprehensive solution that allows employees, managers, HR administrators, and leadership teams to:

- Maintain employee skill profiles
- Track skill proficiency levels
- Validate skills through managers and peers
- Analyze organizational skill gaps
- Match employees to project requirements
- Drive targetted learning and development programs

The Skill Matrix Module enables organizations to make data-driven workforce decisions related to project allocation, employee development, and capability mapping.

1.2 Document Purpose

This document captures the complete functional and non-functional requirements for the Skill Matrix Module. It serves as the primary reference for all team members: PM, BA, Developers, QA Engineers, and UI/UX Designers.

1.3 Definitions and Abbreviations

| Term | Definition |
|------|-----------|
| ITP | In Time Pro – existing workforce management platform |
| Skill Matrix | A structured grid mapping employees to skills and proficiency levels |
| RBAC | Role-Based Access Control |
| Proficiency Level | A standardized scale (Beginner to Expert) indicating skill depth |
| Self Assessment | Employee-submitted skill rating |
| Manager Assessment | Rating provided by the reporting manager |
| Skill Gap | Difference between required skills and available skills |
| JWT | JSON Web Token – used for authentication |
| API | Application Programming Interface |
| Super Admin | System-level administrator account seeded on first deployment. Responsible for user creation, role assignment, and system configuration |
| Password Reset Token | A single-use, time-limited cryptographic token sent via email to allow a user to securely set a new password |

---

2. Module Objectives

The primary objectives of the Skill Matrix Module are:

2.1 Centralized Skill Management

Provide a centralized platform where all employee skills can be stored, maintained, and updated in real time.

2.2 Workforce Capability Visibility

Enable leadership and HR teams to view skill distribution across teams and departments through dashboards and reports.

2.3 Project Resource Allocation

Assist project managers in identifying and selecting employees with the required skills for project assignments.

2.4 Employee Development

Help employees track their skill growth, identify gaps, and connect to relevant learning programs.

2.5 Skill Gap Analysis

Identify gaps in organizational capabilities and support targeted training and hiring initiatives.

2.6 Compliance and Certification Tracking

Ensure employees maintain required certifications and alert stakeholders before expiry.

---

3. Scope of the Module

The Skill Matrix Module will support the following functionalities:

- Skill category and skill structure management
- Employee skill profile management
- Skill validation and multi-source assessment
- Certification upload and expiry tracking
- Skill analytics, reporting, and heatmaps
- Project skill matching and resource recommendation
- Role-based access and dashboards per user type
- Notifications and reminders for pending actions
- Audit trail for all skill data changes
- Integration with Employee Profile, Project Allocation, Performance Review, and L&D modules

Out of Scope (V1)
- AI-based automatic skill detection from code repositories
- Deep integration with external LMS platforms (planned for V2)
- Mobile application (planned for V2)

---

4. Stakeholders

The module will serve multiple stakeholders within the organization.

4.1 Employees

Employees manage their own skill profiles, add certifications, and submit skills for validation.

4.2 Managers

Managers review, validate, and adjust skill ratings for their direct reports. They also use skill data for team planning.

4.3 HR Administrators

HR administrators manage the skill taxonomy (categories, subcategories, skill names), configure frameworks, and analyze workforce capabilities.

4.4 Leadership / Executives

Leadership teams access high-level dashboards, skill heatmaps, and gap analysis reports to support strategic decisions.

---

5. User Roles and Role-Based Access Control (RBAC)

The module enforces strict role-based access. Each role has a distinct set of permissions governing what they can view, create, edit, or approve.

5.1 Role Definitions

| Role | Description |
|------|-------------|
| Super Admin | System-level administrator seeded on first deployment. Manages all user accounts, role assignments, and global system configuration. Cannot be deleted |
| Employee | Any staff member with an ITP account |
| Manager | A user with direct reports assigned in ITP |
| HR Admin | Human Resources personnel with elevated system access |
| Leadership | C-level or department heads requiring read-only strategic views |

5.2 RBAC Permission Matrix

| Feature / Action | Employee | Manager | HR Admin | Leadership |
|-----------------|----------|---------|----------|------------|
| View own skill profile | Yes | Yes | Yes | No |
| Add / edit own skills | Yes | Yes | Yes | No |
| Upload own certifications | Yes | Yes | Yes | No |
| Submit skill for validation | Yes | Yes | Yes | No |
| View team members' skills | No | Yes | Yes | No |
| Validate / approve team skills | No | Yes | Yes | No |
| Adjust team members' ratings | No | Yes | Yes | No |
| Reject skill submissions | No | Yes | Yes | No |
| Manage skill categories | No | No | Yes | No |
| Manage subcategories | No | No | Yes | No |
| Add / edit global skill definitions | No | No | Yes | No |
| Define proficiency frameworks | No | No | Yes | No |
| View team-level reports | No | Yes | Yes | No |
| View org-wide skill heatmap | No | No | Yes | Yes |
| View skill gap analysis | No | No | Yes | Yes |
| View project skill matching | No | Yes | Yes | No |
| Access strategic dashboards | No | No | No | Yes |
| Export reports | No | Yes | Yes | Yes |
| Manage user roles | No | No | Yes | No |
| View audit logs | No | No | Yes | No |
| Create / deactivate user accounts | No | No | No | No |
| Assign / revoke all roles | No | No | No | No |
| Bulk import employees (CSV) | No | No | No | No |
| Configure global system settings | No | No | No | No |
| Reset any user's password (admin-triggered) | No | No | No | No |

> **Super Admin Note:** The Super Admin role has unrestricted access to every feature in the table above plus the exclusive capabilities shown in the last five rows. Super Admin enforcement is applied at both the API and UI layers.

5.3 Role Hierarchy

Super Admin (System-Level Control — User Creation, Role Assignment, System Configuration)
        ↑
Leadership (Read-Only Strategic Access)
        ↑
HR Admin (Full Administrative Control)
        ↑
Manager (Team-Level Validation & Reports)
        ↑
Employee (Self-Service Skill Profile)

5.4 Initial System Setup and Default Admin Account

Upon first deployment or project initialization, the system will automatically seed a default Super Admin account. This account is used to bootstrap the application and manage all initial onboarding before any other users or functionality can be accessed.

Default Admin Credentials:

| Field | Value |
|-------|-------|
| Email / Username | admin@intimepro.com |
| Password | Admin@123 |
| Role | Super Admin (full system access) |

> Security Notice: The default admin password must be changed on first login. The system will enforce a mandatory password-change prompt upon the first successful authentication using the default credentials.

Initial Setup Workflow:

1. Developer deploys the application and runs database migrations / seed scripts
2. The seeding process automatically creates the default Super Admin account (admin@intimepro.com / Admin@123)
3. Admin logs in using default credentials
4. System immediately prompts admin to set a new, strong password before proceeding
5. Admin navigates to User Management and adds employees / users to the system
6. Admin assigns the appropriate role to each user (Employee, Manager, HR Admin, or Leadership)
7. Users receive their login credentials and can access role-specific functionality once a role is assigned

Business Rules:
- The default Super Admin account cannot be deleted from the system
- The email address admin@intimepro.com is reserved for the system admin and cannot be assigned to any other user
- No other functionality (Skill Management, Validations, Reports, Dashboards) is operable until at least one employee has been added and assigned a role
- Employees can be added individually through the User Management screen or in bulk via CSV import
- Role assignment is mandatory — an employee account without an assigned role cannot log in to the system
- A single user can hold multiple roles if required (e.g., an HR Admin who is also a Manager)

Acceptance Criteria:
- Default admin account (admin@intimepro.com / Admin@123) is created automatically during the first database seed / migration run
- Admin can successfully log in with default credentials on a fresh deployment
- System displays a mandatory password-change screen on first login with default credentials; the user cannot skip this step
- Admin can add a new employee from User Management by providing name, email, department, and designation
- Admin can assign one or more roles to each employee from the role assignment screen
- An employee without an assigned role receives an "Access Denied" message upon attempting to log in
- Bulk employee import via CSV is supported, with column mapping for name, email, department, designation, and role
- Bulk import validates for duplicate emails and invalid role values, reporting errors per row without stopping valid rows from being processed
- All user creation and role assignment actions are recorded in the audit log

---

6. Role-Based UI and Functionality

Each user role will see a different navigation menu, dashboard, and set of available actions. The UI adapts dynamically based on the authenticated user's role.

6.1 Employee UI

Navigation Menu:
- My Dashboard
- My Skills
- My Certifications
- Skill Progress
- Notifications

Dashboard Widgets:
- Skill profile completion percentage
- Pending validation requests
- Upcoming certification expiry alerts
- Recommended skills based on current role
- Skill progress trend (chart)

Available Actions:
- Add a new skill with self-assessed proficiency level
- Edit existing skill entries
- Upload certification documents (PDF, image)
- Submit skills for manager validation
- View validation status (Pending / Approved / Rejected)
- View skill timeline progress

6.2 Manager UI

Navigation Menu:
- My Dashboard
- My Team Skills
- Skill Validation Queue
- Project Skill Matching
- Team Reports
- My Skills (own profile)
- Notifications

Dashboard Widgets:
- Pending skill validations count
- Team skill coverage summary (chart)
- Employees with incomplete profiles
- Project skill match recommendations
- Recent validation activity feed

Available Actions:
Everything an Employee can do, plus:
- View all direct reports' skill profiles
- Approve, adjust, or reject skill submissions
- Override proficiency ratings with justification
- Generate team-level skill reports
- Search employees by skill for project matching
- Add notes during validation

6.3 HR Admin UI

Navigation Menu:
- Admin Dashboard
- Skill Framework Management
  - Categories
  - Subcategories
  - Skill Definitions
  - Proficiency Frameworks
- Employee Skill Overview
- Skill Gap Analysis
- Certification Tracker
- Reports & Analytics
- Audit Logs
- User Management
- Notifications

Dashboard Widgets:
- Organization skill health score
- Total skills tracked
- Skills pending approval (all teams)
- Expiring certifications in next 30/60/90 days
- Skill gap summary by department
- Recent system activity

Available Actions:
Everything a Manager can do, plus:
- Create, edit, or deactivate skill categories and subcategories
- Define and update global skill definitions
- Configure proficiency level criteria
- Access all employee skill profiles across the organization
- Override any skill rating with administrator justification
- Run and export org-wide reports
- View and export audit logs
- Manage user roles and assignments
- Configure notification rules and thresholds

6.4 Leadership UI

Navigation Menu:
- Executive Dashboard
- Skill Heatmap
- Skill Gap Analysis
- Department Capability Reports
- Export Reports

Dashboard Widgets:
- Org-wide skill distribution (heatmap)
- Top skill categories across the organization
- Critical skill gaps by department
- Hiring vs training recommendation summary
- Quarter-over-quarter skill growth trends
- Certification compliance rate

Available Actions:
- View all analytics and reports (read-only)
- Drill down from org level to department level
- Export reports in PDF and Excel
- No ability to modify any skill data

6.5 Super Admin UI

Navigation Menu:
- System Dashboard
- User Management
  - Employee List
  - Add Employee
  - Edit Employee
  - Bulk Import (CSV)
  - Role Assignment
  - Resend Invite
- System Settings
- Audit Logs
- Notifications

Dashboard Widgets:
- Total registered users
- Users by role (breakdown chart)
- Users pending role assignment
- Recent user creation and role-change activity
- Failed login attempts in last 24 hours
- System health indicators

Available Actions:
Everything an HR Admin can do, plus:
- Create new employee / user accounts
- Edit or deactivate existing user accounts
- Assign or revoke any role including HR Admin
- Bulk import employees via CSV with error reporting
- View all system-level audit logs
- Configure global system settings (lockout threshold, lockout duration, password complexity policy, JWT token expiry, notification defaults)
- Admin-triggered password reset for any user account
- Resend welcome / credential email to a specific user

---

7. Functional Requirements
7.1 Skill Structure Management

The system will organize skills in a hierarchical structure to allow easy classification and reporting.

Skill Hierarchy:
Skill Category
    ↓
Sub Category
    ↓
Skill Name
    ↓
Skill Definition

Example Skill Structure:

| Category | Sub Category | Skill | Description |
|----------|-------------|-------|-------------|
| Development | Frontend | Angular | Building Single Page Applications using Angular framework |
| Development | Frontend | React | Building component-based UIs using React library |
| Development | Backend | .NET Core | Developing REST APIs using ASP.NET Core |
| Development | Database | SQL Server | Writing queries, stored procedures, and database design |
| QA | Automation | Selenium | Automated browser testing using Selenium WebDriver |
| QA | Performance | JMeter | Load and performance testing using Apache JMeter |
| Cloud | AWS | EC2 | Cloud server infrastructure management |
| Cloud | Azure | AKS | Container orchestration on Azure Kubernetes Service |
| Communication | Leadership | Team Management | Managing cross-functional team collaboration |

Business Rules:
- Skill categories and subcategories can only be created or modified by HR Admin
- Each skill must belong to exactly one subcategory
- Skill names must be unique within a subcategory
- Deactivating a skill will hide it from new additions but retain historical records

Acceptance Criteria:
- HR Admin can create a new skill category with a name and description
- HR Admin can add subcategories under an existing category
- HR Admin can add a skill definition under a subcategory
- Duplicate skill names within the same subcategory must be rejected with a validation error
- Skill categories can be deactivated but not deleted if linked to employee records

7.2 Skill Proficiency Levels

To measure employee capability, the platform will use a standardized proficiency framework.

| Level | Score | Description |
|-------|-------|-------------|
| Beginner | 1 | Basic understanding with limited practical experience. Requires guidance and supervision |
| Intermediate | 2 | Able to work independently on standard tasks with occasional guidance |
| Advanced | 3 | Deep understanding, capable of solving complex problems, can mentor junior team members |
| Expert | 4 | Recognized authority in the skill area, capable of defining standards and leading innovation |

Additional Notes:
- Each proficiency level has defined evaluation criteria visible to employees and managers
- The same proficiency framework applies across all skill categories
- HR Admin can update level descriptions; level names and scores are fixed

7.3 Skill Rating Mechanism

The platform will calculate skill proficiency using multiple rating sources.

Rating Sources:

Self Assessment
Employees rate their own skill levels on a scale of 1 to 4 (Beginner to Expert).

Manager Assessment
Managers validate or adjust the employee's self-rating. Manager assessment carries the highest weight.

Peer Validation
Team members provide feedback on collaborative and soft skills via a structured rating form.

System Generated Ratings
Automatically calculated based on project participation, assessment scores, and certification data.

Final Skill Rating Formula:

Final Skill Rating =
(Self Rating × 0.20) +
(Manager Rating × 0.50) +
(Peer Rating × 0.15) +
(System Rating × 0.15)

Note: Weights are configurable by HR Admin. Default weights are shown above.

Rating Status Lifecycle:

Submitted (by Employee)
    ↓
Pending Manager Review
    ↓
Approved / Rejected / Returned for Revision
    ↓
Final Rating Published

Business Rules:
- An employee cannot have a final rating without at least one manager assessment
- If a manager rejects a skill submission, they must provide a reason
- Employees are notified immediately when their submission is approved or rejected
---

8. Employee Skill Profile

Employees will interact with the module through their Skill Profile Dashboard.

Features

Employees can:
- Add new skills from the global skill library
- Update skill levels (self-assessment)
- Upload certifications with expiry dates
- View manager validation status per skill
- Track skill progress over time via a timeline view
- View recommended skills based on their department or role
- See a profile completion percentage score

Skill Profile Tabs:

| Tab | Content |
|-----|---------|
| My Skills | Complete list of skills with ratings, validation status, and last updated date |
| Certifications | Uploaded certifications with file name, issuing body, and expiry date |
| Skill Progress | Visual progress chart per skill over time |
| Project Experience | Skills tagged to completed or active project assignments |

Skill Table Example:

| Skill | Category | Sub Category | Self Rating | Manager Rating | Final Rating | Status | Last Updated |
|-------|----------|-------------|------------|---------------|-------------|--------|-------------|
| Angular | Development | Frontend | Advanced | Advanced | Advanced | Approved | Jan 2026 |
| SQL Server | Development | Database | Intermediate | Advanced | Advanced | Approved | Dec 2025 |
| Selenium | QA | Automation | Beginner | — | Pending | Pending Review | Feb 2026 |

Validation Status Values:
- Draft: Saved but not yet submitted
- Pending Review: Submitted and awaiting manager action
- Approved: Validated by manager
- Rejected: Rejected by manager with feedback
- Expired: Rating not updated in the last 12 months (configurable)

Acceptance Criteria:
- An employee can add a skill only if it exists in the global skill library
- An employee can submit multiple skills in a single submission batch
- Uploaded certifications must be PDF or image format and not exceed 5 MB
- The system displays a warning if a skill rating has not been updated in 12 months
- Employees receive a notification when their skill is approved or rejected
---

9. Skill Assessment Methods

The system supports multiple methods to validate employee skills.

9.1 Technical Assessments

- Internal skill-based tests administered through the ITP platform
- Assessment results are automatically recorded against the employee's skill profile
- Managers and HR Admin can schedule assessments for specific skills or teams
- Assessment scores map directly to proficiency levels (configurable thresholds)

9.2 Certification Upload

Employees can upload industry certifications. Supported certification examples:

- AWS Certified Solutions Architect
- Microsoft Azure Administrator (AZ-104)
- Google Cloud Professional Data Engineer
- Certified Scrum Master (CSM)
- ISTQB – Software Testing Foundation
- PMP – Project Management Professional

Upload Rules:
- File format: PDF or JPG/PNG (max 5 MB)
- Certification must include issuing organization, issue date, and expiry date
- HR Admin receives a notification when a certification is uploaded for the first time for a new skill category
- System sends reminders 90, 60, and 30 days before certification expiry

9.3 Project Experience Tagging

- When an employee is assigned to a project in the Project Allocation Module, relevant skills can be tagged to that project
- Upon project completion, those tagged skills can be submitted for validation
- Managers can endorse or adjust skill levels based on observed project contributions

9.4 Periodic Performance Reviews

- During scheduled performance reviews, managers can review and update skill ratings
- Review cycle is configurable (quarterly, half-yearly, annually)
- Skill updates from performance reviews are clearly labeled as "Performance Review" in the audit trail

Acceptance Criteria:
- Assessment scores are automatically converted to proficiency levels using configurable mapping
- A certification upload triggers a notification badge on the manager's validation queue
- Skill ratings derived from project experience require manager endorsement before becoming final
- All assessment methods appear as distinct source labels in the skill rating history

---

10. Manager and Admin Controls

10.1 Manager Capabilities

| Capability | Description |
|-----------|-------------|
| View team skill profiles | See all direct reports' skill profiles in one view |
| Skill validation queue | Dedicated queue showing pending skill submissions from team members |
| Approve skill submissions | Mark a submitted skill as Approved with an optional comment |
| Adjust proficiency ratings | Override employee's self-assessment with justification |
| Reject submissions | Reject with a mandatory rejection reason that is sent to the employee |
| Endorse project skills | Validate skills gained through project experience |
| View team skill reports | Access team-level skill coverage and gap reports |
| Project skill matching | Search own team members by skill for project allocation |

10.2 HR Admin Capabilities

| Capability | Description |
|-----------|-------------|
| Create skill categories | Add new top-level categories (e.g., DevOps, Data Science) |
| Manage subcategories | Add, edit, or deactivate subcategories under any category |
| Add / update skill definitions | Define or modify global skill descriptions |
| Define proficiency frameworks | Update descriptions and criteria for each proficiency level |
| Configure rating weights | Set the weighting of each rating source in the final rating formula |
| Manage all employee skills | View and manage skill profiles of any employee across the org |
| Override any rating | With documented justification, override any skill rating at admin level |
| Schedule assessments | Trigger skill assessments for individuals or groups |
| Run org-wide analytics | Access complete analytics including heatmaps, gap analysis, and trends |
| Export all reports | Export data in PDF, Excel, or CSV format |
| Manage user roles | Assign and revoke roles for all ITP users |
| View audit logs | Review all skill-related changes including who changed what and when |
| Configure notifications | Define rules for reminders and alert thresholds |

Acceptance Criteria:
- A manager cannot view or edit skill profiles of employees outside their reporting line
- HR Admin can deactivate a skill category; deactivated categories are hidden from new skill additions but remain in historical records
- HR Admin role assignment requires confirmation and is logged in the audit trail
- Rating weight configuration by HR Admin must ensure all weights sum to 100%; the system validates this on save

---

11. Reporting and Analytics

The Skill Matrix Module provides insights to support strategic decision-making.

11.1 Skill Gap Analysis

Identify missing skills across departments by comparing required skills (defined by HR Admin per department/role) against current employee skill levels.

Example Output:

| Department | Required Skill | Current Coverage | Gap Level |
|-----------|---------------|-----------------|-----------|
| Development | Kubernetes | 25% | Critical |
| QA | Automation Testing | 40% | High |
| Cloud | Terraform | 10% | Critical |
| Development | React | 70% | Low |

11.2 Team Capability Reports

Visualize the skill strength of individual teams, showing coverage and average proficiency per skill.

Example Output:

| Team | Angular | .NET | AWS | SQL Server |
|------|---------|------|-----|------------|
| Team A | High | Medium | Low | High |
| Team B | Medium | High | Medium | Low |

11.3 Organization Skill Heatmap

A color-coded visual grid showing skill proficiency distribution across all departments. The heatmap highlights:
- Skills with high organizational coverage (green)
- Skills at moderate coverage (yellow)
- Skills with critical gaps (red)

The heatmap is accessible to HR Admin and Leadership roles.

11.4 Skill Demand vs Supply

Compare project skill requirements (pulled from the Project Allocation Module) against available employee capabilities.

Example Output:

| Skill | Required (Projects) | Available (Employees) | Gap |
|-------|--------------------|-----------------------|-----|
| Angular | 15 | 10 | -5 |
| .NET 8 | 12 | 14 | +2 |
| Kubernetes | 8 | 2 | -6 |

11.5 Certification Compliance Report

Track which employees have valid certifications vs expired or missing ones for required skill areas.

11.6 Skill Growth Trends

Show quarter-over-quarter or year-over-year growth in skill proficiency levels across teams or the organization.

Report Export Formats:
- PDF
- Excel (.xlsx)
- CSV

Acceptance Criteria:
- Gap analysis must reflect real-time skill data from employee profiles
- Heatmap must update automatically when skill records are approved or modified
- Leadership can view heatmaps and gap analysis but cannot export to raw CSV (PDF only)
- All reports include a "Generated On" timestamp and the name of the user who generated it

---

12. Project Skill Matching

The module will assist managers in identifying employees suitable for projects.

12.1 Workflow

1. Project Manager defines required skills and minimum proficiency levels for a project
2. System scans all employee skill profiles with Approved status
3. System calculates a Skill Match Score for each eligible employee
4. Recommended employees are displayed ranked by match score
5. Manager selects employees and raises an allocation request in the Project Module

12.2 Skill Match Score Calculation

Match Score = (Number of matched required skills / Total required skills) × 100
Proficiency weight bonus applied when employee's level exceeds the required minimum level.

12.3 Example Output

| Employee | Matching Skills | Required Skills Met | Match Score |
|----------|----------------|--------------------|-----------  |
| Tejas Patil | Angular, .NET 8, SQL Server | 3/3 | 100% |
| Rahul Sharma | Angular, SQL Server | 2/3 | 75% |
| Priya Kulkarni | .NET 8 | 1/3 | 40% |

12.4 Filters Available

- Filter by skill category
- Filter by department or team
- Filter by minimum proficiency level
- Filter by availability (not currently allocated)

Acceptance Criteria:
- Only employees with Approved skill status are included in matching results
- Employees currently 100% allocated to another project are flagged but still shown
- Match score is recalculated in real time as required skills are added or removed
- Results can be exported as a PDF report for project planning purposes
---

13. Notifications and Alerts

The system will provide automated notifications for important events.

13.1 Notification Events

| Event | Recipient | Channel |
|-------|-----------|---------|
| Skill submission pending review | Manager | In-app + Email |
| Skill submission approved | Employee | In-app + Email |
| Skill submission rejected | Employee | In-app + Email (with reason) |
| Certification uploaded for review | Manager, HR Admin | In-app |
| Certification expiring in 90 days | Employee | In-app + Email |
| Certification expiring in 30 days | Employee + Manager | In-app + Email |
| Certification expired | Employee + Manager + HR Admin | In-app + Email |
| Skill rating not updated for 12 months | Employee + Manager | In-app |
| Assessment scheduled | Employee | In-app + Email |
| Assessment result published | Employee + Manager | In-app |
| New skill category added | All users | In-app |
| Profile completion below threshold | Employee | In-app |
| New employee account created (welcome email with credentials) | New Employee | Email |
| Password reset requested | Employee | Email (secure reset link, expires in 30 min) |
| Password changed confirmation | Employee | In-app + Email |
| Account locked out (too many failed login attempts) | Employee | In-app + Email |
| Account unlocked (lockout period expired or admin action) | Employee | In-app + Email |
| Bulk import completed | Super Admin / HR Admin | In-app + Email (with row-level error summary) |

13.2 Notification Preferences

- Employees and managers can configure preferences to enable or disable email notifications
- In-app notifications cannot be disabled
- HR Admin can configure global reminder thresholds (e.g., change 90-day alert to 60-day)

Acceptance Criteria:
- All in-app notifications appear in a notification bell icon in the top navigation bar
- Unread notifications are visible with a count badge
- Notifications are marked as read when clicked
- Email notifications include a direct link to the relevant screen in ITP

---

14. User Workflow

14.0 Initial Admin Setup Workflow (First-Time Deployment)

Deploy application and run database migrations / seed scripts
    ↓
System auto-creates default Super Admin account
(Email: admin@intimepro.com | Password: Admin@123)
    ↓
Admin logs in with default credentials
    ↓
System enforces mandatory password change on first login
    ↓
Admin navigates to User Management
    ↓
Admin adds employees (individually or via CSV bulk import)
    ↓
Admin assigns roles to each employee
(Employee / Manager / HR Admin / Leadership)
    ↓
Employees receive login credentials and can now access
role-specific dashboards and functionality

14.1 Employee Skill Submission Workflow

Login to ITP
    ↓
Navigate to My Skills (Skill Profile Dashboard)
    ↓
Click "Add Skill" → Select Category → Subcategory → Skill Name
    ↓
Set Self Rating (Beginner / Intermediate / Advanced / Expert)
    ↓
Optionally upload supporting Certification or link to Project Experience
    ↓
Save as Draft or Submit for Manager Validation
    ↓
System sends notification to Manager
    ↓
Manager reviews and Approves / Rejects / Returns for revision
    ↓
Employee receives notification of outcome
    ↓
Final Rating Published on Employee Profile

14.2 Manager Validation Workflow

Receive notification (in-app or email) about pending skill validation
    ↓
Open Skill Validation Queue
    ↓
Select employee submission
    ↓
Review self-rating, uploaded certifications, and project experience evidence
    ↓
Set Manager Rating (can match or override employee self-rating)
    ↓
Add optional comments
    ↓
Approve or Reject
    ↓
System updates employee profile and notifies employee

14.3 HR Admin Skill Framework Workflow

Login to ITP as HR Admin
    ↓
Navigate to Admin > Skill Framework Management
    ↓
Create or update Skill Category
    ↓
Add or update Subcategories under the Category
    ↓
Add or update Skill definitions under the Subcategory
    ↓
Configure Proficiency Level descriptions and criteria
    ↓
Publish changes — changes are immediately visible to all users

14.4 Leadership Analytics Workflow

Login to ITP as Leadership
    ↓
Open Executive Dashboard
    ↓
View Org Skill Heatmap
    ↓
Drill down to Department-level gap analysis
    ↓
View Skill Demand vs Supply summary
    ↓
Export summary as PDF for stakeholder reporting

14.5 Forgot Password / Account Recovery Workflow

Employee clicks "Forgot Password?" on the Login screen
    ↓
Employee enters their registered email address
    ↓
System acknowledges submission (no indication whether email exists — security)
    ↓
If email exists: system generates a single-use, time-limited reset token (expires in 30 minutes)
    ↓
Password reset email sent to the employee containing a secure HTTPS reset link
    ↓
Employee clicks the reset link → directed to Reset Password screen
    ↓
Employee enters and confirms a new password meeting complexity requirements
    ↓
System validates: token not expired, token not already used
    ↓
System hashes and saves the new password; marks token as used
    ↓
All active sessions (refresh tokens) for the user are immediately revoked
    ↓
Employee is redirected to Login screen with a success confirmation message
    ↓
Employee logs in with the new password

14.6 Admin-Triggered Password Reset Workflow

Super Admin / HR Admin locates the target user in User Management
    ↓
Admin clicks "Reset Password" for the user account
    ↓
System generates a secure reset token and sends a password reset email to the user
    ↓
Action is logged in the Audit Trail (who triggered it, for which user, at what time)
    ↓
User receives the email and follows the Forgot Password flow from step 5 above

---

15. Integration with Existing Systems

15.1 Employee Profile Module

- Skills are automatically linked to the employee's master profile in ITP
- Employee department, designation, and reporting manager are pulled from the employee profile to drive RBAC rules
- Changes to reporting manager in the employee profile automatically update skill validation routing

15.2 Project Allocation Module

- Project skill requirements defined in the Project Allocation Module are consumed by the Skill Matching engine
- When an employee is assigned to a project, relevant skills can be tagged for that project period
- Project completion triggers a prompt to the manager to endorse the skills used during the project

15.3 Performance Review Module

- During performance review cycles, the Skill Matrix section is embedded within the performance review form
- Skill ratings updated during a review are labeled with the review cycle name
- Managers can complete skill validation and performance reviews in a single workflow

15.4 Learning and Development (L&D) Module

- Skill gaps identified in the Skill Matrix are automatically surfaced as learning recommendations in the L&D module
- Completion of a training course in L&D can auto-update the corresponding skill level (pending manager confirmation)
- Certifications earned through L&D programs are automatically linked to the Certifications section of the skill profile

---

16. Screen Inventory

The following screens will be developed as part of the Skill Matrix Module:

16.0 Common Screens (Accessible to All Roles)

| Screen | Description |
|--------|-------------|
| Login | Email and password login form with a "Forgot Password?" link and clear validation messaging |
| Forgot Password | Form where the user enters their registered email to receive a password reset link |
| Reset Password | Token-validated form (accessed via email link) to set a new password meeting complexity rules |
| Change Password – First Login | Mandatory screen displayed on first login using default or temporary credentials; cannot be skipped or dismissed; enforced before any other screen is accessible |
| Change Password – Settings | Optional screen accessible from user profile/settings to update the current password at any time |

16.1 Employee Screens

| Screen | Description |
|--------|-------------|
| My Skill Dashboard | Overview of profile completion, top skills, and pending actions |
| Add Skill | Form to search and add a skill with self-rating |
| My Skills List | Table view of all skills with filters by category and status |
| Skill Detail | Detail view of a single skill with rating history and manager comments |
| Upload Certification | Form to upload a certification with metadata |
| Certifications List | List of all certifications with expiry indicators |
| Skill Progress | Timeline chart showing proficiency changes over time |
| Notifications | List of all notifications with read/unread state |

16.2 Manager Screens

| Screen | Description |
|--------|-------------|
| Manager Dashboard | Team skill summary, pending validations count, recent activity |
| Team Skills Overview | Table showing all team members and their skill coverage |
| Skill Validation Queue | List of pending submissions; sortable by employee and skill |
| Skill Validation Detail | Review screen showing self-rating, certifications, and project links |
| Team Skill Report | Skill coverage report for the manager's direct team |
| Project Skill Matching | Search tool for finding team members by required skill |

16.3 HR Admin Screens

| Screen | Description |
|--------|-------------|
| Admin Dashboard | Org health metrics, total skills, pending validations, expiring certs |
| Skill Category Management | CRUD interface for categories and subcategories |
| Skill Definition Management | CRUD interface for individual skills and descriptions |
| Proficiency Framework Settings | Edit descriptions and criteria per proficiency level |
| Rating Weight Configuration | Configure the weighting formula for final ratings |
| All Employee Skills | Search and filter skill profiles across the entire organization |
| Skill Gap Analysis | Department-level gap report with configurable required skills |
| Certification Tracker | Org-wide view of certifications with expiry status |
| Org Skill Heatmap | Color-coded heatmap by department and skill category |
| Audit Log Viewer | Searchable audit trail of all skill data changes |
| User Management – Employee List | Searchable, filterable, paginated list of all users with role badges, account status, and last-login date |
| User Management – Add Employee | Form to create a new employee account (name, email, department, designation, role); triggers welcome email on save |
| User Management – Edit Employee | Edit an existing employee's profile details, role assignment, and active/inactive status |
| User Management – Bulk Import | CSV upload screen with column mapping guide, row-by-row validation preview, import confirmation, and downloadable error report |
| User Management – Resend Invite | Resend the welcome email with credentials to a specific employee |
| User Role Management | Assign or revoke roles for ITP users |
| Notification Settings | Configure reminder thresholds and notification rules |

16.4 Leadership Screens

| Screen | Description |
|--------|-------------|
| Executive Dashboard | High-level org skill KPIs and trend summaries |
| Org Skill Heatmap | Read-only heatmap (same as HR Admin view) |
| Department Gap Analysis | Drill-down gap report by department |
| Skill Demand vs Supply | Side-by-side comparison for active projects |
| Report Export | Generate and download PDF reports |

16.5 Super Admin Screens

| Screen | Description |
|--------|-------------|
| System Dashboard | Overview of total users, users by role chart, users pending assignment, recent activity, and failed login incidents |
| Employee List | Searchable, filterable, paginated table of all system users with role badges and account status |
| Add Employee | Form to create a new user account with name, email, department, designation, and initial role |
| Edit Employee | Edit employee profile, role, active/inactive status, and trigger admin password reset |
| Bulk Import (CSV) | File upload screen with column mapping guide, import preview, row-level error report, and import summary notification |
| Role Assignment | Assign or change roles for any user; includes confirmation dialog; action is audit-logged |
| Resend Invite | Resend welcome email with credentials to a specific user |
| System Settings | Configure: account lockout threshold (default 5 attempts), lockout duration (default 15 min), password complexity rules, JWT access token expiry (default 60 min), refresh token expiry (default 7 days), and global notification defaults |

---

17. Non-Functional Requirements

17.1 Performance

- The system must handle up to 10,000 employee skill records without degradation in query response time
- Dashboard pages must load within 2 seconds under normal load
- Skill search must return results within 1 second
- Bulk report generation (org-wide) must complete within 10 seconds

17.2 Scalability

- The architecture must support horizontal scaling to accommodate organizational growth
- Database must support partitioning of skill records by department or time period for large datasets

17.3 Security

- Role-based access control must be enforced at both the API layer and the UI layer
- All API endpoints must require a valid JWT token
- Users can only access data permitted by their role as defined in Section 5
- Certification files must be stored in a secure, access-controlled file storage system
- All sensitive data must be encrypted in transit (TLS 1.2+) and at rest
- Passwords must be hashed using a strong one-way algorithm (bcrypt or PBKDF2)
- No sensitive employee data should be exposed in API error messages
- File uploads must be virus-scanned before storage
- Input validation must be enforced on all form fields to prevent SQL injection and XSS attacks
- API rate limiting must be implemented to prevent abuse
- Account lockout must be enforced after 5 consecutive failed login attempts (threshold configurable by Super Admin); locked accounts are blocked for 15 minutes (duration configurable)
- Password complexity requirements: minimum 8 characters, at least one uppercase letter, one lowercase letter, one numeric digit, and one special character (e.g., @, #, $)
- JWT access tokens must expire after 60 minutes; refresh tokens must expire after 7 days; both durations must be configurable by Super Admin
- Password reset tokens must be single-use and expire within 30 minutes of generation; expired or already-used tokens must be rejected with an appropriate error
- All password reset and account creation links sent via email must use HTTPS-only URLs
- Refresh tokens must be revoked immediately upon password change, password reset, or manual logout
- Default admin credentials (admin@intimepro.com / Admin@123) must be flagged as requiring change; the system cannot remain operational for any user if the Super Admin password has never been changed
- Newly created employee accounts must complete a mandatory first-login password change before accessing any application functionality

17.4 Usability

- The system must provide an intuitive UI accessible to non-technical users
- All screens must be responsive and functional on desktop and tablet browsers
- Form validation messages must be clear and actionable
- The UI must conform to WCAG 2.1 Level AA accessibility guidelines

17.5 Availability

- The system must maintain 99.5% uptime during business hours
- Planned maintenance windows must be communicated 48 hours in advance
- The system must support graceful degradation if an integration (e.g., L&D Module) is unavailable

17.6 Audit and Compliance

- All create, update, and delete operations on skill data must be logged in an immutable audit trail
- Audit trail must capture: user ID, role, action, timestamp, entity affected, old value, and new value
- Audit logs must be retained for a minimum of 3 years
- HR Admin can search audit logs by employee, date range, or action type

---

18. Technology Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Angular 17+ or React 18+ (component-based SPA) |
| Backend | ASP.NET Core 8 Web API |
| Database | Microsoft SQL Server 2019+ |
| Authentication | ASP.NET Core Identity + JWT Bearer Tokens |
| Authorization | Policy-based RBAC using ASP.NET Core Authorization |
| ORM | Entity Framework Core 8 |
| File Storage | Azure Blob Storage or on-premise secured file share |
| Caching | In-memory cache / Redis (for report data) |
| Email Service | SMTP integration / SendGrid |
| Architecture | Clean Architecture (Domain, Application, Infrastructure, API layers) |
| API Style | RESTful API with versioning (v1/v2) |
| API Documentation | Swagger / OpenAPI 3.0 |
| Frontend State | NgRx (Angular) or Redux Toolkit (React) |
| Unit Testing | xUnit (.NET), Jasmine/Karma (Angular) or Jest (React) |
| CI/CD | Azure DevOps Pipelines or GitHub Actions |
| Containerization | Docker (optional, for environment parity) |

Frontend Framework Decision:
Angular is the recommended choice for this module due to its built-in TypeScript support, strict structural conventions, and suitability for large enterprise applications. React is an accepted alternative if the team has stronger React expertise. The choice must be made at project kickoff and remain consistent across the module.

---

19. API Design (High Level)

All API endpoints follow RESTful conventions and require JWT authentication. Role enforcement is applied at the controller action level.

19.1 Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/v1/auth/login | Authenticate user and return JWT access + refresh token pair |
| POST | /api/v1/auth/refresh | Exchange a valid refresh token for a new access token |
| POST | /api/v1/auth/logout | Revoke the current refresh token and invalidate the session |
| POST | /api/v1/auth/forgot-password | Accept an email address and send a password reset link if the email exists |
| POST | /api/v1/auth/reset-password | Validate a reset token and update the user's password |
| POST | /api/v1/auth/change-password | Change password for the currently authenticated user |
| POST | /api/v1/auth/change-password-first-login | Handle mandatory password change on first login; marks IsFirstLogin = false on success |

19.2 Skill Framework (HR Admin only)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/v1/skill-categories | Get all skill categories |
| POST | /api/v1/skill-categories | Create a new skill category |
| PUT | /api/v1/skill-categories/{id} | Update a skill category |
| DELETE | /api/v1/skill-categories/{id} | Deactivate a skill category |
| GET | /api/v1/skill-categories/{id}/subcategories | Get subcategories |
| POST | /api/v1/subcategories | Create a subcategory |
| GET | /api/v1/skills | Get all skill definitions |
| POST | /api/v1/skills | Create a skill definition |
| PUT | /api/v1/skills/{id} | Update a skill definition |

19.3 Employee Skill Profile

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/v1/employees/{id}/skills | Get all skills for an employee |
| POST | /api/v1/employees/{id}/skills | Add a skill to an employee profile |
| PUT | /api/v1/employees/{id}/skills/{skillId} | Update skill rating |
| DELETE | /api/v1/employees/{id}/skills/{skillId} | Remove a skill |
| POST | /api/v1/employees/{id}/skills/submit | Submit skills for validation |

19.4 Certifications

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/v1/employees/{id}/certifications | Get all certifications for an employee |
| POST | /api/v1/employees/{id}/certifications | Upload a certification |
| PUT | /api/v1/employees/{id}/certifications/{certId} | Update certification details |
| DELETE | /api/v1/employees/{id}/certifications/{certId} | Remove a certification |

19.5 Skill Validation (Manager / Admin)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/v1/validation/queue | Get pending skill submissions for the manager |
| PUT | /api/v1/validation/{submissionId}/approve | Approve a skill submission |
| PUT | /api/v1/validation/{submissionId}/reject | Reject with reason |
| PUT | /api/v1/validation/{submissionId}/override | HR Admin override of any rating |

19.6 Reporting

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/v1/reports/skill-gap | Get skill gap analysis (Admin / Leadership) |
| GET | /api/v1/reports/heatmap | Get org-wide skill heatmap data |
| GET | /api/v1/reports/team/{teamId} | Get team capability report (Manager+) |
| GET | /api/v1/reports/project-matching | Get matching employees for skill set |
| GET | /api/v1/reports/certifications | Get certification compliance report |

19.7 User Management (Super Admin / HR Admin)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/v1/users | Get paginated, filterable list of all system users |
| POST | /api/v1/users | Create a new employee / user account and trigger welcome email |
| GET | /api/v1/users/{id} | Get full profile details of a specific user |
| PUT | /api/v1/users/{id} | Update user profile details (name, department, designation) |
| PATCH | /api/v1/users/{id}/roles | Assign or revoke roles for a user |
| PATCH | /api/v1/users/{id}/deactivate | Deactivate a user account (prevents login) |
| PATCH | /api/v1/users/{id}/activate | Reactivate a previously deactivated user account |
| PATCH | /api/v1/users/{id}/unlock | Unlock an account that was locked due to failed login attempts |
| POST | /api/v1/users/{id}/reset-password | Admin-triggered password reset — generates a reset token and sends email |
| POST | /api/v1/users/{id}/resend-invite | Resend the welcome email with credentials to a user |
| POST | /api/v1/users/import | Bulk import users from a CSV file; returns a job ID |
| GET | /api/v1/users/import/{jobId}/status | Poll the status and row-level error report of a bulk import job |

---

20. Database Design

20.1 Table Overview

| Table | Purpose |
|-------|---------|
| Employees | Linked from ITP employee master data |
| SkillCategories | Top-level skill categories |
| SkillSubCategories | Subcategories under each category |
| SkillDefinitions | Individual skill names and descriptions |
| ProficiencyLevels | Level codes, names, and descriptions |
| EmployeeSkills | Junction table linking employees to skills with ratings |
| SkillRatings | Rating records per source (self, manager, peer, system) |
| SkillSubmissions | Tracks submission batches and their validation status |
| Certifications | Employee certification documents and metadata |
| ProjectSkillTags | Skills tagged to specific project assignments |
| AuditLogs | Immutable record of all changes to skill data |
| NotificationLogs | History of notifications sent |
| RatingWeightConfig | Configurable weights for the final rating formula |
| SystemUsers | Authentication credentials (hashed password, role flags, account status, lockout state) for all ITP users |
| UserRoles | Junction table mapping users to one or more assigned roles |
| RefreshTokens | Active JWT refresh tokens per session, with revocation support |
| PasswordResetTokens | Single-use, time-limited tokens for password reset flows |

20.2 Key Table Schemas

SkillCategories:
- CategoryId (PK, int, identity)
- CategoryName (nvarchar 100, not null, unique)
- Description (nvarchar 500)
- IsActive (bit, default 1)
- CreatedBy (int, FK → Employees)
- CreatedAt (datetime2)
- ModifiedAt (datetime2)

SkillDefinitions:
- SkillId (PK, int, identity)
- SubCategoryId (FK → SkillSubCategories)
- SkillName (nvarchar 100, not null)
- Description (nvarchar 1000)
- IsActive (bit, default 1)
- CreatedBy (int, FK → Employees)
- CreatedAt (datetime2)
- ModifiedAt (datetime2)

EmployeeSkills:
- EmployeeSkillId (PK, int, identity)
- EmployeeId (FK → Employees)
- SkillId (FK → SkillDefinitions)
- SelfRating (tinyint, 1–4)
- ManagerRating (tinyint, 1–4, nullable)
- PeerRating (decimal, nullable)
- SystemRating (decimal, nullable)
- FinalRating (decimal, computed)
- Status (nvarchar 20: Draft / Pending / Approved / Rejected / Expired)
- LastUpdated (datetime2)

Certifications:
- CertificationId (PK, int, identity)
- EmployeeId (FK → Employees)
- SkillId (FK → SkillDefinitions, nullable)
- CertificationName (nvarchar 200)
- IssuingOrganization (nvarchar 200)
- IssueDate (date)
- ExpiryDate (date, nullable)
- FilePath (nvarchar 500) — secured storage path
- UploadedAt (datetime2)
- IsVerified (bit, default 0)

SystemUsers:
- UserId (PK, int, identity)
- EmployeeId (FK → Employees, nullable — null for the seeded Super Admin)
- Email (nvarchar 200, not null, unique)
- PasswordHash (nvarchar 500, not null) — bcrypt or PBKDF2 hashed; never stored in plain text
- IsActive (bit, default 1)
- IsFirstLogin (bit, default 1) — set to 0 after first password change; controls mandatory change screen
- FailedLoginAttempts (tinyint, default 0)
- LockoutUntil (datetime2, nullable) — null when not locked out
- LastLoginAt (datetime2, nullable)
- CreatedAt (datetime2, default GETUTCDATE())
- CreatedBy (int, FK → SystemUsers, nullable)

UserRoles:
- UserRoleId (PK, int, identity)
- UserId (FK → SystemUsers)
- RoleName (nvarchar 50: SuperAdmin / Employee / Manager / HRAdmin / Leadership)
- AssignedAt (datetime2)
- AssignedBy (int, FK → SystemUsers)

RefreshTokens:
- TokenId (PK, bigint, identity)
- UserId (FK → SystemUsers)
- TokenHash (nvarchar 500, not null, unique) — stored as SHA-256 hash of the raw token
- ExpiresAt (datetime2, not null)
- CreatedAt (datetime2, default GETUTCDATE())
- IsRevoked (bit, default 0)
- RevokedAt (datetime2, nullable)

PasswordResetTokens:
- ResetTokenId (PK, bigint, identity)
- UserId (FK → SystemUsers)
- TokenHash (nvarchar 500, not null, unique) — stored as SHA-256 hash of the raw token
- ExpiresAt (datetime2, not null) — 30 minutes from creation
- IsUsed (bit, default 0)
- UsedAt (datetime2, nullable)
- CreatedAt (datetime2, default GETUTCDATE())

AuditLogs:
- AuditId (PK, bigint, identity)
- UserId (int, FK → Employees)
- UserRole (nvarchar 50)
- Action (nvarchar 50: Create / Update / Delete / Approve / Reject)
- EntityType (nvarchar 100)
- EntityId (int)
- OldValue (nvarchar max, JSON)
- NewValue (nvarchar max, JSON)
- Timestamp (datetime2, default GETUTCDATE())

---

21. QA and Testing Scope

21.1 Test Categories

| Test Type | Description | Owner |
|-----------|-------------|-------|
| Unit Testing | Test individual service methods and business logic | Developer |
| Integration Testing | Test API endpoints with database interactions | Developer |
| UI Component Testing | Test individual UI components in isolation | Frontend Developer |
| End-to-End Testing | Test full user workflows from login to skill approval | QA Engineer |
| Role-Based Access Testing | Verify that each role can only access permitted screens and API endpoints | QA Engineer |
| Performance Testing | Load test with simulated users to validate response time SLAs | QA Engineer |
| Security Testing | Test for RBAC bypasses, unauthorized API access, file upload vulnerabilities, XSS, SQL injection | QA Engineer |
| Regression Testing | Re-run test suite after each release to catch regressions | QA Engineer |
| UAT | Business stakeholders validate key workflows before go-live | PM / Business |

21.2 Key Test Scenarios

- Employee can add a skill and submit for validation
- Manager receives a notification when a skill is submitted
- Manager can approve a skill; employee profile is updated
- Manager cannot access another manager's team skills
- HR Admin can create a skill category and it appears in the skill selection for employees
- Leadership cannot edit any skill data; all edit controls are hidden or disabled
- File larger than 5 MB is rejected with an error message
- Final rating formula calculates correctly using configured weights
- Skill gap report reflects real-time data after a new approval
- Expired certification triggers notification 90, 60, and 30 days before expiry
- Unauthenticated API request returns 401 Unauthorized
- Employee role calling Admin-only API endpoint returns 403 Forbidden
- Default admin account (admin@intimepro.com / Admin@123) is created correctly by seed script on a fresh database
- Admin can log in with default credentials and is immediately redirected to the mandatory Change Password screen
- Admin cannot access any other screen until the first-login password change is completed
- Password not meeting complexity requirements is rejected with a descriptive validation error
- New employee added by admin receives a welcome email containing their login credentials
- New employee logging in for the first time is forced through the mandatory password-change screen before accessing the dashboard
- Employee without an assigned role cannot log in (receives "Access Denied" response)
- Account is locked after 5 consecutive failed login attempts; locked account rejects login even with correct credentials
- Account lockout is automatically lifted after the configured lockout duration (default 15 minutes)
- Super Admin can manually unlock a locked account; unlock action is recorded in the audit log
- Forgot password email is sent only if the email exists in the system; no indication is given if the email is not found (security by design)
- Password reset link expires after 30 minutes and cannot be used a second time
- After a password reset, all existing sessions (refresh tokens) for the user are revoked
- Bulk CSV import processes all valid rows, skips invalid/duplicate rows, reports per-row errors, and sends a summary notification to the initiating admin
- Super Admin can assign and revoke roles; role changes take effect on the user's next login or token refresh
- Admin-triggered password reset is logged in the audit trail with the admin's identity, target user, and timestamp

---

22. UI/UX Design Guidelines

22.1 Design Principles

- Consistency: All screens follow a unified design system aligned with the existing ITP platform
- Role-Adaptive Navigation: The sidebar and top navigation dynamically render only the links available to the logged-in user's role
- Progressive Disclosure: Employees see simplified views; admins see full management controls
- Feedback-First: Every action (save, submit, approve) provides immediate visual feedback (toast notification or inline status update)

22.2 Navigation Structure by Role

Employee:
  My Dashboard → My Skills → Certifications → Skill Progress → Notifications

Manager:
  Dashboard → My Team → Validation Queue → Project Matching → Team Reports → [My Skills] → Notifications

HR Admin:
  Admin Dashboard → Skill Framework → Employee Skills → Gap Analysis → Reports → Audit Logs → Settings

Leadership:
  Executive Dashboard → Heatmap → Gap Analysis → Reports

22.3 Color and Status Indicators

| Status | Color |
|--------|-------|
| Approved | Green |
| Pending Review | Orange/Amber |
| Rejected | Red |
| Draft | Grey |
| Expired | Dark Red |
| Expert proficiency | Dark Blue |
| Advanced proficiency | Blue |
| Intermediate proficiency | Teal |
| Beginner proficiency | Light Blue |

22.4 Accessibility

- All form fields must have visible labels and ARIA attributes
- Color is never the sole indicator of status (icons or text labels accompany all color indicators)
- Keyboard navigation must be fully supported across all screens
- Minimum contrast ratio of 4.5:1 for all body text

---

23. Future Enhancements

The following improvements are planned for future releases:

- AI-based skill recommendations based on employee role, project history, and career goals
- Automatic skill detection from Git commit history or project tools (V2)
- Deep integration with external LMS platforms (Coursera, LinkedIn Learning, Udemy for Business)
- Career path planning: map skills to defined career ladders and highlight progression paths
- Automated project team generation based on skill requirements and availability
- Mobile application for skill updates and certification uploads (iOS / Android)
- Peer endorsement workflow with LinkedIn-style skill validation
- Org-wide skills benchmarking against industry standards

---

24. Conclusion

The Skill Matrix Module will significantly improve workforce visibility and skill management within the In Time Pro platform.

By introducing structured, role-based skill tracking and analytics, the organization will be able to:

- Improve project resource allocation with data-driven skill matching
- Identify training and hiring needs through real-time gap analysis
- Track employee skill growth across performance cycles
- Enhance strategic workforce planning for leadership
- Increase employee engagement by making skill development visible and rewarding

The module is designed with scalability and security in mind, using .NET 8 and Angular/React for a modern, maintainable, and enterprise-grade solution. Clear role-based access ensures that each stakeholder — Employee, Manager, HR Admin, and Leadership — interacts with a tailored experience suited to their responsibilities.