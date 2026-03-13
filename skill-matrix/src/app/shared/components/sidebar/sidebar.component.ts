import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatExpansionModule } from '@angular/material/expansion';
import { Observable } from 'rxjs';
import { NavItem } from '../../../shared/models/navigation.model';
import { NavigationService } from '../../../core/services/navigation.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatListModule,
    MatIconModule,
    MatTooltipModule,
    MatExpansionModule,
  ],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
})
export class SidebarComponent {
  @Input() collapsed = false;
  @Output() closeSidebar = new EventEmitter<void>();

  private navService = inject(NavigationService);
  navItems$: Observable<NavItem[]> = this.navService.getNavItems$();

  getItemsForSection(items: NavItem[], section: string | undefined): NavItem[] {
    if (!section) return items.filter((i) => !i.section);
    return items.filter((i) => i.section === section);
  }

  getSections(items: NavItem[]): (string | undefined)[] {
    const sections: (string | undefined)[] = [undefined];
    const seen = new Set<string>();
    items.forEach((item) => {
      if (item.section && !seen.has(item.section)) {
        seen.add(item.section);
        sections.push(item.section);
      }
    });
    return sections;
  }

  onItemClick(): void {
    this.closeSidebar.emit();
  }
}
