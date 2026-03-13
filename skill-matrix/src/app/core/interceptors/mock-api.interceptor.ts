import { HttpInterceptorFn, HttpRequest, HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { delay, Observable, of, throwError, catchError } from 'rxjs';
import { User } from '../../shared/models/user.model';
import { SkillCategory, SubCategory } from '../../shared/models/skill-category.model';
import { SkillDefinition } from '../../shared/models/skill-definition.model';
import { ProficiencyLevel } from '../../shared/models/proficiency-level.model';
import { RatingWeightConfig } from '../../shared/models/rating-weight.model';
import { ToastService } from '../../shared/services/toast.service';
import { EmployeeSkill, EmployeeSkillRecord } from '../../shared/models/employee-skill.model';
import { SkillTestAttempt } from '../../shared/models/skill-test-attempt.model';
import { SkillExam } from '../../shared/models/skill-exam.model';
import { AssessmentAttempt } from '../../shared/models/assessment-attempt.model';

// ── In-memory caches with mutable copies for CRUD operations ───────────────
let usersCache: User[] | null = null;
let categoriesCache: SkillCategory[] | null = null;
let skillDefinitionsCache: SkillDefinition[] | null = null;
let proficiencyLevelsCache: ProficiencyLevel[] | null = null;
let ratingWeightsCache: RatingWeightConfig | null = null;
let employeeSkillsCache: EmployeeSkillRecord[] | null = null;
let testAttemptsCache: SkillTestAttempt[] | null = null;
let skillExamsCache: SkillExam[] | null = null;
let certificationsCache: { certId: string; userId: string; skillId: string; certName: string; issuingOrg: string; issueDate: string; expiryDate: string; filePath: string }[] | null = null;
let projectsCache: { projectId: string; status: string; requiredSkills: string[]; [key: string]: unknown }[] | null = null;
let projectAssignmentsCache: { assignmentId: string; userId: string; projectId: string; [key: string]: unknown }[] | null = null;

// ── Feature 006: Peer Validation & Team Management in-memory stores ──────────
interface SeedSubmission {
  submissionId: string;
  userId: string;
  skillId: string;
  selfRating: number;
  managerRating: number | null;
  peerRating: number | null;
  systemRating: number | null;
  finalRating: number | null;
  level: string | null;
  status: 'Pending' | 'Approved' | 'Rejected';
  submittedDate: string;
  lastUpdated: string;
  rejectionReason: string | null;
  certificationId: string | null;
  projectExperience: string[];
}

interface SeedPeerValidation {
  id: string;
  submissionId: string;
  requesterId: string;
  skillId: string;
  selectedPeerIds: string[];
  status: 'created' | 'notified' | 'awaiting_responses' | 'completed' | 'expired';
  createdDate: string;
  responses: { peerId: string; rating: 1 | 2 | 3 | 4; comment: string | null; responseDate: string }[];
}

interface AdminOverrideRecord {
  submissionId: string;
  adminId: string;
  overriddenRating: number;
  justification: string;
  overrideDate: string;
  previousFinalRating: number | null;
}

let submissionsStore: SeedSubmission[] = [
  { submissionId: 'sub-001', userId: 'u001', skillId: 'skill-002', selfRating: 3, managerRating: null, peerRating: 3.5, systemRating: 3.2, finalRating: null, level: null, status: 'Pending', submittedDate: '2026-01-20', lastUpdated: '2026-01-20', rejectionReason: null, certificationId: 'cert-001', projectExperience: ['proj-001'] },
  { submissionId: 'sub-002', userId: 'u001', skillId: 'skill-007', selfRating: 4, managerRating: null, peerRating: null, systemRating: 3.0, finalRating: null, level: null, status: 'Pending', submittedDate: '2026-02-01', lastUpdated: '2026-02-01', rejectionReason: null, certificationId: null, projectExperience: [] },
  { submissionId: 'sub-003', userId: 'u006', skillId: 'skill-001', selfRating: 3, managerRating: null, peerRating: null, systemRating: 2.8, finalRating: null, level: null, status: 'Pending', submittedDate: '2026-02-10', lastUpdated: '2026-02-10', rejectionReason: null, certificationId: null, projectExperience: ['proj-002'] },
  { submissionId: 'sub-004', userId: 'u002', skillId: 'skill-009', selfRating: 4, managerRating: null, peerRating: null, systemRating: 3.5, finalRating: null, level: null, status: 'Pending', submittedDate: '2026-02-12', lastUpdated: '2026-02-12', rejectionReason: null, certificationId: null, projectExperience: [] },
  { submissionId: 'sub-005', userId: 'u003', skillId: 'skill-019', selfRating: 3, managerRating: null, peerRating: null, systemRating: null, finalRating: null, level: null, status: 'Pending', submittedDate: '2026-02-25', lastUpdated: '2026-02-25', rejectionReason: null, certificationId: null, projectExperience: [] },
];

let peerValidationsStore: SeedPeerValidation[] = [
  {
    id: 'pv-001',
    submissionId: 'sub-001',
    requesterId: 'u001',
    skillId: 'skill-002',
    selectedPeerIds: ['u006', 'u007'],
    status: 'completed',
    createdDate: '2026-01-18',
    responses: [
      { peerId: 'u006', rating: 3, comment: 'Solid Angular skills', responseDate: '2026-01-19' },
      { peerId: 'u007', rating: 4, comment: 'Good understanding of components', responseDate: '2026-01-19' },
    ],
  },
  {
    id: 'pv-002',
    submissionId: 'sub-003',
    requesterId: 'u006',
    skillId: 'skill-001',
    selectedPeerIds: ['u001', 'u007'],
    status: 'awaiting_responses',
    createdDate: '2026-02-09',
    responses: [
      { peerId: 'u001', rating: 3, comment: null, responseDate: '2026-02-10' },
    ],
  },
];

let adminOverridesStore: AdminOverrideRecord[] = [];

async function loadUsers(): Promise<User[]> {
  if (usersCache) return usersCache;
  const response = await fetch('/assets/mock-data/users.json');
  usersCache = await response.json();
  return usersCache!;
}

async function loadCategories(): Promise<SkillCategory[]> {
  if (categoriesCache) return categoriesCache;
  const response = await fetch('/assets/mock-data/skill-categories.json');
  categoriesCache = await response.json();
  return categoriesCache!;
}

async function loadSkillDefinitions(): Promise<SkillDefinition[]> {
  if (skillDefinitionsCache) return skillDefinitionsCache;
  const response = await fetch('/assets/mock-data/skill-definitions.json');
  skillDefinitionsCache = await response.json();
  return skillDefinitionsCache!;
}

async function loadProficiencyLevels(): Promise<ProficiencyLevel[]> {
  if (proficiencyLevelsCache) return proficiencyLevelsCache;
  const response = await fetch('/assets/mock-data/proficiency-levels.json');
  proficiencyLevelsCache = await response.json();
  return proficiencyLevelsCache!;
}

async function loadRatingWeights(): Promise<RatingWeightConfig> {
  if (ratingWeightsCache) return ratingWeightsCache;
  const response = await fetch('/assets/mock-data/rating-weights.json');
  ratingWeightsCache = await response.json();
  return ratingWeightsCache!;
}

async function loadEmployeeSkills(): Promise<EmployeeSkillRecord[]> {
  if (employeeSkillsCache) return employeeSkillsCache;
  const response = await fetch('/assets/mock-data/employee-skills.json');
  employeeSkillsCache = await response.json();
  return employeeSkillsCache!;
}

async function loadTestAttempts(): Promise<SkillTestAttempt[]> {
  if (testAttemptsCache) return testAttemptsCache;
  const response = await fetch('/assets/mock-data/skill-test-attempts.json');
  testAttemptsCache = await response.json();
  return testAttemptsCache!;
}

async function loadSkillExams(): Promise<SkillExam[]> {
  if (skillExamsCache) return skillExamsCache;
  const response = await fetch('/assets/mock-data/skill-exams.json');
  skillExamsCache = await response.json();
  return skillExamsCache!;
}

async function loadCertifications(): Promise<NonNullable<typeof certificationsCache>> {
  if (certificationsCache) return certificationsCache;
  try {
    const response = await fetch('/assets/mock-data/certifications.json');
    certificationsCache = await response.json();
  } catch {
    certificationsCache = [];
  }
  return certificationsCache!;
}

async function loadProjects(): Promise<NonNullable<typeof projectsCache>> {
  if (projectsCache) return projectsCache;
  try {
    const response = await fetch('/assets/mock-data/projects.json');
    projectsCache = await response.json();
  } catch {
    projectsCache = [];
  }
  return projectsCache!;
}

async function loadProjectAssignments(): Promise<NonNullable<typeof projectAssignmentsCache>> {
  if (projectAssignmentsCache) return projectAssignmentsCache;
  try {
    const response = await fetch('/assets/mock-data/project-assignments.json');
    projectAssignmentsCache = await response.json();
  } catch {
    projectAssignmentsCache = [];
  }
  return projectAssignmentsCache!;
}

function getSimulatedDelay(): number {
  return Math.floor(Math.random() * 150) + 50;
}

function makeError(status: number, message: string): Observable<never> {
  return throwError(() => new HttpErrorResponse({ status, error: { message } })).pipe(delay(getSimulatedDelay()));
}

function ok<T>(body: T): Observable<HttpResponse<T>> {
  return of(new HttpResponse<T>({ status: 200, body })).pipe(delay(getSimulatedDelay()));
}

// ── Role enforcement for /api/admin/* ───────────────────────────────────────
function getCurrentUserRole(): string | null {
  try {
    const raw = localStorage.getItem('session');
    if (!raw) return null;
    const session = JSON.parse(raw) as { role?: string };
    return session.role ?? null;
  } catch {
    return null;
  }
}

export const mockApiInterceptor: HttpInterceptorFn = (req, next) => {
  const toastService = inject(ToastService);

  if (req.url === '/api/auth/login' && req.method === 'POST') {
    return handleLogin(req.body as { email?: string; password?: string });
  }

  // ── Employee Skills endpoints ─────────────────────────────────────────
  // GET /api/employee-skills (all records — Manager/Admin only)
  if (req.url === '/api/employee-skills' && req.method === 'GET') {
    return handleGetAllEmployeeSkills();
  }

  // /api/employee-skills/:userId/skills/:skillId
  const skillDetailMatch = req.url.match(/^\/api\/employee-skills\/([^/]+)\/skills\/([^/]+)$/);
  if (skillDetailMatch) {
    return handleEmployeeSkillDetail(req, skillDetailMatch[1], skillDetailMatch[2]);
  }

  // /api/employee-skills/:userId/skills
  const skillsMatch = req.url.match(/^\/api\/employee-skills\/([^/]+)\/skills$/);
  if (skillsMatch) {
    return handleAddEmployeeSkill(req, skillsMatch[1]);
  }

  // /api/employee-skills/:userId
  const empSkillMatch = req.url.match(/^\/api\/employee-skills\/([^/]+)$/);
  if (empSkillMatch && req.method === 'GET') {
    return handleGetEmployeeSkills(empSkillMatch[1]);
  }
  if (empSkillMatch && req.method === 'PUT') {
    return handleUpdateEmployeeSkillSystemRating(req, empSkillMatch[1]);
  }

  // ── Skill Test Attempts ───────────────────────────────────────────────
  // POST /api/skill-test-attempts (create new attempt)
  if (req.url === '/api/skill-test-attempts' && req.method === 'POST') {
    return handlePostSkillTestAttempt(req);
  }

  // /api/skill-test-attempts/:userId/:skillId
  const attemptSkillMatch = req.url.match(/^\/api\/skill-test-attempts\/([^/]+)\/([^/]+)$/);
  if (attemptSkillMatch && req.method === 'GET') {
    return handleGetSkillAttempts(attemptSkillMatch[1], attemptSkillMatch[2]);
  }

  // /api/skill-test-attempts/:userId
  const attemptMatch = req.url.match(/^\/api\/skill-test-attempts\/([^/]+)$/);
  if (attemptMatch && req.method === 'GET') {
    return handleGetTestAttempts(attemptMatch[1]);
  }

  // ── Skill Exams ──────────────────────────────────────────────────────────
  // GET /api/skill-exams/:skillId
  const examSkillMatch = req.url.match(/^\/api\/skill-exams\/([^/?]+)$/);
  if (examSkillMatch && req.method === 'GET') {
    return handleGetExamBySkillId(examSkillMatch[1]);
  }

  // GET /api/skill-exams
  if (req.url === '/api/skill-exams' && req.method === 'GET') {
    return handleGetAllExams();
  }

  // ── Certifications ───────────────────────────────────────────────────────
  const url = req.url.split('?')[0];
  if (url === '/api/certifications' && req.method === 'GET') {
    const params = new URL(req.url, 'http://localhost').searchParams;
    return handleGetCertifications(params.get('userId'), params.get('skillId'));
  }

  // GET /api/certifications/:certId
  const certIdMatch = url.match(/^\/api\/certifications\/([^/]+)$/);
  if (certIdMatch && req.method === 'GET') {
    return handleGetCertificationById(certIdMatch[1]);
  }

  // POST /api/certifications
  if (url === '/api/certifications' && req.method === 'POST') {
    return handlePostCertification(req.body as Record<string, unknown>);
  }

  // DELETE /api/certifications/:certId
  if (certIdMatch && req.method === 'DELETE') {
    return handleDeleteCertification(certIdMatch[1]);
  }

  // ── Project Assignments ──────────────────────────────────────────────────
  if (url === '/api/project-assignments' && req.method === 'GET') {
    const params = new URL(req.url, 'http://localhost').searchParams;
    return handleGetProjectAssignments(params.get('userId'));
  }

  // GET /api/projects
  if (req.url === '/api/projects' && req.method === 'GET') {
    return handleGetProjects();
  }

  // ── Read-only skill library (all authenticated roles) ──────────────────
  if (req.url === '/api/skill-categories' && req.method === 'GET') {
    return new Observable<HttpResponse<unknown>>((subscriber) => {
      loadCategories().then((cats) => {
        subscriber.next(new HttpResponse({ status: 200, body: cats }));
        subscriber.complete();
      });
    }).pipe(delay(getSimulatedDelay()));
  }

  if (req.url === '/api/skill-definitions' && req.method === 'GET') {
    return new Observable<HttpResponse<unknown>>((subscriber) => {
      loadSkillDefinitions().then((defs) => {
        subscriber.next(new HttpResponse({ status: 200, body: defs }));
        subscriber.complete();
      });
    }).pipe(delay(getSimulatedDelay()));
  }

  // ── Team Management (Feature 006) ─────────────────────────────────────
  // POST /api/peer-validation/request
  if (req.url === '/api/peer-validation/request' && req.method === 'POST') {
    return handleCreatePeerValidationRequest(req);
  }

  // GET /api/peer-validation/eligible-peers/:skillId
  const eligiblePeersMatch = req.url.match(/^\/api\/peer-validation\/eligible-peers\/([^/]+)$/);
  if (eligiblePeersMatch && req.method === 'GET') {
    return handleGetEligiblePeers(eligiblePeersMatch[1]);
  }

  // POST /api/peer-validation/:requestId/respond
  const peerRespondMatch = req.url.match(/^\/api\/peer-validation\/([^/]+)\/respond$/);
  if (peerRespondMatch && req.method === 'POST') {
    return handlePeerRespond(req, peerRespondMatch[1]);
  }

  // GET /api/team/employees/:userId (before /employees)
  const teamEmployeeDetailMatch = req.url.match(/^\/api\/team\/employees\/([^/]+)$/);
  if (teamEmployeeDetailMatch && req.method === 'GET') {
    return handleGetTeamEmployeeDetail(teamEmployeeDetailMatch[1]);
  }

  // GET /api/team/employees
  if (req.url === '/api/team/employees' && req.method === 'GET') {
    return handleGetTeamEmployees();
  }

  // POST /api/team/validation-queue/:submissionId/approve
  const approveMatch = req.url.match(/^\/api\/team\/validation-queue\/([^/]+)\/approve$/);
  if (approveMatch && req.method === 'POST') {
    return handleApproveSubmission(req, approveMatch[1]);
  }

  // POST /api/team/validation-queue/:submissionId/reject
  const rejectMatch = req.url.match(/^\/api\/team\/validation-queue\/([^/]+)\/reject$/);
  if (rejectMatch && req.method === 'POST') {
    return handleRejectSubmission(req, rejectMatch[1]);
  }

  // POST /api/team/validation-queue/:submissionId/override
  const overrideMatch = req.url.match(/^\/api\/team\/validation-queue\/([^/]+)\/override$/);
  if (overrideMatch && req.method === 'POST') {
    return handleAdminOverride(req, overrideMatch[1]);
  }

  // GET /api/team/validation-queue/:submissionId (before /validation-queue)
  const submissionDetailMatch = req.url.match(/^\/api\/team\/validation-queue\/([^/]+)$/);
  if (submissionDetailMatch && req.method === 'GET') {
    return handleGetSubmissionDetail(submissionDetailMatch[1]);
  }

  // GET /api/team/validation-queue
  if (req.url === '/api/team/validation-queue' && req.method === 'GET') {
    return handleGetValidationQueue();
  }

  // ── Admin API endpoints ────────────────────────────────────────────────
  if (req.url.startsWith('/api/admin/')) {
    const role = getCurrentUserRole();
    if (role !== 'Admin') {
      return makeError(403, 'Access denied. Admin role required.');
    }
    return handleAdminRequest(req);
  }

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 403) {
        toastService.showError('You do not have permission to perform this action.');
      }
      return throwError(() => error);
    })
  );
};

