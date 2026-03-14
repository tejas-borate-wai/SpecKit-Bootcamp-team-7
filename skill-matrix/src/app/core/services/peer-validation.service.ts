import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { PeerValidationRequest, EligiblePeer } from '../../shared/models/peer-validation.model';

@Injectable({ providedIn: 'root' })
export class PeerValidationService {
  private readonly base = '/api/peer-validation';

  constructor(private http: HttpClient) {}

  getEligiblePeers(skillId: string): Observable<EligiblePeer[]> {
    return this.http
      .get<{ data: EligiblePeer[] }>(`${this.base}/eligible-peers/${skillId}`)
      .pipe(map((r) => r.data));
  }

  createPeerValidationRequest(skillId: string, selectedPeerIds: string[]): Observable<PeerValidationRequest> {
    return this.http
      .post<{ data: PeerValidationRequest }>(`${this.base}/request`, { skillId, selectedPeerIds })
      .pipe(map((r) => r.data));
  }

  respondToPeerValidation(requestId: string, rating: number, comment: string | null): Observable<{
    requestId: string;
    status: string;
    responseCount: number;
    peerRating: number;
  }> {
    return this.http
      .post<{ data: { requestId: string; status: string; responseCount: number; peerRating: number } }>(
        `${this.base}/${requestId}/respond`,
        { rating, comment }
      )
      .pipe(map((r) => r.data));
  }
}
