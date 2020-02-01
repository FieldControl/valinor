
// Se importar aqui não é necessário importar no .ts da pagina
import { trigger, state, style, transition, animate, keyframes, query, group } from '@angular/animations';


// Exemplo de uso:
// 1º property bind é para ativar/desativar a animação baseado na transição
// 2º e 3º event bind é para chamar métodos ao iniciar e/ou finalizar animação respectivamente
// <div [@slideInOutAnimation]="showLoadingScreen" (@slideInOutAnimation.start)="animationStart($event)"
// (@slideInOutAnimation.done)="animationDone($event)"> </div>

/**
 * Faz a transição das paginas
 * @usageNotes 1ª transition: 'void => *' ou ':enter' quando o componente passa a existir faz a animação
 * @usageNotes 2ª transition: '* => void' ou ':leave' quando o componente esta em qualquer estado e deixa de existir
 */
export const slideInOutAnimation = trigger('slideInOutAnimation', [

  transition(':enter', [
    style({
      transform: 'translateY(40px)',
      willChange: 'transform, opacity',
      opacity: 0
    }),
    animate('.2s cubic-bezier(0.45, 0, 0.745, 0.715)', style({
      transform: 'translateY(0) translateZ(0)',
      opacity: 1,
    })),
  ]),
  transition(':leave', [
    style({
      transform: 'translateY(0) translateZ(0)',
      willChange: 'transform, opacity',
      opacity: 1,
    }),
    animate('.2s  cubic-bezier(0.45, 0, 0.745, 0.715)', style({
      transform: 'translateY(40px)',
      opacity: 0
    }))
  ])
]);

/**
 * Não é necessário usar keyframes pois a animação está bem simples porém deixar assim para uma futura referência
 */
export const popInOutToolTip = trigger('popInOutToolTip', [
  transition(':enter', [
    animate('.2s ease-in-out',
      keyframes([
      style({opacity: 0, transform: 'scale(0)'}),
      style({opacity: 1, transform: 'scale(1)'})
    ]))
  ]),
  transition(':leave', [
    animate('.2s ease-in-out', keyframes([
      style({opacity: 1, transform: 'scale(1)'}),
      style({opacity: 0, transform: 'scale(0)'})
    ]))
  ])
]);
