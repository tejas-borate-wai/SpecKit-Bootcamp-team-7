export interface AnimationConfig {
  readonly name: string;
  readonly duration: number;
  readonly easing: string;
  readonly delay: number;
}

export const ANIMATIONS: Record<string, AnimationConfig> = {
  routeTransition: { name: 'routeTransition', duration: 300, easing: 'ease-in-out', delay: 0 },
  progressBarFill: { name: 'progressBarFill', duration: 600, easing: 'ease-out', delay: 0 },
  testCompletionReveal: { name: 'testCompletionReveal', duration: 500, easing: 'ease-out', delay: 0 },
  toastSlide: { name: 'toastSlide', duration: 250, easing: 'ease-in-out', delay: 0 },
  sidebarCollapse: { name: 'sidebarCollapse', duration: 200, easing: 'ease-in-out', delay: 0 },
  modalSlide: { name: 'modalSlide', duration: 300, easing: 'ease-out', delay: 0 },
  statCardCounter: { name: 'statCardCounter', duration: 800, easing: 'ease-out', delay: 0 },
} as const;