function handleLogin(body: { email?: string; password?: string } | null): Observable<HttpResponse<unknown>> {
  if (!body?.email || !body?.password) {
    return throwError(() => new HttpErrorResponse({
      status: 400,
      statusText: 'Bad Request',
      error: { message: 'Email and password are required' },
    })).pipe(delay(getSimulatedDelay()));
  }

  return new Observable<HttpResponse<unknown>>((subscriber) => {
    loadUsers().then((users) => {
      const match = users.find(
        (u) => u.email === body.email && u.password === body.password
      );

      if (match) {
        const { password, ...sessionUser } = match;
        subscriber.next(new HttpResponse({
          status: 200,
          body: sessionUser,
        }));
        subscriber.complete();
      } else {
        subscriber.error(new HttpErrorResponse({
          status: 401,
          statusText: 'Unauthorized',
          error: { message: 'Invalid email or password' },
        }));
      }
    });
  }).pipe(delay(getSimulatedDelay()));
}

// ── Admin Request Router ────────────────────────────────────────────────────
function handleAdminRequest(req: HttpRequest<unknown>): Observable<HttpResponse<unknown>> {
  const url = req.url;
  const method = req.method;

  // /api/admin/categories/:id/subcategories/:subId
  const subDetailMatch = url.match(/^\/api\/admin\/categories\/([^/]+)\/subcategories\/([^/]+)$/);
  if (subDetailMatch) {
    return handleSubcategoryDetail(req, subDetailMatch[1], subDetailMatch[2]);
  }

  // /api/admin/categories/:id/subcategories
  const subcategoriesMatch = url.match(/^\/api\/admin\/categories\/([^/]+)\/subcategories$/);
  if (subcategoriesMatch) {
    return handleSubcategories(req, subcategoriesMatch[1]);
  }

  // /api/admin/categories/:id
  const categoryDetailMatch = url.match(/^\/api\/admin\/categories\/([^/]+)$/);
  if (categoryDetailMatch) {
    return handleCategoryDetail(req, categoryDetailMatch[1]);
  }

  // /api/admin/categories
  if (url === '/api/admin/categories') {
    if (method === 'GET') return handleGetCategories();
    if (method === 'POST') return handleAddCategory(req.body as Partial<SkillCategory>);
  }

  // /api/admin/skill-definitions/:id
  const skillDetailMatch = url.match(/^\/api\/admin\/skill-definitions\/([^/]+)$/);
  if (skillDetailMatch) {
    return handleSkillDefinitionDetail(req, skillDetailMatch[1]);
  }

  // /api/admin/skill-definitions
  if (url === '/api/admin/skill-definitions') {
    if (method === 'GET') return handleGetSkillDefinitions();
    if (method === 'POST') return handleAddSkillDefinition(req.body as Partial<SkillDefinition>);
  }

  // /api/admin/proficiency-levels/:id
  const profLevelDetailMatch = url.match(/^\/api\/admin\/proficiency-levels\/([^/]+)$/);
  if (profLevelDetailMatch && method === 'PUT') {
    return handleUpdateProficiencyLevel(req.body as ProficiencyLevel);
  }

  // /api/admin/proficiency-levels
  if (url === '/api/admin/proficiency-levels' && method === 'GET') {
    return handleGetProficiencyLevels();
  }

  // /api/admin/rating-weights
  if (url === '/api/admin/rating-weights') {
    if (method === 'GET') return handleGetRatingWeights();
    if (method === 'PUT') return handleUpdateRatingWeights(req.body as RatingWeightConfig);
  }

  return makeError(404, 'Not found.');
}

