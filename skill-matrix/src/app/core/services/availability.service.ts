import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AvailabilityStatus } from '../../shared/models/availability.model';

@Injectable({ providedIn: 'root' })
export class AvailabilityService {
  private readonly http = inject(HttpClient);

  override(
    userId: string,
    newStatus: AvailabilityStatus,
    reason: string
  ): Observable<{ userId: string; status: string }> {
    return this.http.patch<{ userId: string; status: string }>(
      `/api/users/${userId}/availability`,
      { status: newStatus, reason }
    );
  }
}
