# Feature Specification: Skill Assessments Module

**Feature Branch**: `004-skill-assessments`  
**Created**: 2026-03-12  
**Status**: Draft  
**Input**: User description: "Skill Assessments Module for Skill Matrix Application — take assessments, timer, difficulty-weighted scoring, retake rules, post-assessment score card, test history"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Browse and Start a Skill Assessment (Priority: P1)

An employee navigates to the Assessments List screen to see all available skills and their assessment status. Skills that have not been attempted display a "Start Assessment" button. The employee selects a skill and begins taking the assessment.

**Why this priority**: This is the core entry point for the entire assessments module. Without the ability to browse assessments and start one, no other feature in this module can function.

**Independent Test**: Can be fully tested by navigating to /assessments, verifying the list renders with correct statuses, clicking "Start Assessment" on a not-attempted skill, and confirming the assessment screen loads.

**Acceptance Scenarios**:

1. **Given** a logged-in user with any role, **When** they navigate to /assessments, **Then** all skills are displayed with their assessment status (Not Attempted, In Progress, or Completed).
2. **Given** a skill with status "Not Attempted", **When** the user clicks "Start Assessment", **Then** they are navigated to /assessments/:skillId/take and the assessment begins.
3. **Given** the assessments list is displayed, **When** the user applies a category filter, **Then** only skills in that category are shown.
4. **Given** the assessments list is displayed, **When** the user applies a status filter, **Then** only skills matching that status are shown.

---

### User Story 2 - Take a Timed Assessment with Navigation (Priority: P1)

An employee takes a skill assessment consisting of 5–10 multiple-choice questions displayed one at a time. A 15-minute countdown timer is visible. The employee navigates between questions using Previous/Next buttons, sees a progress bar, and can submit the test at any time via a "Submit Test" button or upon reaching the last question.

**Why this priority**: The assessment-taking experience is the core interaction of this module. It delivers the primary value of skill evaluation.

**Independent Test**: Can be tested by starting an assessment, verifying questions appear one at a time in randomized order, navigating between them, confirming timer counts down, and submitting the test.

**Acceptance Scenarios**:

1. **Given** an assessment has started, **When** questions load, **Then** they are displayed one at a time with 4 multiple-choice options and the order is randomized on each attempt.
2. **Given** a question is displayed, **When** the user clicks "Next", **Then** the next question is shown and the progress bar updates.
3. **Given** a question is displayed, **When** the user clicks "Previous", **Then** the previous question is shown with the previously selected answer preserved.
4. **Given** the assessment has started, **When** the 15-minute timer reaches zero, **Then** only answered questions are auto-submitted, and the message "Time's up! Your test has been auto-submitted." is displayed.
5. **Given** the user is on any question, **When** they click "Submit Test", **Then** all answered questions are submitted and the result screen is shown.
6. **Given** the user is on the last question, **When** they click "Submit", **Then** the assessment is submitted and the result screen is shown.

---

### User Story 3 - View Post-Assessment Score Card (Priority: P1)

After completing an assessment, the employee sees a detailed score card showing their test score with difficulty weighting, certification bonus, project experience bonus, system rating, final rating status, proficiency level achieved, and any level change.

**Why this priority**: Immediate feedback after an assessment is essential for user engagement and understanding of their skill standing.

**Independent Test**: Can be tested by completing an assessment and verifying the score card displays all required fields with correct calculations.

**Acceptance Scenarios**:

1. **Given** an assessment is submitted, **When** the result screen loads, **Then** the test score is shown as a percentage with earned/max points (e.g., "72% (18/25 points)").
2. **Given** the employee holds a valid certification for the assessed skill, **When** the score card is displayed, **Then** "+20% cert bonus" is shown in the certification bonus line.
3. **Given** the employee does not hold a certification for the assessed skill, **When** the score card is displayed, **Then** "No certification" is shown.
4. **Given** the employee has tagged the assessed skill on a completed project, **When** the score card is displayed, **Then** "+20% project exp" is shown in the project experience bonus line.
5. **Given** all rating sources are available, **When** the score card is displayed, **Then** the final rating is shown; otherwise "Awaiting manager review" is displayed.
6. **Given** the test result maps to a new proficiency level, **When** the score card is displayed, **Then** a level change indicator is shown (e.g., "⬆ Intermediate → Advanced").