// ── Categories Handlers ─────────────────────────────────────────────────────
function handleGetCategories(): Observable<HttpResponse<unknown>> {
  return new Observable<HttpResponse<unknown>>((sub) => {
    loadCategories().then((cats) => {
      sub.next(new HttpResponse({ status: 200, body: cats }));
      sub.complete();
    });
  }).pipe(delay(getSimulatedDelay()));
}

function handleAddCategory(body: Partial<SkillCategory>): Observable<HttpResponse<unknown>> {
  return new Observable<HttpResponse<unknown>>((sub) => {
    loadCategories().then((cats) => {
      const name = (body.categoryName ?? '').trim();
      if (!name) { sub.error(new HttpErrorResponse({ status: 400, error: { message: 'Category name is required.' } })); return; }
      const duplicate = cats.some((c) => c.categoryName.toLowerCase() === name.toLowerCase());
      if (duplicate) { sub.error(new HttpErrorResponse({ status: 409, error: { message: 'A category with this name already exists.' } })); return; }
      const newCat: SkillCategory = {
        categoryId: `cat-${Date.now()}`,
        categoryName: name,
        description: body.description ?? '',
        subCategories: [],
      };
      categoriesCache = [...cats, newCat];
      sub.next(new HttpResponse({ status: 200, body: newCat }));
      sub.complete();
    });
  }).pipe(delay(getSimulatedDelay()));
}

function handleCategoryDetail(req: HttpRequest<unknown>, categoryId: string): Observable<HttpResponse<unknown>> {
  return new Observable<HttpResponse<unknown>>((sub) => {
    loadCategories().then(async (cats) => {
      const idx = cats.findIndex((c) => c.categoryId === categoryId);
      if (idx === -1) { sub.error(new HttpErrorResponse({ status: 404, error: { message: 'Category not found.' } })); return; }

      if (req.method === 'PUT') {
        const body = req.body as Partial<SkillCategory>;
        const name = (body.categoryName ?? '').trim();
        const duplicate = cats.some((c) => c.categoryId !== categoryId && c.categoryName.toLowerCase() === name.toLowerCase());
        if (duplicate) { sub.error(new HttpErrorResponse({ status: 409, error: { message: 'A category with this name already exists.' } })); return; }
        const updated = { ...cats[idx], categoryName: name, description: body.description ?? cats[idx].description };
        categoriesCache = cats.map((c) => (c.categoryId === categoryId ? updated : c));
        sub.next(new HttpResponse({ status: 200, body: updated }));
        sub.complete();
      } else if (req.method === 'DELETE') {
        // Guard: check employee-skills for linked skills
        const empSkills = await loadEmployeeSkills();
        const skillDefs = await loadSkillDefinitions();
        const catSkillIds = skillDefs.filter((s) => s.categoryId === categoryId).map((s) => s.skillId);
        const hasLinked = empSkills.some((e) => e.skills.some((s) => catSkillIds.includes(s.skillId)));
        if (hasLinked) { sub.error(new HttpErrorResponse({ status: 409, error: { message: 'Cannot delete: skills are linked to this category.' } })); return; }
        categoriesCache = cats.filter((c) => c.categoryId !== categoryId);
        sub.next(new HttpResponse({ status: 200, body: null }));
        sub.complete();
      }
    });
  }).pipe(delay(getSimulatedDelay()));
}

// ── Subcategory Handlers ────────────────────────────────────────────────────
function handleSubcategories(req: HttpRequest<unknown>, categoryId: string): Observable<HttpResponse<unknown>> {
  return new Observable<HttpResponse<unknown>>((sub) => {
    loadCategories().then((cats) => {
      const cat = cats.find((c) => c.categoryId === categoryId);
      if (!cat) { sub.error(new HttpErrorResponse({ status: 404, error: { message: 'Category not found.' } })); return; }
      if (req.method === 'POST') {
        const body = req.body as Partial<SubCategory>;
        const name = (body.subCategoryName ?? '').trim();
        if (!name) { sub.error(new HttpErrorResponse({ status: 400, error: { message: 'Subcategory name is required.' } })); return; }
        const newSub: SubCategory = { subCategoryId: `sub-${Date.now()}`, subCategoryName: name };
        categoriesCache = cats.map((c) => c.categoryId === categoryId ? { ...c, subCategories: [...c.subCategories, newSub] } : c);
        sub.next(new HttpResponse({ status: 200, body: { categoryId, subCategory: newSub } }));
        sub.complete();
      }
    });
  }).pipe(delay(getSimulatedDelay()));
}

