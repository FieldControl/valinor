import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { CardService } from '../../services/cardService';

@Component({
    selector: 'nav-barra',
    imports: [CommonModule],
    templateUrl: './navBar.component.html',
    styleUrl: './navBar.component.css'
})
export class NavBarraComponent {
    constructor(private cardService: CardService) { }

    adicionaNovoCard(titulo: string, descricao: string) {
            this.cardService.adicionarCard(titulo, descricao) //chamo o "carteiro"

    }

}


