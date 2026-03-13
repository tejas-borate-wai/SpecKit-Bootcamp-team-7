import { trigger, state, transition, style, animate } from '@angular/animations';
import { ANIMATIONS } from '../constants/animation-config';

const config = ANIMATIONS['progressBarFill'];

export const progressFillAnimation = trigger('progressFill', [
  state('void', style({ width: '0%' })),
  state('*', style({ width: '{{ targetWidth }}%' }), { params: { targetWidth: 0 } }),
  transition('void => *', [
    animate(`${config.duration}ms ${config.easing}`)
  ]),
]);