function handleSubcategoryDetail(req: HttpRequest<unknown>, categoryId: string, subCategoryId: string): Observable<HttpResponse<unknown>> {
  return new Observable<HttpResponse<unknown>>((sub) => {
    loadCategories().then(async (cats) => {
      const cat = cats.find((c) => c.categoryId === categoryId);
      if (!cat) { sub.error(new HttpErrorResponse({ status: 404, error: { message: 'Category not found.' } })); return; }
      const subIdx = cat.subCategories.findIndex((s) => s.subCategoryId === subCategoryId);
      if (subIdx === -1) { sub.error(new HttpErrorResponse({ status: 404, error: { message: 'Subcategory not found.' } })); return; }

      if (req.method === 'PUT') {
        const body = req.body as Partial<SubCategory>;
        const updated: SubCategory = { subCategoryId, subCategoryName: (body.subCategoryName ?? '').trim() };
        categoriesCache = cats.map((c) => c.categoryId === categoryId
          ? { ...c, subCategories: c.subCategories.map((s) => s.subCategoryId === subCategoryId ? updated : s) }
          : c
        );
        sub.next(new HttpResponse({ status: 200, body: { categoryId, subCategory: updated } }));
        sub.complete();
      } else if (req.method === 'DELETE') {
        const skillDefs = await loadSkillDefinitions();
        const hasSkills = skillDefs.some((s) => s.subCategoryId === subCategoryId);
        if (hasSkills) { sub.error(new HttpErrorResponse({ status: 409, error: { message: 'Cannot delete: skill definitions exist under this subcategory.' } })); return; }
        categoriesCache = cats.map((c) => c.categoryId === categoryId
          ? { ...c, subCategories: c.subCategories.filter((s) => s.subCategoryId !== subCategoryId) }
          : c
        );
        sub.next(new HttpResponse({ status: 200, body: null }));
        sub.complete();
      }
    });
  }).pipe(delay(getSimulatedDelay()));
}

// ── Skill Definitions Handlers ──────────────────────────────────────────────
function handleGetSkillDefinitions(): Observable<HttpResponse<unknown>> {
  return new Observable<HttpResponse<unknown>>((sub) => {
    loadSkillDefinitions().then((skills) => {
      sub.next(new HttpResponse({ status: 200, body: skills }));
      sub.complete();
    });
  }).pipe(delay(getSimulatedDelay()));
}

function handleAddSkillDefinition(body: Partial<SkillDefinition>): Observable<HttpResponse<unknown>> {
  return new Observable<HttpResponse<unknown>>((sub) => {
    loadSkillDefinitions().then((skills) => {
      const name = (body.skillName ?? '').trim();
      if (!name || !body.categoryId || !body.subCategoryId) {
        sub.error(new HttpErrorResponse({ status: 400, error: { message: 'Skill name, category, and subcategory are required.' } }));
        return;
      }
      const duplicate = skills.some((s) => s.subCategoryId === body.subCategoryId && s.skillName.toLowerCase() === name.toLowerCase());
      if (duplicate) { sub.error(new HttpErrorResponse({ status: 409, error: { message: 'This skill already exists in this subcategory.' } })); return; }
      const newSkill: SkillDefinition = {
        skillId: `skill-${Date.now()}`,
        skillName: name,
        categoryId: body.categoryId,
        subCategoryId: body.subCategoryId,
        description: body.description ?? '',
      };
      skillDefinitionsCache = [...skills, newSkill];
      sub.next(new HttpResponse({ status: 200, body: newSkill }));
      sub.complete();
    });
  }).pipe(delay(getSimulatedDelay()));
}

function handleSkillDefinitionDetail(req: HttpRequest<unknown>, skillId: string): Observable<HttpResponse<unknown>> {
  return new Observable<HttpResponse<unknown>>((sub) => {
    loadSkillDefinitions().then((skills) => {
      const idx = skills.findIndex((s) => s.skillId === skillId);
      if (idx === -1) { sub.error(new HttpErrorResponse({ status: 404, error: { message: 'Skill not found.' } })); return; }
      if (req.method === 'PUT') {
        const body = req.body as Partial<SkillDefinition>;
        const updated = { ...skills[idx], ...body, skillId };
        // Uniqueness check within same subcategory (exclude self)
        const duplicate = skills.some((s) => s.skillId !== skillId && s.subCategoryId === updated.subCategoryId && s.skillName.toLowerCase() === updated.skillName.toLowerCase());
        if (duplicate) { sub.error(new HttpErrorResponse({ status: 409, error: { message: 'This skill already exists in this subcategory.' } })); return; }
        skillDefinitionsCache = skills.map((s) => s.skillId === skillId ? updated : s);
        sub.next(new HttpResponse({ status: 200, body: updated }));
        sub.complete();
      }
    });
  }).pipe(delay(getSimulatedDelay()));
}

// ── Proficiency Level Handlers ──────────────────────────────────────────────
function handleGetProficiencyLevels(): Observable<HttpResponse<unknown>> {
  return new Observable<HttpResponse<unknown>>((sub) => {
    loadProficiencyLevels().then((levels) => {
      sub.next(new HttpResponse({ status: 200, body: levels }));
      sub.complete();
    });
  }).pipe(delay(getSimulatedDelay()));
}

function handleUpdateProficiencyLevel(body: ProficiencyLevel): Observable<HttpResponse<unknown>> {
  return new Observable<HttpResponse<unknown>>((sub) => {
    loadProficiencyLevels().then((levels) => {
      const idx = levels.findIndex((l) => l.levelId === body.levelId);
      if (idx === -1) { sub.error(new HttpErrorResponse({ status: 404, error: { message: 'Level not found.' } })); return; }
      // Level name and score are read-only — preserve from original
      const updated: ProficiencyLevel = { ...levels[idx], description: body.description, exampleCriteria: body.exampleCriteria };
      proficiencyLevelsCache = levels.map((l) => l.levelId === body.levelId ? updated : l);
      sub.next(new HttpResponse({ status: 200, body: updated }));
      sub.complete();
    });
  }).pipe(delay(getSimulatedDelay()));
}

// ── Rating Weights Handlers ─────────────────────────────────────────────────
function handleGetRatingWeights(): Observable<HttpResponse<unknown>> {
  return new Observable<HttpResponse<unknown>>((sub) => {
    loadRatingWeights().then((weights) => {
      sub.next(new HttpResponse({ status: 200, body: weights }));
      sub.complete();
    });
  }).pipe(delay(getSimulatedDelay()));
}

function handleUpdateRatingWeights(body: RatingWeightConfig): Observable<HttpResponse<unknown>> {
  return new Observable<HttpResponse<unknown>>((sub) => {
    const sum = body.selfRating + body.managerRating + body.peerRating + body.systemRating;
    if (Math.abs(sum - 1.0) > 0.001) {
      sub.error(new HttpErrorResponse({ status: 400, error: { message: 'Weights must sum to 1.00 (100%).' } }));
      return;
    }
    ratingWeightsCache = { ...body };
    sub.next(new HttpResponse({ status: 200, body: ratingWeightsCache }));
    sub.complete();
  }).pipe(delay(getSimulatedDelay()));
}

// ── Employee Skills Handlers ────────────────────────────────────────────────

function handleGetAllEmployeeSkills(): Observable<HttpResponse<unknown>> {
  const role = getCurrentUserRole();
  if (role !== 'Manager' && role !== 'Admin') {
    return makeError(403, 'You do not have permission to perform this action.');
  }
  return new Observable<HttpResponse<unknown>>((sub) => {
    loadEmployeeSkills().then((records) => {
      sub.next(new HttpResponse({ status: 200, body: records }));
      sub.complete();
    });
  }).pipe(delay(getSimulatedDelay()));
}

function handleGetEmployeeSkills(userId: string): Observable<HttpResponse<unknown>> {
  const role = getCurrentUserRole();
  const currentUserId = getCurrentUserId();
  if (role !== 'Admin' && currentUserId !== userId) {
    return makeError(403, 'You do not have permission to perform this action.');
  }
  return new Observable<HttpResponse<unknown>>((sub) => {
    loadEmployeeSkills().then((records) => {
      const record = records.find((r) => r.userId === userId);
      if (!record) {
        sub.next(new HttpResponse({ status: 200, body: { userId, skills: [] } }));
      } else {
        sub.next(new HttpResponse({ status: 200, body: record }));
      }
      sub.complete();
    });
  }).pipe(delay(getSimulatedDelay()));
}

function handleAddEmployeeSkill(req: HttpRequest<unknown>, userId: string): Observable<HttpResponse<unknown>> {
  if (req.method !== 'POST') return makeError(405, 'Method not allowed.');
  const role = getCurrentUserRole();
  const currentUserId = getCurrentUserId();
  if (role !== 'Admin' && currentUserId !== userId) {
    return makeError(403, 'You do not have permission to perform this action.');
  }
  return new Observable<HttpResponse<unknown>>((sub) => {
    loadEmployeeSkills().then((records) => {
      const body = req.body as { skillId?: string; selfRating?: number };
      if (!body?.skillId || body.selfRating === undefined) {
        sub.error(new HttpErrorResponse({ status: 400, error: { message: 'skillId and selfRating are required.' } }));
        return;
      }
      if (body.selfRating < 1 || body.selfRating > 4) {
        sub.error(new HttpErrorResponse({ status: 400, error: { message: 'Self-rating must be between 1 and 4.' } }));
        return;
      }
      let record = records.find((r) => r.userId === userId);
      if (!record) {
        record = { userId, skills: [] };
        employeeSkillsCache = [...records, record];
      }
      const exists = record.skills.some((s) => s.skillId === body.skillId && !s.isDeleted);
      if (exists) {
        sub.error(new HttpErrorResponse({ status: 409, error: { message: 'This skill is already in your profile.' } }));
        return;
      }
      const newSkill: EmployeeSkill = {
        skillId: body.skillId,
        selfRating: body.selfRating,
        managerRating: null,
        peerRating: null,
        systemRating: null,
        finalRating: null,
        level: 'Beginner',
        status: 'Draft',
        lastUpdated: new Date().toISOString(),
        isDeleted: false,
      };
      record.skills = [...record.skills, newSkill];
      if (employeeSkillsCache) {
        employeeSkillsCache = employeeSkillsCache.map((r) => r.userId === userId ? record! : r);
      }
      sub.next(new HttpResponse({ status: 201, body: newSkill }));
      sub.complete();
    });
  }).pipe(delay(getSimulatedDelay()));
}

