# Mock API Contract: Certifications Module

**Feature**: 005-certifications-module  
**Date**: 2026-03-12  
**Architecture**: Angular HttpClient → MockApiInterceptor → in-memory JSON data

---

## Overview

All endpoints below are intercepted by `MockApiInterceptor`. No real HTTP requests are made. The interceptor matches URL patterns, performs operations on in-memory copies of the JSON data arrays, and returns `Observable<HttpResponse<T>>` with simulated latency (50–200ms).

---

## Endpoints

### 1. GET /api/certifications?userId=:userId

**Purpose**: Load all certifications for a specific user  
**Auth**: AuthGuard (any authenticated role)  
**Query Param**: `userId` — the user identifier (must match session user)  

**Response (200)**:
```json
{
  "data": [
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
}
```

**Interceptor Logic**: Filter `certifications.json` in-memory array by `userId` query parameter.

**Error Responses**:
| Status | Condition | Body |
|---|---|---|
| 401 | No authenticated session | `{ "error": "Authentication required" }` |
| 500 | Interceptor data load failure (simulated) | `{ "error": "Something went wrong. Please try again." }` |

---

### 2. GET /api/certifications/:certId

**Purpose**: Load a single certification by ID  
**Auth**: AuthGuard (any authenticated role)  
**Path Param**: `certId` — the certification identifier  

**Response (200)**:
```json
{
  "data": {
    "certId": "cert-001",
    "userId": "user-001",
    "skillId": "skill-angular",
    "certName": "Angular Certified Developer",
    "issuingOrg": "Google",
    "issueDate": "2025-01-15",
    "expiryDate": "2027-01-15",
    "filePath": "assets/uploads/angular-cert.pdf"
  }
}
```

**Interceptor Logic**: Find certification in in-memory array matching `certId`.

**Error Responses**:
| Status | Condition | Body |
|---|---|---|
| 401 | No authenticated session | `{ "error": "Authentication required" }` |
| 404 | No certification found for `certId` | `{ "error": "Certification not found." }` |

---

### 3. POST /api/certifications

**Purpose**: Create a new certification (simulated upload)  
**Auth**: AuthGuard (any authenticated role)  
**Content-Type**: `application/json`  

**Request Body**:
```json
{
  "certName": "Azure Administrator Associate",
  "skillId": "skill-azure",
  "issuingOrg": "Microsoft",
  "issueDate": "2026-02-01",
  "expiryDate": "2028-02-01",
  "filePath": "assets/uploads/azure-cert.pdf"
}
```

**Response (201)**:
```json
{
  "data": {
    "certId": "cert-003",
    "userId": "user-001",
    "skillId": "skill-azure",
    "certName": "Azure Administrator Associate",
    "issuingOrg": "Microsoft",
    "issueDate": "2026-02-01",
    "expiryDate": "2028-02-01",
    "filePath": "assets/uploads/azure-cert.pdf"
  }
}
```

**Interceptor Logic**:
1. Generate `certId` (e.g., `"cert-" + UUID` or incremented)
2. Attach `userId` from session state
3. Push new certification into in-memory array
4. Return created certification with 201 status

**Error Responses**:
| Status | Condition | Body |
|---|---|---|
| 401 | No authenticated session | `{ "error": "Authentication required" }` |
| 400 | Missing required fields | `{ "error": "All fields are required." }` |
| 500 | Interceptor failure (simulated) | `{ "error": "Something went wrong. Please try again." }` |

---

### 4. DELETE /api/certifications/:certId

**Purpose**: Delete a certification (optional — not required by current spec but follows REST convention)  
**Auth**: AuthGuard (any authenticated role)  
**Path Param**: `certId` — the certification identifier  

**Response (200)**:
```json
{
  "data": null,
  "message": "Certification deleted successfully."
}
```

**Interceptor Logic**: Remove certification with matching `certId` from in-memory array.

**Error Responses**:
| Status | Condition | Body |
|---|---|---|
| 401 | No authenticated session | `{ "error": "Authentication required" }` |
| 404 | No certification found for `certId` | `{ "error": "Certification not found." }` |

---

## Interceptor URL Matching Summary

| Method | URL Pattern | JSON Source | Operation |
|---|---|---|---|
| GET | `/api/certifications?userId=:userId` | certifications.json | Filter by userId |
| GET | `/api/certifications/:certId` | certifications.json | Find by certId |
| POST | `/api/certifications` | certifications.json | Add to in-memory array |
| DELETE | `/api/certifications/:certId` | certifications.json | Remove from in-memory array |

---

## Cross-Feature Endpoints Used

This module also reads data from endpoints defined in earlier phases:

| Method | URL Pattern | Purpose | Defined In |
|---|---|---|---|
| GET | `/api/employee-skills?userId=:userId` | Populate Skill dropdown in upload form | Phase 3 |
| GET | `/api/skill-definitions` | Map `skillId` to skill display name | Phase 2 |