---

### User Story 4 - Difficulty-Weighted Score Calculation (Priority: P1)

The system calculates assessment scores using difficulty-based point weighting: Easy = 1 point, Medium = 2 points, Hard = 3 points. The test score is computed as (earned points / max possible points) × 100.

**Why this priority**: Accurate scoring is fundamental to the assessment module's credibility and feeds into the system rating formula.

**Independent Test**: Can be tested by completing an assessment with known difficulty levels and verifying earned points, max points, and percentage match the weighting formula.

**Acceptance Scenarios**:

1. **Given** a question with difficultyLevel "Easy" is answered correctly, **When** the score is calculated, **Then** 1 point is earned.
2. **Given** a question with difficultyLevel "Medium" is answered correctly, **When** the score is calculated, **Then** 2 points are earned.
3. **Given** a question with difficultyLevel "Hard" is answered correctly, **When** the score is calculated, **Then** 3 points are earned.
4. **Given** an incorrectly answered question, **When** the score is calculated, **Then** 0 points are earned for that question regardless of difficulty.
5. **Given** all questions are answered, **When** the test score is calculated, **Then** it equals (total earned points / total max possible points) × 100.

---

### User Story 5 - Retake Assessment with Cooldown (Priority: P2)

An employee who has completed an assessment can retake it, but only after a 24-hour cooldown period from their last attempt. If the cooldown has not passed, a message indicates the remaining time.

**Why this priority**: Retake functionality encourages skill improvement over time while the cooldown prevents gaming the system.

**Independent Test**: Can be tested by completing an assessment, attempting to retake immediately (verifying cooldown message), and then confirming the "Retake" button appears after 24 hours.

**Acceptance Scenarios**:

1. **Given** a completed assessment where 24+ hours have passed since the last attempt, **When** the user views the assessment list, **Then** a "Retake" button is shown next to that skill.
2. **Given** a completed assessment where fewer than 24 hours have passed, **When** the user attempts to retake, **Then** the message "You can retake this assessment in X hours Y minutes." is displayed.
3. **Given** the cooldown has passed, **When** the user clicks "Retake", **Then** a new assessment starts with freshly randomized question order.

---

### User Story 6 - System Rating Calculation (Priority: P2)

After an assessment, the system computes a System Rating using the formula: System Rating = (Test Score × 0.60) + (Certification Bonus × 0.20) + (Project Experience × 0.20). This feeds into the employee's overall skill rating.

**Why this priority**: The system rating is a key component of the multi-source rating framework and must be calculated accurately after each assessment.

**Independent Test**: Can be tested by completing an assessment for a skill with/without certification and project experience, then verifying the system rating matches the formula.

**Acceptance Scenarios**:

1. **Given** a test score of 80%, no certification, and no project experience, **When** the system rating is calculated, **Then** it equals (80 × 0.60) + (0 × 0.20) + (0 × 0.20) = 48%.
2. **Given** a test score of 80%, a valid certification, and a completed project tagged with the skill, **When** the system rating is calculated, **Then** it equals (80 × 0.60) + (100 × 0.20) + (100 × 0.20) = 88%.
3. **Given** a test score of 80% and a valid certification but no project experience, **When** the system rating is calculated, **Then** it equals (80 × 0.60) + (100 × 0.20) + (0 × 0.20) = 68%.

---

### User Story 7 - View Test History (Priority: P2)

An employee can view their complete test history for any skill, including all previous attempts with attempt date, score, earned/max points, and time taken.

**Why this priority**: Test history provides transparency and helps employees track their improvement trajectory.

**Independent Test**: Can be tested by completing multiple assessments for a skill and verifying each attempt appears in the history with correct data.

**Acceptance Scenarios**:

