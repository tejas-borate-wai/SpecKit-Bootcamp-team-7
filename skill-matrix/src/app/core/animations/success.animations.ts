import { trigger, transition, style, animate } from '@angular/animations';
import { ANIMATIONS } from '../constants/animation-config';

const config = ANIMATIONS['testCompletionReveal'];

export const successRevealAnimation = trigger('successReveal', [
  transition(':enter', [
    style({ transform: 'scale(0.8)', opacity: 0 }),
    animate(`${config.duration}ms ${config.easing}`, style({ transform: 'scale(1)', opacity: 1 }))
  ]),
]);
