import { Component, signal } from '@angular/core';
import { ITools } from '../../interface/ITools.interface';

@Component({
  selector: 'app-tools',
  standalone: true,
  imports: [],
  templateUrl: './tools.component.html',
  styleUrl: './tools.component.scss'
})
export class ToolsComponent {
  public arrayTools = signal<ITools[]>([
    {
      summary: {
        strong: "Por que Angular.js?"
      },
      text: "<p>O framework Angular.js foi escolhido por solicitação do teste e pela sua estabilidade como ferramenta, pois é uma tecnologia já consolidada e com alguns anos de desenvolvimento em andamento.</p>",
    },
    {
      summary: {
        strong: "Por que TypeScript?"
      },
      text: "<p>O TypeScript entretanto foi escolhido por ser uma linguagem tipada, ou seja, que exige que as variáveis tenham seus tipos declarados, detectando erros de tipo ainda no período de desenvolvimento.</p>",
    },
    {
      summary: {
        strong: "Por que SCSS?"
      },
      text: "<p>A escolha do SCSS foi uma novidade para mim, pois estava acostumado a utilizar CSS e nunca havia testado outras linguagens de estilização, ao utilizar me surpreendi quando encontrei uma linguagem de fácil compreensão e até mesmo mais organizada que o CSS.</p>",
    }
  ])
}
