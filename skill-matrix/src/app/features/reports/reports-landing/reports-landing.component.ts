import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { SessionUser } from '../../../shared/models/user.model';
import { selectCurrentUser } from '../../../core/store/session/session.selectors';

interface ReportCard {
  title: string;
  description: string;
  icon: string;
  route: string;
  adminOnly: boolean;
}

@Component({
  selector: 'app-reports-landing',
  standalone: true,
  imports: [CommonModule, RouterLink, MatButtonModule, MatIconModule],
  templateUrl: './reports-landing.component.html',
  styleUrls: ['./reports-landing.component.scss'],
})
export class ReportsLandingComponent implements OnInit {
  private readonly store = inject(Store);

  currentUser$: Observable<SessionUser | null> = this.store.select(selectCurrentUser);

  readonly reportCards: ReportCard[] = [
    {
      title: 'Skill Gap Analysis',
      description: 'Compare project-required skills against team proficiency averages and identify critical gaps.',
      icon: 'troubleshoot',
      route: 'skill-gap',
      adminOnly: false,
    },
    {
      title: 'Team Capability',
      description: 'Understand average skill proficiency and coverage across departments and categories.',
      icon: 'groups',
      route: 'team',
      adminOnly: false,
    },
    {
      title: 'Org Skill Heatmap',
      description: 'Visualise the distribution of skill proficiency levels across the entire organisation.',
      icon: 'grid_view',
      route: 'heatmap',
      adminOnly: true,
    },
    {
      title: 'Skill Trend Analysis',
      description: 'Track how team skill scores change over time, grouped by calendar quarter.',
      icon: 'trending_up',
      route: 'trends',
      adminOnly: false,
    },
  ];

  ngOnInit(): void {}

  getVisibleCards(user: SessionUser | null): ReportCard[] {
    if (!user) return [];
    return this.reportCards.filter((c) => !c.adminOnly || user.role === 'Admin');
  }
}
