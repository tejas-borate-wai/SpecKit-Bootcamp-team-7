# Quickstart: Certifications Module

**Feature**: 005-certifications-module  
**Branch**: `005-certifications-module`  
**Date**: 2026-03-12

---

## Prerequisites

- Phase 1 (Mock Auth & Navigation) — AuthGuard, RoleGuard, session management, app shell, toast notifications
- Phase 2 (Skill Framework) — skill-definitions.json data and services, SkillDefinition model
- Phase 3 (Employee Skill Profile) — employee-skills.json services, SkillsState NgRx slice, dashboard component
- Phase 4 (Skill Assessments) — scoring utilities (to integrate certification bonus into System Rating)
- Angular CLI, Node.js 18+ installed

---

## Build Order

### Step 1: Define TypeScript Interfaces

Create the data model interfaces for certifications:

1. `src/app/shared/models/certification.model.ts` — `Certification`, `CertificationStatus`, `FileMetadata`, `CreateCertificationPayload`, `CertificationWithStatus`

**Verify**: All interfaces compile with TypeScript strict mode. No `any` types used.

---

### Step 2: Create Utility Functions

1. `src/app/shared/utils/certification.util.ts` — Pure functions:
   - `computeCertificationStatus(expiryDate, referenceDate?)` → `CertificationStatus`
   - `hasValidCertification(certifications, skillId, referenceDate?)` → `boolean`
   - `getActiveCertForSkill(certifications, skillId, referenceDate?)` → `Certification | null`
   - `applyRatingBonus(testScore, hasValidCert)` → `number`
   - `getCertificationBonusWeight(hasValidCert)` → `number`

**Verify**: Unit tests pass for all functions — cover boundary values (expired yesterday, expiring today, expiring in 30 days, expiring in 31 days, 95%+10% caps at 100%).

---

### Step 3: Create Certification Status Pipe

1. `src/app/shared/pipes/certification-status.pipe.ts` — `CertificationStatusPipe`:
   - Input: `expiryDate: string`
   - Output: `CertificationStatus` string

**Verify**: Pipe transforms expiry dates to correct status strings in unit tests.

---

### Step 4: Extend MockApiInterceptor

Update `src/app/core/interceptors/mock-api.interceptor.ts` to handle:

1. `GET /api/certifications?userId=:userId` → filter certifications.json by userId
2. `GET /api/certifications/:certId` → find by certId, return 404 if not found
3. `POST /api/certifications` → generate certId, attach userId from session, add to in-memory array, return 201
4. `DELETE /api/certifications/:certId` → remove from in-memory array (optional)

**Verify**: Each endpoint returns correct mock data. POST generates a new certId and appends to array.

---

### Step 5: Create NgRx Certifications Store

1. `src/app/core/store/certifications/certifications.actions.ts` — `loadCertifications`, `loadCertificationsSuccess`, `loadCertificationsFailure`, `uploadCertification`, `uploadCertificationSuccess`, `uploadCertificationFailure`
2. `src/app/core/store/certifications/certifications.reducer.ts` — `certificationsReducer` with `CertificationsState`
3. `src/app/core/store/certifications/certifications.effects.ts` — `CertificationsEffects` (load and upload HTTP calls via `CertificationService`)
4. `src/app/core/store/certifications/certifications.selectors.ts` — `selectAllCertifications`, `selectCertificationsLoading`, `selectCertificationsForSkill`, `selectCertificationsWithStatus`

**Verify**: Store compiles. Reducer handles all action types. Selectors return correct derived data in unit tests.

---

### Step 6: Create CertificationService

1. `src/app/core/services/certification.service.ts` — Service wrapping HttpClient calls:
   - `getCertifications(userId: string)` → `Observable<Certification[]>`
   - `getCertification(certId: string)` → `Observable<Certification>`
   - `createCertification(payload: CreateCertificationPayload)` → `Observable<Certification>`

**Verify**: Service methods make correct HTTP calls. Inject and test with HttpClientTestingModule.

