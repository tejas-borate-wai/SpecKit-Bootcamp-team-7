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

// ── In-memory caches with mutable copies for CRUD operations ───────────────
let usersCache: User[] | null = null;
let categoriesCache: SkillCategory[] | null = null;
let skillDefinitionsCache: SkillDefinition[] | null = null;
let proficiencyLevelsCache: ProficiencyLevel[] | null = null;
let ratingWeightsCache: RatingWeightConfig | null = null;
let employeeSkillsCache: EmployeeSkillRecord[] | null = null;
let testAttemptsCache: SkillTestAttempt[] | null = null;

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

  // ── Skill Test Attempts ───────────────────────────────────────────────
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
