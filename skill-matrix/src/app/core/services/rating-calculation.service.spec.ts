import { TestBed } from '@angular/core/testing';
import { RatingCalculationService } from './rating-calculation.service';

describe('RatingCalculationService', () => {
  let service: RatingCalculationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RatingCalculationService);
  });

  it('should compute correct final rating with all 4 sources', () => {
    const result = service.calculateFinalRating({
      selfRating: 3,
      managerRating: 4,
      peerRating: 3,
      systemRating: 3.5,
    });
    // 3×0.20 + 4×0.30 + 3×0.15 + 3.5×0.35 = 0.6 + 1.2 + 0.45 + 1.225 = 3.475
    expect(result.finalRating).toBeCloseTo(3.475, 3);
    expect(result.sourceCount).toBe(4);
    expect(result.confidence).toBe('High');
    expect(result.level).toBe('Advanced');
  });

  it('should redistribute weights when peer is null', () => {
    const result = service.calculateFinalRating({
      selfRating: 3,
      managerRating: 4,
      peerRating: null,
      systemRating: 3.5,
    });
    // base sum without peer = 0.20+0.30+0.35 = 0.85
    // self=0.2/0.85≈0.2353, manager=0.30/0.85≈0.3529, system=0.35/0.85≈0.4118
    expect(result.sourceCount).toBe(3);
    expect(result.confidence).toBe('High');
    expect(result.effectiveWeights['peerRating']).toBe(0);
  });

  it('should use self+manager weights only when only those are present', () => {
    const result = service.calculateFinalRating({
      selfRating: 3,
      managerRating: 4,
      peerRating: null,
      systemRating: null,
    });
    // sum = 0.20+0.30 = 0.50; self=0.40 manager=0.60
    expect(result.sourceCount).toBe(2);
    expect(result.confidence).toBe('Medium');
    expect(result.effectiveWeights['selfRating']).toBeCloseTo(0.40, 5);
    expect(result.effectiveWeights['managerRating']).toBeCloseTo(0.60, 5);
    // 3×0.40 + 4×0.60 = 1.2+2.4 = 3.6
    expect(result.finalRating).toBeCloseTo(3.6, 3);
  });

  it('should use weight 1.0 when only selfRating is present', () => {
    const result = service.calculateFinalRating({
      selfRating: 3,
      managerRating: null,
      peerRating: null,
      systemRating: null,
    });
    expect(result.sourceCount).toBe(1);
    expect(result.confidence).toBe('Low');
    expect(result.effectiveWeights['selfRating']).toBeCloseTo(1.0, 5);
    expect(result.finalRating).toBeCloseTo(3.0, 3);
  });

  it('should return finalRating 0 when all inputs are null', () => {
    const result = service.calculateFinalRating({
      selfRating: null,
      managerRating: null,
      peerRating: null,
      systemRating: null,
    });
    expect(result.finalRating).toBe(0);
    expect(result.sourceCount).toBe(0);
    expect(result.confidence).toBe('Low');
    expect(result.level).toBe('Beginner');
  });

  it('should derive Beginner for finalRating <= 1.6 (40%)', () => {
    const result = service.calculateFinalRating({ selfRating: 1, managerRating: null, peerRating: null, systemRating: null });
    expect(result.level).toBe('Beginner');
  });

  it('should derive Intermediate for finalRating in 41-65%', () => {
    // 2/4=50% → Intermediate
    const result = service.calculateFinalRating({ selfRating: 2, managerRating: null, peerRating: null, systemRating: null });
    expect(result.level).toBe('Intermediate');
  });

  it('should derive Advanced for finalRating in 66-85%', () => {
    // 3/4=75% → Advanced
    const result = service.calculateFinalRating({ selfRating: 3, managerRating: null, peerRating: null, systemRating: null });
    expect(result.level).toBe('Advanced');
  });

  it('should derive Expert for finalRating > 85%', () => {
    // 4/4=100% → Expert
    const result = service.calculateFinalRating({ selfRating: 4, managerRating: null, peerRating: null, systemRating: null });
    expect(result.level).toBe('Expert');
  });
});