---

### Step 7: Create CertificationBonusService

1. `src/app/core/services/certification-bonus.service.ts` — Service integrating certification validity into the scoring pipeline:
   - `hasValidCertForSkill(skillId: string)` → `Observable<boolean>` (reads from NgRx certifications state)
   - `getAdjustedScore(testScore: number, skillId: string)` → `Observable<number>`

**Verify**: Returns correct bonus calculations. Expired certs return no bonus.

---

### Step 8: Create Shared Components

1. `src/app/shared/components/status-badge/status-badge.component.ts` — Standalone component:
   - Input: `status: CertificationStatus`
   - Renders badge with color: green (Valid), amber (Expiring Soon), red (Expired)

2. `src/app/shared/components/certified-badge/certified-badge.component.ts` — Standalone component:
   - Input: `isVisible: boolean`
   - Renders "Certified" chip/badge when visible

**Verify**: Both components render correct visual output for each input state.

---

### Step 9: Create Feature Components

1. `src/app/features/certifications/certifications-list/certifications-list.component.ts` — Standalone component:
   - Dispatches `loadCertifications` on init
   - Displays table with columns: Certification Name, Skill, Issuing Org, Issue Date, Expiry Date, Status
   - Uses `StatusBadgeComponent` for status column
   - Mobile: switches to card layout via BreakpointObserver

2. `src/app/features/certifications/cert-upload/cert-upload.component.ts` — Standalone component:
   - Reactive form with all required fields
   - Skill dropdown populated from user's employee-skills (NgRx)
   - File input with client-side validation (format + size)
   - Date validation (expiry > issue)
   - On submit: dispatches `uploadCertification` action
   - Responsive: two-column desktop, single-column mobile with sticky submit

**Verify**: List renders mock data with correct status badges. Upload form validates all fields. Successful upload dispatches action and navigates to list.

---

### Step 10: Register Feature Routes

1. `src/app/features/certifications/certifications.routes.ts` — Lazy-loaded routes:
   - `/certifications` → `CertificationsListComponent`
   - `/certifications/upload` → `CertUploadComponent`
   - Both routes: `AuthGuard`, all roles

2. Update `src/app/app.routes.ts` to lazy-load certifications routes.

**Verify**: Navigation to `/certifications` and `/certifications/upload` works. AuthGuard blocks unauthenticated access.

---

### Step 11: Integrate Certified Badge into Skill Profile (Phase 3 Touchpoint)

1. Update skill profile list/detail components to show `CertifiedBadgeComponent` when a valid certification exists for the skill.
2. Use `selectCertificationsForSkill(skillId)` selector + `hasValidCertification()` utility.

**Verify**: Skills with valid certs show "Certified" badge. Skills without or with expired certs do not.

---

### Step 12: Integrate Expiry Alerts into Dashboard (Phase 3 Touchpoint)

1. Add expiry alert section to the dashboard component.
2. Use `selectCertificationsWithStatus` selector, filter for `'Expiring Soon'` status.
3. Display alert list with certification name and days until expiry.

**Verify**: Dashboard shows alerts for certifications expiring within 30 days.

---

## Verification Checklist

| # | Check | Passing? |
|---|---|---|
| 1 | All interfaces compile in strict mode | |
| 2 | Utility functions have unit tests covering boundary dates | |
| 3 | MockApiInterceptor handles all 4 certification endpoints | |
| 4 | NgRx store loads and stores certifications correctly | |
| 5 | Certifications list displays with correct status badges | |
| 6 | Upload form validates all fields (required, format, size, dates) | |
| 7 | Successful upload adds certification to NgRx state and shows toast | |
| 8 | "Certified" badge shows on skill profile for valid certs only | |
| 9 | Dashboard shows expiry alerts for certs expiring within 30 days | |
| 10 | Responsive layouts work: table→cards on mobile, 2-col→1-col form | |
| 11 | No `any` types, no inline styles, no BehaviorSubject services | |
