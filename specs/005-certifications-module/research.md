# Technical Research: Certifications Module

**Feature Branch**: `005-certifications-module`  
**Date**: 2026-03-12  
**Context**: Angular 17+ SPA, NgRx for state, Angular Material UI, SCSS, TypeScript strict mode, mock-first (no backend), data from JSON via HttpClient interceptors.

---

## 1. Simulated File Upload Strategy

### Decision

Use a **client-side-only file validation approach** with Angular Reactive Forms. The file input captures the `File` object, validates format and size on the client, and stores only the **file metadata** (name, size, type, a generated `filePath` reference) in NgRx state. The actual file bytes are not uploaded or persisted anywhere — consistent with the mock-first architecture.

### Rationale

| Criterion | Store File Metadata Only | FileReader + base64 in-memory | FormData to interceptor |
|---|---|---|---|
| **Alignment with mock-first** | ✅ Perfect — no server, no persistence beyond session | ⚠️ Bloats NgRx store with base64 strings (certs can be ~5MB each) | ❌ Over-engineered — no real endpoint to receive FormData |
| **Memory usage** | Minimal — only metadata strings | High — base64 encoding adds 33% overhead per file | Moderate — FormData held in memory |
| **NgRx compatibility** | Serializable metadata objects in store | Large strings in store; breaks DevTools time-travel at scale | FormData is not serializable; cannot store in NgRx |
| **Spec compliance** | Matches FR-010 ("file reference stored, not actual file") and FR-011 | Exceeds spec scope | Exceeds spec scope |
| **Implementation complexity** | Low — validate, extract metadata, dispatch action | Medium — async FileReader callbacks | High — interceptor must parse multipart |

**Implementation Pattern:**

```typescript
// In CertUploadComponent
onFileSelected(event: Event): void {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;

  // Validate format
  const allowedFormats = ['application/pdf', 'image/jpeg', 'image/png'];
  if (!allowedFormats.includes(file.type)) {
    this.fileError = 'Only PDF, JPG, and PNG files are accepted.';
    return;
  }

  // Validate size (5 MB = 5 * 1024 * 1024 bytes)
  if (file.size > 5 * 1024 * 1024) {
    this.fileError = 'File size must not exceed 5 MB.';
    return;
  }

  this.fileError = null;
  this.selectedFile = {
    fileName: file.name,
    fileSize: file.size,
    fileType: file.type,
    filePath: `assets/uploads/${file.name}` // Simulated path
  };
}
```

**Key decision**: File validation happens in the component (it's a UI concern — checking the `File` object's `type` and `size` properties). The metadata is then passed to the NgRx action; the effect sends it to the interceptor as a regular JSON POST body (not FormData).

### Alternatives Considered

| Alternative | Why Not Chosen |
|---|---|
| **FileReader to base64** | Stores entire file contents in memory/store. For a 5MB PDF, that's ~6.7MB base64. With multiple certs, this bloats the NgRx store, breaks DevTools, and exceeds what the spec requires. |
| **FormData to interceptor** | FormData is not JSON-serializable; cannot be stored in NgRx state; interceptor would need to parse multipart bodies — unnecessary complexity for a mock app. |
| **Third-party upload library (ng2-file-upload)** | Adds a dependency for functionality we don't actually need (real uploads). Client-side validation is trivially implementable with native `File` API. |

---

## 2. Certification Status Computation

### Decision

Implement certification status as a **pure utility function** in `src/app/shared/utils/certification.util.ts` that computes status from expiry date and current date. Also provide an Angular **pipe** (`CertificationStatusPipe`) for template use. Status is **never stored** — always derived at render time.

### Rationale

| Criterion | Computed at render time | Stored in JSON / NgRx |
|---|---|---|
| **Accuracy** | Always correct relative to current date | Stale if date changes since last computation |
| **Data consistency** | Single source of truth (expiryDate) | Two sources of truth (expiryDate + status) can diverge |
| **Spec alignment** | Matches assumption: "The 30-day 'Expiring Soon' threshold is calculated from the current date at the time of rendering; it is not a stored field." | Violates spec assumption |
| **Performance** | Trivial date comparison — O(1); no measurable impact | Slightly faster (no computation) but negligible |