1. **Given** an employee has completed one or more assessments for a skill, **When** they view the Skill Detail screen under the progress tab, **Then** all attempts are listed with attempt date, score percentage, earned points, max points, and time taken.
2. **Given** an employee has no assessment history for a skill, **When** they view the progress tab, **Then** a message indicates no attempts have been made.

---

### User Story 8 - Responsive Assessment Experience (Priority: P3)

The assessment-taking screen adapts across desktop, tablet, and mobile breakpoints to ensure a usable experience on all device sizes.

**Why this priority**: Responsive design ensures accessibility but is a polish concern after core functionality is working.

**Independent Test**: Can be tested by resizing the browser to desktop (1280px+), tablet (768px), and mobile (< 480px) breakpoints and verifying layout adapts per requirements.

**Acceptance Scenarios**:

1. **Given** the user is on a desktop viewport, **When** taking an assessment, **Then** the question card is centered with max-width 720px, the timer is at the top-right, and the progress bar spans full width.
2. **Given** the user is on a tablet viewport, **When** taking an assessment, **Then** the question card is full-width with larger tap targets.
3. **Given** the user is on a mobile viewport, **When** taking an assessment, **Then** the question card is full-screen, answer options are stacked vertically, the timer is a compact badge, and Previous/Next buttons are full-width and sticky at the viewport bottom.

---

### Edge Cases

- What happens when an assessment has no questions available for a skill? → The message "Assessment not available yet for this skill." is displayed and the user cannot start the assessment.
- What happens when the timer expires and zero questions have been answered? → The assessment auto-submits with 0 points earned and the "Time's up!" message is shown.
- What happens when the user navigates away from the assessment mid-test? → Unanswered questions remain unanswered; re-entering the route starts a fresh attempt (no in-progress persistence across navigation).
- What happens when all questions are of the same difficulty? → Scoring still follows the weighting formula; max points reflect the uniform difficulty.
- What happens when the user rapidly clicks Next/Previous? → Navigation is debounced; the selected answer is preserved for each question.
- What happens when the user's certification for a skill has expired? → The certification bonus is not applied (treated as "No certification").

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST display an assessments list showing all skills with their assessment status (Not Attempted, In Progress, Completed) for all authenticated roles (Employee, Manager, Admin).
- **FR-002**: System MUST provide filters on the assessments list for skill category and assessment status.
- **FR-003**: System MUST display a "Start Assessment" button for skills with status "Not Attempted".
- **FR-004**: System MUST display last score, last attempt date, and a "Retake" button for completed skills when the 24-hour cooldown has elapsed.
- **FR-005**: System MUST present assessment questions one at a time with 4 multiple-choice options and a single correct answer per question.
- **FR-006**: System MUST randomize question order on each new assessment attempt for the same skill.
- **FR-007**: System MUST provide Previous and Next navigation buttons to move between questions.
- **FR-008**: System MUST preserve the user's selected answer when navigating between questions during a single attempt.
- **FR-009**: System MUST display a progress bar showing current question number out of total questions.
- **FR-010**: System MUST display a 15-minute countdown timer starting when the assessment begins.
- **FR-011**: System MUST auto-submit only answered questions when the timer expires and display the message "Time's up! Your test has been auto-submitted."
- **FR-012**: System MUST allow explicit submission via a "Submit Test" button at any point during the assessment.
- **FR-013**: System MUST enforce a 24-hour cooldown between assessment retakes for the same skill.
- **FR-014**: System MUST display "You can retake this assessment in X hours Y minutes." when a user attempts to retake before the cooldown has elapsed.
- **FR-015**: System MUST display "Assessment not available yet for this skill." when no questions exist in the exam data for a given skill.
- **FR-016**: System MUST calculate the test score using difficulty-based weighting: Easy = 1 point, Medium = 2 points, Hard = 3 points; Test Score = (earned points / max possible points) × 100.
- **FR-017**: System MUST compute the System Rating using the formula: System Rating = (Test Score × 0.60) + (Certification Bonus × 0.20) + (Project Experience × 0.20).
- **FR-018**: System MUST apply Certification Bonus of 100% weight if the employee holds a valid (non-expired) certification for the assessed skill, and 0% otherwise.
- **FR-019**: System MUST apply Project Experience of 100% weight if the employee has tagged the assessed skill on a completed project, and 0% otherwise.
- **FR-020**: System MUST display a post-assessment score card showing: test score with earned/max points, certification bonus status, project experience bonus status, system rating result, final rating (or "Awaiting manager review"), proficiency level achieved, and level change indicator.
- **FR-021**: System MUST map scores to proficiency levels: 0–40% → Beginner, 41–65% → Intermediate, 66–85% → Advanced, 86–100% → Expert.
- **FR-022**: System MUST store each assessment attempt with: attempt ID, user ID, skill ID, score percentage, earned points, max points, date, and time taken.
- **FR-023**: System MUST display test history (all previous attempts) in the Skill Detail screen under the progress tab, showing attempt date, score, earned/max points, and time taken.
- **FR-024**: System MUST adapt the assessment screen layout to desktop (centered 720px card, timer top-right, full-width progress bar), tablet (full-width card, larger tap targets), and mobile (full-screen card, vertically stacked options, compact timer badge, sticky full-width Previous/Next buttons at bottom).

