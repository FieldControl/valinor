import { Component, signal } from '@angular/core';
import { IChallenges } from '../../interface/IChallenges.interface';

@Component({
  selector: 'app-challenges',
  standalone: true,
  imports: [],
  templateUrl: './challenges.component.html',
  styleUrl: './challenges.component.scss'
})
export class ChallengesComponent {
  public arrayChallenges = signal<IChallenges[]>([
    {
      summary: {
        strong: "O desafio em relação ao Angular.js"
      },
      text: "<p>Esse projeto me ofereceu um desafio que me motivou desde o início, a utilização do Angular.js, um framework que até então eu não havia utilizado. As principais diferenças que notei foram em relação a sintaxe, pois estava acostumado com o React.js e o React Native, porém confesso que gostei mais de utilizá-lo por ser um framework mais completo em geral.</p>",
    },
    {
      summary: {
        strong: "O desafio quanto ao SCSS"
      },
      text: "<p>Outro desafio que impus a mim mesmo foi a utilização do SCSS e da arquitetura SMACSS, até então não haviam sido utilizados por mim, mas também me surpreendi ao descobrir que eram tecnologias mais sofisticadas que as que eu utilizava.</p>",
    },
    {
      summary: {
        strong: "Conclusão"
      },
      text: "<p>No geral, os principais problemas que encontrei foram relacionados a diferenças sintáticas, mas que foram rapidamente superados através de algumas pesquisas.</p>",
    }
  ])
}
