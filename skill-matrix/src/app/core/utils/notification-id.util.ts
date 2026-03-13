/**
 * Generates a unique notification ID using the browser's crypto API.
 * Falls back to a timestamp+random string when crypto.randomUUID is unavailable.
 */
export function generateNotificationId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `notif-${crypto.randomUUID()}`;
  }
  return `notif-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}