function handleEmployeeSkillDetail(req: HttpRequest<unknown>, userId: string, skillId: string): Observable<HttpResponse<unknown>> {
  const role = getCurrentUserRole();
  const currentUserId = getCurrentUserId();
  if (role !== 'Admin' && currentUserId !== userId) {
    return makeError(403, 'You do not have permission to perform this action.');
  }
  return new Observable<HttpResponse<unknown>>((sub) => {
    loadEmployeeSkills().then(async (records) => {
      const record = records.find((r) => r.userId === userId);
      if (!record) { sub.error(new HttpErrorResponse({ status: 404, error: { message: 'Skill not found.' } })); return; }
      const skillIdx = record.skills.findIndex((s) => s.skillId === skillId && !s.isDeleted);
      if (skillIdx === -1) { sub.error(new HttpErrorResponse({ status: 404, error: { message: 'Skill not found.' } })); return; }

      if (req.method === 'PUT') {
        const body = req.body as { selfRating?: number };
        if (body.selfRating === undefined || body.selfRating < 1 || body.selfRating > 4) {
          sub.error(new HttpErrorResponse({ status: 400, error: { message: 'Self-rating must be between 1 and 4.' } }));
          return;
        }
        const existing = record.skills[skillIdx];
        const updated: EmployeeSkill = {
          ...existing,
          selfRating: body.selfRating,
          lastUpdated: new Date().toISOString(),
          status: existing.status === 'Stale' ? 'Approved' : existing.status,
        };
        record.skills = record.skills.map((s, i) => i === skillIdx ? updated : s);
        if (employeeSkillsCache) {
          employeeSkillsCache = employeeSkillsCache.map((r) => r.userId === userId ? record! : r);
        }
        sub.next(new HttpResponse({ status: 200, body: updated }));
        sub.complete();
      } else if (req.method === 'DELETE') {
        // Check project-assignments constraint (stub — no projects.json yet)
        const skill = record.skills[skillIdx];
        record.skills = record.skills.map((s, i) => i === skillIdx ? { ...s, isDeleted: true } : s);
        if (employeeSkillsCache) {
          employeeSkillsCache = employeeSkillsCache.map((r) => r.userId === userId ? record! : r);
        }
        sub.next(new HttpResponse({ status: 200, body: { message: 'Skill removed from active profile.', skillId: skill.skillId } }));
        sub.complete();
      }
    });
  }).pipe(delay(getSimulatedDelay()));
}

// ── Test Attempts Handlers ──────────────────────────────────────────────────

function handleGetTestAttempts(userId: string): Observable<HttpResponse<unknown>> {
  const role = getCurrentUserRole();
  const currentUserId = getCurrentUserId();
  if (role !== 'Admin' && currentUserId !== userId) {
    return makeError(403, 'You do not have permission to perform this action.');
  }
  return new Observable<HttpResponse<unknown>>((sub) => {
    loadTestAttempts().then((attempts) => {
      const userAttempts = attempts.filter((a) => a.userId === userId);
      sub.next(new HttpResponse({ status: 200, body: userAttempts }));
      sub.complete();
    });
  }).pipe(delay(getSimulatedDelay()));
}

function handleGetSkillAttempts(userId: string, skillId: string): Observable<HttpResponse<unknown>> {
  const role = getCurrentUserRole();
  const currentUserId = getCurrentUserId();
  if (role !== 'Admin' && currentUserId !== userId) {
    return makeError(403, 'You do not have permission to perform this action.');
  }
  return new Observable<HttpResponse<unknown>>((sub) => {
    loadTestAttempts().then((attempts) => {
      const filtered = attempts.filter((a) => a.userId === userId && a.skillId === skillId);
      sub.next(new HttpResponse({ status: 200, body: filtered }));
      sub.complete();
    });
  }).pipe(delay(getSimulatedDelay()));
}

function getCurrentUserId(): string | null {
  try {
    const raw = localStorage.getItem('session');
    if (!raw) return null;
    const session = JSON.parse(raw) as { id?: string };
    return session.id ?? null;
  } catch {
    return null;
  }
}

function getCurrentUserName(): string {
  try {
    const raw = localStorage.getItem('session');
    if (!raw) return 'Unknown';
    const session = JSON.parse(raw) as { name?: string };
    return session.name ?? 'Unknown';
  } catch {
    return 'Unknown';
  }
}

function getCurrentUserDepartment(): string | null {
  try {
    const raw = localStorage.getItem('session');
    if (!raw) return null;
    const session = JSON.parse(raw) as { department?: string };
    return session.department ?? null;
  } catch {
    return null;
  }
}

function computeFinalRatingValue(
  selfRating: number | null,
  managerRating: number | null,
  peerRating: number | null,
  systemRating: number | null
): { finalRating: number; sourceCount: number; level: string; confidence: string; effectiveWeights: Record<string, number> } {
  const baseWeights: Record<string, number> = { selfRating: 0.20, managerRating: 0.30, peerRating: 0.15, systemRating: 0.35 };
  const sources: Record<string, number | null> = { selfRating, managerRating, peerRating, systemRating };
  const presentKeys = Object.keys(sources).filter((k) => sources[k] !== null);
  if (presentKeys.length === 0) {
    return { finalRating: 0, sourceCount: 0, level: 'Beginner', confidence: 'Low', effectiveWeights: { selfRating: 0, managerRating: 0, peerRating: 0, systemRating: 0 } };
  }
  const sumBase = presentKeys.reduce((a, k) => a + baseWeights[k], 0);
  const effectiveWeights: Record<string, number> = {};
  for (const key of Object.keys(sources)) {
    effectiveWeights[key] = presentKeys.includes(key) ? parseFloat((baseWeights[key] / sumBase).toFixed(6)) : 0;
  }
  const finalRating = parseFloat(presentKeys.reduce((a, k) => a + (sources[k] as number) * effectiveWeights[k], 0).toFixed(4));
  const pct = (finalRating / 4.0) * 100;
  const level = pct <= 40 ? 'Beginner' : pct <= 65 ? 'Intermediate' : pct <= 85 ? 'Advanced' : 'Expert';
  const confidence = presentKeys.length >= 3 ? 'High' : presentKeys.length === 2 ? 'Medium' : 'Low';
  return { finalRating, sourceCount: presentKeys.length, level, confidence, effectiveWeights };
}

// ── Skill Exams Handlers ─────────────────────────────────────────────────────

function handleGetAllExams(): Observable<HttpResponse<unknown>> {
  return new Observable<HttpResponse<unknown>>((sub) => {
    loadSkillExams().then((exams) => {
      sub.next(new HttpResponse({ status: 200, body: exams }));
      sub.complete();
    });
  }).pipe(delay(getSimulatedDelay()));
}

function handleGetExamBySkillId(skillId: string): Observable<HttpResponse<unknown>> {
  return new Observable<HttpResponse<unknown>>((sub) => {
    loadSkillExams().then((exams) => {
      const exam = exams.find((e) => e.skillId === skillId);
      if (!exam) {
        sub.error(new HttpErrorResponse({ status: 404, error: { message: 'No exam found for this skill.' } }));
        return;
      }
      sub.next(new HttpResponse({ status: 200, body: exam }));
      sub.complete();
    });
  }).pipe(delay(getSimulatedDelay()));
}

// ── POST /api/skill-test-attempts ────────────────────────────────────────────

function handlePostSkillTestAttempt(req: HttpRequest<unknown>): Observable<HttpResponse<unknown>> {
  return new Observable<HttpResponse<unknown>>((sub) => {
    loadTestAttempts().then((attempts) => {
      const body = req.body as AssessmentAttempt;
      if (!body?.attemptId || !body.userId || !body.skillId) {
        sub.error(new HttpErrorResponse({ status: 400, error: { message: 'Invalid attempt data.' } }));
        return;
      }
      testAttemptsCache = [...attempts, body];
      sub.next(new HttpResponse({ status: 201, body }));
      sub.complete();
    });
  }).pipe(delay(getSimulatedDelay()));
}

// ── PUT /api/employee-skills/:userId — update systemRating for a skill ───────

