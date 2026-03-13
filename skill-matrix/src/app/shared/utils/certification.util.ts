// src/app/shared/utils/certification.util.ts

import { Certification, CertificationStatus, CertificationWithStatus } from '../models/certification.model';

const EXPIRING_SOON_DAYS = 30;
const RATING_BONUS_PERCENT = 10;
const CERTIFICATION_BONUS_WEIGHT = 0.20;

/**
 * Compute a certification's status relative to a reference date.
 * All comparisons are date-only (time component stripped).
 */
export function computeCertificationStatus(
  expiryDate: string,
  referenceDate: Date = new Date()
): CertificationStatus {
  const ref = toDateOnly(referenceDate);
  const expiry = toDateOnly(new Date(expiryDate));

  if (expiry < ref) return 'Expired';

  const msPerDay = 24 * 60 * 60 * 1000;
  const daysUntilExpiry = Math.floor((expiry.getTime() - ref.getTime()) / msPerDay);
  return daysUntilExpiry <= EXPIRING_SOON_DAYS ? 'Expiring Soon' : 'Valid';
}

/** Normalize a Date to midnight (strips time component). */
function toDateOnly(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

/** Returns true if the certification status is 'Valid'. */
export function hasValidCertification(
  cert: Certification,
  referenceDate: Date = new Date()
): boolean {
  return computeCertificationStatus(cert.expiryDate, referenceDate) === 'Valid';
}

/** Returns the active (Valid) certification for a given skillId, or null. */
export function getActiveCertForSkill(
  certs: Certification[],
  skillId: string,
  referenceDate: Date = new Date()
): Certification | null {
  return (
    certs.find(
      (c) =>
        c.skillId === skillId &&
        computeCertificationStatus(c.expiryDate, referenceDate) === 'Valid'
    ) ?? null
  );
}

/**
 * Apply +10% rating bonus for a valid certification, capped at 100.
 * If no valid cert, returns the original score unchanged.
 */
export function applyRatingBonus(
  score: number,
  hasValidCert: boolean
): number {
  if (!hasValidCert) return score;
  return Math.min(100, score + RATING_BONUS_PERCENT);
}

/**
 * Returns the certification bonus weight for the System Rating formula:
 * 100 if a valid cert exists (contributes 0.20 × 100 = 20 pts), 0 otherwise.
 */
export function getCertificationBonusWeight(hasValidCert: boolean): number {
  return hasValidCert ? 100 : 0;
}

/** Map certifications to CertificationWithStatus view models. */
export function mapCertificationsWithStatus(
  certs: Certification[],
  referenceDate: Date = new Date()
): CertificationWithStatus[] {
  return certs.map((c) => ({
    ...c,
    status: computeCertificationStatus(c.expiryDate, referenceDate),
  }));
}
