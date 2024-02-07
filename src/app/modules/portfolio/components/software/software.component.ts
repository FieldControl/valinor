import { Component, signal } from '@angular/core';
import { ISoftware } from '../../interface/ISoftware.interface';

@Component({
  selector: 'app-software',
  standalone: true,
  imports: [],
  templateUrl: './software.component.html',
  styleUrl: './software.component.scss'
})
export class SoftwareComponent {
  public arraySoftware = signal<ISoftware[]>([
    {
      summary: {
        strong: "Por que foi criado?"
      },
      text: "<p>O primeiro princípio é atender ao motivo pelo qual foi criado, por isso a prioridade no desenvolvimento desse projeto foi atender aos requisitos solicitados pelo desafio.</p>",
    },
    {
      summary: {
        strong: "Como manter a qualidade?"
      },
      text: "<p>O segundo princípio é manter simples para manutenção e melhorias, o terceiro é se comprometer com a visão do projeto, evitando uma mistura de estilos e o quarto é manter o código limpo, ciente de que você e/ou outra pessoa o lerá e eventualmente o atualizar.</p>",
    },
    {
      summary: {
        strong: "Mantendo a vida útil do Software"
      },
      text: "<p>Sobre isso, o quinto princípio diz que um software deve estar sempre aberto a novas tecnologias que visam aumentar a vida útil do mesmo, o sexto busca o planejamento que visa a reutilização de código. E por último, mas não menos importante, pensar antes de executar (algo que aconteceu bastante nesse projeto).</p>",
    },
    {
      summary: {
        strong: "Conclusão"
      },
      text: "<p>Acredito que o desenvolvimento desse projeto buscou manter esses 7 princípios o tempo todo, tornando possível a melhoria constante e acima de tudo, a mente aberta para novas tecnologias até então desconhecidas por mim.</p>",
    }
  ])
}