function handleUpdateEmployeeSkillSystemRating(
  req: HttpRequest<unknown>,
  userId: string
): Observable<HttpResponse<unknown>> {
  return new Observable<HttpResponse<unknown>>((sub) => {
    loadEmployeeSkills().then((records) => {
      const body = req.body as { skillId?: string; systemRating?: number; level?: string };
      if (!body?.skillId) {
        sub.error(new HttpErrorResponse({ status: 400, error: { message: 'skillId is required.' } }));
        return;
      }
      const record = records.find((r) => r.userId === userId);
      if (!record) {
        sub.next(new HttpResponse({ status: 200, body: null }));
        sub.complete();
        return;
      }
      const idx = record.skills.findIndex((s) => s.skillId === body.skillId && !s.isDeleted);
      if (idx === -1) {
        sub.next(new HttpResponse({ status: 200, body: null }));
        sub.complete();
        return;
      }
      const updated: EmployeeSkill = {
        ...record.skills[idx],
        systemRating: body.systemRating ?? record.skills[idx].systemRating,
        level: (body.level as EmployeeSkill['level']) ?? record.skills[idx].level,
        lastUpdated: new Date().toISOString(),
      };
      record.skills = record.skills.map((s, i) => (i === idx ? updated : s));
      if (employeeSkillsCache) {
        employeeSkillsCache = employeeSkillsCache.map((r) =>
          r.userId === userId ? record! : r
        );
      }
      sub.next(new HttpResponse({ status: 200, body: updated }));
      sub.complete();
    });
  }).pipe(delay(getSimulatedDelay()));
}

// ── Certifications Handler ────────────────────────────────────────────────────

function handleGetCertifications(
  userId: string | null,
  skillId: string | null
): Observable<HttpResponse<unknown>> {
  return new Observable<HttpResponse<unknown>>((sub) => {
    loadCertifications().then((certs) => {
      let filtered = certs;
      if (userId) filtered = filtered.filter((c) => c.userId === userId);
      if (skillId) filtered = filtered.filter((c) => c.skillId === skillId);
      sub.next(new HttpResponse({ status: 200, body: filtered }));
      sub.complete();
    });
  }).pipe(delay(getSimulatedDelay()));
}

function handleGetCertificationById(certId: string): Observable<HttpResponse<unknown>> {
  return new Observable((sub) => {
    loadCertifications().then((certs) => {
      const cert = certs.find((c) => c.certId === certId);
      if (!cert) {
        sub.next(new HttpResponse({ status: 404, body: { error: 'Certification not found.' } }));
      } else {
        sub.next(new HttpResponse({ status: 200, body: cert }));
      }
      sub.complete();
    });
  }).pipe(delay(getSimulatedDelay()));
}

function handlePostCertification(
  body: Record<string, unknown>
): Observable<HttpResponse<unknown>> {
  return new Observable((sub) => {
    loadCertifications().then((certs) => {
      const raw = localStorage.getItem('session');
      const userId: string = raw ? (JSON.parse(raw) as { id?: string }).id ?? 'unknown' : 'unknown';
      const newCert = {
        certId: `cert-${Date.now()}`,
        userId,
        skillId: String(body['skillId'] ?? ''),
        certName: String(body['certName'] ?? ''),
        issuingOrg: String(body['issuingOrg'] ?? ''),
        issueDate: String(body['issueDate'] ?? ''),
        expiryDate: String(body['expiryDate'] ?? ''),
        filePath: String(body['filePath'] ?? ''),
      };
      certs.push(newCert);
      sub.next(new HttpResponse({ status: 201, body: newCert }));
      sub.complete();
    });
  }).pipe(delay(getSimulatedDelay()));
}

function handleDeleteCertification(certId: string): Observable<HttpResponse<unknown>> {
  return new Observable((sub) => {
    loadCertifications().then((certs) => {
      const idx = certs.findIndex((c) => c.certId === certId);
      if (idx === -1) {
        sub.next(new HttpResponse({ status: 404, body: { error: 'Certification not found.' } }));
      } else {
        certs.splice(idx, 1);
        sub.next(new HttpResponse({ status: 204, body: null }));
      }
      sub.complete();
    });
  }).pipe(delay(getSimulatedDelay()));
}

// ── Project Assignments Handler ───────────────────────────────────────────────

function handleGetProjectAssignments(userId: string | null): Observable<HttpResponse<unknown>> {
  return new Observable<HttpResponse<unknown>>((sub) => {
    loadProjectAssignments().then((assignments) => {
      const filtered = userId
        ? assignments.filter((a) => a.userId === userId)
        : assignments;
      sub.next(new HttpResponse({ status: 200, body: filtered }));
      sub.complete();
    });
  }).pipe(delay(getSimulatedDelay()));
}

// ── Projects Handler ──────────────────────────────────────────────────────────

function handleGetProjects(): Observable<HttpResponse<unknown>> {
  return new Observable<HttpResponse<unknown>>((sub) => {
    loadProjects().then((projects) => {
      sub.next(new HttpResponse({ status: 200, body: projects }));
      sub.complete();
    });
  }).pipe(delay(getSimulatedDelay()));
}

// ── Feature 006: Team Management Handler Functions ──────────────────────────

function handleGetTeamEmployees(): Observable<HttpResponse<unknown>> {
  const role = getCurrentUserRole();
  const currentDept = getCurrentUserDepartment();
  if (role !== 'Manager' && role !== 'Admin') {
    return makeError(403, 'You do not have permission to perform this action.');
  }
  return new Observable<HttpResponse<unknown>>((sub) => {
    Promise.all([loadUsers(), loadEmployeeSkills(), Promise.resolve(submissionsStore)]).then(([users, skillRecords, submissions]) => {
      let targetUsers = users.filter((u) => u.role === 'Employee' || u.role === 'Manager');
      if (role === 'Manager' && currentDept) {
        targetUsers = targetUsers.filter((u) => u.department === currentDept && u.id !== getCurrentUserId());
      }
      const data = targetUsers.map((u) => {
        const record = skillRecords.find((r) => r.userId === u.id);
        const skills = record?.skills.filter((s) => !s.isDeleted) ?? [];
        const ratedSkills = skills.filter((s) => s.finalRating !== null);
        const avgRating = ratedSkills.length > 0
          ? parseFloat((ratedSkills.reduce((a, s) => a + (s.finalRating ?? 0), 0) / ratedSkills.length).toFixed(2))
          : 0;
        const pendingSubmissions = submissions.filter((s) => s.userId === u.id && s.status === 'Pending').length;
        return {
          userId: u.id,
          name: u.name,
          email: u.email,
          department: u.department,
          avatarUrl: u.avatarUrl,
          skillsCount: skills.length,
          avgRating,
          profileCompletion: skills.length > 0 ? Math.round((ratedSkills.length / skills.length) * 100) : 0,
          pendingSubmissions,
        };
      });
      sub.next(new HttpResponse({ status: 200, body: { data } }));
      sub.complete();
    });
  }).pipe(delay(getSimulatedDelay()));
}

function handleGetTeamEmployeeDetail(userId: string): Observable<HttpResponse<unknown>> {
  const role = getCurrentUserRole();
  const currentDept = getCurrentUserDepartment();
  if (role !== 'Manager' && role !== 'Admin') {
    return makeError(403, 'You do not have permission to perform this action.');
  }
  return new Observable<HttpResponse<unknown>>((sub) => {
    Promise.all([loadUsers(), loadEmployeeSkills(), loadSkillDefinitions(), loadCategories()]).then(([users, skillRecords, skillDefs, categories]) => {
      const user = users.find((u) => u.id === userId);
      if (!user) {
        sub.error(new HttpErrorResponse({ status: 404, error: { error: 'Employee not found' } }));
        return;
      }
      if (role === 'Manager' && user.department !== currentDept) {
        sub.error(new HttpErrorResponse({ status: 403, error: { error: 'You do not have permission to perform this action.' } }));
        return;
      }
      const record = skillRecords.find((r) => r.userId === userId);
      const skills = record?.skills.filter((s) => !s.isDeleted) ?? [];
      const skillViews = skills.map((s) => {
        const def = skillDefs.find((d) => d.skillId === s.skillId);
        const cat = categories.find((c) => c.categoryId === def?.categoryId);
        const { finalRating, sourceCount, confidence, level } = computeFinalRatingValue(s.selfRating, s.managerRating, s.peerRating, s.systemRating);
        return {
          skillId: s.skillId,
          skillName: def?.skillName ?? s.skillId,
          categoryName: cat?.categoryName ?? 'Unknown',
          selfRating: s.selfRating,
          managerRating: s.managerRating,
          peerRating: s.peerRating,
          systemRating: s.systemRating,
          finalRating: s.finalRating ?? finalRating,
          level: s.level ?? level,
          status: s.status,
          lastUpdated: s.lastUpdated,
          sourceCount,
          confidence,
        };
      });
      sub.next(new HttpResponse({
        status: 200,
        body: {
          data: {
            userId: user.id,
            name: user.name,
            email: user.email,
            department: user.department,
            avatarUrl: user.avatarUrl,
            skills: skillViews,
          },
        },
      }));
      sub.complete();
    });
  }).pipe(delay(getSimulatedDelay()));
}

