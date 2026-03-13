import { Routes } from '@angular/router';

export const mySkillsRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./my-skills-list/my-skills-list.component').then(
        m => m.MySkillsListComponent
      ),
  },
  {
    path: 'add',
    loadComponent: () =>
      import('./add-skill/add-skill.component').then(
        m => m.AddSkillComponent
      ),
  },
  {
    path: ':skillId',
    loadComponent: () =>
      import('./skill-detail/skill-detail.component').then(
        m => m.SkillDetailComponent
      ),
  },
  {
    path: ':skillId/edit',
    loadComponent: () =>
      import('./edit-skill/edit-skill.component').then(
        m => m.EditSkillComponent
      ),
  },
];
