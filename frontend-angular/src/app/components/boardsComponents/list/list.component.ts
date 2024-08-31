import { Component, inject } from '@angular/core';
import { BoardService } from '../../../services/boards/board.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';



@Component({
  imports: [RouterModule, CommonModule,],  
  standalone: true,
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.css'],

})
export class ListComponent {
  private readonly boardService = inject(BoardService);
  boards  = [
    { id: 1, name: 'Controle Projetos' },
    { id: 2, name: 'Controle Estudos' },
    { id: 3, name: 'Controle Empresa' },
];


  // // Converte o observable retornado pelo serviço em um signal
  // boards = toSignal(this.boardService.getBoards().pipe());


  creatNewBoard(){
    console.log('Meu board Criado')
  }
}