function handleGetValidationQueue(): Observable<HttpResponse<unknown>> {
  const role = getCurrentUserRole();
  const currentDept = getCurrentUserDepartment();
  if (role !== 'Manager' && role !== 'Admin') {
    return makeError(403, 'You do not have permission to perform this action.');
  }
  return new Observable<HttpResponse<unknown>>((sub) => {
    Promise.all([loadUsers(), loadSkillDefinitions(), loadCertifications()]).then(([users, skillDefs, certs]) => {
      let pending = submissionsStore.filter((s) => s.status === 'Pending');
      if (role === 'Manager' && currentDept) {
        pending = pending.filter((s) => {
          const user = users.find((u) => u.id === s.userId);
          return user?.department === currentDept;
        });
      }
      const data = pending
        .sort((a, b) => b.submittedDate.localeCompare(a.submittedDate))
        .map((s) => {
          const user = users.find((u) => u.id === s.userId);
          const def = skillDefs.find((d) => d.skillId === s.skillId);
          const pv = peerValidationsStore.find((p) => p.submissionId === s.submissionId);
          return {
            submissionId: s.submissionId,
            userId: s.userId,
            employeeName: user?.name ?? 'Unknown',
            department: user?.department ?? 'Unknown',
            skillId: s.skillId,
            skillName: def?.skillName ?? s.skillId,
            selfRating: s.selfRating,
            status: s.status,
            submittedDate: s.submittedDate,
            certificationId: s.certificationId,
            hasCertification: !!s.certificationId && certs.some((c) => c.certId === s.certificationId),
            hasProjectExperience: s.projectExperience.length > 0,
            peerValidationStatus: pv?.status ?? null,
            peerRating: s.peerRating,
          };
        });
      sub.next(new HttpResponse({ status: 200, body: { data } }));
      sub.complete();
    });
  }).pipe(delay(getSimulatedDelay()));
}

function handleGetSubmissionDetail(submissionId: string): Observable<HttpResponse<unknown>> {
  const role = getCurrentUserRole();
  const currentDept = getCurrentUserDepartment();
  if (role !== 'Manager' && role !== 'Admin') {
    return makeError(403, 'You do not have permission to perform this action.');
  }
  const submission = submissionsStore.find((s) => s.submissionId === submissionId);
  if (!submission) return makeError(404, 'Submission not found');
  return new Observable<HttpResponse<unknown>>((sub) => {
    Promise.all([loadUsers(), loadSkillDefinitions(), loadCertifications(), loadProjects()]).then(([users, skillDefs, certs, projects]) => {
      const user = users.find((u) => u.id === submission.userId);
      if (!user) { sub.error(new HttpErrorResponse({ status: 404, error: { error: 'Employee not found' } })); return; }
      if (role === 'Manager' && user.department !== currentDept) {
        sub.error(new HttpErrorResponse({ status: 403, error: { error: 'You do not have permission to perform this action.' } }));
        return;
      }
      const def = skillDefs.find((d) => d.skillId === submission.skillId);
      const cert = submission.certificationId ? certs.find((c) => c.certId === submission.certificationId) : null;
      const pv = peerValidationsStore.find((p) => p.submissionId === submissionId);
      const peerResponses = pv?.responses.map((r) => {
        const peer = users.find((u) => u.id === r.peerId);
        return { peerId: r.peerId, peerName: peer?.name ?? 'Unknown', rating: r.rating, comment: r.comment, responseDate: r.responseDate };
      }) ?? [];
      const avgPeer = peerResponses.length > 0
        ? parseFloat((peerResponses.reduce((a, r) => a + r.rating, 0) / peerResponses.length).toFixed(1))
        : null;
      const projectExperience = submission.projectExperience.map((pid) => {
        const p = projects.find((pr) => pr['projectId'] === pid);
        return { projectId: pid, projectName: (p?.['projectName'] as string) ?? pid, role: 'Contributor', status: (p?.['status'] as string) ?? 'Unknown' };
      });
      sub.next(new HttpResponse({
        status: 200,
        body: {
          data: {
            submissionId: submission.submissionId,
            userId: submission.userId,
            employeeName: user.name,
            department: user.department,
            avatarUrl: user.avatarUrl,
            skillId: submission.skillId,
            skillName: def?.skillName ?? submission.skillId,
            selfRating: submission.selfRating,
            managerRating: submission.managerRating,
            peerRating: submission.peerRating,
            systemRating: submission.systemRating,
            finalRating: submission.finalRating,
            level: submission.level,
            confidence: submission.finalRating != null ? (() => {
              const cnt = [submission.selfRating, submission.managerRating, submission.peerRating, submission.systemRating].filter((v) => v != null).length;
              return cnt >= 3 ? 'High' : cnt === 2 ? 'Medium' : 'Low';
            })() : null,
            status: submission.status,
            submittedDate: submission.submittedDate,
            certification: cert ? { certId: cert.certId, certName: cert.certName, issuingOrg: cert.issuingOrg, issueDate: cert.issueDate, expiryDate: cert.expiryDate, status: 'Valid' } : null,
            projectExperience,
            peerValidation: pv ? { status: pv.status, responses: peerResponses, averageRating: avgPeer } : null,
          },
        },
      }));
      sub.complete();
    });
  }).pipe(delay(getSimulatedDelay()));
}

function handleApproveSubmission(req: HttpRequest<unknown>, submissionId: string): Observable<HttpResponse<unknown>> {
  const role = getCurrentUserRole();
  const currentDept = getCurrentUserDepartment();
  if (role !== 'Manager' && role !== 'Admin') {
    return makeError(403, 'You do not have permission to perform this action.');
  }
  const submission = submissionsStore.find((s) => s.submissionId === submissionId);
  if (!submission) return makeError(404, 'Submission not found');
  if (submission.status !== 'Pending') return makeError(409, 'This submission has already been processed');
  const body = req.body as { managerRating?: number; comment?: string | null };
  if (!body?.managerRating || body.managerRating < 1 || body.managerRating > 4) {
    return makeError(400, 'Manager rating must be between 1 and 4');
  }
  return new Observable<HttpResponse<unknown>>((sub) => {
    loadUsers().then((users) => {
      const employee = users.find((u) => u.id === submission.userId);
      if (role === 'Manager' && employee?.department !== currentDept) {
        sub.error(new HttpErrorResponse({ status: 403, error: { error: 'You do not have permission to perform this action.' } }));
        return;
      }
      submission.managerRating = body.managerRating!;
      submission.status = 'Approved';
      submission.lastUpdated = new Date().toISOString().split('T')[0];
      const calc = computeFinalRatingValue(submission.selfRating, submission.managerRating, submission.peerRating, submission.systemRating);
      submission.finalRating = calc.finalRating;
      submission.level = calc.level;
      const currentUserName = getCurrentUserName();
      const skillDefs = skillDefinitionsCache ?? [];
      const skillName = skillDefs.find((d) => d.skillId === submission.skillId)?.skillName ?? submission.skillId;
      console.info(`[006 Notification] "${employee?.name ?? 'Employee'}": Your ${skillName} has been approved by ${currentUserName}.`);
      sub.next(new HttpResponse({
        status: 200,
        body: {
          data: {
            submissionId,
            status: 'Approved',
            managerRating: submission.managerRating,
            finalRating: calc.finalRating,
            level: calc.level,
            confidence: calc.confidence,
            sourceCount: calc.sourceCount,
            effectiveWeights: calc.effectiveWeights,
          },
        },
      }));
      sub.complete();
    });
  }).pipe(delay(getSimulatedDelay()));
}

function handleRejectSubmission(req: HttpRequest<unknown>, submissionId: string): Observable<HttpResponse<unknown>> {
  const role = getCurrentUserRole();
  const currentDept = getCurrentUserDepartment();
  if (role !== 'Manager' && role !== 'Admin') {
    return makeError(403, 'You do not have permission to perform this action.');
  }
  const submission = submissionsStore.find((s) => s.submissionId === submissionId);
  if (!submission) return makeError(404, 'Submission not found');
  if (submission.status !== 'Pending') return makeError(409, 'This submission has already been processed');
  const body = req.body as { rejectionReason?: string };
  if (!body?.rejectionReason?.trim()) {
    return makeError(400, 'Rejection reason is required.');
  }
  return new Observable<HttpResponse<unknown>>((sub) => {
    loadUsers().then((users) => {
      const employee = users.find((u) => u.id === submission.userId);
      if (role === 'Manager' && employee?.department !== currentDept) {
        sub.error(new HttpErrorResponse({ status: 403, error: { error: 'You do not have permission to perform this action.' } }));
        return;
      }
      submission.status = 'Rejected';
      submission.rejectionReason = body.rejectionReason!;
      submission.lastUpdated = new Date().toISOString().split('T')[0];
      const skillDefs = skillDefinitionsCache ?? [];
      const skillName = skillDefs.find((d) => d.skillId === submission.skillId)?.skillName ?? submission.skillId;
      console.info(`[006 Notification] "${employee?.name ?? 'Employee'}": Your ${skillName} was rejected. Reason: ${body.rejectionReason}.`);
      sub.next(new HttpResponse({
        status: 200,
        body: { data: { submissionId, status: 'Rejected', rejectionReason: body.rejectionReason } },
      }));
      sub.complete();
    });
  }).pipe(delay(getSimulatedDelay()));
}

