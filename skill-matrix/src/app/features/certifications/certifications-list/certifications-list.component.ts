import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { BreakpointObserver, BreakpointState } from '@angular/cdk/layout';

import { CertificationWithStatus } from '../../../shared/models/certification.model';
import { SkillDefinition } from '../../../shared/models/skill-definition.model';
import {
  selectCertificationsWithStatus,
  selectCertificationsLoading,
} from '../../../core/store/certifications/certifications.selectors';
import { loadCertifications, deleteCertification } from '../../../core/store/certifications/certifications.actions';
import { selectSkillDefinitions } from '../../../core/store/skills/skills.selectors';
import * as SkillsActions from '../../../core/store/skills/skills.actions';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { BREAKPOINTS } from '../../../core/breakpoints';

@Component({
  selector: 'app-certifications-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    StatusBadgeComponent,
  ],
  templateUrl: './certifications-list.component.html',
  styleUrls: ['./certifications-list.component.scss'],
})
export class CertificationsListComponent implements OnInit {
  private readonly store = inject(Store);
  private readonly router = inject(Router);
  private readonly bp = inject(BreakpointObserver);

  certifications$: Observable<CertificationWithStatus[]> = this.store.select(
    selectCertificationsWithStatus
  );
  loading$: Observable<boolean> = this.store.select(selectCertificationsLoading);
  definitions$: Observable<SkillDefinition[]> = this.store.select(selectSkillDefinitions);

  isMobile = false;

  get displayedColumns(): string[] {
    if (this.isMobile) return ['certName', 'status', 'actions'];
    return ['certName', 'skill', 'issuingOrg', 'issueDate', 'expiryDate', 'status', 'actions'];
  }

  ngOnInit(): void {
    this.store.dispatch(loadCertifications());
    this.store.dispatch(SkillsActions.loadSkillLibrary());
    this.bp
      .observe([BREAKPOINTS.mobile])
      .subscribe((result: BreakpointState) => (this.isMobile = result.matches));
  }

  getSkillName(
    skillId: string,
    definitions: SkillDefinition[] | null
  ): string {
    return definitions?.find((d) => d.skillId === skillId)?.skillName ?? skillId;
  }

  onUpload(): void {
    this.router.navigate(['/certifications', 'upload']);
  }

  onDelete(certId: string): void {
    if (confirm('Remove this certification?')) {
      this.store.dispatch(deleteCertification({ certId }));
    }
  }
}
