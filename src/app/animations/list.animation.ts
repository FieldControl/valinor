import { trigger, style, transition, animate, query, stagger } from '@angular/animations';

export const LIST_ANIMATION_LATERAL = trigger('listAnimation', [
    transition('void => *', [
        query(':leave', [
            stagger(25, [
                animate('0.5s ease-out', style({ opacity: '0', transform: 'translateX(-20px)' }))
            ])
        ], { optional: true }),
        query(':enter', [
            style({ opacity: '0', transform: 'translateX(-20px)' }),
            stagger(25, [
                animate('0.5s ease-out', style({ opacity: '1', transform: 'translateX(0px)' }))
            ])
        ], { optional: true }),
    ])
]);
