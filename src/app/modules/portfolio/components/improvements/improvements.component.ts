import { Component, signal } from '@angular/core';
import { IImprovements } from '../../interface/IImprovements.interface';

@Component({
  selector: 'app-improvements',
  standalone: true,
  imports: [],
  templateUrl: './improvements.component.html',
  styleUrl: './improvements.component.scss'
})
export class ImprovementsComponent {
  public arrayImprovements = signal<IImprovements[]>([
    {
      summary: {
        strong: "Fundamentos utilizados no desenvolvimento"
      },
      text: "<p>Nesse projeto priorizei a agilidade e a escalabilidade de código, além da utilização de artifícios simples de interação com o usuário, como hovers que alteram cores de elementos e etc.</p>",
    },
    {
      summary: {
        strong: "Conclusão"
      },
      text: "<p>Ao meu ver muita coisa pode ser melhorada, como vídeos que mostrem os Projetos Desenvolvidos, ou até mesmo iframes que permitam que o usuário teste os projetos sem deixar a página, a adição de mais temas e mais artifícios de interação com o usuário, como loadings em elementos e novas seções no site.</p>",
    }
  ])
}
