import { Component, signal } from '@angular/core';
import { IExperiences } from '../../interface/IExperiences.interface';

@Component({
  selector: 'app-experiences',
  standalone: true,
  imports: [],
  templateUrl: './experiences.component.html',
  styleUrl: './experiences.component.scss'
})
export class ExperiencesComponent {
  public arrayExperiences = signal<IExperiences[]>([
    {
      summary: {
        strong: "Curso Técnico em Desenvolvimento de Sistemas",
        p: "2022 - 2023 | ETEC Philadelpho Gouvêa Netto",
      },
      text: "<p>Em julho de 2022 ingressei na Etec para me tornar desenvolvedor de software, concluindo em dezembro de 2023 e me apaixonando pelo desenvolvimento de aplicativos e sites.</p>",
    },
    {
      summary: {
        strong: "Análise e Desenvolvimento de Sistemas",
        p: "2023 - Dias Atuais | FATEC Rio Preto",
      },
      text: "<p>Em julho de 2023 ingressei na Fatec em busca da graduação, na expansão de minhas habilidades e networking, sigo cursando até os dias de hoje.</p>",
    },
    {
      summary: {
        strong: "Freelance em Desenvolvimento de Software",
        p: "2023 - Dias Atuais",
      },
      text: "<p>Em abril de 2023 iniciei os trabalhos como freelancer, desenvolvendo sites e aplicativos em JavaScript e React Native que estão disponíveis até os dias atuais.</p>",
    }
  ])
}
