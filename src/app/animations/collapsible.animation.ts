import { trigger, style, transition, animate, state } from '@angular/animations';

export const COLLAPSIBLE_ANIMATION = trigger('openClose', [
    state('open', style({
        height: '*',
    })),
    state('closed', style({
        height: '0px',
    })),
    transition('open => closed', [
        animate('.3s')
    ]),
    transition('closed => open', [
        animate('.3s')
    ]),
]);