**Status Logic:**

```typescript
export type CertificationStatus = 'Valid' | 'Expiring Soon' | 'Expired';

export function computeCertificationStatus(
  expiryDate: string,
  referenceDate: Date = new Date()
): CertificationStatus {
  const expiry = new Date(expiryDate);
  const today = new Date(referenceDate.getFullYear(), referenceDate.getMonth(), referenceDate.getDate());
  const expiryDay = new Date(expiry.getFullYear(), expiry.getMonth(), expiry.getDate());

  if (expiryDay < today) {
    return 'Expired';
  }

  const thirtyDaysFromNow = new Date(today);
  thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

  if (expiryDay <= thirtyDaysFromNow) {
    return 'Expiring Soon';
  }

  return 'Valid';
}
```

**Date-only comparison**: Per spec edge case, dates are date-only (no time component). A certification expiring today is "Expiring Soon" (within 30 days), not "Expired." The function normalizes both dates to midnight before comparison.

**Injecting `referenceDate`**: The default is `new Date()` (current date), but accepting a parameter enables deterministic unit testing without mocking `Date.now()`.

### Alternatives Considered

| Alternative | Why Not Chosen |
|---|---|
| **Store status in certifications.json** | Creates a derived field in source data; goes stale; violates spec assumption about runtime computation. |
| **Compute in NgRx selector** | Selectors should be pure and memoized. Injecting `new Date()` into a selector breaks memoization (different result each second). Better to compute in pipe/util and pass current date explicitly. |
| **Cron-style background update** | Over-engineered for a frontend-only app; no server process to run cron; status only needs to be accurate when displayed. |

---

## 3. Certification Rating Bonus Integration

### Decision

Implement the +10% rating bonus and Certification Bonus (System Rating formula) as **pure functions** in `src/app/core/services/certification-bonus.service.ts`. The service checks certification validity (non-expired) and applies the bonus. This service is called by the scoring pipeline (from Phase 4) whenever a final rating is computed.

### Rationale

The +10% bonus and the 0.20-weight Certification Bonus in the System Rating formula are related but distinct:

1. **+10% additive bonus**: Applied directly to the skill's test score percentage.  
   `adjustedScore = Math.min(testScore + 10, 100)`

2. **Certification Bonus (System Rating formula)**: Binary (100% if valid cert exists, 0% otherwise), weighted at 0.20.  
   `SystemRating = (TestScore × 0.60) + (CertBonus × 0.20) + (ProjectExperience × 0.20)`  
   Where `CertBonus = hasValidCert ? 1.0 : 0.0`

**Multiple certifications for the same skill**: Per spec edge case, when multiple certs exist for the same skill, the one with the latest expiry date determines bonus eligibility. Only non-expired certs count.

```typescript
export function hasValidCertification(
  certifications: Certification[],
  skillId: string,
  referenceDate: Date = new Date()
): boolean {
  return certifications
    .filter(c => c.skillId === skillId)
    .some(c => computeCertificationStatus(c.expiryDate, referenceDate) !== 'Expired');
}

export function applyRatingBonus(testScore: number, hasValidCert: boolean): number {
  if (!hasValidCert) return testScore;
  return Math.min(testScore + 10, 100);
}

export function getCertificationBonusWeight(hasValidCert: boolean): number {
  return hasValidCert ? 1.0 : 0.0;
}
```

### Alternatives Considered

| Alternative | Why Not Chosen |
|---|---|
| **Compute bonus in component** | Business logic in components violates constitution (shared components must have no business logic; services handle logic). |
| **Store bonus flag in NgRx** | Would need to be recomputed every time certifications change AND every day (expiry changes over time). Simpler to compute on demand. |
| **Single service for all scoring** | Phase 4 already has `scoring.service.ts`. Rather than modifying it, the certification bonus service integrates with it — separation of concerns. |

---

## 4. NgRx State Design for Certifications

### Decision

