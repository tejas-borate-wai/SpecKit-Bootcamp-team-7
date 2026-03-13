import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Certification, CreateCertificationPayload } from '../../shared/models/certification.model';

@Injectable({ providedIn: 'root' })
export class CertificationService {
  private readonly http = inject(HttpClient);

  getCertifications(userId: string): Observable<Certification[]> {
    return this.http.get<Certification[]>(`/api/certifications?userId=${userId}`);
  }

  getCertification(certId: string): Observable<Certification> {
    return this.http.get<Certification>(`/api/certifications/${certId}`);
  }

  createCertification(payload: CreateCertificationPayload): Observable<Certification> {
    return this.http.post<Certification>('/api/certifications', payload);
  }

  deleteCertification(certId: string): Observable<void> {
    return this.http.delete<void>(`/api/certifications/${certId}`);
  }
}
