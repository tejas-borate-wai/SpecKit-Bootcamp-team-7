# Analyze Remediation Checklist: Mock Authentication and Role-Based Navigation

**Purpose**: Gate checklist — validates that all issues surfaced in the 2026-03-13 `/speckit.analyze` report are properly resolved in spec.md, plan.md, and tasks.md before implementation begins. Items test requirements quality (completeness, clarity, consistency) — not implementation correctness.
**Created**: 2026-03-13
**Feature**: [spec.md](../spec.md) | [plan.md](../plan.md) | [tasks.md](../tasks.md)
**Blocking**: ✅ YES — CRITICAL and HIGH items must all pass before `/speckit.implement` is invoked.

---

## Constitution Alignment · C1 (CRITICAL)

*Tests whether the state management architecture is consistently and correctly specified across spec.md, the project constitution, plan.md, and tasks.md.*

- [ ] CHK001 - Is FR-003's state management mechanism aligned with Constitution Enforcement Rule #6 ("BehaviorSubject is forbidden for globally-shared cross-component state — use the NgRx store")? [Consistency, Spec §FR-003]
- [ ] CHK002 - Does the Clarifications section (Session 2026-03-13) specify NgRx — not `BehaviorSubject<User | null>` — as the session state architecture? [Consistency, Spec §Clarifications]
- [ ] CHK003 - Does the Assumptions section's state management bullet align with the constitution (NgRx store) rather than contradicting it with BehaviorSubject? [Consistency, Spec §Assumptions]
- [ ] CHK004 - Are all locations in spec.md that reference session state architecture (FR-003, Clarifications, Assumptions) internally consistent AND consistent with the constitution? [Consistency, Gap]

---

## Session Restore Requirements · F1 (HIGH)

*Tests whether the `lastRoute` redirect requirement is complete enough to implement without ambiguity.*

- [ ] CHK005 - Does FR-009 or an assumption specify HOW `lastRoute` is written to localStorage (e.g., on every `NavigationEnd` router event) so the mechanism is unambiguous to implementers? [Completeness, Spec §FR-009, Gap]
- [ ] CHK006 - Does US6 Acceptance Criteria 1 define all three fallback cases for `lastRoute` explicitly: absent → /dashboard, invalid path → /dashboard, role-restricted path → /dashboard? [Clarity, Spec §US6-AC1]
- [ ] CHK007 - Is the `lastRoute` localStorage key name explicitly named in spec or plan, consistent with the existing `skillmatrix_session` naming convention? [Clarity, Gap]
- [ ] CHK008 - Is there at least one task covering the writing of `lastRoute` to localStorage on each navigation, distinct from the existing session-restore task (T054)? [Completeness, Gap]

---

## Breakpoint Threshold Consistency · I1 (HIGH)

*Tests whether the desktop breakpoint threshold is unambiguously defined and consistent across all documents.*

- [ ] CHK009 - Is the desktop sidebar threshold defined as a single authoritative value — either ≥1024px (per constitution §18.2) or ≥1280px (per spec FR-021) — with no conflicting definition across spec.md, plan.md, and `_breakpoints.scss` design? [Consistency, Spec §FR-021]
- [ ] CHK010 - If spec FR-021/FR-022/FR-023 use a desktop threshold (≥1280px) differing from constitution §18.2 (≥1024px), is this override explicitly recorded as an intentional decision in Clarifications or Assumptions? [Traceability, Gap]
- [ ] CHK011 - Do the three responsive breakpoint requirements (FR-021, FR-022, FR-023) together cover all viewport widths without gaps or undefined ranges (e.g., 1024px–1279px)? [Completeness, Spec §FR-021–FR-023]

---

## Permission Notification Scope · A1 (HIGH)

*Tests whether the trigger condition for FR-026's toast notification is specified without conflict with the existing route guard redirect behavior.*

- [ ] CHK012 - Does FR-026 explicitly scope its trigger — specifying whether the permission toast fires on HTTP 403 responses from the interceptor, on route navigation blocks, or both? [Clarity, Spec §FR-026]
- [ ] CHK013 - Are the behaviors in FR-012 (RoleGuard → redirect to /unauthorized page) and FR-026 (permission denied toast) specified for mutually exclusive trigger conditions so they cannot both fire for the same user action? [Consistency, Spec §FR-012, §FR-026]
- [ ] CHK014 - Does FR-026's specified behavior align with the constitution Error Handling Standard: "HTTP 403 from interceptor: ALWAYS show permission toast (never an inline error)"? [Consistency, Spec §FR-026]
- [ ] CHK015 - Is there a task that wires the toast trigger to the correct mechanism (HTTP error handler or interceptor 403 path) rather than leaving it as an unwired component? [Completeness, Gap]

