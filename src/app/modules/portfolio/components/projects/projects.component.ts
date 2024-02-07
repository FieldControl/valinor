import { Component, inject, signal } from '@angular/core';
import { IProjects } from '../../interface/IProjects.interface';

// Imports para criar o modal com mais informações
import {MatDialog, MatDialogModule} from '@angular/material/dialog';
import { EDialogPanelClass } from '../../enum/EDialogPanelClass.enum';
import { DialogProjectsComponent } from '../dialog/dialog-projects/dialog-projects.component';

@Component({
  selector: 'app-projects',
  standalone: true,
  imports: [MatDialogModule],
  templateUrl: './projects.component.html',
  styleUrl: './projects.component.scss'
})
export class ProjectsComponent {
  #dialog = inject(MatDialog);
  
  public arrayProjects = signal<IProjects[]>([
    {
      src: "assets/img/projects/appBariatricaApp.png",
      alt: "App Bariátrica Nature",
      title: "App Bariátrica Nature - App",
      width: "100px",
      height: "100px",
      description: '<p>O App Bariátrica Nature foi criado para atender a necessidade de um cliente de ofertar seus ebooks e também um plano personalizado para seu público alvo. Foi desenvolvido utilizando React Native e TypeScript, possuindo também sua versão em site.</p>',
      links: [
        {
          name: 'Conheça o App',
          href: 'https://play.google.com/store/apps/details?id=com.devcecl.app'
        }
      ]
    },
    {
      src: "assets/img/projects/appBariatrica.png",
      alt: "App Bariátrica Nature",
      title: "App Bariátrica Nature - Site",
      width: "100px",
      height: "100px",
      description: '<p>O App Bariátrica Nature em usa versão de site foi criado para atender a necessidade de um cliente de ofertar seus ebooks e também um plano personalizado para seu público alvo. Possuindo uma opção de alterar o idioma do site para melhor atender ao público deste cliente. Atualmente atende aos idiomas Português e Inglês.</p>',
      links: [
        {
          name: 'Conheça o Site',
          href: 'https://app-bariatrica-nature.com'
        }
      ]
    },
  ]);

  public openDialog(data: IProjects) {
    this.#dialog.open(DialogProjectsComponent, {
      data,
      panelClass: EDialogPanelClass.PROJECTS,
    });
  }
}
