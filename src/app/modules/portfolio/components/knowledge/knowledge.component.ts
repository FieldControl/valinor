import { Component, signal } from '@angular/core';
import { IKnowledge } from '../../interface/IKnowledge.interface';

@Component({
  selector: 'app-knowledge',
  standalone: true,
  imports: [],
  templateUrl: './knowledge.component.html',
  styleUrl: './knowledge.component.scss'
})
export class KnowledgeComponent {
  public arrayKnowledge = signal<IKnowledge[]>([
    {
      src: 'assets/icons/knowledge/html5.svg',
      alt: 'HTML5'
    },
    {
      src: 'assets/icons/knowledge/css3.svg',
      alt: 'CSS3'
    },
    {
      src: 'assets/icons/knowledge/angular.svg',
      alt: 'Angular.Js'
    },
    {
      src: 'assets/icons/knowledge/react.svg',
      alt: 'React.js'
    },
    {
      src: 'assets/icons/knowledge/javascript.svg',
      alt: 'JavaScript'
    },
    {
      src: 'assets/icons/knowledge/nodejs.svg',
      alt: 'Node.Js'
    },
  ])
}
