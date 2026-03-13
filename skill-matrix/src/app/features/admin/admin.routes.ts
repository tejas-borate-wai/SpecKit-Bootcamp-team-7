import { Routes } from '@angular/router';

export const adminRoutes: Routes = [
  {
    path: '',
    redirectTo: 'skill-framework/categories',
    pathMatch: 'full',
  },
  {
    path: 'skill-framework',
    children: [
      {
        path: '',
        redirectTo: 'categories',
        pathMatch: 'full',
      },
      {
        path: 'categories',
        loadComponent: () =>
          import('./categories/categories.component').then(
            (m) => m.CategoriesComponent
          ),
      },
      {
        path: 'subcategories',
        loadComponent: () =>
          import('./subcategories/subcategories.component').then(
            (m) => m.SubcategoriesComponent
          ),
      },
      {
        path: 'skills',
        loadComponent: () =>
          import('./skill-definitions/skill-definitions.component').then(
            (m) => m.SkillDefinitionsComponent
          ),
      },
    ],
  },
  {
    path: 'proficiency-framework',
    loadComponent: () =>
      import('./proficiency-framework/proficiency-framework.component').then(
        (m) => m.ProficiencyFrameworkComponent
      ),
  },
  {
    path: 'rating-config',
    loadComponent: () =>
      import('./rating-config/rating-config.component').then(
        (m) => m.RatingConfigComponent
      ),
  },
];