Create a **dedicated `certifications` feature state slice** registered via `StoreModule.forFeature()` (or `provideState()` in standalone config). The slice stores all certifications for the logged-in user plus loading/error state. Upload submissions dispatch actions handled by effects.

### Rationale

| Criterion | Dedicated feature slice | Add to existing `skills` slice |
|---|---|---|
| **Separation of concerns** | Certifications have distinct lifecycle (upload, expiry) from skills | Bloats the skills slice; unrelated reducers mixed |
| **Lazy loading** | Feature state registered when certifications route loads | Skills slice loaded at app init — certifications data loaded unnecessarily early |
| **Selector performance** | Narrow selectors; changes to certifications don't trigger skills selectors | Skills selectors re-evaluate on cert changes |

**Recommended State Shape:**

```typescript
export interface CertificationsState {
  certifications: Certification[];     // All certifications for the logged-in user
  loading: boolean;
  error: string | null;
  uploadInProgress: boolean;           // Tracks upload submission state
}

export const initialCertificationsState: CertificationsState = {
  certifications: [],
  loading: false,
  error: null,
  uploadInProgress: false,
};
```

**Actions:**

```typescript
// Load certifications for current user
export const loadCertifications = createAction('[Certifications] Load');
export const loadCertificationsSuccess = createAction('[Certifications] Load Success', props<{ certifications: Certification[] }>());
export const loadCertificationsFailure = createAction('[Certifications] Load Failure', props<{ error: string }>());

// Upload new certification
export const uploadCertification = createAction('[Certifications] Upload', props<{ certification: CreateCertificationPayload }>());
export const uploadCertificationSuccess = createAction('[Certifications] Upload Success', props<{ certification: Certification }>());
export const uploadCertificationFailure = createAction('[Certifications] Upload Failure', props<{ error: string }>());
```

**Key Selectors:**

```typescript
export const selectAllCertifications = createSelector(selectCertificationsState, state => state.certifications);
export const selectCertificationsLoading = createSelector(selectCertificationsState, state => state.loading);

export const selectCertificationsForSkill = (skillId: string) => createSelector(
  selectAllCertifications,
  (certs) => certs.filter(c => c.skillId === skillId)
);

export const selectCertificationsWithStatus = createSelector(
  selectAllCertifications,
  (certs) => certs.map(c => ({
    ...c,
    status: computeCertificationStatus(c.expiryDate)
  }))
);
```

### Alternatives Considered

