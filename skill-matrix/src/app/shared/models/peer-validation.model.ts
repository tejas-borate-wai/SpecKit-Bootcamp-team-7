export type PeerValidationStatus = 'created' | 'notified' | 'awaiting_responses' | 'completed' | 'expired';

export interface PeerResponse {
  peerId: string;
  rating: 1 | 2 | 3 | 4;
  comment: string | null;
  responseDate: string;
}

export interface PeerValidationRequest {
  id: string;
  submissionId: string;
  requesterId: string;
  skillId: string;
  selectedPeerIds: string[];
  status: PeerValidationStatus;
  createdDate: string;
  responses: PeerResponse[];
}

export interface EligiblePeer {
  userId: string;
  name: string;
  department: string;
  avatarUrl: string;
  skillLevel: string;
}
