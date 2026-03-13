import { Injectable, inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable, map } from 'rxjs';
import { NavItem } from '../../shared/models/navigation.model';
import { UserRole } from '../../shared/models/user.model';
import { selectUserRole } from '../store/session/session.selectors';

const NAVIGATION_CONFIG: NavItem[] = [
  // MAIN section — all roles
  { label: 'Dashboard', icon: 'dashboard', route: '/dashboard', roles: ['Employee', 'Manager', 'Admin'] },
  { label: 'My Skills', icon: 'psychology', route: '/my-skills', roles: ['Employee', 'Manager', 'Admin'] },
  { label: 'Assessments', icon: 'quiz', route: '/assessments', roles: ['Employee', 'Manager', 'Admin'] },
  { label: 'Certifications', icon: 'verified', route: '/certifications', roles: ['Employee', 'Manager', 'Admin'] },
  { label: 'Notifications', icon: 'notifications', route: '/notifications', roles: ['Employee', 'Manager', 'Admin'] },

  // TEAM section — Manager + Admin
  { label: 'Team Skills', icon: 'groups', route: '/team', roles: ['Manager', 'Admin'], section: 'TEAM' },
  { label: 'Skill Validation Queue', icon: 'fact_check', route: '/team/validation-queue', roles: ['Manager', 'Admin'], section: 'TEAM' },
  { label: 'Project Matching', icon: 'match', route: '/team/availability', roles: ['Manager', 'Admin'], section: 'TEAM' },

  // PROJECTS section — Manager + Admin
  { label: 'Projects', icon: 'folder_special', route: '/projects', roles: ['Manager', 'Admin'], section: 'PROJECTS' },
  { label: 'Team Builder', icon: 'engineering', route: '/projects/create', roles: ['Manager', 'Admin'], section: 'PROJECTS' },

  // INSIGHTS section — Admin only
  { label: 'Reports', icon: 'assessment', route: '/reports', roles: ['Manager', 'Admin'], section: 'INSIGHTS' },
  { label: 'Org Skill Heatmap', icon: 'heat_pump', route: '/reports/heatmap', roles: ['Admin'], section: 'INSIGHTS' },

  // SETTINGS section — Admin only
  {
    label: 'Skill Framework', icon: 'account_tree', route: '/admin/framework', roles: ['Admin'], section: 'SETTINGS',
    children: [
      { label: 'Categories', icon: 'category', route: '/admin/framework', roles: ['Admin'] },
      { label: 'Subcategories', icon: 'subdirectory_arrow_right', route: '/admin/framework', roles: ['Admin'] },
      { label: 'Skill Definitions', icon: 'description', route: '/admin/framework', roles: ['Admin'] },
    ],
  },
  { label: 'Rating Configuration', icon: 'tune', route: '/admin/rating-config', roles: ['Admin'], section: 'SETTINGS' },
];

@Injectable({ providedIn: 'root' })
export class NavigationService {
  private store = inject(Store);

  getNavItems$(): Observable<NavItem[]> {
    return this.store.select(selectUserRole).pipe(
      map((role) => {
        if (!role) return [];
        return NAVIGATION_CONFIG.filter((item) => item.roles.includes(role));
      })
    );
  }

  getSections$(items: NavItem[]): string[] {
    const sections = new Set<string>();
    items.forEach((item) => {
      if (item.section) sections.add(item.section);
    });
    return Array.from(sections);
  }
}
