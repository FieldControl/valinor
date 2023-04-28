import {
  trigger,
  state,
  style,
  transition,
  animate,
} from '@angular/animations';

export const APPEARD = trigger('appeard', [
  state(
    'ready',
    style({
      opacity: 1,
    })
  ),
  transition('void => ready', [
    style({ opacity: 0, transform: 'translateX(-20px)' }),
    animate('500ms 0s ease-in'),
  ]),
]);
