# Data Model: Certifications Module

**Feature**: 005-certifications-module  
**Date**: 2026-03-12  
**Source**: Feature specification + constitution mock data schemas + research.md decisions

---

## Entity Relationship Overview

```
Certification *──1 User        (each certification belongs to one employee)
Certification *──1 Skill       (each certification is for one skill)
CertificationStatus ← derived  (computed from expiryDate vs current date)
FileMetadata 1──1 Certification (attached file reference, not persisted)
```

---

## Entities

### 1. Certification

Represents a credential uploaded by an employee for a specific skill. Read/write from `certifications.json` via interceptor.

```typescript
// src/app/shared/models/certification.model.ts

export interface Certification {
  certId: string;            // Unique identifier (e.g., "cert-001")
  userId: string;            // Reference to users.json
  skillId: string;           // Reference to skill-definitions.json
  certName: string;          // Display name of the certification
  issuingOrg: string;        // Organization that issued the certification
  issueDate: string;         // ISO 8601 date (e.g., "2025-06-15")
  expiryDate: string;        // ISO 8601 date (e.g., "2027-06-15")
  filePath: string;          // Simulated upload path (e.g., "assets/uploads/cert.pdf")
}
```

**Validation Rules**:
- `certId` must be non-empty and unique
- `userId` must reference an existing user
- `skillId` must reference a skill in the user's profile (employee-skills.json)
- `certName` must be non-empty (max 100 characters)
- `issuingOrg` must be non-empty (max 100 characters)
- `issueDate` must be a valid ISO 8601 date string
- `expiryDate` must be a valid ISO 8601 date string and must be after `issueDate`
- `filePath` must be non-empty

**JSON Source**: `/assets/mock-data/certifications.json`

---

### 2. CertificationStatus (Derived)

A computed state per certification — not stored, derived from `expiryDate` relative to the current date.

```typescript
// src/app/shared/models/certification.model.ts

export type CertificationStatus = 'Valid' | 'Expiring Soon' | 'Expired';
```

**Derivation Rules** (implemented in `certification.util.ts`):
- `'Valid'`: `expiryDate` is more than 30 days from today
- `'Expiring Soon'`: `expiryDate` is within 30 days from today (inclusive of today)
- `'Expired'`: `expiryDate` is before today

**Edge Cases**:
- Certification expiring today → `'Expiring Soon'` (within 30 days, date-only comparison)
- All dates normalized to midnight; no time component considered

---

### 3. FileMetadata (Transient)

Metadata extracted from the selected file during upload. Exists only in component state during the upload form session; the `filePath` is what gets stored in the `Certification` record.

```typescript
// src/app/shared/models/certification.model.ts

export interface FileMetadata {
  fileName: string;         // Original filename (e.g., "aws-cert.pdf")
  fileSize: number;         // Size in bytes
  fileType: string;         // MIME type (e.g., "application/pdf")
  filePath: string;         // Simulated path: "assets/uploads/{fileName}"
}
```

**Validation Rules** (enforced at component level, not stored):
- `fileType` must be one of: `'application/pdf'`, `'image/jpeg'`, `'image/png'`
- `fileSize` must be ≤ 5,242,880 bytes (5 MB)

---

### 4. CreateCertificationPayload

The payload shape sent from the upload form to the NgRx action and subsequently to the interceptor.

```typescript
// src/app/shared/models/certification.model.ts

export interface CreateCertificationPayload {
  certName: string;
  skillId: string;
  issuingOrg: string;
  issueDate: string;        // ISO 8601 date
  expiryDate: string;       // ISO 8601 date
  filePath: string;         // From FileMetadata.filePath
}
```

The interceptor generates `certId` and attaches `userId` from the session.

---

### 5. CertificationWithStatus (View Model)

A derived view model combining the certification entity with its computed status, used by list and detail components.

```typescript
// src/app/shared/models/certification.model.ts

export interface CertificationWithStatus extends Certification {
  status: CertificationStatus;
}
```

---

## NgRx State Shape

```typescript
// src/app/core/store/certifications/certifications.state.ts

export interface CertificationsState {
  certifications: Certification[];     // All certifications for logged-in user
  loading: boolean;                    // True while loading from interceptor
  error: string | null;                // Error message from failed operations
  uploadInProgress: boolean;           // True while a new certification upload is pending
}

export const initialCertificationsState: CertificationsState = {
  certifications: [],
  loading: false,
  error: null,
  uploadInProgress: false,
};
```

**State registered via**: `provideState('certifications', certificationsReducer)` in the certifications feature route config (lazy-loaded).

---

## JSON Data Source

### `/assets/mock-data/certifications.json`

```json
[
  {
    "certId": "cert-001",
    "userId": "user-001",
    "skillId": "skill-angular",
    "certName": "Angular Certified Developer",
    "issuingOrg": "Google",
    "issueDate": "2025-01-15",
    "expiryDate": "2027-01-15",
    "filePath": "assets/uploads/angular-cert.pdf"
  },
  {
    "certId": "cert-002",
    "userId": "user-001",
    "skillId": "skill-aws",
    "certName": "AWS Solutions Architect Associate",
    "issuingOrg": "Amazon Web Services",
    "issueDate": "2025-06-01",
    "expiryDate": "2026-04-01",
    "filePath": "assets/uploads/aws-cert.pdf"
  }
]
```

---

## Entity Relationships to Other Features

| This Feature Entity | Related Entity (from other phases) | Relationship |
|---|---|---|
| `Certification.userId` | `User.userId` (Phase 1) | Many-to-one: each cert belongs to one user |
| `Certification.skillId` | `SkillDefinition.skillId` (Phase 2) | Many-to-one: each cert is for one skill |
| `Certification.skillId` | `EmployeeSkill.skillId` (Phase 3) | Upload dropdown populated from user's employee-skills |
| Computed `CertificationStatus` | `ScoreCard` (Phase 4) | Valid cert triggers +10% bonus and 0.20-weight CertBonus |
| `CertificationWithStatus` | Dashboard alerts (Phase 3) | Expiring Soon certs flagged on dashboard |
