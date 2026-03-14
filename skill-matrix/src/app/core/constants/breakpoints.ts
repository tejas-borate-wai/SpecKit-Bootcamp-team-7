export const APP_BREAKPOINTS = {
  xs: '(max-width: 479.98px)',
  sm: '(min-width: 480px) and (max-width: 767.98px)',
  md: '(min-width: 768px) and (max-width: 1023.98px)',
  lg: '(min-width: 1024px) and (max-width: 1279.98px)',
  xl: '(min-width: 1280px) and (max-width: 1439.98px)',
  '2xl': '(min-width: 1440px)',
} as const;

export type BreakpointName = keyof typeof APP_BREAKPOINTS;