function handleAdminOverride(req: HttpRequest<unknown>, submissionId: string): Observable<HttpResponse<unknown>> {
  const role = getCurrentUserRole();
  const currentUserId = getCurrentUserId();
  if (role !== 'Admin') {
    return makeError(403, 'You do not have permission to perform this action.');
  }
  const submission = submissionsStore.find((s) => s.submissionId === submissionId);
  if (!submission) return makeError(404, 'Submission not found');
  const body = req.body as { overriddenRating?: number; justification?: string };
  if (!body?.overriddenRating || body.overriddenRating < 1 || body.overriddenRating > 4) {
    return makeError(400, 'Override rating must be between 1 and 4');
  }
  if (!body?.justification?.trim()) {
    return makeError(400, 'Override justification is required.');
  }
  return new Observable<HttpResponse<unknown>>((sub) => {
    const previousFinalRating = submission.finalRating;
    const overrideDate = new Date().toISOString();
    const pct = (body.overriddenRating! / 4.0) * 100;
    const level = pct <= 40 ? 'Beginner' : pct <= 65 ? 'Intermediate' : pct <= 85 ? 'Advanced' : 'Expert';
    submission.finalRating = body.overriddenRating!;
    submission.level = level;
    submission.lastUpdated = overrideDate.split('T')[0];
    adminOverridesStore.push({
      submissionId,
      adminId: currentUserId ?? 'unknown',
      overriddenRating: body.overriddenRating!,
      justification: body.justification!,
      overrideDate,
      previousFinalRating,
    });
    sub.next(new HttpResponse({
      status: 200,
      body: { data: { submissionId, overriddenRating: body.overriddenRating, previousFinalRating, justification: body.justification, level, overrideDate } },
    }));
    sub.complete();
  }).pipe(delay(getSimulatedDelay()));
}

function handleGetEligiblePeers(skillId: string): Observable<HttpResponse<unknown>> {
  const currentUserId = getCurrentUserId();
  const currentDept = getCurrentUserDepartment();
  return new Observable<HttpResponse<unknown>>((sub) => {
    Promise.all([loadUsers(), loadEmployeeSkills()]).then(([users, skillRecords]) => {
      const peers = users
        .filter((u) => u.id !== currentUserId && u.department === currentDept)
        .filter((u) => {
          const record = skillRecords.find((r) => r.userId === u.id);
          return record?.skills.some((s) => s.skillId === skillId && !s.isDeleted);
        })
        .map((u) => {
          const record = skillRecords.find((r) => r.userId === u.id);
          const skill = record?.skills.find((s) => s.skillId === skillId);
          return { userId: u.id, name: u.name, department: u.department, avatarUrl: u.avatarUrl, skillLevel: skill?.level ?? 'Unknown' };
        });
      sub.next(new HttpResponse({ status: 200, body: { data: peers } }));
      sub.complete();
    });
  }).pipe(delay(getSimulatedDelay()));
}

function handleCreatePeerValidationRequest(req: HttpRequest<unknown>): Observable<HttpResponse<unknown>> {
  const currentUserId = getCurrentUserId();
  const currentDept = getCurrentUserDepartment();
  if (!currentUserId) return makeError(401, 'Authentication required');
  const body = req.body as { skillId?: string; selectedPeerIds?: string[] };
  if (!body?.selectedPeerIds || body.selectedPeerIds.length < 2) return makeError(400, 'Select at least 2 peers.');
  if (body.selectedPeerIds.length > 3) return makeError(400, 'Maximum 3 peers allowed.');
  if (!body.skillId) return makeError(400, 'skillId is required');
  return new Observable<HttpResponse<unknown>>((sub) => {
    Promise.all([loadUsers(), loadEmployeeSkills()]).then(([users, skillRecords]) => {
      for (const peerId of body.selectedPeerIds!) {
        const peer = users.find((u) => u.id === peerId);
        if (!peer || peer.department !== currentDept) {
          sub.error(new HttpErrorResponse({ status: 400, error: { error: 'Selected peers must be in your team.' } }));
          return;
        }
        const peerRecord = skillRecords.find((r) => r.userId === peerId);
        if (!peerRecord?.skills.some((s) => s.skillId === body.skillId && !s.isDeleted)) {
          sub.error(new HttpErrorResponse({ status: 400, error: { error: 'Selected peer does not have this skill in their profile.' } }));
          return;
        }
      }
      const requesterRecord = skillRecords.find((r) => r.userId === currentUserId);
      const requesterSkill = requesterRecord?.skills.find((s) => s.skillId === body.skillId && !s.isDeleted);
      if (!requesterSkill) {
        sub.error(new HttpErrorResponse({ status: 404, error: { error: 'Skill not found in your profile' } }));
        return;
      }
      const newRequest: SeedPeerValidation = {
        id: `pv-${Date.now()}`,
        submissionId: `sub-${Date.now()}`,
        requesterId: currentUserId,
        skillId: body.skillId!,
        selectedPeerIds: body.selectedPeerIds!,
        status: 'awaiting_responses',
        createdDate: new Date().toISOString().split('T')[0],
        responses: [],
      };
      peerValidationsStore.push(newRequest);
      const requesterUser = users.find((u) => u.id === currentUserId);
      const skillDefs = skillDefinitionsCache ?? [];
      const skillName = skillDefs.find((d) => d.skillId === body.skillId)?.skillName ?? body.skillId;
      for (const peerId of body.selectedPeerIds!) {
        const peer = users.find((u) => u.id === peerId);
        console.info(`[006 Notification] "${peer?.name}": ${requesterUser?.name ?? 'Someone'} requested you to validate their ${skillName} skill.`);
      }
      sub.next(new HttpResponse({ status: 201, body: { data: newRequest } }));
      sub.complete();
    });
  }).pipe(delay(getSimulatedDelay()));
}

function handlePeerRespond(req: HttpRequest<unknown>, requestId: string): Observable<HttpResponse<unknown>> {
  const currentUserId = getCurrentUserId();
  if (!currentUserId) return makeError(401, 'Authentication required');
  const pvRequest = peerValidationsStore.find((p) => p.id === requestId);
  if (!pvRequest) return makeError(404, 'Peer validation request not found');
  if (pvRequest.status === 'completed' || pvRequest.status === 'expired') {
    return makeError(409, 'This validation request is no longer active.');
  }
  if (!pvRequest.selectedPeerIds.includes(currentUserId)) {
    return makeError(403, 'You are not authorized to respond to this request.');
  }
  if (pvRequest.responses.some((r) => r.peerId === currentUserId)) {
    return makeError(409, 'You have already submitted your validation.');
  }
  const body = req.body as { rating?: number; comment?: string | null };
  if (!body?.rating || body.rating < 1 || body.rating > 4) {
    return makeError(400, 'Proficiency rating is required.');
  }
  return new Observable<HttpResponse<unknown>>((sub) => {
    loadUsers().then((users) => {
      const peerRecord = { peerId: currentUserId, rating: body.rating as (1 | 2 | 3 | 4), comment: body.comment ?? null, responseDate: new Date().toISOString().split('T')[0] };
      pvRequest.responses.push(peerRecord);
      if (pvRequest.responses.length >= 2) pvRequest.status = 'completed';
      const peerRating = parseFloat((pvRequest.responses.reduce((a, r) => a + r.rating, 0) / pvRequest.responses.length).toFixed(1));
      const submission = submissionsStore.find((s) => s.submissionId === pvRequest.submissionId);
      if (submission && pvRequest.status === 'completed') submission.peerRating = peerRating;
      const requester = users.find((u) => u.id === pvRequest.requesterId);
      const currentUser = users.find((u) => u.id === currentUserId);
      const skillDefs = skillDefinitionsCache ?? [];
      const skillName = skillDefs.find((d) => d.skillId === pvRequest.skillId)?.skillName ?? pvRequest.skillId;
      console.info(`[006 Notification] "${requester?.name}": ${currentUser?.name ?? 'A peer'} has validated your ${skillName} skill.`);
      sub.next(new HttpResponse({
        status: 200,
        body: {
          data: {
            requestId,
            status: pvRequest.status,
            responseCount: pvRequest.responses.length,
            peerRating,
            newResponse: peerRecord,
          },
        },
      }));
      sub.complete();
    });
  }).pipe(delay(getSimulatedDelay()));
}
