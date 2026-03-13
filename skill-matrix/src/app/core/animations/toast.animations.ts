import { trigger, transition, style, animate } from '@angular/animations';
import { ANIMATIONS } from '../constants/animation-config';

const config = ANIMATIONS['toastSlide'];

export const toastSlideAnimation = trigger('toastSlide', [
  transition(':enter', [
    style({ transform: 'translateX(100%)', opacity: 0 }),
    animate(`${config.duration}ms ${config.easing}`, style({ transform: 'translateX(0)', opacity: 1 }))
  ]),
  transition(':leave', [
    animate(`${config.duration}ms ${config.easing}`, style({ transform: 'translateX(100%)', opacity: 0 }))
  ])
]);