### Key Entities

- **Skill Exam**: Represents the set of assessment questions for a particular skill. Contains the skill reference and a collection of questions, each with question text, answer options, a correct answer, and a difficulty level (Easy, Medium, Hard).
- **Assessment Attempt**: Represents a single test attempt by an employee for a specific skill. Contains the attempt identifier, employee reference, skill reference, score percentage, earned points, max points, attempt date, and time taken.
- **Assessment Status**: A derived state per employee-skill pair: Not Attempted (no attempts exist), In Progress (assessment currently being taken), or Completed (at least one submitted attempt exists).
- **Score Card**: A computed result displayed after each assessment. Combines test score, certification bonus, project experience bonus, system rating, final rating availability, proficiency level, and level change.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can browse all available skill assessments whether on desktop, tablet, or mobile and identify the status of each within 5 seconds of page load.
- **SC-002**: Users can complete a full skill assessment (5–10 questions) within the 15-minute time limit and receive their score card immediately upon submission.
- **SC-003**: 100% of test scores are calculated correctly using the difficulty-weighted formula, matching expected earned/max point values for any combination of Easy, Medium, and Hard questions.
- **SC-004**: The 24-hour retake cooldown is enforced with zero exceptions — users cannot bypass it under any circumstance.
- **SC-005**: The post-assessment score card displays all required breakdown fields (test score, certification bonus, project experience bonus, system rating, final rating status, level, level change) without any missing or blank sections.
- **SC-006**: All previous assessment attempts for a skill are visible in the test history with accurate dates, scores, and time taken.
- **SC-007**: The assessment-taking screen renders correctly across all three breakpoints (desktop ≥ 1280px, tablet 768px, mobile < 480px) following the specified layout rules.
- **SC-008**: Timer auto-submission works reliably — when 15 minutes elapse, answered questions are submitted and the user sees the timeout message within 1 second.

## Assumptions

- Assessment questions are pre-populated in skill-exams.json and are not editable through the application UI.
- The "In Progress" status is transient and only exists while the user is actively on the take-assessment screen during a session; there is no persistent mid-test saving across page refreshes.
- Each skill has between 5 and 10 questions. If a skill has fewer than 5 or more than 10, all available questions are presented.
- The timer starts at exactly 15 minutes and is not configurable by the user.
- Unanswered questions on auto-submit (timer expiry) count as 0 points — they do not penalize beyond not earning points.
- Certification validity is determined by checking the expiry date: certifications with an expiry date in the past are considered expired and do not contribute to the certification bonus.
- Project experience is determined by checking if the employee is assigned to a completed project that includes the assessed skill in its required skills list.
- Test history is read from skill-test-attempts.json and new attempts are added to in-memory state during the session; data resets on page refresh (consistent with the mock-first architecture).
