import { trigger, transition, style, animate, query, group } from '@angular/animations';
import { ANIMATIONS } from '../constants/animation-config';

const config = ANIMATIONS['routeTransition'];

export const routeAnimations = trigger('routeAnimations', [
  transition('* <=> *', [
    query(':enter, :leave', [
      style({ position: 'absolute', width: '100%' })
    ], { optional: true }),
    group([
      query(':leave', [
        animate(`${config.duration}ms ${config.easing}`, style({ opacity: 0, transform: 'translateY(-8px)' }))
      ], { optional: true }),
      query(':enter', [
        style({ opacity: 0, transform: 'translateY(8px)' }),
        animate(`${config.duration}ms ${config.easing}`, style({ opacity: 1, transform: 'translateY(0)' }))
      ], { optional: true }),
    ])
  ])
]);
