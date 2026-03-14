# Mock API Contract: Reporting and Analytics Module

**Feature**: 008-reporting-analytics
**Date**: 2026-03-13

---

## Overview

The Reporting and Analytics module is primarily a **read-only, computation-heavy** feature. Unlike other modules, it does NOT introduce new CRUD endpoints or new JSON data files. Instead, it reads from existing mock data sources via already-registered interceptor URL patterns and computes report data entirely client-side within Angular services.

However, for consistency with the NgRx effects → HttpClient → interceptor pattern, the reports module defines lightweight API endpoints that the `MockApiInterceptor` uses to return raw data. The actual report computation happens in the feature's domain services after receiving the raw data.

---

## Endpoints

### 1. GET /api/reports/gap-analysis

Returns the raw data needed to compute skill gap analysis. The interceptor aggregates from projects.json, employee-skills.json, and skill-definitions.json.

**Query Parameters**:

| Parameter | Type | Required | Description |
|---|---|---|---|
| `department` | string | No | Filter employees by department (Manager: auto-set to own department) |

**Response** (200 OK):
```jsonc
{
  "projects": [
    {
      "projectId": "string",
      "name": "string",
      "requiredSkills": [
        { "skillId": "string", "minimumLevel": "number (1–4)" }
      ]
    }
  ],
  "employeeSkills": [
    {
      "userId": "string",
      "department": "string",
      "skills": [
        { "skillId": "string", "level": "Beginner | Intermediate | Advanced | Expert" }
      ]
    }
  ],
  "skillDefinitions": [
    { "skillId": "string", "skillName": "string", "categoryId": "string" }
  ]
}
```

**Error Responses**:
- `403 Forbidden` — Employee role attempts access

---

### 2. GET /api/reports/team-capability

Returns raw employee skill data grouped by department for team capability computation.

**Query Parameters**:

| Parameter | Type | Required | Description |
|---|---|---|---|
| `department` | string | No | Filter by department (Manager: auto-set; Admin: selectable) |
| `categoryId` | string | No | Filter skills by category |

**Response** (200 OK):
```jsonc
{
  "employeeSkills": [
    {
      "userId": "string",
      "department": "string",
      "skills": [
        { "skillId": "string", "level": "Beginner | Intermediate | Advanced | Expert" }
      ]
    }
  ],
  "skillDefinitions": [
    { "skillId": "string", "skillName": "string", "categoryId": "string" }
  ],
  "skillCategories": [
    { "categoryId": "string", "categoryName": "string" }
  ]
}
```

**Error Responses**:
- `403 Forbidden` — Employee role attempts access

---

### 3. GET /api/reports/heatmap

Returns org-wide employee skill data for heatmap computation. Admin only.

**Response** (200 OK):
```jsonc
{
  "employeeSkills": [
    {
      "userId": "string",
      "skills": [
        { "skillId": "string", "level": "Beginner | Intermediate | Advanced | Expert" }
      ]
    }
  ],
  "skillDefinitions": [
    { "skillId": "string", "skillName": "string", "categoryId": "string" }
  ]
}
```

**Error Responses**:
- `403 Forbidden` — Manager or Employee role attempts access

---

### 4. GET /api/reports/trends

Returns skill test attempt data for trend analysis computation.

**Query Parameters**:

| Parameter | Type | Required | Description |
|---|---|---|---|
| `department` | string | No | Filter by department (Manager: auto-set; Admin: selectable) |

**Response** (200 OK):
```jsonc
{
  "attempts": [
    {
      "attemptId": "string",
      "userId": "string",
      "skillId": "string",
      "score": "number (0–100)",
      "date": "string (ISO 8601)"
    }
  ],
  "skillDefinitions": [
    { "skillId": "string", "skillName": "string" }
  ]
}
```

**Error Responses**:
- `403 Forbidden` — Employee role attempts access

---

## Interceptor Implementation Notes

The `MockApiInterceptor` does NOT need to perform report computations. For each `/api/reports/*` endpoint, the interceptor:

1. Reads the relevant in-memory JSON arrays (already loaded from `employee-skills.json`, `projects.json`, etc.)
2. Applies RBAC checks (role from session state)
3. Applies department filtering if the `department` query parameter is present
4. Returns the raw, unprocessed data as the response payload
5. The Angular services (`GapAnalysisService`, `TeamCapabilityService`, `HeatmapService`, `TrendAnalysisService`) receive this raw data and perform all computation client-side

**Alternative Approach**: If the interceptor complexity is undesirable, the NgRx effects can instead call multiple existing endpoints (e.g., `GET /api/employee-skills`, `GET /api/projects`, `GET /api/skill-definitions`) via `forkJoin` and combine the results. This avoids adding new interceptor URL patterns but requires multiple HTTP calls per report load. Either approach is acceptable — the consolidated endpoint approach is documented here for clarity.

---

## Error Codes Summary

| Code | Meaning | Trigger |
|---|---|---|
| 200 | Success | Valid request with data |
| 403 | Forbidden | Role lacks permission for the endpoint |
