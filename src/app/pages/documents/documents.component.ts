import { Component } from '@angular/core';

@Component({
  selector: 'app-documents',
  templateUrl: './documents.component.html',
  styleUrls: ['./documents.component.css']
})
export class DocumentsComponent {
  cardList = [
    {
      title: 'Angular',
      link: 'https://angular.io/',
      icon:'../../assets/angular-logo.svg'
    },
    {
      title: 'NodeJS',
      link: 'https://nodejs.org/pt-br/about/',
      icon:'../../assets/node-logo.svg'
    },
    {
      title: 'SVG',
      link: 'https://www.svgrepo.com/',
      icon:'../../assets/svg-logo.svg'
    },
    {
      title: 'API',
      link: 'https://the-one-api.dev/',
      icon:'../../assets/api-logo.svg'
    },

  ]
}


