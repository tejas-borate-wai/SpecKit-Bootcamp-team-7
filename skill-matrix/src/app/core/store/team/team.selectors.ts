import { createFeatureSelector, createSelector } from '@ngrx/store';
import { TeamState } from './team.state';

export const selectTeamState = createFeatureSelector<TeamState>('team');

export const selectTeamMembers = createSelector(selectTeamState, (s) => s.employees);
export const selectTeamLoading = createSelector(selectTeamState, (s) => s.loading);
export const selectTeamError = createSelector(selectTeamState, (s) => s.error);

export const selectSelectedEmployee = createSelector(selectTeamState, (s) => s.selectedEmployee);

export const selectValidationQueue = createSelector(selectTeamState, (s) => s.validationQueue);
export const selectValidationQueueCount = createSelector(selectValidationQueue, (queue) => queue.length);

export const selectSelectedSubmission = createSelector(selectTeamState, (s) => s.selectedSubmission);

export const selectEligiblePeers = createSelector(selectTeamState, (s) => s.eligiblePeers);
export const selectPeerValidations = createSelector(selectTeamState, (s) => s.peerValidations);

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

/** Projects peerValidations with 7-day expiry detection:
 *  status=awaiting_responses + created >7 days ago + <2 responses → projected 'expired'
 */
export const selectPeerValidationWithExpiry = createSelector(selectPeerValidations, (requests) => {
  const now = Date.now();
  return requests.map((r) => {
    const isExpired =
      r.status === 'awaiting_responses' &&
      now - new Date(r.createdDate).getTime() > SEVEN_DAYS_MS &&
      r.responses.length < 2;
    return isExpired ? { ...r, status: 'expired' as const } : r;
  });
});