| Alternative | Why Not Chosen |
|---|---|
| **Add to root/session state** | Root state should only contain session and cross-cutting concerns. Certifications are a feature concern. |
| **Component-local state** | Certifications are read from multiple screens (list, skill detail, dashboard). Must be in shared NgRx state. |
| **BehaviorSubject in service** | Prohibited by constitution (Enforcement Rule #6). |

---

## 5. File Input UX Pattern in Angular Material

### Decision

Use a **custom file input component** composed of an Angular Material `mat-form-field` with a readonly `mat-input` displaying the selected filename and a `mat-icon-button` with an `attach_file` icon that triggers a hidden native `<input type="file">`. This provides Material Design consistency while maintaining full native file picker behavior.

### Rationale

Angular Material does not provide an official `mat-file-input` component. The three common approaches:

| Approach | Pros | Cons |
|---|---|---|
| **Custom mat-form-field + hidden input** | Material look; keyboard accessible; validation integrates with reactive forms; reusable | Requires slight setup for hidden input click delegation |
| **Native `<input type="file">` styled** | Simple; native behavior | Doesn't match Material Design; inconsistent across browsers; hard to style |
| **Third-party library (ngx-material-file-input)** | Ready-made | Adds a dependency; may not support Angular 17 standalone; version compatibility risk |

**Implementation Pattern:**

```html
<mat-form-field appearance="outline">
  <mat-label>Upload File</mat-label>
  <input matInput readonly [value]="selectedFile?.fileName || ''" placeholder="Select a file...">
  <button mat-icon-button matSuffix type="button" (click)="fileInput.click()" aria-label="Choose file">
    <mat-icon>attach_file</mat-icon>
  </button>
  <mat-error *ngIf="fileError">{{ fileError }}</mat-error>
</mat-form-field>
<input #fileInput type="file" hidden accept=".pdf,.jpg,.jpeg,.png" (change)="onFileSelected($event)">
```

The `accept` attribute provides a first-pass filter in the OS file picker, but validation is still performed in TypeScript since `accept` can be bypassed.

### Alternatives Considered

| Alternative | Why Not Chosen |
|---|---|
| **ngx-material-file-input** | Third-party dependency; unclear Angular 17 standalone support; adds maintenance burden for a single file input. |
| **Drag-and-drop zone** | Nice UX enhancement but not required by spec; increases scope and complexity; can be added as a P3 enhancement. |
| **Native input only** | Doesn't match the Material Design language used throughout the app; looks inconsistent. |

---

## 6. Duplicate Certification Handling

### Decision

Allow **multiple certifications for the same skill**. When determining bonus eligibility, use the certification with the **latest expiry date** among non-expired certs. This matches the spec edge case: "Both certifications are stored; the system uses the one with the latest expiry date for rating bonus calculation."

### Rationale

No uniqueness constraint on (userId, skillId) in certifications.json. This is intentional — employees may earn multiple certifications for the same skill from different organizations (e.g., AWS Solutions Architect + AWS Developer for "Cloud/AWS" skill).

```typescript
export function getActiveCertForSkill(
  certifications: Certification[],
  skillId: string,
  referenceDate: Date = new Date()
): Certification | null {
  const validCerts = certifications
    .filter(c => c.skillId === skillId && computeCertificationStatus(c.expiryDate, referenceDate) !== 'Expired')
    .sort((a, b) => new Date(b.expiryDate).getTime() - new Date(a.expiryDate).getTime());

  return validCerts[0] ?? null;
}
```

### Alternatives Considered

| Alternative | Why Not Chosen |
|---|---|
| **Block duplicate uploads** | Spec explicitly states both are stored. Employee may have legitimate multiple certs (e.g., different orgs, different cert levels). |
| **Replace existing cert on upload** | Destructive; loses audit trail; spec says both are stored. |

---

## 7. Empty Skill Profile Guard for Upload

### Decision

When a user navigates to `/certifications/upload` and has no skills in their profile, show the message **"Add skills to your profile before uploading certifications."** with the Skill dropdown disabled and the form non-submittable. Do NOT redirect — let the user see the form context and the explanatory message.

### Rationale

| Approach | UX Quality | Spec Compliance |
|---|---|---|
| **Show form with disabled dropdown + message** | User understands why they can't upload; clear call to action implied | ✅ Matches FR-020 exactly |
| **Redirect to /my-skills/add** | Confusing — user wanted to upload a cert, not add a skill | ❌ No redirect mentioned in spec |
| **Hide upload button entirely** | User doesn't know the feature exists | ❌ Spec says show a message |

**Implementation**: The NgRx selector `selectUserSkills` (from Phase 3 skills slice) determines if the user has skills. If empty, the form shows the message and disables submission.

---

## Summary of Decisions

| # | Topic | Decision | Key File |
|---|---|---|---|
| 1 | File upload | Client-side validation only; store metadata, not file bytes | `cert-upload.component.ts` |
| 2 | Status computation | Pure function + pipe; never stored; computed from expiryDate at render time | `certification.util.ts`, `certification-status.pipe.ts` |
| 3 | Rating bonus | Pure functions for +10% bonus and System Rating CertBonus weight | `certification-bonus.service.ts` |
| 4 | NgRx state | Dedicated `certifications` feature slice; lazy-loaded with feature route | `certifications.reducer.ts` |
| 5 | File input UX | Custom mat-form-field with hidden native input + Material icon button | `cert-upload.component.html` |
| 6 | Duplicate certs | Allowed; latest-expiry non-expired cert determines bonus | `certification.util.ts` |
| 7 | Empty skills guard | Show message + disable form; no redirect | `cert-upload.component.ts` |
