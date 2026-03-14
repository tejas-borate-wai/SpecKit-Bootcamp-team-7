import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { Store } from '@ngrx/store';
import { Observable, map } from 'rxjs';
import { selectUserRole } from '../../../core/store/session/session.selectors';
import { UserRole } from '../../models/user.model';
import { modalSlideAnimation } from '../../../core/animations/modal.animations';

interface BottomNavTab {
  label: string;
  icon: string;
  route: string;
}

const ROLE_TABS: Record<UserRole, BottomNavTab[]> = {
  Employee: [
    { label: 'Dashboard', icon: 'dashboard', route: '/dashboard' },
    { label: 'My Skills', icon: 'star', route: '/my-skills' },
    { label: 'Assessments', icon: 'assignment', route: '/assessments' },
    { label: 'Alerts', icon: 'notifications', route: '/notifications' },
  ],
  Manager: [
    { label: 'Dashboard', icon: 'dashboard', route: '/dashboard' },
    { label: 'Team', icon: 'groups', route: '/team' },
    { label: 'Projects', icon: 'folder_special', route: '/projects' },
    { label: 'Alerts', icon: 'notifications', route: '/notifications' },
  ],
  Admin: [
    { label: 'Dashboard', icon: 'dashboard', route: '/dashboard' },
    { label: 'Framework', icon: 'account_tree', route: '/admin/skill-framework/categories' },
    { label: 'Reports', icon: 'assessment', route: '/reports' },
    { label: 'Alerts', icon: 'notifications', route: '/notifications' },
  ],
};

@Component({
  selector: 'app-bottom-nav',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, MatIconModule],
  animations: [modalSlideAnimation],
  templateUrl: './bottom-nav.component.html',
  styleUrl: './bottom-nav.component.scss',
})
export class BottomNavComponent {
  private store = inject(Store);

  tabs$: Observable<BottomNavTab[]> = this.store.select(selectUserRole).pipe(
    map(role => role ? ROLE_TABS[role] : ROLE_TABS['Employee'])
  );

  moreOpen = false;

  toggleMore(): void {
    this.moreOpen = !this.moreOpen;
  }

  closeMore(): void {
    this.moreOpen = false;
  }
}
