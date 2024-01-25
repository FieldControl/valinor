import { CommonModule } from '@angular/common';
import { Component, HostListener, ViewChild } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
})
export class HeaderComponent {
  @ViewChild('navMenu') navMenu: any;
  @HostListener('window:resize', ['$event'])
  innerWidth: any;
  teste: boolean = false;

  ngOnInit() {
    this.innerWidth = window.innerWidth;
  }

  /* FUNÇÂO ATUALIZA/VERIFICAR TAMANHO DA TELA PARA O HEADER*/
  onResize(event: any) {
    this.innerWidth = window.innerWidth;
  }

  openDialog() {
    if (!this.teste) {
      this.teste = true;
      this.navMenu.nativeElement.classList.remove('disable');
    } else {
      this.teste = false;
      this.navMenu.nativeElement.classList.add('disable');
    }
  }
}
