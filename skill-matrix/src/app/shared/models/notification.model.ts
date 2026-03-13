// ── Notification Types ────────────────────────────────────────────────────────

export type NotificationType =
  | 'skill_approved'
  | 'skill_rejected'
  | 'assessment_result'
  | 'cert_expiry_warning'
  | 'cert_expired'
  | 'skill_stale'
  | 'peer_validation_request'
  | 'peer_validation_complete'
  | 'skill_gap_suggestion'
  | 'skill_pending_approval';

// ── Notification Entity ───────────────────────────────────────────────────────

export interface Notification {
  notificationId: string;        // Unique identifier (uuid format)
  userId: string;                // Recipient user ID
  type: NotificationType;        // Event type category
  message: string;               // Pre-formatted human-readable message
  isRead: boolean;               // Read/unread status
  date: string;                  // ISO 8601 datetime
  linkTo: string | null;         // Optional deep-link route
}

// ── Type Config ───────────────────────────────────────────────────────────────

export interface NotificationTypeConfig {
  type: NotificationType;
  icon: string;                  // Angular Material icon name
  iconColor: string;             // CSS custom property or hex colour
  label: string;                 // Human-readable label for accessibility
}

// ── Type Config Map ───────────────────────────────────────────────────────────

export const NOTIFICATION_TYPE_CONFIGS: Record<NotificationType, NotificationTypeConfig> = {
  skill_approved: {
    type: 'skill_approved',
    icon: 'check_circle',
    iconColor: '#16a34a',
    label: 'Skill Approved',
  },
  skill_rejected: {
    type: 'skill_rejected',
    icon: 'cancel',
    iconColor: '#ef4444',
    label: 'Skill Rejected',
  },
  assessment_result: {
    type: 'assessment_result',
    icon: 'quiz',
    iconColor: '#2563eb',
    label: 'Assessment Result',
  },
  cert_expiry_warning: {
    type: 'cert_expiry_warning',
    icon: 'warning',
    iconColor: '#f59e0b',
    label: 'Certification Expiry Warning',
  },
  cert_expired: {
    type: 'cert_expired',
    icon: 'error',
    iconColor: '#ef4444',
    label: 'Certification Expired',
  },
  skill_stale: {
    type: 'skill_stale',
    icon: 'schedule',
    iconColor: '#6b7280',
    label: 'Skill Not Updated',
  },
  peer_validation_request: {
    type: 'peer_validation_request',
    icon: 'group',
    iconColor: '#7c3aed',
    label: 'Peer Validation Request',
  },
  peer_validation_complete: {
    type: 'peer_validation_complete',
    icon: 'how_to_reg',
    iconColor: '#0891b2',
    label: 'Peer Validation Complete',
  },
  skill_gap_suggestion: {
    type: 'skill_gap_suggestion',
    icon: 'trending_up',
    iconColor: '#0284c7',
    label: 'Skill Gap Suggestion',
  },
  skill_pending_approval: {
    type: 'skill_pending_approval',
    icon: 'pending_actions',
    iconColor: '#d97706',
    label: 'Skill Pending Approval',
  },
};
