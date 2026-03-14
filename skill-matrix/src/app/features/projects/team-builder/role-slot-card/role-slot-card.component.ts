import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule } from '@angular/forms';
import { CandidateMatchResult } from '../../../../shared/models/candidate-match.model';

@Component({
  selector: 'app-role-slot-card',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, MatSelectModule, FormsModule],
  templateUrl: './role-slot-card.component.html',
  styleUrls: ['./role-slot-card.component.scss'],
})
export class RoleSlotCardComponent {
  @Input() roleTitle = '';
  @Input() headcount = 1;
  @Input() filledCount = 0;
  @Input() assignedEmployees: { assignmentId: string; userId: string; name: string }[] = [];
  @Input() availableCandidates: CandidateMatchResult[] = [];

  @Output() assign = new EventEmitter<{ userId: string; role: string }>();
  @Output() remove = new EventEmitter<string>();

  showAssignSelect = false;
  selectedUserId = '';

  get isFull(): boolean {
    return this.filledCount >= this.headcount;
  }

  get availableToAssign(): CandidateMatchResult[] {
    const assignedIds = this.assignedEmployees.map((e) => e.userId);
    return this.availableCandidates.filter(
      (c) => !assignedIds.includes(c.userId) && c.availability !== 'Busy'
    );
  }

  onAssignClick(): void {
    if (!this.selectedUserId) return;
    this.assign.emit({ userId: this.selectedUserId, role: this.roleTitle });
    this.selectedUserId = '';
    this.showAssignSelect = false;
  }

  onRemove(assignmentId: string): void {
    this.remove.emit(assignmentId);
  }
}
