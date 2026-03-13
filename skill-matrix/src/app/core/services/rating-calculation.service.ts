import { Injectable } from '@angular/core';
import { RatingInput, RatingResult, ConfidenceLevel } from '../../shared/models/rating-calculation.model';
import { ProficiencyLevel } from '../../shared/models/skill-submission.model';

const BASE_WEIGHTS: Record<string, number> = {
  selfRating: 0.20,
  managerRating: 0.30,
  peerRating: 0.15,
  systemRating: 0.35,
};

function deriveProficiencyLevel(finalRating: number): ProficiencyLevel {
  const pct = (finalRating / 4.0) * 100;
  if (pct <= 40) return 'Beginner';
  if (pct <= 65) return 'Intermediate';
  if (pct <= 85) return 'Advanced';
  return 'Expert';
}

function deriveConfidence(sourceCount: number): ConfidenceLevel {
  if (sourceCount >= 3) return 'High';
  if (sourceCount === 2) return 'Medium';
  return 'Low';
}

@Injectable({ providedIn: 'root' })
export class RatingCalculationService {
  calculateFinalRating(input: RatingInput): RatingResult {
    const sources: Record<string, number | null> = {
      selfRating: input.selfRating,
      managerRating: input.managerRating,
      peerRating: input.peerRating,
      systemRating: input.systemRating,
    };

    const presentKeys = Object.keys(sources).filter((k) => sources[k] !== null);

    if (presentKeys.length === 0) {
      return {
        finalRating: 0,
        sourceCount: 0,
        confidence: 'Low',
        effectiveWeights: { selfRating: 0, managerRating: 0, peerRating: 0, systemRating: 0 },
        level: 'Beginner',
      };
    }

    const sumBaseWeights = presentKeys.reduce((acc, k) => acc + BASE_WEIGHTS[k], 0);

    const effectiveWeights: Record<string, number> = {};
    for (const key of Object.keys(sources)) {
      effectiveWeights[key] = presentKeys.includes(key)
        ? parseFloat((BASE_WEIGHTS[key] / sumBaseWeights).toFixed(6))
        : 0;
    }

    const finalRating = presentKeys.reduce((acc, k) => {
      return acc + (sources[k] as number) * effectiveWeights[k];
    }, 0);

    const rounded = parseFloat(finalRating.toFixed(4));
    const sourceCount = presentKeys.length;

    return {
      finalRating: rounded,
      sourceCount,
      confidence: deriveConfidence(sourceCount),
      effectiveWeights,
      level: deriveProficiencyLevel(rounded),
    };
  }
}