---

## Logout & Back-Navigation Requirements · I2 (MEDIUM)

*Tests whether the logout requirement is fully specified including browser history behavior.*

- [ ] CHK016 - Does FR-010 or US4-AC2 explicitly specify that browser history must be replaced (not merely navigated) on logout, preventing the back button from exposing previously authenticated views? [Completeness, Spec §FR-010, §US4-AC2]
- [ ] CHK017 - Is the back-button post-logout behavior covered by a dedicated acceptance criterion rather than implied by session clearance? [Clarity, Spec §US4-AC2]

---

## Edge Case Determinism · A2 (MEDIUM)

*Tests whether edge cases define single deterministic outcomes.*

- [ ] CHK018 - Does the unknown-route edge case define a single deterministic outcome (not two alternatives "redirect to dashboard OR show a 404 state")? [Clarity, Spec §Edge Cases]
- [ ] CHK019 - If redirecting authenticated users to /dashboard for unknown routes, is the unauthenticated variant (redirect to /login) also explicitly specified as the fallback? [Completeness, Spec §Edge Cases]

---

## Feature Scope Boundaries · U1 D1 (MEDIUM)

*Tests whether in-scope vs. deferred behaviors are unambiguously documented.*

- [ ] CHK020 - Is the notification bell's in-scope behavior for this phase explicitly defined (e.g., "routes to /notifications; unread count badge is a static placeholder; live data deferred to Phase 9")? [Completeness, Spec §US5-AC4, §Assumptions]
- [ ] CHK021 - Does FR-008 ("session MUST persist in localStorage across page refreshes") add a testable behavior beyond what FR-003 (write on login) and FR-009 (read on init) already jointly cover, or should it be consolidated to remove duplication? [Clarity, Spec §FR-008]
- [ ] CHK022 - Are all deferred features (notification data, search functionality, mobile bottom nav, animations) listed in Assumptions with their target phase reference so scope is unambiguous? [Traceability, Spec §Assumptions]

---

## RBAC & Guard Requirement Clarity (Domain Quality)

*Tests completeness and clarity of the RBAC requirements independent of the analyze findings.*

- [ ] CHK023 - Is the /unauthorized route explicitly listed in FR-013 as public (no auth guard applied), making the guard matrix exhaustive for all named routes? [Completeness, Spec §FR-013]
- [ ] CHK024 - Does the privilege-escalation edge case (user modifies localStorage role) name the authoritative source for role validation at guard time — is it unambiguous that guards read from application state (NgRx store), not directly from localStorage? [Clarity, Spec §Edge Cases]
- [ ] CHK025 - Are the /reports (Manager+Admin) and /reports/heatmap (Admin only) route guard rules specified such that a Manager navigating to /reports/heatmap is unambiguously covered by the more-specific rule? [Consistency, Spec §FR-013]
- [ ] CHK026 - Is the DOM-exclusion requirement (FR-015 "unauthorized items MUST NOT exist in the DOM") referenced by a measurable success criterion — can a reviewer objectively determine compliance? [Measurability, Spec §FR-015, §SC-003]

---

## Non-Functional & Accessibility Requirements · U2 U3 (LOW)

*Tests whether NFRs are either specified in scope or explicitly deferred.*

- [ ] CHK027 - Are animation requirements from the constitution (sidebar collapse 200ms, page transitions 300ms, toast slide 250ms, prefers-reduced-motion) either specified in scope for this phase or explicitly excluded with a phase reference? [Completeness, Gap]
- [ ] CHK028 - Are accessibility requirements (aria-labels on nav items and form fields, 44×44px touch targets, keyboard navigation) either covered by a spec requirement or plan constitution check, or explicitly deferred? [Completeness, Gap]

---

## Notes

- Mark items with `[x]` when the reviewer confirms the requirement is complete, clear, and consistent.
- For failed items, add a note inline with the finding and reference the relevant file + section.
- **CRITICAL (CHK001–CHK004)**: Must pass before any implementation task is started.
- **HIGH (CHK005–CHK015)**: Must pass before Phase 2 Foundational tasks begin.
- **MEDIUM / LOW (CHK016–CHK028)**: Should pass before Phase 3+ user story tasks begin; document any intentional deferrals.
