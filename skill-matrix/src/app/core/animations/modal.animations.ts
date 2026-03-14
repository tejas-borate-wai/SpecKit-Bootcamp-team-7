import { trigger, transition, style, animate } from '@angular/animations';
import { ANIMATIONS } from '../constants/animation-config';

const config = ANIMATIONS['modalSlide'];

export const modalSlideAnimation = trigger('modalSlide', [
  transition(':enter', [
    style({ transform: 'translateY(100%)', opacity: 0 }),
    animate(`${config.duration}ms ${config.easing}`, style({ transform: 'translateY(0)', opacity: 1 }))
  ]),
  transition(':leave', [
    animate(`${config.duration}ms ${config.easing}`, style({ transform: 'translateY(100%)', opacity: 0 }))
  ])
]);
