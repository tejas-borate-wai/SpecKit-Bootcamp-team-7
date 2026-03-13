import { trigger, state, transition, style, animate } from '@angular/animations';
import { ANIMATIONS } from '../constants/animation-config';

const config = ANIMATIONS['sidebarCollapse'];

export const sidebarCollapseAnimation = trigger('sidebarCollapse', [
  state('expanded', style({ width: '240px' })),
  state('collapsed', style({ width: '64px' })),
  transition('expanded <=> collapsed', [
    animate(`${config.duration}ms ${config.easing}`)
  ]),
]);
