# SpecKit BootCamp- Team 7 Development Guidelines

Auto-generated from all feature plans. Last updated: 2026-03-12

## Active Technologies
- TypeScript 5.x (strict mode), Angular 17+ + Angular 17, NgRx 17+, Angular Material, Angular CDK (BreakpointObserver), Angular HttpClient + HTTP Interceptors, ngx-charts or Chart.js (progress line charts), Angular Animations (003-employee-skill-profile-dashboard)
- In-memory via MockApiInterceptor; JSON files in `/assets/mock-data/` (employee-skills.json, skill-test-attempts.json, skill-categories.json, skill-definitions.json, certifications.json, projects.json, project-assignments.json, notifications.json) (003-employee-skill-profile-dashboard)
- TypeScript 5.x (strict mode), Angular 17+ + Angular 17, NgRx 17+, Angular Material, Angular CDK (BreakpointObserver), Angular HttpClient + HTTP Interceptors, Angular Animations (004-skill-assessments)
- In-memory via MockApiInterceptor; JSON files in `/assets/mock-data/` (skill-exams.json, skill-test-attempts.json, employee-skills.json, certifications.json, projects.json, project-assignments.json) (004-skill-assessments)
- TypeScript 5.x (strict mode), Angular 17+ + Angular 17, NgRx 17+, Angular Material, Angular CDK (BreakpointObserver), Angular HttpClient + HTTP Interceptors, Angular Reactive Forms (005-certifications-module)
- In-memory via MockApiInterceptor; JSON files in `/assets/mock-data/` (certifications.json, employee-skills.json) (005-certifications-module)
- TypeScript 5.x (strict mode), Angular 17+ + Angular 17, NgRx 17+, Angular Material or PrimeNG, Angular CDK (BreakpointObserver), Angular HttpClient + HTTP Interceptors, Angular Animations, Angular Router (AuthGuard + RoleGuard) (006-peer-validation-manager-controls)
- In-memory via MockApiInterceptor; JSON files in `/assets/mock-data/` (employee-skills.json, users.json, notifications.json, skill-definitions.json, certifications.json) (006-peer-validation-manager-controls)
- In-memory via MockApiInterceptor; JSON files in `/assets/mock-data/` (projects.json, project-assignments.json, employee-skills.json, users.json, skill-definitions.json, skill-categories.json, certifications.json) (007-project-mgmt-team-builder)
- TypeScript 5.x (strict mode), Angular 17+ + Angular 17, NgRx 17+, Angular Material or PrimeNG, Angular CDK (BreakpointObserver), Angular HttpClient + HTTP Interceptors, ngx-charts or Chart.js (chart rendering), jsPDF + jsPDF-AutoTable (PDF export), SheetJS/xlsx (Excel/CSV export), html2canvas (PNG export for heatmap) (008-reporting-analytics)
- In-memory via MockApiInterceptor; JSON files in `/assets/mock-data/` (employee-skills.json, users.json, projects.json, skill-definitions.json, skill-categories.json, certifications.json, skill-test-attempts.json) (008-reporting-analytics)
- TypeScript 5.x (strict mode), Angular 17+ + Angular 17, NgRx 17+, Angular Material or PrimeNG, Angular Router, Angular HttpClient + HTTP Interceptors, Angular CDK (BreakpointObserver) (009-notifications-alerts)
- In-memory via MockApiInterceptor; `notifications.json` in `/assets/mock-data/` (009-notifications-alerts)
- TypeScript 5.x (strict mode), Angular 17+ + Angular 17, Angular CDK (BreakpointObserver), @angular/animations, NgRx 17+, Angular Material or PrimeNG, Angular Router, SCSS (010-responsive-animations-errors)
- N/A — this phase introduces no new data; operates against existing NgRx state and mock data from Phases 1–9 (010-responsive-animations-errors)

- TypeScript 5.x (strict mode), Angular 17+ + Angular 17, NgRx 17+, Angular Material or PrimeNG, Angular Router, Angular CDK (BreakpointObserver), Angular HttpClient + HTTP Interceptors (001-mock-auth-rbac-navigation)

## Project Structure

```text
src/
tests/
```

## Commands

npm test; npm run lint

## Code Style

TypeScript 5.x (strict mode), Angular 17+: Follow standard conventions

## Recent Changes
- 010-responsive-animations-errors: Added TypeScript 5.x (strict mode), Angular 17+ + Angular 17, Angular CDK (BreakpointObserver), @angular/animations, NgRx 17+, Angular Material or PrimeNG, Angular Router, SCSS
- 009-notifications-alerts: Added TypeScript 5.x (strict mode), Angular 17+ + Angular 17, NgRx 17+, Angular Material or PrimeNG, Angular Router, Angular HttpClient + HTTP Interceptors, Angular CDK (BreakpointObserver)
- 008-reporting-analytics: Added TypeScript 5.x (strict mode), Angular 17+ + Angular 17, NgRx 17+, Angular Material or PrimeNG, Angular CDK (BreakpointObserver), Angular HttpClient + HTTP Interceptors, ngx-charts or Chart.js (chart rendering), jsPDF + jsPDF-AutoTable (PDF export), SheetJS/xlsx (Excel/CSV export), html2canvas (PNG export for heatmap)


<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->
